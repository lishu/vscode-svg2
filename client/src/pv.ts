// Previewer in webviewPanel script

// ZoomComboBox
const cssStyle = `
.wrapper {
    position: relative;
}
.wrapper input {
    width: 3.5em;
    border: none 0;
    background-color: var(--vscode-welcomepage-buttonBackground);
    color: var(--vscode-input-foreground);
    outline: none 0;
    text-align: center;
}
.wrapper.active input,
.wrapper input:hover,
.wrapper input:focus {
    background-color: var(--vscode-input-background);
}
.wrapper input::focus-visible {
    outline: none 0;
}

.wrapper .popup {
    display: none;
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    z-index: 1000;
    background-color: var(--vscode-dropdown-background);
    color: var(--vscode-dropdown-foreground);
    border: solid 1px var(--vscode-dropdown-border);
    
}
.wrapper .popup .item {
    background-color: var(--vscode-dropdown-listBackground);
    padding: 1px 3px;
    cursor: default;
    text-align: right;
}
.wrapper .popup .item:hover {
    background-color: var(--vscode-list-hoverBackground);
}
.wrapper.active .popup {
    display: block;
}
`;

interface ZoomComboBoxItem {
    value: string;
    label: string;
}

/**
 * 提供缩放组件的编辑与选择功能
 */
class ZoomComboBox extends HTMLElement {
    readonly wrapper: HTMLSpanElement;
    readonly input : HTMLInputElement;
    readonly popup : HTMLDivElement;
    private inputHasFocus = false;
    private inputValueWhenFocus: string | undefined;
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        const wrapper = document.createElement('span');
        const input = document.createElement('input');
        const popup = document.createElement('div');
        const style = document.createElement('style');

        wrapper.className = 'wrapper';

        // input.addEventListener('input', ev => {
        //     this.dispatchEvent(ev);
        // });
        input.addEventListener('focus', ev => {
            input.select();
            this.inputValueWhenFocus = undefined;
            this.inputHasFocus = true;
            this.active = true;
        });
        input.addEventListener('blur', () => {
            this.inputHasFocus = false;
            if (this.inputValueWhenFocus) {
                this.value = this.inputValueWhenFocus
            }
            if (this.active) {
                setTimeout(() => {
                    this.active = false;
                }, 50);
            }
        })

        popup.className = "popup";

        style.textContent = cssStyle;


        wrapper.appendChild(input);
        wrapper.appendChild(popup);
        shadow.appendChild(wrapper);
        shadow.appendChild(style);
        this.input = input;
        this.popup = popup;
        this.wrapper = wrapper;
    }

    dispatchInputEvent(value: string) {
        this.value = value;
        const ev = new CustomEvent('input');
        this.dispatchEvent(ev);
    }

    itemClick(e: MouseEvent) {
        if (e.target && e.target instanceof HTMLDivElement) {
            if(e.target.hasAttribute('value')) {
                const value = e.target.getAttribute('value')!;
                this.inputHasFocus = false;
                this.dispatchInputEvent(value);
            }
        }
        this.active = false;
    }

    get active() {
        return this.wrapper.classList.contains('active');
    }

    set active(active: boolean) {
        if (active && !this.wrapper.classList.contains('active')) {
            this.wrapper.classList.add('active');
        }
        else if (!active && this.wrapper.classList.contains('active')) {
            this.wrapper.classList.remove('active');
        }
    }

    get value() {
        return this.input.value;
    }

    set value(value: string) {
        console.debug('set value', value);
        if (this.inputHasFocus) {
            this.inputValueWhenFocus = value;
        } else {
            this.input.value = value;
        }
    }

    private _items: ZoomComboBoxItem[] = [];
    get items () {
        return this._items;
    }
    set items (items: ZoomComboBoxItem[]) {
        this._items = items;
        for(let index = 0; index < this._items.length; index++) {
            const item = this._items[index];
            if (this.popup.childElementCount > index) {
                const el = this.popup.children.item(index) as HTMLDivElement;
                el.innerText = item.label;
                el.setAttribute('value', `${item.value}`);
            }
            else {
                const el = document.createElement('div');
                el.className = 'item';
                el.innerText = item.label;
                el.setAttribute('value', `${item.value}`);
                el.addEventListener('mousedown', e => this.itemClick(e));
                this.popup.appendChild(el);
            }
        }
        while(this.popup.childElementCount > this._items.length) {
            this.popup.children.item(this._items.length)?.remove();
        }
    }

    set zoomOptions(options: string) {
        if (options) {
            const items: ZoomComboBoxItem[] = [];
            for(const opt of options.split(',')) {
                if (/^\d+%$/.test(opt)) {
                    items.push({
                        value: opt,
                        label: opt
                    })
                } else {
                    console.warn(`zoom option ${opt} is not match and ignore`);
                }
            }
            this.items = items;
        }
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        console.debug('attributeChangedCallback', name, oldValue, newValue);
    }
}

