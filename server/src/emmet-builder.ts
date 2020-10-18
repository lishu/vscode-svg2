import { ISvgJsonElement, ISvgJsonRoot } from "./svgjson";
import { TagBuilder } from "./tag-builder";

enum ENodeKind {
    root,
    element
}

interface ENode {
    parent?: ENode;
    is_group?: boolean;
    tag?: string;
    element?: ISvgJsonElement;
    repeats?: number;    
    chilren: Array<ENode>;
    textContent?: string;
    attributes: any;
    attribute_defaults?: Array<string>;
}

interface IMatchInfo {
    index: number;
    texts: Array<string>;
    endIndex: number;
}

// 参考标准：
// https://docs.emmet.io/abbreviations/syntax/

const FULL_EXP = /([\.#]?[a-z0-9_\$@-]+)|[>\^\+\*\(\)\[\]=]|("[^"]*")|('[^']*')|(\{[^\}]*\})|((?<=\[[^\]]*)\s+)/gi;

const NAME_EXP = /^[a-z0-9_-]+$/i;
const STR_EXP = /^"[^"]*"$/;
const STR_EXP2 = /^'[^']*'$/;
const NUM_EXP = /^[0-9]+$/;
const WS_EXP = /^\s+$/;
const NO_EMMET_TAGS = ['script'];

function is_name(name: string) {
    return NAME_EXP.test(name);
}
function is_number(num: string) {
    return NUM_EXP.test(num);
}

function replace_number(str: string, current: number, count: number) {
    return str.replace(/(\$+)(\@(\-|(\d+))?)?/g, (_1, s, _2, flag, start)=>{
        let nostr = current.toString();
        if(start) {
            nostr = (current + parseInt(start) - 1).toString();
        } else if(flag) {
            nostr = (count - current + 1).toString();
        }
        if(nostr.length >= s.length) {
            return nostr;
        }
        return '0'.repeat(s.length - nostr.length) + nostr;
    });
}

export function execAll(input: string) : Array<IMatchInfo> {
    const matches: Array<IMatchInfo> = [];
    let matchInfo : IMatchInfo | null = null;
    let matched: RegExpExecArray | null = null;
    let matchIndex = -1;
    while(matched = FULL_EXP.exec(input)) {
        if(matchIndex == matched.index) {
            break;
        }
        matchIndex = matched.index;
        if(!matchInfo || matchInfo.endIndex < matched.index) {
            matchInfo = { index: matched.index, texts: [], endIndex:  matched.index};
            matches.push(matchInfo);
        }
        let matchPart = matched[0];
        matchInfo.texts.push(matchPart);
        matchInfo.endIndex += matchPart.length;
    }
    return matches;
}

export class ENodeBuilder {
    /** 调试模式 */
    debug = false;
    /**
     * 默认顶层标签
     */
    defaultTagName = "svg";
    /** 使用标签树关系过滤下层可用标签 */
    defaultTagUseTree = false;
    /**
     * 是否生成 Snippet 变量参数
     */
    useSnippet = true;
    root!: ENode;
    current!: ENode;
    elementNames: Array<string>;
    constructor(public svginfo: ISvgJsonRoot) {
        this.elementNames = Object.keys(svginfo.elements);
        // console.debug('this.elementNames', this.elementNames);
        this.root = {
            attributes: {},
            chilren: []
        };
    }

    _plusNode() {
        if(this.current == this.root) {
            this.root = {
                is_group: true,
                attributes: {},
                chilren: [this.current]
            };
            this.current.parent = this.root;
        }
        const nextcurrent = {
            parent : this.current.parent,
            attributes: {},
            chilren: []
        };
        this.current.parent!.chilren.push(nextcurrent);
        this.current = nextcurrent;
    }

    partStartIndex: number = 0;
    partStartOffset: number = 0;

