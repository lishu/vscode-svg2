[![Version](https://vsmarketplacebadge.apphb.com/version/jock.svg.svg)](https://marketplace.visualstudio.com/items?itemName=jock.svg)

# svg

A Powerful SVG Language Support Extension.
Almost all the features you need to handle SVG.

## Features

### SVG Full Auto Completion.

![feature 1](images/f1s.gif)

> Tip: All Completion list is context, will only show enable items.

### Document Symbol tree.

![feature 2](images/f3.png)

### SVG Live Preview and Export PNG

![feature 3](images/f2s.gif)

### MDN Reference for fast learn

![feature 4](images/f3s.gif)

> Tip: Configure Trusted Domains add MDN to it get more fast action.

### Fast Color Picker

![feature 4](images/f4s.gif)

### Rename Tag Name or Id Reference.

Cursor in Tag Name or Id Attribute or url(#id) Hit F2(Windows) Key, Rename it!

### In Id Reference Click Goto id="" element.

Hot Ctrl Key and Move mouse to a url(#id), That it!

### SVG Format Support
~~Formatting support using SVGO, which can prettify SVGs and sort tag attributes.
SVGO works as a group of plugins that can be activated or desactivated (which is default for most in this extension).
Information on the plugins can be found [here](https://www.npmjs.com/package/svgo).~~

Formatting support now is replace to HTML Language Serivce for compatible with complex svg content

### Minify SVG with SVGO

Open the **Command Palette** (`⇧⌘P` on Mac and `Ctrl+Shift+P` on Win/Linux) and run `Minify SVG`. This will reduce the filesize significantly by removing all unnecessary code from the image.

## Contributors

* [Laurent Tréguier](https://github.com/LaurentTreguier) for sharing SVG formatting features
* [Björn Ganslandt](https://github.com/Ansimorph) for sharing Minify SVG features
* [Amelia Bellamy-Royds](https://github.com/AmeliaBR) for Add the xmlns and xmlns:xlink attributes
* [Evan Demaris](https://github.com/evandemaris)
* [Trevor Burnham](https://github.com/TrevorBurnham)
* [Philipp Kief](https://github.com/PKief)

## Known Issues

SVG Version 2.0 is not included.

## Changelog

### 1.4.8 - 2021-07-17
- Add `Simple Elements` completion configuration. This will change completion action result to `<simple />`.

### 1.4.7 - 2021-06-09
- Clean release package.

### 1.4.6 - 2021-05-02
- Change activation event for speed up startup of VSCode.
- Fixed `Preview All SVG` UI not scrollbar.

### 1.4.5 - 2021-01-21
- Add preview `Toolbar Size` option.

### 1.4.4 - 2021-01-18
- Preview add `Dark Transparent Background` option.

### [MORE](Changelog.md)

## Donations
[Support me in paypal](https://www.paypal.me/jockli).

-----------------------------------------------------------------------------------------------------------
## For more information

* [MDN SVG Reference](https://developer.mozilla.org/en-US/docs/Web/SVG)

**Enjoy!**