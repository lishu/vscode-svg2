import {
	createConnection,
	TextDocuments,
	TextDocument,
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
	InsertTextFormat,
	MarkupKind
} from "vscode-languageserver";

import "process";

import { ISvgJsonRoot, ISvgJsonElement, ISvgJsonAttribute, SvgEnum } from "./svgjson";
import { getSvgJson } from "./svg";
import { buildActiveToken, getParentTagName, getOwnerTagName, getAllAttributeNames, getOwnerAttributeName, TokenType, Token } from "./token";

let svg:ISvgJsonRoot = getSvgJson('');
const svgDocUrl = {
	attribute: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/',
	element: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Element/'
};

function rgb(r:number, g:number, b:number) {
	return Color.create(r/255, g/255, b/255, 1);
}


const colors : {[name:string]:Color} = {
	"lightsalmon" : rgb(255,160,122),
	"salmon" : rgb(250,128,114),
	"darksalmon" : rgb(233,150,122),
	"lightcoral" : rgb(240,128,128),
	"indianred" : rgb(205,92,92),
	"crimson" : rgb(220,20,60),
	"firebrick" : rgb(178,34,34),
	"red" : rgb(255,0,0),
	"darkred" : rgb(139,0,0),
	"coral" : rgb(255,127,80),
	"tomato" : rgb(255,99,71),
	"orangered" : rgb(255,69,0),
	"gold" : rgb(255,215,0),
	"orange" : rgb(255,165,0),
	"darkorange" : rgb(255,140,0),
	"lightyellow" : rgb(255,255,224),
	"lemonchiffon" : rgb(255,250,205),
	"lightgoldenrodyellow" : rgb(250,250,210),
	"papayawhip" : rgb(255,239,213),
	"moccasin" : rgb(255,228,181),
	"peachpuff" : rgb(255,218,185),
	"palegoldenrod" : rgb(238,232,170),
	"khaki" : rgb(240,230,140),
	"darkkhaki" : rgb(189,183,107),
	"yellow" : rgb(255,255,0),
	"lawngreen" : rgb(124,252,0),
	"chartreuse" : rgb(127,255,0),
	"limegreen" : rgb(50,205,50),
	"lime" : rgb(0, 255, 0),
	"forestgreen" : rgb(34,139,34),
	"green" : rgb(0,128,0),
	"darkgreen" : rgb(0,100,0),
	"greenyellow" : rgb(173,255,47),
	"yellowgreen" : rgb(154,205,50),
	"springgreen" : rgb(0,255,127),
	"mediumspringgreen" : rgb(0,250,154),
	"lightgreen" : rgb(144,238,144),
	"palegreen" : rgb(152,251,152),
	"darkseagreen" : rgb(143,188,143),
	"mediumseagreen" : rgb(60,179,113),
	"seagreen" : rgb(46,139,87),
	"olive" : rgb(128,128,0),
	"darkolivegreen" : rgb(85,107,47),
	"olivedrab" : rgb(107,142,35),
	"lightcyan" : rgb(224,255,255),
	"cyan" : rgb(0,255,255),
	"aqua" : rgb(0,255,255),
	"aquamarine" : rgb(127,255,212),
	"mediumaquamarine" : rgb(102,205,170),
	"paleturquoise" : rgb(175,238,238),
	"turquoise" : rgb(64,224,208),
	"mediumturquoise" : rgb(72,209,204),
	"darkturquoise" : rgb(0,206,209),
	"lightseagreen" : rgb(32,178,170),
	"cadetblue" : rgb(95,158,160),
	"darkcyan" : rgb(0,139,139),
	"teal" : rgb(0,128,128),
	"powderblue" : rgb(176,224,230),
	"lightblue" : rgb(173,216,230),
	"lightskyblue" : rgb(135,206,250),
	"skyblue" : rgb(135,206,235),
	"deepskyblue" : rgb(0,191,255),
	"lightsteelblue" : rgb(176,196,222),
	"dodgerblue" : rgb(30,144,255),
	"cornflowerblue" : rgb(100,149,237),
	"steelblue" : rgb(70,130,180),
	"royalblue" : rgb(65,105,225),
	"blue" : rgb(0,0,255),
	"mediumblue" : rgb(0,0,205),
	"darkblue" : rgb(0,0,139),
	"navy" : rgb(0,0,128),
	"midnightblue" : rgb(25,25,112),
	"mediumslateblue" : rgb(123,104,238),
	"slateblue" : rgb(106,90,205),
	"darkslateblue" : rgb(72,61,139),
	"lavender" : rgb(230,230,250),
	"thistle" : rgb(216,191,216),
	"plum" : rgb(221,160,221),
	"violet" : rgb(238,130,238),
	"orchid" : rgb(218,112,214),
	"fuchsia" : rgb(255,0,255),
	"magenta" : rgb(255,0,255),
	"mediumorchid" : rgb(186,85,211),
	"mediumpurple" : rgb(147,112,219),
	"blueviolet" : rgb(138,43,226),
	"darkviolet" : rgb(148,0,211),
	"darkorchid" : rgb(153,50,204),
	"darkmagenta" : rgb(139,0,139),
	"purple" : rgb(128,0,128),
	"indigo" : rgb(75,0,130),
	"pink" : rgb(255,192,203),
	"lightpink" : rgb(255,182,193),
	"hotpink" : rgb(255,105,180),
	"deeppink" : rgb(255,20,147),
	"palevioletred" : rgb(219,112,147),
	"mediumvioletred" : rgb(199,21,133),
	"white" : rgb(255,255,255),
	"snow" : rgb(255,250,250),
	"honeydew" : rgb(240,255,240),
	"mintcream" : rgb(245,255,250),
	"azure" : rgb(240,255,255),
	"aliceblue" : rgb(240,248,255),
	"ghostwhite" : rgb(248,248,255),
	"whitesmoke" : rgb(245,245,245),
	"seashell" : rgb(255,245,238),
	"beige" : rgb(245,245,220),
	"oldlace" : rgb(253,245,230),
	"floralwhite" : rgb(255,250,240),
	"ivory" : rgb(255,255,240),
	"antiquewhite" : rgb(250,235,215),
	"linen" : rgb(250,240,230),
	"lavenderblush" : rgb(255,240,245),
	"mistyrose" : rgb(255,228,225),
	"gainsboro" : rgb(220,220,220),
	"lightgray" : rgb(211,211,211),
	"silver" : rgb(192,192,192),
	"darkgray" : rgb(169,169,169),
	"gray" : rgb(128,128,128),
	"dimgray" : rgb(105,105,105),
	"lightslategray" : rgb(119,136,153),
	"slategray" : rgb(112,128,144),
	"darkslategray" : rgb(47,79,79),
	"black" : rgb(0,0,0),
	"cornsilk" : rgb(255,248,220),
	"blanchedalmond" : rgb(255,235,205),
	"bisque" : rgb(255,228,196),
	"navajowhite" : rgb(255,222,173),
	"wheat" : rgb(245,222,179),
	"burlywood" : rgb(222,184,135),
	"tan" : rgb(210,180,140),
	"rosybrown" : rgb(188,143,143),
	"sandybrown" : rgb(244,164,96),
	"goldenrod" : rgb(218,165,32),
	"peru" : rgb(205,133,63),
	"chocolate" : rgb(210,105,30),
	"saddlebrown" : rgb(139,69,19),
	"sienna" : rgb(160,82,45),
	"brown" : rgb(165,42,42),
	"maroon" : rgb(128,0,0)
};

