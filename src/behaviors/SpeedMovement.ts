import { Point } from '@pixi/math';
import { Particle } from '../Particle';
import { ParticleUtils } from '../ParticleUtils';
import { PropertyList } from '../PropertyList';
import { PropertyNode, ValueList } from '../PropertyNode';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';

export class SpeedBehavior implements IEmitterBehavior
{
    public static type = 'moveSpeed';

    public order = BehaviorOrder.Late;
    private list: PropertyList<number>;
    private minMult: number;
    constructor(config: {
        /**
         * Property: speed
         * Type: ValueList<number>
         * Title: Speed
         * Description: Speed of the particles, with a minimum value of 0
         * Min: 0
         * EditorDefault: 100
         */
        speed: ValueList<number>;
        /**
         * Property: minMult
         * Type: number
         * Title: Minimum Speed Multiplier
         * Description: A value between minimum speed multipler and 1 is randomly generated and multiplied with each speed value to generate the actual speed for each particle.
         * Min: 0
         * Max: 1
         * EditorDefault: 1
         */
        minMult: number;
    })
    {
        this.list = new PropertyList(false);
        this.list.reset(PropertyNode.createList(config.speed));
        this.minMult = config.minMult ?? 1;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            const mult = (Math.random() * (1 - this.minMult)) + this.minMult;

            next.config.speedMult = mult;
            if (!next.config.velocity)
            {
                next.config.velocity = new Point(this.list.first.value * mult, 0);
            }
            else
            {
                (next.config.velocity as Point).set(this.list.first.value * mult, 0);
            }

            ParticleUtils.rotatePoint(next.rotation, next.config.velocity);

            next = next.next;
        }
    }

    updateParticle(particle: Particle, deltaSec: number): void
    {
        const speed = this.list.interpolate(particle.agePercent) * particle.config.speedMult;
        const vel = particle.config.velocity;

        ParticleUtils.normalize(vel);
        ParticleUtils.scaleBy(vel, speed);
        particle.x += vel.x * deltaSec;
        particle.y += vel.y * deltaSec;
    }
}

export class StaticSpeedBehavior implements IEmitterBehavior
{
    public static type = 'moveSpeedStatic';

    public order = BehaviorOrder.Late;
    private min: number;
    private max: number;
    constructor(config: {
        /**
         * Property: min
         * Type: number
         * Title: Minimum Start Speed
         * Description: Minimum speed when initializing the particle.
         * Min: 0
         * EditorDefault: 100
         */
        min: number;
        /**
         * Property: max
         * Type: number
         * Title: Maximum Start Speed
         * Description: Maximum speed when initializing the particle.
         * Min: 0
         * EditorDefault: 100
         */
        max: number;
    })
    {
        this.min = config.min;
        this.max = config.max;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            const speed = (Math.random() * (this.max - this.min)) + this.min;

            if (!next.config.velocity)
            {
                next.config.velocity = new Point(speed, 0);
            }
            else
            {
                (next.config.velocity as Point).set(speed, 0);
            }

            ParticleUtils.rotatePoint(next.rotation, next.config.velocity);

            next = next.next;
        }
    }

    updateParticle(particle: Particle, deltaSec: number): void
    {
        const velocity = particle.config.velocity;

        particle.x += velocity.x * deltaSec;
        particle.y += velocity.y * deltaSec;
    }
}
