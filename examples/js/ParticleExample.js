(function(window){

	/**
	*  Basic example setup
	*  @class ParticleExample
	*  @constructor
	*  @param {String} imagePath The local path to the image source
	*  @param {Object} config The emitter configuration
	*/
	var ParticleExample = function(imagePath, config)
	{
		// Basic PIXI Setup
		var canvas = document.getElementById("stage"),
			stage = new PIXI.Stage(0x0),
			emitter = null,
			renderer = PIXI.autoDetectRenderer(canvas.width, canvas.height, canvas);

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
		};
		window.onresize();

		// Preload the particle image and create a PIXI texture from it
		var image = new Image();
		image.src = imagePath;
		image.onload = function()
		{
			// Create the new emitter and attach it to the stage
			emitter = new cloudkid.Emitter(
				stage,
				PIXI.Texture.fromImage(image.src),
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
	};

	// Assign to global space
	window.ParticleExample = ParticleExample;

}(window));