var ParticleUtils = require("./ParticleUtils");
/**
 * A single node in a PropertyList.
 * @memberof PIXI.particles
 * @class PropertyNode
 * @constructor
 * @param {Object} data The data for this node
 * @param {number|string} data.value The value for this node
 * @param {number} data.time The time for this node, between 0-1
 * @param {Function|Array} [ease] Custom ease for this list. Only relevant for the first node.
 */
var PropertyNode = function(data, ease)
{
	/**
	 * Value for the node.
	 * @property {number|Object} value
	 */
	this.value = typeof value == "string" ? ParticleUtils.hexToRGB(value) : value;
	/**
	 * Time value for the node. Between 0-1.
	 * @property {number} value
	 */
	this.time = time;
	/**
	 * The next node in line.
	 * @property {PIXI.particles.PropertyNode} next
	 */
	this.next = null;
	/**
	 * If this is the first node in the list, controls if the entire list is stepped or not.
	 * @property {boolean} isStepped
	 */
	this.isStepped = false;
	this.ease = typeof ease == "function" ? ease : ParticleUtils.generateEase(ease);
};

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
PropertyNode.createList = function(data)
{
	if (Array.isArray(data.list))
	{
		var array = data.list;
		var node, first;
		first = node = new PropertyNode(array[0], data.ease);
		//only set up subsequent nodes if there are a bunch or the 2nd one is different from the first
		if (array.length > 2 || (array.length === 2 && array[1].value !== array[0].value))
		{
			for (var i = 1; i < array.length; ++i)
			{
				node.next = new PropertyNode(array[i]);
				node = node.next;
			}
		}
		first.isStepped = !!data.isStepped;
		return first;
	}
	else
	{
		//Handle deprecated version here
		var start = new PropertyNode({value: data.start, time: 0});
		//only set up a next value if it is different from the starting value
		if (data.end !== data.start)
			start.next = new PropertyNode({value: data.end, time: 1});
		return start;
	}
};

module.exports = PropertyNode;