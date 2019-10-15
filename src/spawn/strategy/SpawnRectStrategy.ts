import {ISpawnStrategy} from "../SpawnFactory";
import {Emitter} from "../../Emitter";
import {EmitterConfig, OldEmitterConfig} from "../../EmitterConfig";
import {Point, Rectangle} from "pixi.js";
import {Particle} from "../../Particle";
import {ParticleUtils} from "../../ParticleUtils";

/**
 * A rect spawn type strategy.
 */
export class SpawnRectStrategy implements ISpawnStrategy {

    protected helperPoint:Point = new Point();

    public parseConfig(emitter:Emitter, config: EmitterConfig | OldEmitterConfig): void {
        emitter.spawnType = "rect";
        let spawnRect = config.spawnRect;
        emitter.spawnRect = new Rectangle(spawnRect.x, spawnRect.y, spawnRect.w, spawnRect.h);
    }

    /**
     * Positions a particle for a rectangle type emitter.
     * @param p The particle to position and rotate.
     * @param emitPosX The emitter's x position
     * @param emitPosY The emitter's y position
     * @param i The particle number in the current wave. Not used for this function.
     */
    public spawn(p: Particle, emitPosX: number, emitPosY: number): void
    {
        const emitter = p.emitter;
        //set the initial rotation/direction of the particle based on starting
        //particle angle and rotation of emitter
        if (emitter.minStartRotation == emitter.maxStartRotation)
            p.rotation = emitter.minStartRotation + emitter.rotation;
        else
            p.rotation = Math.random() * (emitter.maxStartRotation - emitter.minStartRotation) + emitter.minStartRotation + emitter.rotation;
        //place the particle at a random point in the rectangle
        this.helperPoint.x = Math.random() * emitter.spawnRect.width + emitter.spawnRect.x;
        this.helperPoint.y = Math.random() * emitter.spawnRect.height + emitter.spawnRect.y;
        if(emitter.rotation !== 0)
            ParticleUtils.rotatePoint(emitter.rotation, this.helperPoint);
        p.position.x = emitPosX + this.helperPoint.x;
        p.position.y = emitPosY + this.helperPoint.y;
    }
}