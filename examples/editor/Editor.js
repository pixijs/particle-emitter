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
	
	// Extend the createjs container
	var p = Editor.prototype = Object.create(Application.prototype);
	
	var stage;

	var emitter;
	var emitterEnableTimer = 0;

	var particleDefaults;
	var particleDefaultImages;

	var defaultTexture = "particle.png";
	var defaultNames = ["trail", "flame", "gas"];
	var defaultImages = ["particle.png"];
	
	p.spawnTypes = ["point", "arc", "circle", "rect"];

	var jqImageDiv = null;
	
	p.init = function()
	{
		this.onMouseIn = this.onMouseIn.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);

		jqImageDiv = $(".particleImage");
		jqImageDiv.remove();

		stage = this.display.stage;

		particleDefaults = {};
		particleDefaultImages = {};
		particleDefaultImageUrls = {};

		var tasks = [
			new cloudkid.LoadTask("trail", "defaultTrail.json", this.onConfigLoaded),
			new cloudkid.LoadTask("flame", "defaultFlame.json", this.onConfigLoaded),
			new cloudkid.LoadTask("gas", "defaultGas.json", this.onConfigLoaded),
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
		particleDefaultImageUrls["trail"] = ["particle.png"];
		particleDefaultImages["trail"] = [PIXI.Texture.fromImage("particle")];
		particleDefaultImageUrls["flame"] = ["particle.png"];
		particleDefaultImages["flame"] = [PIXI.Texture.fromImage("particle")];
		particleDefaultImageUrls["gas"] = ["particle.png"];
		particleDefaultImages["gas"] = [PIXI.Texture.fromImage("particle")];
	};
	
	p._onCompletedLoad = function()
	{
		stage.interactionManager.stageIn = this.onMouseIn;
		stage.interactionManager.stageOut = this.onMouseOut;
		this.on("update", this.update.bind(this));

		$("#refresh").click(this.loadFromUI.bind(this));
		$("#downloadConfig").click(this.downloadConfig.bind(this));
		$("#defaultImageSelector").on("selectmenuselect", this.loadImage.bind(this, "select"));
		$("#imageUpload").change(this.loadImage.bind(this, "upload"));
		$("#defaultConfigSelector").on("selectmenuselect", this.loadConfig.bind(this, "default"));
		$("#configUpload").change(this.loadConfig.bind(this, "upload"));
		$("#configPaste").on('paste', this.loadConfig.bind(this, "paste"));

		emitter = new cloudkid.Emitter(stage);
		this.loadDefault("trail");
	};

	p.loadDefault = function(name)
	{
		if(!name)
			name = trail;

		$("#imageList").children().remove();
		var imageUrls = particleDefaultImageUrls[name];
		for(var i = 0; i < imageUrls.length; ++i)
			this.addImage(imageUrls[i]);
		this.loadSettings(particleDefaultImages[name], particleDefaults[name]);
		this.updateUI(particleDefaults[name]);
	};

	p.updateUI = function(config)
	{
		//particle settings
		$("#alphaStart").slider("value", config.alpha ? config.alpha.start : 1);
		$("#alphaEnd").slider("value", config.alpha ? config.alpha.end : 1);
		$("#scaleStart").spinner("value", config.scale ? config.scale.start : 1);
		$("#scaleEnd").spinner("value", config.scale ? config.scale.end : 1);
		$("#colorStart").colorpicker("setColor", config.color ? config.color.start : "FFFFFF");
		$("#colorEnd").colorpicker("setColor", config.color ? config.color.end : "FFFFFF");
		$("#speedStart").spinner("value", config.speed ? config.speed.start : 0);
		$("#speedEnd").spinner("value", config.speed ? config.speed.end : 0);
		$("#startRotationMin").spinner("value", config.startRotation ? config.startRotation.min : 0);
		$("#startRotationMax").spinner("value", config.startRotation ? config.startRotation.max : 0);
		$("#rotationSpeedMin").spinner("value", config.rotationSpeed ? config.rotationSpeed.min : 0);
		$("#rotationSpeedMax").spinner("value", config.rotationSpeed ? config.rotationSpeed.max : 0);
		$("#lifeMin").spinner("value", config.lifetime ? config.lifetime.min : 1);
		$("#lifeMax").spinner("value", config.lifetime ? config.lifetime.max : 1);
		$("#customEase").val(config.ease ? JSON.stringify(config.ease) : "");
		//emitter settings
		$("#emitFrequency").spinner("value", config.frequency || 0.5);
		$("#emitLifetime").spinner("value", config.emitterLifetime || -1);
		$("#emitMaxParticles").spinner("value", config.maxParticles || 1000);
		$("#emitSpawnPosX").spinner("value", config.pos ? config.pos.x : 0);
		$("#emitSpawnPosY").spinner("value", config.pos ? config.pos.y : 0);
		$("#emitAddAtBack").prop("checked", !!config.addAtBack);
		//spawn type
		var spawnType = config.spawnType, spawnTypes = this.spawnTypes;
		if(spawnTypes.indexOf(spawnType) == -1)
			spawnType = spawnTypes[0];
		//update dropdown
		//$("#emitSpawnType").find("option:contains(" + spawnType + ")").prop("selected",true);
		$("#emitSpawnType").val(spawnType);
		$("#emitSpawnType").selectmenu("refresh");
		//hide non-type options
		for(var i = 0; i < spawnTypes.length; ++i)
		{
			if(spawnTypes[i] == spawnType)
				$(".settings-" + spawnTypes[i]).show();
			else
				$(".settings-" + spawnTypes[i]).hide();
		}
		//set or reset these options
		$("#emitAngleMin").spinner("value", config.angle ? config.angle.min : 0);
		$("#emitAngleMax").spinner("value", config.angle ? config.angle.max : 0);
		$("#emitRectX").spinner("value", config.spawnRect ? config.spawnRect.x : 0);
		$("#emitRectY").spinner("value", config.spawnRect ? config.spawnRect.y : 0);
		$("#emitRectW").spinner("value", config.spawnRect ? config.spawnRect.w : 0);
		$("#emitRectH").spinner("value", config.spawnRect ? config.spawnRect.h : 0);
		$("#emitCircleX").spinner("value", config.spawnCircle ? config.spawnCircle.x : 0);
		$("#emitCircleY").spinner("value", config.spawnCircle ? config.spawnCircle.y : 0);
		$("#emitCircleR").spinner("value", config.spawnCircle ? config.spawnCircle.R : 0);
	};

	p.loadConfig = function(type, event, ui)
	{
		if(type == "default")
		{
			var value = $("#defaultConfigSelector option:selected").text();
			if(value == "-Default Emitters-")
				return;
			this.loadDefault(value);
			$("#configDialog").dialog("close");
		}
		else if(type == "paste")
		{
			var elem = $("#configPaste");
			setTimeout(function()
			{
				try
				{
					eval("var obj = " + elem.val() + ";");
					this.updateUI(obj);
				}
				catch(e)
				{
				}
				$("#configDialog").dialog("close");//close the dialog after the delay
			}.bind(this), 10);
		}
		else if(type == "upload")
		{
			var files = event.originalEvent.target.files;
			for (var i = 0; i < files.length; i++)
			{
				var file = files[i];
				var reader = new FileReader();
				reader.onloadend = function(readerObj)
				{
					try
					{
						eval("var obj = " + readerObj.result + ";");
						this.updateUI(obj);
					}
					catch(e)
					{
					}
				}.bind(this, reader);
				reader.readAsText(file);
			}
			$("#configDialog").dialog("close");
		}
	};

	p.loadImage = function(type, event, ui)
	{
		if(type == "select")
		{
			var value = $("#defaultImageSelector option:selected").text();
			if(value == "-Default Images-")
				return;
			this.addImage(value);
		}
		else if(type == "upload")
		{
			var files = event.originalEvent.target.files;
			for (var i = 0; i < files.length; i++)
			{
				var file = files[i];
				var reader = new FileReader();
				reader.onloadend = function(readerObj)
				{
					this.addImage(readerObj.result);
				}.bind(this, reader);
				reader.readAsDataURL(file);
			}
		}
		$("#imageDialog").dialog("close");
	};

	p.addImage = function(src)
	{
		if(!PIXI.Texture.fromFrame(src, true))
		{
			var tasks = [
				new cloudkid.PixiTask("image", [src], this.onTexturesLoaded)
			];
			
			cloudkid.TaskManager.process(tasks, function(){});
		}
		var item = jqImageDiv.clone();
		item.children("img").prop("src", src);
		$("#imageList").append(item);
		item.children(".remove").button({icons:{primary:"ui-icon-close"}, text:false}).click(removeImage);
		item.children(".download").button({icons:{primary:"ui-icon-arrowthickstop-1-s"}, text:false}).click(downloadImage);
	};

	var downloadImage = function(event, ui)
	{
		var src = $(event.delegateTarget).siblings("img").prop("src");
		window.open(src);
	};

	var removeImage = function(event, ui)
	{
		$(event.delegateTarget).parent().remove();
	};

	p.generateConfig = function()
	{
		var output = {};
		
		//particle settings
		output.alpha = {start: $("#alphaStart").slider("value"), end: $("#alphaEnd").slider("value")};
		output.scale = {start: $("#scaleStart").spinner("value"), end: $("#scaleEnd").spinner("value")};
		output.color = {start: $("#colorStart").val(), end: $("#colorEnd").val()};
		output.speed = {start: $("#speedStart").spinner("value"), end: $("#speedEnd").spinner("value")};
		output.startRotation = {min: $("#startRotationMin").spinner("value"), max: $("#startRotationMax").spinner("value")};
		output.rotationSpeed = {min: $("#rotationSpeedMin").spinner("value"), max: $("#rotationSpeedMax").spinner("value")};
		output.lifetime = {min: $("#lifeMin").spinner("value"), max: $("#lifeMax").spinner("value")};
		var val = $("#customEase").val();
		if(val)
		{
			try{
				eval("val = " + val + ";");
				if(val && typeof val != "string")
					output.ease = val;
			}
			catch(e)
			{
			}
		}
		//emitter settings
		output.frequency = $("#emitFrequency").spinner("value");
		output.emitterLifetime = $("#emitLifetime").spinner("value");
		output.maxParticles = $("#emitMaxParticles").spinner("value");
		output.pos = {x: $("#emitSpawnPosX").spinner("value"), y: $("#emitSpawnPosY").spinner("value")};
		output.addAtBack = $("#emitAddAtBack").prop("checked");
		//spawn type stuff
		var spawnType = output.spawnType = $("#emitSpawnType option:selected").val();
		if(spawnType == "arc")
			output.angle = {min: $("#emitAngleMin").spinner("value"), max: $("#emitAngleMax").spinner("value")};
		else if(spawnType == "rect")
			output.spawnRect = {x: $("#emitRectX").spinner("value"), y: $("#emitRectY").spinner("value"),
								w: $("#emitRectW").spinner("value"), h: $("#emitRectH").spinner("value")};
		else if(spawnType == "circle")
			output.spawnCircle = {x: $("#emitCircleX").spinner("value"), y: $("#emitCircleY").spinner("value"),
								r: $("#emitCircleR").spinner("value")};
		return output;
	};

	p.downloadConfig = function()
	{
		//could use "data:application/octet-stream;charset=utf-8,", but it just names the file "download"
		//by merely opening it, the download can be named in the save dialog
		var exportData = "data:text/json;charset=utf-8,";
		exportData += JSON.stringify(this.generateConfig(), null, "\t");
		var encodedUri = encodeURI(exportData);
		window.open(encodedUri);
	};

	p.loadFromUI = function()
	{
		this.loadSettings(this.getTexturesFromImageList(), this.generateConfig());
	};

	p.getTexturesFromImageList = function()
	{
		var images = [];
		var children = $("#imageList").find("img");
		if(children.length == 0)
			return null;
		children.each(function() { images.push($(this).prop("src")); })
		for(var i = 0; i < images.length; ++i)
		{
			images[i] = PIXI.Texture.fromImage(images[i]);
		}
		return images;
	}

	p.loadSettings = function(images, config)
	{
		emitter.init(images, config);
		emitter.updateOwnerPos(400, 250);
		emitterEnableTimer = 0;
	};

	p.update = function(elapsed)
	{
		emitter.update(elapsed * 0.001);
		
		if(!emitter.emit && emitterEnableTimer <= 0)
		{
			emitterEnableTimer = 1000 + emitter.maxLifetime * 1000;
		}
		else if(emitterEnableTimer > 0)
		{
			emitterEnableTimer -= elapsed;
			if(emitterEnableTimer <= 0)
				emitter.emit = true;
		}
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