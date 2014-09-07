(function(window){

	var Application = cloudkid.Application,
		PixiDisplay = cloudkid.PixiDisplay,
		Emitter = cloudkid.Emitter;

	/**
	*  Basic example setup
	*  @class ParticleExample
	*  @constructor
	*  @param {String} imagePath The local path to the image source
	*  @param {Object} config The emitter configuration
	*/
	var ParticleExample = function(imagePath, config)
	{
		// Preload the particle image and create a PIXI texture from it
		var image = new Image();
		image.src = imagePath;
		image.onload = function()
		{
			// Create a new application
			var app = new Application({
				framerate : "framerate",
				resizeElement: window,
				uniformResize: false,
				canvasId: "stage",
				display: PixiDisplay,
				displayOptions: {
					clearView: true,
					transparent: false,
					backgroundColor: 0x0
				}
			});

			// Create the new emitter and attach it to the stage
			var emitter = new Emitter(
				app.display.stage,
				PIXI.Texture.fromImage(image.src),
				config
			);

			// Don't emit initially
			emitter.emit = false;

			// Add application update listener
			// this is needed to update the emitter display
			app.on('update', function(elapsed){
				emitter.update(elapsed * 0.001);
			});

			// Click on the canvas to trigger 
			app.display.canvas.addEventListener('mouseup', function(e){
				emitter.emit = true;
				emitter.resetPositionTracking();
				emitter.updateOwnerPos(e.offsetX, e.offsetY);
			});
		};
	};

	// Assign to global space
	window.ParticleExample = ParticleExample;

}(window));