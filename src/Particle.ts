import Emitter from "./Emitter";
import ParticleUtils, {SimpleEase, Color} from "./ParticleUtils";
import PropertyList from "./PropertyList";
import Sprite = PIXI.Sprite;

/**
 * An individual particle image. You shouldn't have to deal with these.
 * @memberof PIXI.particles
 * @class Particle
 * @extends PIXI.Sprite
 * @constructor
 * @param {PIXI.particles.Emitter} emitter The emitter that controls this particle.
 */
export default class Particle extends Sprite
{
	/**
	 * The emitter that controls this particle.
	 * @property {Emitter} emitter
	 */
	public emitter: Emitter;
	/**
	 * The velocity of the particle. Speed may change, but the angle also
	 * contained in velocity is constant.
	 * @property {PIXI.Point} velocity
	 */
	public velocity: PIXI.Point;
	/**
	 * The maximum lifetime of this particle, in seconds.
	 * @property {Number} maxLife
	 */
	public maxLife: number;
	/**
	 * The current age of the particle, in seconds.
	 * @property {Number} age
	 */
	public age: number;
	/**
	 * A simple easing function to be applied to all properties that
	 * are being interpolated.
	 * @property {Function} ease
	 */
	public ease: SimpleEase;
	/**
	 * Extra data that the emitter passes along for custom particles.
	 * @property {Object} extraData
	 */
	public extraData: any;
	/**
	 * The alpha of the particle throughout its life.
	 * @property {PIXI.particles.PropertyList} alphaList
	 */
	public alphaList: PropertyList<number>;
	/**
	 * The speed of the particle throughout its life.
	 * @property {PIXI.particles.PropertyList} speedList
	 */
	public speedList: PropertyList<number>;
	/**
	 * A multiplier from 0-1 applied to the speed of the particle at all times.
	 * @property {number} speedMultiplier
	 */
	public speedMultiplier: number;
	/**
	 * Acceleration to apply to the particle.
	 * @property {PIXI.Point} accleration
	 */
	public acceleration: PIXI.Point;
	/**
	 * The maximum speed allowed for accelerating particles. Negative values, values of 0 or NaN
	 * will disable the maximum speed.
	 * @property {Number} maxSpeed
	 * @default NaN
	 */
	public maxSpeed: number;
	/**
	 * Speed at which the particle rotates, in radians per second.
	 * @property {Number} rotationSpeed
	 */
	public rotationSpeed: number;
	/**
	 * If particle rotation is locked, preventing rotation from occurring due
	 * to directional changes.
	 * @property {Number} noRotation
	 */
	public noRotation: boolean;
	/**
	 * The scale of the particle throughout its life.
	 * @property {PIXI.particles.PropertyList} scaleList
	 */
	public scaleList: PropertyList<number>;
	/**
	 * A multiplier from 0-1 applied to the scale of the particle at all times.
	 * @property {number} scaleMultiplier
	 */
	public scaleMultiplier: number;
	/**
	 * The tint of the particle throughout its life.
	 * @property {PIXI.particles.PropertyList} colorList
	 */
	public colorList: PropertyList<Color>;
	/**
	 * A reference to init, so that subclasses can access it without the penalty of Function.call()
	 * @method PIXI.particles.Particle#Particle_init
	 * @protected
	 */
	protected Particle_init: () => void;
	/**
	 * A reference to update so that subclasses can access the original without the overhead
	 * of Function.call().
	 * @method PIXI.particles.Particle#Particle_update
	 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
	 * @return {Number} The standard interpolation multiplier (0-1) used for all relevant particle
	 *                   properties. A value of -1 means the particle died of old age instead.
	 * @protected
	 */
	protected Particle_update: (delta: number) => number;
	protected Particle_destroy: () => void;
	protected Sprite_destroy: () => void;
	/**
	 * If alpha should be interpolated at all.
	 * @property {Boolean} _doAlpha
	 * @private
	 */
	protected _doAlpha: boolean;
	/**
	 * If scale should be interpolated at all.
	 * @property {Boolean} _doScale
	 * @private
	 */
	protected _doScale: boolean;
	/**
	 * If speed should be interpolated at all.
	 * @property {Boolean} _doSpeed
	 * @private
	 */
	protected _doSpeed: boolean;
	/**
	 * If acceleration should be handled at all. _doSpeed is mutually exclusive with this,
	 * and _doSpeed gets priority.
	 * @property {Boolean} _doAcceleration
	 * @private
	 */
	protected _doAcceleration: boolean;
	/**
	 * If color should be interpolated at all.
	 * @property {Boolean} _doColor
	 * @private
	 */
	protected _doColor: boolean;
	/**
	 * If normal movement should be handled. Subclasses wishing to override movement
	 * can set this to false in init().
	 * @property {Boolean} _doNormalMovement
	 * @private
	 */
	protected _doNormalMovement: boolean;
	/**
	 * One divided by the max life of the particle, saved for slightly faster math.
	 * @property {Number} _oneOverLife
	 * @private
	 */
	private _oneOverLife: number;
	/**
	 * Reference to the next particle in the list.
	 * @property {Particle} next
	 * @private
	 */
	public next: Particle;

