import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { SpawnShape, SpawnShapeClass } from './shapes/SpawnShape';
import { PolygonalChain } from './shapes/PolygonalChain';
import { Rectangle } from './shapes/Rectangle';
import { Torus } from './shapes/Torus';
import { BehaviorEditorConfig } from './editor/Types';

/**
 * A Spawn behavior that places (and optionally rotates) particles according to a
 * specified shape. Additional shapes can be registered with {@link registerShape | SpawnShape.registerShape()}.
 * Additional shapes must implement the {@link SpawnShape} interface, and their class must match the
 * {@link SpawnShapeClass} interface.
 * Shapes included by default are:
 * * {@link Rectangle}
 * * {@link Torus}
 * * {@link PolygonalChain}
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'spawnShape',
 *     config: {
 *          type: 'rect',
 *          data: {
 *              x: 0,
 *              y: 0,
 *              width: 20,
 *              height: 300,
 *          }
 *     }
 * }
 * ```
 */
export class ShapeSpawnBehavior implements IEmitterBehavior
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
        ShapeSpawnBehavior.shapes[typeOverride || constructor.type] = constructor;
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
        const ShapeClass = ShapeSpawnBehavior.shapes[config.type];

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

ShapeSpawnBehavior.registerShape(PolygonalChain);
ShapeSpawnBehavior.registerShape(Rectangle);
ShapeSpawnBehavior.registerShape(Torus);
ShapeSpawnBehavior.registerShape(Torus, 'circle');
