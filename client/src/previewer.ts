import * as vscode from 'vscode';

import * as path from 'path';
import * as fs from 'fs';

import { changeName, writeB64ToFile } from './unit';
import { utils } from 'mocha';
import { assert } from 'console';

let previewers: {[pn: string]: SvgPreviwerContentProvider} = {};

type ViewMode = 'onlyOne' | 'oneByOne';

interface AllSvgItem {
    name: string;
    uri: string;
    svgImgSrc: string;
}

function getProviderBy(uri: vscode.Uri) {
    return previewers[uri.toString()];
}

function getUnlockedProvider() {
    for(let key in previewers) {
        let previewer = previewers[key];
        if(!previewer.isLocked) {
            return previewer;
        }
    }
    return null;
}

interface ISVGPreviewConfiguration {
    autoShow: boolean;
    viewMode: ViewMode;
}

interface TextEditorLike {
    readonly document : vscode.TextDocument;
}

let customCssFiles = [];

function onDidChangeActiveTextEditor(e:TextEditorLike, show?: boolean) {
    if(e && e.document && e.document.languageId == 'svg'){
        let previewer = getProviderBy(e.document.uri);
        let cfg = vscode.workspace.getConfiguration('svg').get<ISVGPreviewConfiguration>('preview');
        if(!previewer) {
            let unlockedPreviewer = getUnlockedProvider();
            if(cfg.viewMode == 'oneByOne' || !unlockedPreviewer) {
                if(!cfg.autoShow && !show) {
                    return;
                }
                previewer = new SvgPreviwerContentProvider();
                previewer.isLocked = cfg.viewMode == 'oneByOne';
                previewer.isRootLocked = previewer.isLocked;
                previewer.show(e.document.uri);
                return;
            }
            previewer = unlockedPreviewer;
        }
        if(previewer) {
            if(cfg.autoShow || e.document.uri.toString() != previewer.previewUri) {
                previewer.show(e.document.uri);
            } else {
                previewer.webviewPanel.reveal(null, true);
            }
        }
    }
}

function show(e?: any) {
    if(e) {
        const uri = <vscode.Uri>e;
        vscode.workspace.openTextDocument(uri).then(doc=>{
            onDidChangeActiveTextEditor({document : doc}, true);
        });
        return;
    }
    var editor = vscode.window.activeTextEditor;
    onDidChangeActiveTextEditor(editor, true);
}

export function registerPreviewer() {
    SvgPreviwerContentProvider.$context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(e=>onDidChangeActiveTextEditor(e)),
        vscode.commands.registerTextEditorCommand('_svg.showSvg', ()=>show()),
        vscode.commands.registerCommand('_svg.showSvgByUri', uri=>show(uri)),
        new AllSvgPreviwerContentProvider()
    );
}

export class AllSvgPreviwerContentProvider implements vscode.Disposable
{
    private subdisposed : Array<vscode.Disposable> = [];

    webviewPanel : vscode.WebviewPanel;

    constructor() {
        this.subdisposed.push(
            vscode.commands.registerCommand('svg.showAllSvg', ()=>this.showAllSvg())
        );
    }

    showAllSvg() {
        const workspace = vscode.workspace;
        if(!workspace.workspaceFolders || workspace.workspaceFolders.length == 0) {
            vscode.window.showWarningMessage('You need to open a folder before you can use this command');
            return;
        }
        if(this.webviewPanel == null) {
            this.webviewPanel = vscode.window.createWebviewPanel(
                'all-svg-preview', 
                'Preview All SVG', 
                {
                    viewColumn: vscode.ViewColumn.Three,
                    preserveFocus: true
                },
                {
                    enableScripts: true,
                    enableFindWidget: true
                }
                );
            this.webviewPanel.webview.onDidReceiveMessage(e=>this.onDidReceiveMessage(e));
            this.webviewPanel.onDidDispose(()=>this.onWebViewPanelDispose());
            this.webviewPanel.webview.html = this.createHtml();
        }
        if(!this.webviewPanel.visible) {
            this.webviewPanel.reveal(vscode.ViewColumn.Three, true);
        }
    }
    onDidReceiveMessage(e: any): any {
        switch(e.action) {
            case 'update':
                this.onUpdate();
                break;
            case 'open':
                this.onOpen(e.uri);
                break;
            case 'preview':
                this.onPreviewer(e.uri);
                break;
        }
    }

