import { Particle } from '../Particle';
import { ParticleUtils } from '../ParticleUtils';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';

export class BlendModeBehavior implements IEmitterBehavior
{
    public static type = 'blendMode';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private value: string;
    constructor(config: {
        /**
         * Blend mode of all particles.
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
