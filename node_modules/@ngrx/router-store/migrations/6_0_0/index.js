(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/router-store/migrations/6_0_0/index", ["require", "exports", "@ngrx/router-store/schematics-core/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var schematics_core_1 = require("@ngrx/router-store/schematics-core/index");
    function default_1() {
        return schematics_core_1.updatePackage('router-store');
    }
    exports.default = default_1;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3JvdXRlci1zdG9yZS9taWdyYXRpb25zLzZfMF8wL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQ0EsNEVBQW1FO0lBRW5FO1FBQ0UsTUFBTSxDQUFDLCtCQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUZELDRCQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUnVsZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IHVwZGF0ZVBhY2thZ2UgfSBmcm9tICdAbmdyeC9yb3V0ZXItc3RvcmUvc2NoZW1hdGljcy1jb3JlJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKTogUnVsZSB7XG4gIHJldHVybiB1cGRhdGVQYWNrYWdlKCdyb3V0ZXItc3RvcmUnKTtcbn1cbiJdfQ==