interface SVGSettings {
	completion : {
		showAdvanced : boolean;
		showDeprecated: boolean;
	};
}

const defaultSettings : SVGSettings = {
	completion : {
		showAdvanced : false,
		showDeprecated: false
	}
};
let langauge : string = '';
let globalSettings : SVGSettings = defaultSettings;
// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<SVGSettings>> = new Map();

let connection = createConnection(ProposedFeatures.all);

let documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
	let capabilities : ClientCapabilities = params.capabilities;

	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);

	return {
		capabilities: {
			textDocumentSync: documents.syncKind,
			completionProvider: {
				triggerCharacters: '<|.| |=|"'.split('|'),
				resolveProvider: true
			},
			hoverProvider: true,
			definitionProvider: true,
			referencesProvider: true,
			documentSymbolProvider: true,
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

});

connection.onNotification("_svg_init", p=>{
	if(p && p.language){
		langauge = p.language;
		if(langauge) {
			svg = getSvgJson(langauge.toLowerCase());
		}
	}
});

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <SVGSettings>(
			(change.settings.svg || defaultSettings)
		);
	}
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
	item : T;
	insertFullTag : boolean;
	uri: string;
	position:number;
}

function createCompletionFromElement(uri: string, position: number, name: string, element: ISvgJsonElement, insertFullTag: boolean) : CompletionItem
{
	let item : CompletionItem = {
		label : name,
		kind : CompletionItemKind.Module,
		commitCharacters: [' '],
		data : {
			item : element,
			insertFullTag,
			uri,
			position
		} 
	};
	return item;
}

