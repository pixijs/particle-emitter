/*! PixiParticles 0.0.1 */
/**
*  @module cloudkid
*/
(function(undefined) {

	"use strict";

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
	*	Converts a hex string from "#AARRGGBB", "#RRGGBB", "0xAARRGGBB", "0xRRGGBB", "AARRGGBB", or "RRGGBB" 
	*	to an array of ints of 0-255 or Numbers from 0-1, as [r, g, b, (a)].
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
	*	@param {Array} segments An array of segments, as created by http://www.greensock.com/customease/.
	*	@return {Function} A function that calculates the percentage of change at a given point in time (0-1 inclusive).
	*	@static
	*/
	ParticleUtils.generateEase = function(segments)
	{
		var qty = segments.length;
		var oneOverQty = 1 / qty;
		/*
		*	Calculates the percentage of change at a given point in time (0-1 inclusive).
		*	@param time The time of the ease, 0-1 inclusive.
		*	@return The percentage of the change, 0-1 inclusive (unless your ease goes outside those bounds).
		*/
		var simpleEase = function(time)
		{
			var t, s;
			var i = (qty * time) | 0;//do a quick floor operation
			t = (time - (i * oneOverQty)) * qty;
			s = segments[i];
			return (s.s + t * (2 * (1 - t) * (s.cp - s.s) + t * (s.e - s.s)));
		};
		return simpleEase;
	};

	namespace('cloudkid').ParticleUtils = ParticleUtils;

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
/**
*  @module cloudkid
*/
(function(undefined) {

	"use strict";

	var ParticleUtils = cloudkid.ParticleUtils;

	/**
	*	An individual particle image. You shouldn't have to deal with these.
	*	@class Particle
	*	@constructor
	*	@param {Emitter} emitter The emitter that controls this particle.
	*/
	var Particle = function(emitter)
	{
		PIXI.Sprite.call(this, emitter.particleImages[0]);

		/**
		*	The emitter that controls this particle.
		*	@property {Emitter} emitter
		*/
		this.emitter = emitter;
		this.anchor.x = this.anchor.y = 0.5;
		/**
		*	The velocity of the particle. Speed may change, but the angle also 
		*	contained in velocity is constant.
		*	@property {PIXI.Point} velocity
		*/
		this.velocity = new PIXI.Point();
		/**
		*	The maximum lifetime of this particle, in seconds.
		*	@property {Number} maxLife
		*/
		this.maxLife = 0;
		/**
		*	The current age of the particle, in seconds.
		*	@property {Number} age
		*/
		this.age = 0;
		/**
		*	A simple easing function to be applied to all properties that
		*	are being interpolated.
		*	@property {Function} ease
		*/
		this.ease = null;
		/**
		*	The alpha of the particle at the start of its life.
		*	@property {Number} startAlpha
		*/
		this.startAlpha = 0;
		/**
		*	The alpha of the particle at the end of its life.
		*	@property {Number} endAlpha
		*/
		this.endAlpha = 0;
		/**
		*	The speed of the particle at the start of its life.
		*	@property {Number} startSpeed
		*/
		this.startSpeed = 0;
		/**
		*	The speed of the particle at the end of its life.
		*	@property {Number} endSpeed
		*/
		this.endSpeed = 0;
		/**
		*	The scale of the particle at the start of its life.
		*	@property {Number} startScale
		*/
		this.startScale = 0;
		/**
		*	The scale of the particle at the start of its life.
		*	@property {Number} endScale
		*/
		this.endScale = 0;
		/**
		*	The tint of the particle at the start of its life.
		*	@property {Array} startColor
		*/
		this.startColor = null;
		/**
		*	The red tint of the particle at the start of its life.
		*	This is pulled from startColor in init().
		*	@property {uint} _sR
		*	@private
		*/
		this._sR = 0;
		/**
		*	The green tint of the particle at the start of its life.
		*	This is pulled from startColor in init().
		*	@property {uint} _sG
		*	@private
		*/
		this._sG = 0;
		/**
		*	The blue tint of the particle at the start of its life.
		*	This is pulled from startColor in init().
		*	@property {uint} _sB
		*	@private
		*/
		this._sB = 0;
		/**
		*	The tint of the particle at the start of its life.
		*	@property {Array} endColor
		*/
		this.endColor = null;
		/**
		*	The red tint of the particle at the end of its life.
		*	This is pulled from endColor in init().
		*	@property {uint} _eR
		*	@private
		*/
		this._eR = 0;
		/**
		*	The green tint of the particle at the end of its life.
		*	This is pulled from endColor in init().
		*	@property {uint} _sG
		*	@private
		*/
		this._eG = 0;
		/**
		*	The blue tint of the particle at the end of its life.
		*	This is pulled from endColor in init().
		*	@property {uint} _sB
		*	@private
		*/
		this._eB = 0;
		/**
		*	If alpha should be interpolated at all.
		*	@property {Boolean} _doAlpha
		*	@private
		*/
		this._doAlpha = false;
		/**
		*	If scale should be interpolated at all.
		*	@property {Boolean} _doScale
		*	@private
		*/
		this._doScale = false;
		/**
		*	If speed should be interpolated at all.
		*	@property {Boolean} _doSpeed
		*	@private
		*/
		this._doSpeed = false;
		/**
		*	If color should be interpolated at all.
		*	@property {Boolean} _doColor
		*	@private
		*/
		this._doColor = false;
		/**
		*	One divided by the max life of the particle, saved for slightly faster math.
		*	@property {Number} _oneOverLife
		*	@private
		*/
		this._oneOverLife = 0;
	};
	
	// Reference to the prototype
	var p = Particle.prototype = Object.create(PIXI.Sprite.prototype);

	/**
	*	Initializes the particle for use, based on the properties that have to
	*	have been set already on the particle.
	*	@method init
	*/
	p.init = function()
	{
		//reset the age
		this.age = 0;
		//set up the velocity based on the start speed and rotation
		this.velocity.x = this.startSpeed;
		this.velocity.y = 0;
		ParticleUtils.rotatePoint(this.rotation, this.velocity);
		//convert rotation to Radians from Degrees
		this.rotation *= ParticleUtils.DEG_TO_RADS;
		//convert rotation speed to Radians from Degrees
		this.rotationSpeed *= ParticleUtils.DEG_TO_RADS;
		//set alpha to inital alpha
		this.alpha = this.startAlpha;
		//set scale to initial scale
		this.scale.x = this.scale.y = this.startScale;
		//determine start and end color values
		if (this.startColor)
		{
			this._sR = this.startColor[0];
			this._sG = this.startColor[1];
			this._sB = this.startColor[2];
			if(this.endColor)
			{
				this._eR = this.endColor[0];
				this._eG = this.endColor[1];
				this._eB = this.endColor[2];
			}
		}
		//figure out what we need to interpolate
		this._doAlpha = this.startAlpha != this.endAlpha;
		this._doSpeed = this.startSpeed != this.endSpeed;
		this._doScale = this.startScale != this.endScale;
		this._doColor = !!this.endColor;
		//save our lerp helper
		this._oneOverLife = 1 / this.maxLife;
		//set the inital color
		this.tint = ParticleUtils.combineRGBComponents(this._sR, this._sG, this._sB);
	};

	/**
	*	Updates the particle.
	*	@method update
	*	@param {Number} delta Time elapsed since the previous frame, in __seconds__.
	*/
	p.update = function(delta)
	{
		//increase age
		this.age += delta;
		//recycle particle if it is too old
		if(this.age >= this.maxLife)
		{
			this.emitter.recycle(this);
			return;
		}
		
		//determine our interpolation value
		var lerp = this.age * this._oneOverLife;//lifetime / maxLife;
		if (this.ease)
			lerp = this.ease(lerp);
		
		//interpolate alpha
		if (this._doAlpha)
			this.alpha = (this.endAlpha - this.startAlpha) * lerp + this.startAlpha;
		//interpolate scale
		if (this._doScale)
		{
			var scale = (this.endScale - this.startScale) * lerp + this.startScale;
			this.scale.x = this.scale.y = scale;
		}
		//handle movement
		if(this._doSpeed || this.startSpeed !== 0)
		{
			//interpolate speed
			if (this._doSpeed)
			{
				var speed = (this.endSpeed - this.startSpeed) * lerp + this.startSpeed;
				this.velocity.normalize();
				this.velocity.scaleBy(speed);
			}
			//adjust position based on velocity
			this.position.x += this.velocity.x * delta;
			this.position.y += this.velocity.y * delta;
		}
		//interpolate color
		if (this._doColor)
		{
			var r = (this._eR - this._sR) * lerp + this._sR;
			var g = (this._eG - this._sG) * lerp + this._sG;
			var b = (this._eB - this._sB) * lerp + this._sB;
			this.tint = ParticleUtils.combineRGBComponents(r, g, b);
		}
		//update rotation
		if(this.rotationSpeed !== 0)
		{
			this.rotation += this.rotationSpeed * delta;
		}
	};

	/**
	*	Destroys the particle, removing references and preventing future use.
	*	@method destroy
	*/
	p.destroy = function()
	{
		this.emitter = null;
		this.velocity = null;
		this.startColor = this.endColor = null;
		this.ease = null;
	};

	namespace('cloudkid').Particle = Particle;
}());
/**
*  @module cloudkid
*/
(function(undefined) {

	"use strict";

	var ParticleUtils = cloudkid.ParticleUtils,
		Particle = cloudkid.Particle;

	/**
	*	A particle emitter.
	*	@class Emitter
	*	@constructor
	*	@param {PIXI.DisplayObjectContainer} particleParent The display object to add the particles to.
	*	@param {Array|PIXI.Texture} [particleImages] A texture or array of textures to use for the particles.
	*	@param {Object} [config] A configuration object containing settings for the emitter.
	*/
	var Emitter = function(particleParent, particleImages, config)
	{
		//properties for individual particles
		/**
		*	An array of PIXI Texture objects.
		*	@property {Array} particleImages
		*/
		this.particleImages = null;
		/**
		*	The starting alpha of all particles.
		*	@property {Number} startAlpha
		*	@default 1
		*/
		this.startAlpha = 1;
		/**
		*	The ending alpha of all particles.
		*	@property {Number} endAlpha
		*	@default 1
		*/
		this.endAlpha = 1;
		/**
		*	The starting speed of all particles.
		*	@property {Number} startSpeed
		*	@default 0
		*/
		this.startSpeed = 0;
		/**
		*	The ending speed of all particles.
		*	@property {Number} endSpeed
		*	@default 0
		*/
		this.endSpeed = 0;
		/**
		*	The starting scale of all particles.
		*	@property {Number} startScale
		*	@default 1
		*/
		this.startScale = 1;
		/**
		*	The ending scale of all particles.
		*	@property {Number} endScale
		*	@default 1
		*/
		this.endScale = 1;
		/**
		*	The starting color of all particles, as red, green, and blue uints from 0-255.
		*	@property {Array} startColor
		*/
		this.startColor = null;
		/**
		*	The ending color of all particles, as red, green, and blue uints from 0-255.
		*	@property {Array} endColor
		*/
		this.endColor = null;
		/**
		*	The minimum lifetime for a particle, in seconds.
		*	@property {Number} minLifetime
		*/
		this.minLifetime = 0;
		/**
		*	The maximum lifetime for a particle, in seconds.
		*	@property {Number} maxLifetime
		*/
		this.maxLifetime = 0;
		/**
		*	The minimum start rotation for a particle, in degrees. This value
		*	is ignored if the spawn type is "burst" or "arc".
		*	@property {Number} minStartRotation
		*/
		this.minStartRotation = 0;
		/**
		*	The maximum start rotation for a particle, in degrees. This value
		*	is ignored if the spawn type is "burst" or "arc".
		*	@property {Number} maxStartRotation
		*/
		this.maxStartRotation = 0;
		/**
		*	The minimum rotation speed for a particle, in degrees per second.
		*	This only visually spins the particle, it does not change direction of movement.
		*	@property {Number} minRotationSpeed
		*/
		this.minRotationSpeed = 0;
		/**
		*	The maximum rotation speed for a particle, in degrees per second.
		*	This only visually spins the particle, it does not change direction of movement.
		*	@property {Number} maxRotationSpeed
		*/
		this.maxRotationSpeed = 0;
		/**
		*	An easing function for nonlinear interpolation of values. Accepts a single parameter of time
		*	as a value from 0-1, inclusive. Expected outputs are values from 0-1, inclusive.
		*	@property {Function} customeEase
		*/
		this.customEase = null;
		//properties for spawning particles
		/**
		*	Time between particle spawns in seconds.
		*	@property {Number} frequency
		*/
		this.frequency = 0;
		/**
		*	Maximum number of particles to keep alive at a time. If this limit 
		*	is reached, no more particles will spawn until some have died.
		*	@property {int} maxParticles
		*	@default 1000
		*/
		this.maxParticles = 1000;
		/**
		*	The amount of time in seconds to emit for before setting emit to false.
		*	A value of -1 is an unlimited amount of time.
		*	@property {Number} emitterLifetime
		*	@default -1
		*/
		this.emitterLifetime = -1;
		/**
		*	Position at which to spawn particles, relative to the emitter's owner's origin.
		*	For example, the flames of a rocket travelling right might have a spawnPos of {x:-50, y:0}
		*	to spawn at the rear of the rocket.
		*	To change this, use updateSpawnPos().
		*	@property {PIXI.Point} spawnPos
		*	@readOnly
		*/
		this.spawnPos = null;
		/**
		*	How the particles will be spawned. Valid types are "point", "rectangle", "circle", "burst".
		*	@property {String} spawnType
		*	@readOnly
		*/
		this.spawnType = null;
		/**
		*	A reference to the emitter function specific to the spawn type.
		*	@property {Function} _spawnFunc
		*	@private
		*/
		this._spawnFunc = null;
		/**
		*	A rectangle relative to spawnPos to spawn particles inside if the spawn type is "rect".
		*	@property {PIXI.Rectangle} spawnRect
		*/
		this.spawnRect = null;
		/**
		*	A circle relative to spawnPos to spawn particles inside if the spawn type is "circle".
		*	@property {PIXI.Circle} spawnCircle
		*/
		this.spawnCircle = null;
		/**
		*	Number of particles to spawn each wave in a burst.
		*	@property {int} particlesPerWave
		*	@default 1
		*/
		this.particlesPerWave = 1;
		/**
		*	Spacing between particles in a burst. 0 gives a random angle for each particle.
		*	@property {Number} particleSpacing
		*	@default 0
		*/
		this.particleSpacing = 0;
		/**
		*	Angle at which to start spawning particles in a burst.
		*	@property {Number} angleStart
		*	@default 0
		*/
		this.angleStart = 0;
		/**
		*	Rotation of the emitter or emitter's owner in degrees. This is added to the calculated spawn angle.
		*	To change this, use rotate().
		*	@property {Number} rotation
		*	@default 0
		*	@readOnly
		*/
		this.rotation = 0;
		/**
		*	The world position of the emitter's owner, to add spawnPos to when spawning particles. To change this,
		*	use updateSpawnOrigin().
		*	@property {PIXI.Point} ownerPos
		*	@default {x:0, y:0}
		*	@readOnly
		*/
		this.ownerPos = null;
		/**
		*	The origin + spawnPos in the previous update, so that the spawn position
		*	can be interpolated to space out particles better.
		*	@property {PIXI.Point} _prevEmitterPos
		*	@private
		*/
		this._prevEmitterPos = null;
		/**
		*	If _prevEmitterPos is valid, to prevent interpolation on the first update
		*	@property {Boolean} _prevPosIsValid
		*	@private
		*	@default false
		*/
		this._prevPosIsValid = false;
		/**
		*	If either ownerPos or spawnPos has changed since the previous update.
		*	@property {Boolean} _posChanged
		*/
		this._posChanged = false;
		/**
		*	The display object to add particles to.
		*	@property {PIXI.DisplayObjectContainer} parent
		*/
		this.parent = particleParent;
		/**
		*	If particles should be added at the back of the display list instead of the front.
		*	@property {Boolean} addAtBack
		*/
		this.addAtBack = false;
		/**
		*	If particles should be emitted during update() calls. Setting this to false
		*	stops new particles from being created, but allows existing ones to die out.
		*	@property {Boolean} _emit
		*	@private
		*/
		this._emit = false;
		/**
		*	The timer for when to spawn particles in seconds, where numbers less 
		*	than 0 mean that particles should be spawned.
		*	@property {Number} _spawnTimer
		*	@private
		*/
		this._spawnTimer = 0;
		/**
		*	The life of the emitter in seconds.
		*	@property {Number} _emitterLife
		*	@private
		*/
		this._emitterLife = -1;
		/**
		*	The particles that are active and on the display list.
		*	@property {Array} _activeParticles
		*/
		this._activeParticles = [];
		/**
		*	The particles that are not currently being used.
		*	@property {Array} _pool
		*/
		this._pool = [];

		if(particleImages && config)
			this.init(particleImages, config);
	};
	
	// Reference to the prototype
	var p = Emitter.prototype = {};
	
	var helperPoint = new PIXI.Point();

	/**
	*	Sets up the emitter based on the config settings.
	*	@method init
	*	@param {Array|PIXI.Texture} particleImages A texture or array of textures to use for the particles.
	*	@param {Object} config A configuration object containing settings for the emitter.
	*/
	p.init = function(particleImages, config)
	{
		if(!particleImages || !config)
			return;
		//clean up any existing particles
		this.cleanup();
		//set up the array of textures
		this.particleImages = particleImages instanceof PIXI.Texture ? [particleImages] : particleImages;
		//particles from different base textures will be slower in WebGL than if they were from one spritesheet
		if(this.particleImages.length > 1)
		{
			for(var i = this.particleImages.length - 1; i > 0; --i)
			{
				if(this.particleImages[i].baseTexture != this.particleImages[i - 1].baseTexture)
				{
					if(window.Debug)
						Debug.warn("CloudKid Particles: using particle textures from different images may hinder performance in WebGL");
					else
						console.warn("CloudKid Particles: using particle textures from different images may hinder performance in WebGL");
					break;
				}
			}
		}
		///////////////////////////
		// Particle Properties   //
		///////////////////////////
		//set up the alpha
		if (config.alpha)
		{
			this.startAlpha = config.alpha.start;
			this.endAlpha = config.alpha.end;
		}
		else
			this.startAlpha = this.endAlpha = 1;
		//set up the speed
		if (config.speed)
		{
			this.startSpeed = config.speed.start;
			this.endSpeed = config.speed.end;
		}
		else
			this.startSpeed = this.endSpeed = 0;
		//set up the scale
		if (config.scale)
		{
			this.startScale = config.scale.start;
			this.endScale = config.scale.end;
		}
		else
			this.startScale = this.endScale = 1;
		//set up the color
		if (config.color)
		{
			this.startColor = ParticleUtils.hexToRGB(config.color.start);
			//if it's just one color, only use the start color
			if (config.color.start != config.color.end)
			{
				this.endColor = ParticleUtils.hexToRGB(config.color.end);
			}
			else
				this.endColor = null;
		}
		//set up the start rotation
		if (config.startRotation)
		{
			this.minStartRotation = config.startRotation.min;
			this.maxStartRotation = config.startRotation.max;
		}
		else
			this.minStartRotation = this.maxStartRotation = 0;
		//set up the rotation speed
		if (config.rotationSpeed)
		{
			this.minRotationSpeed = config.rotationSpeed.min;
			this.maxRotationSpeed = config.rotationSpeed.max;
		}
		else
			this.minRotationSpeed = this.maxRotationSpeed = 0;
		//set up the lifetime
		this.minLifetime = config.lifetime.min;
		this.maxLifetime = config.lifetime.max;
		//use the custom ease if provided
		if (config.ease)
		{
			this.customEase = typeof config.ease == "function" ? config.ease : ParticleUtils.generateEase(config.ease);
		}
		//////////////////////////
		// Emitter Properties   //
		//////////////////////////
		//reset spawn type specific settings
		this.minAngle = this.maxAngle = 0;
		this.spawnRect = this.spawnCircle = null;
		this.particlesPerWave = 1;
		this.particleSpacing = 0;
		this.angleStart = 0;
		//determine the spawn function to use
		switch(config.spawnType)
		{
			case "rect":
				this.spawnType = "rect";
				this._spawnFunc = this._spawnRect;
				var spawnRect = config.spawnRect;
				this.spawnRect = new PIXI.Rectangle(spawnRect.x, spawnRect.y, spawnRect.w, spawnRect.h);
				break;
			case "circle":
				this.spawnType = "circle";
				this._spawnFunc = this._spawnCircle;
				var spawnCircle = config.spawnCircle;
				this.spawnCircle = new PIXI.Circle(spawnCircle.x, spawnCircle.y, spawnCircle.r);
				break;
			case "arc":
				this.spawnType = "arc";
				this._spawnFunc = this._spawnArc;
				//set up the angle for spawning particles in
				this.minAngle = config.angle.min;
				this.maxAngle = config.angle.max;
				break;
			case "burst":
				this.spawnType = "burst";
				this._spawnFunc = this._spawnBurst;
				this.particlesPerWave = config.particlesPerWave;
				this.particleSpacing = config.particleSpacing;
				this.angleStart = config.angleStart ? config.angleStart : 0;
				break;
			case "point":
				this.spawnType = "point";
				this._spawnFunc = this._spawnPoint;
				break;
			default:
				this.spawnType = "point";
				this._spawnFunc = this._spawnPoint;
				break;
		}
		//set the spawning frequency
		this.frequency = config.frequency;
		//set the emitter lifetime
		this.emitterLifetime = config.emitterLifetime || -1;
		//set the max particles
		this.maxParticles = config.maxParticles > 0 ? config.maxParticles : 1000;
		//determine if we should add the particle at the back of the list or not
		this.addAtBack = !!config.addAtBack;
		//reset the emitter position and rotation variables
		this.rotation = 0;
		this.ownerPos = new PIXI.Point();
		this.spawnPos = new PIXI.Point(config.pos.x, config.pos.y);
		this._prevEmitterPos = this.spawnPos.clone();
		//previous emitter position is invalid and should not be used for interpolation
		this._prevPosIsValid = false;
		//start emitting
		this._spawnTimer = 0;
		this.emit = true;
	};

	/**
	*	Recycles an individual particle.
	*	@method recycle
	*	@param {Particle} particle The particle to recycle.
	*/
	p.recycle = function(particle)
	{
		var index = this._activeParticles.indexOf(particle);
		//pop is preferrable to slice, so always pop the particles off the end
		if(index < this._activeParticles.length - 1)
			this._activeParticles[index] = this._activeParticles[this._activeParticles.length - 1];
		this._activeParticles.pop();
		//readd to pool
		this._pool.push(particle);
		//remove child from display
		if(particle.parent)
			particle.parent.removeChild(particle);
	};
	
	/**
	*	Sets the rotation of the emitter to a new value.
	*	@method rotate
	*	@param {Number} newRot The new rotation, in degrees.
	*/
	p.rotate = function(newRot)
	{
		if (this.rotation == newRot) return;
		//caclulate the difference in rotation for rotating spawnPos
		var diff = newRot - this.rotation;
		this.rotation = newRot;
		//rotate spawnPos
		ParticleUtils.rotatePoint(diff, this.spawnPos);
		//mark the position as having changed
		this._posChanged = true;
	};
	
	/**
	*	Changes the spawn position of the emitter.
	*	@method updateSpawnPos
	*	@param {Number} x The new x value of the spawn position for the emitter.
	*	@param {Number} y The new y value of the spawn position for the emitter.
	*/
	p.updateSpawnPos = function(x, y)
	{
		this._posChanged = true;
		this.spawnPos.x = x;
		this.spawnPos.y = y;
	};
	
	/**
	*	Changes the position of the emitter's owner. You should call this if you are adding
	*	particles to the world display object that your emitter's owner is moving around in.
	*	@method updateOwnerPos
	*	@param {Number} x The new x value of the emitter's owner.
	*	@param {Number} y The new y value of the emitter's owner.
	*/
	p.updateOwnerPos = function(x, y)
	{
		this._posChanged = true;
		this.ownerPos.x = x;
		this.ownerPos.y = y;
	};
	
	/**
	*	Prevents emitter position interpolation in the next update.
	*	This should be used if you made a major position change of your emitter's owner
	*	that was not normal movement.
	*	@method resetPositionTracking
	*/
	p.resetPositionTracking = function()
	{
		this._prevPosIsValid = false;
	};
	
	/**
	*	If particles should be emitted during update() calls. Setting this to false
	*	stops new particles from being created, but allows existing ones to die out.
	*	@property {Boolean} emit
	*/
	Object.defineProperty(p, "emit",
	{
		get: function() { return this._emit; },
		set: function(value)
		{
			this._emit = !!value;
			this._emitterLife = this.emitterLifetime;
		}
	});

	/**
	*	Updates all particles spawned by this emitter and emits new ones.
	*	@method update
	*	@param {Number} delta Time elapsed since the previous frame, in __seconds__.
	*/
	p.update = function(delta)
	{
		//update existing particles
		var i;
		for(i = this._activeParticles.length - 1; i >= 0; --i)
			this._activeParticles[i].update(delta);
		var prevX, prevY;
		//if the previous position is valid, store these for later interpolation
		if(this._prevPosIsValid)
		{
			prevX = this._prevEmitterPos.x;
			prevY = this._prevEmitterPos.y;
		}
		//store current position of the emitter as local variables
		var curX = this.ownerPos.x + this.spawnPos.x;
		var curY = this.ownerPos.y + this.spawnPos.y;
		//spawn new particles
		if (this.emit)
		{
			//decrease spawn timer
			this._spawnTimer -= delta;
			//while _spawnTimer < 0, we have particles to spawn
			while(this._spawnTimer <= 0)
			{
				//determine if the emitter should stop spawning
				if(this._emitterLife > 0)
				{
					this._emitterLife -= this.frequency;
					if(this._emitterLife <= 0)
					{
						this._spawnTimer = 0;
						this._emitterLife = 0;
						this.emit = false;
						break;
					}
				}
				//determine if we have hit the particle limit
				if(this._activeParticles.length >= this.maxParticles)
				{
					this._spawnTimer += this.frequency;
					continue;
				}
				//determine the particle lifetime
				var lifetime;
				if (this.minLifetime == this.maxLifetime)
					lifetime = this.minLifetime;
				else
					lifetime = Math.random() * (this.maxLifetime - this.minLifetime) + this.minLifetime;
				//only make the particle if it wouldn't immediately destroy itself
				if(-this._spawnTimer < lifetime)
				{
					//If the position has changed and this isn't the first spawn, interpolate the spawn position
					var emitPosX, emitPosY;
					if (this._prevPosIsValid && this._posChanged)
					{
						var lerp = 1 + this._spawnTimer / delta;//1 - _spawnTimer / delta, but _spawnTimer is negative
						emitPosX = (curX - prevX) * lerp + prevX;
						emitPosY = (curY - prevY) * lerp + prevY;
					}
					else//otherwise just set to the spawn position
					{
						emitPosX = curX;
						emitPosY = curY;
					}
					//create enough particles to fill the wave (non-burst types have a wave of 1)
					i = 0;
					for(var len = Math.min(this.particlesPerWave, this.maxParticles - this._activeParticles.length); i < len; ++i)
					{
						//create particle
						var p = this._pool.length ? this._pool.pop() : new Particle(this);
						//set a random texture if we have more than one
						if(this.particleImages.length > 1)
							p.setTexture(this.particleImages.random());
						else
							p.setTexture(this.particleImages[0]);//if they are actually the same texture, this call will quit early
						//set up the start and end values
						p.startAlpha = this.startAlpha;
						p.endAlpha = this.endAlpha;
						p.startSpeed = this.startSpeed;
						p.endSpeed = this.endSpeed;
						p.startScale = this.startScale;
						p.endScale = this.endScale;
						p.startColor = this.startColor;
						p.endColor = this.endColor;
						if(this.minRotationSpeed == this.maxRotationSpeed)
							p.rotationSpeed = this.minRotationSpeed;
						else
							p.rotationSpeed = Math.random() * (this.maxRotationSpeed - this.minRotationSpeed) + this.minRotationSpeed;
						p.maxLife = lifetime;
						//call the proper function to handle rotation and position of particle
						this._spawnFunc(p, emitPosX, emitPosY, i);
						//initialize particle
						p.init();
						//update the particle by the time passed, so the particles are spread out properly
						p.update(-this._spawnTimer);//we want a positive delta, because a negative delta messes things up
						//add the particle to the display list
						if (this.addAtBack)
							this.parent.addChildAt(p, 0);
						else
							this.parent.addChild(p);
						//add particle to list of active particles
						this._activeParticles.push(p);
					}
				}
				//increase timer and continue on to any other particles that need to be created
				this._spawnTimer += this.frequency;
			}
		}
		//if the position changed before this update, then keep track of that
		if(this._posChanged)
		{
			this._prevEmitterPos.x = curX;
			this._prevEmitterPos.y = curY;
			this._prevPosIsValid = true;
			this._posChanged = false;
		}
	};
	
	/**
	*	Positions a particle for a point type emitter.
	*	@method _spawnPoint
	*	@private
	*	@param {Particle} p The particle to position and rotate.
	*	@param {Number} emitPosX The emitter's x position
	*	@param {Number} emitPosY The emitter's y position
	*	@param {int} i The particle number in the current wave. Not used for this function.
	*/
	p._spawnPoint = function(p, emitPosX, emitPosY, i)
	{
		//set the initial rotation/direction of the particle based on starting particle angle and rotation of emitter
		if (this.minStartRotation == this.maxStartRotation)
			p.rotation = this.minStartRotation + this.rotation;
		else
			p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) + this.minStartRotation + this.rotation;
		//drop the particle at the emitter's position
		p.position.x = emitPosX;
		p.position.y = emitPosY;
	};
	
	/**
	*	Positions a particle for a rectangle type emitter.
	*	@method _spawnRect
	*	@private
	*	@param {Particle} p The particle to position and rotate.
	*	@param {Number} emitPosX The emitter's x position
	*	@param {Number} emitPosY The emitter's y position
	*	@param {int} i The particle number in the current wave. Not used for this function.
	*/
	p._spawnRect = function(p, emitPosX, emitPosY, i)
	{
		//set the initial rotation/direction of the particle based on starting particle angle and rotation of emitter
		if (this.minStartRotation == this.maxStartRotation)
			p.rotation = this.minStartRotation + this.rotation;
		else
			p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) + this.minStartRotation + this.rotation;
		//place the particle at a random point in the rectangle
		helperPoint.x = Math.random() * this.spawnRect.width + this.spawnRect.x;
		helperPoint.y = Math.random() * this.spawnRect.height + this.spawnRect.y;
		if(this.rotation !== 0)
			ParticleUtils.rotatePoint(this.rotation, helperPoint);
		p.position.x = emitPosX + helperPoint.x;
		p.position.y = emitPosY + helperPoint.y;
	};
	
	/**
	*	Positions a particle for a circle type emitter.
	*	@method _spawnCircle
	*	@private
	*	@param {Particle} p The particle to position and rotate.
	*	@param {Number} emitPosX The emitter's x position
	*	@param {Number} emitPosY The emitter's y position
	*	@param {int} i The particle number in the current wave. Not used for this function.
	*/
	p._spawnCircle = function(p, emitPosX, emitPosY, i)
	{
		//set the initial rotation/direction of the particle based on starting particle angle and rotation of emitter
		if (this.minStartRotation == this.maxStartRotation)
			p.rotation = this.minStartRotation + this.rotation;
		else
			p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) + this.minStartRotation + this.rotation;
		//place the particle at a random point in the circle
		helperPoint.x = Math.random() * this.spawnCircle.radius;// + this.spawnRect.x;
		helperPoint.y = 0;
		ParticleUtils.rotatePoint(Math.random() * 360, helperPoint);
		helperPoint.x += this.spawnCircle.x;
		helperPoint.y += this.spawnCircle.y;
		if(this.rotation !== 0)
			ParticleUtils.rotatePoint(this.rotation, helperPoint);
		p.position.x = emitPosX + helperPoint.x;
		p.position.y = emitPosY + helperPoint.y;
	};
	
	/**
	*	Positions a particle for a burst type emitter.
	*	@method _spawnBurst
	*	@private
	*	@param {Particle} p The particle to position and rotate.
	*	@param {Number} emitPosX The emitter's x position
	*	@param {Number} emitPosY The emitter's y position
	*	@param {int} i The particle number in the current wave.
	*/
	p._spawnBurst = function(p, emitPosX, emitPosY, i)
	{
		//set the initial rotation/direction of the particle based on spawn angle and rotation of emitter
		if(this.particleSpacing === 0)
			p.rotation = Math.random() * 360;
		else
			p.rotation = this.angleStart + (this.particleSpacing * i) + this.rotation;
		//drop the particle at the emitter's position
		p.position.x = emitPosX;
		p.position.y = emitPosY;
	};

	/**
	*	Kills all active particles immediately.
	*	@method cleanup
	*/
	p.cleanup = function()
	{
		for (var i = this._activeParticles.length - 1; i >= 0; --i)
		{
			this.recycle(this._activeParticles[i]);
		}
	};
	
	/**
	*	Destroys the emitter and all of its particles.
	*	@method destroy
	*/
	p.destroy = function()
	{
		this.cleanup();
		for(var i = this._pool.length - 1; i >= 0; --i)
		{
			this._pool[i].destroy();
		}
		this._pool = null;
		this._activeParticles = null;
		this.parent = null;
		this.particleImages = null;
		this.spawnPos = null;
		this.ownerPos = null;
		this.startColor = null;
		this.endColor = null;
		this.customEase = null;
	};

	namespace('cloudkid').Emitter = Emitter;
}());