// Typings for pixi-particles 3.1.0, requires Pixi.js typings
declare namespace particles {
	type TexSrc = string|PIXI.Texture;
	type Color = {r:number, g:number, b:number};
	
	export interface ValueList {
		list: {value:number|string, time:number}[],
		isStepped?: boolean;
		ease?: (lerp:number)=>number|EaseSegment[];
	}

	export interface ParticleConstructor {
		new (emitter:Emitter):Particle;
	}
	
	export interface AnimatedParticleArt {
		textures:(TexSrc|{count:number, texture:TexSrc})[];
		framerate:number|"matchLife";
		loop?:boolean;
	}
	
	export interface ParsedAnimatedParticleArt {
		textures:PIXI.Texture[];
		framerate:number;
		elapsed:number;
		loop:boolean;
	}
	
	export class AnimatedParticle extends Particle {
		private textures:PIXI.Texture[];
		private duration:number;
		private framerate:number;
		private elapsed:number;
		private loop:boolean;
		
		public static parseArt(art:AnimatedParticleArt[]):ParsedAnimatedParticleArt[];
		
		public applyArt(art:ParsedAnimatedParticleArt):void;
	}
	
	export class Emitter {
		private _particleConstructor:new (emitter:Emitter)=>Particle;
		private _frequency:number;
		private _spawnFunc:(p:Particle, emitPosX:number, emitPosY:number, i:number)=>void;
		private _prevEmitterPos:PIXI.Point;
		private _prevPosIsValid:boolean;
		private _posChanged:boolean;
		private _parent:PIXI.Container;
		private _emit:boolean;
		private _spawnTimer:number;
		private _emitterLife:number;
		private _activeParticlesFirst:Particle;
		private _activeParticlesLast:Particle;
		private _poolFirst:Particle;
		private _origConfig:any;
		private _origArt:any;
		private _autoUpdate:boolean;
		private _destroyWhenComplete:boolean;
		private _completeCallback:()=>void;
		
		public particleImages:any[];
		public startAlpha:PropertyNode;
		public startSpeed:PropertyNode;
		public minimumSpeedMultiplier:number;
		public acceleration:PIXI.Point;
		public maxSpeed:number;
		public startScale:PropertyNode;
		public minimumScaleMultiplier:number;
		public startColor:PropertyNode;
		public minLifetime:number;
		public maxLifetime:number;
		public minStartRotation:number;
		public maxStartRotation:number;
		public noRotation:boolean;
		public minRotationSpeed:number;
		public maxRotationSpeed:number;
		public particleBlendMode:number;
		public customEase:(time:number)=>number;
		public extraData:any;
		public maxParticles:number;
		public emitterLifetime:number;
		public readonly spawnPos:PIXI.Point;
		public readonly spawnType:"point"|"rectangle"|"circle"|"burst"|"ring";
		public spawnRect:PIXI.Rectangle;
		public spawnCircle:PIXI.Circle;
		public particlesPerWave:number;
		public particleSpacing:number;
		public angleStart:number;
		public readonly rotation:number;
		public readonly ownerPos:PIXI.Point;
		public addAtBack:boolean;
		public readonly particleCount:number;
		public frequency:number;
		public spawnChance:number;
		public particleConstructor:ParticleConstructor;
		public parent:PIXI.Container;
		public emit:boolean;
		public autoUpdate:boolean;
		
		constructor(particleParent:PIXI.Container, particleImages:any, config:any);
		
		private recycle(p:Particle):void;
		private _spawnPoint(p:Particle, emitPosX:number, emitPosY:number, i:number):void;
		private _spawnRect(p:Particle, emitPosX:number, emitPosY:number, i:number):void;
		private _spawnCircle(p:Particle, emitPosX:number, emitPosY:number, i:number):void;
		private _spawnRing(p:Particle, emitPosX:number, emitPosY:number, i:number):void;
		private _spawnBurst(p:Particle, emitPosX:number, emitPosY:number, i:number):void;
		
		public init(art:any, config:any):void;
		public rotate(newRot:number):void;
		public updateSpawnPos(x:number, y:number):void;
		public updateOwnerPos(x:number, y:number):void;
		public resetPositionTracking():void;
		public update(delta:number):void;
		public playOnceAndDestroy(callback?:()=>void):void;
		public playOnce(callback?:()=>void):void;
		public cleanup():void;
		public destroy():void;
	}
	
	export class Particle extends PIXI.Sprite {
		private _doAlpha:boolean;
		private _doScale:boolean;
		private _doSpeed:boolean;
		private _doAcceleration:boolean;
		private _doColor:boolean;
		private _doNormalMovement:boolean;
		private _oneOverLife:number;
		private next:Particle;
		private prev:Particle;
		
		public emitter:Emitter;
		public velocity:PIXI.Point;
		public maxLife:number;
		public age:number;
		public ease:(time:number)=>number;
		public extraData:any;
		public alphaList:PropertyList;
		public speedList:PropertyList;
		public acceleration:PIXI.Point;
		public maxSpeed:number;
		public scaleList:PropertyList;
		public colorList:PropertyList;
		
		/** Note that for Particle, the parameter is an array of strings or PIXI.Textures, and an array of Textures is returned. */
		public static parseArt(art:any):any;
		public static parseData(data:any):any;
		
		constructor(emitter:Emitter);
		
		protected Particle_init():void;
		protected Particle_update(delta:number):number;
		
		public init():void;
		/** Note that for Particle, the parameter is of type PIXI.Texture */
		public applyArt(art:any):void;
		public update(delta:number):number;
		public kill():void;
		public destroy():void;
	}
	
	export interface EaseSegment {
		cp:number;
		s:number;
		e:number;
	}
	
	export class ParticleUtils {
		public static verbose:boolean;
		public static rotatePoint(angle:number, p:PIXI.Point):void;
		public static combineRGBComponents(r:number, g:number, b:number):number;
		public static normalize(p:PIXI.Point):void;
		public static scaleBy(p:PIXI.Point, value:number):void;
		public static length(p:PIXI.Point):number;
		public static hexToRGB(color:string, output?:[number, number, number]):[number, number, number];
		public static generateEase(segments:EaseSegment[]):(time:number)=>number;
		public static getBlendMode(name:string):number;
		public static createSteppedGradient(list:{value:string, time:number}, numSteps?:number):PropertyNode;
	}
	
	export class PathParticle extends Particle {
		public path:(x:number)=>number;
		public initialRotation:number;
		public initialPosition:PIXI.Point;
		public movement:number;
		
		public static parseArt(art:TexSrc[]):PIXI.Texture[];
		public static parseData(data:{path:string}):any;
	}
	
	export class PropertyList {
		public current: PropertyNode;
		protected next: PropertyNode;
		private isColor: boolean;
		private ease: Function;
		
		constructor(isColor?:boolean);
		public interpolate(lerp:number):number;
		public reset(first:PropertyNode):void;
	}
	
	export class PropertyNode {
		public value: number|Color;
		public time: number;
		public next: PropertyNode;
		public isStepped: boolean;
		private interpolate: (lerp:number)=>number;
		private ease: (lerp:number)=>number;
		
		public static createList(data:ValueList):PropertyNode;
	}
}

export = particles;