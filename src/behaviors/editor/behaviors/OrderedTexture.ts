import { OrderedTextureBehavior } from '../../OrderedTexture';

OrderedTextureBehavior.editorConfig = {
    category: 'art',
    title: 'Ordered Texture',
    props: [
        {
            type: 'list',
            name: 'textures',
            title: 'Particle Textures',
            description: 'Images to use for each particle, used in order before looping around.',
            entryType: {
                type: 'image',
                name: 'texture',
                title: 'Texture',
                description: 'An individual texture in the ordered list',
            },
        },
    ],
};
