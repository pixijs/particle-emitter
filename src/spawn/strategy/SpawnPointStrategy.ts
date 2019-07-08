import {ISpawnStrategy} from "../SpawnFactory";
import {Emitter} from "../../Emitter";
import {EmitterConfig, OldEmitterConfig} from "../../EmitterConfig";
import {Particle} from "../../Particle";

/**
 * A point spawn type strategy.
 */
export class SpawnPointStrategy implements ISpawnStrategy {
    parseConfig(emitter: Emitter, config: EmitterConfig | OldEmitterConfig): void {
        emitter.spawnType = "point";
    }

    /**
     * Positions a particle for a point type emitter.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave. Not used for this function.
     */
    public spawn(p: Particle, emitPosX: number, emitPosY: number) {
        const emitter = p.emitter;
        //set the initial rotation/direction of the particle based on
        //starting particle angle and rotation of emitter
        if (emitter.minStartRotation == emitter.maxStartRotation)
            p.rotation = emitter.minStartRotation + emitter.rotation;
        else
            p.rotation = Math.random() * (emitter.maxStartRotation - emitter.minStartRotation) + emitter.minStartRotation + emitter.rotation;
        //drop the particle at the emitter's position
        p.position.x = emitPosX;
        p.position.y = emitPosY;
    }
}