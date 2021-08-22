import { SingleTextureBehavior } from '../../SingleTexture';

SingleTextureBehavior.editorConfig = {
    category: 'art',
    title: 'Single Texture',
    props: [
        {
            type: 'image',
            name: 'texture',
            title: 'Particle Texture',
            description: 'Image to use for each particle',
        },
    ],
};
