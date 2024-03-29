import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	ClientCapabilities,
	Command,
	Range,
	MarkedString,
	MarkupContent,
	Location,
	DocumentSymbol,
	SymbolKind,
	WorkspaceEdit,
	TextEdit,
	ColorPresentation,
	Color,
	ColorInformation,
	TextDocumentSyncKind,
	MarkupKind
} from "vscode-languageserver/node";

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

import { CompletionList, InsertTextFormat, Position } from 'vscode-languageserver-types';
import * as emmet from './emmet';

import { getCSSLanguageService } from 'vscode-css-languageservice';

import { getLanguageService as getHTMLLanguageService, HTMLFormatConfiguration } from 'vscode-html-languageservice';

import "process";

import { ISvgJsonRoot, ISvgJsonElement, ISvgJsonAttribute, SvgEnum } from "./svgjson";
import { getSvgJson } from "./svg";
import { buildActiveToken, getParentTagName, getOwnerTagName, getAllAttributeNames, getOwnerAttributeName, TokenType, Token, getTokenLen, IActiveToken } from "./token";

import * as pc from './pc-info';

import { parsePath, PathDataCommandItem } from './path-grammar';
import { getModes, getModeAtOffset, DocumentRangeMode, getModeDocument } from "./modes";

let svg: ISvgJsonRoot = getSvgJson('');
const svgDocUrl = {
	attribute: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/',
	element: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Element/'
};

function rgb(r: number, g: number, b: number) {
	return Color.create(r / 255, g / 255, b / 255, 1);
}


const colors: { [name: string]: Color } = {
	"lightsalmon": rgb(255, 160, 122),
	"salmon": rgb(250, 128, 114),
	"darksalmon": rgb(233, 150, 122),
	"lightcoral": rgb(240, 128, 128),
	"indianred": rgb(205, 92, 92),
	"crimson": rgb(220, 20, 60),
	"firebrick": rgb(178, 34, 34),
	"red": rgb(255, 0, 0),
	"darkred": rgb(139, 0, 0),
	"coral": rgb(255, 127, 80),
	"tomato": rgb(255, 99, 71),
	"orangered": rgb(255, 69, 0),
	"gold": rgb(255, 215, 0),
	"orange": rgb(255, 165, 0),
	"darkorange": rgb(255, 140, 0),
	"lightyellow": rgb(255, 255, 224),
	"lemonchiffon": rgb(255, 250, 205),
	"lightgoldenrodyellow": rgb(250, 250, 210),
	"papayawhip": rgb(255, 239, 213),
	"moccasin": rgb(255, 228, 181),
	"peachpuff": rgb(255, 218, 185),
	"palegoldenrod": rgb(238, 232, 170),
	"khaki": rgb(240, 230, 140),
	"darkkhaki": rgb(189, 183, 107),
	"yellow": rgb(255, 255, 0),
	"lawngreen": rgb(124, 252, 0),
	"chartreuse": rgb(127, 255, 0),
	"limegreen": rgb(50, 205, 50),
	"lime": rgb(0, 255, 0),
	"forestgreen": rgb(34, 139, 34),
	"green": rgb(0, 128, 0),
	"darkgreen": rgb(0, 100, 0),
	"greenyellow": rgb(173, 255, 47),
	"yellowgreen": rgb(154, 205, 50),
	"springgreen": rgb(0, 255, 127),
	"mediumspringgreen": rgb(0, 250, 154),
	"lightgreen": rgb(144, 238, 144),
	"palegreen": rgb(152, 251, 152),
	"darkseagreen": rgb(143, 188, 143),
	"mediumseagreen": rgb(60, 179, 113),
	"seagreen": rgb(46, 139, 87),
	"olive": rgb(128, 128, 0),
	"darkolivegreen": rgb(85, 107, 47),
	"olivedrab": rgb(107, 142, 35),
	"lightcyan": rgb(224, 255, 255),
	"cyan": rgb(0, 255, 255),
	"aqua": rgb(0, 255, 255),
	"aquamarine": rgb(127, 255, 212),
	"mediumaquamarine": rgb(102, 205, 170),
	"paleturquoise": rgb(175, 238, 238),
	"turquoise": rgb(64, 224, 208),
	"mediumturquoise": rgb(72, 209, 204),
	"darkturquoise": rgb(0, 206, 209),
	"lightseagreen": rgb(32, 178, 170),
	"cadetblue": rgb(95, 158, 160),
	"darkcyan": rgb(0, 139, 139),
	"teal": rgb(0, 128, 128),
	"powderblue": rgb(176, 224, 230),
	"lightblue": rgb(173, 216, 230),
	"lightskyblue": rgb(135, 206, 250),
	"skyblue": rgb(135, 206, 235),
	"deepskyblue": rgb(0, 191, 255),
	"lightsteelblue": rgb(176, 196, 222),
	"dodgerblue": rgb(30, 144, 255),
	"cornflowerblue": rgb(100, 149, 237),
	"steelblue": rgb(70, 130, 180),
	"royalblue": rgb(65, 105, 225),
	"blue": rgb(0, 0, 255),
	"mediumblue": rgb(0, 0, 205),
	"darkblue": rgb(0, 0, 139),
	"navy": rgb(0, 0, 128),
	"midnightblue": rgb(25, 25, 112),
	"mediumslateblue": rgb(123, 104, 238),
	"slateblue": rgb(106, 90, 205),
	"darkslateblue": rgb(72, 61, 139),
	"lavender": rgb(230, 230, 250),
	"thistle": rgb(216, 191, 216),
	"plum": rgb(221, 160, 221),
	"violet": rgb(238, 130, 238),
	"orchid": rgb(218, 112, 214),
	"fuchsia": rgb(255, 0, 255),
	"magenta": rgb(255, 0, 255),
	"mediumorchid": rgb(186, 85, 211),
	"mediumpurple": rgb(147, 112, 219),
	"blueviolet": rgb(138, 43, 226),
	"darkviolet": rgb(148, 0, 211),
	"darkorchid": rgb(153, 50, 204),
	"darkmagenta": rgb(139, 0, 139),
	"purple": rgb(128, 0, 128),
	"indigo": rgb(75, 0, 130),
	"pink": rgb(255, 192, 203),
	"lightpink": rgb(255, 182, 193),
	"hotpink": rgb(255, 105, 180),
	"deeppink": rgb(255, 20, 147),
	"palevioletred": rgb(219, 112, 147),
	"mediumvioletred": rgb(199, 21, 133),
	"white": rgb(255, 255, 255),
	"snow": rgb(255, 250, 250),
	"honeydew": rgb(240, 255, 240),
	"mintcream": rgb(245, 255, 250),
	"azure": rgb(240, 255, 255),
	"aliceblue": rgb(240, 248, 255),
	"ghostwhite": rgb(248, 248, 255),
	"whitesmoke": rgb(245, 245, 245),
	"seashell": rgb(255, 245, 238),
	"beige": rgb(245, 245, 220),
	"oldlace": rgb(253, 245, 230),
	"floralwhite": rgb(255, 250, 240),
	"ivory": rgb(255, 255, 240),
	"antiquewhite": rgb(250, 235, 215),
	"linen": rgb(250, 240, 230),
	"lavenderblush": rgb(255, 240, 245),
	"mistyrose": rgb(255, 228, 225),
	"gainsboro": rgb(220, 220, 220),
	"lightgray": rgb(211, 211, 211),
	"silver": rgb(192, 192, 192),
	"darkgray": rgb(169, 169, 169),
	"gray": rgb(128, 128, 128),
	"dimgray": rgb(105, 105, 105),
	"lightslategray": rgb(119, 136, 153),
	"slategray": rgb(112, 128, 144),
	"darkslategray": rgb(47, 79, 79),
	"black": rgb(0, 0, 0),
	"cornsilk": rgb(255, 248, 220),
	"blanchedalmond": rgb(255, 235, 205),
	"bisque": rgb(255, 228, 196),
	"navajowhite": rgb(255, 222, 173),
	"wheat": rgb(245, 222, 179),
	"burlywood": rgb(222, 184, 135),
	"tan": rgb(210, 180, 140),
	"rosybrown": rgb(188, 143, 143),
	"sandybrown": rgb(244, 164, 96),
	"goldenrod": rgb(218, 165, 32),
	"peru": rgb(205, 133, 63),
	"chocolate": rgb(210, 105, 30),
	"saddlebrown": rgb(139, 69, 19),
	"sienna": rgb(160, 82, 45),
	"brown": rgb(165, 42, 42),
	"maroon": rgb(128, 0, 0)
};

