# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 1.4.24 - 2022-12-17

### Fixed

* Format not handle `<?xml ... ?>` newline.

## 1.4.23 - 2022-11-18

### Changed

* Dependent package security updates

* Public `svg.showSvg` command so user can add hotkey.

## 1.4.22 - 2022-10-15

* fix publish dev source branch.

## 1.4.21 - 2022-10-15

### Added

* `<style>` CSS color picker support.

## 1.4.20 - 2022-09-17

### Added

* `Preview: Scale Zoom` Configure custom zoom scale of change of the zoom operation.
* `Preview: Zoom Options` Configure custom preview zoom dropdown options.

## 1.4.19 - 2022-07-16

### Added

* Partial support for CDATA in script/style element.
* Add `Preview All: Exclude` Config for `Preview All Svg` command filter files.

## 1.4.18 - 2022-05-14

### Changed

* Zoom level will not reset when document changes.

## 1.4.17 - 2022-02-09

### Changed

* Preview min Zoom will auto-change for big size SVGs.

## 1.4.16 - 2022-02-05

### Added

* New `Translate External Address` Setting for Previewer Show `<img>` mode external URL content

## 1.4.15 - 2021-12-22
### Fixed 
- Previewer Focus on Exception.
### Added
- Warning for `Minify`.
- `Code Interactive` Button in Preview toolbar.

## 1.4.14 - 2021-11-08
### Changed
- Language grammars scopes to `text.xml.svg`
### Added
- Enter rules for auto indent

## 1.4.13 - 2021-10-16
### Fixed
- Preview pixel grid broken.

## 1.4.11 - 2021-10-02
### Added
- Preview has new default `FIT` mode.
### Changed
- More Preview bug fixes

### 1.4.10 - 2021-09-18
### Added 
- Preview `Disable Preview` configuration. Just for who don't like this extension's preview.

## 1.4.9 - 2021-07-18
### Added
- Preview `<svg>` mode will show active graphic's shape and click to source code position.

## 1.4.8 - 2021-07-17
### Added
- `Simple Elements` completion configuration. This will change completion action result to `<simple />`.

## 1.4.7 - 2021-06-09
- Clean release package.

## 1.4.6 - 2021-05-02
### Changed
- Activation event for speed up startup of VSCode.
### Fixed
- `Preview All SVG` UI not showing the scrollbar.

## 1.4.5 - 2021-01-21
### Added
- Preview add `Toolbar Size` option.

## 1.4.4 - 2021-01-18
### Added
- Preview add `Dark Transparent Background` option.

## 1.4.3 - 2020-12-26
### Added
- Preview now support CSS file change auto update (after CSS file saved).

## 1.4.2 - 2020-12-11
### Fixed
- `HTML Custom Data` for adding HTML document additional data

## 1.4.1 - 2020-11-02
### Fixed
- IntelliSense enum options not correct after last complete rewrite.
### Added
- `vector-effect` attribute to `Presentation` category.

## 1.4.0 - 2020-10-22
### Add
- Editor add `Copy as Image Data Uri` command in Context Menu, now you can copy SVG add parse it to `<img src="|" />` directly.
- Preview now shows `Crossline`.
- Preview now shows `Ruler`.

## 1.3.12 - 2020-10-18
### Changed
- Emmet-Style auto complete, support full 2.0 definitions.

## 1.3.11 - 2020-10-11
### Added
- Add SVG elements & attributes to HTML Language Service Custom Data.
- Experimental add emmet-style auto complete, If you want to try this feature, configure 'svg.completion.emmet' to 'true'.

## 1.3.10 - 2020-09-17
### Fixed
- Fixed write top level comment has error message in output.

## 1.3.9 - 2020-09-04
### Added
- The previewer now supports up to 64x scaling.
- After 16x zoom, the pixel grid is automatically displayed.

## 1.3.8 - 2020-08-01
### Fixed
- Fixed top bar on SVG preview covers top of preview

## 1.3.7 - 2020-07-26
### Change
- Change default format to HTML base

## 1.3.6 - 2020-07-19
### Change
- Change format SVGO configration

## 1.3.5 - 2020-06-28
### Added
- Preview now can select CSS files.

