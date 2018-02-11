"use strict";

var BLEND_MODES = PIXI.BLEND_MODES || PIXI.blendModes;
var Texture = PIXI.Texture;
var PropertyNode;

/**
 * Contains helper functions for particles and emitters to use.
 * @memberof PIXI.particles
 * @class ParticleUtils
 * @static
 */
var ParticleUtils = {};

/**
 * If errors and warnings should be logged within the library.
 * @name PIXI.particles.ParticleUtils.verbose
 * @default false
 * @static
 */
ParticleUtils.verbose = false;

var DEG_TO_RADS = ParticleUtils.DEG_TO_RADS = Math.PI / 180;

var empty = ParticleUtils.EMPTY_TEXTURE = Texture.EMPTY;
//prevent any events from being used on the empty texture, as well as destruction of it
//v4 of Pixi does this, but doing it again won't hurt
empty.on = empty.destroy = empty.once = empty.emit = function() {};

/**
 * Rotates a point by a given angle.
 * @method PIXI.particles.ParticleUtils.rotatePoint
 * @param {Number} angle The angle to rotate by in degrees
 * @param {PIXI.Point} p The point to rotate around 0,0.
 * @static
 */
ParticleUtils.rotatePoint = function(angle, p)
{
	if(!angle) return;
	angle *= DEG_TO_RADS;
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	var xnew = p.x * c - p.y * s;
	var ynew = p.x * s + p.y * c;
	p.x = xnew;
	p.y = ynew;
};

/**
 * Combines separate color components (0-255) into a single uint color.
 * @method PIXI.particles.ParticleUtils.combineRGBComponents
 * @param {uint} r The red value of the color
 * @param {uint} g The green value of the color
 * @param {uint} b The blue value of the color
 * @return {uint} The color in the form of 0xRRGGBB
 * @static
 */
ParticleUtils.combineRGBComponents = function(r, g, b/*, a*/)
{
	return /*a << 24 |*/ r << 16 | g << 8 | b;
};

/**
 * Reduces the point to a length of 1.
 * @method PIXI.particles.ParticleUtils.normalize
 * @static
 * @param {PIXI.Point} point The point to normalize
 */
ParticleUtils.normalize = function(point)
{
	var oneOverLen = 1 / ParticleUtils.length(point);
	point.x *= oneOverLen;
	point.y *= oneOverLen;
};

/**
 * Multiplies the x and y values of this point by a value.
 * @method PIXI.particles.ParticleUtils.scaleBy
 * @static
 * @param {PIXI.Point} point The point to scaleBy
 * @param value {Number} The value to scale by.
 */
ParticleUtils.scaleBy = function(point, value)
{
	point.x *= value;
	point.y *= value;
};

/**
 * Returns the length (or magnitude) of this point.
 * @method PIXI.particles.ParticleUtils.length
 * @static
 * @param {PIXI.Point} point The point to measure length
 * @return The length of this point.
 */
ParticleUtils.length = function(point)
{
	return Math.sqrt(point.x * point.x + point.y * point.y);
};

/**
 * Converts a hex string from "#AARRGGBB", "#RRGGBB", "0xAARRGGBB", "0xRRGGBB",
 * "AARRGGBB", or "RRGGBB" to an object of ints of 0-255, as
 * {r, g, b, (a)}.
 * @method PIXI.particles.ParticleUtils.hexToRGB
 * @param {String} color The input color string.
 * @param {Object} output An object to put the output in. If omitted, a new object is created.
 * @return The object with r, g, and b properties, possibly with an a property.
 * @static
 */
ParticleUtils.hexToRGB = function(color, output)
{
	if (!output)
		output = {};
	if (color.charAt(0) == "#")
		color = color.substr(1);
	else if (color.indexOf("0x") === 0)
		color = color.substr(2);
	var alpha;
	if (color.length == 8)
	{
		alpha = color.substr(0, 2);
		color = color.substr(2);
	}
	output.r = parseInt(color.substr(0, 2), 16);//Red
	output.g = parseInt(color.substr(2, 2), 16);//Green
	output.b = parseInt(color.substr(4, 2), 16);//Blue
	if (alpha)
		output.a = parseInt(alpha, 16);
	return output;
};

