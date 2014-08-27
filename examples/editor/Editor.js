(function(){
		
	// Import library dependencies
	var Texture = PIXI.Texture,
		Sprite = PIXI.Sprite,
		Point = PIXI.Point,
		Graphics = PIXI.Graphics,
		Application = cloudkid.Application;
	
	var Editor = function(options)
	{
		Application.call(this, options);
	};
	
	var stage;

	var emitter;

	var particleDefaults;
	
	// Extend the createjs container
	var p = Editor.prototype = Object.create(Application.prototype);
	
	p.init = function()
	{
		this.onMouseIn = this.onMouseIn.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);

		stage = this.display.stage;

		particleDefaults = {};

		var tasks = [
			new cloudkid.LoadTask("trail", "defaultTrail.json", this.onConfigLoaded),
			new cloudkid.PixiTask("particle", ["particle.png"], this.onTexturesLoaded)
		];
		
		cloudkid.TaskManager.process(tasks, this._onCompletedLoad.bind(this));
	};

	p.onConfigLoaded = function(result, task)
	{
		particleDefaults[task.id] = result.content;
	};

	p.onTexturesLoaded = function()
	{
	};
	
	p._onCompletedLoad = function()
	{
		stage.interactionManager.stageIn = this.onMouseIn;
		stage.interactionManager.stageOut = this.onMouseOut;
		this.on("update", this.update.bind(this));

		emitter = new cloudkid.Emitter(stage, PIXI.Texture.fromImage("particle"), particleDefaults.trail);
		emitter.updateOwnerPos(400, 250);
	};
	

	p.update = function(elapsed)
	{
		emitter.update(elapsed * 0.001);
	};

	p.onMouseIn = function()
	{
		stage.mousemove = this.onMouseMove;
		emitter.resetPositionTracking();
	};

	p.onMouseOut = function()
	{
		stage.mousemove = null;
		emitter.updateOwnerPos(400, 250);
		emitter.resetPositionTracking();
	};

	p.onMouseMove = function(data)
	{
		emitter.updateOwnerPos(data.global.x, data.global.y);
	};
	
	namespace('cloudkid').Editor = Editor;
	
}());