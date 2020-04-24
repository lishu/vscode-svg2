import * as vscode from 'vscode';

import * as path from 'path';
import { changeName, writeB64ToFile } from './unit';

let previewer: SvgPreviwerContentProvider = null;

interface ISVGPreviewConfiguration {
    autoShow: boolean;
}

function onDidChangeActiveTextEditor(e:vscode.TextEditor) {
    if(previewer && e && e.document && e.document.languageId == 'svg') {
        let svgCfg = vscode.workspace.getConfiguration('svg');
        let previewCfg = svgCfg.get<ISVGPreviewConfiguration>('preview');
        if(previewCfg.autoShow) {
            previewer.show();
        }
    }
}

export function registerAutoShowPreviewer() {
    return vscode.window.onDidChangeActiveTextEditor(e=>onDidChangeActiveTextEditor(e));
}

export class SvgPreviwerContentProvider implements vscode.Disposable
{
    webviewPanel : vscode.WebviewPanel;
    d0: vscode.Disposable;
    d1: vscode.Disposable;
    d2: vscode.Disposable;
    d3: vscode.Disposable;
    d4: vscode.Disposable;
    previewUri: string;
    scale: number = 1;
    path: vscode.Uri;
    noSaveBackground: string = null;
    //lastDocument: vscode.TextDocument;

    /**
     *
     */
    constructor(context: vscode.ExtensionContext) {
        previewer = this;
        this.path = vscode.Uri.file(context.asAbsolutePath('./client/out')).with({scheme: 'vscode-resource'});
        this.d0 =  vscode.commands.registerTextEditorCommand('_svg.showSvg', ()=>this.show());
        this.d1 =  vscode.commands.registerCommand('_svg.showSvgByUri', uri=>this.show(uri));
        this.d2 = vscode.workspace.onDidChangeTextDocument(e=>this.onDidChangeTextDocument(e));
        this.d3 = vscode.window.onDidChangeActiveTextEditor(e=>this.onDidChangeActiveTextEditor(e));
        this.d4 = vscode.window.onDidChangeTextEditorSelection(e=>this.onDidChangeTextEditorSelection(e));
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
        if(this.isSvgDocument(e.document)) {
            this.showDocument(e.document);
        }
    }

    onDidChangeActiveTextEditor(e: vscode.TextEditor): any {
        if(this.isSvgDocument(e && e.document)) {
            this.showDocument(e.document);
        }
    }

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
            this.webviewPanel.onDidDispose(()=>this.webviewPanel = null);
        }
        if(!this.webviewPanel.visible) {
            this.webviewPanel.reveal(vscode.ViewColumn.Three, true);
        }
        if(e instanceof vscode.Uri) {
            this.showUri(e);
        }
        this.onDidChangeActiveTextEditor(vscode.window.activeTextEditor);
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
            case 'export': {
                if(e.b64) {
                    let b = <Blob>e.blob;
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
            default:
                console.warn(`unknown action message ${e.action}`);
                break;
        }
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
            this.previewUri = doc.uri.toString();
            this.webviewPanel.title = path.basename(doc.uri.fsPath) + '[Preview]';
        }
        this.webviewPanel.webview.html = this.createHtml(doc);
    }

    private createHtml(doc: vscode.TextDocument):string
    {
        console.debug('create preview html');
        let bg = this.noSaveBackground || vscode.workspace.getConfiguration('svg.preview').get<string>('background') || 'transparent';
        let bgCustom = vscode.workspace.getConfiguration('svg.preview').get<string>('backgroundCustom') || '#eee';
        let mode = vscode.workspace.getConfiguration('svg.preview').get<string>('mode', 'svg');
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
            margin-top: 24px;
            padding:0;
        }
        #__toolbar{
            box-sizing: border-box;
            position: fixed;
            left: 0;
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
        #__toolbar>.btn-group>.btn:hover,
        #__toolbar>.btn-group>.btn.active{
            /* welcomePage.buttonHoverBackground: */
            /* background-color: var(--vscode-list-hoverBackground); */
            /* menu.selectionBackground */
            background-color: var(--vscode-menu-selectionBackground);
            color: var(--vscode-menu-selectionForeground);
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
        }
        #__host{
        }
        </style>`);
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
            default:
                html.push('<body class="bg-trans">');
                break;
        }
        html.push('<div id="__toolbar"></div>');
        html.push('<div id="__host" tabindex="0"}><div id="__svg">');
        html.push(svg);
        html.push('</div></div>');
        html.push(`<script>var mode = '${mode}'; var scale = ${this.scale}; var uri = '${doc.uri}';</script>`);
        html.push('<script src="${vscode-resource}/pv.js"></script>');
        html.push(`</body>`);
        html.push('</html>');
        let output = html.join('');
        output = output.replace(/\$\{vscode\-resource\}/g, this.path.toString());
        return output;
    }

    dispose():any {
        this.d0.dispose();
        this.d1.dispose();
        this.d2.dispose();
        this.d3.dispose();
        this.d4.dispose();
    }
}