import { Texture } from '@pixi/core';
import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { GetTextureFromString } from '../ParticleUtils';

export class SingleTextureBehavior implements IEmitterBehavior
{
    public static type = 'textureSingle';

    public order = BehaviorOrder.Normal;
    private texture: Texture;
    constructor(config: {
        /**
         * Property: texture
         * Type: Image
         * Title: Particle Texture
         * Description: Image to use for each particle.
         */
        texture: Texture|string;
    })
    {
        this.texture = typeof config.texture === 'string' ? GetTextureFromString(config.texture) : config.texture;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            next.texture = this.texture;

            next = next.next;
        }
    }
}