function createCompletionFromAttribute(uri: string, position: number, attribute: ISvgJsonAttribute, insertFullTag: boolean) : CompletionItem
{
	let item : CompletionItem = {
		label : attribute.name,
		kind : CompletionItemKind.Property,
		data : {
			item : attribute,
			insertFullTag,
			uri,
			position
		} 
	};
	return item;
}

function createCompletionFromEnum(uri: string, position: number, svgEnum: SvgEnum, insertFullTag: boolean) : CompletionItem
{
	if(typeof svgEnum == "string") {
		svgEnum = {name: svgEnum, documentation: ''};
	}

	let item : CompletionItem = {
		label : svgEnum.name,
		kind : CompletionItemKind.Enum,
		data : {
			item : svgEnum,
			insertFullTag,
			uri,
			position
		} 
	};
	return item;
}

connection.onCompletion(async e =>{
	// connection.console.log("onCompletion " + e.textDocument.uri);
	let uri = e.textDocument.uri;
	let doc = documents.get(uri);
	if(doc) {
		let settings = await getDocumentSettings(doc.uri);
		let items = [];
		let content = doc.getText();
		let offset = doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc, content, offset);
		let triggerChar = offset > 0 ? content.charAt(offset - 1) : '';
		let nextChar = content.charAt(offset);
		if((triggerChar == '' || triggerChar == '=' || (triggerChar == '"' && nextChar == '"')) && token.token) {
			let ownerAttrName = getOwnerAttributeName(token.all, token.index);
			if(ownerAttrName) {
				let ownerAttr = content.substring(ownerAttrName.startIndex, ownerAttrName.endIndex);
				if(ownerAttr in svg.attributes){
					let attr = svg.attributes[ownerAttr];
					if(attr && attr.enum) {
						for(let se of attr.enum) {
							items.push(createCompletionFromEnum(uri, offset, se, triggerChar != '"'));
						}
					}
					if(attr && attr.type && /^(color|fill|stroke|paint)$/.test(attr.type))
					{
						for(let color in colors) {
							items.push({label: color, kind: CompletionItemKind.Color});
						}
					}
				}
			}
		}
		if((triggerChar == '' || triggerChar == ' ') && (token.token || token.prevToken)) {
			let ownerTagName = getOwnerTagName(token.all, token.token && token.token.index || token.prevToken!.index);
			if(ownerTagName) {
				let ownerTag = content.substring(ownerTagName.startIndex, ownerTagName.endIndex);
				let wirtedAttrs = getAllAttributeNames(content, token.all, ownerTagName.index + 1);
				let svgElement = svg.elements[ownerTag];
				if(svgElement && svgElement.attributes) {
					for(let attr of svgElement.attributes) {
						if(typeof attr == 'string') {
							if(attr in svg.attributes) {
								attr = svg.attributes[attr];
							}
							else {
								attr = {name: attr};
							}
						}
						let svgJson = <ISvgJsonAttribute>attr;
						if(wirtedAttrs.indexOf(svgJson.name.toUpperCase())>-1) continue;
						if(svgJson.advanced && !settings.completion.showAdvanced) {
							continue;
						}
						if(svgJson.deprecated && !settings.completion.showDeprecated) {
							continue;
						}
						items.push(createCompletionFromAttribute(uri, offset, svgJson, !/\s/.test(triggerChar)));
					}
				}
				return items;
			}
		}
		if((triggerChar == '' || triggerChar == '<') && token.index >= 2) {
			let ownerTagName = getParentTagName(token.all, token.index - (triggerChar == '<' ? 1 : 0));
			if(ownerTagName) {
				let ownerTag = content.substring(ownerTagName.startIndex, ownerTagName.endIndex);
				let svgElement = svg.elements[ownerTag];
				if(svgElement) {
					if(svgElement.subElements){
						for(let name of svgElement.subElements) {
							let element = svg.elements[name];
							if(element.advanced && !settings.completion.showAdvanced) {
								continue;
							}
							if(element.deprecated && !settings.completion.showDeprecated) {
								continue;
							}
							items.push(createCompletionFromElement(uri, offset, name, element, !triggerChar));
						}
					}
				}
			}
		}
		else if((triggerChar == '' || triggerChar == '<') && token.all.length <= 2) {
			// root svg element need
			let needTagStart = triggerChar != '<';
			let needTagEnd = nextChar != '>';
			items.push({
				kind: CompletionItemKind.Snippet, 
				label: 'SVG Root Element', 
				insertTextFormat: InsertTextFormat.Snippet,
				insertText: (needTagStart?"<":"") + 'svg xmlns="http://www.w3.org/2000/svg">\n\t$0\n</svg' + (needTagEnd?">":"")
			});
		}
		return items;
	}
});

