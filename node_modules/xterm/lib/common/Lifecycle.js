"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Disposable = (function () {
    function Disposable() {
        this._disposables = [];
    }
    Disposable.prototype.dispose = function () {
        this._disposables.forEach(function (d) { return d.dispose(); });
        this._disposables.length = 0;
    };
    Disposable.prototype.register = function (d) {
        this._disposables.push(d);
    };
    return Disposable;
}());
exports.Disposable = Disposable;
//# sourceMappingURL=Lifecycle.js.map