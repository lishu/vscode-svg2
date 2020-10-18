const { ENodeBuilder, execAll } = require("../out/emmet-builder");
const { getSvgJson } = require("../out/svg");

const svg = getSvgJson();

// add some html elements/attributes metadata for test emmet base office `cheat sheet`
// https://docs.emmet.io/cheat-sheet/

svg.elements.div = {
    subElements: ['p']
}
svg.elements.nav = {
    subElements: ['ul']
}
svg.elements.ul = {
    subElements: ['li']
}
svg.elements.li = {
    subElements: []
}
svg.elements.span = {
    subElements: [],
    inline: true,
}
svg.elements.em = {
    subElements: ['span'],
    inline: true,
}
svg.elements.p = {
    subElements: ['blockquote', 'span', 'em'],
}
svg.elements.blockquote = {
    subElements: []
}
svg.elements.header = {
}
svg.elements.footer = {    
}
svg.elements.dt = {    
}
svg.elements.dl = {    
}
svg.elements.dd = {    
}
svg.elements.td = {    
}
svg.elements.form = {    
}
svg.elements.table = {
    subElements: ['tr']
}
svg.elements.tr = {
    subElements: ['td']
}
svg.elements.td = {
    subElements: []
}


svg.elementNameMap.bq = 'blockquote';
let selfTest = typeof test === 'undefined';

function test_pass(input) {
    let parts = execAll(input)[0];
    let eb = new ENodeBuilder(svg);
    eb.defaultTagUseTree = true;
    eb.defaultTagName = 'div';
    eb.debug = selfTest;
    eb.indentSize = 4;
    if(selfTest) {
        console.debug('parts', parts);
    }
    if(eb.parse(parts.texts)) {
        // console.log('output', eb.toCode());
        return eb.toCode().replace('$0', '');
    }
    else {
        console.error('没有 Parse 成功！');
    }
}

if(selfTest) {
    // 不使用 jet 时做对比显示输出
    global.expect = function(input) {
        return {
            toBe(be) {
                console.log(input);
                console.warn('\x1b[32m' + be + '\x1b[0m');
                console.log();
            }
        }
    }
    global.test = function(name, func) {
        console.log(name);
        func();
    }
}

test('Child: >', ()=>{
    expect(test_pass('nav>ul>li')).toBe(`<nav>
    <ul>
        <li></li>
    </ul>
</nav>`);
});

test('Sibling: +', ()=>{
    expect(test_pass('div+p+bq')).toBe(`<div></div>
<p></p>
<blockquote></blockquote>`);
});

test('Climb-up: ^', ()=>{
    expect(test_pass('div+div>p>span+em^bq')).toBe(`<div></div>
<div>
    <p><span></span><em></em></p>
    <blockquote></blockquote>
</div>`);


    expect(test_pass('div+div>p>span+em^^bq')).toBe(`<div></div>
<div>
    <p><span></span><em></em></p>
</div>
<blockquote></blockquote>`);
});

test('Grouping: ()', ()=>{
    expect(test_pass('div>(header>ul>li*2>a)+footer>p')).toBe(`<div>
    <header>
        <ul>
            <li><a href=""></a></li>
            <li><a href=""></a></li>
        </ul>
    </header>
    <footer>
        <p></p>
    </footer>
</div>`);

    expect(test_pass('(div>dl>(dt+dd)*3)+footer>p')).toBe(`<div>
    <dl>
        <dt></dt>
        <dd></dd>
        <dt></dt>
        <dd></dd>
        <dt></dt>
        <dd></dd>
    </dl>
</div>
<footer>
    <p></p>
</footer>`);
});

test('Multiplication: *', ()=>{
    expect(test_pass('ul>li*5')).toBe(`<ul>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
</ul>`);
});

test('Item numbering: $', ()=>{

    expect(test_pass('ul>li.item$*5')).toBe(`<ul>
    <li class="item1"></li>
    <li class="item2"></li>
    <li class="item3"></li>
    <li class="item4"></li>
    <li class="item5"></li>
</ul>`);

    // svg 不需要支持对元素名的循环变量替换
//     expect(test_pass('h$[title=item$]{Header $}*3')).toBe(`<h1 title="item1">Header 1</h1>
// <h2 title="item2">Header 2</h2>
// <h3 title="item3">Header 3</h3>`);

    expect(test_pass('ul>li.item$$$*5')).toBe(`<ul>
    <li class="item001"></li>
    <li class="item002"></li>
    <li class="item003"></li>
    <li class="item004"></li>
    <li class="item005"></li>
</ul>`);

    expect(test_pass('ul>li.item$@-*5')).toBe(`<ul>
    <li class="item5"></li>
    <li class="item4"></li>
    <li class="item3"></li>
    <li class="item2"></li>
    <li class="item1"></li>
</ul>`);

    expect(test_pass('ul>li.item$@3*5')).toBe(`<ul>
    <li class="item3"></li>
    <li class="item4"></li>
    <li class="item5"></li>
    <li class="item6"></li>
    <li class="item7"></li>
</ul>`);

});



test('ID and CLASS attributes', ()=>{
    expect(test_pass('#header')).toBe(`<div id="header"></div>`);
    expect(test_pass('.title')).toBe(`<div class="title"></div>`);
    expect(test_pass('form#search.wide')).toBe(`<form id="search" class="wide"></form>`);
    expect(test_pass('p.class1.class2.class3')).toBe(`<p class="class1 class2 class3"></p>`);
});


test('Custom attributes', ()=>{
    expect(test_pass('p[title="Hello world"]')).toBe(`<p title="Hello world"></p>`);
    expect(test_pass('td[rowspan=2 colspan=3 title]')).toBe(`<td rowspan="2" colspan="3" title=""></td>`);
    expect(test_pass(`[a='value1' b="value2"]`)).toBe(`<div a="value1" b="value2"></div>`);
});

test('Text: {}', ()=>{
    expect(test_pass('a{Click me}')).toBe(`<a href="">Click me</a>`);
    expect(test_pass('p>{Click }+a{here}+{ to continue}')).toBe(`<p>Click <a href="">here</a> to continue</p>`);
});

test('Implicit tag names', ()=>{
    expect(test_pass('.class')).toBe(`<div class="class"></div>`);
    expect(test_pass('em>.class')).toBe(`<em><span class="class"></span></em>`);
    expect(test_pass('ul>.class')).toBe(`<ul>
    <li class="class"></li>
</ul>`);
    expect(test_pass('table>.row>.col')).toBe(`<table>
    <tr class="row">
        <td class="col"></td>
    </tr>
</table>`);
});
