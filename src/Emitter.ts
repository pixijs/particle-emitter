import { ParticleUtils, Color, SimpleEase } from './ParticleUtils';
import { Particle } from './Particle';
import { PropertyNode } from './PropertyNode';
import { PolygonalChain } from './PolygonalChain';
import { EmitterConfig, OldEmitterConfig } from './EmitterConfig';
import { Point, Circle, Rectangle, Container, settings } from 'pixi.js';
// eslint-disable-next-line no-duplicate-imports
import * as pixi from 'pixi.js';
// get the shared ticker, in V4 and V5 friendly methods
/**
 * @hidden
 */
let ticker: pixi.ticker.Ticker;
// to avoid Rollup transforming our import, save pixi namespace in a variable
const pixiNS = pixi;

if (parseInt((/^(\d+)\./).exec(pixi.VERSION)[1], 10) < 5)
{
    ticker = pixiNS.ticker.shared;
}
else
{
    ticker = (pixiNS as any).Ticker.shared;
}

export interface ParticleConstructor
{
    new (emitter: Emitter): Particle;
}

/**
 * @hidden
 */
const helperPoint = new Point();

/**
 * A particle emitter.
 */
export class Emitter
{
    /**
     * The constructor used to create new particles. The default is
     * the built in particle class.
     */
    protected _particleConstructor: typeof Particle;
    // properties for individual particles
    /**
     * An array of PIXI Texture objects.
     */
    public particleImages: any[];
    /**
     * The first node in the list of alpha values for all particles.
     */
    public startAlpha: PropertyNode<number>;
    /**
     * The first node in the list of speed values of all particles.
     */
    public startSpeed: PropertyNode<number>;
    /**
     * A minimum multiplier for the speed of a particle at all stages of its life. A value between
     * minimumSpeedMultiplier and 1 is randomly generated for each particle.
     */
    public minimumSpeedMultiplier: number;
    /**
     * Acceleration to apply to particles. Using this disables
     * any interpolation of particle speed. If the particles do
     * not have a rotation speed, then they will be rotated to
     * match the direction of travel.
     */
    public acceleration: Point;
    /**
     * The maximum speed allowed for accelerating particles. Negative values, values of 0 or NaN
     * will disable the maximum speed.
     */
    public maxSpeed: number;
    /**
     * The first node in the list of scale values of all particles.
     */
    public startScale: PropertyNode<number>;
    /**
     * A minimum multiplier for the scale of a particle at all stages of its life. A value between
     * minimumScaleMultiplier and 1 is randomly generated for each particle.
     */
    public minimumScaleMultiplier: number;
    /**
     * The first node in the list of  color values of all particles, as red, green, and blue
     * uints from 0-255.
     */
    public startColor: PropertyNode<Color>;
    /**
     * The minimum lifetime for a particle, in seconds.
     */
    public minLifetime: number;
    /**
     * The maximum lifetime for a particle, in seconds.
     */
    public maxLifetime: number;
    /**
     * The minimum start rotation for a particle, in degrees. This value
     * is ignored if the spawn type is "burst" or "arc".
     */
    public minStartRotation: number;
    /**
     * The maximum start rotation for a particle, in degrees. This value
     * is ignored if the spawn type is "burst" or "arc".
     */
    public maxStartRotation: number;
    /**
     * If no particle rotation should occur. Starting rotation will still
     * affect the direction in which particles move. If the rotation speed
     * is set, then this will be ignored.
     */
    public noRotation: boolean;
    /**
     * The minimum rotation speed for a particle, in degrees per second.
     * This only visually spins the particle, it does not change direction
     * of movement.
     */
    public minRotationSpeed: number;
    /**
     * The maximum rotation speed for a particle, in degrees per second.
     * This only visually spins the particle, it does not change direction
     * of movement.
     */
    public maxRotationSpeed: number;
    /**
    * The Acceleration of rotation (angular acceleration) for a particle, in degrees per second.
    */
    public rotationAcceleration: number;
    /**
     * The blend mode for all particles, as named by PIXI.blendModes.
     */
    public particleBlendMode: number;
    /**
     * An easing function for nonlinear interpolation of values. Accepts a single
     * parameter of time as a value from 0-1, inclusive. Expected outputs are values
     * from 0-1, inclusive.
     */
    public customEase: SimpleEase;
    /**
     *	Extra data for use in custom particles. The emitter doesn't look inside, but
     *	passes it on to the particle to use in init().
     */
    public extraData: any;
    // properties for spawning particles
    /**
     * Time between particle spawns in seconds.
     */
    protected _frequency: number;
    /**
     * Chance that a particle will be spawned on each opportunity to spawn one.
     * 0 is 0%, 1 is 100%.
     */
    public spawnChance: number;
    /**
     * Maximum number of particles to keep alive at a time. If this limit
     * is reached, no more particles will spawn until some have died.
     */
    public maxParticles: number;
    /**
     * The amount of time in seconds to emit for before setting emit to false.
     * A value of -1 is an unlimited amount of time.
     */
    public emitterLifetime: number;
    /**
     * Position at which to spawn particles, relative to the emitter's owner's origin.
     * For example, the flames of a rocket travelling right might have a spawnPos
     * of {x:-50, y:0}.
     * to spawn at the rear of the rocket.
     * To change this, use updateSpawnPos().
     */
    public spawnPos: Point;
    /**
     * How the particles will be spawned. Valid types are "point", "rectangle",
     * "circle", "burst", "ring".
     */
    public spawnType: string;
    /**
     * A reference to the emitter function specific to the spawn type.
     */
    protected _spawnFunc: (p: Particle, emitPosX: number, emitPosY: number, i?: number) => void;
    /**
     * A rectangle relative to spawnPos to spawn particles inside if the spawn type is "rect".
     */
    public spawnRect: Rectangle;
    /**
     * A polygon relative to spawnPos to spawn particles on the chain if the spawn type is "polygonalChain".
     */
    public spawnPolygonalChain: PolygonalChain;
    /**
     * A circle relative to spawnPos to spawn particles inside if the spawn type is "circle".
     */
    public spawnCircle: Circle & {minRadius: number};
    /**
     * Number of particles to spawn time that the frequency allows for particles to spawn.
     */
    public particlesPerWave: number;
    /**
     * Spacing between particles in a burst. 0 gives a random angle for each particle.
     */
    public particleSpacing: number;
    /**
     * Angle at which to start spawning particles in a burst.
     */
    public angleStart: number;
    /**
     * Rotation of the emitter or emitter's owner in degrees. This is added to
     * the calculated spawn angle.
     * To change this, use rotate().
     */
    protected rotation: number;
    /**
     * The world position of the emitter's owner, to add spawnPos to when
     * spawning particles. To change this, use updateOwnerPos().
     */
    protected ownerPos: Point;
    /**
     * The origin + spawnPos in the previous update, so that the spawn position
     * can be interpolated to space out particles better.
     */
    protected _prevEmitterPos: Point;
    /**
     * If _prevEmitterPos is valid, to prevent interpolation on the first update
     */
    protected _prevPosIsValid: boolean;
    /**
     * If either ownerPos or spawnPos has changed since the previous update.
     */
    protected _posChanged: boolean;
    /**
     * The container to add particles to.
     */
    protected _parent: Container;
    /**
     * If particles should be added at the back of the display list instead of the front.
     */
    public addAtBack: boolean;
    /**
     * The current number of active particles.
     */
    public particleCount: number;
    /**
     * If particles should be emitted during update() calls. Setting this to false
     * stops new particles from being created, but allows existing ones to die out.
     */
    protected _emit: boolean;
    /**
     * The timer for when to spawn particles in seconds, where numbers less
     * than 0 mean that particles should be spawned.
     */
    protected _spawnTimer: number;
    /**
     * The life of the emitter in seconds.
     */
    protected _emitterLife: number;
    /**
     * The particles that are active and on the display list. This is the first particle in a
     * linked list.
     */
    protected _activeParticlesFirst: Particle;
    /**
     * The particles that are active and on the display list. This is the last particle in a
     * linked list.
     */
    protected _activeParticlesLast: Particle;
    /**
     * The particles that are not currently being used. This is the first particle in a
     * linked list.
     */
    protected _poolFirst: Particle;
    /**
     * The original config object that this emitter was initialized with.
     */
    protected _origConfig: any;
    /**
     * The original particle image data that this emitter was initialized with.
     */
    protected _origArt: any;
    /**
     * If the update function is called automatically from the shared ticker.
     * Setting this to false requires calling the update function manually.
     */
    protected _autoUpdate: boolean;
    /**
     * A number keeping index of currently applied image. Used to emit arts in order.
     */
    protected _currentImageIndex = -1;
    /**
     * If the emitter should destroy itself when all particles have died out. This is set by
     * playOnceAndDestroy();
     */
    protected _destroyWhenComplete: boolean;
    /**
     * A callback for when all particles have died out. This is set by
     * playOnceAndDestroy() or playOnce();
     */
    protected _completeCallback: () => void;

