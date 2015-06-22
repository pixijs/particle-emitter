Pixi Particles
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

http://cloudkidstudio.github.io/PixiParticles/

##Installation##

PixiParticles can be installed using Bower.
While the Bower file specifies CloudKid's fork of PixiJS, the library should work fine with
the official release of PixiJS.

```bash
bower install pixi-particles
```

##Use in Haxe##

Externs for Haxe have been added to [adireddy's Pixi externs](https://github.com/adireddy/haxe-pixi)

##License##

Copyright (c) 2014 [CloudKid](http://github.com/cloudkidstudio)

Released under the MIT License.
