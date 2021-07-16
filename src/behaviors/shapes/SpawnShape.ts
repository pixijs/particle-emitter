import { Particle } from '../../Particle';

export interface SpawnShape
{
    getRandPos(particle: Particle): void;
}
