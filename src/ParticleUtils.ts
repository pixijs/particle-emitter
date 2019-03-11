import {BLEND_MODES, Point} from 'pixi.js';
import {PropertyNode, ValueStep} from './PropertyNode';

export interface Color {
	r: number,
	g: number,
	b: number,
	a?: number
}

export interface EaseSegment {
	cp:number;
	s:number;
	e:number;
}

export type SimpleEase = (time:number) => number;

/**
 * Contains helper functions for particles and emitters to use.
 */
export namespace ParticleUtils {
	/**
	 * If errors and warnings should be logged within the library.
	 */
	export let verbose = false;

	export const DEG_TO_RADS = Math.PI / 180;

	/**
	 * Rotates a point by a given angle.
	 * @param angle The angle to rotate by in degrees
	 * @param p The point to rotate around 0,0.
	 */
	export function rotatePoint(angle:number, p:Point)
	{
		if (!angle) return;
		angle *= ParticleUtils.DEG_TO_RADS;
		const s = Math.sin(angle);
		const c = Math.cos(angle);
		const xnew = p.x * c - p.y * s;
		const ynew = p.x * s + p.y * c;
		p.x = xnew;
		p.y = ynew;
	}

	/**
	 * Combines separate color components (0-255) into a single uint color.
	 * @param r The red value of the color
	 * @param g The green value of the color
	 * @param b The blue value of the color
	 * @return The color in the form of 0xRRGGBB
	 */
	export function combineRGBComponents(r:number, g:number, b:number/*, a*/): number
	{
		return /*a << 24 |*/ r << 16 | g << 8 | b;
	}

	/**
	 * Reduces the point to a length of 1.
	 * @param point The point to normalize
	 */
	export function normalize(point:Point): void
	{
		let oneOverLen = 1 / ParticleUtils.length(point);
		point.x *= oneOverLen;
		point.y *= oneOverLen;
	}

	/**
	 * Multiplies the x and y values of this point by a value.
	 * @param point The point to scaleBy
	 * @param value The value to scale by.
	 */
	export function scaleBy(point:Point, value:number): void
	{
		point.x *= value;
		point.y *= value;
	}

	/**
	 * Returns the length (or magnitude) of this point.
	 * @param point The point to measure length
	 * @return The length of this point.
	 */
	export function length(point:Point): number
	{
		return Math.sqrt(point.x * point.x + point.y * point.y);
	}

	/**
	 * Converts a hex string from "#AARRGGBB", "#RRGGBB", "0xAARRGGBB", "0xRRGGBB",
	 * "AARRGGBB", or "RRGGBB" to an object of ints of 0-255, as
	 * {r, g, b, (a)}.
	 * @param color The input color string.
	 * @param output An object to put the output in. If omitted, a new object is created.
	 * @return The object with r, g, and b properties, possibly with an a property.
	 */
	export function hexToRGB(color:string, output?:Color): Color
	{
		if (!output)
			output = {} as Color;
		if (color.charAt(0) == "#")
			color = color.substr(1);
		else if (color.indexOf("0x") === 0)
			color = color.substr(2);
		let alpha;
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
	}

	/**
	 * Generates a custom ease function, based on the GreenSock custom ease, as demonstrated
	 * by the related tool at http://www.greensock.com/customease/.
	 * @param segments An array of segments, as created by
	 * http://www.greensock.com/customease/.
	 * @return A function that calculates the percentage of change at
	 *                    a given point in time (0-1 inclusive).
	 */
	export function generateEase(segments:EaseSegment[]): SimpleEase
	{
		const qty = segments.length;
		const oneOverQty = 1 / qty;
		/*
		 * Calculates the percentage of change at a given point in time (0-1 inclusive).
		 * @param {Number} time The time of the ease, 0-1 inclusive.
		 * @return {Number} The percentage of the change, 0-1 inclusive (unless your
		 *                  ease goes outside those bounds).
		 */
		return function(time:number)
		{
			let t: number, s: EaseSegment;
			let i = (qty * time) | 0;//do a quick floor operation
			t = (time - (i * oneOverQty)) * qty;
			s = segments[i] || segments[qty - 1];
			return (s.s + t * (2 * (1 - t) * (s.cp - s.s) + t * (s.e - s.s)));
		};
	}

	/**
	 * Gets a blend mode, ensuring that it is valid.
	 * @param name The name of the blend mode to get.
	 * @return The blend mode as specified in the PIXI.BLEND_MODES enumeration.
	 */
	export function getBlendMode(name:string): number
	{
		if (!name) return BLEND_MODES.NORMAL;
		name = name.toUpperCase();
		while (name.indexOf(" ") >= 0)
			name = name.replace(" ", "_");
		return (BLEND_MODES as any)[name] || BLEND_MODES.NORMAL;
	}

	/**
	 * Converts a list of {value, time} objects starting at time 0 and ending at time 1 into an evenly
	 * spaced stepped list of PropertyNodes for color values. This is primarily to handle conversion of
	 * linear gradients to fewer colors, allowing for some optimization for Canvas2d fallbacks.
	 * @param list The list of data to convert.
	 * @param [numSteps=10] The number of steps to use.
	 * @return The blend mode as specified in the PIXI.blendModes enumeration.
	 */
	export function createSteppedGradient(list:ValueStep[], numSteps:number = 10) {
		if (typeof numSteps !== 'number' || numSteps <= 0)
			numSteps = 10;
		let first = new PropertyNode<Color>(list[0].value as string, list[0].time);
		first.isStepped = true;
		let currentNode = first;
		let current = list[0];
		let nextIndex = 1;
		let next = list[nextIndex];
		for (let i = 1; i < numSteps; ++i)
		{
			let lerp = i / numSteps;
			//ensure we are on the right segment, if multiple
			while (lerp > next.time)
			{
				current = next;
				next = list[++nextIndex];
			}
			//convert the lerp value to the segment range
			lerp = (lerp - current.time) / (next.time - current.time);
			let curVal = ParticleUtils.hexToRGB(current.value as string);
			let nextVal = ParticleUtils.hexToRGB(next.value as string);
			let output:Color = {} as Color;
			output.r = (nextVal.r - curVal.r) * lerp + curVal.r;
			output.g = (nextVal.g - curVal.g) * lerp + curVal.g;
			output.b = (nextVal.b - curVal.b) * lerp + curVal.b;
			currentNode.next = new PropertyNode(output, i / numSteps);
			currentNode = currentNode.next;
		}
		//we don't need to have a PropertyNode for time of 1, because in a stepped version at that point
		//the particle has died of old age
		return first;
	}
}