	/**
	 * Reference to the previous particle in the list.
	 * @property {Particle} prev
	 * @private
	 */
	public prev: Particle;
	
	constructor(emitter: Emitter)
	{
		//start off the sprite with a blank texture, since we are going to replace it
		//later when the particle is initialized.
		super();
		this.emitter = emitter;
		//particles should be centered
		this.anchor.x = this.anchor.y = 0.5;
		this.velocity = new PIXI.Point();
		this.maxLife = 0;
		this.age = 0;
		this.ease = null;
		this.extraData = null;
		this.alphaList = new PropertyList();
		this.speedList = new PropertyList();
		this.speedMultiplier = 1;
		/**
		 * Acceleration to apply to the particle.
		 * @property {PIXI.Point} accleration
		 */
		this.acceleration = new PIXI.Point();
		/**
		 * The maximum speed allowed for accelerating particles. Negative values, values of 0 or NaN
		 * will disable the maximum speed.
		 * @property {Number} maxSpeed
		 * @default NaN
		 */
		this.maxSpeed = NaN;
		/**
		 * The scale of the particle throughout its life.
		 * @property {PIXI.particles.PropertyList} scaleList
		 */
		this.scaleList = new PropertyList();
		/**
		 * A multiplier from 0-1 applied to the scale of the particle at all times.
		 * @property {number} scaleMultiplier
		 */
		this.scaleMultiplier = 1;
		/**
		 * The tint of the particle throughout its life.
		 * @property {PIXI.particles.PropertyList} colorList
		 */
		this.colorList = new PropertyList(true);
		/**
		 * If alpha should be interpolated at all.
		 * @property {Boolean} _doAlpha
		 * @private
		 */
		this._doAlpha = false;
		/**
		 * If scale should be interpolated at all.
		 * @property {Boolean} _doScale
		 * @private
		 */
		this._doScale = false;
		/**
		 * If speed should be interpolated at all.
		 * @property {Boolean} _doSpeed
		 * @private
		 */
		this._doSpeed = false;
		/**
		 * If acceleration should be handled at all. _doSpeed is mutually exclusive with this,
		 * and _doSpeed gets priority.
		 * @property {Boolean} _doAcceleration
		 * @private
		 */
		this._doAcceleration = false;
		/**
		 * If color should be interpolated at all.
		 * @property {Boolean} _doColor
		 * @private
		 */
		this._doColor = false;
		/**
		 * If normal movement should be handled. Subclasses wishing to override movement
		 * can set this to false in init().
		 * @property {Boolean} _doNormalMovement
		 * @private
		 */
		this._doNormalMovement = false;
		/**
		 * One divided by the max life of the particle, saved for slightly faster math.
		 * @property {Number} _oneOverLife
		 * @private
		 */
		this._oneOverLife = 0;

		/**
		 * Reference to the next particle in the list.
		 * @property {Particle} next
		 * @private
		 */
		this.next = null;

		/**
		 * Reference to the previous particle in the list.
		 * @property {Particle} prev
		 * @private
		 */
		this.prev = null;

		//save often used functions on the instance instead of the prototype for better speed
		this.init = this.init;
		this.Particle_init = Particle.prototype.init;
		this.update = this.update;
		this.Particle_update = Particle.prototype.update;
		this.Sprite_destroy = super.destroy;
		this.Particle_destroy = Particle.prototype.destroy;
		this.applyArt = this.applyArt;
		this.kill = this.kill;
	}

