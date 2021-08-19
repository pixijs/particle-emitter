import { BlendModeBehavior } from '../../BlendMode';
import { BLEND_MODES } from '@pixi/constants';

function makeReadable(input: string)
{
    const words = input.split('_');

    for (let i = 0; i < words.length; ++i)
    {
        if (words[i] === 'SRC')
        {
            words[i] = 'Source';
        }
        else if (words[i] === 'DST')
        {
            words[i] = 'Destination';
        }
        else
        {
            words[i] = words[i][0] + words[i].substring(1).toLowerCase();
        }
    }

    return words.join(' ');
}

BlendModeBehavior.editorConfig = {
    category: 'blend',
    title: 'Blend Mode',
    props: [
        {
            type: 'select',
            name: 'blendMode',
            title: 'Blend Mode',
            description: 'Blend mode of all particles. IMPORTANT - The WebGL renderer only supports the Normal, '
                + 'Add, Multiply and Screen blend modes. Anything else will silently act like Normal.',
            default: 'NORMAL',
            options: Object.keys(BLEND_MODES)
                .filter((key) => !(/\d/).test(key))
                .map((key) => ({ value: key, label: makeReadable(key) })),
        },
    ],
};
