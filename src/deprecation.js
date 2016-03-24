(function(undefined){
	
	// Check for window, fallback to global
	var global = typeof window !== 'undefined' ? window : GLOBAL;
	
	// Deprecate support for the cloudkid namespace
	if (typeof cloudkid === "undefined")
	{
		global.cloudkid = {};
	}

	//  Get classes from the PIXI.particles namespace
	Object.defineProperties(global.cloudkid, 
	{
		AnimatedParticle: {
			get: function()
			{
				if (DEBUG)
				{
					console.warn("cloudkid namespace is deprecated, please use PIXI.particles");
				}
				return PIXI.particles.AnimatedParticle;
			}
		},
		Emitter: {
			get: function()
			{
				if (DEBUG)
				{
					console.warn("cloudkid namespace is deprecated, please use PIXI.particles");
				}
				return PIXI.particles.Emitter;
			}
		},
		Particle: {
			get: function()
			{
				if (DEBUG)
				{
					console.warn("cloudkid namespace is deprecated, please use PIXI.particles");
				}
				return PIXI.particles.Particle;
			}
		},
		ParticleUtils: {
			get: function()
			{
				if (DEBUG)
				{
					console.warn("cloudkid namespace is deprecated, please use PIXI.particles");
				}
				return PIXI.particles.ParticleUtils;
			}
		},
		PathParticle: {
			get: function()
			{
				if (DEBUG)
				{
					console.warn("cloudkid namespace is deprecated, please use PIXI.particles");
				}
				return PIXI.particles.PathParticle;
			}
		}
	});

}());