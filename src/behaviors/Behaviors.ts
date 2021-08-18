import { Particle } from '../Particle';
import { BehaviorEditorConfig } from './editor/Types';

/**
 * All behaviors must match this specification.
 */
export interface IEmitterBehavior
{
    /**
     * Order in which the behavior will be handled. Lower numbers are handled earlier, with an order of 0 getting
     * special treatment before the Emitter's transformation is applied.
     */
    order: number;
    /**
     * Called to initialize a wave of particles, with a reference to the first particle in the linked list.
     * @param first The first (maybe only) particle in a newly spawned wave of particles.
     */
    initParticles(first: Particle): void;
    /**
     * Updates a single particle for a given period of time elapsed. Return `true` to recycle the particle.
     * @param particle The particle to update.
     * @param deltaSec The time to advance the particle by in seconds.
     */
    updateParticle?(particle: Particle, deltaSec: number): void|boolean;
    /**
     * A hook for when a particle is recycled.
     * @param particle The particle that was just recycled.
     * @param natural `true` if the reycling was due to natural lifecycle, `false` if it was due to emitter cleanup.
     */
    recycleParticle?(particle: Particle, natural: boolean): void;
}

/**
 * A class for an emitter behavior.
 */
export interface IEmitterBehaviorClass
{
    /**
     * The unique type name that the behavior is registered under.
     */
    type: string;
    /**
     * Configuration data for an editor to display this behavior. Does not need to exist in production code.
     */
    editorConfig?: BehaviorEditorConfig;
    /**
     * The behavior constructor itself.
     * @param config The config for the behavior, which should match its defined specifications.
     */
    new (config: any): IEmitterBehavior;
}

/**
 * Standard behavior order values, specifying when/how they are used. Other numeric values can be used,
 * but only the Spawn value will be handled in a special way. All other values will be sorted numerically.
 * Behaviors with the same value will not be given any specific sort order, as they are assumed to not
 * interfere with each other.
 */
export enum BehaviorOrder
{
    /**
     * Spawn - initial placement and/or rotation. This happens before rotation/translation due to
     * emitter rotation/position is applied.
     */
    Spawn = 0,
    /**
     * Normal priority, for things that don't matter when they are applied.
     */
    Normal = 2,
    /**
     * Delayed priority, for things that need to read other values in order to act correctly.
     */
    Late = 5,
}