## 1.3.4 - 2020-06-12
### Added
- Support paint (`fill`, `stroke`) URL picker for `linearGradient`/`radialGradient`/`pattern` 

## 1.3.3 - 2020-06-04
### Fixed
- Fixed 'auto show' always on (off no effect)

## 1.3.2 - 2020-06-03
### Fixed
- Fixed thin preview command action

## 1.3.1 - 2020-06-03
### Fixed
- Fixed `Preview All SVG` command only work first open

## 1.3.0 - 2020-06-02
### Added
- Add `Preview All SVG` command
- Add `svg.preview.viewMode` configuration option, so preview can show one by one
- Add a Lock button in Previewer (show only `svg.preview.viewMode` is `onlyOne`) can lock current previewer to displayed SVG document.

## 1.2.0 - 2020-05-25
### Added
- Add `style` CSS base supported

## 1.1.9 - 2020-05-17
### Change
- Permit newlines in the comment body Regex.
- VS Code Webview Outdated API Replace.

## 1.1.8 - 2020-04-24
### Added
- Preview add `svg`/`img` mode switch can show how an SVG can be used in an HTML or an IMG. Show when SVG document can only view in IMG mode.

## 1.1.7 - 2020-03-28
### Added
- Add `svg.preview.backgroundSaveTo` option to prevent **preview** create `.vscode\settings.json` in workspace

## 1.1.6 - 2020-03-25
### Fixed
- The `Minify SVG` option from the context menu does not work

## 1.1.5 - 2020-03-15
### Added
- Add `id`, `xlink:href="#"` goto definition / reference support

## 1.1.4
### Changed
- configuration `svg.minify.removeXMLNS` default value set to `false`
### Added
- #11 Add `in`, `in2`, `result` goto definition / reference
### Fixed
- Fix `id`, `url(#)` goto definition / reference

## 1.1.3
### Fixed
- Format bug from `SVGO`

## 1.1.2
### Fixed
- Previewer will not auto take focus.

## 1.1.1
### Fixed
- `Minify Svg` menu show in all editor

## 1.1.0
### Added
- Path data auto tip feature

## 1.0.5
* Fix `pathDataHighlight` does not work after VS Code restarting

## 1.0.3 & 1.0.4
* Fix in `Untitled` file, some commands not working.

## 1.0.2
* Add `svg.pathDataHighlight` configuration you can disable path data highlight feature
* Fix release webpack bug `minifySvg` command not working

## 1.0.1
* Fix Preview toolbar styles bug
* Add `svg.preview.autoShow` configuration to allow a preview to auto show when an SVG document is opened

## 1.0.0 - 2019-08-30
* Rewrite all base langauge service protocol
* Add MDN doc link to hover tip and completion documentation
* Add Export PNG in perview view
* Remove Unnecessary configuration

## 0.1.6
* A small amount of BUG fixes.

## 0.1.5
* Pretty SVG now set to use editor tabSize setting.
* Update all package for Security.

## 0.1.4
* Fix Preview Zoom Reset.

## 0.1.3
* Add Zoom to Preview.
* Add Background Switch to Preview.

## 0.1.2
* Add 'xlink:href' attribute.

## 0.1.1
* Fix The contents of the document are emptied when the format fails.

## 0.1.0
* Add `Pretty SVG` command.
* Add Experimental Setting `svg.disableFormatOnSave`.

## 0.0.9
* Add `Minify SVG` command.

## 0.0.8
* Change Format SVGO Options.

## 0.0.7
* Fix some debug time warning.
* Change Preview use 'Transparent' background.

## 0.0.6
* Add Formatting support using SVGO.

## 0.0.5
* Add url(#id) Definition Provider.

## 0.0.4
* Add New Rename Provider.

## 0.0.3
* New Hover Info Support.
* Improve Completion list in picker show color keywords.
* Improve Completion list work like snippet (For base sharp). Required vscode >=1.8 .
* The `svg.completion.showDeprecated` Configuration item is activated, will not show deprecated item in completion list by default(`false`).

## 0.0.2

* Improve Preview.
* Improve Id Symbol show `[tag]#[id]` and fix a bug.

## 0.0.1 - 2017-02-02

* Initial release.
