import { Point } from '@pixi/math';
import { Particle } from '../Particle';
import { rotatePoint, normalize, scaleBy } from '../ParticleUtils';
import { PropertyList } from '../PropertyList';
import { PropertyNode, ValueList } from '../PropertyNode';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';

/**
 * A Movement behavior that uses an interpolated or stepped list of values for a particles speed at any given moment.
 * Movement direction is controlled by the particle's starting rotation.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'moveSpeed',
 *     config: {
 *          speed: {
 *              list: [{value: 10, time: 0}, {value: 100, time: 0.25}, {value: 0, time: 1}],
 *          },
 *          minMult: 0.8
 *     }
 * }
 * ```
 */
export class SpeedBehavior implements IEmitterBehavior
{
    public static type = 'moveSpeed';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Late;
    private list: PropertyList<number>;
    private minMult: number;
    constructor(config: {
        /**
         * Speed of the particles in world units/second, with a minimum value of 0
         */
        speed: ValueList<number>;
        /**
         * A value between minimum speed multipler and 1 is randomly
         * generated and multiplied with each speed value to generate the actual speed for each particle.
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

            rotatePoint(next.rotation, next.config.velocity);

            next = next.next;
        }
    }

    updateParticle(particle: Particle, deltaSec: number): void
    {
        const speed = this.list.interpolate(particle.agePercent) * particle.config.speedMult;
        const vel = particle.config.velocity;

        normalize(vel);
        scaleBy(vel, speed);
        particle.x += vel.x * deltaSec;
        particle.y += vel.y * deltaSec;
    }
}

/**
 * A Movement behavior that uses a randomly picked constant speed throughout a particle's lifetime.
 * Movement direction is controlled by the particle's starting rotation.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'moveSpeedStatic',
 *     config: {
 *          min: 100,
 *          max: 150
 *     }
 * }
 * ```
 */
export class StaticSpeedBehavior implements IEmitterBehavior
{
    public static type = 'moveSpeedStatic';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Late;
    private min: number;
    private max: number;
    constructor(config: {
        /**
         * Minimum speed when initializing the particle.
         */
        min: number;
        /**
         * Maximum speed when initializing the particle.
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

            rotatePoint(next.rotation, next.config.velocity);

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
