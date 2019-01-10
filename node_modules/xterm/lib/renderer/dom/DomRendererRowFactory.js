"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Buffer_1 = require("../../Buffer");
exports.BOLD_CLASS = 'xterm-bold';
exports.ITALIC_CLASS = 'xterm-italic';
exports.CURSOR_CLASS = 'xterm-cursor';
var DomRendererRowFactory = (function () {
    function DomRendererRowFactory(_document) {
        this._document = _document;
    }
    DomRendererRowFactory.prototype.createRow = function (lineData, isCursorRow, cursorX, cellWidth, cols) {
        var fragment = this._document.createDocumentFragment();
        var colCount = 0;
        for (var x = 0; x < lineData.length; x++) {
            if (colCount >= cols) {
                continue;
            }
            var charData = lineData[x];
            var char = charData[Buffer_1.CHAR_DATA_CHAR_INDEX];
            var attr = charData[Buffer_1.CHAR_DATA_ATTR_INDEX];
            var width = charData[Buffer_1.CHAR_DATA_WIDTH_INDEX];
            if (width === 0) {
                continue;
            }
            var charElement = this._document.createElement('span');
            if (width > 1) {
                charElement.style.width = cellWidth * width + "px";
            }
            var flags = attr >> 18;
            var bg = attr & 0x1ff;
            var fg = (attr >> 9) & 0x1ff;
            if (isCursorRow && x === cursorX) {
                charElement.classList.add(exports.CURSOR_CLASS);
            }
            if (flags & 8) {
                var temp = bg;
                bg = fg;
                fg = temp;
                if (fg === 256) {
                    fg = 0;
                }
                if (bg === 257) {
                    bg = 15;
                }
            }
            if (flags & 1) {
                if (fg < 8) {
                    fg += 8;
                }
                charElement.classList.add(exports.BOLD_CLASS);
            }
            if (flags & 64) {
                charElement.classList.add(exports.ITALIC_CLASS);
            }
            charElement.textContent = char;
            if (fg !== 257) {
                charElement.classList.add("xterm-fg-" + fg);
            }
            if (bg !== 256) {
                charElement.classList.add("xterm-bg-" + bg);
            }
            fragment.appendChild(charElement);
            colCount += width;
        }
        return fragment;
    };
    return DomRendererRowFactory;
}());
exports.DomRendererRowFactory = DomRendererRowFactory;
//# sourceMappingURL=DomRendererRowFactory.js.map