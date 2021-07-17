/* eslint-disable no-lonely-if */
import { EaseSegment, SimpleEase } from './ParticleUtils';
import { ValueList } from './PropertyNode';
import { IPointData } from '@pixi/math';

export interface EmitterConfigV3
{
    lifetime: RandNumber;
    ease?: SimpleEase | EaseSegment[];
    particlesPerWave?: number;
    frequency: number;
    spawnChance?: number;
    emitterLifetime?: number;
    maxParticles?: number;
    addAtBack?: boolean;
    pos: { x: number; y: number };
    emit?: boolean;
    autoUpdate?: boolean;

    behaviors: {
        type: string;
        config: any;
    }[];
}

export interface RandNumber
{
    max: number;
    min: number;
}

export function upgradeConfig(config: EmitterConfigV2|EmitterConfigV1, art: any): EmitterConfigV3
{
    // just ensure we aren't given any V3 config data
    if ('behaviors' in config)
    {
        return config;
    }

    const out: EmitterConfigV3 = {
        lifetime: config.lifetime,
        ease: config.ease,
        particlesPerWave: config.particlesPerWave,
        frequency: config.frequency,
        spawnChance: config.spawnChance,
        emitterLifetime: config.emitterLifetime,
        maxParticles: config.maxParticles,
        addAtBack: config.addAtBack,
        pos: config.pos,
        emit: config.emit,
        autoUpdate: config.autoUpdate,
        behaviors: [],
    };

    // set up the alpha
    if (config.alpha)
    {
        if ('start' in config.alpha)
        {
            if (config.alpha.start === config.alpha.end)
            {
                if (config.alpha.start !== 1)
                {
                    out.behaviors.push({
                        type: 'alphaStatic',
                        config: { alpha: config.alpha.start },
                    });
                }
            }
            else
            {
                const list: ValueList<number> = {
                    list: [
                        { time: 0, value: config.alpha.start },
                        { time: 1, value: config.alpha.end },
                    ],
                };

                out.behaviors.push({
                    type: 'alpha',
                    config: { alpha: list },
                });
            }
        }
        else if (config.alpha.list.length === 1)
        {
            if (config.alpha.list[0].value !== 1)
            {
                out.behaviors.push({
                    type: 'alphaStatic',
                    config: { alpha: config.alpha.list[0].value },
                });
            }
        }
        else
        {
            out.behaviors.push({
                type: 'alpha',
                config: { alpha: config.alpha },
            });
        }
    }

    // acceleration movement
    if (config.acceleration && (config.acceleration.x || config.acceleration.y))
    {
        let minStart: number;
        let maxStart: number;

        if ('start' in config.speed)
        {
            minStart = config.speed.start * (config.speed.minimumSpeedMultiplier ?? 1);
            maxStart = config.speed.start;
        }
        else
        {
            minStart = config.speed.list[0].value * ((config as EmitterConfigV2).minimumSpeedMultiplier ?? 1);
            maxStart = config.speed.list[0].value;
        }

        out.behaviors.push({
            type: 'moveAcceleration',
            config: {
                accel: config.acceleration,
                minStart,
                maxStart,
                rotate: !config.noRotation,
                maxSpeed: config.maxSpeed,
            },
        });
    }
    // path movement
    else if (config.extraData?.path)
    {
        let list: ValueList<number>;
        let mult: number;

        if ('start' in config.speed)
        {
            mult = config.speed.minimumSpeedMultiplier ?? 1;
            if (config.speed.start === config.speed.end)
            {
                list = {
                    list: [{ time: 0, value: config.speed.start }],
                };
            }
            else
            {
                list = {
                    list: [
                        { time: 0, value: config.speed.start },
                        { time: 1, value: config.speed.end },
                    ],
                };
            }
        }
        else
        {
            list = config.speed;
            mult = ((config as EmitterConfigV2).minimumSpeedMultiplier ?? 1);
        }

        out.behaviors.push({
            type: 'movePath',
            config: {
                path: config.extraData.path,
                speed: list,
                minMult: mult,
            },
        });
    }
    // normal speed movement
    else
    {
        if ('start' in config.speed)
        {
            if (config.speed.start === config.speed.end)
            {
                out.behaviors.push({
                    type: 'moveSpeedStatic',
                    config: {
                        min: config.speed.start * (config.speed.minimumSpeedMultiplier ?? 1),
                        max: config.speed.start,
                    },
                });
            }
            else
            {
                const list: ValueList<number> = {
                    list: [
                        { time: 0, value: config.speed.start },
                        { time: 1, value: config.speed.end },
                    ],
                };

                out.behaviors.push({
                    type: 'moveSpeed',
                    config: { speed: list, minMult: config.speed.minimumSpeedMultiplier },
                });
            }
        }
        else if (config.speed.list.length === 1)
        {
            out.behaviors.push({
                type: 'moveSpeedStatic',
                config: {
                    min: config.speed.list[0].value * ((config as EmitterConfigV2).minimumSpeedMultiplier ?? 1),
                    max: config.speed.list[0].value,
                },
            });
        }
        else
        {
            out.behaviors.push({
                type: 'moveSpeed',
                config: { speed: config.speed, minMult: ((config as EmitterConfigV2).minimumSpeedMultiplier ?? 1) },
            });
        }
    }

    // scale
    if (config.scale)
    {
        if ('start' in config.scale)
        {
            const mult = config.scale.minimumScaleMultiplier ?? 1;

            if (config.scale.start === config.scale.end)
            {
                out.behaviors.push({
                    type: 'scaleStatic',
                    config: {
                        min: config.scale.start * mult,
                        max: config.scale.start,
                    },
                });
            }
            else
            {
                const list: ValueList<number> = {
                    list: [
                        { time: 0, value: config.scale.start },
                        { time: 1, value: config.scale.end },
                    ],
                };

                out.behaviors.push({
                    type: 'scale',
                    config: { scale: list, minMult: mult },
                });
            }
        }
        else if (config.scale.list.length === 1)
        {
            const mult = (config as EmitterConfigV2).minimumScaleMultiplier ?? 1;
            const scale = config.scale.list[0].value;

            out.behaviors.push({
                type: 'scaleStatic',
                config: { min: scale * mult, max: scale },
            });
        }
        else
        {
            out.behaviors.push({
                type: 'scale',
                config: { scale: config.scale, minMult: (config as EmitterConfigV2).minimumScaleMultiplier ?? 1 },
            });
        }
    }

    // color
    if (config.color)
    {
        if ('start' in config.color)
        {
            if (config.color.start === config.color.end)
            {
                if (config.color.start !== 'ffffff')
                {
                    out.behaviors.push({
                        type: 'colorStatic',
                        config: { color: config.color.start },
                    });
                }
            }
            else
            {
                const list: ValueList<string> = {
                    list: [
                        { time: 0, value: config.color.start },
                        { time: 1, value: config.color.end },
                    ],
                };

                out.behaviors.push({
                    type: 'color',
                    config: { color: list },
                });
            }
        }
        else if (config.color.list.length === 1)
        {
            if (config.color.list[0].value !== 'ffffff')
            {
                out.behaviors.push({
                    type: 'colorStatic',
                    config: { color: config.color.list[0].value },
                });
            }
        }
        else
        {
            out.behaviors.push({
                type: 'color',
                config: { color: config.color },
            });
        }
    }

    // rotation
    if (config.rotationAcceleration || config.rotationSpeed?.min || config.rotationSpeed.max)
    {
        out.behaviors.push({
            type: 'rotation',
            config: {
                accel: config.rotationAcceleration || 0,
                minSpeed: config.rotationSpeed?.min || 0,
                maxSpeed: config.rotationSpeed?.max || 0,
                minStart: config.startRotation?.min || 0,
                maxStart: config.startRotation?.max || 0,
            },
        });
    }
    else if (config.startRotation?.min || config.startRotation?.max)
    {
        out.behaviors.push({
            type: 'rotationStatic',
            config: {
                min: config.startRotation?.min || 0,
                max: config.startRotation?.max || 0,
            },
        });
    }
    if (config.noRotation)
    {
        out.behaviors.push({
            type: 'noRotation',
            config: {},
        });
    }

    // blend mode
    if (config.blendMode && config.blendMode !== 'normal')
    {
        out.behaviors.push({
            type: 'blendMode',
            config: {
                blendMode: config.blendMode,
            },
        });
    }

    // animated
    if (Array.isArray(art) && typeof art[0] !== 'string' && 'framerate' in art[0])
    {
        out.behaviors.push({
            type: 'animatedRandom',
            config: {
                anims: art,
            },
        });
    }
    else if (typeof art !== 'string' && 'framerate' in art)
    {
        out.behaviors.push({
            type: 'animatedSingle',
            config: {
                anim: art,
            },
        });
    }
    // ordered art
    else if (config.orderedArt && Array.isArray(art))
    {
        out.behaviors.push({
            type: 'textureOrdered',
            config: {
                textures: art,
            },
        });
    }
    // random texture
    else if (Array.isArray(art))
    {
        out.behaviors.push({
            type: 'textureRandom',
            config: {
                textures: art,
            },
        });
    }
    // single texture
    else
    {
        out.behaviors.push({
            type: 'textureSingle',
            config: {
                texture: art,
            },
        });
    }

    // spawn burst
    if (config.spawnType === 'burst')
    {
        out.behaviors.push({
            type: 'spawnBurst',
            config: {
                start: config.angleStart || 0,
                spacing: config.particleSpacing,
                // older formats bursted from a single point
                distance: 0,
            },
        });
    }
    // spawn point
    else if (config.spawnType === 'point')
    {
        out.behaviors.push({
            type: 'spawnPoint',
            config: {},
        });
    }
    // spawn shape
    else
    {
        let shape: any;

        if (config.spawnType === 'ring')
        {
            shape = {
                type: 'torus',
                data: {
                    x: config.spawnCircle.x,
                    y: config.spawnCircle.y,
                    radius: config.spawnCircle.r,
                    innerRadius: config.spawnCircle.minR,
                    affectRotation: true,
                },
            };
        }
        else if (config.spawnType === 'circle')
        {
            shape = {
                type: 'torus',
                data: {
                    x: config.spawnCircle.x,
                    y: config.spawnCircle.y,
                    radius: config.spawnCircle.r,
                    innerRadius: 0,
                    affectRotation: false,
                },
            };
        }
        else if (config.spawnType === 'rect')
        {
            shape = {
                type: 'rect',
                data: config.spawnRect,
            };
        }
        else if (config.spawnType === 'polygonalChain')
        {
            shape = {
                type: 'polygonalChain',
                data: config.spawnPolygon,
            };
        }
        out.behaviors.push({
            type: 'spawnShape',
            config: shape,
        });
    }

    return out;
}

export interface EmitterConfigV2 {
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
    spawnPolygon?: IPointData[] | IPointData[][];
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

export interface BasicTweenable<T> {
    start: T;
    end: T;
}

export interface EmitterConfigV1 {
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
    spawnPolygon?: IPointData[] | IPointData[][];
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