function createDocumentation(item:CompletionItem, deprecated?:boolean|string,documentation?:string) : string|MarkupContent|undefined {
	let docUrlPart = '';
	if(item.kind == CompletionItemKind.Module) {
		docUrlPart = '\n\n[MDN Reference]('+ svgDocUrl.element + item.label +')';
	}
	else if(item.kind == CompletionItemKind.Property) {
		docUrlPart = '\n\n[MDN Reference]('+ svgDocUrl.attribute + item.label +')';
	}
	if(deprecated) {
		if(typeof deprecated == 'string') {
			if(documentation) {
				return {
					kind : MarkupKind.Markdown,
					value : '*Deprecated* - ' + MarkedString.fromPlainText(deprecated) + 
						'\n' + MarkedString.fromPlainText(documentation) + docUrlPart
				};
			}
			else{
				return {
					kind : MarkupKind.Markdown,
					value : '**Deprecated** - ' + MarkedString.fromPlainText(deprecated) + docUrlPart
				};
			}
		}
		else{
			if(documentation) {
				return {
					kind : MarkupKind.Markdown,
					value : '**Deprecated**\n' + MarkedString.fromPlainText(documentation) + docUrlPart
				};
			}
			else{
				return {
					kind : MarkupKind.Markdown,
					value : '**Deprecated**' + docUrlPart
				};
			}
		}
	}
	if(documentation) {
		return {
			kind : MarkupKind.Markdown,
			value : MarkedString.fromPlainText(documentation) + docUrlPart
		};
	}
	return {
		kind : MarkupKind.Markdown,
		value : docUrlPart.substring(1)
	};
}