    /**
     * @param particleParent The container to add the particles to.
     * @param particleImages A texture or array of textures to use
     *                       for the particles. Strings will be turned
     *                       into textures via Texture.fromImage().
     * @param config A configuration object containing settings for the emitter.
     * @param config.emit If config.emit is explicitly passed as false, the
     *                    Emitter will start disabled.
     * @param config.autoUpdate If config.autoUpdate is explicitly passed as
     *                          true, the Emitter will automatically call
     *                          update via the PIXI shared ticker.
     */
    constructor(particleParent: Container, particleImages: any, config: EmitterConfig|OldEmitterConfig)
    {
        this._particleConstructor = Particle;
        // properties for individual particles
        this.particleImages = null;
        this.startAlpha = null;
        this.startSpeed = null;
        this.minimumSpeedMultiplier = 1;
        this.acceleration = null;
        this.maxSpeed = NaN;
        this.startScale = null;
        this.minimumScaleMultiplier = 1;
        this.startColor = null;
        this.minLifetime = 0;
        this.maxLifetime = 0;
        this.minStartRotation = 0;
        this.maxStartRotation = 0;
        this.noRotation = false;
        this.minRotationSpeed = 0;
        this.maxRotationSpeed = 0;
        this.particleBlendMode = 0;
        this.customEase = null;
        this.extraData = null;
        // properties for spawning particles
        this._frequency = 1;
        this.spawnChance = 1;
        this.maxParticles = 1000;
        this.emitterLifetime = -1;
        this.spawnPos = null;
        this.spawnType = null;
        this._spawnFunc = null;
        this.spawnRect = null;
        this.spawnCircle = null;
        this.spawnPolygonalChain = null;
        this.particlesPerWave = 1;
        this.particleSpacing = 0;
        this.angleStart = 0;
        // emitter properties
        this.rotation = 0;
        this.ownerPos = null;
        this._prevEmitterPos = null;
        this._prevPosIsValid = false;
        this._posChanged = false;
        this._parent = null;
        this.addAtBack = false;
        this.particleCount = 0;
        this._emit = false;
        this._spawnTimer = 0;
        this._emitterLife = -1;
        this._activeParticlesFirst = null;
        this._activeParticlesLast = null;
        this._poolFirst = null;
        this._origConfig = null;
        this._origArt = null;
        this._autoUpdate = false;
        this._currentImageIndex = -1;
        this._destroyWhenComplete = false;
        this._completeCallback = null;

        // set the initial parent
        this.parent = particleParent;

        if (particleImages && config)
        {
            this.init(particleImages, config);
        }

        // save often used functions on the instance instead of the prototype for better speed
        this.recycle = this.recycle;
        this.update = this.update;
        this.rotate = this.rotate;
        this.updateSpawnPos = this.updateSpawnPos;
        this.updateOwnerPos = this.updateOwnerPos;
    }

