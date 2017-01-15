# Pixi Particles

[![Build Status](https://travis-ci.org/pixijs/pixi-particles.svg)](https://travis-ci.org/pixijs/pixi-particles) [![Dependency Status](https://david-dm.org/pixijs/pixi-particles.svg?style=flat)](https://david-dm.org/pixijs/pixi-particles) [![GitHub version](https://badge.fury.io/gh/pixijs%2Fpixi-particles.svg)](https://github.com/pixijs/pixi-particles/releases/latest)

A particle system library for the [PixiJS](https://github.com/pixijs/pixi.js) library. Also, we created an [interactive particle editor](http://pixijs.github.io/pixi-particles-editor/) to design and preview custom particle emitters which utilitze PixiParticles.

## Sample Usage

Please see the examples for various pre-made particle configurations.

```js
// Create a new emitter
var emitter = new PIXI.particles.Emitter(

	// The PIXI.Container to put the emitter in
	// if using blend modes, it's important to put this
	// on top of a bitmap, and not use the root stage Container
	container,
  
	// The collection of particle images to use
	[PIXI.Texture.fromImage('image.jpg')],
  
	// Emitter configuration, edit this to change the look
	// of the emitter
	{
		alpha: {
			start: 0.8,
			end: 0.1
		},
		scale: {
			start: 1,
			end: 0.3
		},
		color: {
			start: "fb1010",
			end: "f5b830"
		},
		speed: {
			start: 200,
			end: 100
		},
		startRotation: {
			min: 0,
			max: 360
		},
		rotationSpeed: {
			min: 0,
			max: 0
		},
		lifetime: {
			min: 0.5,
			max: 0.5
		},
		frequency: 0.008,
		emitterLifetime: 0.31,
		maxParticles: 1000,
		pos: {
			x: 0,
			y: 0
		},
		addAtBack: false,
		spawnType: "circle",
		spawnCircle: {
			x: 0,
			y: 0,
			r: 10
		}
	}
);

// Calculate the current time
var elapsed = Date.now();
		
// Update function every frame
var update = function(){
			
	// Update the next frame
	requestAnimFrame(update);

	var now = Date.now();
	
	// The emitter requires the elapsed
	// number of seconds since the last update
	emitter.update((now - elapsed) * 0.001);
	elapsed = now;
	
	// Should re-render the PIXI Stage
	// renderer.render(stage);
};

// Start emitting
emitter.emit = true;

// Start the update
update();
```

## Note on Emitter Cleanup
When using PixiJS 3+, the SpriteRenderer in WebGL may keep a reference to your particles after you have destroyed your emitter. To ensure that they are garbage collected, _in WebGL only_, reset the SpriteRenderer's sprite batching with `yourRenderer.plugins.sprite.sprites.length = 0;`

## Documentation

http://pixijs.github.io/pixi-particles/docs/

## Installation

PixiParticles can be installed using Bower or NPM.

```bash
bower install pixi-particles
```

```bash
npm install pixi-particles
```

## Examples

* [Explosion 1](https://pixijs.github.io/pixi-particles/examples/explosion.html)
* [Explosion 2](https://pixijs.github.io/pixi-particles/examples/explosion2.html)
* [Explosion 3](https://pixijs.github.io/pixi-particles/examples/explosion3.html)
* [Explosion Ring](https://pixijs.github.io/pixi-particles/examples/explosionRing.html)
* [Megaman Death](https://pixijs.github.io/pixi-particles/examples/megamanDeath.html)
* [Rain](https://pixijs.github.io/pixi-particles/examples/rain.html)
* [Flame](https://pixijs.github.io/pixi-particles/examples/flame.html)
* [Gas](https://pixijs.github.io/pixi-particles/examples/gas.html)
* [Bubbles](https://pixijs.github.io/pixi-particles/examples/bubbles.html)
* [Bubble Spray](https://pixijs.github.io/pixi-particles/examples/bubbleSpray.html)
* [Bubble Stream](https://pixijs.github.io/pixi-particles/examples/bubbleStream.html)
* [Bubble Stream - path following](https://pixijs.github.io/pixi-particles/examples/bubbleStreamPath.html)
* [Vertical Bubbles](https://pixijs.github.io/pixi-particles/examples/bubblesVertical.html)
* [Cartoon Smoke](https://pixijs.github.io/pixi-particles/examples/cartoonSmoke.html)
* [Cartoon Smoke Alt.](https://pixijs.github.io/pixi-particles/examples/cartoonSmoke2.html)
* [Cartoon Smoke Blast](https://pixijs.github.io/pixi-particles/examples/cartoonSmokeBlast.html)
* [Snow](https://pixijs.github.io/pixi-particles/examples/snow.html)
* [Sparks](https://pixijs.github.io/pixi-particles/examples/sparks.html)
* [Fountain](https://pixijs.github.io/pixi-particles/examples/fountain.html)
* [Animated Coins](https://pixijs.github.io/pixi-particles/examples/coins.html)
* [Animated Bubbles](https://pixijs.github.io/pixi-particles/examples/animatedBubbles.html)
* [Particle Container Performance](https://pixijs.github.io/pixi-particles/examples/particleContainerPerformance.html)

## Typescript
You can use require to get the namespace for pixi-particles, or use a triple slash reference for using the PIXI.particles namespace.
```typescript
// Note: Must also include the pixi.js typings globally!
import particles = require('pixi-particles');

let myEmitter:particles.Emitter = new particles.Emitter(myContainer);
```

```typescript
// Note: Must also include the pixi.js typings globally!
/// <reference path="node_modules/pixi-particles/ambient.d.ts" />
require('pixi-particles');

let myEmitter:PIXI.particles.Emitter = new PIXI.particles.Emitter(myContainer);
```

## Use in Haxe

Externs for Haxe have been added to [adireddy's Pixi externs](https://github.com/adireddy/haxe-pixi)

## License

Copyright (c) 2015 [CloudKid](http://github.com/cloudkidstudio)

Released under the MIT License.
