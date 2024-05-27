import SVGO = require("svgo");
import fs = require('fs');
import { window, TextDocument, FormattingOptions, CancellationToken, ProviderResult, Range, TextEdit, DocumentFormattingEditProvider, Position, ExtensionContext, TextEditor, TextEditorEdit, Uri, workspace, env, ConfigurationTarget } from "vscode";
import { changeName } from "./unit";

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
}, {
    inlineStyles: false
} as any, {
    minifyStyles: false
}
];

interface ConfigurationMinifyPlugins {
    cleanupAttrs: boolean | object;
    inlineStyles: boolean | object;
    removeDoctype: boolean | object;
    removeXMLProcInst: boolean | object;
    removeComments: boolean | object;
    removeMetadata: boolean | object;
    removeTitle: boolean | object;
    removeDesc: boolean | object;
    removeUselessDefs: boolean | object;
    removeXMLNS: boolean | object;
    removeEditorsNSData: boolean | object;
    removeEmptyAttrs: boolean | object;
    removeHiddenElems: boolean | object;
    removeEmptyText: boolean | object;
    removeEmptyContainers: boolean | object;
    removeViewBox: boolean | object;
    cleanupEnableBackground: boolean | object;
    minifyStyles: boolean | object;
    convertStyleToAttrs: boolean | object;
    convertColors: boolean | object;
    convertPathData: boolean | object;
    convertTransform: boolean | object;
    removeUnknownsAndDefaults: boolean | object;
    removeNonInheritableGroupAttrs: boolean | object;
    removeUselessStrokeAndFill: boolean | object;
    removeUnusedNS: boolean | object;
    prefixIds: boolean | object;
    cleanupIDs: boolean | object;
    cleanupNumericValues: boolean | object;
    cleanupListOfValues: boolean | object;
    moveElemsAttrsToGroup: boolean | object;
    moveGroupAttrsToElems: boolean | object;
    collapseGroups: boolean | object;
    removeRasterImages: boolean | object;
    mergePaths: boolean | object;
    convertShapeToPath: boolean | object;
    convertEllipseToCircle: boolean | object;
    sortAttrs: boolean | object;
    sortDefsChildren: boolean | object;
    removeDimensions: boolean | object;
    removeAttrs: boolean | object;
    removeAttributesBySelector: boolean | object;
    removeElementsByAttr: boolean | object;
    addClassesToSVGElement: boolean | object;
    addAttributesToSVGElement: boolean | object;
    removeOffCanvasPaths: boolean | object;
    removeStyleElement: boolean | object;
    removeScriptElement: boolean | object;
    reusePaths: boolean | object;
}

const defaultMinifyPlugins: ConfigurationMinifyPlugins = {
    cleanupAttrs: true,
    inlineStyles: true,
    removeDoctype: true,
    removeXMLProcInst: true,
    removeComments: true,
    removeMetadata: true,
    removeTitle: true,
    removeDesc: true,
    removeUselessDefs: true,
    removeXMLNS: true,
    removeEditorsNSData: true,
    removeEmptyAttrs: true,
    removeHiddenElems: true,
    removeEmptyText: true,
    removeEmptyContainers: true,
    removeViewBox: true,
    cleanupEnableBackground: true,
    minifyStyles: true,
    convertStyleToAttrs: true,
    convertColors: true,
    convertPathData: true,
    convertTransform: true,
    removeUnknownsAndDefaults: true,
    removeNonInheritableGroupAttrs: true,
    removeUselessStrokeAndFill: true,
    removeUnusedNS: true,
    prefixIds: true,
    cleanupIDs: true,
    cleanupNumericValues: true,
    cleanupListOfValues: true,
    moveElemsAttrsToGroup: true,
    moveGroupAttrsToElems: true,
    collapseGroups: true,
    removeRasterImages: false,
    mergePaths: true,
    convertShapeToPath: true,
    convertEllipseToCircle: true,
    sortAttrs: false,
    sortDefsChildren: true,
    removeDimensions: false,
    removeAttrs: false,
    removeAttributesBySelector: false,
    removeElementsByAttr: false,
    addClassesToSVGElement: false,
    addAttributesToSVGElement: false,
    removeOffCanvasPaths: false,
    removeStyleElement: false,
    removeScriptElement: false,
    reusePaths: false,
};

