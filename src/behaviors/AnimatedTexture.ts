import { Texture } from '@pixi/core';
import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { GetTextureFromString } from '../ParticleUtils';

export interface AnimatedParticleArt
{
    framerate: 'matchLife'|number;
    loop?: boolean;
    textures: (string|Texture|{texture: string|Texture; count: number})[];
}

interface ParsedAnimatedParticleArt
{
    textures: Texture[];
    duration: number;
    framerate: number;
    loop: boolean;
}

function getTextures(textures: (string|Texture|{texture: string|Texture; count: number})[]): Texture[]
{
    const outTextures: Texture[] = [];

    for (let j = 0; j < textures.length; ++j)
    {
        let tex = textures[j];

        if (typeof tex === 'string')
        {
            outTextures.push(GetTextureFromString(tex));
        }
        else if (tex instanceof Texture)
        {
            outTextures.push(tex);
        }
        // assume an object with extra data determining duplicate frame data
        else
        {
            let dupe = tex.count || 1;

            if (typeof tex.texture === 'string')
            {
                tex = GetTextureFromString(tex.texture);
            }
            else// if(tex.texture instanceof Texture)
            {
                tex = tex.texture;
            }
            for (; dupe > 0; --dupe)
            {
                outTextures.push(tex);
            }
        }
    }

    return outTextures;
}

export class RandomAnimatedTextureBehavior implements IEmitterBehavior
{
    public static type = 'animatedRandom';

    public order = BehaviorOrder.Normal;
    private anims: ParsedAnimatedParticleArt[];
    constructor(config: {
        /**
         * Property: anims
         * Type: AnimatedParticleArt[]
         * Title: Particle Animations
         * Description: Animation configuration to use for each particle, randomly chosen from the list.
         */
        anims: AnimatedParticleArt[];
    })
    {
        this.anims = [];
        for (let i = 0; i < config.anims.length; ++i)
        {
            const anim = config.anims[i];
            const textures = getTextures(anim.textures);
            // eslint-disable-next-line no-nested-ternary
            const framerate = anim.framerate === 'matchLife' ? -1 : (anim.framerate > 0 ? anim.framerate : 60);
            const parsedAnim: ParsedAnimatedParticleArt = {
                textures,
                duration: framerate > 0 ? textures.length / framerate : 0,
                framerate,
                loop: framerate > 0 ? !!anim.loop : false,
            };

            this.anims.push(parsedAnim);
        }
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            const index = Math.floor(Math.random() * this.anims.length);
            const anim = next.config.anim = this.anims[index];

            next.texture = anim.textures[0];
            next.config.animElapsed = 0;
            // if anim should match particle life exactly
            if (anim.framerate === -1)
            {
                next.config.animDuration = next.maxLife;
                next.config.animFramerate = anim.textures.length / next.maxLife;
            }
            else
            {
                next.config.animDuration = anim.duration;
                next.config.animFramerate = anim.framerate;
            }

            next = next.next;
        }
    }

    updateParticle(particle: Particle, deltaSec: number): void
    {
        const config = particle.config;
        const anim = config.anim;

        config.animElapsed += deltaSec;
        if (config.animElapsed >= config.animDuration)
        {
            // loop elapsed back around
            if (config.anim.loop)
            {
                config.animElapsed = config.animElapsed % config.animDuration;
            }
            // subtract a small amount to prevent attempting to go past the end of the animation
            else
            {
                config.animElapsed = config.animDuration - 0.000001;
            }
        }
        // add a very small number to the frame and then floor it to avoid
        // the frame being one short due to floating point errors.
        const frame = ((config.animElapsed * config.animFramerate) + 0.0000001) | 0;

        // in the very rare case that framerate * elapsed math ends up going past the end, use the last texture
        particle.texture = anim.textures[frame] || anim.textures[anim.textures.length - 1] || Texture.EMPTY;
    }
}

export class SingleAnimatedTextureBehavior implements IEmitterBehavior
{
    public static type = 'animatedSingle';

    public order = BehaviorOrder.Normal;
    private anim: ParsedAnimatedParticleArt;
    constructor(config: {
        /**
         * Property: anim
         * Type: AnimatedParticleArt
         * Title: Particle Animations
         * Description: Animation configuration to use for each particle.
         */
        anim: AnimatedParticleArt;
    })
    {
        const anim = config.anim;
        const textures = getTextures(anim.textures);
        // eslint-disable-next-line no-nested-ternary
        const framerate = anim.framerate === 'matchLife' ? -1 : (anim.framerate > 0 ? anim.framerate : 60);

        this.anim = {
            textures,
            duration: framerate > 0 ? textures.length / framerate : 0,
            framerate,
            loop: framerate > 0 ? !!anim.loop : false,
        };
    }

    initParticles(first: Particle): void
    {
        let next = first;
        const anim = this.anim;

        while (next)
        {
            next.texture = anim.textures[0];
            next.config.animElapsed = 0;
            // if anim should match particle life exactly
            if (anim.framerate === -1)
            {
                next.config.animDuration = next.maxLife;
                next.config.animFramerate = anim.textures.length / next.maxLife;
            }
            else
            {
                next.config.animDuration = anim.duration;
                next.config.animFramerate = anim.framerate;
            }

            next = next.next;
        }
    }

    updateParticle(particle: Particle, deltaSec: number): void
    {
        const anim = this.anim;
        const config = particle.config;

        config.animElapsed += deltaSec;
        if (config.animElapsed >= config.animDuration)
        {
            // loop elapsed back around
            if (config.anim.loop)
            {
                config.animElapsed = config.animElapsed % config.animDuration;
            }
            // subtract a small amount to prevent attempting to go past the end of the animation
            else
            {
                config.animElapsed = config.animDuration - 0.000001;
            }
        }
        // add a very small number to the frame and then floor it to avoid
        // the frame being one short due to floating point errors.
        const frame = ((config.animElapsed * config.animFramerate) + 0.0000001) | 0;

        // in the very rare case that framerate * elapsed math ends up going past the end, use the last texture
        particle.texture = anim.textures[frame] || anim.textures[anim.textures.length - 1] || Texture.EMPTY;
    }
}
