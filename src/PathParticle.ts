"use strict";

import ParticleUtils from "./ParticleUtils";
import Particle from "./Particle";
import Emitter from "./Emitter";

/**
 * A helper point for math things.
 * @private
 */
const helperPoint = new PIXI.Point();

//a hand picked list of Math functions (and a couple properties) that are allowable.
//they should be used without the preceding "Math."
const MATH_FUNCS =
[
	"pow",
	"sqrt",
	"abs",
	"floor",
	"round",
	"ceil",
	"E",
	"PI",
	"sin",
	"cos",
	"tan",
	"asin",
	"acos",
	"atan",
	"atan2",
	"log"
];
//create an actual regular expression object from the string
const WHITELISTER = new RegExp(
	[
		//Allow the 4 basic operations, parentheses and all numbers/decimals, as well
		//as 'x', for the variable usage.
		"[01234567890\\.\\*\\-\\+\\/\\(\\)x ,]",
	].concat(MATH_FUNCS).join("|"),
	"g"
);

/**
 * Parses a string into a function for path following.
 * This involves whitelisting the string for safety, inserting "Math." to math function
 * names, and using `new Function()` to generate a function.
 * @method PIXI.particles.PathParticle~parsePath
 * @private
 * @static
 * @param {String} pathString The string to parse.
 * @return {Function} The path function - takes x, outputs y.
 */
const parsePath = function(pathString: string)
{
	let matches = pathString.match(WHITELISTER);
	for(let i = matches.length - 1; i >= 0; --i)
	{
		if(MATH_FUNCS.indexOf(matches[i]) >= 0)
			matches[i] = "Math." + matches[i];
	}
	pathString = matches.join("");
	return new Function("x", "return "+ pathString + ";");
};

/**
 * An particle that follows a path defined by an algebraic expression, e.g. "sin(x)" or
 * "5x + 3".
 * To use this class, the particle config must have a "path" string in the
 * "extraData" parameter. This string should have "x" in it to represent movement (from the
 * speed settings of the particle). It may have numbers, parentheses, the four basic
 * operations, and the following Math functions or properties (without the preceding "Math."):
 * "pow", "sqrt", "abs", "floor", "round", "ceil", "E", "PI", "sin", "cos", "tan", "asin",
 * "acos", "atan", "atan2", "log".
 * The overall movement of the particle and the expression value become x and y positions for
 * the particle, respectively. The final position is rotated by the spawn rotation/angle of
 * the particle.
 *
 * Some example paths:
 *
 * 	"sin(x/10) * 20" // A sine wave path.
 * 	"cos(x/100) * 30" // Particles curve counterclockwise (for medium speed/low lifetime particles)
 * 	"pow(x/10, 2) / 2" // Particles curve clockwise (remember, +y is down).
 *
 * @memberof PIXI.particles
 * @class PathParticle
 * @extends PIXI.particles.Particle
 * @constructor
 * @param {PIXI.particles.Emitter} emitter The emitter that controls this PathParticle.
 */
export default class PathParticle extends Particle
{
	/**
	 * The function representing the path the particle should take.
	 * @property {Function} path
	 */
	public path: Function;
	/**
	 * The initial rotation in degrees of the particle, because the direction of the path
	 * is based on that.
	 * @property {Number} initialRotation
	 */
	public initialRotation: number;
	/**
	 * The initial position of the particle, as all path movement is added to that.
	 * @property {PIXI.Point} initialPosition
	 */
	public initialPosition: PIXI.Point;
	/**
	 * Total single directional movement, due to speed.
	 * @property {Number} movement
	 */
	public movement: number;
	
	constructor(emitter: Emitter)
	{
		super(emitter);
		this.path = null;
		this.initialRotation = 0;
		this.initialPosition = new PIXI.Point();
		this.movement = 0;
	}

	/**
	 * Initializes the particle for use, based on the properties that have to
	 * have been set already on the particle.
	 * @method PIXI.particles.PathParticle#init
	 */
	public init()
	{
		//get initial rotation before it is converted to radians
		this.initialRotation = this.rotation;
		//standard init
		this.Particle_init();

		//set the path for the particle
		this.path = this.extraData.path;
		//cancel the normal movement behavior
		this._doNormalMovement = !this.path;
		//reset movement
		this.movement = 0;
		//grab position
		this.initialPosition.x = this.position.x;
		this.initialPosition.y = this.position.y;
	}

	/**
	 * Updates the particle.
	 * @method PIXI.particles.PathParticle#update
	 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
	 */
	public update(delta: number): number
	{
		const lerp = this.Particle_update(delta);
		//if the particle died during the update, then don't bother
		if(lerp >= 0 && this.path)
		{
			//increase linear movement based on speed
			const speed = this.speedList.interpolate(lerp) * this.speedMultiplier;
			this.movement += speed * delta;
			//set up the helper point for rotation
			helperPoint.x = this.movement;
			helperPoint.y = this.path(this.movement);
			ParticleUtils.rotatePoint(this.initialRotation, helperPoint);
			this.position.x = this.initialPosition.x + helperPoint.x;
			this.position.y = this.initialPosition.y + helperPoint.y;
		}
		return lerp;
	}
	
	/**
	 * Destroys the particle, removing references and preventing future use.
	 * @method PIXI.particles.PathParticle#destroy
	 */
	public destroy()
	{
		this.Particle_destroy();
		this.path = this.initialPosition = null;
	}

	/**
	 * Checks over the art that was passed to the Emitter's init() function, to do any special
	 * modifications to prepare it ahead of time. This just runs Particle.parseArt().
	 * @method PIXI.particles.PathParticle.parseArt
	 * @static
	 * @param  {Array} art The array of art data. For Particle, it should be an array of Textures.
	 *                     Any strings in the array will be converted to Textures via
	 *                     Texture.fromImage().
	 * @return {Array} The art, after any needed modifications.
	 */
	public static parseArt(art: any[])
	{
		return Particle.parseArt(art);
	}

	/**
	 * Parses extra emitter data to ensure it is set up for this particle class.
	 * PathParticle checks for the existence of path data, and parses the path data for use
	 * by particle instances.
	 * @method PIXI.particles.PathParticle.parseData
	 * @static
	 * @param  {Object} extraData The extra data from the particle config.
	 * @return {Object} The parsed extra data.
	 */
	public static parseData(extraData: {path:string})
	{
		let output: any = {};
		if(extraData && extraData.path)
		{
			try
			{
				output.path = parsePath(extraData.path);
			}
			catch(e)
			{
				if(ParticleUtils.verbose)
					console.error("PathParticle: error in parsing path expression");
				output.path = null;
			}
		}
		else
		{
			if(ParticleUtils.verbose)
				console.error("PathParticle requires a path string in extraData!");
			output.path = null;
		}
		return output;
	}
}