import { RotationBehavior, StaticRotationBehavior, NoRotationBehavior } from '../../Rotation';

RotationBehavior.editorConfig = {
    category: 'rotation',
    title: 'Dynamic Rotation',
    props: [
        {
            type: 'number',
            name: 'minStart',
            title: 'Minimum Starting Rotation',
            description: 'Minimum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.',
            default: 0,
        },
        {
            type: 'number',
            name: 'maxStart',
            title: 'Maximum Starting Rotation',
            description: 'Maximum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.',
            default: 0,
        },
        {
            type: 'number',
            name: 'minSpeed',
            title: 'Minimum Rotation Speed',
            description: 'Minimum rotation speed of the particles, in degrees/second. Positive is counter-clockwise.',
            default: 0,
        },
        {
            type: 'number',
            name: 'maxSpeed',
            title: 'Maximum Rotation Speed',
            description: 'Maximum rotation speed of the particles, in degrees/second. Positive is counter-clockwise.',
            default: 0,
        },
        {
            type: 'number',
            name: 'accel',
            title: 'Rotational Acceleration',
            description: 'Constant rotational acceleration of the particles, in degrees/second/second.',
            default: 0,
        },
    ],
};

StaticRotationBehavior.editorConfig = {
    category: 'rotation',
    title: 'Static Rotation',
    props: [
        {
            type: 'number',
            name: 'min',
            title: 'Minimum Rotation',
            description: 'Minimum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.',
            default: 0,
        },
        {
            type: 'number',
            name: 'max',
            title: 'Maximum Rotation',
            description: 'Maximum starting rotation of the particles, in degrees. 0 is facing right, 90 is upwards.',
            default: 0,
        },
    ],
};

NoRotationBehavior.editorConfig = {
    category: 'rotation',
    title: 'No Rotation',
    props: [],
};
