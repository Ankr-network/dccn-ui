(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/router-store/schematics-core/utility/package", ["require", "exports"], factory);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvcm91dGVyLXN0b3JlL3NjaGVtYXRpY3MtY29yZS91dGlsaXR5L3BhY2thZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFFQTs7T0FFRztJQUNILGlDQUNFLElBQVUsRUFDVixJQUFZLEVBQ1osR0FBVyxFQUNYLE9BQWU7UUFFZixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoRSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNsQixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO1lBQzVCLENBQUM7WUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFyQkQsMERBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcblxuLyoqXG4gKiBBZGRzIGEgcGFja2FnZSB0byB0aGUgcGFja2FnZS5qc29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRQYWNrYWdlVG9QYWNrYWdlSnNvbihcbiAgaG9zdDogVHJlZSxcbiAgdHlwZTogc3RyaW5nLFxuICBwa2c6IHN0cmluZyxcbiAgdmVyc2lvbjogc3RyaW5nXG4pOiBUcmVlIHtcbiAgaWYgKGhvc3QuZXhpc3RzKCdwYWNrYWdlLmpzb24nKSkge1xuICAgIGNvbnN0IHNvdXJjZVRleHQgPSBob3N0LnJlYWQoJ3BhY2thZ2UuanNvbicpIS50b1N0cmluZygndXRmLTgnKTtcbiAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShzb3VyY2VUZXh0KTtcbiAgICBpZiAoIWpzb25bdHlwZV0pIHtcbiAgICAgIGpzb25bdHlwZV0gPSB7fTtcbiAgICB9XG5cbiAgICBpZiAoIWpzb25bdHlwZV1bcGtnXSkge1xuICAgICAganNvblt0eXBlXVtwa2ddID0gdmVyc2lvbjtcbiAgICB9XG5cbiAgICBob3N0Lm92ZXJ3cml0ZSgncGFja2FnZS5qc29uJywgSlNPTi5zdHJpbmdpZnkoanNvbiwgbnVsbCwgMikpO1xuICB9XG5cbiAgcmV0dXJuIGhvc3Q7XG59XG4iXX0=