import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { ParticleUtils } from '../ParticleUtils';

export class BurstSpawn implements IEmitterBehavior
{
    public static type = 'spawnBurst';

    order = BehaviorOrder.Spawn;
    private spacing: number;
    private start: number;
    private distance: number;

    constructor(config: {
        /**
         * Property: spacing
         * Type: number
         * Title: Particle Spacing
         * Description: Spacing between each particle spawned in a wave, in degrees.
         * EditorDefault: 0
         */
        spacing: number;
        /**
         * Property: start
         * Type: number
         * Title: Start Angle
         * Description: Angle to start placing particles at, in degrees. 0 is facing right, 90 is facing upwards.
         * EditorDefault: 0
         */
        start: number;
        /**
         * Property: distance
         * Type: number
         * Title: Distance
         * Description: Distance from the emitter to spawn particles, forming a ring/arc.
         * Min: 0
         * EditorDefault: 0
         */
        distance: number;
    })
    {
        this.spacing = config.spacing * ParticleUtils.DEG_TO_RADS;
        this.start = config.start * ParticleUtils.DEG_TO_RADS;
        this.distance = config.distance;
    }

    initParticles(first: Particle): void
    {
        let count = 0;
        let next = first;

        while (next)
        {
            let angle: number;

            if (this.spacing)
            {
                angle = this.start + (this.spacing * count);
            }
            else
            {
                angle = Math.random() * Math.PI * 2;
            }

            next.rotation = angle;
            if (this.distance)
            {
                next.position.x = this.distance;
                ParticleUtils.rotatePoint(angle, next.position);
            }
            next = next.next;
            ++count;
        }
    }
}
