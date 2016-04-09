/**
*  @module Pixi Particles
*  @namespace PIXI.particles
*/
(function(PIXI, undefined) {

	"use strict";

	var ParticleUtils = PIXI.particles.ParticleUtils;
	var Sprite = PIXI.Sprite;
	var EMPTY_TEXTURE;
	var useAPI3 = ParticleUtils.useAPI3;
	if(!useAPI3)
	{
		var canvas = document.createElement("canvas");
		canvas.width = canvas.height = 1;
		EMPTY_TEXTURE = PIXI.Texture.fromCanvas(canvas);
	}

	/**
	 * An individual particle image. You shouldn't have to deal with these.
	 * @class Particle
	 * @constructor
	 * @param {Emitter} emitter The emitter that controls this particle.
	 */
	var Particle = function(emitter)
	{
		//start off the sprite with a blank texture, since we are going to replace it
		//later when the particle is initialized. Pixi v2 requires a texture, v3 supplies a
		//blank texture for us.
		if(useAPI3)
		{
			Sprite.call(this);
			//remove PIXI v3 texture from empty texture to prevent memory leak
			//This should be fixed in v4, but doing this anyway shouldn't hurt anything
			this._texture.off('update', this._onTextureUpdate, this);
		}
		else
		{
			Sprite.call(this, EMPTY_TEXTURE);
			//remove PIXI v2 listener from empty texture to prevent memory leak
			this.texture.off( 'update', this.onTextureUpdateBind );
		}

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
	 * @method init
	 */
	/**
	 * A reference to init, so that subclasses can access it without the penalty of Function.call()
	 * @method Particle_init
	 * @private
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
	 * @method applyArt
	 * @param {PIXI.Texture} art The texture to set.
	 */
	p.applyArt = function(art)
	{
		if (useAPI3)
		{
			//remove warning on PIXI 3
			this.texture = art;
		}
		else
		{
			this.setTexture(art);
		}
	};

	/**
	 * Updates the particle.
	 * @method update
	 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
	 * @return {Number} The standard interpolation multiplier (0-1) used for all relevant particle
	 *                   properties. A value of -1 means the particle died of old age instead.
	 */
	/**
	 * A reference to update so that subclasses can access the original without the overhead
	 * of Function.call().
	 * @method Particle_update
	 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
	 * @return {Number} The standard interpolation multiplier (0-1) used for all relevant particle
	 *                   properties. A value of -1 means the particle died of old age instead.
	 * @private
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
	 * Kills the particle, removing it from the display list
	 * and telling the emitter to recycle it.
	 * @method kill
	 */
	p.kill = function()
	{
		this.emitter.recycle(this);
	};

	p.Sprite_Destroy = Sprite.prototype.destroy;
	/**
	 * Destroys the particle, removing references and preventing future use.
	 * @method destroy
	 */
	p.destroy = function()
	{
		if (this.Sprite_Destroy)
			this.Sprite_Destroy();
		this.emitter = this.velocity = this.startColor = this.endColor = this.ease =
			this.next = this.prev = null;
	};
	
	/**
	 * Checks over the art that was passed to the Emitter's init() function, to do any special
	 * modifications to prepare it ahead of time.
	 * @method parseArt
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
		if(DEBUG)
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
	 * @method parseData
	 * @static
	 * @param  {Object} extraData The extra data from the particle config.
	 * @return {Object} The parsed extra data.
	 */
	Particle.parseData = function(extraData)
	{
		return extraData;
	};

	PIXI.particles.Particle = Particle;

}(PIXI));
