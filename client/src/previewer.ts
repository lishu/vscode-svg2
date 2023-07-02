import * as vscode from 'vscode';

import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

import { changeName, writeB64ToFile } from './unit';
import { assert } from 'console';

let previewers: {[pn: string]: SvgPreviwerContentProvider} = {};

interface PreviewerFileSetting {
    fitMode: boolean | undefined;
    scale: number | undefined;
}

const fileSettings: Record<string, PreviewerFileSetting> = {};

function getFileSettings(uri: string) {
    let filePath = uri;
    if(!fileSettings[filePath]) {
        return { fitMode: undefined, scale: undefined };
    }
    return fileSettings[filePath];
}

function updateFileSettings(uri: string, name: keyof PreviewerFileSetting, value: any) {
    const fileSetting = getFileSettings(uri);
    fileSetting[name] = value;
    fileSettings[uri] = fileSetting;
}

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
    scaleZoom: number;
    zoomOptions: string[];
}

/**
 * 默认预览器配置
 */
const DefaultPreviewConfig: ISVGPreviewConfiguration = {
    autoShow: false, 
    viewMode: 'onlyOne', 
    scaleZoom: 2,
    zoomOptions: [
        "25%",
        "50%",
        "100%",
        "200%",
        "400%",
        "800%"
    ]
}

interface TextEditorLike {
    readonly document : vscode.TextDocument;
}

function getPreviewConfiguration() {
    return vscode.workspace.getConfiguration('svg').get<ISVGPreviewConfiguration>('preview', DefaultPreviewConfig);
}

let customCssFiles: string[] = [];

function onDidChangeActiveTextEditor(e?:TextEditorLike, show?: boolean) {
    console.debug('onDidChangeActiveTextEditor', e, show);
    if(e && e.document && e.document.languageId == 'svg'){
        let previewer = getProviderBy(e.document.uri);
        let cfg = getPreviewConfiguration();
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
                const visibleTextEditor = vscode.window.visibleTextEditors.find(te => te.document.uri.toString() === e.document.uri.toString());
                if (visibleTextEditor) {
                    console.debug('visibleTextEditor.viewColumn, webviewPanel.viewColumn', visibleTextEditor.viewColumn, previewer.webviewPanel!.viewColumn);
                } 
                else 
                {
                    previewer.webviewPanel!.reveal(undefined, true);
                }
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
    if (editor) {
        onDidChangeActiveTextEditor(editor, true);
    }
}

export function registerPreviewer() {
    SvgPreviwerContentProvider.$context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(e=>onDidChangeActiveTextEditor(e)),
        vscode.commands.registerTextEditorCommand('svg.showSvg', ()=>show()),
        vscode.commands.registerCommand('_svg.showSvgByUri', uri=>show(uri)),
        new AllSvgPreviwerContentProvider()
    );
}

function getOrCreateDocumentEditor(uri: vscode.Uri, options: vscode.TextDocumentShowOptions) {
    const editor = vscode.window.visibleTextEditors.find(e => e.document.uri.toString() === uri.toString());
    if(editor) {
        if(options && options.selection) {
            editor.selection = new vscode.Selection(options.selection.start, options.selection.end);
            editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        }
        return Promise.resolve(editor)
    }
    return vscode.window.showTextDocument(uri, options);
}

export class AllSvgPreviwerContentProvider implements vscode.Disposable
{
    private subdisposed : Array<vscode.Disposable> = [];

