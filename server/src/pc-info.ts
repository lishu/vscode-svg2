import { MarkupContent, SignatureInformation } from "vscode-languageserver";

interface PathCommandParameter {
    label: string;
    documentation: string;
}

interface PathCommand {
    label: string;
    category: string;
    documentation: string | MarkupContent;
    parameters?: Array<PathCommandParameter>;
}



export enum PathDataTokenType {
    Command,
    Number,
    WhitespaceComma,
    Invalid
}

export interface PathDataToken {
    start: number;
    end: number;
    type: PathDataTokenType;
    data: string;
}

export function readNumber(p: string, i: number) : PathDataToken {
    let sign = false;
    let dot = false;
    let num = false;
    let start = i;
    while(i < p.length) {
        let c = p.charAt(i);
        if(c=='+' || c=='-') {
            if(sign || num) {
                break;
            }
            i++;
            sign = true;
        }
        else if(c=='.') {
            if(dot) {
                break;
            }
            i++;
            dot = true;
        }
        else if(/\d/.test(c)) {
            num = true;
            i++;
        }
        else{
            break;
        }
    }
    return {type: PathDataTokenType.Number, start, end: i, data: p.substring(start, i)};
}

export let DefinedCommands : Array<PathCommand> = [
    {
        label: "M",
        category: "MoveTo",
        documentation: "Move the current point to the coordinate x,y. Any subsequent coordinate pair(s) are interpreted as parameter(s) for implicit absolute LineTo (L) command(s).",
        parameters: [{
            label: "x",
            documentation: "X coordinates to move to"
        },{
            label: "y",
            documentation: "Y coordinates to move to"
        }]
    },
    {
        label: "m",
        category: "MoveTo",
        documentation: "Move the current point by shifting the last known position of the path by dx along the x-axis and by dy along the y-axis. Any subsequent coordinate pair(s) are interpreted as parameter(s) for implicit relative LineTo (l) command(s).",
        parameters: [{
            label: "dx",
            documentation: "X coordinates to move to"
        },{
            label: "dy",
            documentation: "Y coordinates to move to"
        }]
    },
    {
        label: "L",
        category: "LineTo",
        documentation: "Draw a line from the current point to the end point specified by x,y. Any subsequent coordinate pair(s) are interpreted as parameter(s) for implicit absolute LineTo (L) command(s).",
        parameters: [{
            label: "x",
            documentation: "X coordinates to line to"
        },{
            label: "y",
            documentation: "Y coordinates to line to"
        }]
    },
    {
        label: "l",
        category: "LineTo",
        documentation: "Draw a line from the current point to the end point, which is the current point shifted by dx along the x-axis and dy along the y-axis. Any subsequent coordinate pair(s) are interpreted as parameter(s) for implicit relative LineTo (l) command(s)",
        parameters: [{
            label: "dx",
            documentation: "X coordinates to line to"
        },{
            label: "dy",
            documentation: "Y coordinates to line to"
        }]
    },
    {
        label: "H",
        category: "LineTo",
        documentation: "Draw a horizontal line from the current point to the end point, which is specified by the x parameter and the current point's y coordinate. Any subsequent value(s) are interpreted as parameter(s) for implicit absolute horizontal LineTo (H) command(s).",
        parameters: [{
            label: "x",
            documentation: "X coordinates to line to"
        }]
    },
    {
        label: "h",
        category: "LineTo",
        documentation: "Draw a horizontal line from the current point to the end point, which is specified by the current point shifted by dx along the x-axis and the current point's y coordinate. Any subsequent value(s) are interpreted as parameter(s) for implicit relative horizontal LineTo (h) command(s).",
        parameters: [{
            label: "dx",
            documentation: "X coordinates to line to"
        }]
    },
    {
        label: "V",
        category: "LineTo",
        documentation: "Draw a vertical line from the current point to the end point, which is specified by the y parameter and the current point's x coordinate. Any subsequent values are interpreted as parameters for implicit absolute vertical LineTo (V) command(s).",
        parameters: [{
            label: "y",
            documentation: "Y coordinates to line to"
        }]
    },
    {
        label: "v",
        category: "LineTo",
        documentation: "Draw a vertical line from the current point to the end point, which is specified by the current point shifted by dy along the y-axis and the current point's x coordinate. Any subsequent value(s) are interpreted as parameter(s) for implicit relative vertical LineTo (v) command(s).",
        parameters: [{
            label: "dy",
            documentation: "Y coordinates to line to"
        }]
    },
    {
        label: "C",
        category: "Cubic Bézier Curve",
        documentation: "Draw a cubic Bézier curve from the current point to the end point specified by x,y. The start control point is specified by x1,y1 and the end control point is specified by x2,y2. Any subsequent triplet(s) of coordinate pairs are interpreted as parameter(s) for implicit absolute cubic Bézier curve (C) command(s).",
        parameters: [
            {
                label: 'x1',
                documentation: "X coordinates for start control point"
            },
            {
                label: 'y1',
                documentation: "Y coordinates for start control point"
            },
            {
                label: 'x2',
                documentation: "X coordinates for end control point"
            },
            {
                label: 'y2',
                documentation: "Y coordinates for end control point"
            },
            {
                label: 'x',
                documentation: "X coordinates for end point"
            },
            {
                label: 'y',
                documentation: "Y coordinates for end point"
            }
        ]
    },
    {
        label: "c",
        category: "Cubic Bézier Curve",
        documentation: "Draw a cubic Bézier curve from the current point to the end point, which is the current point shifted by dx along the x-axis and dy along the y-axis. The start control point is the current point (starting point of the curve) shifted by dx1 along the x-axis and dy1 along the y-axis. The end control point is the current point (starting point of the curve) shifted by dx2 along the x-axis and dy2 along the y-axis. Any subsequent triplet(s) of coordinate pairs are interpreted as parameter(s) for implicit relative cubic Bézier curve (c) command(s).",
        parameters: [
            {
                label: 'dx1',
                documentation: "X coordinates for start control point"
            },
            {
                label: 'dy1',
                documentation: "Y coordinates for start control point"
            },
            {
                label: 'dx2',
                documentation: "X coordinates for end control point"
            },
            {
                label: 'dy2',
                documentation: "Y coordinates for end control point"
            },
            {
                label: 'dx',
                documentation: "X coordinates for end point"
            },
            {
                label: 'dy',
                documentation: "Y coordinates for end point"
            }
        ]
    },
    {
        label: "S",
        category: "Cubic Bézier Curve",
        documentation: "Draw a smooth cubic Bézier curve from the current point to the end point specified by x,y. The end control point is specified by x2,y2. The start control point is a reflection of the end control point of the previous curve command. If the previous command wasn't a cubic Bézier curve, the start control point is the same as the curve starting point (current point). Any subsequent pair(s) of coordinate pairs are interpreted as parameter(s) for implicit absolute smooth cubic Bézier curve (S) commands.",
        parameters: [
            {
                label: 'x2',
                documentation: "X coordinates for end control point"
            },
            {
                label: 'y2',
                documentation: "Y coordinates for end control point"
            },
            {
                label: 'x',
                documentation: "X coordinates for end point"
            },
            {
                label: 'y',
                documentation: "Y coordinates for end point"
            }
        ]
    },
    {
        label: "s",
        category: "Cubic Bézier Curve",
        documentation: "Draw a smooth cubic Bézier curve from the current point to the end point, which is the current point shifted by dx along the x-axis and dy along the y-axis. The end control point is the current point (starting point of the curve) shifted by dx2 along the x-axis and dy2 along the y-axis. The start control point is a reflection of the end control point of the previous curve command. If the previous command wasn't a cubic Bézier curve, the start control point is the same as the curve starting point (current point). Any subsequent pair(s) of coordinate pairs are interpreted as parameter(s) for implicit relative smooth cubic Bézier curve (s) commands.",
        parameters: [
            {
                label: 'dx2',
                documentation: "X coordinates for end control point"
            },
            {
                label: 'dy2',
                documentation: "Y coordinates for end control point"
            },
            {
                label: 'dx',
                documentation: "X coordinates for end point"
            },
            {
                label: 'dy',
                documentation: "Y coordinates for end point"
            }
        ]
    },
    {
        label: "Q",
        category: "Quadratic Bézier Curve",
        documentation: "Draw a quadratic Bézier curve from the current point to the end point specified by x,y. The control point is specified by x1,y1. Any subsequent pair(s) of coordinate pairs are interpreted as parameter(s) for implicit absolute quadratic Bézier curve (Q) command(s).",
        parameters: [
            {
                label: "x1",
                documentation: "X coordinates for control point"
            },
            {
                label: "y1",
                documentation: "Y coordinates for control point"
            },
            {
                label: "x",
                documentation: "X coordinates for end point"
            },
            {
                label: "y",
                documentation: "Y coordinates for end point"
            }
        ]
    },
    {
        label: "q",
        category: "Quadratic Bézier Curve",
        documentation: "Draw a quadratic Bézier curve from the current point to the end point, which is the current point shifted by dx along the x-axis and dy along the y-axis. The control point is the current point (starting point of the curve) shifted by dx1 along the x-axis and dy1 along the y-axis. Any subsequent pair(s) of coordinate pairs are interpreted as parameter(s) for implicit relative quadratic Bézier curve (q) command(s).",
        parameters: [
            {
                label: "dx1",
                documentation: "X coordinates for control point"
            },
            {
                label: "dy1",
                documentation: "Y coordinates for control point"
            },
            {
                label: "dx",
                documentation: "X coordinates for end point"
            },
            {
                label: "dy",
                documentation: "Y coordinates for end point"
            }
        ]
    },
    {
        label: "T",
        category: "Quadratic Bézier Curve",
        documentation: "Draw a smooth quadratic Bézier curve from the current point to the end point specified by x,y. The control point is a reflection of the control point of the previous curve command. If the previous command wasn't a quadratic Bézier curve, the control point is the same as the curve starting point (current point). Any subsequent coordinate pair(s) are interpreted as parameter(s) for implicit absolute smooth quadratic Bézier curve (T) command(s).",
        parameters: [
            {
                label: "x",
                documentation: "X coordinates for end point"
            },
            {
                label: "y",
                documentation: "Y coordinates for end point"
            }
        ]
    },
    {
        label: "t",
        category: "Quadratic Bézier Curve",
        documentation: "Draw a smooth quadratic Bézier curve from the current point to the end point, which is the current point shifted by dx along the x-axis and dy along the y-axis. The control point is a reflection of the control point of the previous curve command. If the previous command wasn't a quadratic Bézier curve, the control point is the same as the curve starting point (current point). Any subsequent coordinate pair(s) are interpreted as parameter(s) for implicit relative smooth quadratic Bézier curve (t) command(s).",
        parameters: [
            {
                label: "dx",
                documentation: "X coordinates for end point"
            },
            {
                label: "dy",
                documentation: "Y coordinates for end point"
            }
        ]
    },
    {
        label: "A",
        category: "Elliptical Arc Curve",
        documentation: "Draw an Arc curve from the current point to the coordinate x,y. The center of the ellipse used to draw the arc is determined automatically based on the other parameters of the command",
        parameters: [
            {
                label: "rx",
                documentation: "X radii of the ellipse"
            },
            {
                label: "ry",
                documentation: "Y radii of the ellipse"
            },
            {
                label: "angle",
                documentation: "represents a rotation (in degree) of the ellipse relative to the x-axis"
            },
            {
                label: "large-arc-flag",
                documentation: "allows to chose one of the large arc (1) or small arc (0)"
            },
            {
                label: "sweep-flag",
                documentation: "allows to chose one of the clockwise turning arc (1) or anticlockwise turning arc (0)"
            },
            {
                label: "x",
                documentation: "X coordinates for end point"
            },
            {
                label: "y",
                documentation: "Y coordinates for end point"
            }
        ]
    },
    {
        label: "a",
        category: "Elliptical Arc Curve",
        documentation: "Draw an Arc curve from the current point to to a point for which coordinates are those of the current point shifted by dx along the x-axis and dy along the y-axis. The center of the ellipse used to draw the arc is determined automatically based on the other parameters of the command",
        parameters: [
            {
                label: "rx",
                documentation: "X radii of the ellipse"
            },
            {
                label: "ry",
                documentation: "Y radii of the ellipse"
            },
            {
                label: "angle",
                documentation: "represents a rotation (in degree) of the ellipse relative to the x-axis"
            },
            {
                label: "large-arc-flag",
                documentation: "allows to chose one of the large arc (1) or small arc (0)"
            },
            {
                label: "sweep-flag",
                documentation: "allows to chose one of the clockwise turning arc (1) or anticlockwise turning arc (0)"
            },
            {
                label: "dx",
                documentation: "X coordinates for end point"
            },
            {
                label: "dy",
                documentation: "Y coordinates for end point"
            }
        ]
    },
    {
        label: "Z",
        category: "ClosePath",
        documentation: "Close the current subpath by connecting the last point of the path with its initial point. If the two points are at different coordinates, a straight line is drawn between those two points."
    },
    {
        label: "z",
        category: "ClosePath",
        documentation: "Close the current subpath by connecting the last point of the path with its initial point. If the two points are at different coordinates, a straight line is drawn between those two points."
    }
];

