import { ShapeSpawn } from '../../ShapeSpawn';

ShapeSpawn.editorConfig = {
    category: 'spawn',
    title: 'Shape',
    props: [
        {
            type: 'subconfig',
            name: 'type',
            title: 'Shape',
            description: 'The shape to use for picking spawn locations.',
            dictionaryProp: 'shapes',
            configName: 'data',
        }
    ],
};
