"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter_1 = require("../../EventEmitter");
var ColorManager_1 = require("../ColorManager");
var RenderDebouncer_1 = require("../../ui/RenderDebouncer");
var DomRendererRowFactory_1 = require("./DomRendererRowFactory");
var TERMINAL_CLASS_PREFIX = 'xterm-dom-renderer-owner-';
var ROW_CONTAINER_CLASS = 'xterm-rows';
var FG_CLASS_PREFIX = 'xterm-fg-';
var BG_CLASS_PREFIX = 'xterm-bg-';
var FOCUS_CLASS = 'xterm-focus';
var SELECTION_CLASS = 'xterm-selection';
var nextTerminalId = 1;
var DomRenderer = (function (_super) {
    __extends(DomRenderer, _super);
    function DomRenderer(_terminal, theme) {
        var _this = _super.call(this) || this;
        _this._terminal = _terminal;
        _this._terminalClass = nextTerminalId++;
        _this._rowElements = [];
        var allowTransparency = _this._terminal.options.allowTransparency;
        _this.colorManager = new ColorManager_1.ColorManager(document, allowTransparency);
        _this.setTheme(theme);
        _this._rowContainer = document.createElement('div');
        _this._rowContainer.classList.add(ROW_CONTAINER_CLASS);
        _this._rowContainer.style.lineHeight = 'normal';
        _this._rowContainer.setAttribute('aria-hidden', 'true');
        _this._refreshRowElements(_this._terminal.rows, _this._terminal.cols);
        _this._selectionContainer = document.createElement('div');
        _this._selectionContainer.classList.add(SELECTION_CLASS);
        _this._selectionContainer.setAttribute('aria-hidden', 'true');
        _this.dimensions = {
            scaledCharWidth: null,
            scaledCharHeight: null,
            scaledCellWidth: null,
            scaledCellHeight: null,
            scaledCharLeft: null,
            scaledCharTop: null,
            scaledCanvasWidth: null,
            scaledCanvasHeight: null,
            canvasWidth: null,
            canvasHeight: null,
            actualCellWidth: null,
            actualCellHeight: null
        };
        _this._updateDimensions();
        _this._renderDebouncer = new RenderDebouncer_1.RenderDebouncer(_this._terminal, _this._renderRows.bind(_this));
        _this._rowFactory = new DomRendererRowFactory_1.DomRendererRowFactory(document);
        _this._terminal.element.classList.add(TERMINAL_CLASS_PREFIX + _this._terminalClass);
        _this._terminal.screenElement.appendChild(_this._rowContainer);
        _this._terminal.screenElement.appendChild(_this._selectionContainer);
        return _this;
    }
    DomRenderer.prototype._updateDimensions = function () {
        var _this = this;
        this.dimensions.scaledCharWidth = this._terminal.charMeasure.width * window.devicePixelRatio;
        this.dimensions.scaledCharHeight = this._terminal.charMeasure.height * window.devicePixelRatio;
        this.dimensions.scaledCellWidth = this.dimensions.scaledCharWidth;
        this.dimensions.scaledCellHeight = this.dimensions.scaledCharHeight;
        this.dimensions.scaledCharLeft = 0;
        this.dimensions.scaledCharTop = 0;
        this.dimensions.scaledCanvasWidth = this.dimensions.scaledCellWidth * this._terminal.cols;
        this.dimensions.scaledCanvasHeight = this.dimensions.scaledCellHeight * this._terminal.rows;
        this.dimensions.canvasWidth = this._terminal.charMeasure.width * this._terminal.cols;
        this.dimensions.canvasHeight = this._terminal.charMeasure.height * this._terminal.rows;
        this.dimensions.actualCellWidth = this._terminal.charMeasure.width;
        this.dimensions.actualCellHeight = this._terminal.charMeasure.height;
        this._rowElements.forEach(function (element) {
            element.style.width = _this.dimensions.canvasWidth + "px";
            element.style.height = _this._terminal.charMeasure.height + "px";
        });
        if (!this._dimensionsStyleElement) {
            this._dimensionsStyleElement = document.createElement('style');
            this._terminal.screenElement.appendChild(this._dimensionsStyleElement);
        }
        var styles = this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " span {" +
            " display: inline-block;" +
            " height: 100%;" +
            " vertical-align: top;" +
            (" width: " + this._terminal.charMeasure.width + "px") +
            "}";
        this._dimensionsStyleElement.innerHTML = styles;
        this._selectionContainer.style.height = this._terminal._viewportElement.style.height;
        this._rowContainer.style.width = this.dimensions.canvasWidth + "px";
        this._rowContainer.style.height = this.dimensions.canvasHeight + "px";
    };
    DomRenderer.prototype.setTheme = function (theme) {
        var _this = this;
        if (theme) {
            this.colorManager.setTheme(theme);
        }
        if (!this._themeStyleElement) {
            this._themeStyleElement = document.createElement('style');
            this._terminal.screenElement.appendChild(this._themeStyleElement);
        }
        var styles = this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " {" +
            (" color: " + this.colorManager.colors.foreground.css + ";") +
            (" background-color: " + this.colorManager.colors.background.css + ";") +
            (" font-family: " + this._terminal.getOption('fontFamily') + ";") +
            (" font-size: " + this._terminal.getOption('fontSize') + "px;") +
            "}";
        styles +=
            this._terminalSelector + " span:not(." + DomRendererRowFactory_1.BOLD_CLASS + ") {" +
                (" font-weight: " + this._terminal.options.fontWeight + ";") +
                "}" +
                (this._terminalSelector + " span." + DomRendererRowFactory_1.BOLD_CLASS + " {") +
                (" font-weight: " + this._terminal.options.fontWeightBold + ";") +
                "}" +
                (this._terminalSelector + " span." + DomRendererRowFactory_1.ITALIC_CLASS + " {") +
                " font-style: italic;" +
                "}";
        styles +=
            this._terminalSelector + " ." + ROW_CONTAINER_CLASS + "." + FOCUS_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + " {" +
                (" background-color: " + this.colorManager.colors.cursor.css + ";") +
                (" color: " + this.colorManager.colors.cursorAccent.css + ";") +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + ":not(." + FOCUS_CLASS + ") ." + DomRendererRowFactory_1.CURSOR_CLASS + " {") +
                " outline: 1px solid #fff;" +
                " outline-offset: -1px;" +
                "}";
        styles +=
            this._terminalSelector + " ." + SELECTION_CLASS + " {" +
                " position: absolute;" +
                " top: 0;" +
                " left: 0;" +
                " z-index: 1;" +
                " pointer-events: none;" +
                "}" +
                (this._terminalSelector + " ." + SELECTION_CLASS + " div {") +
                " position: absolute;" +
                (" background-color: " + this.colorManager.colors.selection.css + ";") +
                "}";
        this.colorManager.colors.ansi.forEach(function (c, i) {
            styles +=
                _this._terminalSelector + " ." + FG_CLASS_PREFIX + i + " { color: " + c.css + "; }" +
                    (_this._terminalSelector + " ." + BG_CLASS_PREFIX + i + " { background-color: " + c.css + "; }");
        });
        this._themeStyleElement.innerHTML = styles;
        return this.colorManager.colors;
    };
    DomRenderer.prototype.onWindowResize = function (devicePixelRatio) {
        this._updateDimensions();
    };
    DomRenderer.prototype._refreshRowElements = function (cols, rows) {
        for (var i = this._rowElements.length; i <= rows; i++) {
            var row = document.createElement('div');
            this._rowContainer.appendChild(row);
            this._rowElements.push(row);
        }
        while (this._rowElements.length > rows) {
            this._rowContainer.removeChild(this._rowElements.pop());
        }
    };
    DomRenderer.prototype.onResize = function (cols, rows) {
        this._refreshRowElements(cols, rows);
        this._updateDimensions();
    };
    DomRenderer.prototype.onCharSizeChanged = function () {
        this._updateDimensions();
    };
    DomRenderer.prototype.onBlur = function () {
        this._rowContainer.classList.remove(FOCUS_CLASS);
    };
    DomRenderer.prototype.onFocus = function () {
        this._rowContainer.classList.add(FOCUS_CLASS);
    };
    DomRenderer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        while (this._selectionContainer.children.length) {
            this._selectionContainer.removeChild(this._selectionContainer.children[0]);
        }
        if (!start || !end) {
            return;
        }
        var viewportStartRow = start[1] - this._terminal.buffer.ydisp;
        var viewportEndRow = end[1] - this._terminal.buffer.ydisp;
        var viewportCappedStartRow = Math.max(viewportStartRow, 0);
        var viewportCappedEndRow = Math.min(viewportEndRow, this._terminal.rows - 1);
        if (viewportCappedStartRow >= this._terminal.rows || viewportCappedEndRow < 0) {
            return;
        }
        var documentFragment = document.createDocumentFragment();
        var startCol = viewportStartRow === viewportCappedStartRow ? start[0] : 0;
        if (columnSelectMode) {
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, startCol, end[0], viewportCappedEndRow - viewportStartRow + 1));
        }
        else {
            var endCol = viewportCappedStartRow === viewportCappedEndRow ? end[0] : this._terminal.cols;
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, startCol, endCol));
            var middleRowsCount = viewportCappedEndRow - viewportCappedStartRow - 1;
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow + 1, 0, this._terminal.cols, middleRowsCount));
            if (viewportCappedStartRow !== viewportCappedEndRow) {
                var endCol_1 = viewportEndRow === viewportCappedEndRow ? end[0] : this._terminal.cols;
                documentFragment.appendChild(this._createSelectionElement(viewportCappedEndRow, 0, endCol_1));
            }
        }
        this._selectionContainer.appendChild(documentFragment);
    };
    DomRenderer.prototype._createSelectionElement = function (row, colStart, colEnd, rowCount) {
        if (rowCount === void 0) { rowCount = 1; }
        var element = document.createElement('div');
        element.style.height = rowCount * this._terminal.charMeasure.height + "px";
        element.style.top = row * this._terminal.charMeasure.height + "px";
        element.style.left = colStart * this._terminal.charMeasure.width + "px";
        element.style.width = this._terminal.charMeasure.width * (colEnd - colStart) + "px";
        return element;
    };
    DomRenderer.prototype.onCursorMove = function () {
    };
    DomRenderer.prototype.onOptionsChanged = function () {
        this._updateDimensions();
        this.setTheme(undefined);
        this._terminal.refresh(0, this._terminal.rows - 1);
    };
    DomRenderer.prototype.clear = function () {
        this._rowElements.forEach(function (e) { return e.innerHTML = ''; });
    };
    DomRenderer.prototype.refreshRows = function (start, end) {
        this._renderDebouncer.refresh(start, end);
    };
    DomRenderer.prototype._renderRows = function (start, end) {
        var terminal = this._terminal;
        var cursorAbsoluteY = terminal.buffer.ybase + terminal.buffer.y;
        var cursorX = this._terminal.buffer.x;
        for (var y = start; y <= end; y++) {
            var rowElement = this._rowElements[y];
            rowElement.innerHTML = '';
            var row = y + terminal.buffer.ydisp;
            var lineData = terminal.buffer.lines.get(row);
            rowElement.appendChild(this._rowFactory.createRow(lineData, row === cursorAbsoluteY, cursorX, terminal.charMeasure.width, terminal.cols));
        }
        this._terminal.emit('refresh', { start: start, end: end });
    };
    Object.defineProperty(DomRenderer.prototype, "_terminalSelector", {
        get: function () {
            return "." + TERMINAL_CLASS_PREFIX + this._terminalClass;
        },
        enumerable: true,
        configurable: true
    });
    return DomRenderer;
}(EventEmitter_1.EventEmitter));
exports.DomRenderer = DomRenderer;
//# sourceMappingURL=DomRenderer.js.map