    onOpen(uri: string) {
        uri = unescape(uri);
        vscode.window.showTextDocument(vscode.Uri.parse(uri));
    }

    onPreviewer(uri: string) {
        uri = unescape(uri);
        vscode.commands.executeCommand('_svg.showSvgByUri', vscode.Uri.parse(uri));
    }

    onUpdate() {
        vscode.workspace.findFiles('**/*.svg').then(uris=>{            
            let items : Array<AllSvgItem> = [];
            let openedDocuments = vscode.workspace.textDocuments;
            for(var uri of uris)
            {
                let openedDocument = openedDocuments.find(d=>d.uri.path == uri.path);
                let fsPath = uri.fsPath;
                if(fsPath) {
                    var svgSource = openedDocument != null ? openedDocument.getText() : fs.readFileSync(fsPath, {encoding: 'utf8', flag: 'r'});
                    items.push({
                        name: path.basename(fsPath),
                        uri: uri.toString(),
                        svgImgSrc: `data:image/svg+xml,${escape(svgSource)}`
                    });
                }
            }
            items = items.sort((a,b) => a.name.localeCompare(b.name));
            this.webviewPanel.webview.postMessage({action : 'items', items});
        });
    }

    onWebViewPanelDispose(): any {
        this.webviewPanel = null;
    }

    createHtml(): string {
        let html = [];
        html.push('<!DOCTYPE html>\n');
        html.push('<html>');
        html.push(`<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' vscode-resource: https: data:;">
    <style type="text/css">
    html, body {
        font: var(--vscode-editor-font-weight) var(--vscode-editor-font-size) var(--vscode-editor-font-family);
    }
    #__listview{
        position: fixed;
        display: flex;
        flex-direction:row;
        flex-wrap: wrap;
        align-items:flex-start;
        align-content: flex-start;
        padding: 5px;
        left:0;
        right:0;
        top:0;
        bottom:0;
        overflow: auto;
    }
    .svg-icon{
        display: flex;
        position: relative;
        box-sizing: border-box;
        width: 180px;
        height: 180px;
        border: solid 1px #80808080;
        justify-content: center;
        align-items: center;
        margin: 10px;
    }
    .svg-icon:hover {
        border-color: var(--vscode-menu-selectionBackground);
    }
    .svg-icon>img {
        display: block;
        max-width: 160px;
        max-height: 160px;
    }
    .svg-name {
        position: absolute;
        left: 1px;
        right: 1px;
        bottom: 1px;
        padding: 2px;
        text-overflow: ellipsis;
        color: #f0f0f0;
        background-color: #80808080;
        text-align: center;
    }
    </style>
</head>
<body>
`);

        html.push('<div id="__toolbar"></div>');

        html.push('<div id="__listview"></div>');        
        html.push(`<script>

        var vscode = acquireVsCodeApi();
        var displayItems = [];

        function init() {
            window.addEventListener('message', onmessagein);
            vscode.postMessage({action: 'update'});
            console.log('init update');
        }

        function showDoc(e) {
            //console.log('showDoc', e, this);
            var uri = e.getAttribute('data-uri');
            vscode.postMessage({action: 'open', uri: uri});
        }

        function previewDoc(t, e) {
            if(e.button != 2) {
                return;
            }
            var uri = t.getAttribute('data-uri');
            vscode.postMessage({action: 'preview', uri: uri});
            return false;
        }

        function onUpdateItems(items) {
            var html = [];
            displayItems = items;
            for(var i in displayItems) {
                var item = displayItems[i];
                html.push('<div class="svg-icon" title="LMB: open in editor&#10;RMB: open in previewr" data-uri="'+escape(item.uri)+'" onclick="showDoc(this)" onmousedown="previewDoc(this, event)"><img src="' + item.svgImgSrc + '" /><div class="svg-name">'+item.name+'</div></div>');
            }
            document.getElementById('__listview').innerHTML = html.join('');
        }
        
        function onmessagein(e) {
            switch(e.data.action) {
                case 'items':
                    onUpdateItems(e.data.items);
                    break;
            }
        }

        if(document.readyState != 'loading') {
            init();
        } else {
            document.onreadystatechange = function(){
                if(document.readyState == 'interactive') {
                    init();
                }
            };
        } 
</script>`);
        html.push(`</body>
</html>`);

        return html.join('');
    }

    dispose() {
        this.subdisposed.forEach(d=>d.dispose());
    }    
}

