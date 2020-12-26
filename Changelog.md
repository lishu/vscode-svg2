# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 1.4.3 - 2020-12-26
### Added
- Preview now support css file change auto update (after css file saved).

## 1.4.2 - 2020-12-11
### Fixed
- `HTML Custom Data` for html document addition data

## 1.4.1 - 2020-11-02
### Fixed
- IntelliSense enum options not correct after last complete rewrite.
### Added
- `vector-effect` attribute to `Presentation` category.

## 1.4.0 - 2020-10-22
### Add
- Editor add `Copy as Image Data Uri` command in Context Menu, now you can copy svg add parse it to `<img src="|" />` direct.
- Preview how can show `Crossline`.
- Preview how can show `Ruler`.

## 1.3.12 - 2020-10-18
### Changed
- Emmet-Style auto complete has support full 2.0 definions.

## 1.3.11 - 2020-10-11
### Added
- Add svg elements & attributes to HTML Language Service Custom Data.
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
- Fixed top bar on svg preview covers top of preview

## 1.3.7 - 2020-07-26
### Change
- Change default format to html base

## 1.3.6 - 2020-07-19
### Change
- Change format svgo configration

## 1.3.5 - 2020-06-28
### Added
- Preview now can select css files.

## 1.3.4 - 2020-06-12
### Added
- Support paint (`fill`, `stroke`) url picker for `linearGradient`/`radialGradient`/`pattern` 

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
- Add a Lock button in Previewer (show only `svg.preview.viewMode` is `onlyOne`) can lock current previewer to displayed svg document.

## 1.2.0 - 2020-05-25
### Added
- Add `style` css base supported

## 1.1.9 - 2020-05-17
### Change
- Permit newlines in the comment body regex.
- vscode Webview Outdated API Replace.

## 1.1.8 - 2020-04-24
### Added
- Preview add `svg`/`img` mode switch can show how a svg use in html or img. Show svg document can only view in img mode.

## 1.1.7 - 2020-03-28
### Added
- Add `svg.preview.backgroundSaveTo` option so prevent **preview** create `.vscode\settings.json` in workspace

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
* Fix in `Untitled` file, some command no working.

## 1.0.2
* Add `svg.pathDataHighlight` configuration you can disable path data highlight feature
* Fix release webpack bug `minifySvg` command no working

## 1.0.1
* Fix Preview toolbar styles bug
* Add `svg.preview.autoShow` configuration let preview auto show when a SVG document open

## 1.0.0 - 2019-08-30
* All Rewrite base langauge service protocol
* Add MDN doc link to hover tip and completion documentation
* Add Export PNG in perview view
* Remove Unnecessary configuration

## 0.1.6
* A small amount of BUG fixes.

## 0.1.5
* Pretty SVG now set indent use editor tabSize setting.
* Update all package for Security.

## 0.1.4
* FIX Preview Zoom Reset.

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
* Improve Completion list in paint show color keywords.
* Improve Completion list work like snipple (For base sharp). Required vscode >=1.8 .
* The `svg.completion.showDeprecated` Configuration item is actived, will not show deprecated item in completion list by default(`false`).

## 0.0.2

* Improve Preview.
* Improve Id Symbol show `[tag]#[id]` and fix a bug.

## 0.0.1 - 2017-02-02

* Initial release.