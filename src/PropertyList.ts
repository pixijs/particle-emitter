import { ParticleUtils, SimpleEase, Color } from './ParticleUtils';
import { PropertyNode } from './PropertyNode';

function intValueSimple(this: PropertyList<number>, lerp: number): number
{
    if (this.ease)
    { lerp = this.ease(lerp); }

    return ((this.next.value - this.current.value) * lerp) + this.current.value;
}

function intColorSimple(this: PropertyList<Color>, lerp: number): number
{
    if (this.ease)
    { lerp = this.ease(lerp); }
    const curVal = this.current.value; const
        nextVal = this.next.value;
    const r = ((nextVal.r - curVal.r) * lerp) + curVal.r;
    const g = ((nextVal.g - curVal.g) * lerp) + curVal.g;
    const b = ((nextVal.b - curVal.b) * lerp) + curVal.b;

    return ParticleUtils.combineRGBComponents(r, g, b);
}

function intValueComplex(this: PropertyList<number>, lerp: number): number
{
    if (this.ease)
    { lerp = this.ease(lerp); }
    // make sure we are on the right segment
    while (lerp > this.next.time)
    {
        this.current = this.next;
        this.next = this.next.next;
    }
    // convert the lerp value to the segment range
    lerp = (lerp - this.current.time) / (this.next.time - this.current.time);

    return ((this.next.value - this.current.value) * lerp) + this.current.value;
}

function intColorComplex(this: PropertyList<Color>, lerp: number): number
{
    if (this.ease)
    { lerp = this.ease(lerp); }
    // make sure we are on the right segment
    while (lerp > this.next.time)
    {
        this.current = this.next;
        this.next = this.next.next;
    }
    // convert the lerp value to the segment range
    lerp = (lerp - this.current.time) / (this.next.time - this.current.time);
    const curVal = this.current.value; const
        nextVal = this.next.value;
    const r = ((nextVal.r - curVal.r) * lerp) + curVal.r;
    const g = ((nextVal.g - curVal.g) * lerp) + curVal.g;
    const b = ((nextVal.b - curVal.b) * lerp) + curVal.b;

    return ParticleUtils.combineRGBComponents(r, g, b);
}

function intValueStepped(this: PropertyList<number>, lerp: number): number
{
    if (this.ease)
    { lerp = this.ease(lerp); }
    // make sure we are on the right segment
    while (this.next && lerp > this.next.time)
    {
        this.current = this.next;
        this.next = this.next.next;
    }

    return this.current.value;
}

function intColorStepped(this: PropertyList<Color>, lerp: number): number
{
    if (this.ease)
    { lerp = this.ease(lerp); }
    // make sure we are on the right segment
    while (this.next && lerp > this.next.time)
    {
        this.current = this.next;
        this.next = this.next.next;
    }
    const curVal = this.current.value;

    return ParticleUtils.combineRGBComponents(curVal.r, curVal.g, curVal.b);
}

/**
 * Singly linked list container for keeping track of interpolated properties for particles.
 * Each Particle will have one of these for each interpolated property.
 */
export class PropertyList<V>
{
    /**
     * The current property node in the linked list.
     */
    public current: PropertyNode<V>;
    /**
     * The next property node in the linked list. Stored separately for slightly less variable
     * access.
     */
    public next: PropertyNode<V>;
    /**
     * Calculates the correct value for the current interpolation value. This method is set in
     * the reset() method.
     * @param lerp The interpolation value from 0-1.
     * @return The interpolated value. Colors are converted to the hex value.
     */
    public interpolate: (lerp: number) => number;
    /**
     * A custom easing method for this list.
     * @param lerp The interpolation value from 0-1.
     * @return The eased value, also from 0-1.
     */
    public ease: SimpleEase;
    /**
     * If this list manages colors, which requires a different method for interpolation.
     */
    private isColor: boolean;

    /**
     * @param isColor If this list handles color values
     */
    constructor(isColor = false)
    {
        this.current = null;
        this.next = null;
        this.isColor = !!isColor;
        this.interpolate = null;
        this.ease = null;
    }

    /**
     * Resets the list for use.
     * @param first The first node in the list.
     * @param first.isStepped If the values should be stepped instead of interpolated linearly.
     */
    public reset(first: PropertyNode<V>): void
    {
        this.current = first;
        this.next = first.next;
        const isSimple = this.next && this.next.time >= 1;

        if (isSimple)
        {
            this.interpolate = this.isColor ? intColorSimple : intValueSimple;
        }
        else if (first.isStepped)
        {
            this.interpolate = this.isColor ? intColorStepped : intValueStepped;
        }
        else
        {
            this.interpolate = this.isColor ? intColorComplex : intValueComplex;
        }
        this.ease = this.current.ease;
    }
}
