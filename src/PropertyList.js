var ParticleUtils = require("./ParticleUtils");

/**
 * Singly linked list container for keeping track of interpolated properties for particles.
 * Each Particle will have one of these for each interpolated property.
 * @memberof PIXI.particles
 * @class PropertyList
 * @constructor
 * @param {boolean} isColor If this list handles color values
 */
var PropertyList = function(isColor)
{
	/**
	 * The current property node in the linked list.
	 * @property {PIXI.particles.PropertyNode} current
	 */
	this.current = null;
	/**
	 * The next property node in the linked list. Stored separately for slightly less variable
	 * access.
	 * @property {PIXI.particles.PropertyNode} next
	 */
	this.next = null;
	/**
	 * If this list manages colors, which requires a different method for interpolation.
	 * @property {boolean} isColor
	 * @private
	 */
	this.isColor = !!isColor;
	/**
	 * Calculates the correct value for the current interpolation value. This method is set in
	 * the reset() method.
	 * @method interpolate
	 * @param {number} lerp The interpolation value from 0-1.
	 * @return {number} Either the interpolated value. Colors are converted to the hex value.
	 */
	this.interpolate = null;
}

/**
 * Resets the list for use.
 * @method interpolate
 * @param {PIXI.particles.PropertyNode} first The first node in the list.
 * @param {boolean} [isStepped=false] If the values should be stepped instead of interpolated linearly.
 */
PropertyList.prototype.reset = function(first)
{
	this.current = first;
	this.next = first.next;
	var isSimple = this.next && this.next.time >= 1;
	if (isSimple)
	{
		this.interpolate = this.isColor ? intColorSimple : intValueSimple;
	}
	else if (first.isStepped)
	{
		this.interpolate = this.isColor ? intColorStepped : intValueStepped;
	}
	else
	{
		this.interpolate = this.isColor ? intColorComplex : intValueComplex;
	}
}

function intValueSimple(lerp)
{
	return (this.next.value - this.current.value) * lerp + this.current.value;
}

function intColorSimple(lerp)
{
	var curVal = this.current.value, nextVal = this.next.value;
	var r = (nextVal.r - curVal.r) * lerp + curVal.r;
	var g = (nextVal.g - curVal.g) * lerp + curVal.g;
	var b = (nextVal.b - curVal.b) * lerp + curVal.b;
	return ParticleUtils.combineRGBComponents(r, g, b);
}

function intValueComplex(lerp)
{
	//make sure we are on the right segment
	while (lerp > this.next.time)
	{
		this.current = this.next;
		this.next = this.next.next;
	}
	//convert the lerp value to the segment range
	lerp = (lerp - this.current.time) / (this.next.time - this.current.time);
	return (this.next.value - this.current.value) * lerp + this.current.value;
}

function intColorComplex(lerp)
{
	//make sure we are on the right segment
	while (lerp > this.next.time)
	{
		this.current = this.next;
		this.next = this.next.next;
	}
	//convert the lerp value to the segment range
	lerp = (lerp - this.current.time) / (this.next.time - this.current.time);
	var curVal = this.current.value, nextVal = this.next.value;
	var r = (nextVal.r - curVal.r) * lerp + curVal.r;
	var g = (nextVal.g - curVal.g) * lerp + curVal.g;
	var b = (nextVal.b - curVal.b) * lerp + curVal.b;
	return ParticleUtils.combineRGBComponents(r, g, b);
}

function intValueStepped(lerp)
{
	//make sure we are on the right segment
	while (this.next && lerp > this.next.time)
	{
		this.current = this.next;
		this.next = this.next.next;
	}
	return this.current.value;
}

function intColorStepped(lerp)
{
	//make sure we are on the right segment
	while (this.next && lerp > this.next.time)
	{
		this.current = this.next;
		this.next = this.next.next;
	}
	var curVal = this.current.value;
	return ParticleUtils.combineRGBComponents(curVal.r, curVal.g, curVal.b);
}

module.exports = PropertyList;