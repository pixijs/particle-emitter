import ParticleUtils, {SimpleEase, Color} from "./ParticleUtils";
import PropertyNode from "./PropertyNode";

/**
 * Singly linked list container for keeping track of interpolated properties for particles.
 * Each Particle will have one of these for each interpolated property.
 * @memberof PIXI.particles
 * @class PropertyList
 * @constructor
 * @param {boolean} isColor If this list handles color values
 */
export default class PropertyList<V>
{
	/**
	 * The current property node in the linked list.
	 * @property {PIXI.particles.PropertyNode} current
	 */
	public current: PropertyNode<V>;
	/**
	 * The next property node in the linked list. Stored separately for slightly less variable
	 * access.
	 * @property {PIXI.particles.PropertyNode} next
	 */
	public next: PropertyNode<V>;
	/**
	 * Calculates the correct value for the current interpolation value. This method is set in
	 * the reset() method.
	 * @method interpolate
	 * @param {number} lerp The interpolation value from 0-1.
	 * @return {number} Either the interpolated value. Colors are converted to the hex value.
	 */
	public interpolate: SimpleEase;
	/**
	 * A custom easing method for this list.
	 * @method ease
	 * @param {number} lerp The interpolation value from 0-1.
	 * @return {number} The eased value, also from 0-1.
	 */
	public ease: SimpleEase;
	/**
	 * If this list manages colors, which requires a different method for interpolation.
	 * @property {boolean} isColor
	 * @private
	 */
	private isColor: boolean;
	
	constructor(isColor: boolean = false)
	{
		this.current = null;
		this.next = null;
		this.isColor = !!isColor;
		this.interpolate = null;
		this.ease = null;
	}

	/**
	 * Resets the list for use.
	 * @method interpolate
	 * @param {PIXI.particles.PropertyNode} first The first node in the list.
	 * @param {boolean} [isStepped=false] If the values should be stepped instead of interpolated linearly.
	 */
	public reset(first: PropertyNode<V>)
	{
		this.current = first;
		this.next = first.next;
		randomize(this.current);
		randomize(this.next);
		const isSimple = this.next && this.next.time >= 1;
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
		this.ease = this.current.ease;
	}
}

function randomize(node: any) {
	if(node.arrayValue) {
		node.value = node.arrayValue[~~(Math.random()*node.arrayValue.length)];
	}
}

function intValueSimple(this: PropertyList<number>, lerp: number)
{
	if (this.ease)
		lerp = this.ease(lerp);
	return (this.next.value - this.current.value) * lerp + this.current.value;
}

function intColorSimple(this: PropertyList<Color>, lerp: number)
{
	if (this.ease)
		lerp = this.ease(lerp);
	let curVal = this.current.value, nextVal = this.next.value;
	let r = (nextVal.r - curVal.r) * lerp + curVal.r;
	let g = (nextVal.g - curVal.g) * lerp + curVal.g;
	let b = (nextVal.b - curVal.b) * lerp + curVal.b;
	return ParticleUtils.combineRGBComponents(r, g, b);
}

function intValueComplex(this: PropertyList<number>, lerp: number)
{
	if (this.ease)
		lerp = this.ease(lerp);
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

function intColorComplex(this: PropertyList<Color>, lerp: number)
{
	if (this.ease)
		lerp = this.ease(lerp);
	//make sure we are on the right segment
	while (lerp > this.next.time)
	{
		this.current = this.next;
		this.next = this.next.next;
	}
	//convert the lerp value to the segment range
	lerp = (lerp - this.current.time) / (this.next.time - this.current.time);
	let curVal = this.current.value, nextVal = this.next.value;
	let r = (nextVal.r - curVal.r) * lerp + curVal.r;
	let g = (nextVal.g - curVal.g) * lerp + curVal.g;
	let b = (nextVal.b - curVal.b) * lerp + curVal.b;
	return ParticleUtils.combineRGBComponents(r, g, b);
}

function intValueStepped(this: PropertyList<number>, lerp: number)
{
	if (this.ease)
		lerp = this.ease(lerp);
	//make sure we are on the right segment
	while (this.next && lerp > this.next.time)
	{
		this.current = this.next;
		this.next = this.next.next;
	}
	return this.current.value;
}

function intColorStepped(this: PropertyList<Color>, lerp: number)
{
	if (this.ease)
		lerp = this.ease(lerp);
	//make sure we are on the right segment
	while (this.next && lerp > this.next.time)
	{
		this.current = this.next;
		this.next = this.next.next;
	}
	let curVal = this.current.value;
	return ParticleUtils.combineRGBComponents(curVal.r, curVal.g, curVal.b);
}