interface SVGSettings {
	completion: {
		showAdvanced: boolean;
		showDeprecated: boolean;
		emmet: boolean;
		elementsActionAsSimple: string[];
	};
}

const defaultSettings: SVGSettings = {
	completion: {
		showAdvanced: false,
		showDeprecated: false,
		emmet: false,
		elementsActionAsSimple: []
	}
};
let langauge: string = '';
let globalSettings: SVGSettings = defaultSettings;
// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<SVGSettings>> = new Map();

let connection = createConnection(ProposedFeatures.all);

let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
	let capabilities: ClientCapabilities = params.capabilities;

	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);

	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			completionProvider: {
				triggerCharacters: '<|.| |=|"|}|0|1|2|3|4|5|6|7|8|9|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z'.split('|'),
				resolveProvider: false
			},
			hoverProvider: true,
			signatureHelpProvider: {
				triggerCharacters: '"|M|m|L|l|H|h|V|v|C|c|S|s|Q|q|T|t|A|a|Z|z|0|1|2|3|4|5|6|7|8|9|.|,|-| '.split('|')
			},
			definitionProvider: true,
			referencesProvider: true,
			documentSymbolProvider: true,
			documentFormattingProvider: true,
			renameProvider: {
				prepareProvider: true
			},
			colorProvider: true
		}
	};
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
		});
	}

	reloadSvgConfiguration();

	connection.workspace.getConfiguration('html.format').then(a => {
		if (a) {
			htmlFormatOptions = <HTMLFormatConfiguration>a;
		}
	});
});

connection.onNotification("_svg_init", p => {
	if (p && p.language) {
		langauge = p.language;
		if (langauge) {
			svg = getSvgJson(langauge.toLowerCase());
		}
	}
});

// 使用 vscode-html-langservice 作为格式化工具
connection.onDocumentFormatting(e => {
	let doc = documents.get(e.textDocument.uri);
	if (doc) {
		let options = {
			tabSize: e.options.tabSize,
			insertSpaces: e.options.insertSpaces,
			...htmlFormatOptions
		};
		let edits = htmlLangService.format(doc, undefined, options);
		// 处理 <?xml ?> 后换行
		edits[0].newText = edits[0].newText.replace(/^\s*<\?xml.*\?>(?!\n)/, n => `${n}\n`);
		return edits;
	}
});

function reloadSvgConfiguration() {
	connection.workspace.getConfiguration("svg").then(settings => {
		if (settings) {
			globalSettings = <SVGSettings>settings;
		}
	});
}

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	}
	if (change && change.settings) {
		globalSettings = <SVGSettings>(
			(change.settings.svg || defaultSettings)
		);
	} else {
		reloadSvgConfiguration();
	}
});

function posInPath(pgs: PathDataCommandItem[], offset: number) {
	connection.console.log('posInPath: ' + pgs.length + ', ' + offset);
	for (let pg of pgs) {
		connection.console.log('posInPath of: ' + pg.start + ', ' + pg.end);
		if (pg.start <= offset && pg.end >= offset) {
			connection.console.log(pg.commandType);
			let cmd = pc.pathCommandFromChar(pg.commandType);
			if (cmd) {
				let argFull = !cmd.parameters ? true : (pg.args.length % cmd.parameters.length === 0);
				for (let pi = 0; pi < pg.args.length; pi++) {
					let p = pg.args[pi];
					if (p.start <= offset && p.end >= offset) {
						return { cmd, pi };
					}
				}
				if (!argFull) {
					return { cmd, pi: pg.args.length };
				}
			}
		}
	}
	if (pgs.length) {
		let pg = pgs[pgs.length - 1];
		let cmd = pc.pathCommandFromChar(pg.commandType);
		if (cmd) {
			let argFull = !cmd.parameters ? true : (pg.args.length % cmd.parameters.length === 0);
			if (!argFull) {
				return { cmd, pi: pg.args.length };
			}
		}
	}
	return null;
}

connection.onSignatureHelp((e) => {
	let uri = e.textDocument.uri;
	let doc = documents.get(uri);
	if (doc) {
		let content = doc.getText();
		let offset = doc.offsetAt(e.position);
		let triggerChar = offset > 0 ? content.charAt(offset - 1) : '';
		let token = buildActiveToken(connection, doc, content, offset);
		if (token && token.token && token.token.type === TokenType.String) {
			let attrToken = getOwnerAttributeName(token.all, token.index);
			if (attrToken && attrToken.type === TokenType.AttributeName) {
				if (getTokenText(content, attrToken) === 'd') {
					let eleToken = getOwnerTagName(token.all, token.index);
					if (eleToken && ['path', 'glyph', 'missing-glyph'].indexOf(getTokenText(content, eleToken)) > -1) {
						// @ts-ignore TS2554
						let pathData = getTokenText(content, token.token);
						pathData = pathData.length > 2 ? pathData.substring(1, pathData.length - 1) : '';
						const pgs = parsePath(pathData);
						const inPathDataOffset = offset - token.token.startIndex - 1;
						let pos = posInPath(pgs, inPathDataOffset);

						let tpc = (!!pos) ? pos.cmd : pc.pathCommandFromChar(triggerChar);
						if (tpc) {
							return {
								signatures: [
									pc.signatureFromPathCommand(tpc),
									pc.PathDataSignature
								],
								activeSignature: 0,
								// @ts-ignore TS2554
								activeParameter: pos != null ? (pos.pi % tpc.parameters.length) : null
							};
						}
						else {
							return {
								signatures: [pc.PathDataSignature],
								activeSignature: null,
								activeParameter: null
							};
						}
					}
				}
			}
		}
		// connection.console.log('onSignatureHelp token ' + JSON.stringify(token.token));
	}
	return null;
});

