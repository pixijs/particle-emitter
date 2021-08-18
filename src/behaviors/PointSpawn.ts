import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';

export class PointSpawn implements IEmitterBehavior
{
    public static type = 'spawnPoint';
    public static editorConfig: BehaviorEditorConfig = null;

    order = BehaviorOrder.Spawn;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initParticles(_first: Particle): void
    {
        // really just a no-op
    }
}
