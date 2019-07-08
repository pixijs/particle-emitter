import {ISpawnStrategy} from "../SpawnFactory";
import {Emitter} from "../../Emitter";
import {EmitterConfig, OldEmitterConfig} from "../../EmitterConfig";
import {Circle} from "pixi.js";
import {Particle} from "../../Particle";
import {ParticleUtils} from "../../ParticleUtils";
import {Temp} from "../../utils/Temp";

/**
 * A ring spawn type strategy.
 */
export class SpawnRingStrategy implements ISpawnStrategy {
    parseConfig(emitter: Emitter, config: EmitterConfig | OldEmitterConfig): void {
        emitter.spawnType = "ring";
        const spawnCircle = config.spawnCircle;
        emitter.spawnCircle = new Circle(spawnCircle.x, spawnCircle.y, spawnCircle.r) as any;
        emitter.spawnCircle.minRadius = spawnCircle.minR;
    }

    /**
     * Positions a particle for a ring type emitter.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave. Not used for this function.
     */
    public spawn(p: Particle, emitPosX: number, emitPosY: number): void
    {
        const emitter = p.emitter;
        const spawnCircle = emitter.spawnCircle;
        //set the initial rotation/direction of the particle based on starting
        //particle angle and rotation of emitter
        if (emitter.minStartRotation == emitter.maxStartRotation)
            p.rotation = emitter.minStartRotation + emitter.rotation;
        else
            p.rotation = Math.random() * (emitter.maxStartRotation - emitter.minStartRotation) +
                emitter.minStartRotation + emitter.rotation;
        //place the particle at a random radius in the ring
        if(spawnCircle.minRadius !== spawnCircle.radius)
        {
            Temp.point.x = Math.random() * (spawnCircle.radius - spawnCircle.minRadius) +
                spawnCircle.minRadius;
        }
        else
            Temp.point.x = spawnCircle.radius;
        Temp.point.y = 0;
        //rotate the point to a random angle in the circle
        let angle = Math.random() * 360;
        p.rotation += angle;
        ParticleUtils.rotatePoint(angle, Temp.point);
        //offset by the circle's center
        Temp.point.x += emitter.spawnCircle.x;
        Temp.point.y += emitter.spawnCircle.y;
        //rotate the point by the emitter's rotation
        if(emitter.rotation !== 0)
            ParticleUtils.rotatePoint(emitter.rotation, Temp.point);
        //set the position, offset by the emitter's position
        p.position.x = emitPosX + Temp.point.x;
        p.position.y = emitPosY + Temp.point.y;
    }

}