// 注册 Web 组件

declare namespace global {
    interface Document {
        createElement(tagName: 'zoom-combobox', options?: ElementCreationOptions): HTMLElement;
    }
}

window.customElements.define('zoom-combobox', ZoomComboBox);

// 页面功能
const SVGNS = 'http://www.w3.org/2000/svg';
const RULER_SIZE = 12;

let _toolbar : HTMLDivElement;
let _host : HTMLDivElement;
let _svgContainer : HTMLDivElement;
let _pixelGrid : HTMLDivElement;
let groupPrefix : HTMLDivElement;
let groupBackground : HTMLDivElement;
let groupMode : HTMLDivElement;
let zoomComboBox : ZoomComboBox;
let btnSvg : HTMLButtonElement;
let btnImg : HTMLButtonElement;
let btnLocked : HTMLButtonElement;
let btnCross : HTMLButtonElement;
let btnRuler : HTMLButtonElement;
let btnZoomFit : HTMLButtonElement;
let btnZoomIn : HTMLButtonElement;
let btnZoomOut : HTMLButtonElement;
let btnCodeInteractive : HTMLButtonElement;
declare var debug: boolean;
declare var isRootLocked: boolean;
declare var isLocked : boolean;
declare var customCssFiles: number;
declare var showRuler : boolean;
declare var showCrossLine : boolean;
declare var autoFit: boolean;
declare var domains: string[];
declare var fitMode: boolean | undefined;
declare var scaleZoom: number;
declare var zoomOptions: string;

// 当前高亮边框效果所在的 SVG 图形
let activeSvgSharp : SVGGraphicsElement | null;
let svgSize : ISvgSize | null = null;
let codeInteractive = !!sessionStorage.getItem('codeInteractive');

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

function createButton(parent: HTMLElement, content: string | null, handler: (e:MouseEvent)=>void, attributes?: Record<string, string>) {
    var btn = document.createElement('button');
    btn.type = 'button';
    parent.appendChild(btn);
    btn.onclick = handler;
    if(content) {
        btn.innerHTML = content;
    }
    if(attributes) {
        for(let pn in attributes) {
            btn.setAttribute(pn, attributes[pn]);
        }
    }
    return btn;
}

declare function acquireVsCodeApi() : {
    postMessage(obj:any):any;
    setState(obj:any):any;
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
declare var scale : number ;
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
        this.cxt = this.canvas.getContext('2d')!;
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
    return _host.querySelector('#__svg>svg') || _host.querySelector('#__svg>img')!;
}

function normalScale(updateZoom = true) {
    if (scale === undefined) {
        scale = 1;
    }
    else if(scale < minScale) {
        scale = minScale;
    }
    else if(scale > maxScale)
    {
        scale = maxScale;
    }
    if (updateZoom) {
        showZoom(false);
    }
}

function exitFitMode(sendToServer = true) {
    console.debug('exitFitMode');
    const svg = getCurrentSvg();
    btnZoomIn.style.display = '';
    btnZoomOut.style.display = '';
    svg.style.transform = '';
    svg.style.transformOrigin = '';
    if(svgSize) {
        svg.style.width = `${svgSize.width}px`;
        svg.style.height = `${svgSize.height}px`
    }
    fitMode = false;
    if (sendToServer) {
        vscode.postMessage({action: 'fitMode', fitMode});
    }
}

