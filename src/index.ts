"use strict";

// If we're in the browser make sure PIXI is available
if (typeof PIXI === 'undefined')
{
	throw "pixi-particles requires pixi.js to be loaded first";
}

//ensure that the particles namespace exist - PIXI 4 creates it itself, PIXI 3 does not
if (!PIXI.particles) {
	(PIXI as any).particles = {};
}

// get the library itself
import * as particles from './particles';

// insert the library into the particles namespace on PIXI
for (let prop in particles) {
	(PIXI as any).particles[prop] = (particles as any)[prop];
}

// if in node, export as a node module
declare var module: any;
if (typeof module !== "undefined" && module.exports) {
    module.exports = particles;
}