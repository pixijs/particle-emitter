import { Particle } from '../Particle';
import { ParticleUtils } from '../ParticleUtils';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';

export class RotationBehavior implements IEmitterBehavior
{
    public static type = 'rotation';

    public order = BehaviorOrder.Normal;
    private minStart: number;
    private maxStart: number;
    private minSpeed: number;
    private maxSpeed: number;
    private accel: number;
    constructor(config: {
        /**
         * Property: minStart
         * Type: number
         * Title: Minimum Starting Rotation
         * Description: Minimum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.
         * EditorDefault: 0
         */
        minStart: number;
        /**
         * Property: maxStart
         * Type: number
         * Title: Maximum Starting Rotation
         * Description: Maximum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.
         * EditorDefault: 0
         */
        maxStart: number;
        /**
         * Property: minSpeed
         * Type: number
         * Title: Minimum Rotation Speed
         * Description: Minimum rotation speed of the particles, in degrees/second. Positive is counter-clockwise.
         * EditorDefault: 0
         */
        minSpeed: number;
        /**
         * Property: maxSpeed
         * Type: number
         * Title: Maximum Rotation Speed
         * Description: Maximum rotation speed of the particles, in degrees/second. Positive is counter-clockwise.
         * EditorDefault: 0
         */
        maxSpeed: number;
        /**
         * Property: accel
         * Type: number
         * Title: Rotation Acceleration
         * Description: Constant rotational acceleration of the particles, in degrees/second/second.
         * EditorDefault: 0
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

    public order = BehaviorOrder.Normal;
    private min: number;
    private max: number;
    constructor(config: {
        /**
         * Property: min
         * Type: number
         * Title: Minimum Rotation
         * Description: Minimum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.
         * EditorDefault: 0
         */
        min: number;
        /**
         * Property: max
         * Type: number
         * Title: Maximum Rotation
         * Description: Maximum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.
         * EditorDefault: 0
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
