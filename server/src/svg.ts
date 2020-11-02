import * as utils from './utils';
import * as fs from 'fs';
import * as path from 'path';

import { ISvgJson, ISvgJsonRoot, ISvgJsonElement, SvgVersion, ISvgJsonAttribute } from './svgjson';

type SvgElementCategories = "Animation_elements" | "Basic_shapes" | "Container_elements" | "Descriptive_elements" | "Filter_primitive_elements" | "Font_elements" | "Gradient_elements" | "Graphics_elements" | "HTML_elements" | "Light_source_elements" | "Never-rendered_elements" | "Paint_server_elements" | "Renderable_elements" | "Shape_elements" | "Structural_elements" | "Text_content_elements" | "Text_content_child_elements" | "Uncategorized_elements";

type SvgAttributeCategories = "Animation_event_attributes" | "Animation_attribute_target_attributes" | "Animation_timing_attributes" | "Animation_value_attributes" | "Animation_addition_attributes" | "Conditional_processing_attributes" | "Core_attributes" | "Document_event_attributes" | "Filter_primitive_attributes" | "Graphical_event_attributes" | "Presentation_attributes" | "Style_attributes" | "Transfer_function_attributes" | "XLink_attributes";

export interface ISvgLanguageJson {
    elements: [{
        [pn:string]: {
            documentation: string
        }
    }];
    attributes: [{
        [pn:string]: {
            documentation: string
        }
    }];
}

