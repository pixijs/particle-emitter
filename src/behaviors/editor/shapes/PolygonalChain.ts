import { PolygonalChain } from '../../shapes/PolygonalChain';

PolygonalChain.editorConfig = {
    type: 'list',
    name: '',
    title: 'PolygonalChain',
    description: 'A series of lines along which particles are spawned randomly.',
    entryType: {
        type: 'list',
        name: '',
        title: 'Line',
        description: 'A series of points describing connected line segments',
        entryType: {
            type: 'point',
            name: '',
            title: 'Point',
            description: 'An individual point in a line segment',
            default: { x: 0, y: 0 },
        }
    },
};
