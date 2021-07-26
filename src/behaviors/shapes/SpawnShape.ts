import { Particle } from '../../Particle';

/**
 * Any shape capable of generating a random position for the ShapeSpawn behavior.
 */
export interface SpawnShape
{
    /**
     * Assign a random position to the given particle.
     * Rotation may optionally be applied, assigning any other properties would be improper.
     */
    getRandPos(particle: Particle): void;
}