	/**
	 * Initializes the particle for use, based on the properties that have to
	 * have been set already on the particle.
	 * @method PIXI.particles.Particle#init
	 */
	public init()
	{
		//reset the age
		this.age = 0;
		//set up the velocity based on the start speed and rotation
		this.velocity.x = this.speedList.current.value * this.speedMultiplier;
		this.velocity.y = 0;
		ParticleUtils.rotatePoint(this.rotation, this.velocity);
		if (this.noRotation)
		{
			this.rotation = 0;
		}
		else
		{
			//convert rotation to Radians from Degrees
			this.rotation *= ParticleUtils.DEG_TO_RADS;
		}
		//convert rotation speed to Radians from Degrees
		this.rotationSpeed *= ParticleUtils.DEG_TO_RADS;
		//set alpha to inital alpha
		this.alpha = this.alphaList.current.value;
		//set scale to initial scale
		this.scale.x = this.scale.y = this.scaleList.current.value;
		//figure out what we need to interpolate
		this._doAlpha = !!this.alphaList.current.next;
		this._doSpeed = !!this.speedList.current.next;
		this._doScale = !!this.scaleList.current.next;
		this._doColor = !!this.colorList.current.next;
		this._doAcceleration = this.acceleration.x !== 0 || this.acceleration.y !== 0;
		//_doNormalMovement can be cancelled by subclasses
		this._doNormalMovement = this._doSpeed || this.speedList.current.value !== 0 || this._doAcceleration;
		//save our lerp helper
		this._oneOverLife = 1 / this.maxLife;
		//set the inital color
		let color = this.colorList.current.value;
		this.tint = ParticleUtils.combineRGBComponents(color.r, color.g, color.b);
		//ensure visibility
		this.visible = true;
	}

	/**
	 * Sets the texture for the particle. This can be overridden to allow
	 * for an animated particle.
	 * @method PIXI.particles.Particle#applyArt
	 * @param {PIXI.Texture} art The texture to set.
	 */
	public applyArt(art: any)
	{
		this.texture = art || PIXI.Texture.EMPTY;
	}

