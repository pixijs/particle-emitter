export interface NumberProperty
{
    type: 'number';
    name: string;
    title: string;
    description: string;
    default: number;
    min?: number;
    max?: number;
}

export interface ColorProperty
{
    type: 'color';
    name: string;
    title: string;
    description: string;
    default: string;
}

export interface BooleanProperty
{
    type: 'boolean';
    name: string;
    title: string;
    description: string;
    default: boolean;
}

export interface TextProperty
{
    type: 'text';
    name: string;
    title: string;
    description: string;
    default: string;
}

export interface PointProperty
{
    type: 'point';
    name: string;
    title: string;
    description: string;
    default: {x: number, y: number};
}

export interface NumberListProperty
{
    type: 'numberList';
    name: string;
    title: string;
    description: string;
    default: number;
    min?: number;
    max?: number;
}

export interface ColorListProperty
{
    type: 'colorList';
    name: string;
    title: string;
    description: string;
    default: string;
}

export interface ImageProperty
{
    type: 'image';
    name: string;
    title: string;
    description: string;
}

export interface ListProperty
{
    type: 'list';
    name: string;
    title: string;
    description: string;
    entryType: Property;
}

export interface ObjectProperty
{
    type: 'object';
    name: string;
    title: string;
    description: string;
    props: Property[];
}

export interface SelectProperty
{
    type: 'select';
    name: string;
    title: string;
    description: string;
    options: string[];
}

export interface SelectSubConfigProperty
{
    type: 'subconfig';
    /** Name of property where the type of the config is stored */
    name: string;
    title: string;
    description: string;
    dictionaryProp: string;
    /** Name of property in which the config should be stored */
    configName: string;
}

export type Property = NumberProperty | ColorProperty | BooleanProperty | TextProperty | PointProperty | NumberListProperty |
    ColorListProperty | ImageProperty | ListProperty | ObjectProperty | SelectProperty | SelectSubConfigProperty;

export interface BehaviorEditorConfig
{
    category: 'art'|'color'|'alpha'|'movement'|'rotation'|'blend'|'spawn'|'other';
    title: string;
    props: Property[];
}
