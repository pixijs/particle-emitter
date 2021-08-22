import { Particle } from '../../Particle';
import type { ListProperty, ObjectProperty } from '../editor/Types';

/**
 * Any shape capable of generating a random position for the {@link ShapeSpawnBehavior | shape spawn behavior}.
 */
export interface SpawnShape
{
    /**
     * Assign a random position to the given particle.
     * Rotation may optionally be applied; assigning any other properties, while allowed, would be improper.
     */
    getRandPos(particle: Particle): void;
}

/**
 * Class definition/static properties for a shape capable of generating a random
 * position for the {@link ShapeSpawnBehavior | shape spawn behavior}.
 */
export interface SpawnShapeClass
{
    /**
     * Type that the shape is registered under.
     */
    type: string;
    /**
     * Configuration for an editor to display. This does not need to exist in production code.
     */
    editorConfig?: ObjectProperty|ListProperty;
    /**
     * The shape constructor itself.
     * @param config The config for the shape, which should match its defined specifications.
     */
    new (config: any): SpawnShape;
}
