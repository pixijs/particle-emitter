import { Torus } from '../../shapes/Torus';

Torus.editorConfig = {
    type: 'object',
    name: '',
    title: 'Torus',
    description: 'A circle or ring shape which particles are spawned inside randomly.',
    props: [
        {
            type: 'number',
            name: 'x',
            title: 'Center X',
            description: 'The center x position of the circle.',
            default: 0,
        },
        {
            type: 'number',
            name: 'y',
            title: 'Center Y',
            description: 'The center y position of the circle.',
            default: 0,
        },
        {
            type: 'number',
            name: 'radius',
            title: 'Radius',
            description: 'The outer radius of the circle.',
            default: 10,
            min: 0,
        },
        {
            type: 'number',
            name: 'innerRadius',
            title: 'Inner Radius',
            description: 'The inner radius of the circle. Values greater than 0 make it into a torus/ring.',
            default: 0,
            min: 0,
        },
        {
            type: 'boolean',
            name: 'rotation',
            title: 'Apply Rotation',
            description: 'If particles should be rotated to face/move away from the center of the circle.',
            default: false,
        },
    ],
};
