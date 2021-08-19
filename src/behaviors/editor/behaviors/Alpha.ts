import { AlphaBehavior, StaticAlphaBehavior } from '../../Alpha';

AlphaBehavior.editorConfig = {
    category: 'alpha',
    title: 'Interpolated Alpha',
    props: [
        {
            type: 'numberList',
            name: 'alpha',
            title: 'Alpha',
            description: 'Transparency of the particles from 0 (transparent) to 1 (opaque)',
            default: 1,
            min: 0,
            max: 1,
        },
    ],
};

StaticAlphaBehavior.editorConfig = {
    category: 'alpha',
    title: 'Static Alpha',
    props: [
        {
            type: 'number',
            name: 'alpha',
            title: 'Alpha',
            description: 'Transparency of the particles from 0 (transparent) to 1 (opaque)',
            default: 1,
            min: 0,
            max: 1,
        },
    ],
};