export class SvgPreviwerContentProvider implements vscode.Disposable
{
    webviewPanel : vscode.WebviewPanel;
    // d0: vscode.Disposable;
    // d1: vscode.Disposable;
    d2: vscode.Disposable;
    // d3: vscode.Disposable;
    // d4: vscode.Disposable;
    previewUri: string;
    isRootLocked: boolean = false;
    isLocked: boolean = false;
    scale: number = 1;
    resPath: vscode.Uri;
    // path: vscode.Uri;
    noSaveBackground: string = null;
	static $context: vscode.ExtensionContext;
    //lastDocument: vscode.TextDocument;

    /**
     *
     */
    constructor() {
        // this.path = vscode.Uri.file(context.asAbsolutePath('./client/out')).with({scheme: 'vscode-resource'});
        this.resPath = vscode.Uri.file(SvgPreviwerContentProvider.$context.asAbsolutePath('./client/out'));
        // this.d0 =  vscode.commands.registerTextEditorCommand('_svg.showSvg', ()=>this.show());
        // this.d1 =  vscode.commands.registerCommand('_svg.showSvgByUri', uri=>this.show(uri));
        this.d2 = vscode.workspace.onDidChangeTextDocument(e=>this.onDidChangeTextDocument(e));
        // this.d3 = vscode.window.onDidChangeActiveTextEditor(e=>this.onDidChangeActiveTextEditor(e));
        // this.d4 = vscode.window.onDidChangeTextEditorSelection(e=>this.onDidChangeTextEditorSelection(e));        
    }

    onDidChangeTextEditorSelection(e: vscode.TextEditorSelectionChangeEvent): any {
        if(this.isActiveBy(e.textEditor.document) && e.selections.length == 1){
            let selection = e.selections[0];
            let offset = e.textEditor.document.offsetAt(selection.active);
            this.webviewPanel.webview.postMessage({
                action: 'selection',
                offset
            });
        }
    }

    onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent): any {
        if(this.isLocked) {
            // 锁定模式显示 SVG 文档
            if(e.document.uri.toString() == this.previewUri) {
                this.showDocument(e.document);
            }
            return;
        }
        if(this.isSvgDocument(e.document)) {
            // 显示活动的 SVG 文档
            this.showDocument(e.document);
            return;
        }
        if(customCssFiles && customCssFiles.length && customCssFiles.includes(e.document.uri.toString())) {
            // 自定义 CSS 文件内容发生变化
            this.reshow();
        }
    }

    // onDidChangeActiveTextEditor(e: vscode.TextEditor): any {
    //     // if(this.isLocked) {
    //     //     if(e && e.document && e.document.uri.toString() == this.previewUri) {
    //     //         this.showDocument(e.document);
    //     //     }
    //     //     return;
    //     // }
    //     if(this.isSvgDocument(e && e.document)) {
    //         this.showDocument(e.document);
    //     }
    // }

    show(e?: any) {
        if(this.webviewPanel == null) {
            let scriptRoot = vscode.Uri.file(__dirname);
            this.webviewPanel = vscode.window.createWebviewPanel(
                'svg-preview', 
                'Svg Preview', 
                { 
                    viewColumn: vscode.ViewColumn.Three, 
                    preserveFocus: true
                },
                {enableScripts: true}
                );
            this.webviewPanel.webview.onDidReceiveMessage(e=>this.onDidReceiveMessage(e));
            this.webviewPanel.onDidDispose(()=>this.onWebViewPanelDispose());
        }
        if(!this.webviewPanel.visible) {
            this.webviewPanel.reveal(vscode.ViewColumn.Three, true);
        }
        let docUri: vscode.Uri = null;
        if(e instanceof vscode.Uri) {
            docUri = e;
        }
        else if(vscode.window.activeTextEditor && this.isSvgDocument(vscode.window.activeTextEditor.document)) {
            docUri = vscode.window.activeTextEditor.document.uri;
        }
        // this.onDidChangeActiveTextEditor(vscode.window.activeTextEditor);
        if(docUri){
            vscode.workspace.openTextDocument(docUri).then(doc=>this.showDocument(doc));
        }
    }

    onWebViewPanelDispose() {
        delete previewers[this.previewUri];
        this.webviewPanel = null;
    }

    onDidReceiveMessage(e: any): any {
        switch (e.action) {
            case 'bg':
                let saveTo = vscode.workspace.getConfiguration('svg.preview').get<string>('backgroundSaveTo', 'Workspace');
                let target = vscode.ConfigurationTarget.Workspace;
                if(saveTo == 'NoSave') {
                    this.noSaveBackground = e.color;
                    break;
                }
                else if(saveTo == 'Global') {
                    target = vscode.ConfigurationTarget.Global;
                }
                vscode.workspace.getConfiguration('svg.preview').update('background', e.color, target).then(()=>{
                    console.log('svg.preview.background updated');
                });
                break;
            case 'mode':
                vscode.workspace.getConfiguration('svg.preview').update('mode', e.mode, vscode.ConfigurationTarget.Global).then(()=>{
                    this.showUri(vscode.Uri.parse(this.previewUri));
                });
                break;
            case 'scale':
                this.scale = e.scale;
                break;
            case 'action':
                if(e.msg) {
                    vscode.window.showErrorMessage(e.msg);
                }
                break;
            case 'cross':
                this.showCrossLine = !!e.value;
                break;
            case 'ruler':
                this.showRuler = !!e.value;
                break;
            case 'selectcss':
                this.selectCss();
                break;
            case 'export': {
                if(e.b64) {
                    // let b = <Blob>e.blob;
                    let uri = vscode.Uri.parse(<string>e.uri);
                    let newUri = changeName(uri, (n,e)=>n+'.png');
                    vscode.window.showSaveDialog({
                            'defaultUri': newUri,
                            'filters' : {
                                "Image" : ['png']
                            }
                        }).then(r=>{
                            if(r) {
                                writeB64ToFile(e.b64, r.fsPath, e=>{
                                    if(e){
                                        vscode.window.showErrorMessage('Export Fail.\n' + e.message);
                                    }
                                });
                            }
                        });
                    }
                }
                break;
            case 'showerror':
                vscode.window.showErrorMessage(e.msg);
                break;
            case 'lock':
                this.isLocked = true;
                this.webviewPanel.webview.postMessage({action: 'changeLock', value: true});
                break;
            case 'unlock':
                this.isLocked = false;
                this.webviewPanel.webview.postMessage({action: 'changeLock', value: false});
                break;
            case 'log':
                console.log(...e.data);
                break;
            default:
                console.warn(`unknown action message ${e.action}`);
                break;
        }
    }

    selectCss() {
        vscode.workspace.findFiles('**/*.css', '**​/node_modules/**').then(uris=>{
            let options = uris.map(uri=>{
                return {
                    label: uri.toString(), 
                    picked: customCssFiles.indexOf(uri.toString()) > -1
                };
            });
            vscode.window.showQuickPick(options, {canPickMany: true}).then(selectedCssUris=>{
                if(selectedCssUris){
                    let docUri = vscode.Uri.parse(this.previewUri);
                    customCssFiles = selectedCssUris.map(cu=>cu.label);
                    this.showUri(docUri);
                }
            });
        });
    }

    public isActive() {
        return this.webviewPanel && this.webviewPanel.visible;
    }

    public isActiveBy(doc: vscode.TextDocument) {
        return this.isActive() && doc.uri.toString() == this.previewUri;
    }

    isSvgDocument(document:vscode.TextDocument): boolean {
        return document && (/\.svg$/i.test(document.uri.path) || document.languageId == 'svg' || document.languageId == 'xml' && /^<svg\b/.test(document.getText()));
    }

    private reshow() {
        assert(this.previewUri != null, "Use reshow() required previewUri is not null.");
        vscode.workspace.openTextDocument(vscode.Uri.parse(this.previewUri)).then(doc=>{
            this.showDocument(doc);
        });
    }

    private showUri(uri : vscode.Uri) {
        vscode.workspace.openTextDocument(uri).then(doc=>{
            this.showDocument(doc);
        });
    }

    private showDocument(doc: vscode.TextDocument) {
        if(!this.webviewPanel){
            return;
        }
        if(this.previewUri != doc.uri.toString())
        {
            // this.lastDocument = doc;
            if(previewers[this.previewUri] == this) {
                delete previewers[this.previewUri];
            }
            this.previewUri = doc.uri.toString();
            previewers[this.previewUri] = this;
            this.webviewPanel.title = path.basename(doc.uri.fsPath) + '[Preview]';
        }
        this.webviewPanel.webview.html = this.createHtml(doc, this.webviewPanel.webview);
    }

    showRuler : boolean | undefined = undefined;
    showCrossLine : boolean | undefined = undefined;

    private getDefined<T>(...options: Array<T | undefined>) : T {
        for(let item of options) {
            if(typeof(item) !== 'undefined') {
                return item;
            }
        }
    }

    private createHtml(doc: vscode.TextDocument, webivew: vscode.Webview):string
    {
        // console.debug('create preview html');
        let cfg = vscode.workspace.getConfiguration('svg.preview');
        let saveTo = cfg.get<string>('backgroundSaveTo', 'Workspace');
        let toolbarSize = cfg.get<string>('toolbarSize', 'mini');
        let path = webivew.asWebviewUri(this.resPath).toString();
        let bg = (saveTo == 'NoSave' && this.noSaveBackground) || cfg.get<string>('background') || 'transparent';
        let bgCustom = cfg.get<string>('backgroundCustom') || '#eee';
        let viewMode = cfg.get<ViewMode>('viewMode', 'onlyOne');
        let showRuler = this.getDefined(this.showRuler, cfg.get<boolean>('showRuler', false));
        let showCrossLine = this.getDefined(this.showCrossLine, cfg.get<boolean>('showCrossLine', false));
        let mode = cfg.get<string>('mode', 'svg');
        let svg = doc.getText();

        if(mode == 'img') {
            // 尝试使用 img + data 提供 svg 非嵌入格式支持
            svg = '<img src="data:image/svg+xml,' + escape(svg) + '" />';
        }

        const html = [];
        html.push('<!DOCTYPE html>\n');
        html.push('<html>');
        html.push(`<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' vscode-resource: https: data:;">
</head>`);
        html.push(`<style type="text/css">
        html, body {
            font: var(--vscode-editor-font-weight) var(--vscode-editor-font-size) var(--vscode-editor-font-family);
        }
        *:focus {
            outline: none 0;
        }
        .bg-trans {
            background: url(data:image/gif;base64,R0lGODlhEAAQAIAAAP///8zMzCH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTI0NUU1RTAzNzdFMTFFNzk2QkFDN0I4QUEyNzlDQkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTI0NUU1RTEzNzdFMTFFNzk2QkFDN0I4QUEyNzlDQkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMjQ1RTVERTM3N0UxMUU3OTZCQUM3QjhBQTI3OUNCRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFMjQ1RTVERjM3N0UxMUU3OTZCQUM3QjhBQTI3OUNCRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAAAAAAALAAAAAAQABAAAAIfhG+hq4jM3IFLJhoswNly/XkcBpIiVaInlLJr9FZWAQA7);
        }
        .bg-dark-trans {
            background: url(data:image/gif;base64,R0lGODlhEAAQAIAAADMzM0BAQCH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjQyM0E4RTcyNTk3RTExRUI5MjAzQ0M1MEJGOUIzQTdCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjQyM0E4RTczNTk3RTExRUI5MjAzQ0M1MEJGOUIzQTdCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDIzQThFNzA1OTdFMTFFQjkyMDNDQzUwQkY5QjNBN0IiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NDIzQThFNzE1OTdFMTFFQjkyMDNDQzUwQkY5QjNBN0IiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAEAAQAAACH4xvoKuIzNyBSyYKbMDZcv15HAaSIlWiJ5Sya/RWVgEAOw==);
        }
        .bg-white {
            background: white;
        }
        .bg-black {
            background: black;
        }
        .bg-custom{
            background: ${bgCustom};
        }
        body{
            margin:0;
            padding:0;            
        }
        #__toolbar{
            position: fixed;
            box-sizing: border-box;
            top:0;
            min-height: 24px;
            padding-bottom: 1px;
            width: 100%;
            z-index: 10000;
            background: var(--vscode-tab-activeBackground);
            border-bottom: solid 1px var(--vscode-tab-activeBorder);
        }

        #__toolbar>.btn-group {
            display:inline-block;
            margin: 0 4px;
        }
        #__toolbar>.btn-group>.btn-bg{
            margin-top: 3px;
            width: 17px;
            height: 17px;
            border: solid 1px #eee;
        }
        #__toolbar>.btn-group>.btn{
            position:relative;
            top: -3px;
            font-size: 10px;
            height: 19px;
            line-height: 16px;
            vertical-align: middle;
            /* editorGroupHeader.tabsBackground */
            border-style: solid;
            border-width: 1px;
            border-color: var(--vscode-editorGroupHeader-tabsBackground);
            /* descriptionForeground */
            color: var(--vscode-descriptionforeground);
            /* welcomePage.buttonBackground: */
            background-color: var(--vscode-welcomepage-buttonBackground);
        }
        .__toolbar_middle>.btn-group>.btn{
            font-size: 14px !important;
            line-height: 20px !important;
            height: 23px !important;
        }
        .__toolbar_middle>.btn-group>.label{
            font-size: 12px !important;
        }
        .__toolbar_large>.btn-group>.btn{
            font-size: 16px !important;
            line-height: 22px !important;
            height: 25px !important;
        }
        .__toolbar_large>.btn-group>.label{
            font-size: 14px !important;
        }
        .__toolbar_large>.btn-group>.btn-bg {
            margin-top: 2px !important;
            width: 19px !important;
            height: 19px !important;
        }
        #__toolbar>.btn-group>.btn:hover,
        #__toolbar>.btn-group>.btn.active{
            /* welcomePage.buttonHoverBackground: */
            /* background-color: var(--vscode-list-hoverBackground); */
            /* menu.selectionBackground */
            background-color: var(--vscode-menu-selectionBackground);
            color: var(--vscode-menu-selectionForeground);
        }
        .btn>.label {
            display: inline-block;
            padding-left:0.5em;
            padding-right:0.5em;
            margin-left: 0.5em;
            margin-right: 0.5em;
            border-radius: 1em;
            background: #090;
            color: #ccc;
            font-weight: bold;
        }
        .btn>svg {
            vertical-align: middle;
        }
        #__toolbar>.btn-group>.label{
            position:relative;
            padding:0 2px;
            top: -2px;
            font-size: 10px;
            height: 17px;
            cursor: default;
        }
        #__svg{
            transform-origin:top left;
            transform:scale(${this.scale});
            line-height: 0;
        }
        body.with-ruler #__host {
            left: 12px;
            top: 12px;
        }
        #__host{
            position:relative;
            line-height: 0;
        }
        #__host>.--pixel-grid{
            position: absolute;
            left:0;
            top:0;
            background-repeat: repeat;
            background-position: left top;
        }
        #__rulerHost {
            position: fixed;
            left:0;
            top:0;
        }
        .locked svg{
            transform: rotate(-45deg);
        }
        </style>`);

        // 文档自定义样式文件
        if(mode == 'svg' && customCssFiles.length) {
            for(let cssUri of customCssFiles){
                try{
                    html.push(`<link crossorigin="anonymous" media="all" rel="stylesheet" href="${this.webviewPanel.webview.asWebviewUri(vscode.Uri.parse(cssUri))}?_=${Math.random()}" />`);
                }
                catch{}
            }
        }

        switch (bg) {
            case 'white':
                html.push('<body class="bg-white">');
                break;
            case 'black':
                html.push('<body class="bg-black">');
                break;
            case 'custom':
                html.push('<body class="bg-custom">');
                break;
            case 'dark-transparent':
                html.push('<body class="bg-dark-trans">');
                break;
            default:
                html.push('<body class="bg-trans">');
                break;
        }
        html.push('<div id="__toolbar_parent">');
        html.push('<div id="__toolbar" class="__toolbar_' + toolbarSize + '"></div>');
        html.push('</div>');
        html.push('<div id="__host" tabindex="0"}><div id="__svg">');
        html.push(svg);
        html.push('</div><div class="--pixel-grid"></div><div id="__rulerHost"></div></div>');
        html.push(`<script>
        var mode = '${mode}'; 
        var scale = ${this.scale}; 
        var uri = '${doc.uri}'; 
        var viewMode = '${viewMode}'; 
        var isRootLocked = ${this.isRootLocked?'true':'false'};
        var isLocked = ${this.isLocked?'true':'false'};
        var customCssFiles = ${customCssFiles.length};
        var showRuler = ${showRuler};
        var showCrossLine = ${showCrossLine};
        </script>`);
        html.push('<script src="${vscode-resource}/pv.js"></script>');
        html.push(`</body>`);
        html.push('</html>');
        let output = html.join('');
        output = output.replace(/\$\{vscode\-resource\}/g, path);
        return output;
    }

    dispose():any {
        // this.d0.dispose();
        // this.d1.dispose();
        this.d2.dispose();
        // this.d3.dispose();
        // this.d4.dispose();
    }
}