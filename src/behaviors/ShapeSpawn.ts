import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { SpawnShape } from './shapes/SpawnShape';
import { PolygonalChain } from './shapes/PolygonalChain';
import { Rectangle } from './shapes/Rectangle';
import { Torus } from './shapes/Torus';

export class ShapeSpawn implements IEmitterBehavior
{
    public static type = 'spawnShape';

    private static shapes: {[key: string]: {new (data: any): SpawnShape}} = {};

    public static registerShape(key: string, constructor: {new (data: any): SpawnShape}): void
    {
        ShapeSpawn.shapes[key] = constructor;
    }

    order = BehaviorOrder.Spawn;
    private shape: SpawnShape;

    constructor(config: {
        /**
         * Property: type
         * Type: string
         * Title: Shape Type
         * Description: Type of the shape to spawn
         */
        type: string;
        /**
         * Property: data
         * Type: SpawnShape
         * Title: Shape Data
         * Description: Data for the spawn shape.
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

ShapeSpawn.registerShape('polygonalChain', PolygonalChain);
ShapeSpawn.registerShape('rect', Rectangle);
ShapeSpawn.registerShape('torus', Torus);
ShapeSpawn.registerShape('circle', Torus);
