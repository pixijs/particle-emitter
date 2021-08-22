# Pixi Particles

[![Build Status](https://github.com/pixijs/pixi-particles/workflows/Build/badge.svg)](https://github.com/pixijs/pixi-particles/actions?query=workflow%3A%22Build%22) [![Dependency Status](https://david-dm.org/pixijs/pixi-particles.svg?style=flat)](https://david-dm.org/pixijs/pixi-particles) [![GitHub version](https://badge.fury.io/gh/pixijs%2Fpixi-particles.svg)](https://github.com/pixijs/pixi-particles/releases/latest)

A particle system library for the [PixiJS](https://github.com/pixijs/pixi.js) library. Also, we created an [interactive particle editor](http://pixijs.github.io/pixi-particles-editor/) to design and preview custom particle emitters which utilitze PixiParticles.

## Breaking changes in v5 from v4
* On `Emitter`, configuration format has drastically changed. Use [`upgradeConfig()`](https://pixijs.github.io/pixi-particles/docs/modules.html#upgradeConfig) to convert old configuration objects automatically.
* Dropped support for PixiJS v4. Please use v6 - while v5 may work, Typescript definitions won't work and will cause you a headache.
* The library now outputs ES6 code - if you need it in ES5 code, you'll need to make sure your build process transpiles it.

## Sample Usage

Please see the examples for various pre-made particle configurations.

```js
// Create a new emitter
// note: if importing library like "import * as particles from 'pixi-particles'"
// or "const particles = require('pixi-particles')", the PIXI namespace will
// not be modified, and may not exist - use "new particles.Emitter()", or whatever
// your imported namespace is
var emitter = new PIXI.particles.Emitter(

	// The PIXI.Container to put the emitter in
	// if using blend modes, it's important to put this
	// on top of a bitmap, and not use the root stage Container
	container,
	// Emitter configuration, edit this to change the look
	// of the emitter
	{
		lifetime: {
			min: 0.5,
			max: 0.5
		},
		frequency: 0.008,
		spawnChance: 1,
		particlesPerWave: 1,
		emitterLifetime: 0.31,
		maxParticles: 1000,
		pos: {
			x: 0,
			y: 0
		},
		addAtBack: false,
		behaviors: [
			{
				type: 'alpha',
				config: {
					alpha: {
						list: [
							{
								value: 0.8,
								time: 0
							},
							{
								value: 0.1,
								time: 1
							}
						],
					},
				}
			},
			{
				type: 'scale',
				config: {
					scale: {
						list: [
							{
								value: 1,
								time: 0
							},
							{
								value: 0.3,
								time: 1
							}
						],
					},
				}
			},
			{
				type: 'color',
				config: {
					color: {
						list: [
							{
								value: "fb1010",
								time: 0
							},
							{
								value: "f5b830",
								time: 1
							}
						],
					},
				}
			},
			{
				type: 'moveSpeed',
				config: {
					speed: {
						list: [
							{
								value: 200,
								time: 0
							},
							{
								value: 100,
								time: 1
							}
						],
						isStepped: false
					},
				}
			},
			{
				type: 'rotationStatic',
				config: {
					min: 0,
					max: 360
				}
			},
			{
				type: 'spawnShape',
				config: {
					type: 'torus',
					data: {
						x: 0,
						y: 0,
						r: 10
					}
				}
			},
			{
				type: 'textureSingle',
				config: {
					texture: PIXI.Texture.fromImage('image.jpg')
				}
			}
		],
	}
);

// Calculate the current time
var elapsed = Date.now();

// Update function every frame
var update = function(){

	// Update the next frame
	requestAnimationFrame(update);

	var now = Date.now();

	// The emitter requires the elapsed
	// number of seconds since the last update
	emitter.update((now - elapsed) * 0.001);
	elapsed = now;
};

// Start emitting
emitter.emit = true;

// Start the update
update();
```

## Documentation

http://pixijs.github.io/pixi-particles/docs/

## Installation

PixiParticles can be installed with NPM or other package managers.

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
* [Flame on Polygonal Chain](https://pixijs.github.io/pixi-particles/examples/flamePolygonal.html)
* [Flame on Advanced Polygonal Chain](https://pixijs.github.io/pixi-particles/examples/flamePolygonalAdv.html)
* [Flame - Stepped Colors](https://pixijs.github.io/pixi-particles/examples/flameStepped.html)
* [Flame with Smoke](https://pixijs.github.io/pixi-particles/examples/flameAndSmoke.html)
* [Flame - Sputtering](https://pixijs.github.io/pixi-particles/examples/flameUneven.html)
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
* [Spaceship Destruction - Ordered Art](https://pixijs.github.io/pixi-particles/examples/spaceshipDestruction.html)
* [Particle Container Performance](https://pixijs.github.io/pixi-particles/examples/particleContainerPerformance.html)

## Contributer Note
This project uses `yarn` rather than `npm` to take advantage of the workspaces feature for the tests, making it easier to have standalone tests that share dependencies where possible.

## License

Copyright (c) 2015 [CloudKid](http://github.com/cloudkidstudio)

Released under the MIT License.
