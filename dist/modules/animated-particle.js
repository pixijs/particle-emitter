/*! PixiParticles 1.5.0 */
/**
*  @module cloudkid
*/
(function(cloudkid, undefined) {

	"use strict";

	var ParticleUtils = cloudkid.ParticleUtils,
		Particle = cloudkid.Particle,
		Texture = PIXI.Texture;
	var useAPI3 = ParticleUtils.useAPI3;

	/**
	 * An individual particle image with an animation. While this class may be functional, it
	 * has not gotten thorough testing or examples yet, and is not considered to be release ready.
	 * @class AnimatedParticle
	 * @constructor
	 * @param {Emitter} emitter The emitter that controls this AnimatedParticle.
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
	 * @method init
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
	 * @method applyArt
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
	 * @method update
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
			if(useAPI3)
				this.texture = this.textures[frame];
			else
				this.setTexture(this.textures[frame]);
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

	cloudkid.AnimatedParticle = AnimatedParticle;

}(cloudkid));