export let PathDataSignature : SignatureInformation = {
    label :'path commands',
    documentation: {
        kind: 'markdown',
        value: `SVG defines 6 types of path commands, for a total of 20 commands:
* MoveTo: \`M\`, \`m\`
* LineTo: \`L\`, \`l\`, \`H\`, \`h\`, \`V\`, \`v\`
* Cubic Bézier Curve: \`C\`, \`c\`, \`S\`, \`s\`
* Quadratic Bézier Curve: \`Q\`, \`q\`, \`T\`, \`t\`
* Elliptical Arc Curve: \`A\`, \`a\`
* ClosePath: \`Z\`, \`z\``
    }
};

const commandChars = 'M|m|L|l|H|h|V|v|C|c|S|s|Q|q|T|t|A|a|Z|z'.split('|');
export function isCommandChar(c: string): boolean {
    return commandChars.indexOf(c)>-1;
}

export function pathCommandFromChar(c: string): PathCommand | null {
    for(let pc of DefinedCommands) {
        if(pc.label === c) {
            return pc;
        }
    }
    return null;
}

export function signatureFromPathCommand(pc: PathCommand): SignatureInformation {
    let si : SignatureInformation = { 
        label: pc.label + ' ', 
        parameters: [],
        documentation: pc.documentation 
    };
    let paramPos = si.label.length;
    if(pc.parameters && pc.parameters.length) {
        si.label += '(';
        let more = false;
        for(let p of pc.parameters) {
            if(more) {
                si.label += ', ';
            }
            paramPos = si.label.length;
            si.label += p.label;
            // @ts-ignore TS2532
            si.parameters.push({
                label: [paramPos, si.label.length],
                documentation: p.documentation
            });
            more = true;
        }
        si.label += ')+';
    }
    return si;
}