// PIXI v6 doesn't have ambient types anymore
declare const PIXI: any;

const config = {
	"lifetime": {
		"min": 0.25,
		"max": 0.5
	},
	"frequency": 0.001,
	"emitterLifetime": 0,
	"maxParticles": 1000,
	"addAtBack": false,
	"pos": {
		"x": 0,
		"y": 0
	},
	"behaviors": [
		{
			"type": "alpha",
			"config": {
				"alpha": {
					"list": [
						{
							"time": 0,
							"value": 1
						},
						{
							"time": 1,
							"value": 0.31
						}
					]
				}
			}
		},
		{
			"type": "moveAcceleration",
			"config": {
				"accel": {
					"x": 0,
					"y": 2000
				},
				"minStart": 600,
				"maxStart": 600,
				"rotate": true
			}
		},
		{
			"type": "scale",
			"config": {
				"scale": {
					"list": [
						{
							"time": 0,
							"value": 0.5
						},
						{
							"time": 1,
							"value": 1
						}
					]
				},
				"minMult": 1
			}
		},
		{
			"type": "color",
			"config": {
				"color": {
					"list": [
						{
							"time": 0,
							"value": "ffffff"
						},
						{
							"time": 1,
							"value": "9ff3ff"
						}
					]
				}
			}
		},
		{
			"type": "rotationStatic",
			"config": {
				"min": 260,
				"max": 280
			}
		},
		{
			"type": "textureRandom",
			"config": {
				"textures": [
					"../../docs/examples/images/Sparks.png"
				]
			}
		},
		{
			"type": "spawnShape",
			"config": {
				"type": "torus",
				"data": {
					"x": 0,
					"y": 0,
					"radius": 0,
					"innerRadius": 0,
					"affectRotation": false
				}
			}
		}
	]
};
const canvas = document.getElementById("stage") as HTMLCanvasElement;
// Basic PIXI Setup
const rendererOptions =
{
	width: canvas.width,
	height: canvas.height,
	view: canvas,
};
const stage = new PIXI.Container(),
	renderer = new PIXI.Renderer(rendererOptions);
let emitter:any = null,
	bg:any = null;

// Calculate the current time
let elapsed = Date.now();

let updateId:number;
// Update function every frame
const update = function(){

	// Update the next frame
	updateId = requestAnimationFrame(update);

	const now = Date.now();
	if (emitter)
		emitter.update((now - elapsed) * 0.001);

	elapsed = now;

	// render the stage
	renderer.render(stage);
};

// Resize the canvas to the size of the window
window.onresize = function() {
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
window.onresize(null);

bg = new PIXI.Sprite(PIXI.Texture.WHITE);
//bg is a 1px by 1px image
bg.scale.x = canvas.width;
bg.scale.y = canvas.height;
bg.tint = 0x000000;
stage.addChild(bg);
// Create the new emitter and attach it to the stage
const emitterContainer = new PIXI.Container();
stage.addChild(emitterContainer);
(window as any).emitter = emitter = new PIXI.particles.Emitter(
	emitterContainer,
	config
);

// Center on the stage
emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);

// Click on the canvas to trigger
canvas.addEventListener('mouseup', function(e){
	if(!emitter) return;
	emitter.emit = true;
	emitter.resetPositionTracking();
	emitter.updateOwnerPos(e.offsetX, e.offsetY);
});

// Start the update
update();

//for testing and debugging
(window as any).destroyEmitter = function()
{
	emitter.destroy();
	emitter = null;
	(window as any).destroyEmitter = null;

	renderer.render(stage);
};