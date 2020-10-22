// Previewer in webviewPanel script

const SVGNS = 'http://www.w3.org/2000/svg';
const RULER_SIZE = 12;

let _toolbar : HTMLDivElement;
let _host : HTMLDivElement;
let _pixelGrid : HTMLDivElement;
let groupPrefix : HTMLDivElement;
let groupBackground : HTMLDivElement;
let groupMode : HTMLDivElement;
let labelZoom : HTMLSpanElement;
let btnSvg : HTMLButtonElement;
let btnImg : HTMLButtonElement;
let btnLocked : HTMLButtonElement;
let btnCross : HTMLButtonElement;
let btnRuler : HTMLButtonElement;
let rulerHost : HTMLDivElement;
declare var isRootLocked: boolean;
declare var isLocked : boolean;
declare var customCssFiles: number;
declare var showRuler : boolean;
declare var showCrossLine : boolean;

const bg = getVsCodeColor('--vscode-tab-activeBackground', '#333');
const numberColor = getVsCodeColor('--vscode-editorLineNumber-activeForeground', '#fff');
const lineColor = getVsCodeColor('--vscode-editorLineNumber-foreground', '#ccc');

function getVsCodeColor(varName: string, def: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(varName) || def;
}

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
    setState(obj:any);
    getState():any;
};

const vscode = acquireVsCodeApi();

var vsstate = vscode.getState();
if(vsstate && 'isLocked' in vsstate) {
    isLocked = vsstate.isLocked;
}

var minScale = 0.08;
var maxScale = 64;
var pixelGridScale = 12;
declare var scale : number;
declare var uri : string;
declare var mode : string;
type ViewMode = 'onlyOne' | 'oneByOne';
declare var viewMode : ViewMode;

enum RulerOrientation {
    Horizontal,
    Vertical
}

class RulerLine {
    canvas :HTMLCanvasElement;
    private cxt: CanvasRenderingContext2D;
    private _start: number = 0;
    private _end: number = 0;
    private _scale: number = 0;
    constructor(public orientation : RulerOrientation) {
        this.canvas = document.createElement('canvas');
        if(orientation == RulerOrientation.Horizontal) {
            this.canvas.height = RULER_SIZE;
        } else {
            this.canvas.width = RULER_SIZE;
        }
        this.cxt = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', ()=>this.resize());
    }

    
    public get start() : number {
        return this._start;
    }
    public get end() : number {
        return this._end;
    }
    public get scale() : number {
        return this._scale;
    }

    public set start(val: number) {
        if(this._start != val) {
            this._start = val;
            this.draw();
        }
    }
    public set end(val: number) {
        if(this._end != val) {
            this._end = val;
            this.draw();
        }
    }
    public set scale(val: number) {
        if(this._scale != val) {
            this._scale = val;
            this.draw();
        }
    }

    public resize() {
        if(this.orientation == RulerOrientation.Horizontal) {
            this.canvas.width = window.innerWidth - RULER_SIZE;
        } else {
            this.canvas.height = window.innerHeight - _toolbar.offsetHeight;
        }
        this.draw();
    }