/**
 * Generates a custom ease function, based on the GreenSock custom ease, as demonstrated
 * by the related tool at http://www.greensock.com/customease/.
 * @method PIXI.particles.ParticleUtils.generateEase
 * @param {Array} segments An array of segments, as created by
 * http://www.greensock.com/customease/.
 * @return {Function} A function that calculates the percentage of change at
 *                    a given point in time (0-1 inclusive).
 * @static
 */
ParticleUtils.generateEase = function(segments)
{
	var qty = segments.length;
	var oneOverQty = 1 / qty;
	/*
	 * Calculates the percentage of change at a given point in time (0-1 inclusive).
	 * @param {Number} time The time of the ease, 0-1 inclusive.
	 * @return {Number} The percentage of the change, 0-1 inclusive (unless your
	 *                  ease goes outside those bounds).
	 */
	var simpleEase = function(time)
	{
		var t, s;
		var i = (qty * time) | 0;//do a quick floor operation
		t = (time - (i * oneOverQty)) * qty;
		s = segments[i] || segments[qty - 1];
		return (s.s + t * (2 * (1 - t) * (s.cp - s.s) + t * (s.e - s.s)));
	};
	return simpleEase;
};

/**
 * Gets a blend mode, ensuring that it is valid.
 * @method PIXI.particles.ParticleUtils.getBlendMode
 * @param {String} name The name of the blend mode to get.
 * @return {int} The blend mode as specified in the PIXI.blendModes enumeration.
 * @static
 */
ParticleUtils.getBlendMode = function(name)
{
	if (!name) return BLEND_MODES.NORMAL;
	name = name.toUpperCase();
	while (name.indexOf(" ") >= 0)
		name = name.replace(" ", "_");
	return BLEND_MODES[name] || BLEND_MODES.NORMAL;
};

/**
 * Converts a list of {value, time} objects starting at time 0 and ending at time 1 into an evenly
 * spaced stepped list of PropertyNodes for color values. This is primarily to handle conversion of
 * linear gradients to fewer colors, allowing for some optimization for Canvas2d fallbacks.
 * @method PIXI.particles.ParticleUtils.createSteppedGradient
 * @param {Array} list The list of data to convert.
 * @param {number} [numSteps=10] The number of steps to use.
 * @return {PIXI.particles.PropertyNode} The blend mode as specified in the PIXI.blendModes enumeration.
 * @static
 */
ParticleUtils.createSteppedGradient = function(list, numSteps) {
	if (!PropertyNode)
		PropertyNode = require('./PropertyNode');
	if (typeof numSteps !== 'number' || numSteps <= 0)
		numSteps = 10;
	var first = new PropertyNode(list[0].value, list[0].time);
	first.isStepped = true;
	var currentNode = first;
	var current = list[0];
	var nextIndex = 1;
	var next = list[nextIndex];
	for (var i = 1; i < numSteps; ++i)
	{
		var lerp = i / numSteps;
		//ensure we are on the right segment, if multiple
		while (lerp > next.time)
		{
			current = next;
			next = list[++nextIndex];
		}
		//convert the lerp value to the segment range
		lerp = (lerp - current.time) / (next.time - current.time);
		var curVal = ParticleUtils.hexToRGB(current.value);
		var nextVal = ParticleUtils.hexToRGB(next.value);
		var output = {};
		output.r = (nextVal.r - curVal.r) * lerp + curVal.r;
		output.g = (nextVal.g - curVal.g) * lerp + curVal.g;
		output.b = (nextVal.b - curVal.b) * lerp + curVal.b;
		currentNode.next = new PropertyNode(output, i / numSteps);
		currentNode = currentNode.next;
	}
	//we don't need to have a PropertyNode for time of 1, because in a stepped version at that point
	//the particle has died of old age
	return first;
};

module.exports = ParticleUtils;