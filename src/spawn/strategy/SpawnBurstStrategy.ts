import {ISpawnStrategy} from "../SpawnFactory";
import {Emitter} from "../../Emitter";
import {EmitterConfig, OldEmitterConfig} from "../../EmitterConfig";
import {Particle} from "../../Particle";

/**
 * A burst spawn type strategy.
 */
export class SpawnBurstStrategy implements ISpawnStrategy {
    public parseConfig(emitter: Emitter, config: EmitterConfig | OldEmitterConfig): void {
        emitter.spawnType = "burst";
        emitter.particleSpacing = config.particleSpacing;
        emitter.angleStart = config.angleStart ? config.angleStart : 0;
    }

    /**
     * Positions a particle for a burst type emitter.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave.
     */
    public spawn(p: Particle, emitPosX: number, emitPosY: number, i: number): void {
        const emitter = p.emitter;
        //set the initial rotation/direction of the particle based on spawn
        //angle and rotation of emitter
        if (emitter.particleSpacing === 0)
            p.rotation = Math.random() * 360;
        else
            p.rotation = emitter.angleStart + (emitter.particleSpacing * i) + emitter.rotation;
        //drop the particle at the emitter's position
        p.position.x = emitPosX;
        p.position.y = emitPosY;
    }
}