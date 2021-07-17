import { Particle } from '../Particle';

export interface IEmitterBehavior
{
    order: number;
    initParticles(first: Particle): void;
    updateParticle?(particle: Particle, deltaSec: number): void|boolean;
    recycleParticle?(particle: Particle, natural: boolean): void;
}
export interface IEmitterBehaviorClass
{
    type: string;
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
