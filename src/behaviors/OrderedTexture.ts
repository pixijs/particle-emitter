import { Texture } from '@pixi/core';
import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { GetTextureFromString } from '../ParticleUtils';
import { BehaviorEditorConfig } from './editor/Types';

/**
 * A Texture behavior that assigns a texture to each particle from its list, in order, before looping around to the first
 * texture again. String values will be converted to textures with {@link ParticleUtils.GetTextureFromString}.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'textureOrdered',
 *     config: {
 *         textures: ["myTex1Id", "myTex2Id", "myTex3Id", "myTex4Id"],
 *     }
 * }
 * ```
 */
export class OrderedTextureBehavior implements IEmitterBehavior
{
    public static type = 'textureOrdered';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private textures: Texture[];
    private index: number;
    constructor(config: {
        /**
         * Images to use for each particle, used in order before looping around
         */
        textures: Texture[];
    })
    {
        this.index = 0;
        this.textures = config.textures.map((tex) => (typeof tex === 'string' ? GetTextureFromString(tex) : tex));
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            next.texture = this.textures[this.index];
            if (++this.index >= this.textures.length)
            {
                this.index = 0;
            }
            next = next.next;
        }
    }
}
