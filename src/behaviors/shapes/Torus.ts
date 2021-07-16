import { Particle } from '../../Particle';
import { ParticleUtils } from '../../ParticleUtils';
import { SpawnShape } from './SpawnShape';

export class Torus implements SpawnShape
{
    public x: number;
    public y: number;
    public radius: number;
    public innerRadius: number;
    public rotation: boolean;
    constructor(config: {radius: number; x: number; y: number; innerRadius?: number; affectRotation?: boolean})
    {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.radius = config.radius;
        this.innerRadius = config.innerRadius || 0;
        this.rotation = !!config.affectRotation;
    }

    getRandPos(particle: Particle): void
    {
        // place the particle at a random radius in the ring
        if (this.innerRadius !== this.radius)
        {
            particle.x = (Math.random() * (this.radius - this.innerRadius)) + this.innerRadius;
        }
        else
        {
            particle.x = this.radius;
        }
        particle.y = 0;
        // rotate the point to a random angle in the circle
        const angle = Math.random() * Math.PI * 2;

        if (this.rotation)
        {
            particle.rotation += angle;
        }
        ParticleUtils.rotatePoint(angle, particle.position);
        // now add in the center of the torus
        particle.position.x += this.x;
        particle.position.y += this.y;
    }
}
