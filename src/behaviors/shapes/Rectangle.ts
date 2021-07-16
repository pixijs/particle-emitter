import { Particle } from '../../Particle';
import { SpawnShape } from './SpawnShape';

export class Rectangle implements SpawnShape
{
    public x: number;
    public y: number;
    public w: number;
    public h: number;
    constructor(config: {x: number; y: number; w: number; h: number})
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