    /**
     * If the emitter is using particle art in order as provided in `particleImages`.
     * Effective only when `particleImages` has multiple art options.
     * This is particularly useful ensuring that each art shows up once, in case you need to emit a body in an order.
     * For example: dragon - [Head, body1, body2, ..., tail]
     */
    public get orderedArt(): boolean { return this._currentImageIndex !== -1; }
    public set orderedArt(value)
    {
        this._currentImageIndex = value ? 0 : -1;
    }

    /**
     * Time between particle spawns in seconds. If this value is not a number greater than 0,
     * it will be set to 1 (particle per second) to prevent infinite loops.
     */
    public get frequency(): number { return this._frequency; }
    public set frequency(value)
    {
        // do some error checking to prevent infinite loops
        if (typeof value === 'number' && value > 0)
        {
            this._frequency = value;
        }
        else
        {
            this._frequency = 1;
        }
    }
    /**
     * The constructor used to create new particles. The default is
     * the built in Particle class. Setting this will dump any active or
     * pooled particles, if the emitter has already been used.
     */
    public get particleConstructor(): typeof Particle { return this._particleConstructor; }
    public set particleConstructor(value)
    {
        if (value !== this._particleConstructor)
        {
            this._particleConstructor = value;
            // clean up existing particles
            this.cleanup();
            // scrap all the particles
            for (let particle = this._poolFirst; particle; particle = particle.next)
            {
                particle.destroy();
            }
            this._poolFirst = null;
            // re-initialize the emitter so that the new constructor can do anything it needs to
            if (this._origConfig && this._origArt)
            {
                this.init(this._origArt, this._origConfig);
            }
        }
    }

    /**
    * The container to add particles to. Settings this will dump any active particles.
    */
    public get parent(): Container { return this._parent; }
    public set parent(value)
    {
        this.cleanup();
        this._parent = value;
    }

