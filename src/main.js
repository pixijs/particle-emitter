/**
 * @module Pixi Particles
 * @namespace PIXI.particles
 */
(function(){

	"use strict";

	// Check for window, fallback to global
	var global = typeof window !== 'undefined' ? window : GLOBAL;

	// Define PIXI Flash namespace
	var particles = {};

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
		module.exports = particles;
	}
	// If we're in the browser make sure PIXI is available
	else if (typeof PIXI === 'undefined')
	{
		if (DEBUG)
		{
			throw "pixi-particles requires pixi.js to be loaded first";
		}
		else
		{
			throw "Requires pixi.js";
		}
	}

	// Assign to global namespace
	global.PIXI.particles = global.PIXI.particles || particles;

}());