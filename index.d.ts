import { Circle, Container, Point, Rectangle, Sprite, Texture } from 'pixi.js';

export interface ValueStep {
	value: number | string;
	time: number;
}
export interface ValueList {
	list: ValueStep[];
	isStepped?: boolean;
	ease?: SimpleEase | EaseSegment[];
}
/**
 * A single node in a PropertyList.
 */
export declare class PropertyNode<V> {
	/**
	 * Value for the node.
	 */
	value: V;
	/**
	 * Time value for the node. Between 0-1.
	 */
	time: number;
	/**
	 * The next node in line.
	 */
	next: PropertyNode<V>;
	/**
	 * If this is the first node in the list, controls if the entire list is stepped or not.
	 */
	isStepped: boolean;
	ease: SimpleEase;
	/**
	 * @param value The value for this node
	 * @param time The time for this node, between 0-1
	 * @param [ease] Custom ease for this list. Only relevant for the first node.
	 */
	constructor(value: V | string, time: number, ease?: SimpleEase | EaseSegment[]);
	/**
	 * Creates a list of property values from a data object {list, isStepped} with a list of objects in
	 * the form {value, time}. Alternatively, the data object can be in the deprecated form of
	 * {start, end}.
	 * @param data The data for the list.
	 * @param data.list The array of value and time objects.
	 * @param data.isStepped If the list is stepped rather than interpolated.
	 * @param data.ease Custom ease for this list.
	 * @return The first node in the list
	 */
	static createList(data: ValueList): PropertyNode<any>;
}
export interface Color {
	r: number;
	g: number;
	b: number;
	a?: number;
}
export interface EaseSegment {
	cp: number;
	s: number;
	e: number;
}
export declare type SimpleEase = (time: number) => number;
/**
 * Contains helper functions for particles and emitters to use.
 */
export declare namespace ParticleUtils {
	/**
	 * If errors and warnings should be logged within the library.
	 */
	let verbose: boolean;
	const DEG_TO_RADS: number;
	/**
	 * Rotates a point by a given angle.
	 * @param angle The angle to rotate by in degrees
	 * @param p The point to rotate around 0,0.
	 */
	function rotatePoint(angle: number, p: Point): void;
	/**
	 * Combines separate color components (0-255) into a single uint color.
	 * @param r The red value of the color
	 * @param g The green value of the color
	 * @param b The blue value of the color
	 * @return The color in the form of 0xRRGGBB
	 */
	function combineRGBComponents(r: number, g: number, b: number): number;
	/**
	 * Reduces the point to a length of 1.
	 * @param point The point to normalize
	 */
	function normalize(point: Point): void;
	/**
	 * Multiplies the x and y values of this point by a value.
	 * @param point The point to scaleBy
	 * @param value The value to scale by.
	 */
	function scaleBy(point: Point, value: number): void;
	/**
	 * Returns the length (or magnitude) of this point.
	 * @param point The point to measure length
	 * @return The length of this point.
	 */
	function length(point: Point): number;
	/**
	 * Converts a hex string from "#AARRGGBB", "#RRGGBB", "0xAARRGGBB", "0xRRGGBB",
	 * "AARRGGBB", or "RRGGBB" to an object of ints of 0-255, as
	 * {r, g, b, (a)}.
	 * @param color The input color string.
	 * @param output An object to put the output in. If omitted, a new object is created.
	 * @return The object with r, g, and b properties, possibly with an a property.
	 */
	function hexToRGB(color: string, output?: Color): Color;
	/**
	 * Generates a custom ease function, based on the GreenSock custom ease, as demonstrated
	 * by the related tool at http://www.greensock.com/customease/.
	 * @param segments An array of segments, as created by
	 * http://www.greensock.com/customease/.
	 * @return A function that calculates the percentage of change at
	 *                    a given point in time (0-1 inclusive).
	 */
	function generateEase(segments: EaseSegment[]): SimpleEase;
	/**
	 * Gets a blend mode, ensuring that it is valid.
	 * @param name The name of the blend mode to get.
	 * @return The blend mode as specified in the PIXI.BLEND_MODES enumeration.
	 */
	function getBlendMode(name: string): number;
	/**
	 * Converts a list of {value, time} objects starting at time 0 and ending at time 1 into an evenly
	 * spaced stepped list of PropertyNodes for color values. This is primarily to handle conversion of
	 * linear gradients to fewer colors, allowing for some optimization for Canvas2d fallbacks.
	 * @param list The list of data to convert.
	 * @param [numSteps=10] The number of steps to use.
	 * @return The blend mode as specified in the PIXI.blendModes enumeration.
	 */
	function createSteppedGradient(list: ValueStep[], numSteps?: number): PropertyNode<Color>;
}
export interface BasicPoint {
	x: number;
	y: number;
}
export interface Segment {
	p1: BasicPoint;
	p2: BasicPoint;
	l: number;
}
/**
 * Chain of line segments for generating spawn positions.
 */
