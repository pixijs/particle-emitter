import { Particle } from '../Particle';
import { PropertyList } from '../PropertyList';
import { PropertyNode, ValueList } from '../PropertyNode';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';

export class AlphaBehavior implements IEmitterBehavior
{
    public static type = 'alpha';

    public order = BehaviorOrder.Normal;
    private list: PropertyList<number>;
    constructor(config: {
        /**
         * Property: alpha
         * Type: ValueList<number>
         * Title: Alpha
         * Description: Transparency of the particles from 0 (transparent) to 1 (opaque)
         * Min: 0
         * Max: 1
         * EditorDefault: 1
         */
        alpha: ValueList<number>;
    })
    {
        this.list = new PropertyList(false);
        this.list.reset(PropertyNode.createList(config.alpha));
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            next.alpha = this.list.first.value;
            next = next.next;
        }
    }

    updateParticle(particle: Particle): void
    {
        particle.alpha = this.list.interpolate(particle.agePercent);
    }
}

export class StaticAlphaBehavior implements IEmitterBehavior
{
    public static type = 'alphaStatic';

    public order = BehaviorOrder.Normal;
    private value: number;
    constructor(config: {
        /**
         * Property: alpha
         * Type: number
         * Title: Alpha
         * Description: Transparency of the particles from 0 (transparent) to 1 (opaque)
         * Min: 0
         * Max: 1
         * EditorDefault: 1
         */
        alpha: number;
    })
    {
        this.value = config.alpha;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            next.alpha = this.value;
            next = next.next;
        }
    }
}
