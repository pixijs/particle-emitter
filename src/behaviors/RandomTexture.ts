import { Texture } from '@pixi/core';
import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { GetTextureFromString } from '../ParticleUtils';
import { BehaviorEditorConfig } from './editor/Types';

/**
 * A Texture behavior that assigns a random texture to each particle from its list.
 * String values will be converted to textures with {@link ParticleUtils.GetTextureFromString}.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'textureRandom',
 *     config: {
 *         textures: ["myTex1Id", "myTex2Id", "myTex3Id", "myTex4Id"],
 *     }
 * }
 * ```
 */
export class RandomTextureBehavior implements IEmitterBehavior
{
    public static type = 'textureRandom';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private textures: Texture[];
    constructor(config: {
        /**
         * Images to use for each particle, randomly chosen from the list.
         */
        textures: (Texture|string)[];
    })
    {
        this.textures = config.textures.map((tex) => (typeof tex === 'string' ? GetTextureFromString(tex) : tex));
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            const index = Math.floor(Math.random() * this.textures.length);

            next.texture = this.textures[index];

            next = next.next;
        }
    }
}
