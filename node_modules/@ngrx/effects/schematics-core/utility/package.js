(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/effects/schematics-core/utility/package", ["require", "exports"], factory);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zY2hlbWF0aWNzLWNvcmUvdXRpbGl0eS9wYWNrYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBRUE7O09BRUc7SUFDSCxpQ0FDRSxJQUFVLEVBQ1YsSUFBWSxFQUNaLEdBQVcsRUFDWCxPQUFlO1FBRWYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEUsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDbEIsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztZQUM1QixDQUFDO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBckJELDBEQXFCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5cbi8qKlxuICogQWRkcyBhIHBhY2thZ2UgdG8gdGhlIHBhY2thZ2UuanNvblxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkUGFja2FnZVRvUGFja2FnZUpzb24oXG4gIGhvc3Q6IFRyZWUsXG4gIHR5cGU6IHN0cmluZyxcbiAgcGtnOiBzdHJpbmcsXG4gIHZlcnNpb246IHN0cmluZ1xuKTogVHJlZSB7XG4gIGlmIChob3N0LmV4aXN0cygncGFja2FnZS5qc29uJykpIHtcbiAgICBjb25zdCBzb3VyY2VUZXh0ID0gaG9zdC5yZWFkKCdwYWNrYWdlLmpzb24nKSEudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gICAgY29uc3QganNvbiA9IEpTT04ucGFyc2Uoc291cmNlVGV4dCk7XG4gICAgaWYgKCFqc29uW3R5cGVdKSB7XG4gICAgICBqc29uW3R5cGVdID0ge307XG4gICAgfVxuXG4gICAgaWYgKCFqc29uW3R5cGVdW3BrZ10pIHtcbiAgICAgIGpzb25bdHlwZV1bcGtnXSA9IHZlcnNpb247XG4gICAgfVxuXG4gICAgaG9zdC5vdmVyd3JpdGUoJ3BhY2thZ2UuanNvbicsIEpTT04uc3RyaW5naWZ5KGpzb24sIG51bGwsIDIpKTtcbiAgfVxuXG4gIHJldHVybiBob3N0O1xufVxuIl19