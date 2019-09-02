import {
	createConnection,
	TextDocuments,
	TextDocument,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	ClientCapabilities,
	Command,
	Hover,
	Range,
	Position,
	MarkedString,
	MarkupContent,
	Location,
	DocumentSymbol,
	SymbolKind,
	WorkspaceEdit,
	TextEdit
} from "vscode-languageserver";

import { ISvgJson, ISvgJsonElement, ISvgJsonAttribute, SvgEnum } from "./svgjson";
import { getSvgJson } from "./svg";
import { buildActiveToken, getParentTagName, getOwnerTagName, getAllAttributeNames, getOwnerAttributeName, TokenType, Token } from "./token";

let svg:ISvgJson = getSvgJson('');

const colorNames = 'aliceblue,antiquewhite,aqua,aquamarine,azure,beige,bisque,black,blanchedalmond,blue,blueviolet,brown,burlywood,cadetblue,chartreuse,chocolate,coral,cornflowerblue,cornsilk,crimson,cyan,darkblue,darkcyan,darkgoldenrod,darkgray,darkgreen,darkgrey,darkkhaki,darkmagenta,darkolivegreen,darkorange,darkorchid,darkred,darksalmon,darkseagreen,darkslateblue,darkslategray,darkslategrey,darkturquoise,darkviolet,deeppink,deepskyblue,dimgray,dimgrey,dodgerblue,firebrick,floralwhite,forestgreen,fuchsia,gainsboro,ghostwhite,gold,goldenrod,gray,grey,green,greenyellow,honeydew,hotpink,indianred,indigo,ivory,khaki,lavender,lavenderblush,lawngreen,lemonchiffon,lightblue,lightcoral,lightcyan,lightgoldenrodyellow,lightgray,lightgreen,lightgrey,lightpink,lightsalmon,lightseagreen,lightskyblue,lightslategray,lightslategrey,lightsteelblue,lightyellow,lime,limegreen,linen,magenta,maroon,mediumaquamarine,mediumblue,mediumorchid,mediumpurple,mediumseagreen,mediumslateblue,mediumspringgreen,mediumturquoise,mediumvioletred,midnightblue,mintcream,mistyrose,moccasin,navajowhite,navy,oldlace,olive,olivedrab,orange,orangered,orchid,palegoldenrod,palegreen,paleturquoise,palevioletred,papayawhip,peachpuff,peru,pink,plum,powderblue,purple,red,rosybrown,royalblue,saddlebrown,salmon,sandybrown,seagreen,seashell,sienna,silver,skyblue,slateblue,slategray,slategrey,snow,springgreen,steelblue,tan,teal,thistle,tomato,turquoise,violet,wheat,white,whitesmoke,yellow,yellowgreen'.split(',');

let connection = createConnection(ProposedFeatures.all);

let documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
	let capabilities : ClientCapabilities = params.capabilities;

	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
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
			}
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

connection.onCompletion(e =>{
	// connection.console.log("onCompletion " + e.textDocument.uri);
	let uri = e.textDocument.uri;
	let doc = documents.get(uri);
	if(doc) {
		let items = [];
		let content = doc.getText();
		let offset = doc.offsetAt(e.position);
		let token = buildActiveToken(connection, content, offset);
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
						for(let color of colorNames) {
							items.push({label: color, kind: CompletionItemKind.Color});
						}
					}
				}
			}
		}
		if((triggerChar == '' || triggerChar == ' ') && token.token) {
			let ownerTagName = getOwnerTagName(token.all, token.index);
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
						items.push(createCompletionFromAttribute(uri, offset, svgJson, !/\s/.test(triggerChar)));
					}
				}
				return items;
			}
		}
		if((triggerChar == '' || triggerChar == '<') && token.prevToken) {
			let ownerTagName = getParentTagName(token.all, token.index - 2);
			if(ownerTagName) {
				let ownerTag = content.substring(ownerTagName.startIndex, ownerTagName.endIndex);
				let svgElement = svg.elements[ownerTag];
				if(svgElement) {
					if(svgElement.subElements){
						for(let name of svgElement.subElements) {
							items.push(createCompletionFromElement(uri, offset, name, svg.elements[name], !triggerChar));
						}
					}
				}
			}
		}
		return items;
	}
});

connection.onCompletionResolve(item => {
	if(item.data) {
		if(item.kind == CompletionItemKind.Module) {
			let data : ICompletionData<ISvgJsonElement> = item.data;
			let svgElement: ISvgJsonElement = data.item;
			item.documentation = svgElement.documentation;
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
				insertText.push(" $0/>");
			}
			else {
				insertText.push(">\n\t$0\n</" + item.label + ">");
			}
			item.insertText = insertText.join('');
		}
		else if(item.kind == CompletionItemKind.Property) {
			let data : ICompletionData<ISvgJsonAttribute> = item.data;
			let svgAttr: ISvgJsonAttribute = data.item;
			item.documentation = svgAttr.documentation;
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

function replaceDocumentationToMarkedString(documentation:string) {
	var text = documentation.replace(/<>/g, '`');
	return MarkedString.fromPlainText(text);
}

connection.onHover(e=>{
	let doc = documents.get(e.textDocument.uri);
	if(doc){
		let offset =  doc.offsetAt(e.position);
		let token = buildActiveToken(connection, doc.getText(), offset);
		if(token && token.token && token.token.type == TokenType.Name) {
			let content = doc.getText();
			// try find tag element
			if(token.prevToken && (token.prevToken.type == TokenType.StartTag || token.prevToken.type == TokenType.StartEndTag)) {
				var tagName = content.substring(token.token.startIndex, token.token.endIndex);
				var range = Range.create(
					doc.positionAt(token.token.startIndex),
					doc.positionAt(token.token.endIndex));
				if(tagName in svg.elements) {
					var tag = svg.elements[tagName];
					if(tag && tag.documentation) {
						return {
							contents: replaceDocumentationToMarkedString(tag.documentation),
							range
						};
					}
				}
			}
			// try find tag attribute
			else if(token.prevToken) {
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
								contents: replaceDocumentationToMarkedString(attr.documentation),
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
		let token = buildActiveToken(connection, content, offset);
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
		let token = buildActiveToken(connection, content, offset);
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
			case TokenType.Name:
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
		let token = buildActiveToken(connection, content, 0);
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
		let token = buildActiveToken(connection, content, offset);
		if(token && token.token && token.prevToken) {
			if(token.token.type == TokenType.Name) {
				let ast = buildAstTree(token.all, content);
				let node = findAstNode(ast, token.token.startIndex);
				if(node) {
					let changes:Array<TextEdit> = [];
					let startTagName = token.all[node.start!.index + 1];
					changes.push(TextEdit.replace(createRange(doc, startTagName), e.newName));

					if(node.end && node.end.type == TokenType.EndTag) {
						let endTagName = token.all[node.end.index - 1];
						if(endTagName.type == TokenType.Name) {
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
		let token = buildActiveToken(connection, content, offset);
		if(token && token.token && token.prevToken) {
			if(token.token.type == TokenType.Name) {
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

connection.onDidChangeConfiguration(change => {
	connection.console.log("onDidChangeConfiguration");
});

documents.onDidClose(e => {
	
});

documents.onDidChangeContent(change => {
	// connection.console.log("onDidChangeContent");
});

documents.listen(connection);

connection.listen();