    /**
     * Sets up the emitter based on the config settings.
     * @param art A texture or array of textures to use for the particles.
     * @param config A configuration object containing settings for the emitter.
     */
    public init(art: any, config: EmitterConfig|OldEmitterConfig): void
    {
        if (!art || !config)
        {
            return;
        }
        // clean up any existing particles
        this.cleanup();

        // store the original config and particle images, in case we need to re-initialize
        // when the particle constructor is changed
        this._origConfig = config;
        this._origArt = art;

        // set up the array of data, also ensuring that it is an array
        art = Array.isArray(art) ? art.slice() : [art];
        // run the art through the particle class's parsing function
        const partClass = this._particleConstructor;

        this.particleImages = partClass.parseArt ? partClass.parseArt(art) : art;
        // /////////////////////////
        // Particle Properties   //
        // /////////////////////////
        // set up the alpha
        if (config.alpha)
        {
            this.startAlpha = PropertyNode.createList(config.alpha);
        }
        else
        {
            this.startAlpha = new PropertyNode(1, 0);
        }
        // set up the speed
        if (config.speed)
        {
            this.startSpeed = PropertyNode.createList(config.speed);
            // eslint-disable-next-line max-len
            this.minimumSpeedMultiplier = ('minimumSpeedMultiplier' in config ? config.minimumSpeedMultiplier : (config.speed as any).minimumSpeedMultiplier) || 1;
        }
        else
        {
            this.minimumSpeedMultiplier = 1;
            this.startSpeed = new PropertyNode(0, 0);
        }
        // set up acceleration
        const acceleration = config.acceleration;

        if (acceleration && (acceleration.x || acceleration.y))
        {
            // make sure we disable speed interpolation
            this.startSpeed.next = null;
            this.acceleration = new Point(acceleration.x, acceleration.y);
            this.maxSpeed = config.maxSpeed || NaN;
        }
        else
        {
            this.acceleration = new Point();
        }
        // set up the scale
        if (config.scale)
        {
            this.startScale = PropertyNode.createList(config.scale);
            // eslint-disable-next-line max-len
            this.minimumScaleMultiplier = ('minimumScaleMultiplier' in config ? config.minimumScaleMultiplier : (config.scale as any).minimumScaleMultiplier) || 1;
        }
        else
        {
            this.startScale = new PropertyNode(1, 0);
            this.minimumScaleMultiplier = 1;
        }
        // set up the color
        if (config.color)
        {
            this.startColor = PropertyNode.createList(config.color);
        }
        else
        {
            this.startColor = new PropertyNode({ r: 0xFF, g: 0xFF, b: 0xFF }, 0);
        }
        // set up the start rotation
        if (config.startRotation)
        {
            this.minStartRotation = config.startRotation.min;
            this.maxStartRotation = config.startRotation.max;
        }
        else
        {
            this.minStartRotation = this.maxStartRotation = 0;
        }
        if (config.noRotation
    && (this.minStartRotation || this.maxStartRotation))
        {
            this.noRotation = !!config.noRotation;
        }
        else
        {
            this.noRotation = false;
        }
        // set up the rotation speed
        if (config.rotationSpeed)
        {
            this.minRotationSpeed = config.rotationSpeed.min;
            this.maxRotationSpeed = config.rotationSpeed.max;
        }
        else
        {
            this.minRotationSpeed = this.maxRotationSpeed = 0;
        }

        this.rotationAcceleration = config.rotationAcceleration || 0;
        // set up the lifetime
        this.minLifetime = config.lifetime.min;
        this.maxLifetime = config.lifetime.max;
        // get the blend mode
        this.particleBlendMode = ParticleUtils.getBlendMode(config.blendMode);
        // use the custom ease if provided
        if (config.ease)
        {
            this.customEase = typeof config.ease === 'function'
                ? config.ease : ParticleUtils.generateEase(config.ease);
        }
        else
        {
            this.customEase = null;
        }
        // set up the extra data, running it through the particle class's parseData function.
        if (partClass.parseData)
        {
            this.extraData = partClass.parseData(config.extraData);
        }
        else
        {
            this.extraData = config.extraData || null;
        }
        // ////////////////////////
        // Emitter Properties   //
        // ////////////////////////
        // reset spawn type specific settings
        this.spawnRect = this.spawnCircle = null;
        this.particlesPerWave = 1;
        if (config.particlesPerWave && config.particlesPerWave > 1)
        {
            this.particlesPerWave = config.particlesPerWave;
        }
        this.particleSpacing = 0;
        this.angleStart = 0;
        // determine the spawn function to use
        this.parseSpawnType(config);
        // set the spawning frequency
        this.frequency = config.frequency;
        this.spawnChance = (typeof config.spawnChance === 'number' && config.spawnChance > 0) ? config.spawnChance : 1;
        // set the emitter lifetime
        this.emitterLifetime = config.emitterLifetime || -1;
        // set the max particles
        this.maxParticles = config.maxParticles > 0 ? config.maxParticles : 1000;
        // determine if we should add the particle at the back of the list or not
        this.addAtBack = !!config.addAtBack;
        // reset the emitter position and rotation variables
        this.rotation = 0;
        this.ownerPos = new Point();
        this.spawnPos = new Point(config.pos.x, config.pos.y);

        this.initAdditional(art, config);

        this._prevEmitterPos = this.spawnPos.clone();
        // previous emitter position is invalid and should not be used for interpolation
        this._prevPosIsValid = false;
        // start emitting
        this._spawnTimer = 0;
        this.emit = config.emit === undefined ? true : !!config.emit;
        this.autoUpdate = !!config.autoUpdate;
        this.orderedArt = !!config.orderedArt;
    }

    /**
     * Sets up additional parameters to the emitter from config settings.
     * Using for parsing additional parameters on classes that extend from Emitter
     * @param art A texture or array of textures to use for the particles.
     * @param config A configuration object containing settings for the emitter.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected initAdditional(art: any, config: EmitterConfig|OldEmitterConfig): void
    {
        // override in subclasses
    }

    /**
     * Parsing emitter spawn type from config settings.
     * Place for override and add new kind of spawn type
     * @param config A configuration object containing settings for the emitter.
     */
    protected parseSpawnType(config: EmitterConfig|OldEmitterConfig): void
    {
        let spawnCircle;

        switch (config.spawnType)
        {
            case 'rect':
                this.spawnType = 'rect';
                this._spawnFunc = this._spawnRect;
                const spawnRect = config.spawnRect;

                this.spawnRect = new Rectangle(spawnRect.x, spawnRect.y, spawnRect.w, spawnRect.h);
                break;
            case 'circle':
                this.spawnType = 'circle';
                this._spawnFunc = this._spawnCircle;
                spawnCircle = config.spawnCircle;
                this.spawnCircle = new Circle(spawnCircle.x, spawnCircle.y, spawnCircle.r) as any;
                break;
            case 'ring':
                this.spawnType = 'ring';
                this._spawnFunc = this._spawnRing;
                spawnCircle = config.spawnCircle;
                this.spawnCircle = new Circle(spawnCircle.x, spawnCircle.y, spawnCircle.r) as any;
                this.spawnCircle.minRadius = spawnCircle.minR;
                break;
            case 'burst':
                this.spawnType = 'burst';
                this._spawnFunc = this._spawnBurst;
                this.particleSpacing = config.particleSpacing;
                this.angleStart = config.angleStart ? config.angleStart : 0;
                break;
            case 'point':
                this.spawnType = 'point';
                this._spawnFunc = this._spawnPoint;
                break;
            case 'polygonalChain':
                this.spawnType = 'polygonalChain';
                this._spawnFunc = this._spawnPolygonalChain;
                this.spawnPolygonalChain = new PolygonalChain(config.spawnPolygon);
                break;
            default:
                this.spawnType = 'point';
                this._spawnFunc = this._spawnPoint;
                break;
        }
    }

