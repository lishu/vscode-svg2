// Path data hightlight support

import { window, Range, TextDocument, TextEditorDecorationType, Disposable, workspace, Position, TextEditor, DecorationRangeBehavior, OverviewRulerLane, TextDocumentChangeEvent, ConfigurationChangeEvent } from 'vscode';
import { parsePath, PathDataToken, PathDataTokenType, PathDataCommand, PathDataCommandItem } from './path-grammar';

let PathCommandType, PathStopPointType : TextEditorDecorationType;
let disposables: Disposable[] = [];
let pathDataHighlight : boolean | null = null;

const defaultColors = {
    command : '#99f',
    stopPoint: '#f0f',
};

console.log('pdl.ts', __dirname);

function onDidChangeVisibleTextEditors(editors: TextEditor[]) {
    for(let editor of editors) {
        if(editor.document.languageId == 'svg') {
            handlePathDataHightlight(editor);
        }
    }
}

function createRange(doc:TextDocument, pathDataOffset: number, token : PathDataToken) {
    return new Range(doc.positionAt(pathDataOffset + token.start), doc.positionAt(pathDataOffset + token.end));
}

function addStopRanges(doc: TextDocument, ranges: Array<Range>, node: PathDataCommandItem, start: number, stepLen: number, pathDataOffset: number) {
    for(let s = 0; s < node.args.length; s += stepLen) {
        for(let i = s + start; i < node.args.length && i < s + stepLen; i++) {
            let token = node.args[i];
            ranges.push(new Range(doc.positionAt(pathDataOffset + token.start), doc.positionAt(pathDataOffset + token.end)));
        }
    }
}

function handlePathDataHightlight(editor: TextEditor) {
    if(pathDataHighlight === null) {
        let svg = workspace.getConfiguration('svg');
        pathDataHighlight = svg.pathDataHighlight;
    }
    if(!pathDataHighlight) {
        editor.setDecorations(PathCommandType, []);
        editor.setDecorations(PathStopPointType, []);
        return;
    }
    let content = editor.document.getText();
    let pathDataAttrRegex = /<(path|glyph|missing-glyph)[^>]*d\s*=\"([^\"]+)/g;
    let r: RegExpExecArray;

    let commandRanges = [];
    let stopRanges = [];

    while(r = pathDataAttrRegex.exec(content)) {
        if(r.length > 2) {
            let pathData = r[2];
            let pathDataOffset = content.indexOf(pathData, r.index);
            let ast = parsePath(pathData);
            for(let node of ast) {
                commandRanges.push(createRange(editor.document, pathDataOffset, node.command));
                switch(node.commandType) {
                    case PathDataCommand.MovetoAbs:
                    case PathDataCommand.MovetoRel:
                    case PathDataCommand.LinetoAbs:
                    case PathDataCommand.LinetoRel:
                    case PathDataCommand.LinetoHorizontalAbs:
                    case PathDataCommand.LinetoHorizontalRel:
                    case PathDataCommand.LinetoVerticalAbs:
                    case PathDataCommand.LinetoVerticalRel:
                    case PathDataCommand.CurvetoQuadraticSmoothAbs:
                    case PathDataCommand.CurvetoQuadraticSmoothRel:
                        addStopRanges(editor.document, stopRanges, node, 0, 1, pathDataOffset);
                        break;
                    case PathDataCommand.ArcAbs:
                    case PathDataCommand.ArcRel:
                        addStopRanges(editor.document, stopRanges, node, 5, 7, pathDataOffset);
                        break;
                    case PathDataCommand.CurvetoCubicAbs:
                    case PathDataCommand.CurvetoCubicRel:
                        addStopRanges(editor.document, stopRanges, node, 4, 6, pathDataOffset);
                        break;
                    case PathDataCommand.CurvetoQuadraticAbs:
                    case PathDataCommand.CurvetoQuadraticRel:
                        addStopRanges(editor.document, stopRanges, node, 2, 4, pathDataOffset);
                        break;
                    case PathDataCommand.CurvetoCubicSmoothAbs:
                    case PathDataCommand.CurvetoCubicSmoothRel:
                        addStopRanges(editor.document, stopRanges, node, 2, 4, pathDataOffset);
                        break;
                }
            }
        }
    }
    editor.setDecorations(PathCommandType, commandRanges);
    editor.setDecorations(PathStopPointType, stopRanges);
}

function onDidChangeTextDocument(e: TextDocumentChangeEvent) {
    let editor = window.visibleTextEditors.find(d=>d.document.uri.toString() == e.document.uri.toString());
    if(editor) {
        handlePathDataHightlight(editor);
    }
}

function updatePathDataHighlightFromConfiguration() {
    let svg = workspace.getConfiguration('svg');
    pathDataHighlight = svg.pathDataHighlight;
}

function onDidChangeConfiguration(e:ConfigurationChangeEvent) {
    if(e.affectsConfiguration('svg')) {
        updatePathDataHighlightFromConfiguration();
        onDidChangeVisibleTextEditors(window.visibleTextEditors);
    }
}

export function registerPathDataHightlightProvider() : Disposable
{
    disposables.push(
        PathCommandType = window.createTextEditorDecorationType({color: defaultColors.command, fontWeight: 'bold', rangeBehavior: DecorationRangeBehavior.ClosedClosed, overviewRulerLane: OverviewRulerLane.Full}),
        PathStopPointType = window.createTextEditorDecorationType({color: defaultColors.stopPoint, rangeBehavior: DecorationRangeBehavior.ClosedClosed, overviewRulerLane: OverviewRulerLane.Full}),
        workspace.onDidChangeConfiguration(onDidChangeConfiguration),
        window.onDidChangeVisibleTextEditors(onDidChangeVisibleTextEditors),
        workspace.onDidChangeTextDocument(onDidChangeTextDocument)
        );

    onDidChangeVisibleTextEditors(window.visibleTextEditors);

    return {
        dispose : ()=> {
            disposables.forEach(d=>d.dispose());
        }
    };
}