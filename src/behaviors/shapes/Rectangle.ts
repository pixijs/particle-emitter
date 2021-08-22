import { Particle } from '../../Particle';
import type { ObjectProperty } from '../editor/Types';
import { SpawnShape } from './SpawnShape';

/**
 * A SpawnShape that randomly picks locations inside a rectangle.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'rect',
 *     data: {
 *          x: 0,
 *          y: 0,
 *          w: 10,
 *          h: 100
 *     }
 * }
 * ```
 */
export class Rectangle implements SpawnShape
{
    public static type = 'rect';
    public static editorConfig: ObjectProperty = null;
    /**
     * X (left) position of the rectangle.
     */
    public x: number;
    /**
     * Y (top) position of the rectangle.
     */
    public y: number;
    /**
     * Width of the rectangle.
     */
    public w: number;
    /**
     * Height of the rectangle.
     */
    public h: number;

    constructor(config: {
        /**
         * X (left) position of the rectangle.
         */
        x: number;
        /**
         * Y (top) position of the rectangle.
         */
        y: number;
        /**
         * Width of the rectangle.
         */
        w: number;
        /**
         * Height of the rectangle.
         */
        h: number;
    })
    {
        this.x = config.x;
        this.y = config.y;
        this.w = config.w;
        this.h = config.h;
    }

    getRandPos(particle: Particle): void
    {
        // place the particle at a random point in the rectangle
        particle.x = (Math.random() * this.w) + this.x;
        particle.y = (Math.random() * this.h) + this.y;
    }
}