connection.onCompletionResolve(item => {
	if(item.data) {
		if(item.kind == CompletionItemKind.Module) {
			let data : ICompletionData<ISvgJsonElement> = item.data;
			let svgElement: ISvgJsonElement = data.item;
			item.documentation = createDocumentation(item, svgElement.deprecated, svgElement.documentation);
			item.insertTextFormat = 2;
			let insertText : Array<string> = [];
			if(data.insertFullTag) {
				insertText.push("<");
			}
			insertText.push(item.label);
			let index = 1;
			if(svgElement.defaultAttributes) {
				for(var pn in svgElement.defaultAttributes) {
					let pv = svgElement.defaultAttributes[pn];
					insertText.push(` ${pn}="\${${index++}:${pv}}"`);
				}
			}
			if(svgElement.simple) {
				insertText.push("$0 />");
			}
			else {
				insertText.push(">\n\t$0\n</" + item.label + ">");
			}
			item.insertText = insertText.join('');
		}
		else if(item.kind == CompletionItemKind.Property) {
			let data : ICompletionData<ISvgJsonAttribute> = item.data;
			let svgAttr: ISvgJsonAttribute = data.item;
			item.documentation = createDocumentation(item, svgAttr.deprecated, svgAttr.documentation);
			item.insertTextFormat = 2;
			let insertText : Array<string> = [];
			if(data.insertFullTag) {
				insertText.push(' ');
			}
			insertText.push(item.label);
			insertText.push("=\"$0\"");
			if(svgAttr.enum || svgAttr.enums || (svgAttr.type && /^(color|fill|stroke|paint)$/.test(svgAttr.type))) {
				item.command = Command.create("Show Enum Completion List", "editor.action.triggerSuggest");
			}
			item.insertText = insertText.join('');
		}
		else if(item.kind == CompletionItemKind.Enum) {
			let data : ICompletionData<SvgEnum> = item.data;
			let svgEnum: SvgEnum = data.item;
			if(typeof svgEnum == 'string') {
				svgEnum = {name: svgEnum, documentation: ''};
			}
			item.documentation = svgEnum.documentation;
			if(data.insertFullTag) {
				item.insertText = `"${item.label}"`;
			}
		}
	}
	return item;
});

function replaceDocumentationToMarkedString(documentation:string, label?: string) : string | MarkedString | MarkupContent {
	if(label && label.toLowerCase() in svg.elements) {
		return {
			kind: MarkupKind.Markdown,
			//language: 'xml',
			value: MarkedString.fromPlainText(documentation) + '\n\n[MDN Reference]('+ svgDocUrl.element + label +')'
		};
	}
	if(label && label.toLowerCase() in svg.attributes) {
		return {
			kind: MarkupKind.Markdown,
			//language: 'xml',
			value: MarkedString.fromPlainText(documentation) + '\n\n[MDN Reference]('+ svgDocUrl.attribute + label +')'
		};
	}
	return MarkedString.fromPlainText(documentation);
}