function showZoom(exitFit = true){
    if(exitFit && fitMode) {
        exitFitMode();
    }
    if(scale < 0.01) {
        zoomComboBox.value = (scale * 1000).toFixed(2) + '‰';
    } else {
        zoomComboBox.value = (scale * 100).toFixed(0) + '%';
    }
    requestAnimationFrame(()=>{
        if(scale < pixelGridScale) {
            _pixelGrid.style.width = '0px';
            _pixelGrid.style.height = '0px';
        } else {
            _pixelGrid.style.width = `${_svgContainer.scrollWidth}px`;
            _pixelGrid.style.height = `${_svgContainer.scrollHeight}px`;
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

function getSvgUnitTypeName(unitType: number) {
    switch(unitType) {
        case 1:
            return '';
        case 2:
            return '%';
        case 3:
            return 'ems';
        case 4:
            return 'exs';
        case 5:
            return 'px';
        case 6:
            return 'cm';
        case 7:
            return 'mm';
        case 8:
            return 'in';
        case 9:
            return 'pt';
        case 10:
            return 'pc';
        default:
            return 'auto';
    }
}

interface ISvgSize {
    width: number | SVGLength,
    height: number | SVGLength,
    viewBox?: DOMRect,
    bbox?: DOMRect,
    canFit: boolean,
    canZoom: boolean
}

function tryGetSvgSize() : ISvgSize | null {
    const svg = getCurrentSvg();
    if(svg) {
        if(svg instanceof HTMLImageElement) {
            return {
                width: svg.naturalWidth,
                height: svg.naturalHeight,
                canFit: true,
                canZoom: true,
            }
        }
        if(svg instanceof SVGSVGElement) {
            const s : ISvgSize = {
                width: svg.width?.baseVal,
                height: svg.height?.baseVal,
                viewBox: svg.viewBox?.baseVal,
                bbox: svg.getBBox(),
                canFit: svg.width?.baseVal?.unitType<2 && svg.height?.baseVal?.unitType<2,
                canZoom: svg.width?.baseVal?.unitType > 0,
            }
            if(s.viewBox && s.viewBox.width && s.viewBox.height) {
                s.width = s.viewBox.width;
                s.height = s.viewBox.height;
                s.canFit = true;
                s.canZoom = true;
            }
            return s;
        }
        console.warn("Not Found SVG element");
    } else {
        console.error('Not Found SVG element');
    }
    return null;
}

function showSvg(show: boolean = true) {
    const svg = getCurrentSvg();
    if(svg) {
        svg.style.visibility = show ? 'visible' : 'hidden';
    }
}

let canZoom = true;
function setCanZoom(can: boolean) {
    canZoom = can;
    btnZoomIn.style.display = canZoom ? '' : 'none';
    btnZoomOut.style.display = canZoom ? '' : 'none';
    showSvg();
}

function onResize() {
    if(!svgSize) {
        svgSize = tryGetSvgSize();
    }
    btnZoomFit.style.display = svgSize?.canFit ? '' : 'none';
    if(fitMode) {
        applyFitLayout();
    } else {
        setCanZoom(svgSize?.canZoom || false);
    }
}

function applyScale() {
    if(!svgSize) {
        svgSize = tryGetSvgSize();
    }
    const useFit = svgSize?.canFit && fitMode;
    if (useFit) {
        applyFitLayout();
    } else {
        applyScaleLayout();
    }
}

function applyScaleLayout() {
    normalScale();
}

function switchCodeInteractive() {
    codeInteractive = !codeInteractive;
    if(codeInteractive) {
        btnCodeInteractive.classList.add('active');
    } else {
        btnCodeInteractive.classList.remove('active');
    }
    sessionStorage.setItem('codeInteractive', codeInteractive ? 'YES' : '');
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

function log(...data: any) {
    console.log(...data);
    vscode.postMessage({action: 'log', data});
}

var rulerX : RulerLine;
var rulerY : RulerLine;
function updateRuler() {
    if(!rulerX) {
        rulerX = new RulerLine(RulerOrientation.Horizontal);
        document.getElementById('__rule_h_host')!.appendChild(rulerX.canvas);
    }
    if(!rulerY) {
        rulerY = new RulerLine(RulerOrientation.Vertical);
        document.getElementById('__rule_v_host')!.appendChild(rulerY.canvas);
    }
}

function applyRuler() {
    if(showRuler) {
        btnRuler.classList.add('active');
        document.body.classList.add('with-ruler');
        updateRuler();
    } else {
        btnRuler.classList.remove('active');
        document.body.classList.remove('with-ruler');
    }
}

function findInspectElement(e: MouseEvent) : SVGGraphicsElement | null
{
    const findGrapics = (target: Node | EventTarget | null): SVGGraphicsElement | null => {
        if(target instanceof SVGGraphicsElement && 'inspectLine' in target.dataset) {
            return target;
        }
        if(target instanceof Node && target.parentElement instanceof Element) {
            if(target.parentElement === target) {
                return null;
            }
            return findGrapics(target.parentElement);
        }
        return null;
    };
    return findGrapics(e.target);
}

function activeInspect(newElement: SVGGraphicsElement | null) {
    if(activeSvgSharp) {
        activeSvgSharp.classList.remove('__active_svg_sharp__');
    }
    activeSvgSharp = newElement;
    if(activeSvgSharp) {
        activeSvgSharp.classList.add('__active_svg_sharp__');
    }
}

function applyInspectBind() {
    const svgRoot = document.getElementById('__svg')!;
    svgRoot.addEventListener('mouseenter', e => {
        // console.log(e);
        if(!codeInteractive) {
            return;
        }
        const inElement = findInspectElement(e);
        if(inElement) {
            activeInspect(inElement);
        }
    }, { capture: true, passive: true });
    svgRoot.addEventListener('mouseleave', e => {
        // console.log(e);
        const inElement = findInspectElement(e);
        if(inElement && inElement === activeSvgSharp) {
            activeInspect(null);
        }
    }, { capture: true, passive: true });
    svgRoot.addEventListener('click', e => {
        // console.log(e);
        if(!codeInteractive) {
            return;
        }
        const inElement = findInspectElement(e);
        if(inElement && 'inspectLine' in inElement.dataset) {
            vscode.postMessage({
                action:'toLine', 
                line:inElement.dataset.inspectLine,
                column:inElement.dataset.inspectColumn,
            })
        }
    }, { capture: true, passive: true });
}

function sizeUiFromSvg() {
    let currentSvg = getCurrentSvg();
    // _pixelGrid.style.left = `${12 / scale}px`;
    // _pixelGrid.style.top = `${12 / scale}px`;
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
    document.body.classList.remove('bg-trans', 'bg-dark-trans', 'bg-white', 'bg-black', 'bg-custom');
    document.body.classList.add(bg);
}

function applyFitLayout() {
    if(!svgSize) {
        return;
    }
    const cw = innerWidth - _svgContainer.offsetLeft;
    const ch = innerHeight - _svgContainer.offsetTop;
    const cp = cw / ch;
    const sw = typeof(svgSize.width) === 'number' ? svgSize.width : svgSize.width?.value;
    const sh = typeof(svgSize.height) === 'number' ? svgSize.height : svgSize.height?.value;
    const sp = sw / sh;
    const wm = sp > cp;
    const padding = 20; // 保留边距
    const waitScale = wm ? ((cw - padding * 2) / sw) : ((ch - padding * 2) / sh);
    const svg = getCurrentSvg();
    const tl = (cw - padding * 2 - waitScale * sw) / 2;
    const tt = (ch - padding * 2 - waitScale * sh) / 2;
    console.log('fit scale', waitScale, tl + padding, tt + padding, cw, ch, sw, sh);
    if(typeof sw === 'number' && sw > 0 && typeof sh === 'number' && sh > 0) {
        minScale = Math.min(waitScale, 0.08);
    } else {
        minScale = 0.08;
    }
    svg.style.transformOrigin = 'left top';
    svg.style.width = `${sw}px`;
    svg.style.height = `${sh}px`;
    svg.style.transform = `translate(${tl + padding}px, ${tt + padding}px) scale(${waitScale})`;
}

function enterFitMode() {
    console.debug('enterFitMode');
    if(scale !== 1) {
        doResetZoom();
    }
    fitMode = true;
    vscode.postMessage({action: 'fitMode', fitMode});
    btnZoomIn.style.display = 'none';
    btnZoomOut.style.display = 'none';
    zoomComboBox.value = "FIT";
    applyFitLayout();
}

function doFit() {
    document.getElementById('__svg')!.style.transform = '';
    if(svgSize?.canFit) {
        if(!fitMode) {
            enterFitMode();
        }
    } else {
        console.warn("Can not Fit");
    }
}

function doResetZoom() {
    if(!svgSize!.canZoom) {
        return;
    }
    scale = 1;
    showZoom();
    document.getElementById('__svg')!.style.transform = 'scale('+scale+')';
    vscode.postMessage({action: 'scale', scale: scale});
    sizeUiFromSvg();
}

function doZoomIn() {
    if(!svgSize!.canZoom) {
        return;
    }
    scale*=scaleZoom;
    normalScale();
    document.getElementById('__svg')!.style.transform = 'scale('+scale+')';
    vscode.postMessage({action: 'scale', scale: scale});
    sizeUiFromSvg();
}

function doZoomOut() {
    if(!svgSize!.canZoom) {
        return;
    }
    scale/=scaleZoom;
    normalScale();
    document.getElementById('__svg')!.style.transform = 'scale('+scale+')';
    vscode.postMessage({action: 'scale', scale: scale});
    sizeUiFromSvg();
}

function doZoomTo(newScale: number) {
    if(!svgSize!.canZoom) {
        return;
    }
    scale = newScale;
    normalScale();
    document.getElementById('__svg')!.style.transform = 'scale('+scale+')';
    vscode.postMessage({action: 'scale', scale: scale});
    sizeUiFromSvg();
}

function zoomInputHandler(e: Event) {
    console.log('zoomInputHandler', zoomComboBox.value);
    let zoomStr = zoomComboBox.value;
    if (/^\d+$/.test(zoomStr)) {
        zoomStr = zoomStr + '%';
    }
    if (/^\d+%$/.test(zoomStr)) {
        let willZoomTo = Number(zoomStr.substring(0, zoomStr.length - 1)) * 0.01;
        if (willZoomTo < minScale) {
            willZoomTo = minScale;
        } else if (willZoomTo > maxScale) {
            willZoomTo = maxScale;
        }
        doZoomTo(willZoomTo);
    }
}

function init() {
    _toolbar = <HTMLDivElement>document.getElementById('__toolbar');
    _host = <HTMLDivElement>document.getElementById('__host');
    _svgContainer = <HTMLDivElement>document.getElementById('__svg_container');
    _pixelGrid = <HTMLDivElement>document.querySelector('#__host .--pixel-grid');
    // let currentSvg = getCurrentSvg();
    // if(currentSvg) {
    //     // @ts-ignore:disable-next-line
    //     let resizeObserver = new ResizeObserver(entries => {
    //         if('getScreenCTM' in currentSvg) {
    //             // log('svg viewbox', JSON.stringify(currentSvg.viewBox.baseVal));
    //             // log(`svg client {left: ${currentSvg.clientLeft}, top: ${currentSvg.clientTop}, width: ${currentSvg.clientWidth}, height: ${currentSvg.clientHeight} }`);
    //         }
    //     });
    //     resizeObserver.observe(currentSvg);
    // }
    
    if(!isRootLocked) {
        groupPrefix = createButtonGroup();
        btnLocked = createButton(groupPrefix, `<i class="codicon codicon-pin"></i>`, e=>switchViewMode());
        btnLocked.className = 'btn';
        btnLocked.title = 'Locked or Unlocked SVG document';
        if(isLocked) {
            btnLocked.firstElementChild!.classList.remove('codicon-pin');
            btnLocked.firstElementChild!.classList.add('codicon-pinned');
            btnLocked.classList.add('active');
        }
    }

    groupBackground = createButtonGroup();
    var btnBg = createButton(groupBackground, null, e=>{
        changeBgClass('bg-editor');vscode.postMessage({action:'bg', color:'editor'});
    });
    btnBg.title = 'Use Editor Background';
    btnBg.className = 'btn-bg bg-editor';
    btnBg = createButton(groupBackground, null, e=>{
        changeBgClass('bg-trans');vscode.postMessage({action:'bg', color:'transparent'});
    });
    btnBg.title = 'Use Transparent Background';
    btnBg.className = 'btn-bg bg-trans';
    btnBg = createButton(groupBackground, null, e=>{
        changeBgClass('bg-dark-trans');vscode.postMessage({action:'bg', color:'dark-transparent'});
    });
    btnBg.title = 'Use Dark Transparent Background';
    btnBg.className = 'btn-bg bg-dark-trans';
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
    zoomComboBox = document.createElement('zoom-combobox') as ZoomComboBox;
    zoomComboBox.zoomOptions = zoomOptions;
    zoomComboBox.addEventListener('input', zoomInputHandler);
    groupZoom.appendChild(zoomComboBox);
    createButton(groupZoom, '<i class="codicon codicon-screen-normal"></i>', doResetZoom, { title: 'Zoom To 100%', 'class': 'btn'});
    btnZoomFit = createButton(groupZoom, '<i class="codicon codicon-screen-full"></i>', doFit, { title: 'Fit'});
    btnZoomFit.className = 'btn';
    btnZoomIn = createButton(groupZoom, '<i class="codicon codicon-zoom-in"></i>', doZoomIn, { title: 'Zoom In', 'class': 'btn' });
    btnZoomOut = createButton(groupZoom, '<i class="codicon codicon-zoom-out"></i>', doZoomOut, { title: 'Zoom Out', 'class': 'btn' });
    showZoom(false);

    var groupView = createButtonGroup();
    btnCodeInteractive = createButton(groupView, `<i class="codicon codicon-arrow-swap"></i>`, switchCodeInteractive, {
        class: 'btn' + (codeInteractive ? ' active' : ''),
        title: 'Code interactive'
    });
    btnCross = createButton(groupView, `<i class="codicon codicon-add"></i>`, crossSwitch);
    btnCross.title = 'Show Crossline';
    btnCross.className='btn';
    btnRuler = createButton(groupView, `<i class="codicon codicon-symbol-ruler"></i>`, rulerSwitch);
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
        var btnSelectCss = createButton(groupCss, '<i class="codicon codicon-files"></i>' + (customCssFiles > 0 ? `<span class="label">${customCssFiles}</span>` : ''), e=>selectCss());
        btnSelectCss.title = 'Select CSS Files for preview SVG';
        btnSelectCss.className = 'btn';
    }
    
    var groupTools = createButtonGroup();
    createButton(groupTools, '<i class="codicon codicon-export"></i>', ()=>{
        exportPng();
    }, {
        title: 'Export PNG'
    }).className = 'btn';

    if(domains.length) {
        createButton(_toolbar, '<i class="codicon codicon-warning"></i>', () => {}, {
            class: 'btn-label-error',
            title: `Has ${domains.length} domains maybe cause CORS:\n` + domains.map(d => d.toLowerCase()).join('\n')
        });
    }

    window.addEventListener('wheel', e => {
        console.log('window wheel', e);
        if(e.ctrlKey || e.metaKey) {
            if(e.deltaY < 0) {
                doZoomIn();
            } else if(e.deltaY > 0) {
                doZoomOut();
            }
        }
    });

    window.addEventListener('keypress', e => {
        console.log('window keypress', e);
        if(e.ctrlKey || e.metaKey) {
            
        }
    });

    window.addEventListener('message', onmessagein);
    // window.addEventListener('resize', onResize);
    _host.addEventListener('mouseenter', showCross);
    _host.addEventListener('mousemove', showCross);
    _host.addEventListener('mouseleave', hideCross);
    _svgContainer.addEventListener('scroll', onScroll);
    onResize();
    console.debug('init svgSize', svgSize, scale);
    if(svgSize!.canFit && autoFit && fitMode !== false) {
        console.debug('autoFit');
        fitMode = true;
        vscode.postMessage({action: 'fitMode', fitMode});
        enterFitMode();
    } else {
        console.debug('normalScale');
        normalScale();
        exitFitMode(false);
        document.getElementById('__svg')!.style.transform = 'scale('+scale+')';
        // const currentSvg = getCurrentSvg();
        // if (currentSvg) {
        //     currentSvg.style.width = svgSize!.width + 'px';
        //     currentSvg.style.height = svgSize!.height + 'px';
        // } else {
        //     console.warn('currentSvg is null');
        // }
        // sizeUiFromSvg();
    }

    const observer = new ResizeObserver(es => {
        onResize();
    });
    observer.observe(_svgContainer);

    applyCross();
    applyRuler();
    applyInspectBind();
}

function onScroll() {
    // log('scroll', document.body.scrollLeft, document.documentElement.scrollTop);
    if(rulerX) {
        rulerX.start = _svgContainer.scrollLeft;
    }
    if(rulerY) {
        rulerY.start = _svgContainer.scrollTop;
    }
    _pixelGrid.style.transform = `translate(${-_svgContainer.scrollLeft}px, ${-_svgContainer.scrollTop}px)`;
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
        crossYElement!.style.display = 'none';
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

function doHotReload(id: string) {
    console.log("开始热重载", id);
    const el = document.getElementById(id) as HTMLElement;
    if(el instanceof HTMLLinkElement) {
        const href = new URL(el.href);
        href.searchParams.set('rand', Math.random().toString());
        el.setAttribute('href', href.href);
    } else {
        console.error(`不支持对${id}的热重载`)
    }
}

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
            case 'hotReload':
                doHotReload(data.id);
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
        btnLocked.firstElementChild!.classList.remove('codicon-pin');
        btnLocked.firstElementChild!.classList.add('codicon-pinned');
        btnLocked.classList.add('active');
    } else {
        btnLocked.firstElementChild!.classList.remove('codicon-pinned');
        btnLocked.firstElementChild!.classList.add('codicon-pin');
        btnLocked.classList.remove('active');
    }
}

function exportImg(img: HTMLImageElement) {
    let canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
    let cxt = canvas.getContext('2d')!;
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
        let svgParent = document.getElementById('__svg')!;
        if(mode == 'img') {
            exportImg(svgParent.querySelector('img')!);
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