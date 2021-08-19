import { BurstSpawn } from '../../BurstSpawn';

BurstSpawn.editorConfig = {
    category: 'spawn',
    title: 'Burst',
    props: [
        {
            type: 'number',
            name: 'spacing',
            title: 'Particle Spacing',
            description: 'Spacing between each particle spawned in a wave, in degrees.',
            default: 0,
        },
        {
            type: 'number',
            name: 'start',
            title: 'Start Angle',
            description: 'Angle to start placing particles at, in degrees. 0 is facing right, 90 is facing upwards.',
            default: 0,
        },
        {
            type: 'number',
            name: 'distance',
            title: 'Distance',
            description: 'Distance from the emitter to spawn particles, forming a ring/arc.',
            default: 0,
            min: 0,
        },
    ],
};