    parse(parts: Array<string>) {
        this.current = this.root;
        this.partStartIndex = 0;
        const len = parts.length;
        let offset = 0;
        const groupInfo : Array<ENode> = [];
        let idx = 0;

        let next = function() {
            idx++;
            let p = parts[idx];
            offset += p.length;
            return p;
        };

        while(idx < len) {
            let part = parts[idx];
            offset+=part.length;
            switch(part) {
                case '(':
                    // 分组开始
                    {
                        this.current.is_group = true;
                        groupInfo.push(this.current);
                        let newcurrent : ENode = {
                            chilren:[],
                            attributes:{},
                            parent:this.current
                        };
                        this.current.chilren.push(newcurrent);
                        this.current = newcurrent;
                    }
                    break;
                case ')':
                    // 分组结束
                    {
                        let newcurrent = groupInfo.pop();
                        if(newcurrent) {
                            this.current = newcurrent;
                        }
                    }
                    break;
                case '[':
                    // 属性定义开始
                    {
                        while(true){
                            part = next();
                            if (!is_name(part)) {
                                if(this.debug) {
                                    console.debug('属性名检查失败', part, idx);
                                }
                                return false;
                            }
                            let attrname = part;
                            offset += attrname.length;
                            part = next();
                            if (part == ']') {
                                // 无值属性名
                                this.current.attributes[attrname] = '';
                                break;
                            }
                            else if (part !== '=') {
                                if(this.debug) {
                                    console.debug('属性名之后期待 =', part);
                                }
                                return false;
                            }
                            part = next();
                            if (part == ']') {
                                // 无值属性名
                                this.current.attributes[attrname] = '';
                                break;
                            }
                            else if (STR_EXP.test(part) || STR_EXP2.test(part)) {
                                this.current.attributes[attrname] = part.substring(1, part.length - 1);
                            }
                            else if (is_name(part)) {
                                this.current.attributes[attrname] = part;
                            }
                            else {
                                if(this.debug) {
                                    console.debug('= 号之后没有属性值', part);
                                }
                                return false;
                            }
                            part = parts[idx+1];
                            if(WS_EXP.test(part)) {
                                // 属性间空间，直接忽略
                                next();
                                part = parts[idx+1];
                            }
                            if (part == ']') {
                                // 属性声明正常结束
                                next();
                                break;
                            }
                            else if(is_name(part)) {
                                // 新的属性声明开始
                                continue;
                            }
                            else {
                                if(this.debug) {
                                    console.debug('期待 ] 或属性名', part);
                                }
                                return false;
                            }
                        }
                    }
                    break;
                case '^':
                    if(this.current.parent) {
                        this.current = this.current.parent;
                        this._plusNode();
                    }
                    break;
                case '=':
                    if(this.debug) {
                        console.debug('未知位置出现 =');
                    }
                    return false;
                case '>':
                    this.current = {
                        parent : this.current,
                        attributes: {},
                        chilren: []
                    };
                    this.current.parent!.chilren.push(this.current);
                    break;
                case '+':
                    this._plusNode();
                    break;
                case '*':
                    {
                        // NUMBER MODE
                        let numpart = part = parts[idx+1];
                        if(is_number(numpart)) {
                            this.current.repeats = parseInt(numpart);
                            offset += part.length;
                            idx++;
                        } else {
                            if(this.debug) {
                                console.debug('* 号后面不是数字', numpart, typeof(numpart));
                            }
                            return false;
                        }
                    }
                    break;
                default:
                    if(part.startsWith('{')){
                        this.current.chilren.push({
                            textContent: part.substring(1, part.length-1),
                            attributes: {},
                            chilren: []
                        });
                    }
                    else if(part.startsWith('#')){
                        this.current.attributes.id = part.substring(1);
                    }
                    else if(part.startsWith('.')) {
                        if(this.current.attributes.class) {
                            this.current.attributes.class += ' ' + part.substring(1);
                        }
                        else {
                            this.current.attributes.class = part.substring(1);
                        }
                    }
                    else {
                        // console.debug('part', part);
                        this.current.tag = part;
                        // 全名匹配
                        this.current.element = this.svginfo.elements[this.current.tag.toLowerCase()];
                        if(!this.current.element) {
                            // 缩写匹配
                            if(part in this.svginfo.elementNameMap) {
                                part = this.svginfo.elementNameMap[part];
                            }
                            // 开头匹配
                            this.current.tag = this.elementNames.find(n=>n.startsWith(part) && !NO_EMMET_TAGS.includes(n));
                            // 包含匹配
                            if(!this.current.tag) {
                                this.current.tag = this.elementNames.find(n=>n.includes(part) && !NO_EMMET_TAGS.includes(n));
                            }
                            if(this.current.tag) {
                                this.current.element = this.svginfo.elements[this.current.tag];
                                break;
                            }

                            // 无效的数据，重设可区域开始到下一个位置
                            if(this.debug) {
                                console.warn('RSET PART START', part);
                            }
                            this.partStartIndex = idx + 1;
                            this.partStartOffset = offset;
                            this.current = this.root = {
                                chilren: [],
                                attributes: {}
                            };
                        }
                    }
            }
            idx++;
        }
        if(this.debug && this.partStartIndex >= parts.length) {
            console.debug('partStartIndex', this.partStartIndex);
        }
        return this.partStartIndex < parts.length;
    }

    private indent: string = '  ';
    
