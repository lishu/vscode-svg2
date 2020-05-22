import { TextDocument } from "vscode-css-languageservice";

export interface DocumentRangeMode
{
    languageId: string;
    startOffset: number;
    endOffset: number;
}

export function getModes(content: string) : Array<DocumentRangeMode>
{
    let modes : Array<DocumentRangeMode> = [];
    let styleReg = /(<style[^>]*>)([\s\S]*)(<\/style>)/gim;
    let offset = 0;
    let result : RegExpExecArray | null = null;
    while(result = styleReg.exec(content))
    {
        let blockStart = result.index + result[1].length;
        let blockEnd = blockStart + result[2].length;
        //let styleContext = content.substring(blockStart, blockEnd);
        modes.push({
            languageId: 'css',
            startOffset: blockStart,
            endOffset: blockEnd
        });
    }
    return modes;
}

export function getModeAtOffset(modes: Array<DocumentRangeMode>, offset: number) : DocumentRangeMode | null
{
    for(let mode of modes) {
        if(mode.startOffset <= offset && mode.endOffset > offset) {
            return mode;
        }
    }
    return null;
}

function whitespace(content: string, start: number, end: number) : string
{
    let s = '';
    for(let i=start;i<end;i++) {
        if(content[i] == '\r' || content[i] == '\n') {
            s += content[i];
        }
        else
        {
            s += ' ';
        }
    }
    return s;
}

export function getModeDocument(document: TextDocument, content: string, modes: Array<DocumentRangeMode>, languageId: string) : TextDocument
{
    let output :Array<string> = [];
    let offset = 0;
    for(let mode of modes) {
        if(mode.languageId == languageId) {
            if(mode.startOffset > offset) {
                output.push(whitespace(content, offset, mode.startOffset));
            }
            output.push(content.substring(mode.startOffset, mode.endOffset));
            offset = mode.endOffset;
        }
    }
    output.push(whitespace(content, offset, content.length));
    let cssContent = output.join('');
    let doc = TextDocument.create(document.uri, languageId, document.version, cssContent);
    return doc;
}