    /**
     * Recycles an individual particle. For internal use only.
     * @param particle The particle to recycle.
     * @internal
     */
    public recycle(particle: Particle): void
    {
        if (particle.next)
        {
            particle.next.prev = particle.prev;
        }
        if (particle.prev)
        {
            particle.prev.next = particle.next;
        }
        if (particle === this._activeParticlesLast)
        {
            this._activeParticlesLast = particle.prev;
        }
        if (particle === this._activeParticlesFirst)
        {
            this._activeParticlesFirst = particle.next;
        }
        // add to pool
        particle.prev = null;
        particle.next = this._poolFirst;
        this._poolFirst = particle;
        // remove child from display, or make it invisible if it is in a ParticleContainer
        if (particle.parent)
        {
            particle.parent.removeChild(particle);
        }
        // decrease count
        --this.particleCount;
    }

    /**
     * Sets the rotation of the emitter to a new value.
     * @param newRot The new rotation, in degrees.
     */
    public rotate(newRot: number): void
    {
        if (this.rotation === newRot) return;
        // caclulate the difference in rotation for rotating spawnPos
        const diff = newRot - this.rotation;

        this.rotation = newRot;
        // rotate spawnPos
        ParticleUtils.rotatePoint(diff, this.spawnPos);
        // mark the position as having changed
        this._posChanged = true;
    }

    /**
     * Changes the spawn position of the emitter.
     * @param x The new x value of the spawn position for the emitter.
     * @param y The new y value of the spawn position for the emitter.
     */
    public updateSpawnPos(x: number, y: number): void
    {
        this._posChanged = true;
        this.spawnPos.x = x;
        this.spawnPos.y = y;
    }

    /**
     * Changes the position of the emitter's owner. You should call this if you are adding
     * particles to the world container that your emitter's owner is moving around in.
     * @param x The new x value of the emitter's owner.
     * @param y The new y value of the emitter's owner.
     */
    public updateOwnerPos(x: number, y: number): void
    {
        this._posChanged = true;
        this.ownerPos.x = x;
        this.ownerPos.y = y;
    }

    /**
     * Prevents emitter position interpolation in the next update.
     * This should be used if you made a major position change of your emitter's owner
     * that was not normal movement.
     */
    public resetPositionTracking(): void
    {
        this._prevPosIsValid = false;
    }

    /**
     * If particles should be emitted during update() calls. Setting this to false
     * stops new particles from being created, but allows existing ones to die out.
     */
    public get emit(): boolean { return this._emit; }
    public set emit(value)
    {
        this._emit = !!value;
        this._emitterLife = this.emitterLifetime;
    }

    /**
     * If the update function is called automatically from the shared ticker.
     * Setting this to false requires calling the update function manually.
     */
    public get autoUpdate(): boolean { return this._autoUpdate; }
    public set autoUpdate(value)
    {
        if (this._autoUpdate && !value)
        {
            ticker.remove(this.update, this);
        }
        else if (!this._autoUpdate && value)
        {
            ticker.add(this.update, this);
        }
        this._autoUpdate = !!value;
    }

    /**
     * Starts emitting particles, sets autoUpdate to true, and sets up the Emitter to destroy itself
     * when particle emission is complete.
     * @param callback Callback for when emission is complete (all particles have died off)
     */
    public playOnceAndDestroy(callback?: () => void): void
    {
        this.autoUpdate = true;
        this.emit = true;
        this._destroyWhenComplete = true;
        this._completeCallback = callback;
    }

    /**
     * Starts emitting particles and optionally calls a callback when particle emission is complete.
     * @param callback Callback for when emission is complete (all particles have died off)
     */
    public playOnce(callback?: () => void): void
    {
        this.emit = true;
        this._completeCallback = callback;
    }

