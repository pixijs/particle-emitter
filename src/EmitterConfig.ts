import { EaseSegment, SimpleEase } from './ParticleUtils';
import { ValueList } from './PropertyNode';
import { BasicPoint } from './PolygonalChain';

export interface EmitterConfig {
	alpha?: ValueList<number>;
	speed?: ValueList<number>;
	minimumSpeedMultiplier?: number;
	maxSpeed?: number;
	acceleration?: {x: number; y: number};
	scale?: ValueList<number>;
	minimumScaleMultiplier?: number;
	color?: ValueList<string>;
	startRotation?: RandNumber;
	noRotation?: boolean;
	rotationSpeed?: RandNumber;
	rotationAcceleration?: number;
	lifetime: RandNumber;
	blendMode?: string;
	ease?: SimpleEase | EaseSegment[];
	extraData?: any;
	particlesPerWave?: number;
	/**
	 * Really "rect"|"circle"|"ring"|"burst"|"point"|"polygonalChain", but that
	 * tends to be too strict for random object creation.
	 */
	spawnType?: string;
	spawnRect?: {x: number; y: number; w: number; h: number};
	spawnCircle?: {x: number; y: number; r: number; minR?: number};
	particleSpacing?: number;
	angleStart?: number;
	spawnPolygon?: BasicPoint[] | BasicPoint[][];
	frequency: number;
	spawnChance?: number;
	emitterLifetime?: number;
	maxParticles?: number;
	addAtBack?: boolean;
	pos: {x: number; y: number};
	emit?: boolean;
	autoUpdate?: boolean;
	orderedArt?: boolean;
}

export interface RandNumber {
	max: number;
	min: number;
}

export interface BasicTweenable<T> {
	start: T;
	end: T;
}

export interface OldEmitterConfig {
	alpha?: BasicTweenable<number>;
	speed?: BasicTweenable<number> & {minimumSpeedMultiplier?: number};
	maxSpeed?: number;
	acceleration?: {x: number; y: number};
	scale?: BasicTweenable<number> & {minimumScaleMultiplier?: number};
	color?: BasicTweenable<string>;
	startRotation?: RandNumber;
	noRotation?: boolean;
	rotationSpeed?: RandNumber;
	rotationAcceleration?: number;
	lifetime: RandNumber;
	blendMode?: string;
	ease?: SimpleEase | EaseSegment[];
	extraData?: any;
	particlesPerWave?: number;
	/**
	 * Really "rect"|"circle"|"ring"|"burst"|"point"|"polygonalChain", but that
	 * tends to be too strict for random object creation.
	 */
	spawnType?: string;
	spawnRect?: {x: number; y: number; w: number; h: number};
	spawnCircle?: {x: number; y: number; r: number; minR?: number};
	particleSpacing?: number;
	angleStart?: number;
	spawnPolygon?: BasicPoint[] | BasicPoint[][];
	frequency: number;
	spawnChance?: number;
	emitterLifetime?: number;
	maxParticles?: number;
	addAtBack?: boolean;
	pos: {x: number; y: number};
	emit?: boolean;
	autoUpdate?: boolean;
	orderedArt?: boolean;
}
