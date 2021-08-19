import { Texture } from '@pixi/core';
import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { GetTextureFromString } from '../ParticleUtils';
import { BehaviorEditorConfig } from './editor/Types';

export class SingleTextureBehavior implements IEmitterBehavior
{
    public static type = 'textureSingle';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private texture: Texture;
    constructor(config: {
        /**
         * Image to use for each particle.
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
