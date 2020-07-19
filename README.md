[![Version](https://vsmarketplacebadge.apphb.com/version/jock.svg.svg)](https://marketplace.visualstudio.com/items?itemName=jock.svg)

# svg

A Powerful SVG Language Support Extension.
Almost all the features you need to handle SVG.

## **Breaking Changes**
We Removed default `tabSize` & `formatOnSave` configurations `[svg]` override, If your want old effects, add the following to your 'settings.json'. 
```json
    "[svg]": {
        "editor.tabSize": 4,
        "editor.formatOnSave": false
    }
```

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
Formatting support using SVGO, which can prettify SVGs and sort tag attributes.
SVGO works as a group of plugins that can be activated or desactivated (which is default for most in this extension).
Information on the plugins can be found [here](https://www.npmjs.com/package/svgo).

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

### 1.3.6 - 2020-07-19
- Change format svgo configration
- Remove default `tabSize` & `formatOnSave` configurations override

### 1.3.5 - 2020-06-28
- Preview now can select css files.

### 1.3.4 - 2020-06-12
- Support paint (`fill`, `stroke`) url picker for `linearGradient`/`radialGradient`/`pattern` 

### 1.3.1 - 2020-06-03
- Fixed `Preview All SVG` command only work first open

### 1.3.0 - 2020-06-02
- Add `Preview All SVG` command
- Add `svg.preview.viewMode` configuration option, so preview can show one by one
- Add a Lock button in Previewer (show only `svg.preview.viewMode` is `onlyOne`) can lock current previewer to displayed svg document.

### 1.2.0 - 2020-05-25
- Add `style` css base supported

### [MORE](Changelog.md)

## Donations
[Support me in paypal](https://www.paypal.me/jockli).

-----------------------------------------------------------------------------------------------------------
## For more information

* [MDN SVG Reference](https://developer.mozilla.org/en-US/docs/Web/SVG)

**Enjoy!**