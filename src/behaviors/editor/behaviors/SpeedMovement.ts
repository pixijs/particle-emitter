import { SpeedBehavior, StaticSpeedBehavior } from '../../SpeedMovement';

SpeedBehavior.editorConfig = {
    category: 'movement',
    title: 'Interpolated Speed',
    props: [
        {
            type: 'numberList',
            name: 'speed',
            title: 'Speed',
            description: 'Speed of the particles, with a minimum value of 0',
            default: 100,
            min: 0,
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

StaticSpeedBehavior.editorConfig = {
    category: 'movement',
    title: 'Static Speed',
    props: [
        {
            type: 'number',
            name: 'min',
            title: 'Minimum Start Speed',
            description: 'Minimum speed when initializing the particle.',
            default: 100,
            min: 0,
        },
        {
            type: 'number',
            name: 'max',
            title: 'Maximum Start Speed',
            description: 'Maximum speed when initializing the particle.',
            default: 100,
            min: 0,
        },
    ],
};
