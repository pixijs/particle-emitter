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
		//console.log("initialized particle with speed " + this.startSpeed + ", velocity: " + this.velocity);
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
			//console.log("particle with velocity " + this.velocity + " now has position " + this.position);
		}
		//interpolate color
		if (this._doColor)
		{
			var r = (this._eR - this._sR) * lerp + this._sR;
			var g = (this._eG - this._sG) * lerp + this._sG;
			var b = (this._eB - this._sB) * lerp + this._sB;
			this.tint = ParticleUtils.combineRGBComponents(r, g, b);
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