(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/effects/migrations/6_0_0/index", ["require", "exports", "@ngrx/effects/schematics-core/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var schematics_core_1 = require("@ngrx/effects/schematics-core/index");
    function default_1() {
        return schematics_core_1.updatePackage('effects');
    }
    exports.default = default_1;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvbWlncmF0aW9ucy82XzBfMC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUNBLHVFQUE4RDtJQUU5RDtRQUNFLE1BQU0sQ0FBQywrQkFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFGRCw0QkFFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJ1bGUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyB1cGRhdGVQYWNrYWdlIH0gZnJvbSAnQG5ncngvZWZmZWN0cy9zY2hlbWF0aWNzLWNvcmUnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpOiBSdWxlIHtcbiAgcmV0dXJuIHVwZGF0ZVBhY2thZ2UoJ2VmZmVjdHMnKTtcbn1cbiJdfQ==