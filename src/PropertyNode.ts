import ParticleUtils, {EaseSegment, SimpleEase, Color} from "./ParticleUtils";

export interface ValueStep {
	value:number|string;
	time:number;
}

export interface ValueList {
	list: ValueStep[],
	isStepped?: boolean;
	ease?: SimpleEase|EaseSegment[];
}
/**
 * A single node in a PropertyList.
 * @memberof PIXI.particles
 * @class PropertyNode
 * @constructor
 * @param {number|string} value The value for this node
 * @param {number} time The time for this node, between 0-1
 * @param {Function|Array} [ease] Custom ease for this list. Only relevant for the first node.
 */
export default class PropertyNode<V>
{
	/**
	 * Value for the node.
	 * @property {number|Object} value
	 */
	public value: V;
	/**
	 * Hold multiple possible values for the node.
	 * @property {Array<V>} value
	 */
	public arrayValue: Array<V>;
	/**
	 * Time value for the node. Between 0-1.
	 * @property {number} value
	 */
	public time: number;
	/**
	 * The next node in line.
	 * @property {PIXI.particles.PropertyNode} next
	 */
	public next: PropertyNode<V>;
	/**
	 * If this is the first node in the list, controls if the entire list is stepped or not.
	 * @property {boolean} isStepped
	 */
	public isStepped: boolean;
	public ease: SimpleEase;
	
	constructor(value: V|string|Array<string>|Array<number>, time:number, ease?: SimpleEase|EaseSegment[])
	{
		if(Array.isArray(value)) {
			this.arrayValue = (value as any).map((v: string|number) => {
				return typeof v == "string" ? ParticleUtils.hexToRGB(v) as any : v;
			});
			this.value = this.arrayValue[0] as any;
		} else {
			this.value = typeof value == "string" ? ParticleUtils.hexToRGB(value) as any : value;
			this.arrayValue = null;
		}
		this.time = time;
		this.next = null;
		this.isStepped = false;
		if (ease)
		{
			this.ease = typeof ease == "function" ? ease : ParticleUtils.generateEase(ease);
		}
		else
		{
			this.ease = null;
		}
	}

	/**
	 * Creates a list of property values from a data object {list, isStepped} with a list of objects in
	 * the form {value, time}. Alternatively, the data object can be in the deprecated form of
	 * {start, end}.
	 * @method PIXI.particles.PropertyNode.createListFromArray
	 * @static
	 * @param  {Object} data The data for the list.
	 * @param  {Array} data.list The array of value and time objects.
	 * @param  {boolean} [data.isStepped] If the list is stepped rather than interpolated.
	 * @param  {Function|Array} [data.ease] Custom ease for this list.
	 * @return {PIXI.particles.PropertyNode} The first node in the list
	 */
	public static createList(data: ValueList)
	{
		if (Array.isArray(data.list))
		{
			let array = data.list;
			let node, first;
			first = node = new PropertyNode(array[0].value, array[0].time, data.ease);
			//only set up subsequent nodes if there are a bunch or the 2nd one is different from the first
			if (array.length > 2 || (array.length === 2 && array[1].value !== array[0].value))
			{
				for (let i = 1; i < array.length; ++i)
				{
					node.next = new PropertyNode(array[i].value, array[i].time);
					node = node.next;
				}
			}
			first.isStepped = !!data.isStepped;
			return first;
		}
		else
		{
			//Handle deprecated version here
			let start = new PropertyNode((data as any).start, 0);
			//only set up a next value if it is different from the starting value
			if ((data as any).end !== (data as any).start)
				start.next = new PropertyNode((data as any).end, 1);
			return start;
		}
	}
}