function getDocumentSettings(resource: string): Thenable<SVGSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'svg'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

interface ICompletionData<T> {
	item: T;
	insertFullTag: boolean;
	firstAppend: string;
	uri: string;
	position: number;
}

function createCompletionFromElement(uri: string, position: number, name: string, element: ISvgJsonElement, insertFullTag: boolean, firstAppend: string): CompletionItem {
	let item: CompletionItem = {
		label: name,
		kind: CompletionItemKind.Module,
		commitCharacters: [' '],
		data: {
			item: element,
			insertFullTag,
			firstAppend,
			uri,
			position
		}
	};
	return item;
}

function createCompletionFromAttribute(uri: string, position: number, attribute: ISvgJsonAttribute, insertFullTag: boolean, firstAppend: string): CompletionItem {
	let item: CompletionItem = {
		label: attribute.name,
		kind: CompletionItemKind.Property,
		data: {
			item: attribute,
			insertFullTag,
			firstAppend,
			uri,
			position
		}
	};
	return item;
}

function createCompletionFromEnum(uri: string, position: number, svgEnum: SvgEnum, insertFullTag: boolean, firstAppend: string): CompletionItem {
	if (typeof svgEnum == "string") {
		svgEnum = { name: svgEnum, documentation: '' };
	}

	let item: CompletionItem = {
		label: svgEnum.name,
		kind: CompletionItemKind.Enum,
		data: {
			item: svgEnum,
			insertFullTag,
			firstAppend,
			uri,
			position
		}
	};
	return item;
}
let cssLangService = getCSSLanguageService();
let htmlLangService = getHTMLLanguageService();
let htmlFormatOptions: HTMLFormatConfiguration = {};

function onCompletionInCss(doc: TextDocument, content: string, position: Position, modes: Array<DocumentRangeMode>) {
	var cssDoc = getModeDocument(doc, content, modes, 'css');
	var styleSheet = cssLangService.parseStylesheet(cssDoc);
	return cssLangService.doComplete(cssDoc, position, styleSheet);
}

interface CompletionTargetAttrCallback {
	(label: string, context: string, kind?: CompletionItemKind):void;
}

function onCompletionPaintAttr(doc: TextDocument, appendQute: boolean, addCallback: CompletionTargetAttrCallback) {
	// 快速找到有 ID 的 linearGradient, pattern, radialGradient
	let reg = /<(linearGradient|pattern|radialGradient)[^>]*id="([^"]+)"/g;
	let text = doc.getText();
	let match: RegExpExecArray | null = null;
	let qute = appendQute ? '"' : '';
	while (match = reg.exec(text)) {
		let id = match[2];
		addCallback('#' + id, qute + 'url(#' + id + ')' + qute);
	}
}

function onCompletionClassAttr(doc: TextDocument, content: string, modes: Array<DocumentRangeMode>, appendQute: boolean, addCallback: CompletionTargetAttrCallback) {
	var cssDoc = getModeDocument(doc, content, modes, 'css');
	var css = cssDoc.getText();
	let reg = /\s\.([-a-z_][-a-z0-9_]*)/gi;
	let match = null;
	let writed: any = {};
	while (match = reg.exec(css)) {
		let name = match[1];
		if (name in writed) {
			continue;
		}
		writed[name] = true;
		addCallback(name, appendQute ? `"${name}"` : name, CompletionItemKind.Class);
	}
}

enum CompletionMeanType {
	Element,
	Attribute,
	Value,
	Other,
}

function getMeanAttributeName(token: IActiveToken, content: string, index: number) {
	while (index > 0) {
		let t = token.all[index];
		if (t.type == TokenType.AttributeName) {
			return content.substring(t.startIndex, t.endIndex);
		}
		index--;
	}
	return null;
}

function getMeanParentTagName(token: IActiveToken, content: string, index: number, level = 1) {
	let tagName: Token | null = null;
	let tagNameSu = false;
	while (index > 0) {
		let t = token.all[index];
		if (t.type == TokenType.TagName) {
			tagName = t;
			tagNameSu = true;
		}
		else if (tagNameSu) {
			if (t.type == TokenType.StartEndTag) {
				level++;
			}
			else if (t.type == TokenType.StartTag) {
				level--;
				if (level <= 0) {
					break;
				}
			}
			tagNameSu = false;
		}
		else if (t.type == TokenType.SimpleEndTag) {
			level++;
		}
		index--;
	}
	return tagName && content.substring(tagName.startIndex, tagName.endIndex) || null;
}

interface CompletionMean {
	type: CompletionMeanType;
	start: string;
	end: string;
	startOffset: number;
	endOffset: number;
	parent?: string | null;
	/** Current tag for completion, only for `CompletionMeanType.Value` */
	tag?: string | null;
	hasAttributes?: Array<string>;
}

function fillHasAttributeNext(token: IActiveToken, index: number, attrs: Array<string>, content: string, step: -1 | 1 = 1) {
	while (index >= 0 && index < token.all.length) {
		let t = token.all[index];
		index += step;
		switch (t.type) {
			case TokenType.AttributeName:
				attrs.push(content.substring(t.startIndex, t.endIndex));
				break;
			case TokenType.EndTag:
			case TokenType.StartEndTag:
			case TokenType.SimpleEndTag:
			case TokenType.StartTag:
				return;
		}
	}
}

