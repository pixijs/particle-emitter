import { Emitter } from './Emitter';
import { LinkedListChild } from './LinkedListContainer';
import { Sprite } from '@pixi/sprite';

/**
 * An individual particle image. You shouldn't have to deal with these.
 */
export class Particle extends Sprite implements LinkedListChild
{
    /**
     * The emitter that controls this particle.
     */
    public emitter: Emitter;
    /**
     * The maximum lifetime of this particle, in seconds.
     */
    public maxLife: number;
    /**
     * The current age of the particle, in seconds.
     */
    public age: number;
    /**
     * The current age of the particle as a normalized value between 0 and 1.
     */
    public agePercent: number;
    /**
     * One divided by the max life of the particle, saved for slightly faster math.
     */
    public oneOverLife: number;
    /**
     * Reference to the next particle in the list.
     */
    public next: Particle;

    /**
     * Reference to the previous particle in the list.
     */
    public prev: Particle;

    public prevChild: LinkedListChild;
    public nextChild: LinkedListChild;

    /**
     * Static per-particle configuration for behaviors to use. Is not cleared when recycling.
     */
    public config: {[key: string]: any};

    protected Sprite_destroy: typeof Sprite.prototype.destroy;

    /**
     * @param emitter The emitter that controls this particle.
     */
    constructor(emitter: Emitter)
    {
        // start off the sprite with a blank texture, since we are going to replace it
        // later when the particle is initialized.
        super();
        // initialize LinkedListChild props so they are included in underlying JS class definition
        this.prevChild = this.nextChild = null;

        this.emitter = emitter;
        this.config = {};
        // particles should be centered
        this.anchor.x = this.anchor.y = 0.5;
        this.maxLife = 0;
        this.age = 0;
        this.agePercent = 0;
        this.oneOverLife = 0;
        this.next = null;
        this.prev = null;

        // save often used functions on the instance instead of the prototype for better speed
        this.init = this.init;
        this.Sprite_destroy = super.destroy;
        this.kill = this.kill;
    }

    /**
     * Initializes the particle for use, based on the properties that have to
     * have been set already on the particle.
     */
    public init(maxLife: number): void
    {
        this.maxLife = maxLife;
        // reset the age
        this.age = this.agePercent = 0;
        // reset the sprite props
        this.rotation = 0;
        this.position.x = this.position.y = 0;
        this.scale.x = this.scale.y = 1;
        this.tint = 0xffffff;
        this.alpha = 1;
        // save our lerp helper
        this.oneOverLife = 1 / this.maxLife;

        // ensure visibility
        this.visible = true;
    }

    /**
     * Kills the particle, removing it from the display list
     * and telling the emitter to recycle it.
     */
    public kill(): void
    {
        this.emitter.recycle(this);
    }

    /**
     * Destroys the particle, removing references and preventing future use.
     */
    public destroy(): void
    {
        if (this.parent)
        {
            this.parent.removeChild(this);
        }
        this.Sprite_destroy();
        this.emitter = this.next = this.prev = null;
    }
}
