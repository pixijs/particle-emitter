import { Texture } from '@pixi/core';
import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { GetTextureFromString } from '../ParticleUtils';

export class OrderedTextureBehavior implements IEmitterBehavior
{
    public static type = 'textureOrdered';

    public order = BehaviorOrder.Normal;
    private textures: Texture[];
    private index: number;
    constructor(config: {
        /**
         * Property: textures
         * Type: Image[]
         * Title: Particle Textures
         * Description: Images to use for each particle, used in order before looping around
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
