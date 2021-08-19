import { ColorBehavior, StaticColorBehavior } from '../../Color';

ColorBehavior.editorConfig = {
    category: 'color',
    title: 'Interpolated Color',
    props: [
        {
            type: 'colorList',
            name: 'color',
            title: 'Color',
            description: 'Color of the particles as 6 digit hex codes.',
            default: '#ffffff',
        },
    ],
};

StaticColorBehavior.editorConfig = {
    category: 'color',
    title: 'Static Color',
    props: [
        {
            type: 'color',
            name: 'color',
            title: 'Color',
            description: 'Color of the particles as 6 digit hex codes.',
            default: '#ffffff',
        },
    ],
};