    public draw() {
        const c = this.cxt;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const r1 = RULER_SIZE / 3;
        const r2 = RULER_SIZE / 2;
        c.fillStyle = bg;
        c.fillRect(0, 0, w, h);
        
        const step = 5;
        const stepPixel = step * scale;
        // log('draw start', this._start);

        c.save();

        if(this.orientation == RulerOrientation.Horizontal) {
            c.translate(-this._start, 0);
            c.beginPath();
            let textList: Array<[number, number]> = [];
            let v = 0;
            for(let n = 0; n < w + this._start; n+=stepPixel) {
                let nn = n - 0.5;     
                if(n < this._start) {
                    v+=step;
                    continue;
                }          
                if(n % 100 == 0) {
                    c.moveTo(nn, 0);
                    c.lineTo(nn, RULER_SIZE);
                    textList.push([n, v]);
                }
                else if(n % 50 == 0) {
                    c.moveTo(nn, r1);
                    c.lineTo(nn, RULER_SIZE);
                    if(scale >= 5) {
                        textList.push([n, v]);
                    }
                } else if(scale > 0.25) {
                    c.moveTo(nn, r2);
                    c.lineTo(nn, RULER_SIZE);
                    if(scale >= 10) {
                        textList.push([n, v]);
                    }
                }
                v+=step;
            }
            c.strokeStyle = lineColor;
            c.stroke();

            c.font = '9px sans-serif';
            textList.forEach(n => {
                c.fillStyle = bg;
                c.fillText(`${n[1]}`, Math.round(n[0]) + 3, 10);
                c.fillStyle = numberColor;
                c.fillText(`${n[1]}`, Math.round(n[0]) + 2, 9);
            });
        } else {
            // 先画一个左上角交互线
            c.beginPath();
            c.moveTo(RULER_SIZE-0.5, 0);
            c.lineTo(RULER_SIZE-0.5, RULER_SIZE-0.5);
            c.lineTo(0, RULER_SIZE-0.5);
            c.strokeStyle = lineColor;
            c.stroke();
            
            c.translate(0, -this._start);
            c.beginPath();
            let textList: Array<[number, number]> = [];
            let v = 0;
            for(let n = 0; n < h + this._start; n+=stepPixel) {
                let nn = n + RULER_SIZE - 0.5;  
                if(n < this._start) {
                    v+=step;
                    continue;
                } 
                if(n % 100 == 0) {
                    c.moveTo(0, nn);
                    c.lineTo(RULER_SIZE, nn);
                    textList.push([n, v]);
                }
                else if(n % 50 == 0) {
                    c.moveTo(r1, nn);
                    c.lineTo(RULER_SIZE, nn);
                    if(scale >= 5) {
                        textList.push([n, v]);
                    }
                } else if(scale > 0.25) {
                    c.moveTo(r2, nn);
                    c.lineTo(RULER_SIZE, nn);
                    if(scale >= 10) {
                        textList.push([n, v]);
                    }
                }
                v+=step;
            }
            c.strokeStyle = lineColor;
            c.stroke();

            c.font = '9px sans-serif';
            textList.forEach(n => {
                c.save();
                c.translate(3, Math.round(n[0]) + RULER_SIZE + 2);
                c.rotate(Math.PI / 2);
                c.fillStyle = bg;
                c.fillText(`${n[1]}`, 1, 1);
                c.fillStyle = numberColor;
                c.fillText(`${n[1]}`, 0, 0);
                c.restore();
            });
        }

        c.restore();
    }
    
}

function getCurrentSvg() : SVGSVGElement | HTMLImageElement {
    return _host.querySelector('#__svg>svg') || _host.querySelector('#__svg>img');
}

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
    requestAnimationFrame(()=>{
        if(scale < pixelGridScale) {
            _pixelGrid.style.width = '0px';
            _pixelGrid.style.height = '0px';
        } else {
            _pixelGrid.style.width = `${_host.scrollWidth}px`;
            _pixelGrid.style.height = `${_host.scrollHeight}px`;
            let pgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${scale}" height="${scale}" viewBox="0 0 ${scale} ${scale}"><path d="M${scale} 0v${scale}h-${scale}" stroke="#808080" stroke-opacity=".5" fill-opacity="0" /></svg>`;
            _pixelGrid.style.backgroundImage = `url(data:image/svg+xml;base64,${btoa(pgSvg)})`;
        }
    });
}

function switchViewMode() {
    if(isLocked) {
        vscode.postMessage({action: 'unlock'});
    } else {
        vscode.postMessage({action: 'lock'});
    }
}

function onResize() {
    document.body.style.marginTop = _toolbar.offsetHeight + 'px';
    rulerHost.style.top = _toolbar.offsetHeight + 'px';
}

function crossSwitch() {
    showCrossLine = !showCrossLine;
    applyCross();
    vscode.postMessage({action: 'cross', value: showCrossLine});
}

function rulerSwitch() {
    showRuler = !showRuler;
    applyRuler();
    vscode.postMessage({action: 'ruler', value: showRuler});
}

function log(...data) {
    console.log(...data);
    vscode.postMessage({action: 'log', data});
}

var rulerX : RulerLine;
var rulerY : RulerLine;
function updateRuler() {
    if(!rulerX) {
        rulerX = new RulerLine(RulerOrientation.Horizontal);
        rulerX.canvas.style.cssText = `position:absolute;left:${RULER_SIZE}px;`;
        rulerHost.appendChild(rulerX.canvas);
    }
    if(!rulerY) {
        rulerY = new RulerLine(RulerOrientation.Vertical);
        rulerY.canvas.style.cssText = `position:absolute;top:0px;`;
        rulerHost.appendChild(rulerY.canvas);
    }
}

function applyRuler() {
    if(showRuler) {
        btnRuler.classList.add('active');
        document.body.classList.add('with-ruler');
        rulerHost.style.display = '';
        updateRuler();
    } else {
        btnRuler.classList.remove('active');
        document.body.classList.remove('with-ruler');
        rulerHost.style.display = 'none';
    }
}

function sizeUiFromSvg() {
    let currentSvg = getCurrentSvg();
    _pixelGrid.style.left = `${12 / scale}px`;
    _pixelGrid.style.top = `${12 / scale}px`;
    if(currentSvg) {
        let rect = currentSvg.getBoundingClientRect();
        // _host.style.minWidth = `${rect.width}px`;
        // _host.style.minHeight = `${rect.height}px`;
    }
    rulerX && rulerX.draw();
    rulerY && rulerY.draw();
    if(crossXElement) {
        crossXElement.style.height = `${scale * 100}%`;
    }
    if(crossYElement) {
        crossYElement.style.width = `${scale * 100}%`;
    }
}

