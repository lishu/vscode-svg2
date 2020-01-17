export interface ParseError {
    offsetStart: number;
    offsetEnd: number;
    error: string;
}

export interface ParseResult {
    errors : Array<ParseError>;
}

export enum PathDataCommand {
    MovetoAbs = 'M',
    MovetoRel = 'm',
    LinetoAbs = 'L',
    LinetoRel = 'l',
    CurvetoCubicAbs = 'C',
    CurvetoCubicRel = 'c',
    CurvetoQuadraticAbs = 'Q',
    CurvetoQuadraticRel = 'q',
    ArcAbs = 'A',
    ArcRel = 'a',
    LinetoHorizontalAbs = 'H',
    LinetoHorizontalRel = 'h',
    LinetoVerticalAbs = 'V',
    LinetoVerticalRel = 'v',
    CurvetoCubicSmoothAbs = 'S',
    CurvetoCubicSmoothRel = 's',
    CurvetoQuadraticSmoothAbs = 'T',
    CurvetoQuadraticSmoothRel = 't',
    ClosePathAbs = 'Z',
    ClosePathRel = 'z'
}

export enum PathDataTokenType {
    Command,
    Number,
    WhitespaceComma,
    Invalid
}

export interface PathDataToken {
    start: number;
    end: number;
    type: PathDataTokenType;
    data: string;
}

function readNumber(p: string, i: number) : PathDataToken {
    let sign = false;
    let dot = false;
    let num = false;
    let start = i;
    while(i < p.length) {
        let c = p.charAt(i);
        if(c=='+' || c=='-') {
            if(sign || num) {
                break;
            }
            i++;
            sign = true;
        }
        else if(c=='.') {
            if(dot) {
                break;
            }
            i++;
            dot = true;
        }
        else if(/\d/.test(c)) {
            num = true;
            i++;
        }
        else{
            break;
        }
    }
    return {type: PathDataTokenType.Number, start, end: i, data: p.substring(start, i)};
}

function whitespaceComma(p: string, i: number) : PathDataToken {
    let comma = false;
    let start = i;
    while(i < p.length) {
        let c = p.charAt(i);
        if(c==' ' || c=='\t'||c=='\r'||c=='\n') {
            i++;
        }
        else if(c==',') {
            if(comma) {
                break;
            }
            i++;
            comma = true;
        }
        else{
            break;
        }
    }
    return {type: PathDataTokenType.WhitespaceComma, start, end: i, data: p.substring(start, i)};
}

function getTokens(pathdata: string) : Array<PathDataToken> {
    let i = 0;
    let tokens = [];
    while(i < pathdata.length) {
        let c = pathdata.charAt(i);
        if(c==' ' || c=='\t'||c=='\r'||c=='\n'||c==',') {
            let token = whitespaceComma(pathdata, i);
            tokens.push(token);
            i = token.end;
        }
        else if(/[0-9.+-]/.test(c)) {
            let token = readNumber(pathdata, i);
            tokens.push(token);
            i = token.end;
        }
        else if(/[mlhvcsqtaz]/i.test(c)) {
            tokens.push({start:i, end: i+1, type: PathDataTokenType.Command, data: c});
            i++;
        }
        else {
            tokens.push({start:i, end: i+1, type: PathDataTokenType.Invalid, data: c});
            i++;
        }
    }
    return tokens;
}

export interface PathCoordinate {
    x?: PathDataToken;
    y?: PathDataToken;
}

export interface PathDataCommandItem {
    start: number;
    end: number;
    command: PathDataToken;
    commandType: PathDataCommand;
    args: Array<PathDataToken>;
    bads: Array<PathDataToken>;
}

function buildAst(tokens: Array<PathDataToken>) {
    let i = 0;
    let items : Array<PathDataCommandItem> = [];
    let item: PathDataCommandItem| null = null;
    let command: PathDataToken|null = null;
    let commandPos = {start: 0, end: 0};
    let args: Array<PathDataToken> = [];
    let bads: Array<PathDataToken> = [];
    for(;i<tokens.length;i++) {
        let token = tokens[i];
        if(token.type == PathDataTokenType.WhitespaceComma) {
            if(item) {
                item.end = token.end;
            }
            continue;
        }
        else if(token.type == PathDataTokenType.Command) {
            if(command != null) {
                items.push(item = {
                    start: commandPos.start,
                    end: token.start,
                    command, 
                    commandType: <PathDataCommand>command.data, 
                    args, 
                    bads
                });
                args = [];
            }
            command = token;
            commandPos.start = token.start;
        }
        else if(token.type == PathDataTokenType.Number) {
            if(command != null) {
                args.push(token);
                commandPos.end = token.end;
            }
            else {
                // invalid number position
                bads.push(token);
                commandPos.end = token.end;
            }
        }
        else {
            // invalid tokens
            bads.push(token);
            commandPos.end = token.end;
        }
    }
    if(command) {
        items.push(item = {
            start: command.start, 
            end: getEndPos(command.end, args, bads),
            command, 
            commandType: <PathDataCommand>command.data, 
            args, 
            bads
        });
    }
    return items;
}

function getEndPos(offset: number, args: PathDataToken[], bads: PathDataToken[]) {
    if(args && args.length && bads && bads.length) {
        return Math.max(args[args.length - 1].end, bads[bads.length - 1].end);
    }
    if(args && args.length) {
        return args[args.length - 1].end;
    }
    if(bads && bads.length) {
        return bads[bads.length - 1].end;
    }
    return offset;
}

export function parsePath(pathdata: string) {
    let tokens = getTokens(pathdata);
    return buildAst(tokens);
}