    webviewPanel? : vscode.WebviewPanel;

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
        const exclude = vscode.workspace.getConfiguration('svg.previewAll').get('exclude', '**​/node_modules/**');
        vscode.workspace.findFiles('**/*.svg', exclude).then(uris=>{            
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
            this.webviewPanel!.webview.postMessage({action : 'items', items});
        });
    }

    onWebViewPanelDispose(): any {
        this.webviewPanel = undefined;
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
    debug: boolean;
    webviewPanel? : vscode.WebviewPanel | null;
    // d0: vscode.Disposable;
    // d1: vscode.Disposable;
    d2: vscode.Disposable;
    // d3: vscode.Disposable;
    // d4: vscode.Disposable;
    previewUri?: string;
    isRootLocked: boolean = false;
    isLocked: boolean = false;
    resPath: vscode.Uri;
    codiconUri: vscode.Uri;
    styleUri: vscode.Uri;
    // path: vscode.Uri;
    noSaveBackground: string | null = null;
	static $context: vscode.ExtensionContext;
    //lastDocument: vscode.TextDocument;

    /**
     *
     */
    constructor() {
        // this.path = vscode.Uri.file(context.asAbsolutePath('./client/out')).with({scheme: 'vscode-resource'});
        this.debug = SvgPreviwerContentProvider.$context.extensionMode === vscode.ExtensionMode.Development;
        this.resPath = vscode.Uri.file(SvgPreviwerContentProvider.$context.asAbsolutePath('./client/out'));
        this.codiconUri = this.debug ?
         vscode.Uri.joinPath(SvgPreviwerContentProvider.$context.extensionUri, 'client', 'node_modules', '@vscode/codicons', 'dist', 'codicon.css') :
         vscode.Uri.joinPath(SvgPreviwerContentProvider.$context.extensionUri, 'client', 'out', 'codicons', 'dist', 'codicon.css')
         ;
        this.styleUri = vscode.Uri.joinPath(SvgPreviwerContentProvider.$context.extensionUri, 'client', 'style', 'pv.css');
        // this.d0 =  vscode.commands.registerTextEditorCommand('_svg.showSvg', ()=>this.show());
        // this.d1 =  vscode.commands.registerCommand('_svg.showSvgByUri', uri=>this.show(uri));
        this.d2 = vscode.workspace.onDidChangeTextDocument(e=>this.onDidChangeTextDocument(e));
        // this.d3 = vscode.window.onDidChangeActiveTextEditor(e=>this.onDidChangeActiveTextEditor(e));
        // this.d4 = vscode.window.onDidChangeTextEditorSelection(e=>this.onDidChangeTextEditorSelection(e)); 
        
        if(this.debug) {
            // 调试时自动热加载 pv.css 文件
            console.debug("尝试使用自动热加载")
            import('fs')
                .then(fs => {
                    const filepath = path.resolve(__dirname, '../');
                    let reloadTimer : NodeJS.Timer;
                    console.log('自动热加载侦听', filepath);
                    const watcher = fs.watch(filepath).addListener('change', (e, fn) => {
                        if(typeof fn === 'string' && /\.(css|js)$/.test(fn)) {
                            this.reshow();
                        }
                        // console.log('change', fn);
                        // reloadTimer && clearTimeout(reloadTimer);
                        // reloadTimer = setTimeout(()=>this.webviewPanel?.webview?.postMessage({action: 'hotReload', id: '__link_stylePath'}), 1000);
                    });
                    this.webviewPanel!.onDidDispose(()=>watcher.close());
                });
        }
    }

    onDidChangeTextEditorSelection(e: vscode.TextEditorSelectionChangeEvent): any {
        if(this.isActiveBy(e.textEditor.document) && e.selections.length == 1){
            let selection = e.selections[0];
            let offset = e.textEditor.document.offsetAt(selection.active);
            this.webviewPanel!.webview.postMessage({
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
        let docUri: vscode.Uri | null = null;
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
        delete previewers[this.previewUri!];
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
                    this.showUri(vscode.Uri.parse(this.previewUri!));
                });
                break;
            case 'scale':
                updateFileSettings(this.previewUri!, 'scale', e.scale);
                break;
            case 'fitMode':
                updateFileSettings(this.previewUri!, 'fitMode', e.fitMode);
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
                this.webviewPanel!.webview.postMessage({action: 'changeLock', value: true});
                break;
            case 'unlock':
                this.isLocked = false;
                this.webviewPanel!.webview.postMessage({action: 'changeLock', value: false});
                break;
            case 'toLine':
                // TODO: toLine
                {
                    const docUrl = vscode.Uri.parse(this.previewUri!);
                    const position = new vscode.Position(parseInt(e.line), parseInt(e.column));
                    getOrCreateDocumentEditor(docUrl, {
                        viewColumn: vscode.ViewColumn.Beside, 
                        preserveFocus: true,
                        selection: new vscode.Range(position, position)
                    });
                }
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
                    let docUri = vscode.Uri.parse(this.previewUri!);
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
        vscode.workspace.openTextDocument(vscode.Uri.parse(this.previewUri!)).then(doc=>{
            this.showDocument(doc);
        });
    }

    private showUri(uri : vscode.Uri) {
        vscode.workspace.openTextDocument(uri).then(doc=>{
            this.showDocument(doc);
        });
    }

    private async showDocument(doc: vscode.TextDocument) {
        if(!this.webviewPanel){
            return;
        }
        if(this.previewUri != doc.uri.toString())
        {
            // this.lastDocument = doc;
            if(previewers[this.previewUri!] == this) {
                delete previewers[this.previewUri!];
            }
            this.previewUri = doc.uri.toString();
            previewers[this.previewUri] = this;
            this.webviewPanel.title = path.basename(doc.uri.fsPath) + '[Preview]';
        }
        this.webviewPanel.webview.html = await this.createHtml(doc, this.webviewPanel.webview);
    }

    showRuler : boolean | undefined = undefined;
    showCrossLine : boolean | undefined = undefined;

    private getDefined<T>(...options: Array<T | undefined>) : T | undefined {
        for(let item of options) {
            if(typeof(item) !== 'undefined') {
                return item;
            }
        }
    }

    private converToInspectSvg(doc: vscode.TextDocument): string {
        const source = doc.getText();
        try {
            let line = 0;
            let lineStartOffset = 0;
            return source.replace(/\n|<(circle|ellipse|image|line|path|polygon|polyline|rect|text|use)(?=\s)/g, (s, name, offset) => {
                if(s === '\n') {
                    line++;
                    lineStartOffset = offset + 1;
                    return s;
                }
                return `<${name} data-inspect-line="${line}" data-inspect-column="${offset - lineStartOffset}"`
            });
        } catch(e) {
            console.error(e);
            return source;
        }
    }

    private async createHtml(doc: vscode.TextDocument, webivew: vscode.Webview): Promise<string>
    {
        const fileSettings = getFileSettings(this.previewUri!);
        let cfg = vscode.workspace.getConfiguration('svg.preview');
        let saveTo = cfg.get<string>('backgroundSaveTo', 'Workspace');
        let toolbarSize = cfg.get<string>('toolbarSize', 'mini');
        let autoFit = cfg.get<boolean>("autoFit", true);
        let scaleZoom = cfg.get<number>("scaleZoom", DefaultPreviewConfig.scaleZoom);
        let zoomOptions = cfg.get<string[]>("zoomOptions", DefaultPreviewConfig.zoomOptions);
        let translateExternalAddress = cfg.get<boolean>("translateExternalAddress", false);
        let path = webivew.asWebviewUri(this.resPath).toString();
        let iconPath = webivew.asWebviewUri(this.codiconUri);
        let stylePath = webivew.asWebviewUri(this.styleUri);
        let baseUrl = webivew.asWebviewUri(vscode.Uri.joinPath(doc.uri, '../'));
        let bg = (saveTo == 'NoSave' && this.noSaveBackground) || cfg.get<string>('background') || 'transparent';
        let bgCustom = cfg.get<string>('backgroundCustom') || '#eee';
        let viewMode = cfg.get<ViewMode>('viewMode', 'onlyOne');
        let showRuler = this.getDefined(this.showRuler, cfg.get<boolean>('showRuler', false));
        let showCrossLine = this.getDefined(this.showCrossLine, cfg.get<boolean>('showCrossLine', false));
        let mode = cfg.get<string>('mode', 'svg');
        // let svg = doc.getText();
        let svg = mode === 'img' ? doc.getText() : this.converToInspectSvg(doc);
        svg = await this.localImageHrefConvert(webivew, svg);
        let domains : string[] = [];
        let imageHrefs = [];
        let imageHrefReg = /\<(fe)?image([^>]*)href=\"(https?:\/\/[^\"]*)\"/gi;
        let imageHrefMatch = null;
        try{
            const translateImageMaps : Record<string, string> = {};
            while(imageHrefMatch = imageHrefReg.exec(svg)) {
                const imageHref = imageHrefMatch[3];
                if (imageHref.startsWith('https://file%2B.vscode-resource.vscode-cdn.net/')) {
                    continue;
                }
                const origin = new URL(imageHref).origin.toUpperCase();
                imageHrefs.push(imageHref);
                if(!domains.includes(origin)) {
                    domains.push(origin);
                }
                if(translateExternalAddress) {
                    try{
                        const contentBytes = await new Promise<string>((resolve, reject) => {
                            (/^https/i.test(imageHref) ? https : http).get(imageHref, res => {                            
                                const { statusCode, statusMessage } = res;
                                const contentType = res.headers['content-type'];
                                const isText = /^text/.test(contentType || '');
                                const all : Array<string|Buffer> = []
                                if (statusCode === 200) {
                                    if(isText) {
                                        res.setEncoding('utf8');
                                    }
                                    res.on('data', chunk => {
                                        all.push(chunk);
                                    });
                                    res.on('end', () => {
                                        const buffer = isText ? Buffer.from(all.join('')) : Buffer.concat(all as Buffer[]);
                                        resolve(`data:${contentType};base64,${buffer.toString('base64')}`);
                                    });
                                } else {
                                    reject(new Error(statusMessage));
                                }
                            })
                        });
                        if (contentBytes) {
                            translateImageMaps[imageHref] = contentBytes;
                        }
                    }
                    catch {}
                }
            }
            if(translateExternalAddress) {
                svg = svg.replace(imageHrefReg, ($0, $1, $2, $3)=> {
                    if($3 in translateImageMaps) {
                        return $0.replace($3, translateImageMaps[$3]);
                    }
                    return $0;
                });
            }
        } catch(e) {
            console.error(e);
        }

        if(mode == 'img') {
            // 尝试使用 img + data 提供 svg 非嵌入格式支持
            svg = '<img src="data:image/svg+xml,' + encodeURIComponent(svg) + '" />';
        }

        const html = [];
        html.push('<!DOCTYPE html>\n');
        html.push('<html>');
        html.push(`<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' vscode-resource: https: data: ${domains.join(' ')};">
</head>`);
        html.push(`<base href="${baseUrl}" />`);
        html.push(`<link href="${iconPath}" rel="stylesheet" />`);
        html.push(`<link id="__link_stylePath" href="${stylePath}" rel="stylesheet" />`);
        html.push(`<style type="text/css">
        .bg-custom{
            background: ${bgCustom};
        }
        #__svg{
            transform-origin:top left;
            transform:scale(1);
            line-height: 0;
        }
        </style>`);

        // 文档自定义样式文件
        if(mode == 'svg' && customCssFiles.length) {
            for(let cssUri of customCssFiles){
                try{
                    html.push(`<link crossorigin="anonymous" media="all" rel="stylesheet" href="${this.webviewPanel!.webview.asWebviewUri(vscode.Uri.parse(cssUri))}?_=${Math.random()}" />`);
                }
                catch{}
            }
        }

        switch (bg) {
            case 'white':
                html.push('<body class="bg-white">');
            case 'black':
                html.push('<body class="bg-black">');
                break;
            case 'custom':
                html.push('<body class="bg-custom">');
                break;
            case 'dark-transparent':
                html.push('<body class="bg-dark-trans">');
                break;
            case 'transparent':
                html.push('<body class="bg-trans">');
                break;
            default:
                html.push('<body class="bg-editor">');
                break;
        }
        html.push('<div id="__root">')
        html.push('<div id="__toolbar_parent">');
        html.push('<div id="__toolbar" class="__toolbar_' + toolbarSize + '"></div>');
        html.push('</div>');
        html.push(`<div id="__host" tabindex="0"}>
    <div id="__rule_v_host"></div>
    <div id="__host_v"> 
        <div id="__rule_h_host"></div>
        <div id="__svg_container">
            <div class="--pixel-grid"></div>
            <div id="__svg"`);
        // if (typeof fileSettings.scale === 'number' && fileSettings.fitMode === false) {
        //     html.push(` style="transform:scale(${fileSettings.scale})"`);
        // }
        html.push(`>
                ${svg}
            </div>
        </div>
    </div>
</div>`);
        html.push('</div>');
        html.push(`<script>
        var debug = ${this.debug};
        var scaleZoom = ${scaleZoom};
        var zoomOptions = "${zoomOptions.join()}"
        var autoFit = ${autoFit};
        var mode = '${mode}'; 
        var scale = ${fileSettings.scale}; 
        var fitMode = ${fileSettings.fitMode};
        var uri = '${doc.uri}'; 
        var viewMode = '${viewMode}'; 
        var isRootLocked = ${this.isRootLocked?'true':'false'};
        var isLocked = ${this.isLocked?'true':'false'};
        var customCssFiles = ${customCssFiles.length};
        var showRuler = ${showRuler};
        var showCrossLine = ${showCrossLine};
        var domains = ${JSON.stringify(domains)};
        </script>`);
        html.push('<script type="module" src="${vscode-resource}/pv.js" ></script>');
        html.push(`</body>`);
        html.push('</html>');
        let output = html.join('');
        output = output.replace(/\$\{vscode\-resource\}/g, path);
        return output;
    }

    async localImageHrefConvert(webivew: vscode.Webview, svg: string): Promise<string> {
        let localImageHrefReg = /\<(fe)?image([^>]*)href=\"([^\"]*)\"/gi;
        const promises: Promise<string>[] = [];
        const docUri = vscode.Uri.parse(this.previewUri!);
        svg.replace(localImageHrefReg, ($, $1, $2, $3) => {
            promises.push(
                (async () => {                    
                    if ($3 && !$3.includes(':')) {
                        const targetUri = vscode.Uri.joinPath(docUri, '..', $3);
                        try {
                            const toUri = webivew.asWebviewUri(targetUri);
                            return $.replace($3, toUri.toString());
                        } catch {}
                    }
                    return $;
                })()
            );
            return $;
        });

        const data = await Promise.all(promises);
        return svg.replace(localImageHrefReg, () => data.shift()!);
    }

    dispose():any {
        // this.d0.dispose();
        // this.d1.dispose();
        this.d2.dispose();
        // this.d3.dispose();
        // this.d4.dispose();
    }
}
