import { Point } from 'pixi.js';

export interface BasicPoint
{
    x: number;
    y: number;
}

export interface Segment
{
    p1: BasicPoint;
    p2: BasicPoint;
    l: number;
}

/**
 * Chain of line segments for generating spawn positions.
 */
export class PolygonalChain
{
    /**
     * List of segment objects in the chain.
     */
    private segments: Segment[];
    /**
     * Total length of all segments of the chain.
     */
    private totalLength: number;
    /**
     * Total length of segments up to and including the segment of the same index.
     * Used for weighted random selection of segment.
     */
    private countingLengths: number[];

    /**
     * @param data Point data for polygon chains. Either a list of points for a single chain, or a list of chains.
     */
    constructor(data: BasicPoint[]|BasicPoint[][])
    {
        this.segments = [];
        this.countingLengths = [];
        this.totalLength = 0;
        this.init(data);
    }

    /**
     * @param data Point data for polygon chains. Either a list of points for a single chain, or a list of chains.
     */
    private init(data: BasicPoint[]|BasicPoint[][]): void
    {
        // if data is not present, set up a segment of length 0
        if (!data || !data.length)
        {
            this.segments.push({ p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 }, l: 0 });
        }
        else if (Array.isArray(data[0]))
        {
            // list of segment chains, each defined as a list of points
            for (let i = 0; i < data.length; ++i)
            {
                // loop through the chain, connecting points
                const chain = data[i] as BasicPoint[];
                let prevPoint = chain[0] as BasicPoint;

                for (let j = 1; j < chain.length; ++j)
                {
                    const second = chain[j] as BasicPoint;

                    this.segments.push({ p1: prevPoint, p2: second, l: 0 });
                    prevPoint = second;
                }
            }
        }
        else
        {
            let prevPoint = data[0] as BasicPoint;
            // list of points

            for (let i = 1; i < data.length; ++i)
            {
                const second = data[i] as BasicPoint;

                this.segments.push({ p1: prevPoint, p2: second, l: 0 });
                prevPoint = second;
            }
        }
        // now go through our segments to calculate the lengths so that we
        // can set up a nice weighted random distribution
        for (let i = 0; i < this.segments.length; ++i)
        {
            const { p1, p2 } = this.segments[i];
            const segLength = Math.sqrt(((p2.x - p1.x) * (p2.x - p1.x)) + ((p2.y - p1.y) * (p2.y - p1.y)));
            // save length so we can turn a random number into a 0-1 interpolation value later

            this.segments[i].l = segLength;
            this.totalLength += segLength;
            // keep track of the length so far, counting up
            this.countingLengths.push(this.totalLength);
        }
    }

    /**
     * Gets a random point in the chain.
     * @param out The point to store the selected position in.
     */
    public getRandomPoint(out: Point): void
    {
        // select a random spot in the length of the chain
        const rand = Math.random() * this.totalLength;
        let chosenSeg: Segment;
        let lerp: number;

        // if only one segment, it wins
        if (this.segments.length === 1)
        {
            chosenSeg = this.segments[0];
            lerp = rand;
        }
        else
        {
            // otherwise, go through countingLengths until we have determined
            // which segment we chose
            for (let i = 0; i < this.countingLengths.length; ++i)
            {
                if (rand < this.countingLengths[i])
                {
                    chosenSeg = this.segments[i];
                    // set lerp equal to the length into that segment
                    // (i.e. the remainder after subtracting all the segments before it)
                    lerp = i === 0 ? rand : rand - this.countingLengths[i - 1];
                    break;
                }
            }
        }
        // divide lerp by the segment length, to result in a 0-1 number.
        lerp /= chosenSeg.l || 1;
        const { p1, p2 } = chosenSeg;
        // now calculate the position in the segment that the lerp value represents

        out.x = p1.x + (lerp * (p2.x - p1.x));
        out.y = p1.y + (lerp * (p2.y - p1.y));
    }
}