    /**
     * Updates all particles spawned by this emitter and emits new ones.
     * @param delta Time elapsed since the previous frame, in __seconds__.
     */
    public update(delta: number): void
    {
        if (this._autoUpdate)
        {
            delta = delta / settings.TARGET_FPMS / 1000;
        }

        // if we don't have a parent to add particles to, then don't do anything.
        // this also works as a isDestroyed check
        if (!this._parent) return;
        // update existing particles
        let i;
        let particle;
        let next;

        for (particle = this._activeParticlesFirst; particle; particle = next)
        {
            next = particle.next;
            particle.update(delta);
        }
        let prevX;
        let prevY;
        // if the previous position is valid, store these for later interpolation

        if (this._prevPosIsValid)
        {
            prevX = this._prevEmitterPos.x;
            prevY = this._prevEmitterPos.y;
        }
        // store current position of the emitter as local variables
        const curX = this.ownerPos.x + this.spawnPos.x;
        const curY = this.ownerPos.y + this.spawnPos.y;
        // spawn new particles

        if (this._emit)
        {
            // decrease spawn timer
            this._spawnTimer -= delta < 0 ? 0 : delta;
            // while _spawnTimer < 0, we have particles to spawn
            while (this._spawnTimer <= 0)
            {
                // determine if the emitter should stop spawning
                if (this._emitterLife >= 0)
                {
                    this._emitterLife -= this._frequency;
                    if (this._emitterLife <= 0)
                    {
                        this._spawnTimer = 0;
                        this._emitterLife = 0;
                        this.emit = false;
                        break;
                    }
                }
                // determine if we have hit the particle limit
                if (this.particleCount >= this.maxParticles)
                {
                    this._spawnTimer += this._frequency;
                    continue;
                }
                // determine the particle lifetime
                let lifetime;

                if (this.minLifetime === this.maxLifetime)
                {
                    lifetime = this.minLifetime;
                }
                else
                {
                    lifetime = (Math.random() * (this.maxLifetime - this.minLifetime)) + this.minLifetime;
                }
                // only make the particle if it wouldn't immediately destroy itself
                if (-this._spawnTimer < lifetime)
                {
                    // If the position has changed and this isn't the first spawn,
                    // interpolate the spawn position
                    let emitPosX; let
                        emitPosY;

                    if (this._prevPosIsValid && this._posChanged)
                    {
                        // 1 - _spawnTimer / delta, but _spawnTimer is negative
                        const lerp = 1 + (this._spawnTimer / delta);

                        emitPosX = ((curX - prevX) * lerp) + prevX;
                        emitPosY = ((curY - prevY) * lerp) + prevY;
                    }
                    else// otherwise just set to the spawn position
                    {
                        emitPosX = curX;
                        emitPosY = curY;
                    }
                    // create enough particles to fill the wave (non-burst types have a wave of 1)
                    i = 0;
                    for (let len = Math.min(this.particlesPerWave, this.maxParticles - this.particleCount); i < len; ++i)
                    {
                        // see if we actually spawn one
                        if (this.spawnChance < 1 && Math.random() >= this.spawnChance)
                        {
                            continue;
                        }
                        // create particle
                        let p;

                        if (this._poolFirst)
                        {
                            p = this._poolFirst;
                            this._poolFirst = this._poolFirst.next;
                            p.next = null;
                        }
                        else
                        {
                            p = new this.particleConstructor(this);
                        }

                        // set a random texture if we have more than one
                        if (this.particleImages.length > 1)
                        {
                            // if using ordered art
                            if (this._currentImageIndex !== -1)
                            {
                                // get current art index, then increment for the next particle
                                p.applyArt(this.particleImages[this._currentImageIndex++]);
                                // loop around if needed
                                if (this._currentImageIndex < 0 || this._currentImageIndex >= this.particleImages.length)
                                {
                                    this._currentImageIndex = 0;
                                }
                            }
                            // otherwise grab a random one
                            else
                            {
                                p.applyArt(this.particleImages[Math.floor(Math.random() * this.particleImages.length)]);
                            }
                        }
                        else
                        {
                            // if they are actually the same texture, a standard particle
                            // will quit early from the texture setting in setTexture().
                            p.applyArt(this.particleImages[0]);
                        }
                        // set up the start and end values
                        p.alphaList.reset(this.startAlpha);
                        if (this.minimumSpeedMultiplier !== 1)
                        {
                            // eslint-disable-next-line max-len
                            p.speedMultiplier = (Math.random() * (1 - this.minimumSpeedMultiplier)) + this.minimumSpeedMultiplier;
                        }
                        p.speedList.reset(this.startSpeed);
                        p.acceleration.x = this.acceleration.x;
                        p.acceleration.y = this.acceleration.y;
                        p.maxSpeed = this.maxSpeed;
                        if (this.minimumScaleMultiplier !== 1)
                        {
                            // eslint-disable-next-line max-len
                            p.scaleMultiplier = (Math.random() * (1 - this.minimumScaleMultiplier)) + this.minimumScaleMultiplier;
                        }
                        p.scaleList.reset(this.startScale);
                        p.colorList.reset(this.startColor);
                        // randomize the rotation speed
                        if (this.minRotationSpeed === this.maxRotationSpeed)
                        {
                            p.rotationSpeed = this.minRotationSpeed;
                        }
                        else
                        {
                            // eslint-disable-next-line max-len
                            p.rotationSpeed = (Math.random() * (this.maxRotationSpeed - this.minRotationSpeed)) + this.minRotationSpeed;
                        }
                        p.rotationAcceleration = this.rotationAcceleration;
                        p.noRotation = this.noRotation;
                        // set up the lifetime
                        p.maxLife = lifetime;
                        // set the blend mode
                        p.blendMode = this.particleBlendMode;
                        // set the custom ease, if any
                        p.ease = this.customEase;
                        // set the extra data, if any
                        p.extraData = this.extraData;
                        // set additional properties to particle
                        this.applyAdditionalProperties(p);
                        // call the proper function to handle rotation and position of particle
                        this._spawnFunc(p, emitPosX, emitPosY, i);
                        // initialize particle
                        p.init();
                        // add the particle to the display list
                        if (!p.parent)
                        {
                            if (this.addAtBack)
                            {
                                this._parent.addChildAt(p, 0);
                            }
                            else
                            {
                                this._parent.addChild(p);
                            }
                        }
                        else
                        {
                            // kind of hacky, but performance friendly
                            // shuffle children to correct place
                            const children = this._parent.children;
                            // avoid using splice if possible

                            if (children[0] === p)
                            {
                                children.shift();
                            }
                            else if (children[children.length - 1] === p)
                            {
                                children.pop();
                            }
                            else
                            {
                                const index = children.indexOf(p);

                                children.splice(index, 1);
                            }
                            if (this.addAtBack)
                            {
                                children.unshift(p);
                            }
                            else
                            {
                                children.push(p);
                            }
                        }
                        // add particle to list of active particles
                        if (this._activeParticlesLast)
                        {
                            this._activeParticlesLast.next = p;
                            p.prev = this._activeParticlesLast;
                            this._activeParticlesLast = p;
                        }
                        else
                        {
                            this._activeParticlesLast = this._activeParticlesFirst = p;
                        }
                        ++this.particleCount;
                        // update the particle by the time passed, so the particles are spread out properly
                        p.update(-this._spawnTimer);// we want a positive delta, because a negative delta messes things up
                    }
                }
                // increase timer and continue on to any other particles that need to be created
                this._spawnTimer += this._frequency;
            }
        }
        // if the position changed before this update, then keep track of that
        if (this._posChanged)
        {
            this._prevEmitterPos.x = curX;
            this._prevEmitterPos.y = curY;
            this._prevPosIsValid = true;
            this._posChanged = false;
        }

        // if we are all done and should destroy ourselves, take care of that
        if (!this._emit && !this._activeParticlesFirst)
        {
            if (this._completeCallback)
            {
                const cb = this._completeCallback;

                this._completeCallback = null;
                cb();
            }
            if (this._destroyWhenComplete)
            {
                this.destroy();
            }
        }
    }

