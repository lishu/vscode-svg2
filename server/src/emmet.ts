// 用于提供 emmet 风格的自动完成功能

import { TextDocument, Position, CompletionList, CompletionItem, Range, CompletionItemKind, MarkupKind, TextEdit, InsertTextFormat } from "vscode-languageserver";
import { ISvgJsonElement, ISvgJsonRoot } from "./svgjson";

// 参考标准：
// https://docs.emmet.io/abbreviations/syntax/

const FULL_EXP = /([\.#]?[a-z0-9_\$@-]+)|[>\^\+\*\(\)\[\]=]|("[^"]*")|(\{[^\}]*\})/gi;
const NAME_EXP = /^[a-z0-9_-]+$/gi;
const STR_EXP = /^"[^"]*"$/gi;
const NUM_EXP = /^[0-9]+$/gi;

const NO_EMMET_TAGS = ['script'];

interface IMatchInfo {
    index: number;
    texts: Array<string>;
    endIndex: number;
}

function is_name(name: string) {
    return NAME_EXP.test(name);
}
function is_number(num: string) {
    return NUM_EXP.test(num);
}

function replace_number(str: string, no: number, count: number) {
    return str.replace(/(\$+)(\@(\-|(\d+))?)?/g, (_1, s, _2, flag, start)=>{
        let nostr = no.toString();
        if(start) {
            nostr = (no + parseInt(start)).toString();
        } else if(flag) {
            nostr = (count - no + 1).toString();
        }
        if(nostr.length >= s.length) {
            return nostr;
        }
        return '0'.repeat(s.length - nostr.length) + nostr;
    });
}

class ENodeBuilder {
    defaultTagName = "svg";
    root!: ENode;
    current!: ENode;
    elementNames: Array<string>;
    constructor(public svginfo: ISvgJsonRoot) {
        this.elementNames = Object.keys(svginfo.elements);
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
                        var attrname = parts[idx + 1];
                        if(!is_name(attrname)) {
                            return false;
                        }
                        offset += attrname.length;
                        if(part[idx+2] !== '=') {
                            return false;
                        }
                        offset ++;
                        var attrvalue = parts[idx+3];
                        if(STR_EXP.test(attrvalue)) {
                            this.current.attributes[attrname] = attrvalue.substring(1, attrvalue.length - 2);
                        }
                        else if(is_name(attrvalue)) {
                            this.current.attributes[attrname] = attrvalue;
                        }
                        else {
                            return false;
                        }
                        offset += attrvalue.length;
                        if(parts[idx+4] !== ']') {
                            return false;
                        }
                        offset++;
                        idx += 4;
                        continue;
                    }
                    break;
                case '^':
                    if(this.current.parent) {
                        this.current = this.current.parent;
                        this._plusNode();
                    }
                    break;
                case '=':
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
                        this.current.tag = part;
                        this.current.element = this.svginfo.elements[this.current.tag.toLowerCase()];
                        if(!this.current.element) {
                            this.current.tag = this.elementNames.find(n=>n.startsWith(part) && !NO_EMMET_TAGS.includes(n));
                            if(this.current.tag) {
                                this.current.element = this.svginfo.elements[this.current.tag];
                                break;
                            }

                            // 无效的数据
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
        return this.partStartIndex < parts.length;
    }

    buildNode(outputs: Array<string>, node: ENode, level: number = 0, contextNumber: number = 1, contextCount: number = 1) {
        let startNumber = 1;
        let endNumber = 1;
        let countNumber = contextCount;
        if(node.repeats) {
            endNumber = node.repeats;
            countNumber = node.repeats;
        }
        for(let i = startNumber; i <= endNumber; i++) {
            let currentNumber = node.repeats ? i : contextNumber;
            if(node.repeats && i > startNumber) {
                outputs.push('\n');
            }
            const levelSpace = '  '.repeat(level);
            if(node.textContent) {
                outputs.push(replace_number(node.textContent, currentNumber, countNumber));
                return;
            }
            if(!node.tag && (node.attributes.class || node.attributes.id)) {
                node.tag = this.defaultTagName;
                node.element = this.svginfo.elements[node.tag.toLowerCase()];
            }
            if(!node.is_group && node.tag) {
                outputs.push(`${levelSpace}<${node.tag}`);

                if(node.attributes) {
                    for(var attrname in node.attributes) {
                        outputs.push(replace_number(` ${attrname}="${node.attributes[attrname]}"`, currentNumber, countNumber));
                    }
                }
                
                outputs.push('>');
            } else {
                level--;
            }

            if(node.chilren && node.chilren.length) {
                for(var child of node.chilren) {
                    outputs.push('\n');
                    this.buildNode(outputs, child, level + 1, currentNumber);
                }
                outputs.push('\n');
            
                if(!node.is_group && node.tag) {
                    outputs.push(`${levelSpace}</${node.tag}>`);
                }
            }
            else if(!node.is_group && node.tag) {
                if(this.replace_index == 0) {
                    outputs.push(`$${this.replace_index++}`);
                }
                outputs.push(`</${node.tag}>`);
            }
        }
    }

    private replace_index = 0;

    toCode(): string {
        const outputs : Array<string> = [];
        this.replace_index = 0;
        this.buildNode(outputs, this.root);
        return outputs.join('');
    }
}

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
}

function execAll(input: string) : Array<IMatchInfo> {
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

export function doComplete(doc: TextDocument, position: Position, lang: string, svginfo: ISvgJsonRoot) : CompletionList {
    const items : Array<CompletionItem> = [];
    try {
        const lineRange = Range.create(Position.create(position.line, 0), Position.create(position.line + 1, -1));
        const line = doc.getText(lineRange);
        if(line.includes('<')) {
            // 只要本行内有这个字符就不应该处理
            return { isIncomplete: false, items };
        }
        let matches = execAll(line);
        for(let match of matches) {
            if(match.index < position.character && match.endIndex >= position.character) {
                const eb = new ENodeBuilder(svginfo);
                if(eb.parse(match.texts)){
                    const code = eb.toCode();
                    const label = match.texts.join('');
                    const startPosition = Position.create(position.line, match.index + eb.partStartIndex);
                    const endPosition = Position.create(position.line, match.endIndex);
                    const completionItem : CompletionItem = {
                        label,
                        kind: CompletionItemKind.Snippet,
                        documentation: {
                            kind: MarkupKind.Markdown,
                            value: `<span style="opacity:0.5">SVG emmet abbreviations</span>
\`\`\`
${code.replace('$0', '|')}
\`\`\`
`
                        },
                        insertTextFormat: InsertTextFormat.Snippet,
                        textEdit: TextEdit.replace(Range.create(startPosition, endPosition), code),
                        commitCharacters: ['\t']
                    };
                    items.push(completionItem);
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
    return { isIncomplete: false, items };
}