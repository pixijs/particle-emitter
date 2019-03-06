import {ParticleUtils, EaseSegment, SimpleEase} from "./ParticleUtils";

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
 */
export class PropertyNode<V>
{
	/**
	 * Value for the node.
	 */
	public value: V;
	/**
	 * Time value for the node. Between 0-1.
	 */
	public time: number;
	/**
	 * The next node in line.
	 */
	public next: PropertyNode<V>;
	/**
	 * If this is the first node in the list, controls if the entire list is stepped or not.
	 */
	public isStepped: boolean;
	public ease: SimpleEase;
	
	/**
	 * @param value The value for this node
	 * @param time The time for this node, between 0-1
	 * @param [ease] Custom ease for this list. Only relevant for the first node.
	 */
	constructor(value: V|string, time:number, ease?: SimpleEase|EaseSegment[])
	{
		this.value = typeof value == "string" ? ParticleUtils.hexToRGB(value) as any : value;
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
	 * @param data The data for the list.
	 * @param data.list The array of value and time objects.
	 * @param data.isStepped If the list is stepped rather than interpolated.
	 * @param data.ease Custom ease for this list.
	 * @return The first node in the list
	 */
	public static createList(data: ValueList):PropertyNode<any>
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