function changeBgClass(bg: string) {
    document.body.classList.remove('bg-trans', 'bg-white', 'bg-black', 'bg-custom');
    document.body.classList.add(bg);
}

function init() {
    _toolbar = <HTMLDivElement>document.getElementById('__toolbar');
    _host = <HTMLDivElement>document.getElementById('__host');
    _pixelGrid = <HTMLDivElement>document.querySelector('#__host>.--pixel-grid');
    rulerHost = <HTMLDivElement>document.getElementById('__rulerHost');
    let currentSvg = getCurrentSvg();
    if(currentSvg) {
        // @ts-ignore:disable-next-line
        let resizeObserver = new ResizeObserver(entries => {
            if('getScreenCTM' in currentSvg) {
                // log('svg viewbox', JSON.stringify(currentSvg.viewBox.baseVal));
                // log(`svg client {left: ${currentSvg.clientLeft}, top: ${currentSvg.clientTop}, width: ${currentSvg.clientWidth}, height: ${currentSvg.clientHeight} }`);
            }
        });
        resizeObserver.observe(currentSvg);
    }
    
    if(!isRootLocked) {
        groupPrefix = createButtonGroup();
        btnLocked = createButton(groupPrefix, `<svg viewBox="0 0 1024 1024" width="16" height="16" style="background-color:transparent">
        <path d="M989.57691363 296.58232795L715.22421854 22.2296339c-28.45139082-28.45139082-73.16071896-28.45139082-101.61210978 0s-28.45139082 73.16071896 0 101.61210876l14.22569592 14.22569489-329.22323431 217.44991448-10.16121107-10.16121109c-28.45139082-28.45139082-73.16071896-28.45139082-101.61210876 0s-28.45139082 73.16071896 0 101.61210875l146.32143689 146.32143793L32.39084396 894.0615311c-28.45139082 28.45139082-28.45139082 75.19296036 0 103.64435118 28.45139082 28.45139082 75.19296036 28.45139082 103.6443522 0L436.80703964 694.90179638l128.03125716 128.03125819c28.45139082 28.45139082 73.16071896 28.45139082 101.61210876 0s28.45139082-73.16071896 0-101.61210979l-10.16121005-10.16121108 215.41767101-331.2554757 14.22569593 14.22569489c28.45139082 28.45139082 73.16071896 28.45139082 101.61210875 0 28.45139082-24.38690598 28.45139082-69.09623412 2.03224243-97.54762494z" p-id="4526" fill="currentColor"></path>
        </svg>`, e=>switchViewMode());
        btnLocked.className = 'btn';
        btnLocked.title = 'Locked or Unlocked SVG document';
        if(isLocked) {
            btnLocked.classList.add('locked');
        }
    }

    groupBackground = createButtonGroup();
    var btnBg = createButton(groupBackground, null, e=>{
        changeBgClass('bg-trans');vscode.postMessage({action:'bg', color:'transparent'});
    });
    btnBg.title = 'Use Transparent Background';
    btnBg.className = 'btn-bg bg-trans';
    btnBg = createButton(groupBackground, null, e=>{changeBgClass('bg-white');vscode.postMessage({action:'bg', color:'white'});});
    btnBg.title = 'Use White Background';
    btnBg.className = 'btn-bg bg-white';
    btnBg = createButton(groupBackground, null, e=>{changeBgClass('bg-black');vscode.postMessage({action:'bg', color:'black'});});
    btnBg.title = 'Use Black Background';
    btnBg.className = 'btn-bg bg-black';
    btnBg = createButton(groupBackground, null, e=>{changeBgClass('bg-custom');vscode.postMessage({action:'bg', color:'custom'});});
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
        sizeUiFromSvg();
    }).className = 'btn';
    createButton(groupZoom, 'Zoom In', ()=>{
        scale*=2;
        normalScale();
        document.getElementById('__svg').style.transform = 'scale('+scale+')';
        vscode.postMessage({action: 'scale', scale: scale});
        sizeUiFromSvg();
    }).className = 'btn';
    createButton(groupZoom, 'Zoom Out', ()=>{
        scale/=2;
        normalScale();
        document.getElementById('__svg').style.transform = 'scale('+scale+')';
        vscode.postMessage({action: 'scale', scale: scale});
        sizeUiFromSvg();
    }).className = 'btn';

    var groupView = createButtonGroup();
    btnCross = createButton(groupView, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12">
    <path d="M5.5,4.5h2v2h-2z M6.5,0v3M6.5,8v3M1,5.5h3M9,5.5h3" stroke-width="1" stroke="currentcolor" />
</svg>`, crossSwitch);
    btnCross.title = 'Show Crossline';
    btnCross.className='btn';
    btnRuler = createButton(groupView, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12">
    <path d="M0,4.5h12M4.5,0v12M7.5,4v-2M10.5,4v-3M4,7.5h-2M4,10.5h-3" stroke-width="1" stroke="currentcolor" />
</svg>`, rulerSwitch);
    btnRuler.title = 'Show Ruler';
    btnRuler.className='btn';
    if(showRuler) {
        btnRuler.classList.add('active');
    }

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

    if(mode == 'svg') {
        var groupCss = createButtonGroup();
        var btnSelectCss = createButton(groupCss, 'CSS' + (customCssFiles > 0 ? `<span class="label">${customCssFiles}</span>` : ''), e=>selectCss());
        btnSelectCss.title = 'Select CSS Files for preview SVG';
        btnSelectCss.className = 'btn';
    }
    
    var groupTools = createButtonGroup();
    createButton(groupTools, 'Export PNG', ()=>{
        exportPng();
    }).className = 'btn';

    window.addEventListener('message', onmessagein);
    window.addEventListener('resize', onResize);
    _host.addEventListener('mouseenter', showCross);
    _host.addEventListener('mousemove', showCross);
    _host.addEventListener('mouseleave', hideCross);
    window.addEventListener('scroll', onScroll);
    onResize();

    applyCross();
    applyRuler();
}