function fastGetCompletionMean(token: IActiveToken, content: string, offset: number): CompletionMean | null {
	try {
		// const endOfToken = token.all.find(t=>t.endIndex == offset);
		// const startOfToken = token.all.find(t=>t.startIndex == offset);
		const inToken = token.all.find(t => t.startIndex < offset && t.endIndex >= offset);
		const prevToken = inToken && inToken.index > 0 && token.all[inToken.index - 1] || undefined;
		if (!prevToken) {
			if (inToken) {
				if (inToken.type == TokenType.TagName) {
					return {
						type: CompletionMeanType.Element,
						start: content.substring(inToken.startIndex, offset),
						end: content.substring(offset, inToken.endIndex),
						startOffset: offset,
						endOffset: offset,
					};
				}
				if (inToken.type == TokenType.StartTag) {
					return {
						type: CompletionMeanType.Element,
						start: '',
						end: '',
						startOffset: offset,
						endOffset: offset
					};
				}
			}
			return null;
		}
		if (!inToken) {
			return null;
		}
		let start = '';
		let end = '';
		let startOffset = offset;
		let endOffset = offset;
		// 元素名
		if (inToken.type == TokenType.StartTag) {
			return {
				type: CompletionMeanType.Element,
				start,
				end,
				startOffset,
				endOffset,
				parent: getMeanParentTagName(token, content, prevToken.index)
			};
		}
		if (inToken.type == TokenType.TagName) {
			return {
				type: CompletionMeanType.Element,
				start: content.substring(inToken.startIndex, offset),
				end: content.substring(offset, inToken.endIndex),
				startOffset: inToken.startIndex,
				endOffset: inToken.endIndex,
				parent: getMeanParentTagName(token, content, prevToken.index - 1)
			};
		}
		// 属性名
		if (inToken.type == TokenType.Whitespace && prevToken.type == TokenType.TagName) {
			let hasAttributes: Array<string> = [];
			fillHasAttributeNext(token, inToken.index, hasAttributes, content);
			return {
				type: CompletionMeanType.Attribute,
				start,
				end,
				startOffset,
				endOffset,
				hasAttributes,
				parent: getMeanParentTagName(token, content, inToken.index)
			};
		}
		if (inToken.type == TokenType.Whitespace && prevToken.type == TokenType.String) {
			let hasAttributes: Array<string> = [];
			fillHasAttributeNext(token, inToken.index, hasAttributes, content);
			fillHasAttributeNext(token, inToken.index, hasAttributes, content, -1);
			return {
				type: CompletionMeanType.Attribute,
				start,
				end,
				startOffset,
				endOffset,
				hasAttributes,
				parent: getMeanParentTagName(token, content, inToken.index)
			};
		}
		if(inToken.type == TokenType.AttributeName) {
			let hasAttributes: Array<string> = [];
			fillHasAttributeNext(token, inToken.index, hasAttributes, content);
			fillHasAttributeNext(token, inToken.index, hasAttributes, content, -1);
			return {
				type: CompletionMeanType.Attribute,
				start: content.substring(inToken.startIndex, offset),
				end: content.substring(offset, inToken.endIndex),
				startOffset: inToken.startIndex,
				endOffset: inToken.endIndex,
				hasAttributes,
				parent: getMeanParentTagName(token, content, inToken.index)
			};
		}
		// 属性值
		if (inToken.type == TokenType.String && prevToken.type == TokenType.Equal) {
			return {
				type: CompletionMeanType.Value,
				start: content.substring(inToken.startIndex, offset),
				end: content.substring(offset, inToken.endIndex),
				startOffset: inToken.startIndex,
				endOffset: inToken.endIndex,
				parent: getMeanAttributeName(token, content, inToken.index),
				tag: getMeanParentTagName(token, content, inToken.index)
			};
		}
		if(inToken.type == TokenType.Equal) {
			return {
				type: CompletionMeanType.Value,
				start,
				end,
				startOffset,
				endOffset,
				parent: getMeanAttributeName(token, content, inToken.index),
				tag: getMeanParentTagName(token, content, inToken.index)
			};
		}
	}
	catch (e) {
		console.error(e);

	}

	return null;
}

function appendCompletion(doc: TextDocument, offset: number, document: string, items: Array<CompletionItem>, label: string, mean: CompletionMean, content: string, kind: CompletionItemKind, help?: string, triggerSuggest = false, deprecated?: boolean|string) {
	let endOffset = mean.endOffset;
	let eatContentStart = 0;
	// let start = content.substring(0, eatContentStart + 1);
	// let hasStart = document.substring(offset - eatContentStart - 1, offset);
	// while (mean.startOffset != mean.endOffset && start != hasStart) {
	// 	eatContentStart++;
	// 	if (eatContentStart > 20) {
	// 		return;
	// 	}
	// 	start = content.substring(0, eatContentStart + 1);
	// 	hasStart = document.substring(offset - eatContentStart - 1, offset);
	// }
	if(mean.start) {
		eatContentStart = offset - mean.startOffset;
	}
	if (content.startsWith('<')) {
		eatContentStart++;
	}
	content = content.substring(eatContentStart);

	const range = Range.create(doc.positionAt(offset), doc.positionAt(endOffset));
	// console.log(`replace range:${JSON.stringify(range)} ${context}`);
	const completionItem: CompletionItem = {
		label,
		kind,
		insertTextFormat: InsertTextFormat.Snippet,
		insertText: content,
		textEdit: TextEdit.replace(range, content)
	};
	completionItem.documentation = {
		kind: MarkupKind.Markdown,
		value: ''
	};
	let needNewLine = false;
	if (deprecated) {
		completionItem.documentation.value += '*Deprecated*';
		if(typeof deprecated === 'string') {
			completionItem.documentation.value += ' - ' + MarkedString.fromPlainText(deprecated);
		}
		needNewLine = true;
	}
	if (help) {
		if(needNewLine){
			completionItem.documentation.value += '\n\n';
		}
		completionItem.documentation.value += help.replace(/\<[^\>]\>/gi, n=>'`' + n + '`');
		needNewLine = true;
	}
	if(kind == CompletionItemKind.Module) {
		if(needNewLine){
			completionItem.documentation.value += '\n\n';
		}
		completionItem.documentation.value += '[MDN References](' + svgDocUrl.element + label + ')';
	}
	if(kind == CompletionItemKind.Property) {
		if(needNewLine){
			completionItem.documentation.value += '\n\n';
		}
		completionItem.documentation.value += '[MDN References](' + svgDocUrl.attribute + label + ')';
	}
	if (triggerSuggest) {
		// completionItem.insertTextFormat = InsertTextFormat.PlainText;
		// delete completionItem.insertText;
		// delete completionItem.textEdit;
		completionItem.command = Command.create('Show Suggest', 'editor.action.triggerSuggest');		
		// console.debug(JSON.stringify(completionItem));
	}
	items.push(completionItem);
}

function getLocalOrGlobalAttr(mean: CompletionMean) : ISvgJsonAttribute | undefined {
	if(mean && mean.parent) {
		// global attr
		let attr = svg.attributes[mean.parent]; 
		// try get local attr
		if(mean.tag && svg.elements[mean.tag]) {
			const ele = svg.elements[mean.tag];
			if(ele.attributes) {
				const localAttr = <ISvgJsonAttribute | undefined>ele.attributes.find(p=>typeof p !== 'string' && p.name == mean.parent);
				if(localAttr) {
					return localAttr;
				}
			}
		}
		return attr;
	}
}

