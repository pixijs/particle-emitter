import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { SpawnShape, SpawnShapeClass } from './shapes/SpawnShape';
import { PolygonalChain } from './shapes/PolygonalChain';
import { Rectangle } from './shapes/Rectangle';
import { Torus } from './shapes/Torus';
import { BehaviorEditorConfig } from './editor/Types';

export class ShapeSpawn implements IEmitterBehavior
{
    public static type = 'spawnShape';
    public static editorConfig: BehaviorEditorConfig = null;

    /**
     * Dictionary of all registered shape classes.
     */
    private static shapes: {[key: string]: SpawnShapeClass} = {};

    /**
     * Registers a shape to be used by the ShapeSpawn behavior.
     * @param constructor The shape class constructor to use, with a static `type` property to reference it by.
     * @param typeOverride An optional type override, primarily for registering a shape under multiple names.
     */
    public static registerShape(constructor: SpawnShapeClass, typeOverride?: string): void
    {
        ShapeSpawn.shapes[typeOverride || constructor.type] = constructor;
    }

    order = BehaviorOrder.Spawn;
    private shape: SpawnShape;

    constructor(config: {
        /**
         * Type of the shape to spawn
         */
        type: string;
        /**
         * Configuration data for the spawn shape.
         */
        data: any;
    })
    {
        const ShapeClass = ShapeSpawn.shapes[config.type];

        if (!ShapeClass)
        {
            throw new Error(`No shape found with type '${config.type}'`);
        }
        this.shape = new ShapeClass(config.data);
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            this.shape.getRandPos(next);
            next = next.next;
        }
    }
}

ShapeSpawn.registerShape(PolygonalChain);
ShapeSpawn.registerShape(Rectangle);
ShapeSpawn.registerShape(Torus);
ShapeSpawn.registerShape(Torus, 'circle');
