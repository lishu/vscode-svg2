import { Connection, TextDocument } from "vscode-languageserver";

export enum TokenType {
    None,
    Invalid,
    Whitespace,
    ProcessingInstruction, // <? ... ?>
    String, // "..."
    Comment, // <!-- ... -->
    CDATA, // <![CDATA[ ... ]]>
    Entity, // <!ENTITY ...>
    Notation, // <!NOTATION ...>
    Name, // any element or attribute name (for example, `svg`, `rect`, `width`)
    TagName,
    AttributeName,
    StartTag, // <
    SimpleEndTag, // />
    EndTag, // >
    StartEndTag, // </
    Equal, // =
}

export interface Token {
    index: number;
    type: TokenType;
    startIndex : number;
    endIndex : number;
    error?: string | {code:number, message:string};
}

export function getTokenLen(token: Token) {
    return token.endIndex - token.startIndex;
}

const NO_OUTPUT_WHITE_TOKEN = false;

let spaceRegex = /^[ \r\n\t\f]+/;
let processingRegex = /^<\?.*?\?>/;
let commentRegex = /^<!--.*?-->/;
let cdataRegex = /^<!\[CDATA\[.*?\]\]>/;
let entityRegex = /^<!ENTITY.*?>/;
let notationRegex = /^<!NOTATION.*?>/;
let nameRegex = /^[a-zA-Z0-9\-:]+/;
let startTagRegex = /^</;
let endTagRegex = /^>/;
let simpleEndTagRegex = /^\/>/;
let startEndTagRegex = /^<\//;
let equalRegex = /^=/;
let stringRegex = /^".*?"/;


function getTokens(connection: Connection, content:string) {
    let tokens : Array<Token> = [];
    let pos = 0;    

    let lastToken : Token | null = null;
    let regexTest = (reg:RegExp, tokenType: TokenType)=> {
        let lifeContent = content.substring(pos);
        let r = lifeContent.match(reg);
        if(r) {
            let startIndex = pos;
            pos = startIndex + r[0].length;
            let token = {
                index: tokens.length,
                type: tokenType, 
                startIndex: startIndex,
                endIndex : pos
            };
            if(NO_OUTPUT_WHITE_TOKEN && tokenType == TokenType.Whitespace) {
                return true;
            }
            tokens.push(lastToken = token);
            // connection.console.log("" + (tokens.length - 1) + ":" + tokenType + ":" + content.substring(token.startIndex, token.endIndex));
            return true;
        }
        return false;
    };
    let nameTest = (reg:RegExp)=> {
        let lifeContent = content.substring(pos);
        let r = lifeContent.match(nameRegex);
        if(r) {
            let startIndex = pos;
            pos = startIndex + r[0].length;
            let tokenType = TokenType.Name;
            if(lastToken) {
                if(lastToken.type == TokenType.StartTag || lastToken.type == TokenType.StartEndTag) {
                    tokenType = TokenType.TagName;
                }
                else if(lastToken.type == TokenType.String || lastToken.type == TokenType.Whitespace) {
                    tokenType = TokenType.AttributeName;
                }
            }
            let token = {
                index: tokens.length,
                type: tokenType, 
                startIndex: startIndex,
                endIndex : pos
            };
            tokens.push(lastToken = token);
            return true;
        }
        return false;
    };

    while(pos < content.length) {
        let readed = regexTest(spaceRegex, TokenType.Whitespace) || 
            regexTest(processingRegex, TokenType.ProcessingInstruction) ||
            regexTest(commentRegex, TokenType.Comment) ||
            regexTest(cdataRegex, TokenType.CDATA) ||
            regexTest(entityRegex, TokenType.Entity) ||
            regexTest(notationRegex, TokenType.Notation) ||
            nameTest(nameRegex) ||
            regexTest(startEndTagRegex, TokenType.StartEndTag) ||
            regexTest(endTagRegex, TokenType.EndTag) ||
            regexTest(simpleEndTagRegex, TokenType.SimpleEndTag) ||
            regexTest(startTagRegex, TokenType.StartTag) ||
            regexTest(stringRegex, TokenType.String) ||
            regexTest(equalRegex, TokenType.Equal);
        if(!readed) {
            // TODO Create INVALID or add to last INVALID Token.
            tokens.push({index:tokens.length, type: TokenType.Invalid, startIndex: pos, endIndex: ++pos});
        }
    }

    return tokens;
}

