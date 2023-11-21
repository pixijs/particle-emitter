/* eslint-disable no-lonely-if */
import { EaseSegment, SimpleEase } from './ParticleUtils';
import { ValueList } from './PropertyNode';
import { IPointData } from '@pixi/math';

/**
 * Full Emitter configuration for initializing an Emitter instance.
 */
export interface EmitterConfigV3
{
    /**
     * Random number configuration for picking the lifetime for each particle..
     */
    lifetime: RandNumber;
    /**
     * Easing to be applied to all interpolated or stepped values across the particle lifetime.
     */
    ease?: SimpleEase | EaseSegment[];
    /**
     * How many particles to spawn at once, each time that it is determined that particles should be spawned.
     * If omitted, only one particle will spawn at a time.
     */
    particlesPerWave?: number;
    /**
     * How often to spawn particles. This is a value in seconds, so a value of 0.5 would be twice a second.
     */
    frequency: number;
    /**
     * Defines a chance to not spawn particles. Values lower than 1 mean particles may not be spawned each time.
     * If omitted, particles will always spawn.
     */
    spawnChance?: number;
    /**
     * How long to run the Emitter before it stops spawning particles. If omitted, runs forever (or until told to stop
     * manually).
     */
    emitterLifetime?: number;
    /**
     * Maximum number of particles that can be alive at any given time for this emitter.
     */
    maxParticles?: number;
    /**
     * If newly spawned particles should be added to the back of the parent container (to make them less conspicuous
     * as they pop in). If omitted, particles will be added to the top of the container.
     */
    addAtBack?: boolean;
    /**
     * Default position to spawn particles from inside the parent container.
     */
    pos: { x: number; y: number };
    /**
     * If the emitter should start out emitting particles. If omitted, it will be treated as `true` and will emit particles
     * immediately.
     */
    emit?: boolean;
    /**
     * If the Emitter should hook into PixiJS's shared ticker. If this is false or emitted, you will be responsible for
     * connecting it to update ticks.
     */
    autoUpdate?: boolean;

    /**
     * The list of behaviors to apply to this emitter. See the behaviors namespace for
     * a list of built in behaviors. Custom behaviors may be registered with {@link Emitter.registerBehavior}.
     */
    behaviors: BehaviorEntry[];
}

/**
 * See {@link EmitterConfigV3.behaviors}
 */
export interface BehaviorEntry
{
    /**
     * The behavior type, as defined as the static `type` property of a behavior class.
     */
    type: string;
    /**
     * Configuration data specific to that behavior.
     */
    config: any;
}

/**
 * Configuration for how to pick a random number (inclusive).
 */
export interface RandNumber
{
    /**
     * Maximum pickable value.
     */
    max: number;
    /**
     * Minimum pickable value.
     */
    min: number;
}

/**
 * Converts emitter configuration from pre-5.0.0 library values into the current version.
 *
 * Example usage:
 * ```javascript
 * const emitter = new Emitter(myContainer, upgradeConfig(myOldConfig, [myTexture, myOtherTexture]));
 * ```
 * @param config The old emitter config to upgrade.
 * @param art The old art values as would have been passed into the Emitter constructor or `Emitter.init()`
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function upgradeConfig(config: EmitterConfigV2|EmitterConfigV1, art: any): EmitterConfigV3
{
    // just ensure we aren't given any V3 config data
    if ('behaviors' in config)
    {
        return config as EmitterConfigV3;
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
        if (config.speed)
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
    if (config.rotationAcceleration || config.rotationSpeed?.min || config.rotationSpeed?.max)
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
        for (let i = 0; i < art.length; ++i)
        {
            if (art[i].framerate === 'matchLife')
            {
                art[i].framerate = -1;
            }
        }
        out.behaviors.push({
            type: 'animatedRandom',
            config: {
                anims: art,
            },
        });
    }
    else if (typeof art !== 'string' && 'framerate' in art)
    {
        if (art.framerate === 'matchLife')
        {
            art.framerate = -1;
        }
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

        if (shape)
        {
            out.behaviors.push({
                type: 'spawnShape',
                config: shape,
            });
        }
    }

    return out;
}

/**
 * The obsolete emitter configuration format from version 3.0.0 of the library.
 * This type information is kept to make it easy to upgrade, but otherwise
 * configuration should be made as {@link EmitterConfigV3}.
 */
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

/**
 * The obsolete emitter configuration format of the initial library release.
 * This type information is kept to maintain compatibility with the older particle tool, but otherwise
 * configuration should be made as {@link EmitterConfigV3}.
 */
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
