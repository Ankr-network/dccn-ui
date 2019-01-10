(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/store-devtools/schematics-core/utility/package", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Adds a package to the package.json
     */
    function addPackageToPackageJson(host, type, pkg, version) {
        if (host.exists('package.json')) {
            var sourceText = host.read('package.json').toString('utf-8');
            var json = JSON.parse(sourceText);
            if (!json[type]) {
                json[type] = {};
            }
            if (!json[type][pkg]) {
                json[type][pkg] = version;
            }
            host.overwrite('package.json', JSON.stringify(json, null, 2));
        }
        return host;
    }
    exports.addPackageToPackageJson = addPackageToPackageJson;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvc3RvcmUtZGV2dG9vbHMvc2NoZW1hdGljcy1jb3JlL3V0aWxpdHkvcGFja2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUVBOztPQUVHO0lBQ0gsaUNBQ0UsSUFBVSxFQUNWLElBQVksRUFDWixHQUFXLEVBQ1gsT0FBZTtRQUVmLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hFLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7WUFDNUIsQ0FBQztZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQXJCRCwwREFxQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuXG4vKipcbiAqIEFkZHMgYSBwYWNrYWdlIHRvIHRoZSBwYWNrYWdlLmpzb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFBhY2thZ2VUb1BhY2thZ2VKc29uKFxuICBob3N0OiBUcmVlLFxuICB0eXBlOiBzdHJpbmcsXG4gIHBrZzogc3RyaW5nLFxuICB2ZXJzaW9uOiBzdHJpbmdcbik6IFRyZWUge1xuICBpZiAoaG9zdC5leGlzdHMoJ3BhY2thZ2UuanNvbicpKSB7XG4gICAgY29uc3Qgc291cmNlVGV4dCA9IGhvc3QucmVhZCgncGFja2FnZS5qc29uJykhLnRvU3RyaW5nKCd1dGYtOCcpO1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHNvdXJjZVRleHQpO1xuICAgIGlmICghanNvblt0eXBlXSkge1xuICAgICAganNvblt0eXBlXSA9IHt9O1xuICAgIH1cblxuICAgIGlmICghanNvblt0eXBlXVtwa2ddKSB7XG4gICAgICBqc29uW3R5cGVdW3BrZ10gPSB2ZXJzaW9uO1xuICAgIH1cblxuICAgIGhvc3Qub3ZlcndyaXRlKCdwYWNrYWdlLmpzb24nLCBKU09OLnN0cmluZ2lmeShqc29uLCBudWxsLCAyKSk7XG4gIH1cblxuICByZXR1cm4gaG9zdDtcbn1cbiJdfQ==