connection.onCompletion(async e => {
	// connection.console.log("onCompletion " + e.textDocument.uri);
	let uri = e.textDocument.uri;
	let doc = documents.get(uri);
	// let triggerCharacter = e.context && e.context.triggerCharacter;
	if (doc) {
		let isIncomplete = true;
		let settings = await getDocumentSettings(doc.uri);
		let items: Array<CompletionItem> = [];
		let content = doc.getText();
		let modes = getModes(content);
		let offset = doc.offsetAt(e.position);
		let mode = getModeAtOffset(modes, offset);
		if (mode) {
			if (mode.languageId == 'css') {
				return onCompletionInCss(doc, content, e.position, modes);
			}
		}
		let token = buildActiveToken(connection, doc, content, offset);
		let mean = fastGetCompletionMean(token, content, offset);
		if (mean) {
			// console.debug(`mean ${JSON.stringify(mean)}`);
			switch (mean.type) {
				case CompletionMeanType.Element:
					if (mean.parent) {
						isIncomplete = false;
						let parentElement = svg.elements[mean.parent];
						if (parentElement && parentElement.subElements) {
							for (var name of parentElement.subElements) {
								if (mean.start && !name.startsWith(mean.start)) {
									continue;
								}
								let element = svg.elements[name];
								if (element.advanced && !settings.completion.showAdvanced) {
									continue;
								}
								if (element.deprecated && !settings.completion.showDeprecated) {
									continue;
								}
								//items.push(createCompletionFromElement(uri, offset, name, element, !triggerCharacter, ''));
								let output: Array<string> = [];
								output.push(`<${name}`);
								if (element.defaultAttributes) {
									let inputIndex = 1;
									for (var pn in element.defaultAttributes) {
										output.push(` ${pn}="$\{${inputIndex++}:${element.defaultAttributes[pn]}\}"`);
									}
								}
								if (element.simple || globalSettings.completion.elementsActionAsSimple.includes(name)) {
									output.push(`$0 />`);
								}
								else if (element.inline) {
									output.push('>$0</');
									output.push(name);
									output.push('>');
								}
								else {
									output.push('>\n\t$0\n</');
									output.push(name);
									output.push('>');
								}
								appendCompletion(doc, offset, content, items, name, mean, output.join(''), CompletionItemKind.Module, element.documentation, false, element.deprecated);
							}
						}
					}
					else {
						appendCompletion(doc, offset, content, items, 'SVG Root Element', mean, '<svg xmlns="http://www.w3.org/2000/svg">\n\t$0\n</svg>', CompletionItemKind.Snippet);
					}
					break;
				case CompletionMeanType.Attribute:
					if (mean.parent) {
						isIncomplete = false;
						let parent = svg.elements[mean.parent];
						if (parent && parent.attributes) {
							for (let attr of parent.attributes) {
								if (typeof attr === 'string') {
									let attr2 = svg.attributes[attr];
									if(attr2) {
										attr = attr2;
									}
									else {
										attr = { name: attr};
									}
								} 
								if (mean.start && !attr.name.startsWith(mean.start)) {
									continue;
								}
								if (mean.hasAttributes && mean.hasAttributes.includes(attr.name)) {
									continue;
								}
								if ((!!attr.enum) || (!!attr.enums) || attr.type && /^(color|fill|stroke|paint|class)$/.test(attr.type)) {
									appendCompletion(doc, offset, content, items, attr.name, mean, `${attr.name}="$0"`, CompletionItemKind.Property, attr.documentation, true, attr.deprecated);
								}
								else {
									appendCompletion(doc, offset, content, items, attr.name, mean, `${attr.name}="$0"`, CompletionItemKind.Property, attr.documentation, false, attr.deprecated);
								}
							}
						}
					}
					break;
				case CompletionMeanType.Value:
					if (mean.parent) {
						isIncomplete = false;
						let attr = getLocalOrGlobalAttr(mean);
						if (attr) {
							if (attr.enum) {
								for (var a of attr.enum) {
									let name = typeof a === 'string' ? a : a.name;
									let help = typeof a === 'string' ? undefined : a.documentation;
									if (mean.start) {
										let start = mean.start;
										if (start.startsWith('"')) {
											start = start.substr(1);
										}
										if (start && !name.startsWith(start)) {
											continue;
										}
									}
									appendCompletion(doc, offset, content, items, name, mean, `"${name}"`, CompletionItemKind.Enum, help);
								}
							}
							if(attr.enums) {
								for (var a of attr.enums) {
									let name = typeof a === 'string' ? a : a.name;
									let help = typeof a === 'string' ? undefined : a.documentation;
									if (mean.start) {
										let start = mean.start;
										if (start.startsWith('"')) {
											start = start.substr(1);
										}
										if (start && !name.startsWith(start)) {
											continue;
										}
									}
									appendCompletion(doc, offset, content, items, name, mean, `"${name}"`, CompletionItemKind.Enum, help);
								}
							}
							if (attr.type && /^(color|fill|stroke|paint)$/.test(attr.type)) {
								for (let color in colors) {
									if(mean.start && (!color.startsWith(mean.start) && !('"' + color).startsWith(mean.start))) {
										continue;
									}
									appendCompletion(doc, offset, content, items, color, mean, `"${color}"`, CompletionItemKind.Color);
								}

								if (attr.type == 'paint') {
									onCompletionPaintAttr(doc, true, (label, text)=>{
										appendCompletion(doc!, offset, content, items, label, mean!, text, CompletionItemKind.Variable);
									});
								}
							}
							else if(attr.name == 'class') {
								onCompletionClassAttr(doc, content, modes, true, (label, text, kind)=>{
									appendCompletion(doc!, offset, content, items, label, mean!, text, kind || CompletionItemKind.Variable);
								});
							}
						}
					}
			}
		}
		// Emmet 风格自动提示
		else if (globalSettings.completion.emmet) {
			const completionList = emmet.doComplete(doc, e.position, 'svg', svg);
			if (completionList && completionList.items) {
				items.push(...completionList.items);
			}
			// console.debug(`items: ${items.length}`);
		}

		return CompletionList.create(items, isIncomplete);
	}
});

function createDocumentation(item: CompletionItem, deprecated?: boolean | string, documentation?: string): string | MarkupContent | undefined {
	let docUrlPart = '';
	if (item.kind == CompletionItemKind.Module) {
		docUrlPart = '\n\n[MDN Reference](' + svgDocUrl.element + item.label + ')';
	}
	else if (item.kind == CompletionItemKind.Property) {
		docUrlPart = '\n\n[MDN Reference](' + svgDocUrl.attribute + item.label + ')';
	}
	if (deprecated) {
		if (typeof deprecated == 'string') {
			if (documentation) {
				return {
					kind: MarkupKind.Markdown,
					value: '*Deprecated* - ' + MarkedString.fromPlainText(deprecated) +
						'\n' + MarkedString.fromPlainText(documentation) + docUrlPart
				};
			}
			else {
				return {
					kind: MarkupKind.Markdown,
					value: '**Deprecated** - ' + MarkedString.fromPlainText(deprecated) + docUrlPart
				};
			}
		}
		else {
			if (documentation) {
				return {
					kind: MarkupKind.Markdown,
					value: '**Deprecated**\n' + MarkedString.fromPlainText(documentation) + docUrlPart
				};
			}
			else {
				return {
					kind: MarkupKind.Markdown,
					value: '**Deprecated**' + docUrlPart
				};
			}
		}
	}
	if (documentation) {
		return {
			kind: MarkupKind.Markdown,
			value: MarkedString.fromPlainText(documentation) + docUrlPart
		};
	}
	return {
		kind: MarkupKind.Markdown,
		value: docUrlPart.substring(1)
	};
}