export declare class PolygonalChain {
	/**
	 * List of segment objects in the chain.
	 */
	private segments;
	/**
	 * Total length of all segments of the chain.
	 */
	private totalLength;
	/**
	 * Total length of segments up to and including the segment of the same index.
	 * Used for weighted random selection of segment.
	 */
	private countingLengths;
	/**
	 * @param data Point data for polygon chains. Either a list of points for a single chain, or a list of chains.
	 */
	constructor(data: BasicPoint[] | BasicPoint[][]);
	/**
	 * @param data Point data for polygon chains. Either a list of points for a single chain, or a list of chains.
	 */
	private init;
	/**
	 * Gets a random point in the chain.
	 * @param out The point to store the selected position in.
	 */
	getRandomPoint(out: Point): void;
}
export interface ParticleConstructor {
	new (emitter: Emitter): Particle;
}
/**
 * A particle emitter.
 */
export declare class Emitter {
	/**
	 * The constructor used to create new particles. The default is
	 * the built in particle class.
	 */
	protected _particleConstructor: typeof Particle;
	/**
	 * An array of PIXI Texture objects.
	 */
	particleImages: any[];
	/**
	 * The first node in the list of alpha values for all particles.
	 */
	startAlpha: PropertyNode<number>;
	/**
	 * The first node in the list of speed values of all particles.
	 */
	startSpeed: PropertyNode<number>;
	/**
	 * A minimum multiplier for the speed of a particle at all stages of its life. A value between
	 * minimumSpeedMultiplier and 1 is randomly generated for each particle.
	 */
	minimumSpeedMultiplier: number;
	/**
	 * Acceleration to apply to particles. Using this disables
	 * any interpolation of particle speed. If the particles do
	 * not have a rotation speed, then they will be rotated to
	 * match the direction of travel.
	 */
	acceleration: Point;
	/**
	 * The maximum speed allowed for accelerating particles. Negative values, values of 0 or NaN
	 * will disable the maximum speed.
	 */
	maxSpeed: number;
	/**
	 * The first node in the list of scale values of all particles.
	 */
	startScale: PropertyNode<number>;
	/**
	 * A minimum multiplier for the scale of a particle at all stages of its life. A value between
	 * minimumScaleMultiplier and 1 is randomly generated for each particle.
	 */
	minimumScaleMultiplier: number;
	/**
	 * The first node in the list of  color values of all particles, as red, green, and blue
	 * uints from 0-255.
	 */
	startColor: PropertyNode<Color>;
	/**
	 * The minimum lifetime for a particle, in seconds.
	 */
	minLifetime: number;
	/**
	 * The maximum lifetime for a particle, in seconds.
	 */
	maxLifetime: number;
	/**
	 * The minimum start rotation for a particle, in degrees. This value
	 * is ignored if the spawn type is "burst" or "arc".
	 */
	minStartRotation: number;
	/**
	 * The maximum start rotation for a particle, in degrees. This value
	 * is ignored if the spawn type is "burst" or "arc".
	 */
	maxStartRotation: number;
	/**
	 * If no particle rotation should occur. Starting rotation will still
	 * affect the direction in which particles move. If the rotation speed
	 * is set, then this will be ignored.
	 */
	noRotation: boolean;
	/**
	 * The minimum rotation speed for a particle, in degrees per second.
	 * This only visually spins the particle, it does not change direction
	 * of movement.
	 */
	minRotationSpeed: number;
	/**
	 * The maximum rotation speed for a particle, in degrees per second.
	 * This only visually spins the particle, it does not change direction
	 * of movement.
	 */
	maxRotationSpeed: number;
	/**
	 * The blend mode for all particles, as named by PIXI.blendModes.
	 */
	particleBlendMode: number;
	/**
	 * An easing function for nonlinear interpolation of values. Accepts a single
	 * parameter of time as a value from 0-1, inclusive. Expected outputs are values
	 * from 0-1, inclusive.
	 */
	customEase: SimpleEase;
	/**
	 *	Extra data for use in custom particles. The emitter doesn't look inside, but
	 *	passes it on to the particle to use in init().
	 */
	extraData: any;
	/**
	 * Time between particle spawns in seconds.
	 */
	protected _frequency: number;
	/**
	 * Chance that a particle will be spawned on each opportunity to spawn one.
	 * 0 is 0%, 1 is 100%.
	 */
	spawnChance: number;
	/**
	 * Maximum number of particles to keep alive at a time. If this limit
	 * is reached, no more particles will spawn until some have died.
	 */
	maxParticles: number;
	/**
	 * The amount of time in seconds to emit for before setting emit to false.
	 * A value of -1 is an unlimited amount of time.
	 */
	emitterLifetime: number;
	/**
	 * Position at which to spawn particles, relative to the emitter's owner's origin.
	 * For example, the flames of a rocket travelling right might have a spawnPos
	 * of {x:-50, y:0}.
	 * to spawn at the rear of the rocket.
	 * To change this, use updateSpawnPos().
	 */
	spawnPos: Point;
	/**
	 * How the particles will be spawned. Valid types are "point", "rectangle",
	 * "circle", "burst", "ring".
	 */
	spawnType: string;
	/**
	 * A reference to the emitter function specific to the spawn type.
	 */
	private _spawnFunc;
	/**
	 * A rectangle relative to spawnPos to spawn particles inside if the spawn type is "rect".
	 */
	spawnRect: Rectangle;
	/**
	 * A polygon relative to spawnPos to spawn particles on the chain if the spawn type is "polygonalChain".
	 */
	spawnPolygonalChain: PolygonalChain;
	/**
	 * A circle relative to spawnPos to spawn particles inside if the spawn type is "circle".
	 */
	spawnCircle: Circle & {
		minRadius: number;
	};
	/**
	 * Number of particles to spawn time that the frequency allows for particles to spawn.
	 */
	particlesPerWave: number;
	/**
	 * Spacing between particles in a burst. 0 gives a random angle for each particle.
	 */
	particleSpacing: number;
	/**
	 * Angle at which to start spawning particles in a burst.
	 */
	angleStart: number;
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
	addAtBack: boolean;
	/**
	 * The current number of active particles.
	 */
	particleCount: number;
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
	constructor(particleParent: Container, particleImages: any, config: any);
	/**
	 * Time between particle spawns in seconds. If this value is not a number greater than 0,
	 * it will be set to 1 (particle per second) to prevent infinite loops.
	 */
	frequency: number;
	/**
	 * The constructor used to create new particles. The default is
	 * the built in Particle class. Setting this will dump any active or
	 * pooled particles, if the emitter has already been used.
	 */
	particleConstructor: typeof Particle;
	/**
	* The container to add particles to. Settings this will dump any active particles.
	*/
	parent: Container;
	/**
	 * Sets up the emitter based on the config settings.
	 * @param art A texture or array of textures to use for the particles.
	 * @param config A configuration object containing settings for the emitter.
	 */
	init(art: any, config: any): void;
	/**
	 * Recycles an individual particle. For internal use only.
	 * @param particle The particle to recycle.
	 * @internal
	 */
	recycle(particle: Particle): void;
	/**
	 * Sets the rotation of the emitter to a new value.
	 * @param newRot The new rotation, in degrees.
	 */
	rotate(newRot: number): void;
	/**
	 * Changes the spawn position of the emitter.
	 * @param x The new x value of the spawn position for the emitter.
	 * @param y The new y value of the spawn position for the emitter.
	 */
	updateSpawnPos(x: number, y: number): void;
	/**
	 * Changes the position of the emitter's owner. You should call this if you are adding
	 * particles to the world container that your emitter's owner is moving around in.
	 * @param x The new x value of the emitter's owner.
	 * @param y The new y value of the emitter's owner.
	 */
	updateOwnerPos(x: number, y: number): void;
	/**
	 * Prevents emitter position interpolation in the next update.
	 * This should be used if you made a major position change of your emitter's owner
	 * that was not normal movement.
	 */
	resetPositionTracking(): void;
	/**
	 * If particles should be emitted during update() calls. Setting this to false
	 * stops new particles from being created, but allows existing ones to die out.
	 */
	emit: boolean;
	/**
	 * If the update function is called automatically from the shared ticker.
	 * Setting this to false requires calling the update function manually.
	 */
	autoUpdate: boolean;
	/**
	 * Starts emitting particles, sets autoUpdate to true, and sets up the Emitter to destroy itself
	 * when particle emission is complete.
	 * @param callback Callback for when emission is complete (all particles have died off)
	 */
	playOnceAndDestroy(callback?: () => void): void;
	/**
	 * Starts emitting particles and optionally calls a callback when particle emission is complete.
	 * @param callback Callback for when emission is complete (all particles have died off)
	 */
	playOnce(callback?: () => void): void;
	/**
	 * Updates all particles spawned by this emitter and emits new ones.
	 * @param delta Time elapsed since the previous frame, in __seconds__.
	 */
	update(delta: number): void;
	/**
	 * Positions a particle for a point type emitter.
	 * @param p The particle to position and rotate.
	 * @param emitPosX The emitter's x position
	 * @param emitPosY The emitter's y position
	 * @param i The particle number in the current wave. Not used for this function.
	 */
	protected _spawnPoint(p: Particle, emitPosX: number, emitPosY: number): void;
	/**
	 * Positions a particle for a rectangle type emitter.
	 * @param p The particle to position and rotate.
	 * @param emitPosX The emitter's x position
	 * @param emitPosY The emitter's y position
	 * @param i The particle number in the current wave. Not used for this function.
	 */
	protected _spawnRect(p: Particle, emitPosX: number, emitPosY: number): void;
	/**
	 * Positions a particle for a circle type emitter.
	 * @param p The particle to position and rotate.
	 * @param emitPosX The emitter's x position
	 * @param emitPosY The emitter's y position
	 * @param i The particle number in the current wave. Not used for this function.
	 */
	protected _spawnCircle(p: Particle, emitPosX: number, emitPosY: number): void;
	/**
	 * Positions a particle for a ring type emitter.
	 * @param p The particle to position and rotate.
	 * @param emitPosX The emitter's x position
	 * @param emitPosY The emitter's y position
	 * @param i The particle number in the current wave. Not used for this function.
	 */
	protected _spawnRing(p: Particle, emitPosX: number, emitPosY: number): void;
	/**
	 * Positions a particle for polygonal chain.
	 * @param p The particle to position and rotate.
	 * @param emitPosX The emitter's x position
	 * @param emitPosY The emitter's y position
	 * @param i The particle number in the current wave. Not used for this function.
	 */
	protected _spawnPolygonalChain(p: Particle, emitPosX: number, emitPosY: number): void;
	/**
	 * Positions a particle for a burst type emitter.
	 * @param p The particle to position and rotate.
	 * @param emitPosX The emitter's x position
	 * @param emitPosY The emitter's y position
	 * @param i The particle number in the current wave.
	 */
	protected _spawnBurst(p: Particle, emitPosX: number, emitPosY: number, i: number): void;
	/**
	 * Kills all active particles immediately.
	 */
	cleanup(): void;
	/**
	 * Destroys the emitter and all of its particles.
	 */
	destroy(): void;
}
/**
 * Singly linked list container for keeping track of interpolated properties for particles.
 * Each Particle will have one of these for each interpolated property.
 */
