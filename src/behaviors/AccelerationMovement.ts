import { Point } from '@pixi/math';
import { Particle } from '../Particle';
import { rotatePoint, scaleBy, length } from '../ParticleUtils';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';

export class AccelerationBehavior implements IEmitterBehavior
{
    public static type = 'moveAcceleration';
    public static editorConfig: BehaviorEditorConfig = null;

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
         * Minimum speed when initializing the particle.
         */
        minStart: number;
        /**
         * Maximum speed when initializing the particle.
         */
        maxStart: number;
        /**
         * Constant acceleration, in the coordinate space of the particle parent.
         */
        accel: {x: number; y: number};
        /**
         * Rotate the particle with its direction of movement.
         * While initial movement direction reacts to rotation settings, this overrides any dynamic rotation.
         */
        rotate: boolean;
        /**
         * Maximum linear speed. 0 is unlimited.
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

            rotatePoint(next.rotation, next.config.velocity);

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
            const currentSpeed = length(vel);
            // if we are going faster than we should, clamp at the max speed
            // DO NOT recalculate vector length

            if (currentSpeed > this.maxSpeed)
            {
                scaleBy(vel, this.maxSpeed / currentSpeed);
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
