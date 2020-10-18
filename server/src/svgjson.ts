
export type SvgEnum = string | {name:string, documentation:string} ;

export type SvgJsonAttributeType = string;

export type SvgVersion = 'version_1_1' | 'version_2_draft';

/** 表示所在的属性或元素在特定版本上的属性 */
export interface ISvgVersionSpec {
    /** 表示特定版本中是否不存在此属性 */
    disable?: boolean;
    /** 是否已弃用，或弃用的详细说明 */
    deprecated?: boolean | string;
}

export interface ISvgVersionsSpec {
    version_1_1? : ISvgVersionSpec;
    version_2_draft? : ISvgVersionSpec;
}


export interface ISvgJsonAttribute extends ISvgVersionsSpec {
    /** 属性名称 */
    name: string;

    /** 文档信息 */
    documentation?: string;

    /** 说明属性的值类型 */
    type?: SvgJsonAttributeType;

    /** 是否已弃用，或弃用的详细说明 */
    deprecated?: boolean | string;

    /** 可选单项值 */
    enum?:SvgEnum[];

    /** 可选多项值 */
    enums?:SvgEnum[];

    /** 是否为不常用的高级选项 */
    advanced?:boolean;
}


export interface ISvgJsonAttributes {
    [pn: string]: ISvgJsonAttribute;
}

export interface ISvgJsonCategories {
    [pn: string]: Array<string>;
}

export interface ISvgJsonElement extends ISvgVersionsSpec {
    /** 文档信息 */
    documentation?: string;
    /** 可用子标签名称 */
    subElements?: Array<string>;
    /** 可用属性 */
    attributes?: Array<string | ISvgJsonAttribute>;
    /** 默认属性 */
    defaultAttributes?: {[pn:string]: string};
    /** 是否已弃用，或弃用的详细说明 */
    deprecated?: boolean | string;
    /** 单选元素 */
    inline?: boolean;
    /** 简单元素，如 `<br/>` */
    simple?: boolean;
    /** 是否为不常用的高级选项 */
    advanced?:boolean;
}

export interface ISvgJsonElements {
    [pn: string]: ISvgJsonElement;
}

export interface ISvgJson {
    elementNameMap : {[alias: string]: string};
    attributeNameMap : {[alias: string]: string};
    elements: ISvgJsonElements;
    categories: ISvgJsonCategories;
    attributes: ISvgJsonAttributes;
    attributeCategories: ISvgJsonCategories;
    [pn:string] : any;
}

export interface ISvgJsonRoot extends ISvgJson {
    getElement : (el: string, version: string) => ISvgJsonElement | undefined | null;
    getAttribute : (el: string, attr: string, version: string) => ISvgJsonElement | undefined | null;
}