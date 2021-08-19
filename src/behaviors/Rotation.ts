import { Particle } from '../Particle';
import { ParticleUtils } from '../ParticleUtils';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';

export class RotationBehavior implements IEmitterBehavior
{
    public static type = 'rotation';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private minStart: number;
    private maxStart: number;
    private minSpeed: number;
    private maxSpeed: number;
    private accel: number;
    constructor(config: {
        /**
         * Minimum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.
         */
        minStart: number;
        /**
         * Maximum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.
         */
        maxStart: number;
        /**
         * Minimum rotation speed of the particles, in degrees/second. Positive is counter-clockwise.
         */
        minSpeed: number;
        /**
         * Maximum rotation speed of the particles, in degrees/second. Positive is counter-clockwise.
         */
        maxSpeed: number;
        /**
         * Constant rotational acceleration of the particles, in degrees/second/second.
         */
        accel: number;
    })
    {
        this.minStart = config.minStart * ParticleUtils.DEG_TO_RADS;
        this.maxStart = config.maxStart * ParticleUtils.DEG_TO_RADS;
        this.minSpeed = config.minSpeed * ParticleUtils.DEG_TO_RADS;
        this.maxSpeed = config.maxSpeed * ParticleUtils.DEG_TO_RADS;
        this.accel = config.accel * ParticleUtils.DEG_TO_RADS;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            if (this.minStart === this.maxStart)
            {
                next.rotation += this.maxStart;
            }
            else
            {
                next.rotation += (Math.random() * (this.maxStart - this.minStart)) + this.minStart;
            }
            next.config.rotSpeed = (Math.random() * (this.maxSpeed - this.minSpeed)) + this.minSpeed;

            next = next.next;
        }
    }

    updateParticle(particle: Particle, deltaSec: number): void
    {
        if (this.accel)
        {
            const oldSpeed = particle.config.rotSpeed;

            particle.config.rotSpeed += this.accel * deltaSec;
            particle.rotation += (particle.config.rotSpeed + oldSpeed) / 2 * deltaSec;
        }
        else
        {
            particle.rotation += particle.config.rotSpeed * deltaSec;
        }
    }
}

export class StaticRotationBehavior implements IEmitterBehavior
{
    public static type = 'rotationStatic';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private min: number;
    private max: number;
    constructor(config: {
        /**
         * Minimum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.
         */
        min: number;
        /**
         * Maximum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.
         */
        max: number;
    })
    {
        this.min = config.min * ParticleUtils.DEG_TO_RADS;
        this.max = config.max * ParticleUtils.DEG_TO_RADS;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            if (this.min === this.max)
            {
                next.rotation += this.max;
            }
            else
            {
                next.rotation += (Math.random() * (this.max - this.min)) + this.min;
            }

            next = next.next;
        }
    }
}

export class NoRotationBehavior implements IEmitterBehavior
{
    public static type = 'noRotation';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Late + 1;

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            next.rotation = 0;

            next = next.next;
        }
    }
}
