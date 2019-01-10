(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/store-devtools/migrations/6_0_0/index", ["require", "exports", "@ngrx/store-devtools/schematics-core/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var schematics_core_1 = require("@ngrx/store-devtools/schematics-core/index");
    function default_1() {
        return schematics_core_1.updatePackage('store-devtools');
    }
    exports.default = default_1;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3N0b3JlLWRldnRvb2xzL21pZ3JhdGlvbnMvNl8wXzAvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFDQSw4RUFBcUU7SUFFckU7UUFDRSxNQUFNLENBQUMsK0JBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFGRCw0QkFFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJ1bGUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyB1cGRhdGVQYWNrYWdlIH0gZnJvbSAnQG5ncngvc3RvcmUtZGV2dG9vbHMvc2NoZW1hdGljcy1jb3JlJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKTogUnVsZSB7XG4gIHJldHVybiB1cGRhdGVQYWNrYWdlKCdzdG9yZS1kZXZ0b29scycpO1xufVxuIl19