    /**
     * Set additional properties to new particle.
     * Using on classes that extend from Emitter
     * @param p The particle
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected applyAdditionalProperties(p: Particle): void
    {
        // for override in subclass
    }

    /**
     * Positions a particle for a point type emitter.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave. Not used for this function.
     */
    protected _spawnPoint(p: Particle, emitPosX: number, emitPosY: number): void
    {
        // set the initial rotation/direction of the particle based on
        // starting particle angle and rotation of emitter
        if (this.minStartRotation === this.maxStartRotation)
        {
            p.rotation = this.minStartRotation + this.rotation;
        }
        else
        {
            // eslint-disable-next-line max-len
            p.rotation = (Math.random() * (this.maxStartRotation - this.minStartRotation)) + this.minStartRotation + this.rotation;
        }
        // drop the particle at the emitter's position
        p.position.x = emitPosX;
        p.position.y = emitPosY;
    }

    /**
     * Positions a particle for a rectangle type emitter.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave. Not used for this function.
     */
    protected _spawnRect(p: Particle, emitPosX: number, emitPosY: number): void
    {
        // set the initial rotation/direction of the particle based on starting
        // particle angle and rotation of emitter
        if (this.minStartRotation === this.maxStartRotation)
        {
            p.rotation = this.minStartRotation + this.rotation;
        }
        else
        {
            // eslint-disable-next-line max-len
            p.rotation = (Math.random() * (this.maxStartRotation - this.minStartRotation)) + this.minStartRotation + this.rotation;
        }
        // place the particle at a random point in the rectangle
        helperPoint.x = (Math.random() * this.spawnRect.width) + this.spawnRect.x;
        helperPoint.y = (Math.random() * this.spawnRect.height) + this.spawnRect.y;
        if (this.rotation !== 0)
        {
            ParticleUtils.rotatePoint(this.rotation, helperPoint);
        }
        p.position.x = emitPosX + helperPoint.x;
        p.position.y = emitPosY + helperPoint.y;
    }