export function getSvgJson(language: string): ISvgJsonRoot {
    let svg :ISvgJson = {
        "elementNameMap": {
            "p": "path",
            "pg": "polygon",
            "pl": "polyline",
            "r": "rect",
            "c": "circle",
            "e": "ellipse",
            "l": "line",
        },
        "attributeNameMap": {

        },
        "elements": {
            "a": {
                "documentation": "The <a> SVG element defines a hyperlink.",
                "inline": true,
                "subElements": [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "@Structural_elements",
                    "@Gradient_elements",
                    "a", "altGlyphDef", "clipPath", "color-profile", "cursor", "filter", "font", "font-face", "foreignObject", "image", "marker", "mask", "pattern", "script", "style", "switch", "text", "view"
                ],
                "attributes": [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "@XLink_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "href",
                    "target",
                    "xlink:show",
                    "xlink:actuate",
                    "xlink:href"
                ],
                "defaultAttributes": {
                    "href" : "#url"
                }
            },
            "altGlyphDef": {
                "deprecated": "This feature has been removed from the Web standards.",
                "subElements": ["glyphRef", "altGlyphItem"],
                "attributes": ["@Core_attributes"]
            },
            "altGlyphItem": {
                "deprecated": "This feature has been removed from the Web standards.",
                "subElements": ["glyphRef"],
                "attributes": ["@Core_attributes"]
            },
            "animate": {
                "subElements": [
                    "@Descriptive_elements",
                ],
                "attributes": [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Animation_event_attributes",
                    "@XLink_attributes",
                    "@Animation_attribute_target_attributes",
                    "@Animation_timing_attributes",
                    "@Animation_value_attributes",
                    "@Animation_addition_attributes",
                    "externalResourcesRequired",
                    "attributeName",
                    "attributeType",
                    "from",
                    "to",
                    "dur",
                    "repeatCount"
                ]
            },
            "animateColor": {
                "subElements": [
                    "@Descriptive_elements",
                ],
                "attributes": [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Animation_event_attributes",
                    "@XLink_attributes",
                    "@Animation_attribute_target_attributes",
                    "@Animation_timing_attributes",
                    "@Animation_value_attributes",
                    "@Animation_addition_attributes",
                    "externalResourcesRequired",
                    "by",
                    "from",
                    "to"
                ]
            },
            "animateMotion": {
                "subElements": [
                    "@Descriptive_elements",
                    "mpath"
                ],
                "attributes": [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Animation_event_attributes",
                    "@XLink_attributes",
                    "@Animation_timing_attributes",
                    "@Animation_value_attributes",
                    "@Animation_addition_attributes",
                    "externalResourcesRequired",
                    "calcMode",
                    "path",
                    "keyPoints",
                    "rotate",
                    "origin"
                ]
            },
            "animateTransform": {
                "subElements": [
                    "@Descriptive_elements"
                ],
                "attributes": [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Animation_event_attributes",
                    "@XLink_attributes",
                    "@Animation_attribute_target_attributes",
                    "@Animation_timing_attributes",
                    "@Animation_value_attributes",
                    "@Animation_addition_attributes",
                    "externalResourcesRequired",
                    "by",
                    "from",
                    "to",
                    {
                        name: "type",
                        enum: "translate | scale | rotate | skewX | skewY".split(' | ')
                    }
                ]
            },
            "audio": {
                "inline": true
            },
            "canvas": {},
            "circle": {
                "documentation": "Create circles based on a center point and a radius.",
                "subElements": [
                    "@Animation_elements",
                    "@Descriptive_elements"
                ],
                "attributes": [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "cx",
                    "cy",
                    "r"
                ],
                "simple" : true
            },
            "clipPath": {
                "documentation": "The <clipPath> SVG element defines a clipping path. A clipping path is used/referenced using the clip-path property.",
                "subElements": [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "text",
                    "use"
                ],
                "attributes": [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "clipPathUnits"
                ]
            },
            "color-profile": {
                "documentation": "The <color-profile> element allows describing the color profile used for the image.",
                "subElements": [
                    "@Descriptive_elements"
                ],
                "attributes": [
                    "@Core_attributes",
                    "@XLink_attributes",
                    "local",
                    "name",
                    "rendering-intent",
                    "xlink:href"
                ]
            },
            "cursor": {
                "documentation" : "The <cursor> SVG element can be used to define a platform-independent custom cursor. ",
                "deprecated": "This feature has been removed from the Web standards.",
                "subElements": [
                    "@Descriptive_elements"
                ],
                "attributes": [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@XLink_attributes",
                    "externalResourcesRequired",
                    "x",
                    "y",
                    "xlink:href"
                ],
                simple: true
            },
            "defs": {
                documentation: "SVG allows graphical objects to be defined for later reuse.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "@Structural_elements",
                    "@Gradient_elements",
                    "a", "altGlyphDef", "clipPath", "color-profile",
                    "cursor", "filter", "font", "font-face",
                    "foreignObject", "image", "marker", "mask",
                    "pattern", "script", "style", "switch", "text",
                    "view"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform"
                ]
            },
            "desc": {
                documentation: "Each container element or graphics element in an SVG drawing can supply a description string using the <desc> element where the description is text-only.",
                subElements: [],
                attributes: [
                    "@Core_attributes",
                    "class",
                    "style"
                ],
                inline: true
            },
            "discard": {
                documentation: "The <discard> SVG element allows authors to specify the time at which particular elements are to be discarded, thereby reducing the resources required by an SVG user agent.",
                subElements:[
                    "@Descriptive_elements",
                    "script"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes"
                ]
            },
            "ellipse": {
                documentation: "The ellipse element is an SVG basic shape, used to create ellipses based on a center coordinate, and both their x and y radius.",
                subElements:[
                    "@Animation_elements",
                    "@Descriptive_elements"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "cx",
                    "cy",
                    "rx",
                    "ry"
                ],
                defaultAttributes: {
                    "rx": "100",
                    "ry": "100"
                },
                simple: true
            },
            "feBlend": {
                documentation: "The <feBlend> SVG filter primitive composes two objects together ruled by a certain blending mode.",
                subElements: [
                    "animate",
                    "set"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in",
                    "in2",
                    "mode"
                ]
            },
            "feColorMatrix": {
                documentation: "The <feColorMatrix> SVG filter element changes colors based on a transformation matrix. ",
                subElements: [
                    "animate",
                    "set"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in",
                    "values",
                    {
                        name: "type",
                        enum: "matrix | saturate | hueRotate | luminanceToAlpha".split(' | ')
                    }
                ]
            },
            "feComponentTransfer": {
                documentation: "Th <feComponentTransfer> SVG filter primitive performs color-component-wise remapping of data for each pixel.",
                subElements: [
                    "feFuncA",
                    "feFuncB",
                    "feFuncG",
                    "feFuncR"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in"
                ]
            },
            "feComposite": {
                documentation: "This filter primitive performs the combination of two input images pixel-wise in image space using one of the Porter-Duff compositing operations: over, in, atop, out, xor and lighter. ",
                subElements: [
                    "animate",
                    "set"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in",
                    "in2",
                    "operator",
                    "k1",
                    "k2",
                    "k3",
                    "k4"
                ]
            },
            "feConvolveMatrix": {
                documentation: "The <feConvolveMatrix> SVG filter primitive applies a matrix convolution filter effect.",
                subElements: [
                    "animate",
                    "set"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in",
                    "order",
                    "kernelMatrix",
                    "divisor",
                    "bias",
                    "targetX",
                    "targetY",
                    "edgeMode",
                    "kernelUnitLength",
                    "preserveAlpha"
                ]           
            },
            "feDiffuseLighting": {
                documentation: "The <feDiffuseLighting> SVG filter primitive lights an image using the alpha channel as a bump map.",
                subElements:[
                    "@Descriptive_elements"
                ],
                attributes:[
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "type",
                    "in",
                    "surfaceScale",
                    "diffuseConstant",
                    "kernelUnitLength"
                ]
            },
            "feDisplacementMap": {
                documentation: "The <feDisplacementMap> SVG filter primitive uses the pixel values from the image from in2 to spatially displace the image from in.",
                subElements:[
                    "animate",
                    "set"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in",
                    "in2",
                    "scale",
                    "xChannelSelector",
                    "yChannelSelector"
                ]
            },
            "feDistantLight": {
                documentation: "The <feDistantLight> filter primitive defines a distant light source that can be used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.",
                subElements: [
                    "animate", "set"
                ],
                attributes: [
                    "@Core_attributes",
                    "azimuth",
                    "elevation"
                ]
            },
            "feDropShadow": {
                documentation: "The <feDropShadow> filter primitive creates a drop shadow of the input image.",
                subElements: [
                    "animate", "script", "set"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in",
                    "stdDeviation",
                    "dx",
                    "dy"
                ]
            },
            "feFlood": {
                documentation: "The <feFlood> SVG filter primitive fills the filter subregion with the color and opacity defined by flood-color and flood-opacity.",
                subElements: ["animate", "animateColor", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class", "style",
                    "flood-color",
                    "flood-opacity"
                ]
            },
            "feFuncA": {
                documentation: "The <feFuncA> SVG filter primitive defines the transfer function for the alpha component of the input graphic of its parent <feComponentTransfer> element.",
                subElements: ["animate", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Transfer_function_attributes"
                ]
            },
            "feFuncB": {
                documentation: "The <feFuncA> SVG filter primitive defines the transfer function for the blue component of the input graphic of its parent <feComponentTransfer> element.",
                subElements: ["animate", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Transfer_function_attributes"
                ]
            },
            "feFuncG": {
                documentation: "The <feFuncA> SVG filter primitive defines the transfer function for the green component of the input graphic of its parent <feComponentTransfer> element.",
                subElements: ["animate", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Transfer_function_attributes"
                ]
            },
            "feFuncR": {
                documentation: "The <feFuncA> SVG filter primitive defines the transfer function for the red component of the input graphic of its parent <feComponentTransfer> element.",
                subElements: ["animate", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Transfer_function_attributes"
                ]
            },
            "feGaussianBlur": {
                documentation: "The <feGaussianBlur> SVG filter primitive blurs the input image by the amount specified in stdDeviation, which defines the bell-curve.",
                subElements: ["animate", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in",
                    "stdDeviation",
                    "edgeMode"
                ]
            },
            "feImage": {
                documentation: "The <feImage> SVG filter primitive fetches image data from an external source and provides the pixel data as output (meaning if the external source is an SVG image, it is rasterized.)",
                subElements: ["animate", "animateTransform", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "@XLink_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "preserveAspectRatio",
                    "xlink:href"
                ]
            },
            "feMerge": {
                documentation: "The <feMerge> SVG element allows filter effects to be applied concurrently instead of sequentially.",
                subElements: ["feMergeNode"],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style"
                ]
            },
            "feMergeNode": {
                documentation: "The feMergeNode takes the result of another filter to be processed by its parent <feMerge>.",
                subElements: ["animate", "set"],
                attributes: [
                    "@Core_attributes",
                    "in"
                ]
            },
            "feMorphology": {
                documentation: "The <feMorphology> SVG filter primitive is used to erode or dilate the input image.",
                subElements: ["animate", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in",
                    "operator",
                    "radius"
                ]
            },
            "feOffset": {
                documentation: "The <feOffset> SVG filter primitive allows to offset the input image.",
                subElements: ["animate", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in",
                    "dx",
                    "dy"
                ]
            },
            "fePointLight": {
                "documentation": "The <fePointLight> SVG filter primitive allows to create a point light effect.",
                "subElements": ["animate", "set"],
                "attributes": [
                    "@Core_attributes",
                    "x",
                    "y",
                    "z"
                ],
                simple: true
            },
            "feSpecularLighting": {
                documentation: "The <feSpecularLighting> SVG filter primitive lights a source graphic using the alpha channel as a bump map.",
                subElements: [
                    "@Descriptive_elements"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in",
                    "surfaceScale",
                    "specularConstant",
                    "specularExponent",
                    "kernelUnitLength"
                ]
            },
            "feSpotLight": {
                documentation: "The <feSpotLight> SVG filter primitive allows to create a spotlight effect.",
                subElements: ["animate", "set"],
                attributes:[
                    "@Core_attributes",
                    "x",
                    "y",
                    "z",
                    "pointsAtX",
                    "pointsAtY",
                    "pointsAtZ",
                    "specularExponent",
                    "limitingConeAngle"
                ]
            },
            "feTile": {
                documentation: "The <feTile> SVG filter primitive allows to fill a target rectangle with a repeated, tiled pattern of an input image.",
                subElements: ["animate", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "in"
                ]
            },
            "feTurbulence": {
                documentation: "The <feTurbulence> SVG filter primitive creates an image using the Perlin turbulence function.",
                subElements: ["animate", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Filter_primitive_attributes",
                    "class",
                    "style",
                    "baseFrequency",
                    "numOctaves",
                    "seed",
                    "stitchTiles",
                    {
                        name: "type",
                        enum: "fractalNoise | turbulence".split(' | ')
                    }
                ]
            },
            "filter": {
                documentation: "The <filter> SVG element serves as container for atomic filter operations.",
                subElements: [
                    "@Descriptive_elements",
                    "@Filter_primitive_elements",
                    "animate", "set"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@XLink_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "x",
                    "y",
                    "width",
                    "height",
                    "filterRes",
                    "filterUnits",
                    "primitiveUnits",
                    "xlink:href"
                ]
            },
            "font": {
                documentation: "The <font> SVG element defines a font to be used for text layout.",
                subElements: [
                    "@Descriptive_elements",
                    "font-face",
                    "glyph",
                    "hkern",
                    "missing-glyph",
                    "vkern"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "horiz-origin-x",
                    "horiz-origin-y",
                    "horiz-adv-x",
                    "vert-origin-x",
                    "vert-origin-y",
                    "vert-adv-y"
                ]
            },
            "font-face": {
                deprecated: "This feature has been removed from the Web standards.",
                documentation: "The <font-face> SVG element corresponds to the CSS @font-face rule. It defines a font's outer properties.",
                subElements: [
                    "@Descriptive_elements",
                    "font-face"
                ],
                attributes: [
                    "@Core_attributes",
                    "font-family",
                    "font-style",
                    "font-variant",
                    "font-weight",
                    "font-stretch",
                    "font-size",
                    "unicode-range",
                    "units-per-em",
                    "panose-1",
                    "stemv",
                    "stemh",
                    "slope",
                    "cap-height",
                    "x-height",
                    "accent-height",
                    "ascent",
                    "descent",
                    "widths",
                    "bbox",
                    "ideographic",
                    "alphabetic",
                    "mathematical",
                    "hanging",
                    "v-ideographic",
                    "v-alphabetic",
                    "v-mathematical",
                    "v-hanging",
                    "underline-position",
                    "underline-thickness",
                    "strikethrough-position",
                    "strikethrough-thickness",
                    "overline-position",
                    "overline-thickness"
                ],
                simple: true
            },
            "font-face-format": {
                deprecated: "This feature has been removed from the Web standards.",
                documentation: "The <font-face-format> SVG element describes the type of font referenced by its parent <font-face-uri>.",
                subElements: [],
                attributes: [
                    "@Core_attributes",
                    "string"
                ],
                simple: true
            },
            "font-face-name": {
                deprecated: "This feature has been removed from the Web standards.",
                documentation: "The <font-face-name> element points to a locally installed copy of this font, identified by its name.",
                subElements: [],
                attributes: [
                    "@Core_attributes",
                    "name"
                ],
                simple: true
            },
            "font-face-src": {
                deprecated: "This feature has been removed from the Web standards.",
                documentation: "The <font-face-src> SVG element corresponds to the src descriptor in CSS @font-face rules.",
                subElements: [
                    "font-face-name",
                    "font-face-url"
                ],
                attributes: [
                    "@Core_attributes"
                ]
            },
            "font-face-uri": {
                deprecated: "This feature has been removed from the Web standards.",
                documentation: "The <font-face-uri> SVG element points to a remote definition of the current font.",
                subElements: [ "font-face-format"],
                attributes: [
                    "@Core_attributes",
                    "@XLink_attributes",
                    "xlink:href"
                ]
            },
            "foreignObject": {
                documentation: "The <foreignObject> SVG element allows for inclusion of a foreign XML namespace which has its graphical content drawn by a different user agent. The included foreign graphical content is subject to SVG transformations and compositing.",
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "x",
                    "y",
                    "width",
                    "height"
                ]
            },
            "g": {
                documentation: "The <g> SVG element is a container used to group other SVG elements.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "@Structural_elements",
                    "@Gradient_elements",
                    "a", "altGlyphDef", "clipPath", "color-profile", "cursor", "filter", "font",
                    "font-face", "foreignObject", "image", "marker", "mask", "pattern", "script",
                    "style", "switch", "text", "view"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform"
                ]
            },
            "glyph": {
                documentation: "A <glyph> defines a single glyph in an SVG font.",
                "subElements":[
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "@Structural_elements",
                    "@Gradient_elements",
                    "a", "altGlyphDef", "clipPath", "color-profile", "cursor", "filter", "font", "font-face",
                    "foreignObject", "image", "marker", "mask", "pattern", "script", "style", "switch",
                    "text", "view"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "d",
                    "horiz-adv-x",
                    "vert-origin-x",
                    "vert-origin-y",
                    "vert-adv-y",
                    "unicode",
                    "glyph-name",
                    "orientation",
                    "arabic-form",
                    "lang"
                ]
            },
            "glyphRef": {
                deprecated: "This feature has been removed from the Web standards.",
                subElements: [],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@XLink_attributes",
                    "class",
                    "style",
                    "x",
                    "y",
                    "dx",
                    "dy",
                    "glyphRef",
                    "format",
                    "xlink:href"
                ]
            },
            "hatch": {
                documentation: "The <hatch> SVG element is used to fill or stroke an object using one or more pre-defined paths that are repeated at fixed intervals in a specified direction to cover the areas to be painted.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "hatchpath", "script", "style"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Style_attributes",
                    "x",
                    "y",
                    "pitch",
                    "rotate",
                    "hatchUnits",
                    "hatchContentUnits",
                    "transform",
                    "href"
                ]
            },
            "hatchpath": {
                documentation: "The <hatchpath> SVG element defines a hatch path used by the <hatch> element.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "script", "style"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@Style_attributes",
                    "d",
                    "offset"
                ]
            },
            "hkern": {
                deprecated: "This feature has been removed from the Web standards.",
                documentation: "The <hkern> SVG element allows to fine-tweak the horizontal distance between two glyphs.",
                subElements: [],
                attributes: [
                    "@Core_attributes",
                    "u1", "g1", "u2", "g2", "k"
                ]
            },
            "iframe": {},
            "image": {
                documentation: "The <image> SVG element allows a raster image to be included in an SVG document.",
                subElements:[
                    "@Animation_elements",
                    "@Descriptive_elements"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "@XLink_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "x",
                    "y",
                    "width",
                    "height",
                    "xlink:href",
                    "preserveAspectRatio"
                ]
            },
            "line": {
                documentation: "The <line> element is an SVG basic shape used to create a line connecting two points.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "x1", "x2", "y1", "y2"
                ],
                defaultAttributes:{
                    "x1": "0",
                    "x2": "100",
                    "y1": "0",
                    "y2": "100",
                },
                simple: true
            },
            "linearGradient": {
                documentation: "The <linearGradient> SVG element lets authors define linear gradients to fill or stroke graphical elements.",
                subElements: [
                    "@Descriptive_elements",
                    "animate", "animateTransform", "set", "stop"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@XLink_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "gradientUnits",
                    "gradientTransform",
                    "x1",
                    "y1",
                    "x2",
                    "y2",
                    "spreadMethod",
                    "xlink:href"
                ],
                defaultAttributes: {
                    "id": ""
                }
            },
            "marker": {
                documentation: "The <marker> element defines the graphics that is to be used for drawing arrowheads or polymarkers on a given <path>, <line>, <polyline> or <polygon> element.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "@Structural_elements",
                    "@Gradient_elements",
                    "a", "altGlyphDef", "clipPath", "color-profile", "cursor", "filter", "font", "font-face", "foreignObject", "image", "marker", "mask", "pattern", "script", "style", "switch", "text", "view"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "viewBox",
                    "preserveAspectRatio",
                    "transform",
                    "markerUnits",
                    "refX",
                    "refY",
                    "markerWidth",
                    "markerHeight",
                    "orient"
                ]
            },
            "mask": {
                documentation: "In SVG, you can specify that any other graphics object or <g> element can be used as an alpha mask for compositing the current object into the background. A mask is defined with the <mask> element. A mask is used/referenced using the mask property.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "@Structural_elements",
                    "@Gradient_elements",
                    "a", "altGlyphDef", "clipPath", "color-profile", "cursor", "filter", "font", "font-face",
                    "foreignObject", "image", "marker", "mask", "pattern", "script", "style", "switch", "text", "view"
                ]
            },
            "mesh": {
                simple: true
            },
            "meshgradient": {},
            "meshpatch": {},
            "meshrow": {},
            "metadata": {
                documentation: "The <metadata> SVG element allows to add metadata to SVG content. Metadata is structured information about data. ",
                attributes: [
                    "@Core_attributes"
                ]
            },
            "missing-glyph": {
                deprecated: "This feature has been removed from the Web standards.",
                documentation: "The <missing-glyph> SVG element's content is rendered, if for a given character the font doesn't define an appropriate <glyph>.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "@Structural_elements",
                    "@Gradient_elements",
                    "a", "altGlyphDef", "clipPath", "color-profile", "cursor", "filter", "font", "font-face", "foreignObject",
                    "image", "marker", "mask", "pattern", "script", "style", "switch", "text", "view"
                ]
            },
            "mpath": {
                documentation: "The <mpath> sub-element for the <animateMotion> element provides the ability to reference an external <path> element as the definition of a motion path.",
                subElements: [
                    "@Descriptive_elements"
                ],
                attributes: [
                    "@Core_attributes",
                    "@XLink_attributes",
                    "externalResourcesRequired",
                    "xlink:href"
                ],
                simple: true
            },
            "path": {
                documentation: "The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphics_elements",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "d",
                    "pathLength",
                    "fillOpacity"
                ],
                defaultAttributes: {
                    "d": "<path>"
                },
                simple: true
            },
            "pattern": {
                documentation: "The <pattern> element defines a graphics object which can be redrawn at repeated x and y-coordinate intervals (\"tiled\") to cover an area. The <pattern> is referenced by the fill and/or stroke attributes on other graphics elements to fill or stroke those elements with the referenced pattern.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "@Structural_elements",
                    "@Gradient_elements",
                    "a", "altGlyphDef", "clipPath", "color-profile", "cursor", "filter", "font", "font-face",
                    "foreignObject", "image", "marker", "mask", "pattern", "script", "style", "switch",
                    "text", "view"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@XLink_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "viewBox",
                    "patternUnits",
                    "patternContentUnits",
                    "patternTransform",
                    "x",
                    "y",
                    "width",
                    "height",
                    "xlink:href",
                    "preserveAspectRatio"
                ],
                defaultAttributes: {
                    "id": ""
                }
            },
            "polygon": {
                documentation: "The <polygon> element defines a closed shape consisting of a set of connected straight line segments. The last point is connected to the first point. For open shapes see the <polyline> element.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "points"
                ],
                defaultAttributes: {
                    "points": "<points>"
                },
                simple: true
            },
            "polyline": {
                documentation: "The <polyline> SVG element is an SVG basic shape that creates straight lines connecting several points. Typically a polyline is used to create open shapes as the last point doesn't have to be connected to the first point. For closed shapes see the <polygon> element.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "points"
                ],
                defaultAttributes: {
                    "points": "<points>"
                },
                simple: true
            },
            "radialGradient": {
                documentation: "The <radialGradient> SVG element lets authors define radial gradients to fill or stroke graphical elements.",
                subElements: [
                    "@Descriptive_elements",
                    "animate", "animateTransform", "set", "stop"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "@XLink_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "gradientUnits",
                    "gradientTransform",
                    "cx",
                    "cy",
                    "r",
                    "fx",
                    "fy",
                    "fr",
                    "spreadMethod",
                    "xlink:href"
                ],
                defaultAttributes: {
                    "id": ""
                }
            },
            "rect": {
                documentation: "The rect element is an SVG basic shape, used to create rectangles based on the position of a corner and their width and height. It may also be used to create rectangles with rounded corners.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "x",
                    "y",
                    "width",
                    "height",
                    "rx",
                    "ry"
                ],
                defaultAttributes: {
                    "width": "100",
                    "height": "100"
                },
                simple: true
            },
            "script": {
                documentation: "A SVG script element is equivalent to the script element in HTML and thus is the place for scripts (e.g., ECMAScript).",
                subElements: [],
                attributes: [
                    "@Core_attributes",
                    "@XLink_attributes",
                    "externalResourcesRequired",
                    "xlink:href",
                    {
                        name: "type"
                    }
                ]
            },
            "set": {
                documentation: "The <set> element provides a simple means of just setting the value of an attribute for a specified duration. It supports all attribute types, including those that cannot reasonably be interpolated, such as string and boolean values. The <set> element is non-additive. The additive and accumulate attributes are not allowed, and will be ignored if specified.",
                subElements: ["@Descriptive_elements"],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Animation_event_attributes",
                    "@XLink_attributes",
                    "@Animation_attribute_target_attributes",
                    "@Animation_timing_attributes",
                    "externalResourcesRequired",
                    "to"
                ]
            },
            "solidcolor": {
                documentation: "The <solidColor> SVG element lets authors define a single color for use in multiple places in an SVG document.",
            },
            "stop": {
                documentation: "The <stop> SVG element defines the ramp of colors to use on a gradient, which is a child element to either the <linearGradient> or the <radialGradient> element.",
                subElements: ["animate", "animateColor", "set"],
                attributes: [
                    "@Core_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    {
                        name: "offset",
                        documentation: 'This attribute defines where the gradient stop is placed along the gradient vector.',
                        type: 'number | percentage'
                    },
                    "stop-color",
                    "stop-opacity"
                ],
                defaultAttributes: {
                    "offset": "0%",
                    "stop-color": ""
                },
                simple: true
            },
            "style": {
                documentation: "The <style> SVG element allows style sheets to be embedded directly within SVG content. SVG's style element has the same attributes as the corresponding element in HTML (see HTML's <style> element).",
                attributes: [
                    "@Core_attributes",
                    "media",
                    "title",
                    {
                        name: "type"
                    }
                ]
            },
            "svg": {
                "documentation": "The svg element can be used to embed an SVG fragment inside the current document (for example, an HTML document). This SVG fragment has its own viewport and coordinate system.",
                "subElements": [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "@Structural_elements",
                    "@Gradient_elements",
                    "a", "altGlyphDef", "clipPath", "color-profile", "cursor", "filter", "font", "font-face", "foreignObject", "image", "marker", "mask", "pattern", "script", "style", "switch", "text", "view"
                ],
                "attributes": [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Document_event_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    {
                        "name": "version",
                        "documentation": "The version attribute is used to indicate what specification a SVG document conforms to. It is only allowed on the root <svg> element. It is purely advisory and has no influence on rendering or processing.",
                        "type": "number"
                    },
                    "baseProfile",
                    "x", "y", "width", "height", "preserveAspectRatio", "contentScriptType", "contentStyleType",
                    "viewBox",
                    "xmlns", "xmlns:xlink"
                ]
            },
            "switch": {
                documentation: "The <switch> SVG element evaluates the requiredFeatures, requiredExtensions and systemLanguage attributes on its direct child elements in order, and then processes and renders the first child for which these attributes evaluate to true. All others will be bypassed and therefore not rendered. If the child element is a container element such as a <g>, then the entire subtree is either processed/rendered or bypassed/not rendered.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "a", "foreignObject", "g", "image", "svg", "switch", "text", "use"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform"
                ]
            },
            "symbol": {
                documentation: "The <symbol> element is used to define graphical template objects which can be instantiated by a <use> element. The use of symbol elements for graphics that are used multiple times in the same document adds structure and semantics. Documents that are rich in structure may be rendered graphically, as speech, or as Braille, and thus promote accessibility. Note that a symbol element itself is not rendered. Only instances of a symbol element (i.e., a reference to a symbol by a <use> element) are rendered.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Shape_elements",
                    "@Structural_elements",
                    "@Gradient_elements",
                    "a", "altGlyphDef", "clipPath", "color-profile", "cursor", "filter", "font", "font-face",
                    "foreignObject", "image", "marker", "mask", "pattern", "script", "style", "switch",
                    "text", "view"
                ],
                attributes: [
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "preserveAspectRatio",
                    "viewBox"
                ]
            },
            "text": {
                documentation: "The SVG <text> element defines a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, just like any other SVG graphics element.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements",
                    "@Text_content_elements",
                    "a"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "x", 
                    "y",
                    "dx",
                    "dy",
                    "text-anchor",
                    "rotate",
                    "textLength",
                    "lengthAdjust"
                ]
            },
            "textPath": {
                documentation: "In addition to text drawn in a straight line, SVG also includes the ability to place text along the shape of a <path> element. To specify that a block of text is to be rendered along the shape of a <path>, include the given text within a <textPath> element which includes an href attribute with a reference to a <path> element.",
                subElements: [
                    "@Descriptive_elements",
                    "a",
                    "altGlyph",
                    "animate",
                    "animateColor",
                    "set",
                    "tref",
                    "tspan"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "@XLink_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "startOffset",
                    "method",
                    "spacing",
                    "href"
                ]
            },
            "title": {
                documentation: "Each container element or graphics element in an SVG drawing can supply a <title> element containing a description string where the description is text-only. When the current SVG document fragment is rendered as SVG on visual media, <title> element is not rendered as part of the graphics. However, some user agents may, for example, display the <title> element as a tooltip. Alternate presentations are possible, both visual and aural, which display the <title> element but do not display path elements or other graphics elements. The <title> element generally improve accessibility of SVG documents",
                attributes: [
                    "@Core_attributes",
                    "class",
                    "style"
                ],
                inline: true,
            },
            "tref": {
                deprecated: "This feature has been removed from the Web standards.",
                documentation: "The textual content for a <text> SVG element can be either character data directly embedded within the <text> element or the character data content of a referenced element, where the referencing is specified with a <tref> element.",
                subElements: [
                    "@Descriptive_elements",
                    "animate", "animateColor", "set"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "@XLink_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "xlink:href"
                ]
            },
            "tspan": {
                documentation: "Within a <text> element, text and font properties and the current text position can be adjusted with absolute or relative coordinate values by including a <tspan> element.",
                subElements: [
                    "@Descriptive_elements",
                    "a", "altGlyph", "animate", "animateColor", "set", "tref", "tspan"
                ]
            },
            "unknown": {},
            "use": {
                documentation: "The <use> element takes nodes from within the SVG document, and duplicates them somewhere else. The effect is the same as if the nodes were deeply cloned into a non-exposed DOM, and then pasted where the use element is, much like cloned template elements in HTML5. Since the cloned nodes are not exposed, care must be taken when using CSS to style a use element and its hidden descendants. CSS attributes are not guaranteed to be inherited by the hidden, cloned DOM unless you explicitly request it using CSS inheritance.",
                subElements: [
                    "@Animation_elements",
                    "@Descriptive_elements"
                ],
                attributes: [
                    "@Conditional_processing_attributes",
                    "@Core_attributes",
                    "@Graphical_event_attributes",
                    "@Presentation_attributes",
                    "@XLink_attributes",
                    "class",
                    "style",
                    "externalResourcesRequired",
                    "transform",
                    "x", "y", "width", "height", "xlink:href"
                ]
            },
            "video": {},
            "view": {
                documentation: "A view is a defined way to view the image, like a zoom level or a detail view.",
                subElements: ["@Descriptive_elements"],
                attributes: [
                    "@Core_attributes",
                    "externalResourcesRequired",
                    "viewBox",
                    "preserveAspectRatio",
                    "zoomAndPan",
                    "viewTarget"
                ]
            },
            "vkern": {
                deprecated: "This feature has been removed from the Web standards.",
                documentation: "The <vkern> SVG element allows to fine-tweak the vertical distance between two glyphs in top-to-bottom fonts",
                attributes: [
                    "@Core_attributes",
                    "u1", "g1", "u2", "g2", "k"
                ]
            }
        },
        "categories": {
            "Animation_elements": [
                "animate",
                "animateColor",
                "animateMotion",
                "animateTransform",
                "discard",
                "mpath",
                "set"
            ],
            "Basic_shapes": [
                "circle",
                "ellipse",
                "line",
                "polygon",
                "polyline",
                "rect"
            ],
            "Container_elements": [
                "a",
                "defs",
                "g",
                "marker",
                "mask",
                "missing-glyph",
                "pattern",
                "svg",
                "switch",
                "symbol",
                "unknown"
            ],
            "Descriptive_elements": [
                "desc",
                "metadata",
                "title"
            ],
            "Filter_primitive_elements": [
                "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "feSpecularLighting", "feTile", "feTurbulence"
            ],
            "Font_elements": [
                "font", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "hkern", "vkern"
            ],
            "Gradient_elements": [
                "linearGradient", "meshgradient", "radialGradient", "stop"
            ],
            "Graphics_elements": [
                "audio", "iframe", "image", "mesh", "use", "video"
            ],
            "HTML_elements": [
                "audio", "canvas", "iframe", "video"
            ],
            "Light_source_elements": [
                "feDistantLight", "fePointLight", "feSpotLight"
            ],
            "Never-rendered_elements": [
                "clipPath", "defs", "hatch", "linearGradient", "marker", "mask", "meshgradient", "metadata", "pattern", "radialGradient", "script", "style", "symbol", "title"
            ],
            "Paint_server_elements": [
                "hatch", "linearGradient", "meshgradient", "pattern", "radialGradient", "solidcolor"
            ],
            "Renderable_elements": [
                "a", "audio", "canvas", "circle", "ellipse", "foreignObject", "g", "iframe", "image", "line", "mesh", "path", "polygon", "polyline", "rect", "svg", "switch", "symbol", "text", "textPath", "tspan", "unknown", "use", "video"
            ],
            "Shape_elements": [
                "circle", "ellipse", "line", "mesh", "path", "polygon", "polyline", "rect"
            ],
            "Structural_elements": [
                "defs", "g", "svg", "symbol", "use"
            ],
            "Text_content_elements": [
                "altGlyph", "altGlyphDef", "altGlyphItem", "glyph", "glyphRef", "textPath", "text", "tref", "tspan"
            ],
            "Text_content_child_elements": [
                "altGlyph", "textPath", "tref", "tspan"
            ],
            "Uncategorized_elements": [
                "clipPath", "color-profile", "cursor", "filter", "foreignObject", "hatchpath", "meshpatch", "meshrow", "script", "style", "view"
            ]
        },
        "attributes": {
            "accent-height": {
                "name": "accent-height",
                "type": "number",
                "documentation": "Defines the distance from the origin to the top of accent characters, measured by a distance within the font coordinate system."
            },
            "accumulate": {
                name: "accumulate",
                documentation: "This attribute controls whether or not the animation is cumulative.",
                enum: ["none", "sum"]
            },
            "additive": {
                name: "additive",
                documentation: "This attribute controls whether or not the animation is additive.",
                enum: ["replace", "sum"]
            },
            "alignment-baseline": {
                name: "alignment-baseline",
                documentation: "The alignment-baseline attribute specifies how an object is aligned with respect to its parent. This property specifies which baseline of this element is to be aligned with the corresponding baseline of the parent. For example, this allows alphabetic baselines in Roman text to stay aligned across font size changes. It defaults to the baseline with the same name as the computed value of the alignment-baseline property.",
                enum: "auto | baseline | before-edge | text-before-edge | middle | central | after-edge | text-after-edge | ideographic | alphabetic | hanging | mathematical | inherit".split(' | ')
            },
            "ascent": {
                name: "ascent",
                documentation: "This attribute defines the maximum unaccented depth of the font within the font coordinate system.",
                type: "number"
            },
            "attributeName": {
                name: "attributeName",
                documentation: "This attribute indicates the name of the attribute in the parent element that is going to be changed during an animation. ",
            },
            "attributeType": {
                name: "attributeType",
                documentation: "This attribute specifies the namespace in which the target attribute and its associated values are defined. ",
                enum: "CSS | XML | auto".split(' | ')
            },
            "azimuth": {
                name: "azimuth",
                documentation: "The azimuth attribute represent the direction angle for the light source on the XY plane (clockwise), in degrees from the x axis.",
                type: "number"
            },
            "baseFrequency": {
                name: "baseFrequency",
                documentation: "The baseFrequency attribute represent The base frequencies parameter for the noise function of the <feturbulence> primitive. If two <number>s are provided, the first number represents a base frequency in the X direction and the second value represents a base frequency in the Y direction. If one number is provided, then that value is used for both X and Y.",
                type: "number-optional-number"
            },
            "baseline-shift": {
                name: "baseline-shift",
                documentation: "The baseline-shift attribute allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element. The shifted object might be a sub- or superscript.",
                enum: "auto | baseline | super | sub | inherit".split(' | '),
                type: "percentage | length"
            },
            "begin": {
                name: "begin",
                documentation: "This attribute defines when an animation should begin."
            },
            "bias": {
                name: "bias",
                documentation: "The bias attribute shifts the range of the filter. After applying the kernelMatrix of the <feconvolvematrix> element to the input image to yield a number and applied the divisor attribute, the bias attribute is added to each component. This allows representation of values that would otherwise be clamped to 0 or 1.",
                type: "number"
            },
            "calcMode": {
                name: "calcMode",
                documentation: "This attribute specifies the interpolation mode for the animation. The default mode is linear, however if the attribute does not support linear interpolation (e.g. for strings), the calcMode attribute is ignored and discrete interpolation is used.",
                enum: "discrete | linear | paced | spline".split(' | ')
            },
            "class": {
                name: "class",
                documentation: "Assigns a class name or set of class names to an element. You may assign the same class name or names to any number of elements. If you specify multiple class names, they must be separated by whitespace characters."
            },
            "clip": {
                name: "clip",
                documentation: "The clip attribute has the same parameter values as defined for the css clip property. Unitless values, which indicate current user coordinates, are permitted on the coordinate values on the <shape>. The value of auto defines a clipping path along the bounds of the viewport created by the given element.",
                enum: "auto | inherit".split(' | '),
                type: "shape"
            },
            "clipPathUnits": {
                name: "clipPathUnits",
                documentation: "The clipPathUnits attribute defines the coordinate system for the contents of the <clippath> element.",
                enum: "userSpaceOnUse | objectBoundingBox".split(' | ')
            },
            "clip-path": {
                name: "clip-path",
                documentation: "The clip-path attribute binds the element it is applied to with a given <clipPath> element",
                enum: "none | inherit".split(' | '),
                type: "FuncIRI"
            },
            "clip-rule": {
                name: "clip-rule",
                documentation: "The clip-rule attribute only applies to graphics elements that are contained within a <clipPath> element. The clip-rule attribute basically works as the fill-rule attribute, except that it applies to <clipPath> definitions.",
                enum: "nonzero | evenodd | inherit".split(' | ')
            },
            "color": {
                name: "color",
                documentation: "The color attribute is used to provide a potential indirect value (currentColor) for the fill, stroke, stop-color, flood-color and lighting-color attributes.",
                enum: "inherit".split(' | '),
                type: "color"
            },
            "color-interpolation": {
                name: "color-interpolation",
                documentation: "The color-interpolation attribute specifies the color space for gradient interpolations, color animations, and alpha compositing.",
                enum: "auto | sRGB | linearRGB | inherit".split(' | ')
            },
            "color-interpolation-filters": {
                name: "color-interpolation-filters",
                documentation: "The color-interpolation-filters attribute specifies the color space for imaging operations performed via filter effects.",
                enum: "auto | sRGB | linearRGB | inherit".split(' | ')
            },
            "color-profile": {
                name: "color-profile",
                documentation: "The color-profile attribute is used to define which color profile a raster image included through the <image> element should use.",
                enum: "auto | sRGB | inherit".split(' | '),
                type: "name | IRI"
            },
            "color-rendering": {
                name: "color-rendering",
                documentation: "The color-rendering attribute provides a hint to the SVG user agent about how to optimize its color interpolation and compositing operations.",
                enum: "auto | optimizeSpeed | optimizeQuality | inherit".split(' | ')
            },
            "contentScriptType": {
                name: "contentScriptType",
                documentation: "The contentScriptType attribute on the <svg> element specifies the default scripting language for the given document fragment."
            },
            "contentStyleType": {
                name: "contentStyleType",
                documentation: "This attribute specifies the style sheet language for the given document fragment. The contentStyleType is specified on the <svg> element. By default, if it's not defined, the value is text/css"
            },
            "cursor": {
                name: "cursor",
                documentation: "The cursor attribute specifies the mouse cursor displayed when the mouse pointer is over an element.",
                enum: "auto | crosshair | default | pointer | move | e-resize | ne-resize | nw-resize | n-resize | se-resize | sw-resize | s-resize | w-resize| text | wait | help | inherit".split(' | ')
            },
            "cx": {
                name: "cx",
                documentation: "For the <circle> and the <ellipse> element, this attribute define the x-axis coordinate of the center of the element. If the attribute is not specified, the effect is as if a value of \"0\" were specified.",
                type: "coordinate"
            },
            "cy": {
                name: "cy",
                documentation: "For the <circle> and the <ellipse> element, this attribute define the y-axis coordinate of the center of the element. If the attribute is not specified, the effect is as if a value of \"0\" were specified.",
                type: "coordinate"
            },
            "d": {
                name: "d",
                documentation: "This attribute defines a path to follow."
            },
            "diffuseConstant": {
                name: "diffuseConstant",
                documentation: "The diffuseConstant attribute represant the kd value in the Phong lighting model. In SVG, this can be any non-negative number.If the attribute is not specified, then the effect is as if a value of 1 were specified.",
                type: "number"
            },
            "direction": {
                name: "direction",
                documentation: "The direction attribute specifies the base writing direction of text and the direction of embeddings and overrides (see unicode-bidi) for the Unicode bidirectional algorithm. For the direction attribute to have any effect on an element that does not by itself establish a new text chunk (such as a <tspan> element without absolute position adjustments due to x or y attributes), the unicode-bidi property's value must be embed or bidi-override.",
                enum: "ltr | rtl | inherit".split(' | ')
            },
            "display": {
                name: "display",
                documentation: "The display attribute lets you control the rendering of graphical or container elements.",
                enum: "inline | block | list-item | run-in | compact | marker | table | inline-table | table-row-group | table-header-group | table-footer-group | table-row | table-column-group | table-column | table-cell | table-caption | none | inherit".split(' | ')
            },
            "divisor": {
                name: "divisor",
                documentation: "After applying the kernelMatrix of the <feconvolvematrix> element to the input image to yield a number, that number is divided by the value given to the divisor attribute to yield the final destination color value. A divisor that is the sum of all the matrix values tends to have an evening effect on the overall color intensity of the result.",
                type: "number"
            },
            "dominant-baseline":{
                name: "dominant-baseline",
                documentation: "The dominant-baseline attribute is used to determine or re-determine a scaled-baseline-table. A scaled-baseline-table is a compound value with three components: a baseline-identifier for the dominant-baseline, a baseline-table and a baseline-table font-size. Some values of the property re-determine all three values; other only re-establish the baseline-table font-size. When the initial value, auto, would give an undesired result, this property can be used to explicitly set the desire scaled-baseline-table.",
                enum: "	auto | use-script | no-change | reset-size | ideographic | alphabetic | hanging | mathematical | central | middle | text-after-edge | text-before-edge | inherit".split(' | ')
            },
            "dur": {
                name: "dur",
                documentation: "This attribute indicates the simple duration of the animation.",
                enum: "indefinite".split(' | '),
                type: "clock-value"
            },
            "dx": {
                name: "dx",
                documentation: "The dx attribute indicates a shift along the x-axis on the position of an element or its content. What exactly is shifted depends on the element for which this attribute is set.",
                type: 'number | list-of-length'
            },
            "dy": {
                name: "dy",
                documentation: "The dy attribute indicates a shift along the y-axis on the position of an element or its content. What exactly is shifted depends on the element for which this attribute is set.",
                type: 'number | list-of-length'
            },
            "edgeMode": {
                name: "edgeMode",
                documentation: "The edgeMode attribute determines how to extend the input image as necessary with color values so that the matrix operations can be applied when the kernel is positioned at or near the edge of the input image.",
                enum: "duplicate | wrap | none".split(' | ')
            },
            "elevation": {
                name: "elevation",
                documentation: "The elevation attribute represent the direction angle for the light source from the XY plane towards the z axis, in degrees. Note the positive Z-axis points towards the viewer of the content.",
                type: "number"
            },
            "end": {
                name: "end",
                documentation: "This attribute defines an end value for the animation that can constrain the active duration."
            },
            "externalResourcesRequired": {
                name: "externalResourcesRequired",
                documentation: "Documents often reference and use the contents of other files (and other Web resources) as part of their rendering. In some cases, authors want to specify that particular resources are required for a document to be considered correct.",
                enum: ["true","false"]
            },
            "fill": {
                name: "fill",
                documentation: "The fill attribute has two meanings based on the context it's used.",
                enum: ["remove", "freeze"],
                type: "paint"
            },
            "fill-opacity": {
                name: "fill-opacity",
                documentation: "This attribute specifies the opacity of the color or the content the current object is filled with.",
                enum: "inherit".split(' | '),
                type: "opacity-value"
            },
            "fill-rule": {
                name: "fill-rule",
                documentation: "The fill-rule attribute indicates how to determine what side of a path is inside a shape, to determine how the fill property paints the shape. For a simple, non-intersecting path, it is intuitively clear what region lies \"inside\"; however, for a more complex path, such as a path that intersects itself or where one subpath encloses another, the interpretation of \"inside\" is not so obvious.",
                enum: "nonzero | evenodd | inherit".split(" | ")
            },
            "filter": {
                name: "filter",
                documentation: "The filter attribute defines the filter effects define by the <filter> element that shall be applied to its element.",
                enum: "none | inherit".split(" | "),
                type: "FuncIRI"
            },
            "filterRes": {
                name: "filterRes",
                documentation: "A <filter> element can define a region to which a given filter effect applies and can provide a resolution for any intermediate continuous tone images used to process any raster-based filter primitives.",
                type: "number-optional-number"
            },
            "filterUnits": {
                name: "filterUnits",
                documentation: "The filterUnits attribute defines the coordinate system for attributes x, y, width and height.",
                enum: ['userSpaceOnUse', 'objectBoundingBox']
            },
            "flood-color": {
                name: "flood-color",
                documentation: "The flood-color attribute indicates what color to use to flood the current filter primitive subregion defined through the <feflood> element. The keyword currentColor and ICC colors can be specified in the same manner as within a <paint> specification for the fill and stroke attributes.",
                enum: "currentColor | inherit".split(' | '),
                type: "color"
            },
            "flood-opacity": {
                name: "flood-opacity",
                documentation: "The flood-opacity attribute indicates the opacity value to use across the current filter primitive subregion defined through the <feflood> element.",
                enum: "inherit".split(' | '),
                type: "opacity-value"
            },
            "font-family": {
                name: "font-family",
                documentation: "The font-family attribute indicates which font family will be used to render the text, specified as a prioritized list of font family names and/or generic family names.",
                enum: ["inherit"]
            },
            "font-size": {
                name: "font-size",
                documentation: "The font-size attribute refers to the size of the font from baseline to baseline when multiple lines of text are set solid in a multiline layout environment. For SVG, if a <length> is provided without a unit identifier (e.g., an unqualified number such as 128), the browser processes the <length> as a height value in the current user coordinate system.",
                enum: "inherit".split(' | '),
                type: "absolute-size | relative-size | length | percentage"
            },
            "font-size-adjust": {
                name: "font-size-adjust",
                documentation: "The font-size-adjust attribute allows authors to specify an aspect value for an element that will preserve the x-height of the first choice font in a substitute font.",
                enum: "none | inherit".split(' | '),
                type: "number"
            },
            "font-stretch": {
                name: "font-stretch",
                documentation: "The font-stretch attribute indicates the desired amount of condensing or expansion in the glyphs used to render the text.",
                enum: "normal | wider | narrower | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded | inherit".split(' | ')
            },
            "font-style": {
                name: "font-style",
                documentation: "The font-style attribute specifies whether the text is to be rendered using a normal, italic or oblique face.",
                enum: "normal | italic | oblique | inherit".split(' | ')
            },
            "font-variant": {
                name: "font-variant",
                documentation: "The font-variant attribute indicates whether the text is to be rendered using the normal glyphs for lowercase characters or using small-caps glyphs for lowercase characters.",
                enum: "normal | small-caps | inherit".split(' | ')
            },
            "font-weight": {
                name: "font-weight",
                documentation: "The font-weight attribute refers to the boldness or lightness of the glyphs used to render the text, relative to other fonts in the same font family.",
                enum: "normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit".split(' | ')
            },
            "from": {
                name: "from",
                documentation: "This attribute indicates the initial value of the attribute that will be modified during the animation. When used with the to attribute, the animation will change the modified attribute from the from value to the to value."
            },
            "fx": {
                name: "fx",
                documentation: "For the <radialGradient> element, this attribute define the x-axis coordinate of the focal point for radial gradient. If the attribute is not specified, it's assumed to be at the same place as the center point.",
                type: "coordinate"
            },
            "fy": {
                name: "fy",
                documentation: "For the <radialGradient> element, this attribute define the y-axis coordinate of the focal point for radial gradient. If the attribute is not specified, it's assumed to be at the same place as the center point.",
                type: "coordinate"
            },
            "gradientTransform": {
                name: "gradientTransform",
                documentation: "The gradientTransform attribute contains the definition of an optional additional transformation from the gradient coordinate system onto the target coordinate system (i.e., userSpaceOnUse or objectBoundingBox). This allows for things such as skewing the gradient. This additional transformation matrix is post-multiplied to (i.e., inserted to the right of) any previously defined transformations, including the implicit transformation necessary to convert from object bounding box units to user space."
            },
            "gradientUnits": {
                name: "gradientUnits",
                documentation: "The gradientUnits attribute defines the coordinate system for attributes x1, y1, x2 and y2 on the <lineargradient> element or for attributes cx, cy, r, fx, and fy on the <radialgradient>.",
                enum: ['userSpaceOnUse', 'objectBoundingBox']
            },
            "height": {
                name: "height",
                documentation: "This attribute indicates a vertical length in the user coordinate system. The exact effect of this coordinate depends on each element. Most of the time, it represents the height of the rectangular region of the reference element (see each individual element's documentation for exceptions).",
                type: "length"
            },
            "href": {
                name: "href",
                documentation: "The href attribute defines a link to a resource as a reference URL. The exact meaning of that link depends on the context of each element using it.",
                type: "URL"
            },
            "id": {
                name: "id",
                documentation: "The id attribute defines a identity for current element."
            },
            "image-rendering": {
                name: "image-rendering",
                documentation: "The image-rendering attribute provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.",
                enum: "auto | optimizeSpeed | optimizeQuality | inherit".split(' | ')
            },
            "in": {
                name: "in",
                documentation: "The in attribute identifies input for the given filter primitive.",
                enum: "SourceGraphic | SourceAlpha | BackgroundImage | BackgroundAlpha | FillPaint | StrokePaint".split(' | '),
                type: "filter-primitive-reference"
            },
            "in2": {
                name: "in2",
                documentation: "The in2 attribute identifies the second input for the given filter primitive. It works exactly like the in attribute.",
                enum: "SourceGraphic | SourceAlpha | BackgroundImage | BackgroundAlpha | FillPaint | StrokePaint".split(' | '),
                type: "filter-primitive-reference"
            },
            "k1": {
                name: "k1",
                documentation: "The k1 attribute defines one of the value to be used within the the arithmetic operation of the <fecomposite> filter primitive. If this attribute is not set, its default value is 0.",
                type: "number"
            },
            "k2": {
                name: "k2",
                documentation: "The k1 attribute defines one of the value to be used within the the arithmetic operation of the <fecomposite> filter primitive. If this attribute is not set, its default value is 0.",
                type: "number"
            },
            "k3": {
                name: "k3",
                documentation: "The k1 attribute defines one of the value to be used within the the arithmetic operation of the <fecomposite> filter primitive. If this attribute is not set, its default value is 0.",
                type: "number"
            },
            "k4": {
                name: "k4",
                documentation: "The k1 attribute defines one of the value to be used within the the arithmetic operation of the <fecomposite> filter primitive. If this attribute is not set, its default value is 0.",
                type: "number"
            },
            "kernelMatrix": {
                name: "kernelMatrix",
                documentation: "the order attribute defines the list of <number>s that make up the kernel matrix for the <feconvolvematrix> element. Values are separated by space characters and/or a comma. The number of entries in the list must equal to <orderX> by <orderY> as defined in the order attribute."
            },
            "kernelUnitLength": {
                name: "kernelUnitLength",
                documentation: "The kernelUnitLength attribute has two meaning based on the context it's used.",
                type: "number-optional-number"
            },
            "kerning": {
                name: "kerning",
                documentation: "The kerning attribute indicates whether the browser should adjust inter-glyph spacing based on kerning tables that are included in the relevant font (i.e., enable auto-kerning) or instead disable auto-kerning and instead set inter-character spacing to a specific length (typically, zero).",
                enum: "auto | inherit".split(' | '),
                type: "length"
            },
            "keySplines": {
                name: "keySplines",
                documentation: "The keySplines attribute define a set of Bézier control points associated with the keyTimes list, defining a cubic Bézier function that controls interval pacing. The attribute value is a semicolon-separated list of control point descriptions. Each control point description is a set of four values: x1 y1 x2 y2, describing the Bézier control points for one time segment. The keyTimes values that define the associated segment are the Bézier \"anchor points\", and the keySplines values are the control points. Thus, there must be one fewer sets of control points than there are keyTimes."
            },
            "keyTimes": {
                name: "keyTimes",
                documentation: "The keyTimes attribute is a semicolon-separated list of time values used to control the pacing of the animation. Each time in the list corresponds to a value in the values attribute list, and defines when the value is used in the animation. Each time value in the keyTimes list is specified as a floating point value between 0 and 1 (inclusive), representing a proportional offset into the duration of the animation element."
            },
            "letter-spacing": {
                name: "letter-spacing",
                documentation: "The letter-spacing attribute specifies spacing behavior between text characters supplemental to any spacing due to the kerning attribute.",
                enum: "normal | inherit".split(' | '),
                type: "length"
            },
            "lighting-color": {
                name: "lighting-color",
                documentation: "The lighting-color attribute defines the color of the light source for filter primitives elements <fediffuselighting> and <fespecularlighting>.",
                enum: "currentColor | inherit".split(' | '),
                type: "color"
            },
            "limitingConeAngle": {
                name: "limitingConeAngle",
                documentation: "The limitingConeAngle attribute represents the angle in degrees between the spot light axis (i.e. the axis between the light source and the point to which it is pointing at) and the spot light cone. So it defines a limiting cone which restricts the region where the light is projected. No light is projected outside the cone.",
                type: "number"
            },
            "local": {
                name: "local",
                documentation: "The unique ID for a locally stored color profile. <string> is the profile's unique ID as specified by International Color Consortium."
            },
            "marker-end": {
                name: "marker-end",
                documentation: "The marker-end defines the arrowhead or polymarker that will be drawn at the final vertex of the given <path> element or basic shape. Note that for a <path> element which ends with a closed sub-path, the last vertex is the same as the initial vertex on the given sub-path. In this case, if marker-end does not equal none, then it is possible that two markers will be rendered on the given vertex. One way to prevent this is to set marker-end to none. (Note that the same comment applies to <polygon> elements.)",
                enum: "none | inherit".split(' | '),
                type: "funciri"
            },
            "marker-mid": {
                name: "marker-mid",
                documentation: "The marker-mid defines the arrowhead or polymarker that shall be drawn at every vertex other than the first and last vertex of the given <path> element or basic shape.",
                enum: "none | inherit".split(' | '),
                type: "funciri"
            },
            "marker-start": {
                name: "marker-start",
                documentation: "The marker-start attribute defines the arrowhead or polymarker that will be drawn at the first vertex of the given <path> element or basic shape.",
                enum: "none | inherit".split(' | '),
                type: "funciri"
            },
            "markerHeight": {
                name: "markerHeight",
                documentation: "The markerHeight represents the height of the viewport into which the <marker> is to be fitted when it is rendered.",
                type: "length"
            },
            "markerUnits": {
                name: "markerUnits",
                documentation: "The markerUnits attribute defines the coordinate system for the attributes markerWidth, markerHeight and the contents of the <marker>.",
                enum: ["userSpaceOnUse", "strokeWidth"]
            },
            "markerWidth": {
                name: "markerWidth",
                documentation: "The markerWidth represents the width of the viewport into which the <marker> is to be fitted when it is rendered.",
                type: "length"
            },
            "mask": {
                name: "mask",
                documentation: "The mask attribute binds the element it is applied to with a given <mask> element.",
                enum: "none | inherit".split(' | '),
                type: "FuncIRI"
            },
            "maskContentUnits": {
                name: "maskContentUnits",
                documentation: "The maskContentUnits attribute defines the coordinate system for the contents of the <mask>.",
                enum: "userSpaceOnUse | objectBoundingBox".split(' | ')
            },
            "maskUnits": {
                name: "maskUnits",
                documentation: "The maskUnits attribute defines the coordinate system for attributes x, y, width and height.",
                enum: "userSpaceOnUse | objectBoundingBox".split(' | ')
            },
            "max": {
                name: "max",
                documentation: "This attribute specifies the maximum value of the active duration. ",
                type: "clock-value"
            },
            "min": {
                name: "min",
                documentation: "This attribute specifies the minimum value of the active duration.",
                type: "clock-value"
            },
            "mode": {
                name: "mode",
                documentation: "The mode attribute defines the blending mode on the <feblend> filter primitive.",
                enum: "normal | multiply | screen | darken | lighten".split(' | ')
            },
            "numOctaves": {
                name: "numOctaves",
                documentation: "The numOctaves parameter for the noise function of the <feturbulence> primitive.",
                type: "integer"
            },
            "opacity": {
                name: "opacity",
                documentation: "The opacity attribute specifies the transparency of an object or of a group of objects, that is, the degree to which the background behind the element is overlaid.",
                enum: "inherit".split(" | "),
                type: "opacity-value"
            },
            "operator": {
                name: "operator",
                documentation: "The operator attribute as two meaning based on the context it's used.",
                enum: "over | in | out | atop | xor | arithmetic".split(' | ')
            },
            "order": {
                name: "order",
                documentation: "the order attribute indicates the size of the matrix to be used by a <feconvolvematrix> element.",
                type: "number-optional-number"
            },
            "overflow": {
                name: "overflow",
                documentation: "The overflow attribute has the same parameter values as defined for the css overflow property.",
                enum: "visible | hidden | scroll | auto | inherit".split(' | ')
            },
            "overline-position": {
                name: "overline-position",
                documentation: "The overline-position attribute represents the ideal vertical position of the overline. The overline position is expressed in the font's coordinate system.",
                type: "number"
            },
            "overline-thickness": {
                name: "overline-thickness",
                documentation: "The overline-thickness attribute represents the ideal thickness of the overline. The overline thickness is expressed in the font's coordinate system.",
                type: "number"
            },
            "paint-order": {
                name: "paint-order",
                documentation: "The paint-order attribute specifies the order that the fill, stroke, and markers of a given shape or text element are painted. Its default value is normal, which indicates that the fill will be painted first, then the stroke, and finally the markers. To specify a different order, a white space separated list of keywords fill, stroke, and markers can be used. If any of the three painting components is omitted, then they will be painted in their default order after the specified components. For example, using stroke is equivalent to stroke fill markers.",
                enum: "normal | inherit".split(' | '),
                enums: "fill | stroke | markers".split(' | ')
            },
            "pathLength": {
                name: "pathLength",
                documentation: "This attribute lets the author specify a total length for the path, in whatever units the author chooses. This value is then used to calibrate the browser's distance calculations with those of the author, by scaling all distance computations using the ratio pathLength / (computed value of path length).",
                type: "number"
            },
            "patternContentUnits": {
                name: "patternContentUnits",
                documentation: "The patternContentUnits attribute defines the coordinate system for the contents of the <pattern>. Note that this attribute has no effect if attribute viewBox is specified on the <pattern> element.",
                enum: "userSpaceOnUse | objectBoundingBox".split(' | ')
            },
            "patternTransform": {
                name: "patternTransform",
                documentation: "The patternTransform attribute contains the definition of an optional additional transformation from the pattern coordinate system onto the target coordinate system. This allows for things such as skewing the pattern tiles. This additional transformation matrix is post-multiplied to (i.e., inserted to the right of) any previously defined transformations, including the implicit transformation necessary to convert from object bounding box units to user space."
            },
            "patternUnits": {
                name: "patternUnits",
                documentation: "The patternUnits attribute defines the coordinate system for attributes x, y, width and height.",
                enum: "userSpaceOnUse | objectBoundingBox".split(' | ')
            },
            "pointer-events": {
                name: "pointer-events",
                documentation: "The pointer-events attribute allows authors to control whether or when an element may be the target of a mouse event. This attribute is used to specify under which circumstance (if any) a mouse event should go \"through\" an element and target whatever is \"underneath\" that element instead.",
                enum: "visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | none | inherit".split(' | ')
            },
            "points": {
                name: "points",
                documentation: "The points attribute define a list of points required to draw a  <polyline> or <polygon> element.",
                type: "list-of-points"
            },
            "pointsAtX": {
                name: "pointsAtX",
                documentation: "The pointsAtX attribute represent the X location in the coordinate system established by attribute primitiveUnits on the <filter> element of the point at which the light source is pointing.",
                type: "number"
            },
            "pointsAtY": {
                name: "pointsAtY",
                documentation: "The pointsAtY attribute represent the Y location in the coordinate system established by attribute primitiveUnits on the <filter> element of the point at which the light source is pointing.",
                type: "number"
            },
            "pointsAtZ": {
                name: "pointsAtZ",
                documentation: "The pointsAtZ attribute represent the Z location in the coordinate system established by attribute primitiveUnits on the <filter> element of the point at which the light source is pointing.",
                type: "number"
            },
            "preserveAlpha": {
                name: "preserveAlpha",
                documentation: "the preserveAlpha attribute indicates how a <feconvolvematrix> element handled alpha transparency.",
                enum: ["true", "false"]
            },
            "preserveAspectRatio": {
                name: "preserveAspectRatio",
                documentation: "In some cases, typically when using the viewBox attribute, it is desirable that the graphics stretch to fit non-uniformly to take up the entire viewport. In other cases, it is desirable that uniform scaling be used for the purposes of preserving the aspect ratio of the graphics."
            },
            "primitiveUnits": {
                name: "primitiveUnits",
                documentation: "The primitiveUnits attribute specifies the coordinate system for the various length values within the filter primitives and for the attributes that define the filter primitive subregion.",
                enum: "userSpaceOnUse | objectBoundingBox".split(' | ')
            },
            "r": {
                name: "r",
                documentation: `For the <circle> this attribute defines the radius of the element. A value of zero disables rendering of the circle.

For the <radialgradient> element, this attribute defines the radius of the largest (i.e., outermost) circle for the radial gradient. The gradient will be drawn such that the 100% gradient stop is mapped to the perimeter of this largest (i.e., outermost) circle. A value of zero will cause the area to be painted as a single color using the color and opacity of the last gradient <stop>. If the attribute is not specified, the effect is as if a value of 50% were specified.`,
                type: "number"
            },
            "radius": {
                name: "radius",
                documentation: "The radius attribute represent the radius for the operation on a given <femorphology> filter primitive. If two <number>s are provided, the first number represents a x-radius and the second value represents a y-radius. If one number is provided, then that value is used for both X and Y. The values are in the coordinate system established by the primitiveUnits attribute on the <filter> element.",
                type: "number-optional-number"
            },
            "repeatCount": {
                name: "repeatCount",
                documentation: "This attribute indicates the number of time the animation will take place.",
                enum: "indefinite".split(' | '),
                type: "number"
            },
            "repeatDur": {
                name: "repeatDur",
                documentation: "This attribute specifies the total duration for repeat.",
                enum: "indefinite".split(' | '),
                type: "clock-value"
            },
            "requiredFeatures": {
                name: "requiredFeatures",
                documentation: "This attribute takes a list of feature strings, with the individual strings separated by white space. It determines whether or not all of the named features are supported by the browser; if all of them are supported, the attribute evaluates to true end the element is rendered; otherwise, the attribute evaluates to false and the current element and its children are skipped and thus will not be rendered. This provides a way to design SVG that gracefully falls back when features aren't available."
            },
            "restart": {
                name: "restart",
                documentation: "This attribute indicates when animation can or can not restart.",
                enum: "always | whenNotActive | never".split(' | ')
            },
            "result": {
                name: "result",
                documentation: "The result attribute defines the assigned name for this filter primitive. If supplied, then graphics that result from processing this filter primitive can be referenced by an in attribute on a subsequent filter primitive within the same <filter> element. If no value is provided, the output will only be available for re-use as the implicit input into the next filter primitive if that filter primitive provides no value for its in attribute."
            },
            "rx": {
                name: "rx",
                documentation: "For the <ellipse> element, this attribute defines the x-radius of the element. A value of zero disables rendering of the element.",
                type: "length"
            },
            "ry": {
                name: "ry",
                documentation: "For the <ellipse> element, this attribute defines the y-radius of the element. A value of zero disables rendering of the element.",
                type: "length"
            },
            "scale": {
                name: "scale",
                documentation: "The scale attribute define the displacement scale factor to be used on a <fedisplacementmap> filter primitive. The amount is expressed in the coordinate system established by the primitiveUnits attribute on the <filter> element.",
                type: "number"
            },
            "seed": {
                name: "seed",
                documentation: "The seed attribute represents the starting number for the pseudo random number generator of the <feTurbulence> primitive.",
                type: "number"
            },
            "shape-rendering": {
                name: "shape-rendering",
                documentation: "The creator of SVG content might want to provide a hint about what tradeoffs to make as the browser renders <path> element or basic shapes. The shape-rendering attribute provides these hints.",
                enum: "auto | optimizeSpeed | crispEdges | geometricPrecision | inherit".split(' | ')
            },
            "specularConstant": {
                name: "specularConstant",
                documentation: "The specularConstant attribute represents the ks value in the Phong lighting model. In SVG, this can be any non-negative number.",
                type: "number"
            },
            "specularExponent": {
                name: "specularExponent",
                documentation: `The specularExponent attribute controls the focus for the light source, a larger value indicate a more "shiny" light.`,
                type: "number"
            },
            "stdDeviation": {
                name: "stdDeviation",
                documentation: "The stdDeviation attribute defines the standard deviation for the blur operation. If two <number>s are provided, the first number represents a standard deviation value along the x-axis. The second value represents a standard deviation along the y-axis. If one number is provided, then that value is used for both X and Y.",
                type: "number-optional-number"
            },
            "stitchTiles": {
                name: "stitchTiles",
                documentation: "The stitchTiles attribute defines how the Perlin tiles behave at the border.",
                enum: "noStitch | stitch".split(' | ')
            },
            "stop-color": {
                name: "stop-color",
                documentation: "The stop-color attribute indicates what color to use at that gradient stop. The keyword currentColor and ICC colors can be specified in the same manner as within a <paint> specification for the fill and stroke attributes.",
                enum: "currentColor | inherit".split(' | '),
                type: "color"
            },
            "stop-opacity": {
                name: "stop-opacity",
                documentation: "The stop-opacity attribute defines the opacity of a given gradient stop.",
                enum: "inherit".split(' | '),
                type: "opacity-value"
            },
            "strikethrough-position": {
                name: "strikethrough-position",
                documentation: "The strikethrough-position attribute represents the ideal vertical position of the strikethrough. The strikethrough position is expressed in the font's coordinate system.",
                type: "number"
            },
            "strikethrough-thickness": {
                name: "strikethrough-thickness",
                documentation: "The strikethrough-thickness attribute represents the ideal thickness of the strikethrough. The strikethrough thickness is expressed in the font's coordinate system.",
                type: "number"
            },
            "stroke": {
                name: "stroke",
                documentation: "The stroke attribute defines the color of the outline on a given graphical element. The default value for the stroke attribute is none.",
                type: "paint"
            },
            "stroke-dasharray": {
                name: "stroke-dasharray",
                documentation: "the stroke-dasharray attribute controls the pattern of dashes and gaps used to stroke paths.",
                enum: "none | inherit".split(' | '),
                type: "dasharray"
            },
            "stroke-dashoffset": {
                name: "stroke-dashoffset",
                documentation: "the stroke-dashoffset attribute specifies the distance into the dash pattern to start the dash.",
                enum: "inherit".split(' | '),
                type: "percentage | length"
            },
            "stroke-linecap": {
                name: "stroke-linecap",
                documentation: "the stroke-linecap attribute specifies the shape to be used at the end of open subpaths when they are stroked.",
                enum: "butt | round | square | inherit".split(' | ')
            },
            "stroke-linejoin": {
                name: "stroke-linejoin",
                documentation: "the stroke-linejoin attribute specifies the shape to be used at the corners of paths or basic shapes when they are stroked.",
                enum: "miter | round | bevel | inherit".split(' | ')
            },
            "stroke-miterlimit": {
                name: "stroke-miterlimit",
                documentation: "When two line segments meet at a sharp angle and miter joins have been specified for stroke-linejoin, it is possible for the miter to extend far beyond the thickness of the line stroking the path. The stroke-miterlimit imposes a limit on the ratio of the miter length to the stroke-width. When the limit is exceeded, the join is converted from a miter to a bevel.",
                enum: "inherit".split(' | '),
                type: "miterlimit"
            },
            "stroke-opacity": {
                name: "stroke-opacity",
                documentation: "the stroke-opacity attribute specifies the opacity of the outline on the current object. Its default value is 1.",
                enum: "inherit".split(' | '),
                type: "opacity-value"
            },
            "stroke-width": {
                name: "stroke-width",
                documentation: "the stroke-width attribute specifies the width of the outline on the current object. Its default value is 1. If a <percentage> is used, the value represents a percentage of the current viewport. If a value of 0 is used the outline will never be drawn.",
                enum: "inherit".split(' | '),
                type: "length | percentage"
            },
            "style": {
                name: "style",
                documentation: "The style attribute specifies style information for its element. It functions identically to the style attribute in HTML.",
                type: "style"
            },
            "surfaceScale": {
                name: "surfaceScale",
                documentation: "The surfaceScale attribute represent the height of the surface for a light filter primitive. If the attribute is not specified, then the effect is as if a value of 1 were specified.",
                type: "number"
            },
            "tabindex": {
                name: "tabindex",
                documentation: "The tabindex SVG attribute allows you to control whether an element is focusable and to define the relative order of the element for the purposes of sequential focus navigation.",
                type: "integer"
            },
            "targetX": {
                name: "targetX",
                documentation: "The targetX attribute determines the positioning in X of the convolution matrix relative to a given target pixel in the input image. The leftmost column of the matrix is column number zero. The value must be such that: 0 <= targetX < orderX. By default, the convolution matrix is centered in X over each pixel of the input image (i.e., targetX = floor ( orderX / 2 )).",
                type: "number"
            },
            "targetY": {
                name: "targetY",
                documentation: "The targetY attribute determines the positioning in Y of the convolution matrix relative to a given target pixel in the input image. The leftmost column of the matrix is column number zero. The value must be such that: 0 <= targetX < orderX. By default, the convolution matrix is centered in X over each pixel of the input image (i.e., targetX = floor ( orderX / 2 )).",
                type: "number"
            },
            "text-anchor": {
                name: "text-anchor",
                documentation: "The text-anchor attribute is used to align (start-, middle- or end-alignment) a string of text relative to a given point.",
                enum: "start | middle | end | inherit".split(' | ')
            },
            "text-decoration": {
                name: "text-decoration",
                documentation: "The text-decoration attribute works exactly like the css text decoration property except that it's an attribute. See css text decoration for further information.",
                enum: "none | underline | overline | line-through | blink | inherit".split(' | ')
            },
            "text-rendering": {
                name: "text-rendering",
                documentation: "The creator of SVG content might want to provide a hint about what tradeoffs to make as the browser renders text. The text-rendering attribute provides these hints.",
                enum: "auto | optimizeSpeed | optimizeLegibility | geometricPrecision | inherit".split(' | ')
            },
            "textLength": {
                name: "textLength",
                documentation: "The textLength attribute is intended to preserve a span of SVG text's display width across a variety of conditions, such as webfonts not loading. It can be applied to either the <text> or <tspan> elements.",
                type: "length"
            },
            "to": {
                name: "to",
                documentation: "This attribute indicates the final value of the attribute that will be modified during the animation. The value of the attribute will change between the from attribute value and this value. By default the change will be linear."
            },
            "transform": {
                name: "transform",
                documentation: "The transform attribute defines a list of transform definitions that are applied to an element and the element's children. The items in the transform list are separated by whitespace and/or commas, and are applied from right to left."
            },
            "type": {
                name: "type",
                enum: "identity | table | discrete | linear | gamma".split(' | ')
            },
            "underline-position": {
                name: "underline-position",
                documentation: "The underline-position attribute represents the ideal vertical position of the underline. The underline position is expressed in the font's coordinate system.",
                type: "number"
            },
            "underline-thickness": {
                name: "underline-thickness",
                documentation: "The underline-thickness attribute represents the ideal thickness of the underline. The underline thickness is expressed in the font's coordinate system.",
                type: "number"
            },
            "vector-effect": {
                name: "vector-effect",
                documentation: "The vector-effect property specifies the vector effect to use when drawing an object. Vector effects are applied before any of the other compositing operations, i.e. filters, masks and clips.",
                enum: "none | non-scaling-stroke | non-scaling-size | non-rotation | fixed-position".split(' | ')
            },
            "viewBox": {
                name: "viewBox",
                documentation: "The viewBox attribute allows you to specify that a given set of graphics stretch to fit a particular container element."
            },
            "visibility": {
                name: "visibility",
                documentation: "Depending on the value of attribute pointer-events, graphics elements which have their visibility attribute set to hidden still might receive events.",
                enum: "visible | hidden | collapse | inherit".split(' | ')
            },
            "width": {
                name: "width",
                documentation: "This attribute indicates an horizontal length in the user coordinate system. The exact effect of this coordinate depends on each element. Most of the time, it represents the width of the rectangular region of the reference element (see each individual element's documentation for exceptions).",
                type: "length"
            },
            "word-spacing": {
                name: "word-spacing",
                documentation: "The word-spacing attribute specifies spacing behavior between words.",
                enum: "normal | inherit".split(' | '),
                type: "length"
            },
            "writing-mode": {
                name: "writing-mode",
                documentation: "The writing-mode attribute specifies whether the initial inline-progression-direction for a <text> element shall be left-to-right, right-to-left, or top-to-bottom. The writing-mode attribute applies only to <text> elements; the attribute is ignored for <tspan>, <tref>, <altGlyph> and <textPath> sub-elements. (Note that the inline-progression-direction can change within a <text> element due to the Unicode bidirectional algorithm and properties direction and unicode-bidi.",
                enum: "lr-tb | rl-tb | tb-rl | lr | rl | tb | inherit".split(' | ')
            },
            "x": {
                name: "x",
                documentation: "This attribute indicates an x-axis coordinate in the user coordinate system. The exact effect of this coordinate depend on each element. Most of the time, it represent the x-axis coordinate of the upper-left corner of the rectangular region of the reference element (see each individual element's documentation for exceptions).Its syntax is the same as that for <length>",
                type: "coordinate"
            },
            "x1": {
                name: "x1",
                documentation: "define the 1 x-axis coordinate",
                type: "coordinate"
            },
            "x2": {
                name: "x2",
                documentation: "define the 2 x-axis coordinate",
                type: "coordinate"
            },
            "xChannelSelector": {
                name: "xChannelSelector",
                documentation: "For a <fedisplacementmap> filter primitive, The xChannelSelector attribute indicates which channel from in2 to use to displace the pixels in in along the x-axis. If attribute xChannelSelector is not specified, then the effect is as if a value of A were specified.",
                enum: "R | G | B | A".split(' | ')
            },
            "xlink:href": {
                name: "xlink:href",
                documentation: "The xlink:href attribute defines a link to a resource as a reference <IRI>.",
                deprecated: "Deprecated since SVG 2",
                type: "IRI | FuncIRI"
            },
            "xlink:show": {
                name: "xlink:show",
                documentation: "This attribute is provided for backwards compatibility with SVG 1.1. It provides documentation to XLink-aware processors. In case of a conflict, the target attribute has priority, since it can express a wider range of values."
            },
            "xlink:title": {
                name: "xlink:title",
                documentation: "The xlink:title attribute is used to describe the meaning of a link or resource in a human-readable fashion, along the same lines as the xlink:role or xlink:arcrole attribute. A value is optional; if a value is supplied, it shall contain a string that describes the resource. In general it is preferable to use a <title> child element rather than a xlink:title attribute."
            },
            "xml:lang": {
                name: "xml:lang",
                documentation: `xml:lang is a universal attribute allowed in all XML dialects to mark up the natural human language that an element contains. It's almost identical in usage to HTML's lang, but in conforming XML 1.0 documents, it does not allow the use of a null attribute value (xml:lang="") to indicate an unknown language. Instead, use xml:lang="und".`
            },
            "xmlns": {
                name: "xmlns",
                documentation: "The SVG namespace, declared as the default namespace for this element and its children.",
                enum: ["http://www.w3.org/2000/svg"]
            },
            "xml:space": {
                name: "xml:space",
                documentation: "This attribute influences how browsers parse text content and therefore changes the way the DOM is built. Therefore, changing this attributeʼs value through the DOM API may have no effect.",
                deprecated: true,
                enum: ['default', 'preserve']
            },
            "xmlns:xlink": {
                name: "xmlns:xlink",
                documentation: "The XLink namespace, attached to the `xlink` prefix.",
                enum: ["http://www.w3.org/1999/xlink"]
            },
            "y": {
                name: "y",
                documentation: "This attribute indicates an y-axis coordinate in the user coordinate system. The exact effect of this coordinate depend on each element. Most of the time, it represent the x-axis coordinate of the upper-left corner of the rectangular region of the reference element (see each individual element's documentation for exceptions).Its syntax is the same as that for <length>",
                type: "coordinate"
            },
            "y1": {
                name: "y1",
                documentation: "define the 1 y-axis coordinate",
                type: "coordinate"
            },
            "y2": {
                name: "y2",
                documentation: "define the 2 y-axis coordinate",
                type: "coordinate"
            },
            "yChannelSelector": {
                name: "yChannelSelector",
                documentation: "For a <fedisplacementmap> filter primitive, The xChannelSelector attribute indicates which channel from in2 to use to displace the pixels in in along the y-axis. If attribute yChannelSelector is not specified, then the effect is as if a value of A were specified.",
                enum: "R | G | B | A".split(' | ')
            },
            "z": {
                name: "z",
                documentation: "The z attribute difine the location along the Z-axis for a light source in the coordinate system established by the primitiveUnits attribute on the <filter> element, assuming that, in the initial coordinate system, the positive Z-axis comes out towards the person viewing the content and assuming that one unit along the Z-axis equals on unit in X and Z.",
                type: "number"
            }
        },
        "attributeCategories": {
            "Animation_event_attributes": [
                "onbegin", "onend", "onload", "onrepeat"
            ],
            "Animation_attribute_target_attributes": [
                "attributeType", "attributeName"
            ],
            "Animation_timing_attributes": [
                "begin", "dur", "end", "min", "max", "restart", "repeatCount", "repeatDur", "fill"
            ],
            "Animation_value_attributes": [
                "calcMode", "values", "keyTimes", "keySplines", "from", "to", "by", "autoReverse", "accelerate", "decelerate"
            ],
            "Animation_addition_attributes": [
                "additive", "accumulate"
            ],
            "Conditional_processing_attributes": [
                "requiredExtensions", "requiredFeatures", "systemLanguage"
            ],
            "Core_attributes": [
                "id", "xml:base", "xml:lang", "xml:space", "tabindex"
            ],
            "Document_event_attributes": [
                "onabout", "onerror", "onresize", "onscroll", "onunload", "onzoom"
            ],
            "Filter_primitive_attributes": [
                "height", "result", "width", "x", "y"
            ],
            "Graphical_event_attributes": [
                "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup"
            ],
            "Presentation_attributes": [
                "alignment-baseline", "baseline-shift", "clip", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cursor", "direction", "display", "dominant-baseline", "enable-background", "fill", "fill-opacity", "fill-rule", "filter", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal", "glyph-orientation-vertical", "image-rendering", "kerning", "letter-spacing", "lighting-color", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "overflow", "pointer-events", "shape-rendering", "stop-color", "stop-opacity", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-anchor", "text-decoration", "text-rendering", "unicode-bidi", "vector-effect", "visibility", "word-spacing", "writing-mode"
            ],
            "Style_attributes": [
                "class", "style"
            ],
            "Transfer_function_attributes": [
                "type", "tableValues", "slope", "intercept", "amplitude", "exponent", "offset"
            ],
            "XLink_attributes": [
                "xlink:href", "xlink:type", "xlink:role", "xlink:arcrole", "xlink:title", "xlink:show", "xlink:actuate"
            ]
        }
    };

    // subElements 属性展开 @ 开头的分类信息
    let svgCategories = svg.categories;
    for (let element in svg.elements) {
        let ele = svg.elements[element];
        if (ele.subElements) {
            let addElements: string[] = [];
            let removeElements: string[] = [];
            for (let subElement of ele.subElements) {
                if (subElement[0] == '@') {
                    // console.log(subElement);
                    removeElements.push(subElement);
                    let categoryElements = svgCategories[subElement.substr(1)];
                    if(categoryElements){
                        for (let categoryElement of categoryElements) {
                            if (ele.subElements.indexOf(categoryElement) == -1 && addElements.indexOf(categoryElement) == -1) {
                                // console.log(categoryElement);
                                addElements.push(categoryElement);
                            }
                        }
                    }
                }
            }
            ele.subElements = ele.subElements.concat(addElements);
            for (let removeElement of removeElements) {
                utils.removeItem(ele.subElements, removeElement);
            }
        }
    }

    // attributes 属性展开 @ 开头的分类信息
    svgCategories = svg.attributeCategories;
    for (let element in svg.elements) {
        let ele = svg.elements[element];
        if (ele.attributes) {
            let addAttributes: string[] = [];
            let removeAttributes: string[] = [];
            for (let attribute of ele.attributes) {
                if (typeof attribute == 'string') {
                    if (attribute[0] == '@') {
                        // console.log(subElement);
                        removeAttributes.push(attribute);
                        let categoryAttributes = svgCategories[attribute.substr(1)];
                        if(categoryAttributes){
                            for (let categoryAttribute of categoryAttributes) {
                                if (ele.attributes.indexOf(categoryAttribute) == -1 && addAttributes.indexOf(categoryAttribute) == -1) {
                                    // console.log(categoryElement);
                                    addAttributes.push(categoryAttribute);
                                }
                            }
                        }
                    }
                }
            }
            ele.attributes = ele.attributes.concat(addAttributes);
            for (let removeAttribute of removeAttributes) {
                utils.removeItem(ele.attributes, removeAttribute);
            }
        }
    }

    // 应用本地化语言
    let languageSVGFile = path.resolve(__dirname, '../../locale', 'svg.' + language + '.json');
    try{
        let languageSVG = <ISvgLanguageJson>JSON.parse(fs.readFileSync(languageSVGFile, "utf8"));

        function applyLangauge(input:{[pn:string]:any}, target:{[pn:string]:any}) {
            for(var key in input) {
                if(typeof input[key] == 'string' && typeof target[key] == 'string') {
                    target[key] = input[key];
                } else if(typeof input[key] == 'object' && typeof target[key] == 'object') {
                    applyLangauge(input[key], target[key]);
                }
            }
        }

        applyLangauge(languageSVG, svg);

    } catch (e){
        // console.warn(e);
    }

    // 安装帮助方法
    svg.getElement = (el: string, version: SvgVersion) => {
        let base = svg.elements[el];
        if(base) {
            let versionSpec = base.version_1_1;
            if(version == 'version_2_draft') {
                versionSpec = base.version_2_draft;
            }
            return Object.assign({}, versionSpec, base);
        }
        return base;
    };

    // 安装帮助方法
    svg.getAttribute = (el: string, attr: SvgVersion, version: string) => {
        let baseEl = svg.elements[el];
        let elSpec : ISvgJsonAttribute | undefined;
        if(baseEl) {
            if(baseEl.attributes) {
                elSpec = <ISvgJsonAttribute | undefined>baseEl.attributes.find(o=>typeof o == 'object' && o.name == attr);
            }
        }
        let base = svg.attributes[attr];
        if(base) {
            let versionSpec = base.version_1_1;
            if(version == 'version_2_draft') {
                versionSpec = base.version_2_draft;
            }
            return Object.assign({}, versionSpec, elSpec, base);
        }
        return base;
    };

    return <ISvgJsonRoot>svg;
}
