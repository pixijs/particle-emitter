import { AccelerationBehavior } from '../../AccelerationMovement';

AccelerationBehavior.editorConfig = {
    category: 'movement',
    title: 'Acceleration',
    props: [
        {
            type: 'number',
            name: 'minStart',
            title: 'Minimum Start Speed',
            description: 'Minimum speed when initializing the particle.',
            default: 100,
            min: 0,
        },
        {
            type: 'number',
            name: 'maxStart',
            title: 'Maximum Start Speed',
            description: 'Maximum speed when initializing the particle.',
            default: 100,
            min: 0,
        },
        {
            type: 'point',
            name: 'accel',
            title: 'Acceleration',
            description: 'Constant acceleration, in the coordinate space of the particle parent.',
            default: { x: 0, y: 50 },
        },
        {
            type: 'boolean',
            name: 'rotate',
            title: 'Rotate with Movement',
            description: 'Rotate the particle with its direction of movement. '
                + 'While initial movement direction reacts to rotation settings, this overrides any dynamic rotation.',
            default: true,
        },
        {
            type: 'number',
            name: 'maxSpeed',
            title: 'Maximum Speed',
            description: 'Maximum linear speed. 0 is unlimited.',
            default: 0,
            min: 0,
        },
    ],
};
