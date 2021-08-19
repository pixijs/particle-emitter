import { PathBehavior } from '../../PathMovement';

PathBehavior.editorConfig = {
    category: 'movement',
    title: 'Path Following',
    props: [
        {
            type: 'text',
            name: 'path',
            title: 'Path',
            description: 'Algebraic expression describing the movement of the particle. Examples: "x * x" or "sin(x)"',
            default: 'x',
        },
        {
            type: 'numberList',
            name: 'speed',
            title: 'Speed',
            description: 'Speed of the particles. This affects the x value in the path (before rotation).',
            default: 100,
        },
        {
            type: 'number',
            name: 'minMult',
            title: 'Minimum Speed Multiplier',
            description: 'A value between minimum speed multipler and 1 is randomly generated and multiplied '
                + 'with each speed value to generate the actual speed for each particle.',
            default: 1,
            min: 0,
            max: 1,
        },
    ],
};
