import { Point } from '@pixi/math';
import { Particle } from '../Particle';
import { ParticleUtils } from '../ParticleUtils';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';

export class AccelerationBehavior implements IEmitterBehavior
{
    public static type = 'moveAcceleration';

    // doesn't _really_ need to be late, but doing so ensures that we can override any
    // rotation behavior that is mistakenly added
    public order = BehaviorOrder.Late;
    private minStart: number;
    private maxStart: number;
    private accel: {x: number; y: number};
    private rotate: boolean;
    private maxSpeed: number;
    constructor(config: {
        /**
         * Property: minStart
         * Type: number
         * Title: Minimum Start Speed
         * Description: Minimum speed when initializing the particle.
         * Min: 0
         * EditorDefault: 100
         */
        minStart: number;
        /**
         * Property: maxStart
         * Type: number
         * Title: Maximum Start Speed
         * Description: Maximum speed when initializing the particle.
         * Min: 0
         * EditorDefault: 100
         */
        maxStart: number;
        /**
         * Property: accel
         * Type: Point
         * Title: Acceleration
         * Description: Constant acceleration, in the coordinate space of the particle parent.
         * EditorDefault: {x: 50, y: 50}
         */
        accel: {x: number; y: number};
        /**
         * Property: rotate
         * Type: boolean
         * Title: Rotate with Movement
         * Description: Rotate the particle with its direction of movement. While initial movement direction reacts to rotation settings, this overrides any dynamic rotation.
         * EditorDefault: true
         */
        rotate: boolean;
        /**
         * Property: maxSpeed
         * Type: number
         * Title: Maximum Speed
         * Description: Maximum linear speed. 0 is unlimited.
         * Min: 0
         * EditorDefault: 0
         */
        maxSpeed: number;
    })
    {
        this.minStart = config.minStart;
        this.maxStart = config.maxStart;
        this.accel = config.accel;
        this.rotate = !!config.rotate;
        this.maxSpeed = config.maxSpeed ?? 0;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            const speed = (Math.random() * (this.maxStart - this.minStart)) + this.minStart;

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
        const vel = particle.config.velocity;
        const oldVX = vel.x;
        const oldVY = vel.y;

        vel.x += this.accel.x * deltaSec;
        vel.y += this.accel.y * deltaSec;
        if (this.maxSpeed)
        {
            const currentSpeed = ParticleUtils.length(vel);
            // if we are going faster than we should, clamp at the max speed
            // DO NOT recalculate vector length

            if (currentSpeed > this.maxSpeed)
            {
                ParticleUtils.scaleBy(vel, this.maxSpeed / currentSpeed);
            }
        }
        // calculate position delta by the midpoint between our old velocity and our new velocity
        particle.x += (oldVX + vel.x) / 2 * deltaSec;
        particle.y += (oldVY + vel.y) / 2 * deltaSec;
        if (this.rotate)
        {
            particle.rotation = Math.atan2(vel.y, vel.x);
        }
    }
}
