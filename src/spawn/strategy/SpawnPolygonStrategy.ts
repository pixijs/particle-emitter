import {ISpawnStrategy} from "../SpawnFactory";
import {Emitter} from "../../Emitter";
import {EmitterConfig, OldEmitterConfig} from "../../EmitterConfig";
import {Particle} from "../../Particle";
import {ParticleUtils} from "../../ParticleUtils";
import {PolygonalChain} from "../../PolygonalChain";
import {Point} from "pixi.js";

/**
 * A polygon spawn type strategy.
 */
export class SpawnPolygonStrategy implements ISpawnStrategy {
    protected helperPoint:Point = new Point();

    parseConfig(emitter: Emitter, config: EmitterConfig | OldEmitterConfig): void {
        emitter.spawnType = "polygonalChain";
        emitter.spawnPolygonalChain = new PolygonalChain(config.spawnPolygon);
    }

    /**
     * Positions a particle for polygonal chain.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave. Not used for this function.
     */
    public spawn(p: Particle, emitPosX: number, emitPosY: number) {
        const emitter = p.emitter;
        //set the initial rotation/direction of the particle based on starting
        //particle angle and rotation of emitter
        if (emitter.minStartRotation == emitter.maxStartRotation)
            p.rotation = emitter.minStartRotation + emitter.rotation;
        else
            p.rotation = Math.random() * (emitter.maxStartRotation - emitter.minStartRotation) +
                emitter.minStartRotation + emitter.rotation;
        // get random point on the polygon chain
        emitter.spawnPolygonalChain.getRandomPoint(this.helperPoint);
        //rotate the point by the emitter's rotation
        if (emitter.rotation !== 0)
            ParticleUtils.rotatePoint(emitter.rotation, this.helperPoint);
        //set the position, offset by the emitter's position
        p.position.x = emitPosX + this.helperPoint.x;
        p.position.y = emitPosY + this.helperPoint.y;
    }
}