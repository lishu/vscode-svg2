import SVGO = require("svgo");
import path = require('path');
import fs = require('fs');
import { window, TextDocument, FormattingOptions, CancellationToken, ProviderResult, Range, TextEdit, DocumentFormattingEditProvider, Position, TextEditor, TextEditorEdit, Uri, workspace } from "vscode";

const formatPlugins: Array<SVGO.PluginConfig> = [{
        cleanupAttrs: false 
    }, {
        removeDoctype: false,
    }, {
        removeXMLProcInst: false,
    }, {
        removeComments: false,
    }, {
        removeMetadata: false,
    }, {
        removeTitle: false,
    }, {
        removeDesc: false,
    }, {
        removeUselessDefs: false,
    }, {
        removeEditorsNSData: false,
    }, {
        removeEmptyAttrs: false,
    }, {
        removeHiddenElems: false,
    }, {
        removeEmptyText: false,
    }, {
        removeEmptyContainers: false,
    }, {
        removeViewBox: false,
    }, {
        cleanupEnableBackground: false,
    }, {
        convertStyleToAttrs: false,
    }, {
        convertColors: false,
    }, {
        convertPathData: false,
    }, {
        convertTransform: false,
    }, {
        removeUnknownsAndDefaults: false,
    }, {
        removeNonInheritableGroupAttrs: false,
    }, {
        removeUselessStrokeAndFill: false,
    }, {
        removeUnusedNS: false,
    }, {
        cleanupIDs: false,
    }, {
        cleanupNumericValues: false,
    }, {
        moveElemsAttrsToGroup: false,
    }, {
        moveGroupAttrsToElems: false,
    }, {
        collapseGroups: false,
    }, {
        removeRasterImages: false,
    }, {
        mergePaths: false,
    }, {
        convertShapeToPath: false,
    }, {
        sortAttrs: false,
    }, {
        removeDimensions: false,
    }, {
        removeAttrs: false,
    }
];

interface ConfigurationMinifyPlugins {
    cleanupAttrs : boolean;
    inlineStyles: boolean;
}

const defaultMinifyPlugins : ConfigurationMinifyPlugins = {
    cleanupAttrs: true,
    inlineStyles: true,
};

function getFullRange(doc: TextDocument) {
    let length = doc.getText().length;
    return new Range(new Position(0, 0), doc.positionAt(length));
}

export function svgMinify(textEditor: TextEditor, edit: TextEditorEdit) {
    if(textEditor.document.languageId == 'svg'){
        let cplugins = workspace.getConfiguration('svg').get<ConfigurationMinifyPlugins>('minify', defaultMinifyPlugins);
        let plugins : Array<SVGO.PluginConfig> = [];
        for(let cp in cplugins) {
            if(typeof cplugins[cp] == 'boolean') {
                let op = {};
                op[cp] = cplugins[cp];
                plugins.push(<SVGO.PluginConfig>op);
            }
        }
        let svgo = new SVGO({
            plugins
        });
        svgo.optimize(textEditor.document.getText()).then(r=>{
            if(r.data) {
                if(textEditor.viewColumn == undefined) {
                    // is not a visable editor, try output a min.svg file and open it.
                    if(textEditor.document.uri.scheme == 'file') {
                        let fsPath = textEditor.document.uri.fsPath;
                    }
                }
                else {
                    textEditor.edit(edit=>edit.replace(getFullRange(textEditor.document), r.data));
                }
            }
        }).catch(reason=>{
            window.showErrorMessage('Failed to minify the document.\n' + reason);
        });
    }
}

export class SvgFormattingProvider implements DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]> {
        let svgo = new SVGO({
            plugins: formatPlugins,
            js2svg: { pretty: true, indent: <number>window.activeTextEditor.options.tabSize }
        });
        return svgo.optimize(document.getText()).then(r => {
            if(r.data) {
                return [TextEdit.replace(getFullRange(document), r.data)];
            }
            return null;
        }).catch(reason=>{
            window.showErrorMessage('Failed to format the document.\n' + reason);
            return null;
        });
    }

}