    /**
     * Positions a particle for a circle type emitter.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave. Not used for this function.
     */
    protected _spawnCircle(p: Particle, emitPosX: number, emitPosY: number): void
    {
        // set the initial rotation/direction of the particle based on starting
        // particle angle and rotation of emitter
        if (this.minStartRotation === this.maxStartRotation)
        {
            p.rotation = this.minStartRotation + this.rotation;
        }
        else
        {
            // eslint-disable-next-line max-len
            p.rotation = (Math.random() * (this.maxStartRotation - this.minStartRotation)) + this.minStartRotation + this.rotation;
        }
        // place the particle at a random radius in the circle
        helperPoint.x = Math.random() * this.spawnCircle.radius;
        helperPoint.y = 0;
        // rotate the point to a random angle in the circle
        ParticleUtils.rotatePoint(Math.random() * 360, helperPoint);
        // offset by the circle's center
        helperPoint.x += this.spawnCircle.x;
        helperPoint.y += this.spawnCircle.y;
        // rotate the point by the emitter's rotation
        if (this.rotation !== 0)
        {
            ParticleUtils.rotatePoint(this.rotation, helperPoint);
        }
        // set the position, offset by the emitter's position
        p.position.x = emitPosX + helperPoint.x;
        p.position.y = emitPosY + helperPoint.y;
    }

    /**
     * Positions a particle for a ring type emitter.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave. Not used for this function.
     */
    protected _spawnRing(p: Particle, emitPosX: number, emitPosY: number): void
    {
        const spawnCircle = this.spawnCircle;
        // set the initial rotation/direction of the particle based on starting
        // particle angle and rotation of emitter

        if (this.minStartRotation === this.maxStartRotation)
        {
            p.rotation = this.minStartRotation + this.rotation;
        }
        else
        {
            p.rotation = (Math.random() * (this.maxStartRotation - this.minStartRotation))
    + this.minStartRotation + this.rotation;
        }
        // place the particle at a random radius in the ring
        if (spawnCircle.minRadius !== spawnCircle.radius)
        {
            helperPoint.x = (Math.random() * (spawnCircle.radius - spawnCircle.minRadius))
    + spawnCircle.minRadius;
        }
        else
        {
            helperPoint.x = spawnCircle.radius;
        }
        helperPoint.y = 0;
        // rotate the point to a random angle in the circle
        const angle = Math.random() * 360;

        p.rotation += angle;
        ParticleUtils.rotatePoint(angle, helperPoint);
        // offset by the circle's center
        helperPoint.x += this.spawnCircle.x;
        helperPoint.y += this.spawnCircle.y;
        // rotate the point by the emitter's rotation
        if (this.rotation !== 0)
        {
            ParticleUtils.rotatePoint(this.rotation, helperPoint);
        }
        // set the position, offset by the emitter's position
        p.position.x = emitPosX + helperPoint.x;
        p.position.y = emitPosY + helperPoint.y;
    }

    /**
     * Positions a particle for polygonal chain.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave. Not used for this function.
     */
    protected _spawnPolygonalChain(p: Particle, emitPosX: number, emitPosY: number): void
    {
        // set the initial rotation/direction of the particle based on starting
        // particle angle and rotation of emitter
        if (this.minStartRotation === this.maxStartRotation)
        {
            p.rotation = this.minStartRotation + this.rotation;
        }
        else
        {
            p.rotation = (Math.random() * (this.maxStartRotation - this.minStartRotation))
    + this.minStartRotation + this.rotation;
        }
        // get random point on the polygon chain
        this.spawnPolygonalChain.getRandomPoint(helperPoint);
        // rotate the point by the emitter's rotation
        if (this.rotation !== 0)
        {
            ParticleUtils.rotatePoint(this.rotation, helperPoint);
        }
        // set the position, offset by the emitter's position
        p.position.x = emitPosX + helperPoint.x;
        p.position.y = emitPosY + helperPoint.y;
    }

    /**
     * Positions a particle for a burst type emitter.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave.
     */
    protected _spawnBurst(p: Particle, emitPosX: number, emitPosY: number, i: number): void
    {
        // set the initial rotation/direction of the particle based on spawn
        // angle and rotation of emitter
        if (this.particleSpacing === 0)
        {
            p.rotation = Math.random() * 360;
        }
        else
        {
            p.rotation = this.angleStart + (this.particleSpacing * i) + this.rotation;
        }
        // drop the particle at the emitter's position
        p.position.x = emitPosX;
        p.position.y = emitPosY;
    }

    /**
     * Kills all active particles immediately.
     */
    public cleanup(): void
    {
        let particle;
        let next;

        for (particle = this._activeParticlesFirst; particle; particle = next)
        {
            next = particle.next;
            this.recycle(particle);
            if (particle.parent)
            {
                particle.parent.removeChild(particle);
            }
        }
        this._activeParticlesFirst = this._activeParticlesLast = null;
        this.particleCount = 0;
    }

    /**
     * Destroys the emitter and all of its particles.
     */
    public destroy(): void
    {
        // make sure we aren't still listening to any tickers
        this.autoUpdate = false;
        // puts all active particles in the pool, and removes them from the particle parent
        this.cleanup();
        // wipe the pool clean
        let next;

        for (let particle = this._poolFirst; particle; particle = next)
        {
            // store next value so we don't lose it in our destroy call
            next = particle.next;
            particle.destroy();
        }
        this._poolFirst = this._parent = this.particleImages = this.spawnPos = this.ownerPos
            = this.startColor = this.startScale = this.startAlpha = this.startSpeed
            = this.customEase = this._completeCallback = null;
    }
}
