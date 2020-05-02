import { Particle } from './Particle';
import { Emitter } from './Emitter';
import { GetTextureFromString } from './ParticleUtils';
import { Texture } from 'pixi.js';

export interface ParsedAnimatedParticleArt
{
    textures: Texture[];
    duration: number;
    framerate: number;
    loop: boolean;
}

export interface AnimatedParticleArt
{
    framerate: 'matchLife'|number;
    loop?: boolean;
    textures: (string|Texture|{texture: string|Texture;count: number})[];
}

/**
 * An individual particle image with an animation. Art data passed to the emitter must be
 * formatted in a particular way for AnimatedParticle to be able to handle it:
 *
 * ```typescript
 * {
 *     //framerate is required. It is the animation speed of the particle in frames per
 *     //second.
 *     //A value of "matchLife" causes the animation to match the lifetime of an individual
 *     //particle, instead of at a constant framerate. This causes the animation to play
 *     //through one time, completing when the particle expires.
 *     framerate: 6,
 *     //loop is optional, and defaults to false.
 *     loop: true,
 *     //textures is required, and can be an array of any (non-zero) length.
 *     textures: [
 *         //each entry represents a single texture that should be used for one or more
 *         //frames. Any strings will be converted to Textures with Texture.from().
 *         //Instances of PIXI.Texture will be used directly.
 *         "animFrame1.png",
 *         //entries can be an object with a 'count' property, telling AnimatedParticle to
 *         //use that texture for 'count' frames sequentially.
 *         {
 *             texture: "animFrame2.png",
 *             count: 3
 *         },
 *         "animFrame3.png"
 *     ]
 * }
 * ```
 */
export class AnimatedParticle extends Particle
{
    /**
     * Texture array used as each frame of animation, similarly to how MovieClip works.
     */
    private textures: Texture[];

    /**
     * Duration of the animation, in seconds.
     */
    private duration: number;

    /**
     * Animation framerate, in frames per second.
     */
    private framerate: number;

    /**
     * Animation time elapsed, in seconds.
     */
    private elapsed: number;

    /**
     * If this particle animation should loop.
     */
    private loop: boolean;

    /**
     * @param emitter The emitter that controls this AnimatedParticle.
     */
    constructor(emitter: Emitter)
    {
        super(emitter);

        this.textures = null;
        this.duration = 0;
        this.framerate = 0;
        this.elapsed = 0;
        this.loop = false;
    }

    /**
     * Initializes the particle for use, based on the properties that have to
     * have been set already on the particle.
     */
    public init(): void
    {
        this.Particle_init();

        this.elapsed = 0;

        // if the animation needs to match the particle's life, then cacluate variables
        if (this.framerate < 0)
        {
            this.duration = this.maxLife;
            this.framerate = this.textures.length / this.duration;
        }
    }

    /**
     * Sets the textures for the particle.
     * @param art An array of PIXI.Texture objects for this animated particle.
     */
    public applyArt(art: ParsedAnimatedParticleArt): void
    {
        this.textures = art.textures;
        this.framerate = art.framerate;
        this.duration = art.duration;
        this.loop = art.loop;
    }

    /**
     * Updates the particle.
     * @param delta Time elapsed since the previous frame, in __seconds__.
     */
    public update(delta: number): number
    {
        const lerp = this.Particle_update(delta);
        // only animate the particle if it is still alive

        if (lerp >= 0)
        {
            this.elapsed += delta;
            if (this.elapsed > this.duration)
            {
                // loop elapsed back around
                if (this.loop)
                {
                    this.elapsed = this.elapsed % this.duration;
                }
                // subtract a small amount to prevent attempting to go past the end of the animation
                else
                {
                    this.elapsed = this.duration - 0.000001;
                }
            }
            // add a very small number to the frame and then floor it to avoid
            // the frame being one short due to floating point errors.
            const frame = ((this.elapsed * this.framerate) + 0.0000001) | 0;

            this.texture = this.textures[frame] || Texture.EMPTY;
        }

        return lerp;
    }

    /**
     * Destroys the particle, removing references and preventing future use.
     */
    public destroy(): void
    {
        this.Particle_destroy();
        this.textures = null;
    }

    /**
     * Checks over the art that was passed to the Emitter's init() function, to do any special
     * modifications to prepare it ahead of time.
     * @param art The array of art data, properly formatted for AnimatedParticle.
     * @return The art, after any needed modifications.
     */
    public static parseArt(art: AnimatedParticleArt[]): any
    {
        const outArr: ParsedAnimatedParticleArt[] = [];

        for (let i = 0; i < art.length; ++i)
        {
            const data = art[i];
            const output = outArr[i] = {} as ParsedAnimatedParticleArt;
            const outTextures = output.textures = [] as Texture[];
            const textures = data.textures;

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

            // use these values to signify that the animation should match the particle life time.
            if (data.framerate === 'matchLife')
            {
                // -1 means that it should be calculated
                output.framerate = -1;
                output.duration = 0;
                output.loop = false;
            }
            else
            {
                // determine if the animation should loop
                output.loop = !!data.loop;
                // get the framerate, default to 60
                output.framerate = data.framerate > 0 ? data.framerate : 60;
                // determine the duration
                output.duration = outTextures.length / output.framerate;
            }
        }

        return outArr;
    }
}
