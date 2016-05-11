(function(window){

	/**
	*  Basic example setup
	*  @class ParticleExample
	*  @constructor
	*  @param {String[]} imagePaths The local path to the image source
	*  @param {Object} config The emitter configuration
	*/
	var ParticleExample = function(imagePaths, config, type, useParticleContainer)
	{
		var canvas = document.getElementById("stage");
		// Basic PIXI Setup
		var rendererOptions =
		{
			view: canvas,
		};
		/*var preMultAlpha = !!options.preMultAlpha;
		if(rendererOptions.transparent && !preMultAlpha)
			rendererOptions.transparent = "notMultiplied";*/
		var stage = new PIXI.Container(),
			emitter = null,
			renderer = PIXI.autoDetectRenderer(canvas.width, canvas.height, rendererOptions),
			bg = null;
		
		var framerate = document.getElementById("framerate");
		var particleCount = document.getElementById("particleCount");

		// Calculate the current time
		var elapsed = Date.now();
		
		var updateId;

		// Update function every frame
		var update = function(){

			// Update the next frame
			updateId = requestAnimationFrame(update);

			var now = Date.now();
			if (emitter)
				emitter.update((now - elapsed) * 0.001);
			
			framerate.innerHTML = (1000 / (now - elapsed)).toFixed(2);
			
			elapsed = now;
			
			if(emitter && particleCount)
				particleCount.innerHTML = emitter.particleCount;

			// render the stage
			renderer.render(stage);
		};

		// Resize the canvas to the size of the window
		window.onresize = function(event) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			renderer.resize(canvas.width, canvas.height);
			if(bg)
			{
				//bg is a 1px by 1px image
				bg.scale.x = canvas.width;
				bg.scale.y = canvas.height;
			}
		};
		window.onresize();

		// Preload the particle images and create PIXI textures from it
		var urls, makeTextures = false;
		if(imagePaths.spritesheet)
			urls = [imagePaths.spritesheet];
		else if(imagePaths.textures)
			urls = imagePaths.textures.slice();
		else
		{
			urls = imagePaths.slice();
			makeTextures = true;
		}
		urls.push("images/bg.png");
		var loader = PIXI.loader;
		for(var i = 0; i < urls.length; ++i)
			loader.add("img" + i, urls[i]);
		loader.load(function()
		{
			bg = new PIXI.Sprite(PIXI.Texture.fromImage("images/bg.png"));
			//bg is a 1px by 1px image
			bg.scale.x = canvas.width;
			bg.scale.y = canvas.height;
			bg.tint = 0x000000;
			stage.addChild(bg);
			//collect the textures, now that they are all loaded
			var art;
			if(makeTextures)
			{
				art = [];
				for(var i = 0; i < imagePaths.length; ++i)
					art.push(PIXI.Texture.fromImage(imagePaths[i]));
			}
			else
				art = imagePaths.art;
			// Create the new emitter and attach it to the stage
			var emitterContainer;
			if(useParticleContainer)
			{
				emitterContainer = new PIXI.ParticleContainer();
				emitterContainer.setProperties({
					scale: true,
					position: true,
					rotation: true,
					uvs: true,
					alpha: true
				});
			}
			else
				emitterContainer = new PIXI.Container();
			stage.addChild(emitterContainer);
			emitter = new PIXI.particles.Emitter(
				emitterContainer,
				art,
				config
			);
			if(type == "path")
				emitter.particleConstructor = PIXI.particles.PathParticle;
			else if(type == "anim")
				emitter.particleConstructor = PIXI.particles.AnimatedParticle;

			// Center on the stage
			emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);

			// Click on the canvas to trigger
			canvas.addEventListener('mouseup', function(e){
				if(!emitter) return;
				emitter.emit = true;
				emitter.resetPositionTracking();
				emitter.updateOwnerPos(e.offsetX || e.layerX, e.offsetY || e.layerY);
			});

			// Start the update
			update();
			
			//for testing and debugging
			window.destroyEmitter = function()
			{
				emitter.destroy();
				emitter = null;
				window.destroyEmitter = null;
				//cancelAnimationFrame(updateId);
				
				//reset SpriteRenderer's batching to fully release particles for GC
				if (renderer.plugins && renderer.plugins.sprite && renderer.plugins.sprite.sprites)
					renderer.plugins.sprite.sprites.length = 0;
				
				renderer.render(stage);
			};
		});
	};

	// Assign to global space
	window.ParticleExample = ParticleExample;

}(window));