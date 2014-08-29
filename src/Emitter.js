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
		*	The minimum spawn angle of all particles in degrees.
		*	This controls both movement direction and initial rotation
		*	@property {Number} minAngle
		*	@default 0
		*/
		this.minAngle = 0;
		/**
		*	The maximum spawn angle of all particles in degrees.
		*	This controls both movement direction and initial rotation
		*	@property {Number} maxAngle
		*	@default 0
		*/
		this.maxAngle = 0;
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
		*	Position at which to spawn particles, relative to the emitter's owner's origin.
		*	For example, the flames of a rocket travelling right might have a spawnPos of {x:-50, y:0}
		*	to spawn at the rear of the rocket.
		*	To change this, use updateSpawnPos().
		*	@property {PIXI.Point} spawnPos
		*	@readOnly
		*/
		this.spawnPos = null;
		/**
		*	Rotation of the emitter or emitter's owner in degreess. This is added to the calculated spawn angle.
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
		*	@property {Boolean} emit
		*/
		this.emit = false;
		/**
		*	The timer for when to spawn particles, where numbers less 
		*	than 0 mean that particles should be spawned.
		*	@property {Number} _spawnTimer
		*	@private
		*/
		this._spawnTimer = 0;
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
					Debug.warn("CloudKid Particles: using particle textures from different images may hinder performance in WebGL");
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
		//set up the angle for spawning particles in
		if(config.angle)
		{
			this.minAngle = config.angle.min;
			this.maxAngle = config.angle.max;
		}
		else
			this.minAngle = this.maxAngle = 0;
		//set the spawning frequency
		this.frequency = config.frequency;
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
	*	Updates all particles spawned by this emitter and emits new ones.
	*	@method update
	*	@param {Number} delta Time elapsed since the previous frame, in __seconds__.
	*/
	p.update = function(delta)
	{
		//update existing particles
		for(var i = this._activeParticles.length - 1; i >= 0; --i)
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
				//determine the particle lifetime
				var lifetime;
				if (this.minLifetime == this.maxLifetime)
					lifetime = this.minLifetime;
				else
					lifetime = Math.random() * (this.maxLifetime - this.minLifetime) + this.minLifetime;
				//only make the particle if it wouldn't immediately destroy itself
				if(-this._spawnTimer < lifetime)
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
					p.maxLife = lifetime;
					//set the initial rotation/direction of the particle based on spawn angle and rotation of emitter
					if (this.minAngle == this.maxAngle)
						p.rotation = this.minAngle + this.rotation;
					else
						p.rotation = Math.random() * (this.maxAngle - this.minAngle) + this.minAngle + this.rotation;
					//If the position has changed and this isn't the first spawn, interpolate the spawn position
					if (this._prevPosIsValid && this._posChanged)
					{
						var lerp = 1 + this._spawnTimer / delta;//1 - _spawnTimer / delta, but _spawnTimer is negative
						p.position.x = (curX - prevX) * lerp + prevX;
						p.position.y = (curY - prevY) * lerp + prevY;
					}
					else//otherwise just set to the spawn position
					{
						p.position.x = curX;
						p.position.y = curY;
					}
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
	*	Kills all active particles immedately.
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