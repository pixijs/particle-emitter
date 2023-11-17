import { Particle } from '../Particle';
import { Color, combineRGBComponents } from '../ParticleUtils';
import { PropertyList } from '../PropertyList';
import { PropertyNode, ValueList } from '../PropertyNode';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';

/**
 * A Color behavior that applies an interpolated or stepped list of values to the particle's tint property.
 *
 * Example config:
 * ```javascript
 * {
 *     "type": "color",
 *     "config": {
 *         "color": {
 *              "list": [{"value": "#ff0000", "time": 0}, {"value": "#00ff00", "time": 0.5}, {"value": "#0000ff", "time": 1}]
 *         },
 *     }
 * }
 * ```
 */
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

/**
 * A Color behavior that applies a randomly picked color to the particle's tint property at initialization.
 *
 * Example config:
 * ```javascript
 * {
 *     "type": "colorStatic",
 *     "config": {
 *         "color": ["#ffffff", "#ffff00"],
 *     }
 * }
 * ```
 */
export class StaticColorBehavior implements IEmitterBehavior
{
	public static type = 'colorStatic';
	public static editorConfig: BehaviorEditorConfig = null;

	public order = BehaviorOrder.Spawn;
	private values: number[] = [];
	constructor(config: {
		/**
		 * Color of the particles as 6 digit hex codes.
		 */
		color: string | string[];
	})
	{
	    const colors
			= config.color instanceof Array ? config.color : [config.color];

	    colors.forEach((color) =>
	    {
	        if (color.charAt(0) === '#')
	        {
	            color = color.substring(1);
	        }
	        else if (color.indexOf('0x') === 0)
	        {
	            color = color.substring(2);
	        }
	        this.values.push(parseInt(color, 16));
	    });
	}

	initParticles(first: Particle): void
	{
	    let next = first;

	    while (next)
	    {
	        next.tint = this.values[Math.round(Math.random() * this.values.length)];
	        next = next.next;
	    }
	}
}
