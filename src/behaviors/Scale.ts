import { Particle } from '../Particle';
import { PropertyList } from '../PropertyList';
import { PropertyNode, ValueList } from '../PropertyNode';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';

export class ScaleBehavior implements IEmitterBehavior
{
    public static type = 'scale';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private list: PropertyList<number>;
    private minMult: number;
    constructor(config: {
        /**
         * Scale of the particles, with a minimum value of 0
         */
        scale: ValueList<number>;
        /**
         * A value between minimum scale multipler and 1 is randomly
         * generated and multiplied with each scale value to provide the actual scale for each particle.
         */
        minMult: number;
    })
    {
        this.list = new PropertyList(false);
        this.list.reset(PropertyNode.createList(config.scale));
        this.minMult = config.minMult;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            const mult = (Math.random() * (1 - this.minMult)) + this.minMult;

            next.config.scaleMult = mult;
            next.scale.x = next.scale.y = this.list.first.value * mult;

            next = next.next;
        }
    }

    updateParticle(particle: Particle): void
    {
        particle.scale.x = particle.scale.y = this.list.interpolate(particle.agePercent) * particle.config.scaleMult;
    }
}

export class StaticScaleBehavior implements IEmitterBehavior
{
    public static type = 'scaleStatic';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private min: number;
    private max: number;
    constructor(config: {
        /**
         * Minimum scale of the particles, with a minimum value of 0
         */
        min: number;
        /**
         * Maximum scale of the particles, with a minimum value of 0
         */
        max: number;
    })
    {
        this.min = config.min;
        this.max = config.max;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            const scale = (Math.random() * (this.max - this.min)) + this.min;

            next.scale.x = next.scale.y = scale;

            next = next.next;
        }
    }
}
