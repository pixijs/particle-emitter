/**
*  @module cloudkid
*/
(function(undefined) {

	"use strict";

	window.cloudkid = window.cloudkid || {};
	
	var BLEND_MODES = PIXI.BLEND_MODES || PIXI.blendModes;

	/**
	*	Contains helper functions for particles and emitters to use.
	*	@class ParticleUtils
	*	@static
	*/
	var ParticleUtils = {};

	var DEG_TO_RADS = ParticleUtils.DEG_TO_RADS = Math.PI / 180;

	/**
	*	Rotates a point by a given angle.
	*	@method rotatePoint
	*	@param {Number} angle The angle to rotate by in degrees
	*	@param {PIXI.Point} p The point to rotate around 0,0.
	*	@static
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
	*	Combines separate color components (0-255) into a single uint color.
	*	@method combineRGBComponents
	*	@param {uint} r The red value of the color
	*	@param {uint} g The green value of the color
	*	@param {uint} b The blue value of the color
	*	@return {uint} The color in the form of 0xRRGGBB
	*	@static
	*/
	ParticleUtils.combineRGBComponents = function(r, g, b/*, a*/)
	{
		return /*a << 24 |*/ r << 16 | g << 8 | b;
	};

	/**
	 * Reduces the point to a length of 1.
	 * @method normalize
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
	 * @method scaleBy
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
	 * @method length
	 * @static
	 * @param {PIXI.Point} point The point to measure length
	 * @return The length of this point.
	 */
	ParticleUtils.length = function(point)
	{
		return Math.sqrt(point.x * point.x + point.y * point.y);
	};

	/**
	*	Converts a hex string from "#AARRGGBB", "#RRGGBB", "0xAARRGGBB", "0xRRGGBB",
	*	"AARRGGBB", or "RRGGBB" to an array of ints of 0-255 or Numbers from 0-1, as
	*	[r, g, b, (a)].
	*	@method hexToRGB
	*	@param {String} color The input color string.
	*	@param {Array} output An array to put the output in. If omitted, a new array is created.
	*	@return The array of numeric color values.
	*	@static
	*/
	ParticleUtils.hexToRGB = function(color, output)
	{
		if (output)
			output.length = 0;
		else
			output = [];
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
		output.push(parseInt(color.substr(0, 2), 16));//Red
		output.push(parseInt(color.substr(2, 2), 16));//Green
		output.push(parseInt(color.substr(4, 2), 16));//Blue
		if (alpha)
			output.push(parseInt(alpha, 16));
		return output;
	};

	/**
	*	Generates a custom ease function, based on the GreenSock custom ease, as demonstrated
	*	by the related tool at http://www.greensock.com/customease/.
	*	@method generateEase
	*	@param {Array} segments An array of segments, as created by
	*	http://www.greensock.com/customease/.
	*	@return {Function} A function that calculates the percentage of change at
	*						a given point in time (0-1 inclusive).
	*	@static
	*/
	ParticleUtils.generateEase = function(segments)
	{
		var qty = segments.length;
		var oneOverQty = 1 / qty;
		/*
		*	Calculates the percentage of change at a given point in time (0-1 inclusive).
		*	@param {Number} time The time of the ease, 0-1 inclusive.
		*	@return {Number} The percentage of the change, 0-1 inclusive (unless your
		*			ease goes outside those bounds).
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
	*	Gets a blend mode, ensuring that it is valid.
	*	@method getBlendMode
	*	@param {String} name The name of the blend mode to get.
	*	@return {int} The blend mode as specified in the PIXI.blendModes enumeration.
	*	@static
	*/
	ParticleUtils.getBlendMode = function(name)
	{
		if (!name) return BLEND_MODES.NORMAL;
		name = name.toUpperCase();
		while (name.indexOf(" ") >= 0)
			name = name.replace(" ", "_");
		return BLEND_MODES[name] || BLEND_MODES.NORMAL;
	};

	cloudkid.ParticleUtils = ParticleUtils;

	/**
	*  @module global
	*/
	/**
	*  Add methods to Array
	*  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
	*  @class Array.prototype
	*/

	/**
	*  Shuffles the array
	*  @method shuffle
	*  @return {Array} The array, for chaining calls.
	*/
	if(!Array.prototype.shuffle)
	{
		// In EcmaScript 5 specs and browsers that support it you can use the Object.defineProperty
		// to make it not enumerable set the enumerable property to false
		Object.defineProperty(Array.prototype, 'shuffle', {
			enumerable: false,
			writable:false,
			value: function() {
				for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
				return this;
			}
		});
	}

	/**
	*  Get a random item from an array
	*  @method random
	*  @return {*} The random item
	*/
	if(!Array.prototype.random)
	{
		Object.defineProperty(Array.prototype, 'random', {
			enumerable: false,
			writable: false,
			value: function() {
				return this[Math.floor(Math.random() * this.length)];
			}
		});
	}
}());