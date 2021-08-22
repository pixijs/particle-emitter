// Override requires so that the local pixi-particles gets the @pixi packages
// from this test project, not from the top level.
import * as PIXIConstants from '@pixi/constants';
import * as PIXICore from '@pixi/core';
import * as PIXIDisplay from '@pixi/display';
import * as PIXIMath from '@pixi/math';
import * as PIXISettings from '@pixi/settings';
import * as PIXISprite from '@pixi/sprite';
import * as PIXITicker from '@pixi/ticker';

const isOverride = (request: string) => {
	return resolveRequest(request) ? true : false;
};

const resolveRequest = (request: string) => {
	switch (request) {
		case '@pixi/constants': return PIXIConstants;
		case '@pixi/core': return PIXICore;
		case '@pixi/display': return PIXIDisplay;
		case '@pixi/math': return PIXIMath;
		case '@pixi/settings': return PIXISettings;
		case '@pixi/sprite': return PIXISprite;
		case '@pixi/ticker': return PIXITicker;
		default: return undefined;
	}
};

require('override-require')(isOverride, resolveRequest);

// Direct dependencies used by the test.
import { Container } from '@pixi/display';
import { Renderer, BatchRenderer, Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Emitter } from "pixi-particles";

Renderer.registerPlugin('batch', BatchRenderer);

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
const stage = new Container(),
	renderer = new Renderer(rendererOptions);
let emitter:Emitter = null,
	bg:Sprite = null;

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

bg = new Sprite(Texture.WHITE);
//bg is a 1px by 1px image
bg.scale.x = canvas.width;
bg.scale.y = canvas.height;
bg.tint = 0x000000;
stage.addChild(bg);
// Create the new emitter and attach it to the stage
const emitterContainer = new Container();
stage.addChild(emitterContainer);
(window as any).emitter = emitter = new Emitter(
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