/*!
 * pixi-particles - v2.1.5
 * Compiled Tue, 14 Mar 2017 22:08:59 UTC
 *
 * pixi-particles is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pixiParticles = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var ParticleUtils = require("./ParticleUtils"),
	Particle = require("./Particle"),
	Texture = PIXI.Texture;

/**
 * An individual particle image with an animation. Art data passed to the emitter must be
 * formatted in a particular way for AnimatedParticle to be able to handle it:
 *
 *     {
 *         //framerate is required. It is the animation speed of the particle in frames per
 *         //second.
 *         //A value of "matchLife" causes the animation to match the lifetime of an individual
 *         //particle, instead of at a constant framerate. This causes the animation to play
 *         //through one time, completing when the particle expires.
 *         framerate: 6,
 *         //loop is optional, and defaults to false.
 *         loop: true,
 *         //textures is required, and can be an array of any (non-zero) length.
 *         textures: [
 *             //each entry represents a single texture that should be used for one or more
 *             //frames. Any strings will be converted to Textures with Texture.fromImage().
 *             //Instances of PIXI.Texture will be used directly.
 *             "animFrame1.png",
 *             //entries can be an object with a 'count' property, telling AnimatedParticle to
 *             //use that texture for 'count' frames sequentially.
 *             {
 *                 texture: "animFrame2.png",
 *                 count: 3
 *             },
 *             "animFrame3.png"
 *         ]
 *     }
 *
 * @memberof PIXI.particles
 * @class AnimatedParticle
 * @extends PIXI.particles.Particle
 * @constructor
 * @param {PIXI.particles.Emitter} emitter The emitter that controls this AnimatedParticle.
 */
var AnimatedParticle = function(emitter)
{
	Particle.call(this, emitter);

	/**
	 * Texture array used as each frame of animation, similarly to how MovieClip works.
	 * @property {Array} textures
	 * @private
	 */
	this.textures = null;

	/**
	 * Duration of the animation, in seconds.
	 * @property {Number} duration
	 * @private
	 */
	this.duration = 0;

	/**
	 * Animation framerate, in frames per second.
	 * @property {Number} framerate
	 * @private
	 */
	this.framerate = 0;

	/**
	 * Animation time elapsed, in seconds.
	 * @property {Number} elapsed
	 * @private
	 */
	this.elapsed = 0;

	/**
	 * If this particle animation should loop.
	 * @property {Boolean} loop
	 * @private
	 */
	this.loop = false;
};

// Reference to the super class
var s = Particle.prototype;
// Reference to the prototype
var p = AnimatedParticle.prototype = Object.create(s);

/**
 * Initializes the particle for use, based on the properties that have to
 * have been set already on the particle.
 * @method PIXI.particles.AnimatedParticle#init
 */
p.init = function()
{
	this.Particle_init();

	this.elapsed = 0;

	//if the animation needs to match the particle's life, then cacluate variables
	if(this.framerate < 0)
	{
		this.duration = this.maxLife;
		this.framerate = this.textures.length / this.duration;
	}
};

/**
 * Sets the textures for the particle.
 * @method PIXI.particles.AnimatedParticle#applyArt
 * @param {Array} art An array of PIXI.Texture objects for this animated particle.
 */
p.applyArt = function(art)
{
	this.textures = art.textures;
	this.framerate = art.framerate;
	this.duration = art.duration;
	this.loop = art.loop;
};

/**
 * Updates the particle.
 * @method PIXI.particles.AnimatedParticle#update
 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
 */
p.update = function(delta)
{
	//only animate the particle if it is still alive
	if(this.Particle_update(delta) >= 0)
	{
		this.elapsed += delta;
		if(this.elapsed > this.duration)
		{
			//loop elapsed back around
			if(this.loop)
				this.elapsed = this.elapsed % this.duration;
			//subtract a small amount to prevent attempting to go past the end of the animation
			else
				this.elapsed = this.duration - 0.000001;
		}
		var frame = (this.elapsed * this.framerate + 0.0000001) | 0;
		this.texture = this.textures[frame] || ParticleUtils.EMPTY_TEXTURE;
	}
};

p.Particle_destroy = Particle.prototype.destroy;
/**
 * Destroys the particle, removing references and preventing future use.
 * @method PIXI.particles.AnimatedParticle#destroy
 */
p.destroy = function()
{
	this.Particle_destroy();
	this.textures = null;
};

/**
 * Checks over the art that was passed to the Emitter's init() function, to do any special
 * modifications to prepare it ahead of time.
 * @method PIXI.particles.AnimatedParticle.parseArt
 * @static
 * @param  {Array} art The array of art data, properly formatted for AnimatedParticle.
 * @return {Array} The art, after any needed modifications.
 */
AnimatedParticle.parseArt = function(art)
{
	var i, data, output = [], j, textures, tex, outTextures;
	for(i = 0; i < art.length; ++i)
	{
		data = art[i];
		art[i] = output = {};
		output.textures = outTextures = [];
		textures = data.textures;
		for(j = 0; j < textures.length; ++j)
		{
			tex = textures[j];
			if(typeof tex == "string")
				outTextures.push(Texture.fromImage(tex));
			else if(tex instanceof Texture)
				outTextures.push(tex);
			//assume an object with extra data determining duplicate frame data
			else
			{
				var dupe = tex.count || 1;
				if(typeof tex.texture == "string")
					tex = Texture.fromImage(tex.texture);
				else// if(tex.texture instanceof Texture)
					tex = tex.texture;
				for(; dupe > 0; --dupe)
				{
					outTextures.push(tex);
				}
			}
		}

		//use these values to signify that the animation should match the particle life time.
		if(data.framerate == "matchLife")
		{
			//-1 means that it should be calculated
			output.framerate = -1;
			output.duration = 0;
			output.loop = false;
		}
		else
		{
			//determine if the animation should loop
			output.loop = !!data.loop;
			//get the framerate, default to 60
			output.framerate = data.framerate > 0 ? data.framerate : 60;
			//determine the duration
			output.duration = outTextures.length / output.framerate;
		}
	}

	return art;
};