connection.onHover(e=>{
	let doc = documents.get(e.textDocument.uri);
	if(doc){
		let offset =  doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc, doc.getText(), offset);
		if(token && token.token && (token.token.type == TokenType.TagName || token.token.type == TokenType.AttributeName)) {
			let content = doc.getText();
			// try find tag element
			if(token.token.type == TokenType.TagName) {
				var tagName = content.substring(token.token.startIndex, token.token.endIndex);
				var range = Range.create(
					doc.positionAt(token.token.startIndex),
					doc.positionAt(token.token.endIndex));
				if(tagName in svg.elements) {
					var tag = svg.elements[tagName];
					if(tag && tag.documentation) {
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
				if(ownerTagName)
				{
					var attrName = content.substring(token.token.startIndex, token.token.endIndex);
					var range = Range.create(
						doc.positionAt(token.token.startIndex),
						doc.positionAt(token.token.endIndex));
					if(attrName in svg.attributes) {
						var attr = svg.attributes[attrName];
						if(attr && attr.documentation) {
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

connection.onDefinition(e=>{
	let doc = documents.get(e.textDocument.uri);
	if(doc) {
		let content = doc.getText();
		let offset = doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc, content, offset);
		if(token && token.token && token.token.type == TokenType.String) {
			let val = content.substring(token.token.startIndex, token.token.endIndex);
			let urlMatch = val.match(/url\(#(.*?)\)/i);
			if(urlMatch && urlMatch.length) {
				let id = urlMatch[1];
				let idAttrStartIndex = content.indexOf(`id="${id}"`);
				if(idAttrStartIndex > -1) {
					let range = Range.create(doc.positionAt(idAttrStartIndex), doc.positionAt(idAttrStartIndex + 5 + id.length));
					return Location.create(e.textDocument.uri, range);
				}
			}
		}
	}
});

connection.onReferences(e=>{
	let doc = documents.get(e.textDocument.uri);
	if(doc) {
		let content = doc.getText();
		let offset = doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc, content, offset);
		if(token && token.token && token.token.type == TokenType.String && token.prevToken && token.prevToken.type == TokenType.Equal) {
			let ownerAttrName = getOwnerAttributeName(token.all, token.index);
			if(ownerAttrName) {
				let ownerAttr = content.substring(ownerAttrName.startIndex, ownerAttrName.endIndex);
				if(ownerAttr.toUpperCase() == "ID") {
					let id = content.substring(token.token.startIndex + 1, token.token.endIndex - 1);
					if(id) {
						let refRegx = /url\(#(.*?)\)/ig;
						let result : RegExpExecArray | null = null;
						let locations = [];
						while(result = refRegx.exec(content)) 
						{
							let start = doc.positionAt(result.index);
							let end = doc.positionAt(result.index + result[0].length);
							locations.push(Location.create(e.textDocument.uri, Range.create(start, end)));
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
	name? : string;
	end?: Token;
	parent?: ASTNODE | null;
	children: Array<ASTNODE>;
}

function buildAstTree(all: Array<Token>, content: string) {
	let node : ASTNODE = { children: [], parent: null};
	let root = node;
	let rp = 0; // 1 - starttag 2 - name 3 - endtag  4 - startendtag 5 - name 6 - endtag
	for(let t of all) {
		switch(t.type) {
			case TokenType.StartTag:
				rp = 1;
				node = {parent:node, children:[], start: t};
				node.parent!.children.push(node);
				break;
			case TokenType.TagName:
				if(rp == 1) {
					rp = 2;
					node.name = content.substring(t.startIndex, t.endIndex)	;
				} else if(rp == 4) {
					let endname = content.substring(t.startIndex, t.endIndex);
					if(endname == node.name) {
						rp = 5;
					}
				}
				break;
			case TokenType.StartEndTag:
				rp = 4;
				break;
			case TokenType.EndTag:
				if(rp == 2) {
					rp = 3;
				}
				else if(rp == 5) {
					rp = 6;
					node.end = t;
					if(node.parent) {
						node = node.parent;
					}
				}
				break;
			case TokenType.SimpleEndTag:
				node.end = t;
				if(node.parent) {
					node = node.parent;
				}
				break;
		}
	}
	return root;
}

function findAstNode(ast: ASTNODE, index: number) : ASTNODE | null {
	if(ast.children && ast.children.length){
		for(let child of ast.children) {
			let childFindNode = findAstNode(child, index);
			if(childFindNode) {
				return childFindNode;
			}
		}
	}
	if(ast.start && ast.end) {
		if(index >= ast.start.startIndex && index < ast.end.endIndex) {
			return ast;
		}
	}
	return null; 
}

function createRange(doc:TextDocument, token:Token, startOffset = 0, endOffset = 0) : Range
{
	return Range.create(doc.positionAt(token.startIndex + startOffset), doc.positionAt(token.endIndex + endOffset));
}

function getTokenText(content: string, token:Token) {
	return content.substring(token.startIndex, token.endIndex);
}

connection.onDocumentSymbol(e=>{
	let doc = documents.get(e.textDocument.uri);
	if(doc) {
		let content = doc.getText();
		let token = buildActiveToken(connection, doc, content, 0);
		let root = buildAstTree(token.all, content);

		let result : Array<DocumentSymbol> = [];

		function buildResult(symbols:Array<DocumentSymbol>, nodes:Array<ASTNODE>) {
			for(let node of nodes) {
				if(node.start && node.end) {
					let range = Range.create(doc!.positionAt(node.start.startIndex), doc!.positionAt(node.end.endIndex));
					let symbol : DocumentSymbol = {
						name: '' + node.name,
						kind: SymbolKind.Module,
						range: range,
						selectionRange : Range.create(range.start, range.start)
					};
					if(node.children.length) {
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
	let changes:Array<TextEdit> = [];

	let idRegex = /id="(.+?)"/gi;
	let re : RegExpExecArray|null = null;
	while(re = idRegex.exec(content)) {
		if(re[1] == oldId) {
			changes.push(TextEdit.replace(Range.create(doc.positionAt(re.index + 4), doc.positionAt(re.index + 4 + oldId.length)), newId));
		}
	}
	idRegex = /url\(#(.+?)\)/gi;
	while(re = idRegex.exec(content)) {
		if(re[1] == oldId) {
			changes.push(TextEdit.replace(Range.create(doc.positionAt(re.index + 5), doc.positionAt(re.index + 5 + oldId.length)), newId));
		}
	}

	let result : WorkspaceEdit = {changes: {}};
	result.changes![doc.uri] = changes;
	return result;
}

connection.onRenameRequest(e=>{
	let doc = documents.get(e.textDocument.uri);
	if(doc) {
		let content = doc.getText();
		let offset = doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc, content, offset);
		if(token && token.token && token.prevToken) {
			if(token.token.type == TokenType.TagName || token.token.type == TokenType.AttributeName) {
				let ast = buildAstTree(token.all, content);
				let node = findAstNode(ast, token.token.startIndex);
				if(node) {
					let changes:Array<TextEdit> = [];
					let startTagName = token.all[node.start!.index + 1];
					changes.push(TextEdit.replace(createRange(doc, startTagName), e.newName));

					if(node.end && node.end.type == TokenType.EndTag) {
						let endTagName = token.all[node.end.index - 1];
						if(endTagName.type == TokenType.TagName) {
							changes.push(TextEdit.replace(createRange(doc, endTagName), e.newName));
						}
					}

					let result : WorkspaceEdit = {changes: {}};
					result.changes![e.textDocument.uri] = changes;
					return result;
				}
			}
			if(token.token.type == TokenType.String && token.prevToken.type == TokenType.Equal) {
				if(token.prevToken.index > 0) {
					let attrVal = getTokenText(content, token.token);
					let attNameToken = token.all[token.prevToken.index - 1];
					if(getTokenText(content, attNameToken).toUpperCase() == "ID") {
						return renameID(doc, content, attrVal.substr(1, attrVal.length - 2), e.newName);
					}
					let idUrlMatch = attrVal.match(/url\(#(.+?)\)/i);
					if(idUrlMatch && idUrlMatch.length > 1) {
						return renameID(doc, content, idUrlMatch[1], e.newName);
					}
				}
			}
		}
	}
	return null;
});

connection.onPrepareRename(e=>{
	let doc = documents.get(e.textDocument.uri);
	if(doc) {
		let content = doc.getText();
		let offset = doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc, content, offset);
		if(token && token.token && token.prevToken) {
			if(token.token.type == TokenType.TagName) {
				if(token.prevToken.type == TokenType.StartTag) {
					return createRange(doc, token.token);
				}
				else if(token.prevToken.type == TokenType.StartEndTag) {
					return createRange(doc, token.token);
				}
			}
			if(token.token.type == TokenType.String && token.prevToken.type == TokenType.Equal) {
				if(token.prevToken.index > 0) {
					let attNameToken = token.all[token.prevToken.index - 1];
					if(getTokenText(content, attNameToken).toUpperCase() == "ID") {
						return createRange(doc, token.token, 1, -1);
					}
					let attrVal = getTokenText(content, token.token);
					let idUrlMatch = attrVal.match(/url\(#(.+?)\)/i);
					if(idUrlMatch && idUrlMatch.length > 1) {
						let endIndex = token.token.startIndex + idUrlMatch.index! + idUrlMatch[0].length - 1;
						return createRange(doc, token.token, idUrlMatch.index! + 5, endIndex - token.token.endIndex);
					}
				}
			}
		}
	}
});

function tryConvertColor(str: string) : Color | null {
	if(str.length <= 2) return null;
	let match : RegExpExecArray|null = null;
	if(/^#[0-9A-Fa-f]{3}$/.test(str)) {
		let r = Number.parseInt(str.substr(1, 1), 16);
		let g = Number.parseInt(str.substr(2, 1), 16);
		let b = Number.parseInt(str.substr(3, 1), 16);
		r = r * 17;
		g = g * 17;
		b = b * 17;
		return Color.create(r/255, g/255, b/255, 1);
	}
	else if(/^#[0-9A-Fa-f]{6}$/.test(str)) {
		let r = Number.parseInt(str.substr(1, 2), 16);
		let g = Number.parseInt(str.substr(3, 2), 16);
		let b = Number.parseInt(str.substr(5, 2), 16);
		return Color.create(r/255, g/255, b/255, 1);
	}
	else if(match = /^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\)/.exec(str)) {
		let r = Number.parseInt(match[1]);
		let g = Number.parseInt(match[2]);
		let b = Number.parseInt(match[3]);
		return Color.create(r/255, g/255, b/255, 1);
	}
	else if(match = /^rgb\(\s*(\d+)%,\s*(\d+)%,\s*(\d+)%\)/.exec(str)) {
		let r = Number.parseFloat(match[1]);
		let g = Number.parseFloat(match[2]);
		let b = Number.parseFloat(match[3]);
		return Color.create(r/100, g/100, b/100, 1);
	}
	else if(match = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+(\.\d*)?)\)/.exec(str)) {
		let r = Number.parseFloat(match[1]);
		let g = Number.parseFloat(match[2]);
		let b = Number.parseFloat(match[3]);
		let a = Number.parseFloat(match[4]);
		return Color.create(r/255, g/255, b/255, a);
	}
	else if(match = /^rgba\(\s*(\d+)%,\s*(\d+)%,\s*(\d+)%,\s*(\d+(\.\d*)?)\)/.exec(str)) {
		let r = Number.parseFloat(match[1]);
		let g = Number.parseFloat(match[2]);
		let b = Number.parseFloat(match[3]);
		let a = Number.parseFloat(match[4]);
		return Color.create(r/100, g/100, b/100, a);
	}
	if(str in colors) {
		return colors[str];
	}
	return null;
}

function toHex2(num: number | string) : string {
	if(typeof num == 'string') {
		num = parseInt(num);
	}
	let str = num.toString(16);
	if(str.length == 1) {
		str = '0' + str;
	}
	return str;
}

function toColorString(color:Color) : string {
	if(color.alpha >= 1) {
		return `#${toHex2(""+color.red*255)}${toHex2(""+color.green*255)}${toHex2(""+color.blue*255)}`;
	}
	else {
		return `rgba(${parseInt(""+color.red*255)},${parseInt(""+color.green*255)},${parseInt(""+color.blue*255)},${color.alpha})`;
	}
}

connection.onDocumentColor(e=>{
	let doc = documents.get(e.textDocument.uri);
	if(doc != null) {
		let content = doc.getText();
		let token = buildActiveToken(connection, doc, content, 0);
		let colors : Array<ColorInformation> = [];
		let index = 3;
		for(;index < token.all.length; index++) {
			if(token.all[index].type == TokenType.String && token.all[index - 1].type == TokenType.Equal) {
				let attrNameToken = getOwnerAttributeName(token.all, index);
				if(attrNameToken) {
					let attr = getTokenText(content, attrNameToken);
					if(attr in svg.attributes) {
						let svgAttr = svg.attributes[attr];
						if(svgAttr && svgAttr.type && /^(color|fill|stroke|paint)$/.test(svgAttr.type))
						{
							let colorText = getTokenText(content, token.all[index]);
							let color = tryConvertColor(colorText.substring(1, colorText.length - 1));
							if(color) {
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

function isSameColor(colorStr: string, color: Color) : boolean
{
	let colorCov = tryConvertColor(colorStr);
	if(colorCov) {
		return colorCov.alpha == color.alpha && colorCov.blue == color.blue && colorCov.green == color.green && colorCov.red == color.red;
	} else {
		return false;
	}
}

connection.onColorPresentation(e=>{
	let doc = documents.get(e.textDocument.uri);
	if(doc != null) {
		let currentStr = doc.getText(e.range);
		if(e.color){
			if(!isSameColor(currentStr, e.color)) {
				let newString = toColorString(e.color);
				return [ColorPresentation.create(newString, TextEdit.replace(e.range, newString))];
			}
		}
	}
	return null;
});

connection.onDidChangeConfiguration(() => {
	connection.console.log("onDidChangeConfiguration");
});

documents.onDidClose(() => {
	
});

documents.onDidChangeContent(() => {
	// connection.console.log("onDidChangeContent");
});

documents.listen(connection);

connection.listen();
