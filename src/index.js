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