// connection.onCompletionResolve(item => {	
// 	connection.console.log("onCompletionResolve " + item);
// 	if(item.data) {
// 		if(item.kind == CompletionItemKind.Module) {
// 			let data : ICompletionData<ISvgJsonElement> = item.data;
// 			let svgElement: ISvgJsonElement = data.item;
// 			item.documentation = createDocumentation(item, svgElement.deprecated, svgElement.documentation);
// 			item.insertTextFormat = 2;
// 			let insertText : Array<string> = [];
// 			if(data.insertFullTag) {
// 				insertText.push("<");
// 			}
// 			if(data.firstAppend) {
// 				insertText.push(item.label.substr(data.firstAppend.length));
// 			}
// 			else
// 			{
// 				insertText.push(item.label);
// 			}
// 			let index = 1;
// 			if(svgElement.defaultAttributes) {
// 				for(var pn in svgElement.defaultAttributes) {
// 					let pv = svgElement.defaultAttributes[pn];
// 					insertText.push(` ${pn}="\${${index++}:${pv}}"`);
// 				}
// 			}
// 			if(svgElement.simple) {
// 				insertText.push("$0 />");
// 			}
// 			else {
// 				insertText.push(">\n\t$0\n</" + item.label + ">");
// 			}
// 			item.insertText = insertText.join('');
// 		}
// 		else if(item.kind == CompletionItemKind.Property) {
// 			let data : ICompletionData<ISvgJsonAttribute> = item.data;
// 			let svgAttr: ISvgJsonAttribute = data.item;
// 			item.documentation = createDocumentation(item, svgAttr.deprecated, svgAttr.documentation);
// 			item.insertTextFormat = 2;
// 			let insertText : Array<string> = [];
// 			if(!data.firstAppend && data.insertFullTag) {
// 				insertText.push(' ');
// 			}
// 			// else if(data.firstAppend) {
// 			// 	insertText.push(item.label.substr(data.firstAppend.length));
// 			// }
// 			else
// 			{
// 				insertText.push(item.label);
// 			}
// 			insertText.push("=\"$0\"");
// 			if(svgAttr.enum || svgAttr.enums || (svgAttr.type && /^(color|fill|stroke|paint)$/.test(svgAttr.type))) {
// 				item.command = Command.create("Show Enum Completion List", "editor.action.triggerSuggest");
// 			}
// 			item.insertText = insertText.join('');
// 		}
// 		else if(item.kind == CompletionItemKind.Enum) {
// 			let data : ICompletionData<SvgEnum> = item.data;
// 			let svgEnum: SvgEnum = data.item;
// 			if(typeof svgEnum == 'string') {
// 				svgEnum = {name: svgEnum, documentation: ''};
// 			}
// 			item.documentation = svgEnum.documentation;
// 			if(data.insertFullTag) {
// 				item.insertText = `"${item.label}"`;
// 			}
// 			else if(data.firstAppend) {
// 				item.insertText = item.label.substr(data.firstAppend.length);
// 			}
// 		}
// 	}
// 	return item;
// });

function replaceDocumentationToMarkedString(documentation: string, label?: string): string | MarkedString | MarkupContent {
	if (label && label.toLowerCase() in svg.elements) {
		return {
			kind: MarkupKind.Markdown,
			//language: 'xml',
			value: MarkedString.fromPlainText(documentation) + '\n\n[MDN Reference](' + svgDocUrl.element + label + ')'
		};
	}
	if (label && label.toLowerCase() in svg.attributes) {
		return {
			kind: MarkupKind.Markdown,
			//language: 'xml',
			value: MarkedString.fromPlainText(documentation) + '\n\n[MDN Reference](' + svgDocUrl.attribute + label + ')'
		};
	}
	return MarkedString.fromPlainText(documentation);
}

connection.onHover(e => {
	let doc = documents.get(e.textDocument.uri);
	if (doc) {
		let offset = doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc, doc.getText(), offset);
		if (token && token.token && (token.token.type == TokenType.TagName || token.token.type == TokenType.AttributeName)) {
			let content = doc.getText();
			// try find tag element
			if (token.token.type == TokenType.TagName) {
				var tagName = content.substring(token.token.startIndex, token.token.endIndex);
				var range = Range.create(
					doc.positionAt(token.token.startIndex),
					doc.positionAt(token.token.endIndex));
				if (tagName in svg.elements) {
					var tag = svg.elements[tagName];
					if (tag && tag.documentation) {
						return {
							contents: replaceDocumentationToMarkedString(tag.documentation, tagName),
							range
						};
					}
				}
			}
			// tag attribute
			else {
				let ownerTagName = getOwnerTagName(token.all, token.index);
				if (ownerTagName) {
					var attrName = content.substring(token.token.startIndex, token.token.endIndex);
					var range = Range.create(
						doc.positionAt(token.token.startIndex),
						doc.positionAt(token.token.endIndex));
					if (attrName in svg.attributes) {
						var attr = svg.attributes[attrName];
						if (attr && attr.documentation) {
							return {
								contents: replaceDocumentationToMarkedString(attr.documentation, attrName),
								range
							};
						}
					}
				}
			}
		}
	}
});

