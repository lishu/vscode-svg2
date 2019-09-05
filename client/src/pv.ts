// Previewer in webviewPanel script

let _toolbar : HTMLDivElement;
let _host : HTMLDivElement;
let groupBackground : HTMLDivElement;
let labelZoom : HTMLSpanElement;

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

    _host.addEventListener('keydown', keydown);
}

function keydown(e:KeyboardEvent) {
    labelZoom.innerText = 'keydown ' + e.key;
}

console.warn('document.readyState', document.readyState);

if(document.readyState != 'loading') {
    init();
} else {
    document.onreadystatechange = function(){
        if(document.readyState == 'interactive') {
            init();
        }
    };
} 