function getFullRange(doc: TextDocument) {
    let length = doc.getText().length;
    return new Range(new Position(0, 0), doc.positionAt(length));
}

export function svgMinifyToFile(context: ExtensionContext, uri: Uri) {
    if (uri && uri.fsPath) {
        showMinifyWarning(context, ()=>{
            let newUri = changeName(uri, (n, e) => n + '.min' + e);
            fs.readFile(uri.fsPath, { encoding: 'utf8' }, (e, data) => {
                if (data) {
                    let svgo = createMinifySVGO();
                    svgo.optimize(data)
                        .then(r => {
                            if (r.data) {
                                fs.writeFile(newUri.fsPath, r.data, { encoding: 'utf8' }, err => {
                                    if (!err) {
                                        workspace.openTextDocument(newUri).then(doc => {
                                            window.showTextDocument(doc);
                                        });
                                    }
                                });
                            }
                        });
                }
            });
        });
    }
}

function createMinifySVGO() {
    let cplugins = workspace.getConfiguration('svg').get<ConfigurationMinifyPlugins>('minify', defaultMinifyPlugins);
    let plugins: Array<SVGO.PluginConfig> = [];
    for (let cp in cplugins) {
        if (typeof(cplugins[cp]) == 'boolean' || typeof(cplugins[cp]) == 'object') {
            let op = {};
            op[cp] = cplugins[cp];
            plugins.push(<SVGO.PluginConfig>op);
        }
    }
    return new SVGO({
        plugins
    });
}

export function copyDataUri(textEditor: TextEditor, edit: TextEditorEdit) {
    if (textEditor.document.languageId == 'svg') {
        let svgo = createMinifySVGO();
        svgo.optimize(textEditor.document.getText()).then(r => {
            if (r.data) {
                // 转换为 base64
                let s = 'data:image/svg+xml;base64,' + Buffer.from(r.data).toString('base64');
                env.clipboard.writeText(s);
            }
        }).catch(reason => {
            window.showErrorMessage('Failed to minify the document.\n' + reason);
        });
    }
}

declare module 'vscode' {
    interface MessageOptions {
        detail?: string;
    }
}

function showMinifyWarning(context: ExtensionContext, fn: Function) {
    if(context.workspaceState.get('svg.skipMinifyWarning', false)) {
        fn();
        return;
    }
    window.showWarningMessage('[SVG] Irreversibly broken warning, Backup your svg!', {
        modal: true,
        detail: 'There have been multiple reports that the minimization feature may break your SVG, and we are still looking for a better library replacement for SVGO, so back up your SVG documentation when using the minimize feature.'
    }, {title: 'OK'}, {title: 'OK, Needless to say'}, {title: 'Cancel', isCloseAffordance: true})
    .then(r => {
        if(r && r.title.startsWith("OK")) {
            if(r.title === 'OK, Needless to say') {
                context.workspaceState.update('svg.skipMinifyWarning', true);
            }
            fn();
        }
    })
}

export function svgMinify(context: ExtensionContext, textEditor: TextEditor, edit: TextEditorEdit) {
    if (textEditor.document.languageId == 'svg') {
        showMinifyWarning(context, ()=>{
            let svgo = createMinifySVGO();
            svgo.optimize(textEditor.document.getText()).then(r => {
                if (r.data) {
                    textEditor.edit(edit => edit.replace(getFullRange(textEditor.document), r.data));
                }
            }).catch(reason => {
                window.showErrorMessage('Failed to minify the document.\n' + reason);
            });
        });
    }
}

export class SvgFormattingProvider implements DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]> {
        if(!window.activeTextEditor) {
            return null;
        }
        let svgo = new SVGO({
            full: false,
            plugins: formatPlugins,
            js2svg: { pretty: true, indent: <number>window.activeTextEditor.options.tabSize }
        });
        return svgo.optimize(document.getText()).then(r => {
            if (r.data) {
                return [TextEdit.replace(getFullRange(document), r.data)];
            }
            return null;
        }).catch(reason => {
            window.showErrorMessage('Failed to format the document.\n' + reason);
            return null;
        });
    }

}