export declare class PropertyList<V> {
	/**
	 * The current property node in the linked list.
	 */
	current: PropertyNode<V>;
	/**
	 * The next property node in the linked list. Stored separately for slightly less variable
	 * access.
	 */
	next: PropertyNode<V>;
	/**
	 * Calculates the correct value for the current interpolation value. This method is set in
	 * the reset() method.
	 * @param lerp The interpolation value from 0-1.
	 * @return The interpolated value. Colors are converted to the hex value.
	 */
	interpolate: (lerp: number) => number;
	/**
	 * A custom easing method for this list.
	 * @param lerp The interpolation value from 0-1.
	 * @return The eased value, also from 0-1.
	 */
	ease: SimpleEase;
	/**
	 * If this list manages colors, which requires a different method for interpolation.
	 */
	private isColor;
	/**
	 * @param isColor If this list handles color values
	 */
	constructor(isColor?: boolean);
	/**
	 * Resets the list for use.
	 * @param first The first node in the list.
	 * @param first.isStepped If the values should be stepped instead of interpolated linearly.
	 */
	reset(first: PropertyNode<V>): void;
}
/**
 * An individual particle image. You shouldn't have to deal with these.
 */
export declare class Particle extends Sprite {
	/**
	 * The emitter that controls this particle.
	 */
	emitter: Emitter;
	/**
	 * The velocity of the particle. Speed may change, but the angle also
	 * contained in velocity is constant.
	 */
	velocity: Point;
	/**
	 * The maximum lifetime of this particle, in seconds.
	 */
	maxLife: number;
	/**
	 * The current age of the particle, in seconds.
	 */
	age: number;
	/**
	 * A simple easing function to be applied to all properties that
	 * are being interpolated.
	 */
	ease: SimpleEase;
	/**
	 * Extra data that the emitter passes along for custom particles.
	 */
	extraData: any;
	/**
	 * The alpha of the particle throughout its life.
	 */
	alphaList: PropertyList<number>;
	/**
	 * The speed of the particle throughout its life.
	 */
	speedList: PropertyList<number>;
	/**
	 * A multiplier from 0-1 applied to the speed of the particle at all times.
	 */
	speedMultiplier: number;
	/**
	 * Acceleration to apply to the particle.
	 */
	acceleration: Point;
	/**
	 * The maximum speed allowed for accelerating particles. Negative values, values of 0 or NaN
	 * will disable the maximum speed.
	 */
	maxSpeed: number;
	/**
	 * Speed at which the particle rotates, in radians per second.
	 */
	rotationSpeed: number;
	/**
	 * If particle rotation is locked, preventing rotation from occurring due
	 * to directional changes.
	 */
	noRotation: boolean;
	/**
	 * The scale of the particle throughout its life.
	 */
	scaleList: PropertyList<number>;
	/**
	 * A multiplier from 0-1 applied to the scale of the particle at all times.
	 */
	scaleMultiplier: number;
	/**
	 * The tint of the particle throughout its life.
	 */
	colorList: PropertyList<Color>;
	/**
	 * A reference to init, so that subclasses can access it without the penalty of Function.call()
	 */
	protected Particle_init: typeof Particle.prototype.init;
	/**
	 * A reference to update so that subclasses can access the original without the overhead
	 * of Function.call().
	 * @param delta Time elapsed since the previous frame, in __seconds__.
	 * @return The standard interpolation multiplier (0-1) used for all relevant particle
	 *                   properties. A value of -1 means the particle died of old age instead.
	 */
	protected Particle_update: typeof Particle.prototype.update;
	protected Particle_destroy: typeof Particle.prototype.destroy;
	protected Sprite_destroy: typeof Sprite.prototype.destroy;
	/**
	 * If alpha should be interpolated at all.
	 */
	protected _doAlpha: boolean;
	/**
	 * If scale should be interpolated at all.
	 */
	protected _doScale: boolean;
	/**
	 * If speed should be interpolated at all.
	 */
	protected _doSpeed: boolean;
	/**
	 * If acceleration should be handled at all. _doSpeed is mutually exclusive with this,
	 * and _doSpeed gets priority.
	 */
	protected _doAcceleration: boolean;
	/**
	 * If color should be interpolated at all.
	 */
	protected _doColor: boolean;
	/**
	 * If normal movement should be handled. Subclasses wishing to override movement
	 * can set this to false in init().
	 */
	protected _doNormalMovement: boolean;
	/**
	 * One divided by the max life of the particle, saved for slightly faster math.
	 */
	private _oneOverLife;
	/**
	 * Reference to the next particle in the list.
	 */
	next: Particle;
	/**
	 * Reference to the previous particle in the list.
	 */
	prev: Particle;
	/**
	 * @param {PIXI.particles.Emitter} emitter The emitter that controls this particle.
	 */
	constructor(emitter: Emitter);
	/**
	 * Initializes the particle for use, based on the properties that have to
	 * have been set already on the particle.
	 */
	init(): void;
	/**
	 * Sets the texture for the particle. This can be overridden to allow
	 * for an animated particle.
	 * @param art The texture to set.
	 */
	applyArt(art: any): void;
	/**
	 * Updates the particle.
	 * @param delta Time elapsed since the previous frame, in __seconds__.
	 * @return The standard interpolation multiplier (0-1) used for all
	 *         relevant particle properties. A value of -1 means the particle
	 *         died of old age instead.
	 */
	update(delta: number): number;
	/**
	 * Kills the particle, removing it from the display list
	 * and telling the emitter to recycle it.
	 */
	kill(): void;
	/**
	 * Destroys the particle, removing references and preventing future use.
	 */
	destroy(): void;
	/**
	 * Checks over the art that was passed to the Emitter's init() function, to do any special
	 * modifications to prepare it ahead of time.
	 * @param art The array of art data. For Particle, it should be an array of
	 *            Textures. Any strings in the array will be converted to
	 *            Textures via Texture.from().
	 * @return The art, after any needed modifications.
	 */
	static parseArt(art: any[]): any[];
	/**
	 * Parses extra emitter data to ensure it is set up for this particle class.
	 * Particle does nothing to the extra data.
	 * @param extraData The extra data from the particle config.
	 * @return The parsed extra data.
	 */
	static parseData(extraData: any): any;
}
export interface ParsedAnimatedParticleArt {
	textures: Texture[];
	duration: number;
	framerate: number;
	loop: boolean;
}
export interface AnimatedParticleArt {
	framerate: "matchLife" | number;
	loop?: boolean;
	textures: (string | Texture | {
		texture: string | Texture;
		count: number;
	})[];
}
/**
 * An individual particle image with an animation. Art data passed to the emitter must be
 * formatted in a particular way for AnimatedParticle to be able to handle it:
 *
 * ```typescript
 * {
 *     //framerate is required. It is the animation speed of the particle in frames per
 *     //second.
 *     //A value of "matchLife" causes the animation to match the lifetime of an individual
 *     //particle, instead of at a constant framerate. This causes the animation to play
 *     //through one time, completing when the particle expires.
 *     framerate: 6,
 *     //loop is optional, and defaults to false.
 *     loop: true,
 *     //textures is required, and can be an array of any (non-zero) length.
 *     textures: [
 *         //each entry represents a single texture that should be used for one or more
 *         //frames. Any strings will be converted to Textures with Texture.fromImage().
 *         //Instances of PIXI.Texture will be used directly.
 *         "animFrame1.png",
 *         //entries can be an object with a 'count' property, telling AnimatedParticle to
 *         //use that texture for 'count' frames sequentially.
 *         {
 *             texture: "animFrame2.png",
 *             count: 3
 *         },
 *         "animFrame3.png"
 *     ]
 * }
 * ```
 */
