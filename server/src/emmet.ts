// 用于提供 emmet 风格的自动完成功能

import { TextDocument, Position, CompletionList, CompletionItem, Range, CompletionItemKind, MarkupKind, TextEdit, InsertTextFormat } from "vscode-languageserver";
import { ISvgJsonElement, ISvgJsonRoot } from "./svgjson";
import { ENodeBuilder, execAll } from './emmet-builder';

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