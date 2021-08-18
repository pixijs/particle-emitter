import { RandomAnimatedTextureBehavior, SingleAnimatedTextureBehavior } from '../../AnimatedTexture';
import { ObjectProperty } from '../Types';

const AnimatedArt: ObjectProperty = {
    type: 'object',
    name: 'anim',
    title: 'Animated Particle Art',
    description: 'An individual particle animation',
    props: [
        {
            type: 'number',
            name: 'framerate',
            title: 'Framerate',
            description: 'Animation framerate. A value of -1 means to match the lifetime of the particle.',
            default: 30,
            min: -1,
        },
        {
            type: 'boolean',
            name: 'loop',
            title: 'Loop',
            description: 'If the animation loops.',
            default: false,
        },
        {
            type: 'list',
            name: 'textures',
            title: 'Frames',
            description: 'Animation frames.',
            entryType: {
                type: 'object',
                name: '',
                title: 'Frame',
                description: 'A single frame of the animation',
                props: [
                    {
                        type: 'image',
                        name: 'texture',
                        title: 'Texture',
                        description: 'The texture for this frame',
                    },
                    {
                        type: 'number',
                        name: 'count',
                        title: 'Count',
                        description: 'How many frames to hold this frame.',
                        default: 1,
                        min: 1,
                    },
                ],
            },
        },
    ],
};

RandomAnimatedTextureBehavior.editorConfig = {
    category: 'art',
    title: 'Animated Texture (random)',
    props: [
        {
            type: 'list',
            name: 'anims',
            title: 'Particle Animations',
            description: 'Animation configuration to use for each particle, randomly chosen from the list.',
            entryType: AnimatedArt,
        },
    ],
};

SingleAnimatedTextureBehavior.editorConfig = {
    category: 'art',
    title: 'Animated Texture (single)',
    props: [
        AnimatedArt
    ],
};