export declare class AnimatedParticle extends Particle {
	/**
	 * Texture array used as each frame of animation, similarly to how MovieClip works.
	 */
	private textures;
	/**
	 * Duration of the animation, in seconds.
	 */
	private duration;
	/**
	 * Animation framerate, in frames per second.
	 */
	private framerate;
	/**
	 * Animation time elapsed, in seconds.
	 */
	private elapsed;
	/**
	 * If this particle animation should loop.
	 */
	private loop;
	/**
	 * @param emitter The emitter that controls this AnimatedParticle.
	 */
	constructor(emitter: Emitter);
	/**
	 * Initializes the particle for use, based on the properties that have to
	 * have been set already on the particle.
	 */
	init(): void;
	/**
	 * Sets the textures for the particle.
	 * @param art An array of PIXI.Texture objects for this animated particle.
	 */
	applyArt(art: ParsedAnimatedParticleArt): void;
	/**
	 * Updates the particle.
	 * @param delta Time elapsed since the previous frame, in __seconds__.
	 */
	update(delta: number): number;
	/**
	 * Destroys the particle, removing references and preventing future use.
	 */
	destroy(): void;
	/**
	 * Checks over the art that was passed to the Emitter's init() function, to do any special
	 * modifications to prepare it ahead of time.
	 * @param art The array of art data, properly formatted for AnimatedParticle.
	 * @return The art, after any needed modifications.
	 */
	static parseArt(art: AnimatedParticleArt[]): ParsedAnimatedParticleArt[];
}