	/**
	 * Updates the particle.
	 * @method PIXI.particles.Particle#update
	 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
	 * @return {Number} The standard interpolation multiplier (0-1) used for all relevant particle
	 *                   properties. A value of -1 means the particle died of old age instead.
	 */
	public update(delta: number): number
	{
		//increase age
		this.age += delta;
		//recycle particle if it is too old
		if(this.age >= this.maxLife || this.age < 0)
		{
			this.kill();
			return -1;
		}

		//determine our interpolation value
		let lerp = this.age * this._oneOverLife;//lifetime / maxLife;
		if (this.ease)
		{
			if(this.ease.length == 4)
			{
				//the t, b, c, d parameters that some tween libraries use
				//(time, initial value, end value, duration)
				lerp = (this.ease as any)(lerp, 0, 1, 1);
			}
			else
			{
				//the simplified version that we like that takes
				//one parameter, time from 0-1. TweenJS eases provide this usage.
				lerp = this.ease(lerp);
			}
		}

		//interpolate alpha
		if (this._doAlpha)
			this.alpha = this.alphaList.interpolate(lerp);
		//interpolate scale
		if (this._doScale)
		{
			let scale = this.scaleList.interpolate(lerp) * this.scaleMultiplier;
			this.scale.x = this.scale.y = scale;
		}
		//handle movement
		if(this._doNormalMovement)
		{
			//interpolate speed
			if (this._doSpeed)
			{
				let speed = this.speedList.interpolate(lerp) * this.speedMultiplier;
				ParticleUtils.normalize(this.velocity);
				ParticleUtils.scaleBy(this.velocity, speed);
			}
			else if(this._doAcceleration)
			{
				this.velocity.x += this.acceleration.x * delta;
				this.velocity.y += this.acceleration.y * delta;
				if (this.maxSpeed)
				{
					let currentSpeed = ParticleUtils.length(this.velocity);
					//if we are going faster than we should, clamp at the max speed
					//DO NOT recalculate vector length
					if (currentSpeed > this.maxSpeed)
					{
						ParticleUtils.scaleBy(this.velocity, this.maxSpeed / currentSpeed);
					}
				}
			}
			//adjust position based on velocity
			this.position.x += this.velocity.x * delta;
			this.position.y += this.velocity.y * delta;
		}
		//interpolate color
		if (this._doColor)
		{
			this.tint = this.colorList.interpolate(lerp);
		}
		//update rotation
		if(this.rotationSpeed !== 0)
		{
			this.rotation += this.rotationSpeed * delta;
		}
		else if(this.acceleration && !this.noRotation)
		{
			this.rotation = Math.atan2(this.velocity.y, this.velocity.x);// + Math.PI / 2;
		}
		return lerp;
	}

	/**
	 * Kills the particle, removing it from the display list
	 * and telling the emitter to recycle it.
	 * @method PIXI.particles.Particle#kill
	 */
	public kill()
	{
		this.emitter.recycle(this);
	}

	/**
	 * Destroys the particle, removing references and preventing future use.
	 * @method PIXI.particles.Particle#destroy
	 */
	public destroy()
	{
		if (this.parent)
			this.parent.removeChild(this);
		this.Sprite_destroy();
		this.emitter = this.velocity = this.colorList = this.scaleList = this.alphaList =
			this.speedList = this.ease = this.next = this.prev = null;
	}

	/**
	 * Checks over the art that was passed to the Emitter's init() function, to do any special
	 * modifications to prepare it ahead of time.
	 * @method PIXI.particles.Particle.parseArt
	 * @static
	 * @param  {Array} art The array of art data. For Particle, it should be an array of Textures.
	 *                     Any strings in the array will be converted to Textures via
	 *                     Texture.fromImage().
	 * @return {Array} The art, after any needed modifications.
	 */
	public static parseArt(art:any[]): any[]
	{
		//convert any strings to Textures.
		let i;
		for(i = art.length; i >= 0; --i)
		{
			if(typeof art[i] == "string")
				art[i] = PIXI.Texture.fromImage(art[i]);
		}
		//particles from different base textures will be slower in WebGL than if they
		//were from one spritesheet
		if(ParticleUtils.verbose)
		{
			for(i = art.length - 1; i > 0; --i)
			{
				if(art[i].baseTexture != art[i - 1].baseTexture)
				{
					if (window.console)
						console.warn("PixiParticles: using particle textures from different images may hinder performance in WebGL");
					break;
				}
			}
		}

		return art;
	}

	/**
	 * Parses extra emitter data to ensure it is set up for this particle class.
	 * Particle does nothing to the extra data.
	 * @method PIXI.particles.Particle.parseData
	 * @static
	 * @param  {Object} extraData The extra data from the particle config.
	 * @return {Object} The parsed extra data.
	 */
	public static parseData(extraData: any): any
	{
		return extraData;
	}
}