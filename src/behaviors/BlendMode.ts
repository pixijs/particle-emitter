import { Particle } from '../Particle';
import { ParticleUtils } from '../ParticleUtils';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';

export class BlendModeBehavior implements IEmitterBehavior
{
    public static type = 'blendMode';

    public order = BehaviorOrder.Normal;
    private value: string;
    constructor(config: {
        /**
         * Property: blendMode
         * Type: string
         * Title: Blend Mode
         * Description: Blend mode of all particles.
         * EditorDefault: "normal"
         */
        blendMode: string;
    })
    {
        this.value = config.blendMode;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            next.blendMode = ParticleUtils.getBlendMode(this.value);
            next = next.next;
        }
    }
}