export interface IActiveToken {
    all: Array<Token>;
    prevToken?: Token;
    token?: Token;
    index: number;
}

export function getAllAttributeNames(content: string, tokens:Array<Token>, tokenStart:number) {
    let names : Array<string> = [];
    let index = tokenStart;
    while(index < tokens.length) {
        let token = tokens[index];
        let prevToken = tokens[index-1];
        if(prevToken.type == TokenType.Name && token.type == TokenType.Equal) {
            names.push(content.substring(prevToken.startIndex, prevToken.endIndex).toUpperCase());
        }
        else if(prevToken.type == TokenType.StartTag || prevToken.type == TokenType.EndTag || prevToken.type == TokenType.StartEndTag || prevToken.type == TokenType.SimpleEndTag) {
            break;
        }
        index++;
    }
    return names;
}

export function getOwnerAttributeName(tokens:Array<Token>, index: number) : Token|null {
    while(index >= 1) {
        let token = tokens[index];
        let prevToken = tokens[index-1];
        if(prevToken.type == TokenType.AttributeName || prevToken.type == TokenType.Name) {
            return prevToken;
        }
        else if(prevToken.type == TokenType.StartTag || prevToken.type == TokenType.EndTag || prevToken.type == TokenType.StartEndTag || prevToken.type == TokenType.SimpleEndTag) {
            break;
        }
        index--;
    }
    return null;
}

export function getOwnerTagName(tokens:Array<Token>, index: number) : Token|null {
    while(index >= 1) {
        let token = tokens[index];
        let prevToken = tokens[index-1];
        if(token.type == TokenType.SimpleEndTag) {
            return null;
        }
        else if(token.type == TokenType.TagName && prevToken.type == TokenType.StartTag) {
            return token;
        }
        else if(token.type == TokenType.TagName && prevToken.type == TokenType.StartEndTag) {
            return null;
        }
        index--;
    }
    return null;
}

export function getParentTagName(tokens:Array<Token>, index: number) : Token|null {
    let depth = 0;
    while(index >= 1) {
        let token = tokens[index];
        let prevToken = tokens[index-1];
        if(token.type == TokenType.SimpleEndTag) {
            // />
            depth++;
        }
        else if(token.type == TokenType.TagName && prevToken.type == TokenType.StartTag) {
            // <Tag
            depth--;
            if(depth < 0) {
                return token;
            }
        }
        else if(token.type == TokenType.TagName && prevToken.type == TokenType.StartEndTag) {
            // </
            depth++;
        }
        index--;
    }
    return null;
}

let tokenCaches :{[uri:string]: {version: number, tokens:Array<Token>}} = {};

function getCacheTokens(doc: TextDocument | null) {
    if(doc && (doc.uri in tokenCaches)) {
        if(tokenCaches[doc.uri].version == doc.version) {
            return tokenCaches[doc.uri].tokens;
        }
    }
    return null;
}

export function buildActiveToken(connection: Connection, doc: TextDocument, content: string, activeOffset: number) : IActiveToken
{
    let nodeTrace = [];
    let tokens = getCacheTokens(doc) || getTokens(connection, content);
    if(doc) {
        tokenCaches[doc.uri] = {version: doc.version, tokens: tokens};
    }
    let index = 0;

    for(let index = 0; index < tokens.length; index ++) {
        let token = tokens[index];
        if(token.endIndex > activeOffset && token.startIndex <= activeOffset) {
            return {
                all: tokens,
                index: index,
                prevToken: index > 0 ? tokens[index - 1] : undefined,
                token: token
            };
        }
        else if(token.endIndex == activeOffset) {
            return {
                all: tokens,
                index: index,
                prevToken: index > 0 ? tokens[index - 1] : undefined,
                token: token
            };
        }
        else if(token.startIndex > activeOffset) {
            return {
                all: tokens,
                index: -1,
                prevToken: index > 0 ? tokens[index - 1] : undefined,
            };
        }
        // else if(token.startIndex > activeOffset) {
        //     return {
        //         all: tokens,
        //         index: index - 1,
        //         prevToken: index > 2 ? tokens[index - 2] : undefined,
        //         token: index > 1 ? tokens[index - 1] : undefined,
        //     };
        // }
    }
    return {
        all: tokens,
        index: -1
    };
}