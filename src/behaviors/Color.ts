import { Particle } from '../Particle';
import { Color, combineRGBComponents } from '../ParticleUtils';
import { PropertyList } from '../PropertyList';
import { PropertyNode, ValueList } from '../PropertyNode';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';

export class ColorBehavior implements IEmitterBehavior
{
    public static type = 'color';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private list: PropertyList<Color>;
    constructor(config: {
        /**
         * Color of the particles as 6 digit hex codes.
         */
        color: ValueList<string>;
    })
    {
        this.list = new PropertyList(true);
        this.list.reset(PropertyNode.createList(config.color));
    }

    initParticles(first: Particle): void
    {
        let next = first;
        const color = this.list.first.value;
        const tint = combineRGBComponents(color.r, color.g, color.b);

        while (next)
        {
            next.tint = tint;
            next = next.next;
        }
    }

    updateParticle(particle: Particle): void
    {
        particle.tint = this.list.interpolate(particle.agePercent);
    }
}

export class StaticColorBehavior implements IEmitterBehavior
{
    public static type = 'colorStatic';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private value: number;
    constructor(config: {
        /**
         * Color of the particles as 6 digit hex codes.
         */
        color: string;
    })
    {
        let color = config.color;

        if (color.charAt(0) === '#')
        {
            color = color.substr(1);
        }
        else if (color.indexOf('0x') === 0)
        {
            color = color.substr(2);
        }

        this.value = parseInt(color, 16);
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            next.tint = this.value;
            next = next.next;
        }
    }
}
