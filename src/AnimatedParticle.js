/**
*  @module cloudkid
*/
(function(cloudkid, undefined) {

	"use strict";

	var ParticleUtils = cloudkid.ParticleUtils,
		Particle = cloudkid.Particle;
	
	/**
	*	An individual particle image with an animation. You shouldn't have to deal with these.
	*	@class AnimatedParticle
	*	@constructor
	*	@param {Emitter} emitter The emitter that controls this AnimatedParticle.
	*/
	var AnimatedParticle = function(emitter)
	{
		Particle.call(this, emitter);
		
		/**
		 * Array used to avoid damaging previous texture arrays
		 * when applyArt() passes a texture instead of an array.
		 * @property {Array} _helperTextures
		 * @private
		 */
		this._helperTextures = [];
	};
	
	// Reference to the super class
	var s = Particle.prototype;
	// Reference to the prototype
	var p = AnimatedParticle.prototype = Object.create(s);
	
	/**
	*	Initializes the particle for use, based on the properties that have to
	*	have been set already on the particle.
	*	@method init
	*/
	p.init = function()
	{
		s.init.call(this);
		
		//set the standard PIXI animationSpeed
		if(this.extraData)
		{
			//fps will work differently for CloudKid's fork of PIXI than
			//standard PIXI, where it will just be a variable
			if(this.extraData.fps)
			{
				this.fps = this.extraData.fps;
			}
			else
			{
				this.fps = 60;
			}
			var animationSpeed = this.extraData.animationSpeed || 1;
			if(animationSpeed == "matchLife")
			{
				this.loop = false;
				//animation should end when the particle does
				if(this.hasOwnProperty("_duration"))
				{
					//CloudKid's fork of PIXI redoes how MovieClips animate,
					//with duration and elapsed time
					this.animationSpeed = this._duration / this.maxLife;
				}
				else
				{
					//standard PIXI - assume game tick rate of 60 fps
					this.animationSpeed = this.textures.length / this.maxLife / 60;
				}
			}
			else
			{
				this.loop = true;
				this.animationSpeed = animationSpeed;
			}
		}
		else
		{
			this.loop = true;
			this.animationSpeed = 1;
		}
		this.play();//start playing
	};
	
	/**
	*	Sets the textures for the particle.
	*	@method applyArt
	*	@param {Array} art An array of PIXI.Texture objects for this animated particle.
	*/
	p.applyArt = function(art)
	{
		if(Array.isArray(art))
			this.textures = art;
		else
		{
			this._helperTextures[0] = art;
			this.textures = this._helperTextures;
		}
		this.gotoAndStop(0);
	};

	/**
	*	Updates the particle.
	*	@method update
	*	@param {Number} delta Time elapsed since the previous frame, in __seconds__.
	*/
	p.update = function(delta)
	{
		s.update.call(this, delta);
		if(this.age < this.maxLife)
		{
			//only animate the particle if it is still alive
			if(this._duration)
			{
				//work with CloudKid's fork
				this.updateAnim(delta);
			}
			else
			{
				//standard PIXI - movieclip will advance automatically - this means
				//that the movieclip will animate even if the emitter (and the particles)
				//are paused
			}
		}
	};
	
	/**
	*	Destroys the particle, removing references and preventing future use.
	*	@method destroy
	*/
	p.destroy = function()
	{
		s.destroy.call(this);
	};
	
	cloudkid.AnimatedParticle = AnimatedParticle;
	
}(cloudkid));