connection.onDefinition(e => {
	let doc = documents.get(e.textDocument.uri);
	if (doc) {
		let content = doc.getText();
		let offset = doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc, content, offset);
		if (token && token.token && token.token.type == TokenType.String) {
			let val = content.substring(token.token.startIndex, token.token.endIndex);
			let urlMatch = val.match(/url\(#(.*?)\)/i);
			if (urlMatch && urlMatch.length) {
				let id = urlMatch[1];
				let idAttrStartIndex = content.indexOf(`id="${id}"`);
				if (idAttrStartIndex > -1) {
					let range = Range.create(doc.positionAt(idAttrStartIndex), doc.positionAt(idAttrStartIndex + 5 + id.length));
					return Location.create(e.textDocument.uri, range);
				}
			}
			urlMatch = val.match(/"#(.*?)"/i);
			if (urlMatch && urlMatch.length) {
				let id = urlMatch[1];
				let idAttrStartIndex = content.indexOf(`id="${id}"`);
				if (idAttrStartIndex > -1) {
					let range = Range.create(doc.positionAt(idAttrStartIndex), doc.positionAt(idAttrStartIndex + 5 + id.length));
					return Location.create(e.textDocument.uri, range);
				}
			}
			else {
				if (token.index > 2 && token.prevToken && token.prevToken.type == TokenType.Equal) {
					let attrNameToken = token.all[token.index - 2];
					let result = getTokenText(content, token.token);
					let attrName = getTokenText(content, attrNameToken);
					if (attrNameToken.type == TokenType.AttributeName && (attrName == 'in' || attrName == 'in2')) {
						let resultStartIndex = content.indexOf(`result=${result}`);
						if (resultStartIndex > -1) {
							let range = Range.create(doc.positionAt(resultStartIndex), doc.positionAt(resultStartIndex + 7 + result.length));
							return Location.create(e.textDocument.uri, range);
						}
					}
				}
			}
		}
	}
});

connection.onReferences(e => {
	let doc = documents.get(e.textDocument.uri);
	if (doc) {
		let content = doc.getText();
		let offset = doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc, content, offset);
		if (token && token.token && token.token.type == TokenType.String && token.prevToken && token.prevToken.type == TokenType.Equal) {
			let ownerAttrName = getOwnerAttributeName(token.all, token.index);
			if (ownerAttrName) {
				let ownerAttr = content.substring(ownerAttrName.startIndex, ownerAttrName.endIndex);
				if (ownerAttr.toUpperCase() == "ID") {
					let id = content.substring(token.token.startIndex + 1, token.token.endIndex - 1);
					if (id) {
						let refRegx = /(url\(#(.*?)\))/ig;
						let result: RegExpExecArray | null = null;
						let locations = [];
						while (result = refRegx.exec(content)) {
							if (result[2] == id) {
								let start = doc.positionAt(result.index);
								let end = doc.positionAt(result.index + result[0].length);
								locations.push(Location.create(e.textDocument.uri, Range.create(start, end)));
							}
						}
						refRegx = /xlink:href="#(.*?)"/ig;
						while (result = refRegx.exec(content)) {
							if (result[1] == id) {
								let start = doc.positionAt(result.index);
								let end = doc.positionAt(result.index + result[0].length);
								locations.push(Location.create(e.textDocument.uri, Range.create(start, end)));
							}
						}
						return locations;
					}
				}
				else if (ownerAttr.toUpperCase() == "RESULT") {
					let id = content.substring(token.token.startIndex + 1, token.token.endIndex - 1);
					if (id) {
						let refRegx = /in2?="(.*?)"/ig;
						let result: RegExpExecArray | null = null;
						let locations = [];
						while (result = refRegx.exec(content)) {
							if (result[1] == id) {
								let start = doc.positionAt(result.index);
								let end = doc.positionAt(result.index + result[0].length);
								locations.push(Location.create(e.textDocument.uri, Range.create(start, end)));
							}
						}
						return locations;
					}
				}
			}
		}
	}
});

interface ASTNODE {
	start?: Token;
	name?: string;
	end?: Token;
	parent?: ASTNODE | null;
	children: Array<ASTNODE>;
}

function buildAstTree(all: Array<Token>, content: string) {
	let node: ASTNODE = { children: [], parent: null };
	let root = node;
	let rp = 0; // 1 - starttag 2 - name 3 - endtag  4 - startendtag 5 - name 6 - endtag
	for (let t of all) {
		switch (t.type) {
			case TokenType.StartTag:
				rp = 1;
				node = { parent: node, children: [], start: t };
				node.parent!.children.push(node);
				break;
			case TokenType.TagName:
				if (rp == 1) {
					rp = 2;
					node.name = content.substring(t.startIndex, t.endIndex);
				} else if (rp == 4) {
					let endname = content.substring(t.startIndex, t.endIndex);
					if (endname == node.name) {
						rp = 5;
					}
				}
				break;
			case TokenType.StartEndTag:
				rp = 4;
				break;
			case TokenType.EndTag:
				if (rp == 2) {
					rp = 3;
				}
				else if (rp == 5) {
					rp = 6;
					node.end = t;
					if (node.parent) {
						node = node.parent;
					}
				}
				break;
			case TokenType.SimpleEndTag:
				node.end = t;
				if (node.parent) {
					node = node.parent;
				}
				break;
		}
	}
	return root;
}

function findAstNode(ast: ASTNODE, index: number): ASTNODE | null {
	if (ast.children && ast.children.length) {
		for (let child of ast.children) {
			let childFindNode = findAstNode(child, index);
			if (childFindNode) {
				return childFindNode;
			}
		}
	}
	if (ast.start && ast.end) {
		if (index >= ast.start.startIndex && index < ast.end.endIndex) {
			return ast;
		}
	}
	return null;
}

function createRange(doc: TextDocument, token: Token, startOffset = 0, endOffset = 0): Range {
	return Range.create(doc.positionAt(token.startIndex + startOffset), doc.positionAt(token.endIndex + endOffset));
}

function getTokenText(content: string, token: Token) {
	return content.substring(token.startIndex, token.endIndex);
}

connection.onDocumentSymbol(e => {
	let doc = documents.get(e.textDocument.uri);
	if (doc) {
		let content = doc.getText();
		let token = buildActiveToken(connection, doc, content, 0);
		let root = buildAstTree(token.all, content);

		let result: Array<DocumentSymbol> = [];

		function buildResult(symbols: Array<DocumentSymbol>, nodes: Array<ASTNODE>) {
			for (let node of nodes) {
				if (node.start && node.end) {
					let range = Range.create(doc!.positionAt(node.start.startIndex), doc!.positionAt(node.end.endIndex));
					let symbol: DocumentSymbol = {
						name: '' + node.name,
						kind: SymbolKind.Module,
						range: range,
						selectionRange: Range.create(range.start, range.start)
					};
					if (node.children.length) {
						symbol.children = [];
						buildResult(symbol.children, node.children);
					}
					symbols.push(symbol);
				}
			}
		}

		buildResult(result, root.children);

		return result;
	}
});

function renameID(doc: TextDocument, content: string, oldId: string, newId: string) {
	let changes: Array<TextEdit> = [];

	let idRegex = /id="(.+?)"/gi;
	let re: RegExpExecArray | null = null;
	while (re = idRegex.exec(content)) {
		if (re[1] == oldId) {
			changes.push(TextEdit.replace(Range.create(doc.positionAt(re.index + 4), doc.positionAt(re.index + 4 + oldId.length)), newId));
		}
	}
	idRegex = /url\(#(.+?)\)/gi;
	while (re = idRegex.exec(content)) {
		if (re[1] == oldId) {
			changes.push(TextEdit.replace(Range.create(doc.positionAt(re.index + 5), doc.positionAt(re.index + 5 + oldId.length)), newId));
		}
	}

	let result: WorkspaceEdit = { changes: {} };
	result.changes![doc.uri] = changes;
	return result;
}

connection.onRenameRequest(e => {
	let doc = documents.get(e.textDocument.uri);
	if (doc) {
		let content = doc.getText();
		let offset = doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc, content, offset);
		if (token && token.token && token.prevToken) {
			if (token.token.type == TokenType.TagName || token.token.type == TokenType.AttributeName) {
				let ast = buildAstTree(token.all, content);
				let node = findAstNode(ast, token.token.startIndex);
				if (node) {
					let changes: Array<TextEdit> = [];
					let startTagName = token.all[node.start!.index + 1];
					changes.push(TextEdit.replace(createRange(doc, startTagName), e.newName));

					if (node.end && node.end.type == TokenType.EndTag) {
						let endTagName = token.all[node.end.index - 1];
						if (endTagName.type == TokenType.TagName) {
							changes.push(TextEdit.replace(createRange(doc, endTagName), e.newName));
						}
					}

					let result: WorkspaceEdit = { changes: {} };
					result.changes![e.textDocument.uri] = changes;
					return result;
				}
			}
			if (token.token.type == TokenType.String && token.prevToken.type == TokenType.Equal) {
				if (token.prevToken.index > 0) {
					let attrVal = getTokenText(content, token.token);
					let attNameToken = token.all[token.prevToken.index - 1];
					if (getTokenText(content, attNameToken).toUpperCase() == "ID") {
						return renameID(doc, content, attrVal.substr(1, attrVal.length - 2), e.newName);
					}
					let idUrlMatch = attrVal.match(/url\(#(.+?)\)/i);
					if (idUrlMatch && idUrlMatch.length > 1) {
						return renameID(doc, content, idUrlMatch[1], e.newName);
					}
				}
			}
		}
	}
	return null;
});

connection.onPrepareRename(e => {
	let doc = documents.get(e.textDocument.uri);
	if (doc) {
		let content = doc.getText();
		let offset = doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc, content, offset);
		if (token && token.token && token.prevToken) {
			if (token.token.type == TokenType.TagName) {
				if (token.prevToken.type == TokenType.StartTag) {
					return createRange(doc, token.token);
				}
				else if (token.prevToken.type == TokenType.StartEndTag) {
					return createRange(doc, token.token);
				}
			}
			if (token.token.type == TokenType.String && token.prevToken.type == TokenType.Equal) {
				if (token.prevToken.index > 0) {
					let attNameToken = token.all[token.prevToken.index - 1];
					if (getTokenText(content, attNameToken).toUpperCase() == "ID") {
						return createRange(doc, token.token, 1, -1);
					}
					let attrVal = getTokenText(content, token.token);
					let idUrlMatch = attrVal.match(/url\(#(.+?)\)/i);
					if (idUrlMatch && idUrlMatch.length > 1) {
						let endIndex = token.token.startIndex + idUrlMatch.index! + idUrlMatch[0].length - 1;
						return createRange(doc, token.token, idUrlMatch.index! + 5, endIndex - token.token.endIndex);
					}
				}
			}
		}
	}
});

function tryConvertColor(str: string): Color | null {
	if (str.length <= 2) return null;
	let match: RegExpExecArray | null = null;
	if (/^#[0-9A-Fa-f]{3}$/.test(str)) {
		let r = Number.parseInt(str.substr(1, 1), 16);
		let g = Number.parseInt(str.substr(2, 1), 16);
		let b = Number.parseInt(str.substr(3, 1), 16);
		r = r * 17;
		g = g * 17;
		b = b * 17;
		return Color.create(r / 255, g / 255, b / 255, 1);
	}
	else if (/^#[0-9A-Fa-f]{6}$/.test(str)) {
		let r = Number.parseInt(str.substr(1, 2), 16);
		let g = Number.parseInt(str.substr(3, 2), 16);
		let b = Number.parseInt(str.substr(5, 2), 16);
		return Color.create(r / 255, g / 255, b / 255, 1);
	}
	else if (match = /^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\)/.exec(str)) {
		let r = Number.parseInt(match[1]);
		let g = Number.parseInt(match[2]);
		let b = Number.parseInt(match[3]);
		return Color.create(r / 255, g / 255, b / 255, 1);
	}
	else if (match = /^rgb\(\s*(\d+)%,\s*(\d+)%,\s*(\d+)%\)/.exec(str)) {
		let r = Number.parseFloat(match[1]);
		let g = Number.parseFloat(match[2]);
		let b = Number.parseFloat(match[3]);
		return Color.create(r / 100, g / 100, b / 100, 1);
	}
	else if (match = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+(\.\d*)?)\)/.exec(str)) {
		let r = Number.parseFloat(match[1]);
		let g = Number.parseFloat(match[2]);
		let b = Number.parseFloat(match[3]);
		let a = Number.parseFloat(match[4]);
		return Color.create(r / 255, g / 255, b / 255, a);
	}
	else if (match = /^rgba\(\s*(\d+)%,\s*(\d+)%,\s*(\d+)%,\s*(\d+(\.\d*)?)\)/.exec(str)) {
		let r = Number.parseFloat(match[1]);
		let g = Number.parseFloat(match[2]);
		let b = Number.parseFloat(match[3]);
		let a = Number.parseFloat(match[4]);
		return Color.create(r / 100, g / 100, b / 100, a);
	}
	if (str in colors) {
		return colors[str];
	}
	return null;
}

function toHex2(num: number | string): string {
	if (typeof num == 'string') {
		num = parseInt(num);
	}
	let str = num.toString(16);
	if (str.length == 1) {
		str = '0' + str;
	}
	return str;
}

function toColorString(color: Color): string {
	if (color.alpha >= 1) {
		return `#${toHex2("" + color.red * 255)}${toHex2("" + color.green * 255)}${toHex2("" + color.blue * 255)}`;
	}
	else {
		return `rgba(${parseInt("" + color.red * 255)},${parseInt("" + color.green * 255)},${parseInt("" + color.blue * 255)},${color.alpha})`;
	}
}

connection.onDocumentColor(e => {
	let doc = documents.get(e.textDocument.uri);
	if (doc != null) {
		let colors: Array<ColorInformation> = [];
		let content = doc.getText();
		let modes = getModes(content);
		const cssDocument = getModeDocument(doc, content, modes, 'css');
		const styleSheet = cssLangService.parseStylesheet(cssDocument);
		const cssColorInformations = cssLangService.findDocumentColors(cssDocument, styleSheet);
		colors.push(...cssColorInformations);
		let token = buildActiveToken(connection, doc, content, 0);
		let index = 3;
		for (; index < token.all.length; index++) {
			if (token.all[index].type == TokenType.String && token.all[index - 1].type == TokenType.Equal) {
				let attrNameToken = getOwnerAttributeName(token.all, index);
				if (attrNameToken) {
					let attr = getTokenText(content, attrNameToken);
					if (attr in svg.attributes) {
						let svgAttr = svg.attributes[attr];
						if (svgAttr && svgAttr.type && /^(color|fill|stroke|paint)$/.test(svgAttr.type)) {
							let colorText = getTokenText(content, token.all[index]);
							let color = tryConvertColor(colorText.substring(1, colorText.length - 1));
							if (color) {
								colors.push(ColorInformation.create(createRange(doc, token.all[index], 1, -1), color));
							}
						}
					}
				}
			}
		}
		return colors;
	}
});

function isSameColor(colorStr: string, color: Color): boolean {
	let colorCov = tryConvertColor(colorStr);
	if (colorCov) {
		return colorCov.alpha == color.alpha && colorCov.blue == color.blue && colorCov.green == color.green && colorCov.red == color.red;
	} else {
		return false;
	}
}

connection.onColorPresentation(e => {
	let doc = documents.get(e.textDocument.uri);
	if (doc != null) {
		let currentStr = doc.getText(e.range);
		if (e.color) {
			if (!isSameColor(currentStr, e.color)) {
				let newString = toColorString(e.color);
				return [ColorPresentation.create(newString, TextEdit.replace(e.range, newString))];
			}
		}
	}
	return null;
});

documents.onDidClose(() => {

});

documents.onDidChangeContent(() => {
	// connection.console.log("onDidChangeContent");
});

documents.listen(connection);

connection.listen();
