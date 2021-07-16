import { Texture } from '@pixi/core';
import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { GetTextureFromString } from '../ParticleUtils';

export class RandomTextureBehavior implements IEmitterBehavior
{
    public static type = 'textureRandom';

    public order = BehaviorOrder.Normal;
    private textures: Texture[];
    constructor(config: {
        /**
         * Property: textures
         * Type: Image[]
         * Title: Particle Textures
         * Description: Images to use for each particle, randomly chosen from the list.
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
