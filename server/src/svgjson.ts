
export type SvgEnum = string | {name:string, documentation:string} ;

export type SvgJsonAttributeType = string;

export interface ISvgJsonAttribute {
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

export interface ISvgJsonElement {
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
    elements: ISvgJsonElements;
    categories: ISvgJsonCategories;
    attributes: ISvgJsonAttributes;
    attributeCategories: ISvgJsonCategories;
}