function onScroll() {
    // log('scroll', document.body.scrollLeft, document.documentElement.scrollTop);
    if(rulerX) {
        rulerX.start = document.documentElement.scrollLeft;
    }
    if(rulerY) {
        rulerY.start = document.documentElement.scrollTop;
    }
}

let crossXElement : HTMLElement | null = null;
let crossYElement : HTMLElement | null = null;

function showCross(e: MouseEvent) {
    if(!showCrossLine){
        return;
    }
    if(!crossXElement) {
        crossXElement = document.createElement('div');
        crossXElement.style.position = 'absolute';
        crossXElement.style.top = '0px';
        crossXElement.style.height = '100%';
        crossXElement.style.width = '1px';
        crossXElement.style.backgroundColor = 'var(--vscode-foreground)';
        crossXElement.style.opacity = "0.5";
        crossXElement.style.zIndex = "1000";
        crossXElement.style.cssText += 'mix-blend-mode: difference;';
        _host.appendChild(crossXElement);
    }
    if(!crossYElement) {
        crossYElement = document.createElement('div');
        crossYElement.style.position = 'absolute';
        crossYElement.style.left = '0px';
        crossYElement.style.width = '100%';
        crossYElement.style.height = '1px';
        crossYElement.style.backgroundColor = 'var(--vscode-foreground)';
        crossYElement.style.opacity = "0.5";
        crossYElement.style.zIndex = "1000";
        crossYElement.style.cssText += 'mix-blend-mode: difference;';
        _host.appendChild(crossYElement);
    }
    crossXElement.style.display = 'block';
    crossYElement.style.display = 'block';
    if(showRuler) {
        if(crossXElement) {
            crossXElement.style.height = `${scale * 100}%`;
        }
        if(crossYElement) {
            crossYElement.style.width = `${scale * 100}%`;
        }
        crossXElement.style.left = `${e.pageX - RULER_SIZE}px`;
        crossYElement.style.top = `${e.pageY - RULER_SIZE - _toolbar.offsetHeight}px`;        
    }
    else {
        crossXElement.style.left = `${e.pageX}px`;
        crossYElement.style.top = `${e.pageY - _toolbar.offsetHeight}px`;
    }
}

function hideCross(e?: MouseEvent) {
    if(crossXElement){
        crossXElement.style.display = 'none';
        crossYElement.style.display = 'none';
    }
}

function applyCross() {
    if(showCrossLine) {
        _host.style.cursor = 'none';
        btnCross.classList.add('active');        
        if(crossXElement) {
            crossXElement.style.height = `${scale * 100}%`;
        }
        if(crossYElement) {
            crossYElement.style.width = `${scale * 100}%`;
        }
    } else {
        _host.style.cursor = 'default';
        btnCross.classList.remove('active');
        hideCross();
    }
}

function selectCss() {
    vscode.postMessage({action: 'selectcss'});
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
                break;
            case 'changeLock':
                onChangeLock(data.value);
                break;
        }
    }
}

function onSelection(offset: number) {
    
}

function onChangeLock(locked: boolean) {
    if(isLocked == locked){
        return;
    }
    isLocked = locked;
    vscode.setState({
        isLocked
    });
    if(isLocked) {
        btnLocked.classList.add('locked');
    } else {
        btnLocked.classList.remove('locked');
    }
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