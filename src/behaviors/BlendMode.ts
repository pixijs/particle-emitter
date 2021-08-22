import { Particle } from '../Particle';
import { getBlendMode } from '../ParticleUtils';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';

/**
 * A Blend Mode behavior that applies a blend mode value to the particle at initialization.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'blendMode',
 *     config: {
 *         blendMode: 'multiply',
 *     }
 * }
 * ```
 */
export class BlendModeBehavior implements IEmitterBehavior
{
    public static type = 'blendMode';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private value: string;
    constructor(config: {
        /**
         * Blend mode of all particles. This value is a key from
         * [PixiJs's BLEND_MODE enum](https://pixijs.download/release/docs/PIXI.html#BLEND_MODES).
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
            next.blendMode = getBlendMode(this.value);
            next = next.next;
        }
    }
}
