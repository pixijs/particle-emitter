import {EmitterConfig, OldEmitterConfig} from "../EmitterConfig";
import {Emitter} from "../Emitter";
import {Particle} from "../Particle";
import {SpawnRectStrategy} from "./strategy/SpawnRectStrategy";
import {SpawnCircleStrategy} from "./strategy/SpawnCircleStrategy";
import {SpawnRingStrategy} from "./strategy/SpawnRingStrategy";
import {SpawnBurstStrategy} from "./strategy/SpawnBurstStrategy";
import {SpawnPointStrategy} from "./strategy/SpawnPointStrategy";
import {SpawnPolygonStrategy} from "./strategy/SpawnPolygonStrategy";

/**
 * Spawn factory which return spawn strategy depend on spawn type
 * 2 ways for add new strategies or change exists:
 *   1) extend from SpawnFactory and override getSpawnFactory() on Emitter
 *   2) use SpawnFactory.setStrategy()
 */
export class SpawnFactory {
    protected static _instance: SpawnFactory;

    public static get instance(): SpawnFactory {
        if (!this._instance) {
            this._instance = new SpawnFactory();
        }

        return this._instance;
    }

    /**
     * Spawn strategies
     */
    protected strategies: IStrategyStorage = {};

    protected constructor() {
        this.setStrategy("rect", new SpawnRectStrategy());
        this.setStrategy("circle", new SpawnCircleStrategy());
        this.setStrategy("ring", new SpawnRingStrategy());
        this.setStrategy("burst", new SpawnBurstStrategy());
        this.setStrategy("point", new SpawnPointStrategy());
        this.setStrategy("polygonalChain", new SpawnPolygonStrategy());
    }

    /**
     * Return spawn strategy depend on spawn type
     * @param spawnType Type of spawn
     * @return instance of spawn strategy
     */
    public getStrategy(spawnType: string): ISpawnStrategy {
        if (this.strategies.hasOwnProperty(spawnType)) {
            return this.strategies[spawnType];
        }
        return null;
    }

    /**
     * Set new or override exists spawn strategy
     * @param spawnType Type of spawn.
     * @param strategy Instance of spawn strategy
     */
    public setStrategy(spawnType: string, strategy: ISpawnStrategy): void {
        if (this.strategies[spawnType]) {
            console.log(`Particle spawn strategy overridden for type '${spawnType}'`);
        }
        this.strategies[spawnType] = strategy;
    }
}

export class IStrategyStorage {
    [key: string]: ISpawnStrategy;
}

export interface ISpawnStrategy {
    /**
     * Parse emitter config for a different spawn type
     * @param emitter Target emitter where will set properties from config.
     * @param config Full emitter config
     */
    parseConfig(emitter: Emitter, config: EmitterConfig | OldEmitterConfig): void;

    /**
     * Positions a particle for a different spawn type.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave. Not used for this function.
     */
    spawn(p: Particle, emitPosX: number, emitPosY: number, i?: number): void;
}