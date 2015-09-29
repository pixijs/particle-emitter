Pixi Particles [![Build Status](https://travis-ci.org/CloudKidStudio/PixiParticles.svg)](https://travis-ci.org/CloudKidStudio/PixiParticles) [![Dependency Status](https://david-dm.org/CloudKidStudio/PixiParticles.svg?style=flat)](https://david-dm.org/CloudKidStudio/PixiParticles) [![GitHub version](https://badge.fury.io/gh/CloudKidStudio%2FPixiParticles.svg)](https://github.com/CloudKidStudio/PixiParticles/releases/latest)
=================

A particle system library for the [PixiJS](https://github.com/GoodBoyDigital/pixi.js) library. Also, we created an [interactive particle editor](http://cloudkidstudio.github.io/PixiParticlesEditor/) to design and preview custom particle emitters which utilitze PixiParticles. 

##Sample Usage

Please see the examples for various pre-made particle configurations.

```js

// Create a new emitter
var emitter = new cloudkid.Emitter(

  // The DisplayObjectContainer to put the emitter in
  // if using blend modes, it's important to put this
  // on top of a bitmap, and not use the PIXI.Stage
  container,
  
  // The collection of particle images to use
  [PIXI.Texture.fromImage('image.jpg')],
  
	// Emitter configuration, edit this to change the look
	// of the emitter
	{
		"alpha": {
			"start": 0.8,
			"end": 0.1
		},
		"scale": {
			"start": 1,
			"end": 0.3
		},
		"color": {
			"start": "fb1010",
			"end": "f5b830"
		},
		"speed": {
			"start": 200,
			"end": 100
		},
		"startRotation": {
			"min": 0,
			"max": 360
		},
		"rotationSpeed": {
			"min": 0,
			"max": 0
		},
		"lifetime": {
			"min": 0.5,
			"max": 0.5
		},
		"frequency": 0.008,
		"emitterLifetime": 0.31,
		"maxParticles": 1000,
		"pos": {
			"x": 0,
			"y": 0
		},
		"addAtBack": false,
		"spawnType": "circle",
		"spawnCircle": {
			"x": 0,
			"y": 0,
			"r": 10
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

##Documentation##

http://cloudkidstudio.github.io/PixiParticles/docs/

##Installation##

PixiParticles can be installed using Bower or NPM.

```bash
bower install pixi-particles
```

```bash
npm install pixi-particles
```

##Examples##

* [Explosion 1](https://cloudkidstudio.github.io/PixiParticles/examples/explosion.html)
* [Explosion 2](https://cloudkidstudio.github.io/PixiParticles/examples/explosion2.html)
* [Explosion 3](https://cloudkidstudio.github.io/PixiParticles/examples/explosion3.html)
* [Explosion Ring](https://cloudkidstudio.github.io/PixiParticles/examples/explosionRing.html)
* [Megaman Death](https://cloudkidstudio.github.io/PixiParticles/examples/megamanDeath.html)
* [Rain](https://cloudkidstudio.github.io/PixiParticles/examples/rain.html)
* [Flame](https://cloudkidstudio.github.io/PixiParticles/examples/flame.html)
* [Gas](https://cloudkidstudio.github.io/PixiParticles/examples/gas.html)
* [Bubbles](https://cloudkidstudio.github.io/PixiParticles/examples/bubbles.html)
* [Bubble Spray](https://cloudkidstudio.github.io/PixiParticles/examples/bubbleSpray.html)
* [Bubble Stream](https://cloudkidstudio.github.io/PixiParticles/examples/bubbleStream.html)
* [Bubble Stream - path following](https://cloudkidstudio.github.io/PixiParticles/examples/bubbleStreamPath.html)
* [Vertical Bubbles](https://cloudkidstudio.github.io/PixiParticles/examples/bubblesVertical.html)
* [Cartoon Smoke](https://cloudkidstudio.github.io/PixiParticles/examples/cartoonSmoke.html)
* [Cartoon Smoke Alt.](https://cloudkidstudio.github.io/PixiParticles/examples/cartoonSmoke2.html)
* [Cartoon Smoke Blast](https://cloudkidstudio.github.io/PixiParticles/examples/cartoonSmokeBlast.html)
* [Snow](https://cloudkidstudio.github.io/PixiParticles/examples/snow.html)
* [Sparks](https://cloudkidstudio.github.io/PixiParticles/examples/sparks.html)
* [Fountain](https://cloudkidstudio.github.io/PixiParticles/examples/fountain.html)
* [Animated Coins](https://cloudkidstudio.github.io/PixiParticles/examples/coins.html)
* [Animated Bubbles](https://cloudkidstudio.github.io/PixiParticles/examples/animatedBubbles.html)
* [Particle Container Performance](https://cloudkidstudio.github.io/PixiParticles/examples/particleContainerPerformance.html)

##Use in Haxe##

Externs for Haxe have been added to [adireddy's Pixi externs](https://github.com/adireddy/haxe-pixi)

##License##

Copyright (c) 2015 [CloudKid](http://github.com/cloudkidstudio)

Released under the MIT License.
