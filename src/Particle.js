/**
*  @module cloudkid
*/
(function(cloudkid, undefined) {

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
		var art = emitter.particleImages[0] instanceof PIXI.Texture ?
															[emitter.particleImages[0]] :
															emitter.particleImages[0];


        if(PIXI.MovieClip) PIXI.MovieClip.call(this, art);
        else PIXI.extras.MovieClip.call(this, art);

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
		*	Extra data that the emitter passes along for custom particles.
		*	@property {Object} extraData
		*/
		this.extraData = null;
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
		*	Acceleration to apply to the particle.
		*	@property {PIXI.Point} accleration
		*/
		this.acceleration = null;
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
		*	If normal movement should be handled. Subclasses wishing to override movement
		*	can set this to false in init().
		*	@property {Boolean} _doNormalMovement
		*	@private
		*/
		this._doNormalMovement = false;
		/**
		*	One divided by the max life of the particle, saved for slightly faster math.
		*	@property {Number} _oneOverLife
		*	@private
		*/
		this._oneOverLife = 0;
		
		//save often used functions on the instance instead of the prototype for better speed
		this.init = this.init;
		this.Particle_init = this.Particle_init;
		this.update = this.update;
		this.Particle_update = this.Particle_update;
		this.applyArt = this.applyArt;
		this.kill = this.kill;
	};

	// Reference to the prototype
	var p = Particle.prototype = Object.create(PIXI.extras.MovieClip.prototype);

	/**
	*	Initializes the particle for use, based on the properties that have to
	*	have been set already on the particle.
	*	@method init
	*/
	/**
	*	A reference to init, so that subclasses can access it without the penalty of Function.call()
	*	@method Particle_init
	*	@private
	*/
	p.init = p.Particle_init = function()
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
		//_doNormalMovement can be cancelled by subclasses
		this._doNormalMovement = this._doSpeed || this.startSpeed !== 0 || this.acceleration;
		//save our lerp helper
		this._oneOverLife = 1 / this.maxLife;
		//set the inital color
		this.tint = ParticleUtils.combineRGBComponents(this._sR, this._sG, this._sB);
	};

	/**
	*	Sets the texture for the particle. This can be overridden to allow
	*	for an animated particle.
	*	@method applyArt
	*	@param {PIXI.Texture} art The texture to set.
	*/
	p.applyArt = function(art)
	{
        if (PIXI.MovieClip) {
            this.setTexture(art);
        } else {
            //remove warning on PIXI 3
            this.texture = art;
        }
	};

	/**
	*	Updates the particle.
	*	@method update
	*	@param {Number} delta Time elapsed since the previous frame, in __seconds__.
	*	@return {Number} The standard interpolation multiplier (0-1) used for all relevant particle
	*                    properties. A value of -1 means the particle died of old age instead.
	*/
	/**
	*	A reference to update so that subclasses can access the original without the overhead
	*	of Function.call().
	*	@method Particle_update
	*	@param {Number} delta Time elapsed since the previous frame, in __seconds__.
	*	@return {Number} The standard interpolation multiplier (0-1) used for all relevant particle
	*                    properties. A value of -1 means the particle died of old age instead.
	*	@private
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
			else if(this.acceleration)
			{
				this.velocity.x += this.acceleration.x * delta;
				this.velocity.y += this.acceleration.y * delta;
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
		else if(this.acceleration)
		{
			this.rotation = Math.atan2(this.velocity.y, this.velocity.x);// + Math.PI / 2;
		}
		return lerp;
	};

	/**
	*	Kills the particle, removing it from the display list
	*	and telling the emitter to recycle it.
	*	@method kill
	*/
	p.kill = function()
	{
		this.emitter.recycle(this);
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

	cloudkid.Particle = Particle;

}(cloudkid));