module.exports = AnimatedParticle;
},{"./Particle":3,"./ParticleUtils":4}],2:[function(require,module,exports){
"use strict";

var ParticleUtils = require("./ParticleUtils"),
	Particle = require("./Particle"),
	ParticleContainer = PIXI.particles.ParticleContainer || PIXI.ParticleContainer,
	ticker = PIXI.ticker.shared;

/**
 * A particle emitter.
 * @memberof PIXI.particles
 * @class Emitter
 * @constructor
 * @param {PIXI.DisplayObjectContainer} particleParent The display object to add the
 *                                                     particles to.
 * @param {Array|PIXI.Texture|String} [particleImages] A texture or array of textures to use
 *                                                     for the particles. Strings will be turned
 *                                                     into textures via Texture.fromImage().
 * @param {Object} [config] A configuration object containing settings for the emitter.
 * @param {Boolean} [config.emit=true] If config.emit is explicitly passed as false, the Emitter
 *                                     will start disabled.
 * @param {Boolean} [config.autoUpdate=false] If config.emit is explicitly passed as true, the Emitter
 *                                     will automatically call update via the PIXI shared ticker.
 */
var Emitter = function(particleParent, particleImages, config)
{
	/**
	 * The constructor used to create new particles. The default is
	 * the built in particle class.
	 * @property {Function} _particleConstructor
	 * @private
	 */
	this._particleConstructor = Particle;
	//properties for individual particles
	/**
	 * An array of PIXI Texture objects.
	 * @property {Array} particleImages
	 */
	this.particleImages = null;
	/**
	 * The starting alpha of all particles.
	 * @property {Number} startAlpha
	 * @default 1
	 */
	this.startAlpha = 1;
	/**
	 * The ending alpha of all particles.
	 * @property {Number} endAlpha
	 * @default 1
	 */
	this.endAlpha = 1;
	/**
	 * The starting speed of all particles.
	 * @property {Number} startSpeed
	 * @default 0
	 */
	this.startSpeed = 0;
	/**
	 * The ending speed of all particles.
	 * @property {Number} endSpeed
	 * @default 0
	 */
	this.endSpeed = 0;
	/**
	 * A minimum multiplier for the speed of a particle at both start and
	 * end. A value between minimumSpeedMultiplier and 1 is randomly generated
	 * and multiplied with startSpeed and endSpeed to provide the actual
	 * startSpeed and endSpeed for each particle.
	 * @property {Number} minimumSpeedMultiplier
	 * @default 1
	 */
	this.minimumSpeedMultiplier = 1;
	/**
	 * Acceleration to apply to particles. Using this disables
	 * any interpolation of particle speed. If the particles do
	 * not have a rotation speed, then they will be rotated to
	 * match the direction of travel.
	 * @property {PIXI.Point} acceleration
	 * @default null
	 */
	this.acceleration = null;
	/**
	 * The maximum speed allowed for accelerating particles. Negative values, values of 0 or NaN
	 * will disable the maximum speed.
	 * @property {Number} maxSpeed
	 * @default NaN
	 */
	this.maxSpeed = NaN;
	/**
	 * The starting scale of all particles.
	 * @property {Number} startScale
	 * @default 1
	 */
	this.startScale = 1;
	/**
	 * The ending scale of all particles.
	 * @property {Number} endScale
	 * @default 1
	 */
	this.endScale = 1;
	/**
	 * A minimum multiplier for the scale of a particle at both start and
	 * end. A value between minimumScaleMultiplier and 1 is randomly generated
	 * and multiplied with startScale and endScale to provide the actual
	 * startScale and endScale for each particle.
	 * @property {Number} minimumScaleMultiplier
	 * @default 1
	 */
	this.minimumScaleMultiplier = 1;
	/**
	 * The starting color of all particles, as red, green, and blue uints from 0-255.
	 * @property {Array} startColor
	 */
	this.startColor = null;
	/**
	 * The ending color of all particles, as red, green, and blue uints from 0-255.
	 * @property {Array} endColor
	 */
	this.endColor = null;
	/**
	 * The minimum lifetime for a particle, in seconds.
	 * @property {Number} minLifetime
	 */
	this.minLifetime = 0;
	/**
	 * The maximum lifetime for a particle, in seconds.
	 * @property {Number} maxLifetime
	 */
	this.maxLifetime = 0;
	/**
	 * The minimum start rotation for a particle, in degrees. This value
	 * is ignored if the spawn type is "burst" or "arc".
	 * @property {Number} minStartRotation
	 */
	this.minStartRotation = 0;
	/**
	 * The maximum start rotation for a particle, in degrees. This value
	 * is ignored if the spawn type is "burst" or "arc".
	 * @property {Number} maxStartRotation
	 */
	this.maxStartRotation = 0;
	/**
	 * If no particle rotation should occur. Starting rotation will still
	 * affect the direction in which particles move. If the rotation speed
	 * is set, then this will be ignored.
	 * @property {Boolean} maxStartRotation
	 */
	this.noRotation = false;
	/**
	 * The minimum rotation speed for a particle, in degrees per second.
	 * This only visually spins the particle, it does not change direction
	 * of movement.
	 * @property {Number} minRotationSpeed
	 */
	this.minRotationSpeed = 0;
	/**
	 * The maximum rotation speed for a particle, in degrees per second.
	 * This only visually spins the particle, it does not change direction
	 * of movement.
	 * @property {Number} maxRotationSpeed
	 */
	this.maxRotationSpeed = 0;
	/**
	 * The blend mode for all particles, as named by PIXI.blendModes.
	 * @property {int} particleBlendMode
	 */
	this.particleBlendMode = 0;
	/**
	 * An easing function for nonlinear interpolation of values. Accepts a single
	 * parameter of time as a value from 0-1, inclusive. Expected outputs are values
	 * from 0-1, inclusive.
	 * @property {Function} customEase
	 */
	this.customEase = null;
	/**
	 *	Extra data for use in custom particles. The emitter doesn't look inside, but
	 *	passes it on to the particle to use in init().
	 *	@property {Object} extraData
	 */
	this.extraData = null;
	//properties for spawning particles
	/**
	 * Time between particle spawns in seconds.
	 * @property {Number} _frequency
	 * @private
	 */
	this._frequency = 1;
	/**
	 * Maximum number of particles to keep alive at a time. If this limit
	 * is reached, no more particles will spawn until some have died.
	 * @property {int} maxParticles
	 * @default 1000
	 */
	this.maxParticles = 1000;
	/**
	 * The amount of time in seconds to emit for before setting emit to false.
	 * A value of -1 is an unlimited amount of time.
	 * @property {Number} emitterLifetime
	 * @default -1
	 */
	this.emitterLifetime = -1;
	/**
	 * Position at which to spawn particles, relative to the emitter's owner's origin.
	 * For example, the flames of a rocket travelling right might have a spawnPos
	 * of {x:-50, y:0}.
	 * to spawn at the rear of the rocket.
	 * To change this, use updateSpawnPos().
	 * @property {PIXI.Point} spawnPos
	 * @readOnly
	 */
	this.spawnPos = null;
	/**
	 * How the particles will be spawned. Valid types are "point", "rectangle",
	 * "circle", "burst", "ring".
	 * @property {String} spawnType
	 * @readOnly
	 */
	this.spawnType = null;
	/**
	 * A reference to the emitter function specific to the spawn type.
	 * @property {Function} _spawnFunc
	 * @private
	 */
	this._spawnFunc = null;
	/**
	 * A rectangle relative to spawnPos to spawn particles inside if the spawn type is "rect".
	 * @property {PIXI.Rectangle} spawnRect
	 */
	this.spawnRect = null;
	/**
	 * A circle relative to spawnPos to spawn particles inside if the spawn type is "circle".
	 * @property {PIXI.Circle} spawnCircle
	 */
	this.spawnCircle = null;
	/**
	 * Number of particles to spawn each wave in a burst.
	 * @property {int} particlesPerWave
	 * @default 1
	 */
	this.particlesPerWave = 1;
	/**
	 * Spacing between particles in a burst. 0 gives a random angle for each particle.
	 * @property {Number} particleSpacing
	 * @default 0
	 */
	this.particleSpacing = 0;
	/**
	 * Angle at which to start spawning particles in a burst.
	 * @property {Number} angleStart
	 * @default 0
	 */
	this.angleStart = 0;
	/**
	 * Rotation of the emitter or emitter's owner in degrees. This is added to
	 * the calculated spawn angle.
	 * To change this, use rotate().
	 * @property {Number} rotation
	 * @default 0
	 * @readOnly
	 */
	this.rotation = 0;
	/**
	 * The world position of the emitter's owner, to add spawnPos to when
	 * spawning particles. To change this, use updateOwnerPos().
	 * @property {PIXI.Point} ownerPos
	 * @default {x:0, y:0}
	 * @readOnly
	 */
	this.ownerPos = null;
	/**
	 * The origin + spawnPos in the previous update, so that the spawn position
	 * can be interpolated to space out particles better.
	 * @property {PIXI.Point} _prevEmitterPos
	 * @private
	 */
	this._prevEmitterPos = null;
	/**
	 * If _prevEmitterPos is valid, to prevent interpolation on the first update
	 * @property {Boolean} _prevPosIsValid
	 * @private
	 * @default false
	 */
	this._prevPosIsValid = false;
	/**
	 * If either ownerPos or spawnPos has changed since the previous update.
	 * @property {Boolean} _posChanged
	 * @private
	 */
	this._posChanged = false;
	/**
	 * If the parent is a ParticleContainer from Pixi V3
	 * @property {Boolean} _parentIsPC
	 * @private
	 */
	this._parentIsPC = false;
	/**
	 * The display object to add particles to.
	 * @property {PIXI.DisplayObjectContainer} _parent
	 * @private
	 */
	this._parent = null;
	/**
	 * If particles should be added at the back of the display list instead of the front.
	 * @property {Boolean} addAtBack
	 */
	this.addAtBack = false;
	/**
	 * The current number of active particles.
	 * @property {Number} particleCount
	 * @readOnly
	 */
	this.particleCount = 0;
	/**
	 * If particles should be emitted during update() calls. Setting this to false
	 * stops new particles from being created, but allows existing ones to die out.
	 * @property {Boolean} _emit
	 * @private
	 */
	this._emit = false;
	/**
	 * The timer for when to spawn particles in seconds, where numbers less
	 * than 0 mean that particles should be spawned.
	 * @property {Number} _spawnTimer
	 * @private
	 */
	this._spawnTimer = 0;
	/**
	 * The life of the emitter in seconds.
	 * @property {Number} _emitterLife
	 * @private
	 */
	this._emitterLife = -1;
	/**
	 * The particles that are active and on the display list. This is the first particle in a
	 * linked list.
	 * @property {Particle} _activeParticlesFirst
	 * @private
	 */
	this._activeParticlesFirst = null;
	/**
	 * The particles that are active and on the display list. This is the last particle in a
	 * linked list.
	 * @property {Particle} _activeParticlesLast
	 * @private
	 */
	this._activeParticlesLast = null;
	/**
	 * The particles that are not currently being used. This is the first particle in a
	 * linked list.
	 * @property {Particle} _poolFirst
	 * @private
	 */
	this._poolFirst = null;
	/**
	 * The original config object that this emitter was initialized with.
	 * @property {Object} _origConfig
	 * @private
	 */
	this._origConfig = null;
	/**
	 * The original particle image data that this emitter was initialized with.
	 * @property {PIXI.Texture|Array|String} _origArt
	 * @private
	 */
	this._origArt = null;
	/**
	 * If the update function is called automatically from the shared ticker.
	 * Setting this to false requires calling the update function manually.
	 * @property {Boolean} _autoUpdate
	 * @private
	 */
	this._autoUpdate = false;
	/**
	 * If the emitter should destroy itself when all particles have died out. This is set by
	 * playOnceAndDestroy();
	 * @property {Boolean} _destroyWhenComplete
	 * @private
	 */
	this._destroyWhenComplete = false;

	//set the initial parent
	this.parent = particleParent;

	if(particleImages && config)
		this.init(particleImages, config);

	//save often used functions on the instance instead of the prototype for better speed
	this.recycle = this.recycle;
	this.update = this.update;
	this.rotate = this.rotate;
	this.updateSpawnPos = this.updateSpawnPos;
	this.updateOwnerPos = this.updateOwnerPos;
};

// Reference to the prototype
var p = Emitter.prototype = {};

var helperPoint = new PIXI.Point();

/**
 * Time between particle spawns in seconds. If this value is not a number greater than 0,
 * it will be set to 1 (particle per second) to prevent infinite loops.
 * @member {Number} PIXI.particles.Emitter#frequency
 */
Object.defineProperty(p, "frequency",
{
	get: function() { return this._frequency; },
	set: function(value)
	{
		//do some error checking to prevent infinite loops
		if(typeof value == "number" && value > 0)
			this._frequency = value;
		else
			this._frequency = 1;
	}
});

/**
 * The constructor used to create new particles. The default is
 * the built in Particle class. Setting this will dump any active or
 * pooled particles, if the emitter has already been used.
 * @member {Function} PIXI.particles.Emitter#particleConstructor
 */
Object.defineProperty(p, "particleConstructor",
{
	get: function() { return this._particleConstructor; },
	set: function(value)
	{
		if(value != this._particleConstructor)
		{
			this._particleConstructor = value;
			//clean up existing particles
			this.cleanup();
			//scrap all the particles
			for (var particle = this._poolFirst; particle; particle = particle.next)
			{
				particle.destroy();
			}
			this._poolFirst = null;
			//re-initialize the emitter so that the new constructor can do anything it needs to
			if(this._origConfig && this._origArt)
				this.init(this._origArt, this._origConfig);
		}
	}
});

/**
* The display object to add particles to. Settings this will dump any active particles.
* @member {PIXI.DisplayObjectContainer} PIXI.particles.Emitter#parent
*/
Object.defineProperty(p, "parent",
{
	get: function() { return this._parent; },
	set: function(value)
	{
		//if our previous parent was a ParticleContainer, then we need to remove
		//pooled particles from it
		if (this._parentIsPC) {
			for (var particle = this._poolFirst; particle; particle = particle.next)
			{
				if(particle.parent)
					particle.parent.removeChild(particle);
			}
		}
		this.cleanup();
		this._parent = value;
		this._parentIsPC = ParticleContainer && value && value instanceof ParticleContainer;
	}
});

/**
 * Sets up the emitter based on the config settings.
 * @method PIXI.particles.Emitter#init
 * @param {Array|PIXI.Texture} art A texture or array of textures to use for the particles.
 * @param {Object} config A configuration object containing settings for the emitter.
 */
p.init = function(art, config)
{
	if(!art || !config)
		return;
	//clean up any existing particles
	this.cleanup();

	//store the original config and particle images, in case we need to re-initialize
	//when the particle constructor is changed
	this._origConfig = config;
	this._origArt = art;

	//set up the array of data, also ensuring that it is an array
	art = Array.isArray(art) ? art.slice() : [art];
	//run the art through the particle class's parsing function
	var partClass = this._particleConstructor;
	this.particleImages = partClass.parseArt ? partClass.parseArt(art) : art;
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
		this.minimumSpeedMultiplier = config.speed.minimumSpeedMultiplier || 1;
	}
	else
	{
		this.minimumSpeedMultiplier = 1;
		this.startSpeed = this.endSpeed = 0;
	}
	//set up acceleration
	var acceleration = config.acceleration;
	if(acceleration && (acceleration.x || acceleration.y))
	{
		this.endSpeed = this.startSpeed;
		this.acceleration = new PIXI.Point(acceleration.x, acceleration.y);
		this.maxSpeed = config.maxSpeed || NaN;
	}
	else
		this.acceleration = new PIXI.Point();
	//set up the scale
	if (config.scale)
	{
		this.startScale = config.scale.start;
		this.endScale = config.scale.end;
		this.minimumScaleMultiplier = config.scale.minimumScaleMultiplier || 1;
	}
	else
		this.startScale = this.endScale = this.minimumScaleMultiplier = 1;
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
	if (config.noRotation &&
		(this.minStartRotation || this.maxStartRotation))
	{
		this.noRotation = !!config.noRotation;
	}
	else
		this.noRotation = false;
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
	//get the blend mode
	this.particleBlendMode = ParticleUtils.getBlendMode(config.blendMode);
	//use the custom ease if provided
	if (config.ease)
	{
		this.customEase = typeof config.ease == "function" ?
													config.ease :
													ParticleUtils.generateEase(config.ease);
	}
	else
		this.customEase = null;
	//set up the extra data, running it through the particle class's parseData function.
	if(partClass.parseData)
		this.extraData = partClass.parseData(config.extraData);
	else
		this.extraData = config.extraData || null;
	//////////////////////////
	// Emitter Properties   //
	//////////////////////////
	//reset spawn type specific settings
	this.spawnRect = this.spawnCircle = null;
	this.particlesPerWave = 1;
	this.particleSpacing = 0;
	this.angleStart = 0;
	var spawnCircle;
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
			spawnCircle = config.spawnCircle;
			this.spawnCircle = new PIXI.Circle(spawnCircle.x, spawnCircle.y, spawnCircle.r);
			break;
		case "ring":
			this.spawnType = "ring";
			this._spawnFunc = this._spawnRing;
			spawnCircle = config.spawnCircle;
			this.spawnCircle = new PIXI.Circle(spawnCircle.x, spawnCircle.y, spawnCircle.r);
			this.spawnCircle.minRadius = spawnCircle.minR;
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
	this.emit = config.emit === undefined ? true : !!config.emit;
	this.autoUpdate = config.autoUpdate === undefined ? false : !!config.autoUpdate;
};

/**
 * Recycles an individual particle.
 * @method PIXI.particles.Emitter#recycle
 * @param {Particle} particle The particle to recycle.
 * @private
 */
p.recycle = function(particle)
{
	if(particle.next)
		particle.next.prev = particle.prev;
	if(particle.prev)
		particle.prev.next = particle.next;
	if(particle == this._activeParticlesLast)
		this._activeParticlesLast = particle.prev;
	if(particle == this._activeParticlesFirst)
		this._activeParticlesFirst = particle.next;
	//add to pool
	particle.prev = null;
	particle.next = this._poolFirst;
	this._poolFirst = particle;
	//remove child from display, or make it invisible if it is in a ParticleContainer
	if(this._parentIsPC)
	{
		particle.alpha = 0;
		particle.visible = false;
	}
	else
	{
		if(particle.parent)
			particle.parent.removeChild(particle);
	}
	//decrease count
	--this.particleCount;
};

/**
 * Sets the rotation of the emitter to a new value.
 * @method PIXI.particles.Emitter#rotate
 * @param {Number} newRot The new rotation, in degrees.
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
 * Changes the spawn position of the emitter.
 * @method PIXI.particles.Emitter#updateSpawnPos
 * @param {Number} x The new x value of the spawn position for the emitter.
 * @param {Number} y The new y value of the spawn position for the emitter.
 */
p.updateSpawnPos = function(x, y)
{
	this._posChanged = true;
	this.spawnPos.x = x;
	this.spawnPos.y = y;
};

/**
 * Changes the position of the emitter's owner. You should call this if you are adding
 * particles to the world display object that your emitter's owner is moving around in.
 * @method PIXI.particles.Emitter#updateOwnerPos
 * @param {Number} x The new x value of the emitter's owner.
 * @param {Number} y The new y value of the emitter's owner.
 */
p.updateOwnerPos = function(x, y)
{
	this._posChanged = true;
	this.ownerPos.x = x;
	this.ownerPos.y = y;
};

/**
 * Prevents emitter position interpolation in the next update.
 * This should be used if you made a major position change of your emitter's owner
 * that was not normal movement.
 * @method PIXI.particles.Emitter#resetPositionTracking
 */
p.resetPositionTracking = function()
{
	this._prevPosIsValid = false;
};

/**
 * If particles should be emitted during update() calls. Setting this to false
 * stops new particles from being created, but allows existing ones to die out.
 * @member {Boolean} PIXI.particles.Emitter#emit
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
 * If the update function is called automatically from the shared ticker.
 * Setting this to false requires calling the update function manually.
 * @member {Boolean} PIXI.particles.Emitter#autoUpdate
 */
Object.defineProperty(p, "autoUpdate",
{
	get: function() { return this._autoUpdate; },
	set: function(value)
	{
		if (this._autoUpdate && !value)
		{
			ticker.remove(this.update, this);
		}
		else if (!this._autoUpdate && value)
		{
			ticker.add(this.update, this);
		}
		this._autoUpdate = !!value;
	}
});

/**
 * Starts emitting particles, sets autoUpdate to true, and sets up the Emitter to destroy itself
 * when particle emission is complete.
 * @method PIXI.particles.Emitter#playOnceAndDestroy
 */
p.playOnceAndDestroy = function()
{
	this.autoUpdate = true;
	this.emit = true;
	this._destroyWhenComplete = true;
};

/**
 * Updates all particles spawned by this emitter and emits new ones.
 * @method PIXI.particles.Emitter#update
 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
 */
p.update = function(delta)
{
	if (this._autoUpdate)
	{
		delta = delta / PIXI.settings.TARGET_FPMS / 1000;
	}

	//if we don't have a parent to add particles to, then don't do anything.
	//this also works as a isDestroyed check
	if (!this._parent) return;
	//update existing particles
	var i, particle, next;
	for (particle = this._activeParticlesFirst; particle; particle = next)
	{
		next = particle.next;
		particle.update(delta);
	}
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
	if (this._emit)
	{
		//decrease spawn timer
		this._spawnTimer -= delta;
		//while _spawnTimer < 0, we have particles to spawn
		while(this._spawnTimer <= 0)
		{
			//determine if the emitter should stop spawning
			if(this._emitterLife > 0)
			{
				this._emitterLife -= this._frequency;
				if(this._emitterLife <= 0)
				{
					this._spawnTimer = 0;
					this._emitterLife = 0;
					this.emit = false;
					break;
				}
			}
			//determine if we have hit the particle limit
			if(this.particleCount >= this.maxParticles)
			{
				this._spawnTimer += this._frequency;
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
				//If the position has changed and this isn't the first spawn,
				//interpolate the spawn position
				var emitPosX, emitPosY;
				if (this._prevPosIsValid && this._posChanged)
				{
					//1 - _spawnTimer / delta, but _spawnTimer is negative
					var lerp = 1 + this._spawnTimer / delta;
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
				for(var len = Math.min(this.particlesPerWave, this.maxParticles - this.particleCount); i < len; ++i)
				{
					//create particle
					var p, rand;
					if(this._poolFirst)
					{
						p = this._poolFirst;
						this._poolFirst = this._poolFirst.next;
						p.next = null;
					}
					else
					{
						p = new this.particleConstructor(this);
					}

					//set a random texture if we have more than one
					if(this.particleImages.length > 1)
					{
						p.applyArt(this.particleImages.random());
					}
					else
					{
						//if they are actually the same texture, a standard particle
						//will quit early from the texture setting in setTexture().
						p.applyArt(this.particleImages[0]);
					}
					//set up the start and end values
					p.startAlpha = this.startAlpha;
					p.endAlpha = this.endAlpha;
					if(this.minimumSpeedMultiplier != 1)
					{
						rand = Math.random() * (1 - this.minimumSpeedMultiplier) + this.minimumSpeedMultiplier;
						p.startSpeed = this.startSpeed * rand;
						p.endSpeed = this.endSpeed * rand;
					}
					else
					{
						p.startSpeed = this.startSpeed;
						p.endSpeed = this.endSpeed;
					}
					p.acceleration.x = this.acceleration.x;
					p.acceleration.y = this.acceleration.y;
					p.maxSpeed = this.maxSpeed;
					if(this.minimumScaleMultiplier != 1)
					{
						rand = Math.random() * (1 - this.minimumScaleMultiplier) + this.minimumScaleMultiplier;
						p.startScale = this.startScale * rand;
						p.endScale = this.endScale * rand;
					}
					else
					{
						p.startScale = this.startScale;
						p.endScale = this.endScale;
					}
					p.startColor = this.startColor;
					p.endColor = this.endColor;
					//randomize the rotation speed
					if(this.minRotationSpeed == this.maxRotationSpeed)
						p.rotationSpeed = this.minRotationSpeed;
					else
						p.rotationSpeed = Math.random() * (this.maxRotationSpeed - this.minRotationSpeed) + this.minRotationSpeed;
					p.noRotation = this.noRotation;
					//set up the lifetime
					p.maxLife = lifetime;
					//set the blend mode
					p.blendMode = this.particleBlendMode;
					//set the custom ease, if any
					p.ease = this.customEase;
					//set the extra data, if any
					p.extraData = this.extraData;
					//call the proper function to handle rotation and position of particle
					this._spawnFunc(p, emitPosX, emitPosY, i);
					//initialize particle
					p.init();
					//update the particle by the time passed, so the particles are spread out properly
					p.update(-this._spawnTimer);//we want a positive delta, because a negative delta messes things up
					//add the particle to the display list
					if(!this._parentIsPC || !p.parent)
					{
						if (this.addAtBack)
							this._parent.addChildAt(p, 0);
						else
							this._parent.addChild(p);
					}
					else
					{
						//kind of hacky, but performance friendly
						//shuffle children to correct place
						var children = this._parent.children;
						//avoid using splice if possible
						if(children[0] == p)
							children.shift();
						else if(children[children.length-1] == p)
							children.pop();
						else
						{
							var index = children.indexOf(p);
							children.splice(index, 1);
						}
						if(this.addAtBack)
							children.unshift(p);
						else
							children.push(p);
					}
					//add particle to list of active particles
					if(this._activeParticlesLast)
					{
						this._activeParticlesLast.next = p;
						p.prev = this._activeParticlesLast;
						this._activeParticlesLast = p;
					}
					else
					{
						this._activeParticlesLast = this._activeParticlesFirst = p;
					}
					++this.particleCount;
				}
			}
			//increase timer and continue on to any other particles that need to be created
			this._spawnTimer += this._frequency;
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

	//if we are all done and should destroy ourselves, take care of that
	if (this._destroyWhenComplete && !this._emit && !this._activeParticlesFirst)
	{
		this.destroy();
	}
};

/**
 * Positions a particle for a point type emitter.
 * @method PIXI.particles.Emitter#_spawnPoint
 * @private
 * @param {Particle} p The particle to position and rotate.
 * @param {Number} emitPosX The emitter's x position
 * @param {Number} emitPosY The emitter's y position
 * @param {int} i The particle number in the current wave. Not used for this function.
 */
p._spawnPoint = function(p, emitPosX, emitPosY)
{
	//set the initial rotation/direction of the particle based on
	//starting particle angle and rotation of emitter
	if (this.minStartRotation == this.maxStartRotation)
		p.rotation = this.minStartRotation + this.rotation;
	else
		p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) + this.minStartRotation + this.rotation;
	//drop the particle at the emitter's position
	p.position.x = emitPosX;
	p.position.y = emitPosY;
};

/**
 * Positions a particle for a rectangle type emitter.
 * @method PIXI.particles.Emitter#_spawnRect
 * @private
 * @param {Particle} p The particle to position and rotate.
 * @param {Number} emitPosX The emitter's x position
 * @param {Number} emitPosY The emitter's y position
 * @param {int} i The particle number in the current wave. Not used for this function.
 */
p._spawnRect = function(p, emitPosX, emitPosY)
{
	//set the initial rotation/direction of the particle based on starting
	//particle angle and rotation of emitter
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
 * Positions a particle for a circle type emitter.
 * @method PIXI.particles.Emitter#_spawnCircle
 * @private
 * @param {Particle} p The particle to position and rotate.
 * @param {Number} emitPosX The emitter's x position
 * @param {Number} emitPosY The emitter's y position
 * @param {int} i The particle number in the current wave. Not used for this function.
 */
p._spawnCircle = function(p, emitPosX, emitPosY)
{
	//set the initial rotation/direction of the particle based on starting
	//particle angle and rotation of emitter
	if (this.minStartRotation == this.maxStartRotation)
		p.rotation = this.minStartRotation + this.rotation;
	else
		p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) +
					this.minStartRotation + this.rotation;
	//place the particle at a random radius in the circle
	helperPoint.x = Math.random() * this.spawnCircle.radius;
	helperPoint.y = 0;
	//rotate the point to a random angle in the circle
	ParticleUtils.rotatePoint(Math.random() * 360, helperPoint);
	//offset by the circle's center
	helperPoint.x += this.spawnCircle.x;
	helperPoint.y += this.spawnCircle.y;
	//rotate the point by the emitter's rotation
	if(this.rotation !== 0)
		ParticleUtils.rotatePoint(this.rotation, helperPoint);
	//set the position, offset by the emitter's position
	p.position.x = emitPosX + helperPoint.x;
	p.position.y = emitPosY + helperPoint.y;
};

/**
 * Positions a particle for a ring type emitter.
 * @method PIXI.particles.Emitter#_spawnRing
 * @private
 * @param {Particle} p The particle to position and rotate.
 * @param {Number} emitPosX The emitter's x position
 * @param {Number} emitPosY The emitter's y position
 * @param {int} i The particle number in the current wave. Not used for this function.
 */
p._spawnRing = function(p, emitPosX, emitPosY)
{
	var spawnCircle = this.spawnCircle;
	//set the initial rotation/direction of the particle based on starting
	//particle angle and rotation of emitter
	if (this.minStartRotation == this.maxStartRotation)
		p.rotation = this.minStartRotation + this.rotation;
	else
		p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) +
					this.minStartRotation + this.rotation;
	//place the particle at a random radius in the ring
	if(spawnCircle.minRadius == spawnCircle.radius)
	{
		helperPoint.x = Math.random() * (spawnCircle.radius - spawnCircle.minRadius) +
						spawnCircle.minRadius;
	}
	else
		helperPoint.x = spawnCircle.radius;
	helperPoint.y = 0;
	//rotate the point to a random angle in the circle
	var angle = Math.random() * 360;
	p.rotation += angle;
	ParticleUtils.rotatePoint(angle, helperPoint);
	//offset by the circle's center
	helperPoint.x += this.spawnCircle.x;
	helperPoint.y += this.spawnCircle.y;
	//rotate the point by the emitter's rotation
	if(this.rotation !== 0)
		ParticleUtils.rotatePoint(this.rotation, helperPoint);
	//set the position, offset by the emitter's position
	p.position.x = emitPosX + helperPoint.x;
	p.position.y = emitPosY + helperPoint.y;
};

/**
 * Positions a particle for a burst type emitter.
 * @method PIXI.particles.Emitter#_spawnBurst
 * @private
 * @param {Particle} p The particle to position and rotate.
 * @param {Number} emitPosX The emitter's x position
 * @param {Number} emitPosY The emitter's y position
 * @param {int} i The particle number in the current wave.
 */
p._spawnBurst = function(p, emitPosX, emitPosY, i)
{
	//set the initial rotation/direction of the particle based on spawn
	//angle and rotation of emitter
	if(this.particleSpacing === 0)
		p.rotation = Math.random() * 360;
	else
		p.rotation = this.angleStart + (this.particleSpacing * i) + this.rotation;
	//drop the particle at the emitter's position
	p.position.x = emitPosX;
	p.position.y = emitPosY;
};

/**
 * Kills all active particles immediately.
 * @method PIXI.particles.Emitter#cleanup
 */
p.cleanup = function()
{
	var particle, next;
	for (particle = this._activeParticlesFirst; particle; particle = next)
	{
		next = particle.next;
		this.recycle(particle);
		if(particle.parent)
			particle.parent.removeChild(particle);
	}
	this._activeParticlesFirst = this._activeParticlesLast = null;
	this.particleCount = 0;
};

/**
 * Destroys the emitter and all of its particles.
 * @method PIXI.particles.Emitter#destroy
 */
p.destroy = function()
{
	//make sure we aren't still listening to any tickers
	this.autoUpdate = false;
	//puts all active particles in the pool, and removes them from the particle parent
	this.cleanup();
	//wipe the pool clean
	var next;
	for (var particle = this._poolFirst; particle; particle = next)
	{
		//store next value so we don't lose it in our destroy call
		next = particle.next;
		particle.destroy();
	}
	this._poolFirst = this._parent = this.particleImages = this.spawnPos = this.ownerPos =
		this.startColor = this.endColor = this.customEase = null;
};

module.exports = Emitter;
},{"./Particle":3,"./ParticleUtils":4}],3:[function(require,module,exports){
var ParticleUtils = require("./ParticleUtils");
var Sprite = PIXI.Sprite;

/**
 * An individual particle image. You shouldn't have to deal with these.
 * @memberof PIXI.particles
 * @class Particle
 * @extends PIXI.Sprite
 * @constructor
 * @param {PIXI.particles.Emitter} emitter The emitter that controls this particle.
 */
var Particle = function(emitter)
{
	//start off the sprite with a blank texture, since we are going to replace it
	//later when the particle is initialized.
	Sprite.call(this);

	/**
	 * The emitter that controls this particle.
	 * @property {Emitter} emitter
	 */
	this.emitter = emitter;
	//particles should be centered
	this.anchor.x = this.anchor.y = 0.5;
	/**
	 * The velocity of the particle. Speed may change, but the angle also
	 * contained in velocity is constant.
	 * @property {PIXI.Point} velocity
	 */
	this.velocity = new PIXI.Point();
	/**
	 * The maximum lifetime of this particle, in seconds.
	 * @property {Number} maxLife
	 */
	this.maxLife = 0;
	/**
	 * The current age of the particle, in seconds.
	 * @property {Number} age
	 */
	this.age = 0;
	/**
	 * A simple easing function to be applied to all properties that
	 * are being interpolated.
	 * @property {Function} ease
	 */
	this.ease = null;
	/**
	 * Extra data that the emitter passes along for custom particles.
	 * @property {Object} extraData
	 */
	this.extraData = null;
	/**
	 * The alpha of the particle at the start of its life.
	 * @property {Number} startAlpha
	 */
	this.startAlpha = 0;
	/**
	 * The alpha of the particle at the end of its life.
	 * @property {Number} endAlpha
	 */
	this.endAlpha = 0;
	/**
	 * The speed of the particle at the start of its life.
	 * @property {Number} startSpeed
	 */
	this.startSpeed = 0;
	/**
	 * The speed of the particle at the end of its life.
	 * @property {Number} endSpeed
	 */
	this.endSpeed = 0;
	/**
	 * Acceleration to apply to the particle.
	 * @property {PIXI.Point} accleration
	 */
	this.acceleration = new PIXI.Point();
	/**
	 * The maximum speed allowed for accelerating particles. Negative values, values of 0 or NaN
	 * will disable the maximum speed.
	 * @property {Number} maxSpeed
	 * @default NaN
	 */
	this.maxSpeed = NaN;
	/**
	 * The scale of the particle at the start of its life.
	 * @property {Number} startScale
	 */
	this.startScale = 0;
	/**
	 * The scale of the particle at the start of its life.
	 * @property {Number} endScale
	 */
	this.endScale = 0;
	/**
	 * The tint of the particle at the start of its life.
	 * @property {Array} startColor
	 */
	this.startColor = null;
	/**
	 * The red tint of the particle at the start of its life.
	 * This is pulled from startColor in init().
	 * @property {uint} _sR
	 * @private
	 */
	this._sR = 0;
	/**
	 * The green tint of the particle at the start of its life.
	 * This is pulled from startColor in init().
	 * @property {uint} _sG
	 * @private
	 */
	this._sG = 0;
	/**
	 * The blue tint of the particle at the start of its life.
	 * This is pulled from startColor in init().
	 * @property {uint} _sB
	 * @private
	 */
	this._sB = 0;
	/**
	 * The tint of the particle at the start of its life.
	 * @property {Array} endColor
	 */
	this.endColor = null;
	/**
	 * The red tint of the particle at the end of its life.
	 * This is pulled from endColor in init().
	 * @property {uint} _eR
	 * @private
	 */
	this._eR = 0;
	/**
	 * The green tint of the particle at the end of its life.
	 * This is pulled from endColor in init().
	 * @property {uint} _sG
	 * @private
	 */
	this._eG = 0;
	/**
	 * The blue tint of the particle at the end of its life.
	 * This is pulled from endColor in init().
	 * @property {uint} _sB
	 * @private
	 */
	this._eB = 0;
	/**
	 * If alpha should be interpolated at all.
	 * @property {Boolean} _doAlpha
	 * @private
	 */
	this._doAlpha = false;
	/**
	 * If scale should be interpolated at all.
	 * @property {Boolean} _doScale
	 * @private
	 */
	this._doScale = false;
	/**
	 * If speed should be interpolated at all.
	 * @property {Boolean} _doSpeed
	 * @private
	 */
	this._doSpeed = false;
	/**
	 * If acceleration should be handled at all. _doSpeed is mutually exclusive with this,
	 * and _doSpeed gets priority.
	 * @property {Boolean} _doAcceleration
	 * @private
	 */
	this._doAcceleration = false;
	/**
	 * If color should be interpolated at all.
	 * @property {Boolean} _doColor
	 * @private
	 */
	this._doColor = false;
	/**
	 * If normal movement should be handled. Subclasses wishing to override movement
	 * can set this to false in init().
	 * @property {Boolean} _doNormalMovement
	 * @private
	 */
	this._doNormalMovement = false;
	/**
	 * One divided by the max life of the particle, saved for slightly faster math.
	 * @property {Number} _oneOverLife
	 * @private
	 */
	this._oneOverLife = 0;

	/**
	 * Reference to the next particle in the list.
	 * @property {Particle} next
	 * @private
	 */
	this.next = null;

	/**
	 * Reference to the previous particle in the list.
	 * @property {Particle} prev
	 * @private
	 */
	this.prev = null;

	//save often used functions on the instance instead of the prototype for better speed
	this.init = this.init;
	this.Particle_init = this.Particle_init;
	this.update = this.update;
	this.Particle_update = this.Particle_update;
	this.applyArt = this.applyArt;
	this.kill = this.kill;
};

// Reference to the prototype
var p = Particle.prototype = Object.create(Sprite.prototype);

/**
 * Initializes the particle for use, based on the properties that have to
 * have been set already on the particle.
 * @method PIXI.particles.Particle#init
 */
/**
 * A reference to init, so that subclasses can access it without the penalty of Function.call()
 * @method PIXI.particles.Particle#Particle_init
 * @protected
 */
p.init = p.Particle_init = function()
{
	//reset the age
	this.age = 0;
	//set up the velocity based on the start speed and rotation
	this.velocity.x = this.startSpeed;
	this.velocity.y = 0;
	ParticleUtils.rotatePoint(this.rotation, this.velocity);
	if (this.noRotation)
	{
		this.rotation = 0;
	}
	else
	{
		//convert rotation to Radians from Degrees
		this.rotation *= ParticleUtils.DEG_TO_RADS;
	}
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
	this._doAcceleration = this.acceleration.x !== 0 || this.acceleration.y !== 0;
	//_doNormalMovement can be cancelled by subclasses
	this._doNormalMovement = this._doSpeed || this.startSpeed !== 0 || this._doAcceleration;
	//save our lerp helper
	this._oneOverLife = 1 / this.maxLife;
	//set the inital color
	this.tint = ParticleUtils.combineRGBComponents(this._sR, this._sG, this._sB);
	//ensure visibility
	this.visible = true;
};

/**
 * Sets the texture for the particle. This can be overridden to allow
 * for an animated particle.
 * @method PIXI.particles.Particle#applyArt
 * @param {PIXI.Texture} art The texture to set.
 */
p.applyArt = function(art)
{
	this.texture = art || ParticleUtils.EMPTY_TEXTURE;
};

/**
 * Updates the particle.
 * @method PIXI.particles.Particle#update
 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
 * @return {Number} The standard interpolation multiplier (0-1) used for all relevant particle
 *                   properties. A value of -1 means the particle died of old age instead.
 */
/**
 * A reference to update so that subclasses can access the original without the overhead
 * of Function.call().
 * @method PIXI.particles.Particle#Particle_update
 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
 * @return {Number} The standard interpolation multiplier (0-1) used for all relevant particle
 *                   properties. A value of -1 means the particle died of old age instead.
 * @protected
 */
p.update = p.Particle_update = function(delta)
{
	//increase age
	this.age += delta;
	//recycle particle if it is too old
	if(this.age >= this.maxLife)
	{
		this.kill();
		return -1;
	}

	//determine our interpolation value
	var lerp = this.age * this._oneOverLife;//lifetime / maxLife;
	if (this.ease)
	{
		if(this.ease.length == 4)
		{
			//the t, b, c, d parameters that some tween libraries use
			//(time, initial value, end value, duration)
			lerp = this.ease(lerp, 0, 1, 1);
		}
		else
		{
			//the simplified version that we like that takes
			//one parameter, time from 0-1. TweenJS eases provide this usage.
			lerp = this.ease(lerp);
		}
	}

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
	if(this._doNormalMovement)
	{
		//interpolate speed
		if (this._doSpeed)
		{
			var speed = (this.endSpeed - this.startSpeed) * lerp + this.startSpeed;
			ParticleUtils.normalize(this.velocity);
			ParticleUtils.scaleBy(this.velocity, speed);
		}
		else if(this._doAcceleration)
		{
			this.velocity.x += this.acceleration.x * delta;
			this.velocity.y += this.acceleration.y * delta;
			if (this.maxSpeed)
			{
				var currentSpeed = ParticleUtils.length(this.velocity);
				//if we are going faster than we should, clamp at the max speed
				//DO NOT recalculate vector length
				if (currentSpeed > this.maxSpeed)
				{
					ParticleUtils.scaleBy(this.velocity, this.maxSpeed / currentSpeed);
				}
			}
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
	else if(this.acceleration && !this.noRotation)
	{
		this.rotation = Math.atan2(this.velocity.y, this.velocity.x);// + Math.PI / 2;
	}
	return lerp;
};

/**
 * Kills the particle, removing it from the display list
 * and telling the emitter to recycle it.
 * @method PIXI.particles.Particle#kill
 */
p.kill = function()
{
	this.emitter.recycle(this);
};

p.Sprite_Destroy = Sprite.prototype.destroy;
/**
 * Destroys the particle, removing references and preventing future use.
 * @method PIXI.particles.Particle#destroy
 */
p.destroy = function()
{
	if (this.parent)
		this.parent.removeChild(this);
	if (this.Sprite_Destroy)
		this.Sprite_Destroy();
	this.emitter = this.velocity = this.startColor = this.endColor = this.ease =
		this.next = this.prev = null;
};

/**
 * Checks over the art that was passed to the Emitter's init() function, to do any special
 * modifications to prepare it ahead of time.
 * @method PIXI.particles.Particle.parseArt
 * @static
 * @param  {Array} art The array of art data. For Particle, it should be an array of Textures.
 *                     Any strings in the array will be converted to Textures via
 *                     Texture.fromImage().
 * @return {Array} The art, after any needed modifications.
 */
Particle.parseArt = function(art)
{
	//convert any strings to Textures.
	var i;
	for(i = art.length; i >= 0; --i)
	{
		if(typeof art[i] == "string")
			art[i] = PIXI.Texture.fromImage(art[i]);
	}
	//particles from different base textures will be slower in WebGL than if they
	//were from one spritesheet
	if(ParticleUtils.verbose)
	{
		for(i = art.length - 1; i > 0; --i)
		{
			if(art[i].baseTexture != art[i - 1].baseTexture)
			{
				if (window.console)
					console.warn("PixiParticles: using particle textures from different images may hinder performance in WebGL");
				break;
			}
		}
	}

	return art;
};

/**
 * Parses extra emitter data to ensure it is set up for this particle class.
 * Particle does nothing to the extra data.
 * @method PIXI.particles.Particle.parseData
 * @static
 * @param  {Object} extraData The extra data from the particle config.
 * @return {Object} The parsed extra data.
 */
Particle.parseData = function(extraData)
{
	return extraData;
};

module.exports = Particle;
},{"./ParticleUtils":4}],4:[function(require,module,exports){
"use strict";

var BLEND_MODES = PIXI.BLEND_MODES || PIXI.blendModes;
var Texture = PIXI.Texture;

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
 * "AARRGGBB", or "RRGGBB" to an array of ints of 0-255 or Numbers from 0-1, as
 * [r, g, b, (a)].
 * @method PIXI.particles.ParticleUtils.hexToRGB
 * @param {String} color The input color string.
 * @param {Array} output An array to put the output in. If omitted, a new array is created.
 * @return The array of numeric color values.
 * @static
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

module.exports = ParticleUtils;
},{}],5:[function(require,module,exports){
"use strict";

var ParticleUtils = require("./ParticleUtils"),
	Particle = require("./Particle");

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
 * @method PIXI.particles.PathParticle#init
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
 * @method PIXI.particles.PathParticle~parsePath
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
 * @method PIXI.particles.PathParticle#update
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

p.Particle_destroy = Particle.prototype.destroy;
/**
 * Destroys the particle, removing references and preventing future use.
 * @method PIXI.particles.PathParticle#destroy
 */
p.destroy = function()
{
	this.Particle_destroy();
	this.path = this.initialPosition = null;
};

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
PathParticle.parseArt = function(art)
{
	return Particle.parseArt(art);
};

/**
 * Parses extra emitter data to ensure it is set up for this particle class.
 * PathParticle checks for the existence of path data, and parses the path data for use
 * by particle instances.
 * @method PIXI.particles.PathParticle.parseData
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
};

module.exports = PathParticle;
},{"./Particle":3,"./ParticleUtils":4}],6:[function(require,module,exports){
//Nothing to deprecate right now!
},{}],7:[function(require,module,exports){
require("./polyfills.js");
exports.ParticleUtils = require("./ParticleUtils.js");
exports.Particle = require("./Particle.js");
exports.Emitter = require("./Emitter.js");
exports.PathParticle = require("./PathParticle.js");
exports.AnimatedParticle = require("./AnimatedParticle.js");
require("./deprecation.js");
},{"./AnimatedParticle.js":1,"./Emitter.js":2,"./Particle.js":3,"./ParticleUtils.js":4,"./PathParticle.js":5,"./deprecation.js":6,"./polyfills.js":8}],8:[function(require,module,exports){
/**
 * Add methods to Array
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 * @class Array
 */

/**
 * Shuffles the array
 * @method shuffle
 * @return {Array} The array, for chaining calls.
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
 * Get a random item from an array
 * @method random
 * @return {*} The random item
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
},{}],9:[function(require,module,exports){
"use strict";

// Check for window, fallback to global
var global = typeof window !== 'undefined' ? window : GLOBAL;

//ensure that the particles namespace exist - PIXI 4 creates it itself, PIXI 3 does not
if (!global.PIXI.particles) {
	global.PIXI.particles = {};
}

// Export for Node-compatible environments like Electron
if (typeof module !== 'undefined' && module.exports)
{
	// Attempt to require the pixi module
	if (typeof PIXI === 'undefined')
	{
		// Include the Pixi.js module
		require('pixi.js');
	}

	// Export the module
	module.exports = global.PIXI.particles || particles;
}
// If we're in the browser make sure PIXI is available
else if (typeof PIXI === 'undefined')
{
	throw "pixi-particles requires pixi.js to be loaded first";
}

// get the library itself
var particles = require('./particles');

// insert the lirbary into the particles namespace on PIXI
for (var prop in particles) {
	global.PIXI.particles[prop] = particles[prop];
}
},{"./particles":7,"pixi.js":undefined}]},{},[9])(9)
});


//# sourceMappingURL=pixi-particles.js.map
