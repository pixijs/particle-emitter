(function(window){

	/**
	*  Basic example setup
	*  @class ParticleExample
	*  @constructor
	*  @param {String[]} imagePaths The local path to the image source
	*  @param {Object} config The emitter configuration
	*/
	var ParticleExample = function(imagePaths, config, type)
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
		var stage = new PIXI.Stage(0x0),
			emitter = null,
			renderer = PIXI.autoDetectRenderer(canvas.width, canvas.height, rendererOptions),
			bg = null;

		// Calculate the current time
		var elapsed = Date.now();

		// Update function every frame
		var update = function(){

			// Update the next frame
			requestAnimFrame(update);

			var now = Date.now();
			emitter.update((now - elapsed) * 0.001);
			elapsed = now;

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
		var loader = new PIXI.AssetLoader(urls);
		loader.onComplete = function()
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
			var emitterContainer = new PIXI.DisplayObjectContainer();
			stage.addChild(emitterContainer);
			emitter = new cloudkid.Emitter(
				emitterContainer,
				art,
				config
			);
			if(type == "path")
				emitter.particleConstructor = cloudkid.PathParticle;
			else if(type == "anim")
				emitter.particleConstructor = cloudkid.AnimatedParticle;

			// Center on the stage
			emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);

			// Click on the canvas to trigger
			canvas.addEventListener('mouseup', function(e){
				emitter.emit = true;
				emitter.resetPositionTracking();
				emitter.updateOwnerPos(e.offsetX || e.layerX, e.offsetY || e.layerY);
			});

			// Start the update
			update();
		};
		loader.load();
	};

	// Assign to global space
	window.ParticleExample = ParticleExample;

}(window));