    public get indentSize() : number {
        return this.indent.length;
    }

    public set indentSize(value: number) {
        if(value <= 0) {
            throw new Error('indentSize can not be negative.');
        }
        this.indent = ' '.repeat(value);
    }
    
    getDefaultTagForParent(parentTag: string | null) {
        if(parentTag) {
            let pt = this.svginfo.elements[parentTag];
            if(pt && pt.subElements && pt.subElements.length) {
                return pt.subElements[0];
            }
        }
        return null;
    }

    private snippetIndex = 0;
    private snippetOutputIndex = 0;
    private lastSnippetValued = false;

    newSnippetAttribute(builder: TagBuilder, value?: string) {
        this.snippetIndex++;
        this.snippetOutputIndex = builder.output.length;
        if(value) {
            this.lastSnippetValued = true;
            return `$\{${this.snippetIndex}:${value}\}`;
        }
        this.lastSnippetValued = false;
        return `$${this.snippetIndex}`;
    }

    buildNode(outputs: TagBuilder, node: ENode, indentLevel: number = 0, contextNumber: number = 1, contextCount: number = 1, inline = false) {
        let startNumber = 1;
        let endNumber = 1;
        let countNumber = contextCount;
        if(node.repeats) {
            endNumber = node.repeats;
            countNumber = node.repeats;
        }
        let nodeInline = inline || !!(node.element && node.element.inline);
        let nodeSimple = !!(node.element && node.element.simple && !node.element.subElements);
        // 处理默认元素名
        if(!node.tag && (node.attributes.class || node.attributes.id || Object.keys(node.attributes).length)) {
            let parentTag = outputs.getOpenTagName();
            node.tag = this.defaultTagUseTree && parentTag && this.getDefaultTagForParent(parentTag && parentTag.name) || this.defaultTagName;
            if(this.debug) {
                console.debug('New CHILD for', parentTag, node.tag);
            }
            node.element = this.svginfo.elements[node.tag.toLowerCase()];
        }
        for(let i = startNumber; i <= endNumber; i++) {
            let currentNumber = node.repeats ? i : contextNumber;
            // 输出文本内容
            if(node.textContent) {
                outputs.addText(replace_number(node.textContent, currentNumber, countNumber));
                return;
            }
            const currentTagStart = !node.is_group && node.tag;
            // 输出开始标签属性
            if(currentTagStart) {
                // 开始标签
                outputs.startTag(node.tag!, nodeInline, nodeSimple);
                // 开始属性
                if(node.element && node.element.defaultAttributes) {
                    // 如果需要默认属性
                    for(var attrname in node.element.defaultAttributes) {
                        if(node.attributes && attrname in node.attributes) {
                            continue;
                        }
                        // outputs.addAttribute(attrname, node.element.defaultAttributes[attrname]);
                        if(this.useSnippet) {
                            outputs.addAttribute(attrname, this.newSnippetAttribute(outputs, node.element.defaultAttributes[attrname]));
                        }
                        else
                        {
                            outputs.addAttribute(attrname, '');
                        }
                    }
                }
                if(node.attributes) {
                    for(var attrname in node.attributes) {
                        outputs.addAttribute(attrname, replace_number(node.attributes[attrname], currentNumber, countNumber));
                    }
                }
            }

            // 填充子元素
            if(node.chilren && node.chilren.length) {
                let childrenlevel = indentLevel + 1;
                if(node.is_group || nodeInline) {
                    childrenlevel = indentLevel;
                }
                for(var child of node.chilren) {
                    this.buildNode(outputs, child, childrenlevel, currentNumber, 1, nodeInline);
                }
            } else {
                if(this.useSnippet && !node.is_group && !inline) {
                    outputs.addText(this.newSnippetAttribute(outputs));
                }
            }

            if(currentTagStart) {
                outputs.endTag();
            }
        }
    }

    private replace_index = 0;

    toCode(): string {
        this.snippetIndex = 0;
        this.snippetOutputIndex = 0;
        this.lastSnippetValued = false;
        const builder = new TagBuilder();
        builder.indent = this.indent;
        this.replace_index = 0;
        this.buildNode(builder, this.root);
        if(this.useSnippet) {
            if(this.snippetIndex > 0) {
                if(this.lastSnippetValued) {
                    return builder.toString() + '$0';
                }
                for(var i=this.snippetOutputIndex;i<builder.output.length;i++) {
                    if(builder.output[i].includes('$' + this.snippetIndex)){
                        builder.output[i] = builder.output[i].replace('$' + this.snippetIndex, '$0');
                        break;
                    }
                }
            }
        }
        return builder.toString();
    }
}