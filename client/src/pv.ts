// Previewer in webviewPanel script

let _toolbar : HTMLDivElement;
let _host : HTMLDivElement;
let groupBackground : HTMLDivElement;
let groupMode : HTMLDivElement;
let labelZoom : HTMLSpanElement;
let btnSvg : HTMLButtonElement;
let btnImg : HTMLButtonElement;

function createButtonGroup(){
    var group = document.createElement('div');
    group.className = 'btn-group';
    _toolbar.appendChild(group);
    return group;
}

function createButton(parent, content, handler) {
    var btn = document.createElement('button');
    btn.type = 'button';
    parent.appendChild(btn);
    btn.onclick = handler;
    if(content) {
        btn.innerHTML = content;
    }
    return btn;
}

declare function acquireVsCodeApi() : {
    postMessage(obj:any);
};

const vscode = acquireVsCodeApi();

var minScale = 0.08;
var maxScale = 8;
declare var scale : number;
declare var uri : string;
declare var mode : string;

function normalScale() {
    if(scale < minScale) {
        scale = minScale;
    }
    else if(scale > maxScale)
    {
        scale = maxScale;
    }
    showZoom();
}

function showZoom(){
    labelZoom.innerText = (scale * 100).toFixed(0) + '%';
}

function init() {
    _toolbar = <HTMLDivElement>document.getElementById('__toolbar');
    _host = <HTMLDivElement>document.getElementById('__host');
    groupBackground = createButtonGroup();
    var btnBg = createButton(groupBackground, null, e=>{
        document.body.className='bg-trans';vscode.postMessage({action:'bg', color:'transparent'});
    });
    btnBg.title = 'Use Transparent Background';
    btnBg.className = 'btn-bg bg-trans';
    btnBg = createButton(groupBackground, null, e=>{document.body.className='bg-white';vscode.postMessage({action:'bg', color:'white'});});
    btnBg.title = 'Use White Background';
    btnBg.className = 'btn-bg bg-white';
    btnBg = createButton(groupBackground, null, e=>{document.body.className='bg-black';vscode.postMessage({action:'bg', color:'black'});});
    btnBg.title = 'Use Black Background';
    btnBg.className = 'btn-bg bg-black';
    btnBg = createButton(groupBackground, null, e=>{document.body.className='bg-custom';vscode.postMessage({action:'bg', color:'custom'});});
    btnBg.title = 'Use Custom Background\nModifty \'svg.preview.backgroundCustom\' Setting.';
    btnBg.className = 'btn-bg bg-custom';

    var groupZoom = createButtonGroup();
    labelZoom = document.createElement('span');
    labelZoom.style.fontSize = "10px";
    labelZoom.className = 'label';
    showZoom();
    groupZoom.appendChild(labelZoom);
    createButton(groupZoom, '100%', ()=>{
        scale = 1;
        showZoom();
        document.getElementById('__svg').style.transform = 'scale('+scale+')';
        vscode.postMessage({action: 'scale', scale: scale});
    }).className = 'btn';
    createButton(groupZoom, 'Zoom In', ()=>{
        scale*=2;
        normalScale();
        document.getElementById('__svg').style.transform = 'scale('+scale+')';
        vscode.postMessage({action: 'scale', scale: scale});
    }).className = 'btn';
    createButton(groupZoom, 'Zoom Out', ()=>{
        scale/=2;
        normalScale();
        document.getElementById('__svg').style.transform = 'scale('+scale+')';
        vscode.postMessage({action: 'scale', scale: scale});
    }).className = 'btn';

    groupMode = createButtonGroup();
    btnSvg = createButton(groupMode, '&lt;svg&gt;', e=>switchMode('svg'));
    btnSvg.title = 'SVG embedded in HTML';
    btnSvg.className = 'btn';
    if(mode == 'svg') {
        btnSvg.classList.add('active');
    }
    btnImg = createButton(groupMode, '&lt;img&gt;', e=>switchMode('img'));
    btnImg.title = 'Show SVG in IMG element\nThis mode displays all legitimate SVG document';
    btnImg.className = 'btn';
    if(mode == 'img') {
        btnImg.classList.add('active');
    }
    
    var groupTools = createButtonGroup();
    createButton(groupTools, 'Export PNG', ()=>{
        exportPng();
    }).className = 'btn';

    window.addEventListener('message', onmessagein);
}

function switchMode(mode: string) {
    vscode.postMessage({action:'mode', mode:mode});
    if(mode == 'svg') {
        btnSvg.className = 'btn active';
    }
    else{
        btnSvg.className = 'btn';
    }
    if(mode == 'img') {
        btnImg.className = 'btn active';
    }
    else{
        btnImg.className = 'btn';
    }
}

interface MessageData {
    action: string;
    [pn:string]: any;
}

const MessageData = {
    is: function (a:any): a is MessageData {
        return a && typeof(a.action) == 'string';
    }
};

function onmessagein(e: MessageEvent) {
    if(MessageData.is(e.data)) {
        let data = e.data;
        switch(data.action) {
            case 'selection':
                onSelection(data.offset);
        }
    }
}

function onSelection(offset: number) {
    
}

function exportImg(img) {
    let canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
    let cxt = canvas.getContext('2d');
    cxt.drawImage(img, 0, 0);
    canvas.convertToBlob({type: 'image/png'}).then(blob=>{
        var reader = new FileReader();
        reader.onload = () => {
            let result = <string>(reader.result);
            let b64 = result.replace(/^data:.+;base64,/, '');                    
            vscode.postMessage({action: 'export', b64, uri});
        };
        reader.readAsDataURL(blob);
    });
}

function exportPng(){
    try{
        let svgParent = document.getElementById('__svg');
        if(mode == 'img') {
            exportImg(svgParent.querySelector('img'));
            return;
        }
        let svg = svgParent.innerHTML;
        let img = new Image();
        img.onload = () => {
            exportImg(img);
        };
        img.onerror = e => {
            showErrorMessage('Export PNG Fail, SVG may need to be corrected.');
        };
        let svgUrl = 'data:image/svg+xml,' + encodeURIComponent(svg);
        img.src = svgUrl;
    }catch(e) {
        showErrorMessage('Export PNG Fail, SVG may need to be corrected.');
    }
}

function showErrorMessage(msg: string) {
    vscode.postMessage({action: 'showerror', msg});
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