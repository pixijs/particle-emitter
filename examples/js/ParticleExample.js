(function(window){

	/**
	*  Basic example setup
	*  @class ParticleExample
	*  @constructor
	*  @param {String[]} imagePaths The local path to the image source
	*  @param {Object} config The emitter configuration
	*/
	var ParticleExample = function(imagePaths, config)
	{
		// Basic PIXI Setup
		var canvas = document.getElementById("stage"),
			stage = new PIXI.Stage(0x0),
			emitter = null,
			renderer = PIXI.autoDetectRenderer(canvas.width, canvas.height, canvas),
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
		var urls = imagePaths.slice();
		urls.push("images/bg.png");
		var loader = new PIXI.AssetLoader(imagePaths);
		loader.onComplete = function()
		{
			bg = new PIXI.Sprite(PIXI.Texture.fromImage("images/bg.png"));
			//bg is a 1px by 1px image
			bg.scale.x = canvas.width;
			bg.scale.y = canvas.height;
			bg.tint = 0x000000;
			stage.addChild(bg);
			//collect the textures, now that they are all loaded
			var textures = [];
			for(var i = 0; i < imagePaths.length; ++i)
				textures.push(PIXI.Texture.fromImage(imagePaths[i]));
			// Create the new emitter and attach it to the stage
			var emitterContainer = new PIXI.DisplayObjectContainer();
			stage.addChild(emitterContainer);
			emitter = new cloudkid.Emitter(
				emitterContainer,
				textures,
				config
			);

			// Center on the stage
			emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);

			// Click on the canvas to trigger 
			canvas.addEventListener('mouseup', function(e){
				emitter.emit = true;
				emitter.resetPositionTracking();
				emitter.updateOwnerPos(e.offsetX, e.offsetY);
			});

			// Start the update
			update();
		};
		loader.load();
	};

	// Assign to global space
	window.ParticleExample = ParticleExample;

}(window));