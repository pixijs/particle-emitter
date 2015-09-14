/*! PixiParticles 1.5.1 */
/**
*  @module Path Particle
*  @namespace cloudkid
*/
(function(cloudkid, undefined) {

	"use strict";

	var ParticleUtils = cloudkid.ParticleUtils,
		Particle = cloudkid.Particle;

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
	 * @class PathParticle
	 * @constructor
	 * @param {Emitter} emitter The emitter that controls this PathParticle.
	 */
	var PathParticle = function(emitter)
	{
		Particle.call(this, emitter);
		/**
		 * The function representing the path the particle should take.
		 * @property {Function} path
		 */
		this.path = null;
		/**
		 * The initial rotation in degrees of the particle, because the direction of the path
		 * is based on that.
		 * @property {Number} initialRotation
		 */
		this.initialRotation = 0;
		/**
		 * The initial position of the particle, as all path movement is added to that.
		 * @property {PIXI.Point} initialPosition
		 */
		this.initialPosition = new PIXI.Point();
		/**
		 * Total single directional movement, due to speed.
		 * @property {Number} movement
		 */
		this.movement = 0;
	};

	// Reference to the super class
	var s = Particle.prototype;
	// Reference to the prototype
	var p = PathParticle.prototype = Object.create(s);

	/**
	 * A helper point for math things.
	 * @property {Function} helperPoint
	 * @private
	 * @static
	 */
	var helperPoint = new PIXI.Point();

	/**
	 * Initializes the particle for use, based on the properties that have to
	 * have been set already on the particle.
	 * @method init
	 */
	p.init = function()
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
	};

	//a hand picked list of Math functions (and a couple properties) that are allowable.
	//they should be used without the preceding "Math."
	var MATH_FUNCS =
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
	//Allow the 4 basic operations, parentheses and all numbers/decimals, as well
	//as 'x', for the variable usage.
	var WHITELISTER = "[01234567890\\.\\*\\-\\+\\/\\(\\)x ,]";
	//add the math functions to the regex string.
	for(var index = MATH_FUNCS.length - 1; index >= 0; --index)
	{
		WHITELISTER += "|" + MATH_FUNCS[index];
	}
	//create an actual regular expression object from the string
	WHITELISTER = new RegExp(WHITELISTER, "g");

	/**
	 * Parses a string into a function for path following.
	 * This involves whitelisting the string for safety, inserting "Math." to math function
	 * names, and using eval() to generate a function.
	 * @method parsePath
	 * @private
	 * @static
	 * @param {String} pathString The string to parse.
	 * @return {Function} The path function - takes x, outputs y.
	 */
	var parsePath = function(pathString)
	{
		var rtn;
		var matches = pathString.match(WHITELISTER);
		for(var i = matches.length - 1; i >= 0; --i)
		{
			if(MATH_FUNCS.indexOf(matches[i]) >= 0)
				matches[i] = "Math." + matches[i];
		}
		pathString = matches.join("");
		eval("rtn = function(x){ return " + pathString + "; };");// jshint ignore:line
		return rtn;
	};

	/**
	 * Updates the particle.
	 * @method update
	 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
	 */
	p.update = function(delta)
	{
		var lerp = this.Particle_update(delta);
		//if the particle died during the update, then don't bother
		if(lerp >= 0 && this.path)
		{
			//increase linear movement based on speed
			var speed = (this.endSpeed - this.startSpeed) * lerp + this.startSpeed;
			this.movement += speed * delta;
			//set up the helper point for rotation
			helperPoint.x = this.movement;
			helperPoint.y = this.path(this.movement);
			ParticleUtils.rotatePoint(this.initialRotation, helperPoint);
			this.position.x = this.initialPosition.x + helperPoint.x;
			this.position.y = this.initialPosition.y + helperPoint.y;
		}
	};

	/**
	 * Destroys the particle, removing references and preventing future use.
	 * @method destroy
	 */
	p.destroy = function()
	{
		s.destroy.call(this);
	};
	
	/**
	 * Checks over the art that was passed to the Emitter's init() function, to do any special
	 * modifications to prepare it ahead of time. This just runs Particle.parseArt().
	 * @method parseArt
	 * @static
	 * @param  {Array} art The array of art data. For Particle, it should be an array of Textures.
	 *                     Any strings in the array will be converted to Textures via
	 *                     Texture.fromImage().
	 * @return {Array} The art, after any needed modifications.
	 */
	PathParticle.parseArt = function(art)
	{
		return Particle.parseArt(art);
	};
	
	/**
	 * Parses extra emitter data to ensure it is set up for this particle class.
	 * PathParticle checks for the existence of path data, and parses the path data for use
	 * by particle instances.
	 * @method parseData
	 * @static
	 * @param  {Object} extraData The extra data from the particle config.
	 * @return {Object} The parsed extra data.
	 */
	PathParticle.parseData = function(extraData)
	{
		var output = {};
		if(extraData && extraData.path)
		{
			try
			{
				output.path = parsePath(extraData.path);
			}
			catch(e)
			{
				if(true)
					console.error("PathParticle: error in parsing path expression");
				output.path = null;
			}
		}
		else
		{
			if(true)
				console.error("PathParticle requires a path string in extraData!");
			output.path = null;
		}
		return output;
	};

	cloudkid.PathParticle = PathParticle;

}(cloudkid));