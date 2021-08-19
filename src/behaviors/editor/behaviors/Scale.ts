import { ScaleBehavior, StaticScaleBehavior } from '../../Scale';

ScaleBehavior.editorConfig = {
    category: 'scale',
    title: 'Interpolated Scale',
    props: [
        {
            type: 'numberList',
            name: 'scale',
            title: 'Scale',
            description: 'Scale of the particles, with a minimum value of 0',
            default: 1,
            min: 0,
        },
        {
            type: 'number',
            name: 'minMult',
            title: 'Minimum Scale Multiplier',
            description: 'A value between minimum scale multipler and 1 is randomly '
                + 'generated and multiplied with each scale value to provide the actual scale for each particle.',
            default: 1,
            min: 0,
            max: 1,
        },
    ],
};

StaticScaleBehavior.editorConfig = {
    category: 'scale',
    title: 'Static Scale',
    props: [
        {
            type: 'number',
            name: 'min',
            title: 'Minimum Scale',
            description: 'Minimum scale of the particles, with a minimum value of 0',
            default: 1,
            min: 0,
        },
        {
            type: 'number',
            name: 'max',
            title: 'Maximum Scale',
            description: 'Maximum scale of the particles, with a minimum value of 0',
            default: 1,
            min: 0,
        },
    ],
};
