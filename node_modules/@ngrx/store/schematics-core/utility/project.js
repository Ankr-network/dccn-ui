(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/store/schematics-core/utility/project", ["require", "exports", "@ngrx/store/schematics-core/utility/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var config_1 = require("@ngrx/store/schematics-core/utility/config");
    function getProjectPath(host, options) {
        var workspace = config_1.getWorkspace(host);
        if (!options.project) {
            options.project = Object.keys(workspace.projects)[0];
        }
        var project = workspace.projects[options.project];
        if (project.root.substr(-1) === '/') {
            project.root = project.root.substr(0, project.root.length - 1);
        }
        if (options.path === undefined) {
            var projectDirName = project.projectType === 'application' ? 'app' : 'lib';
            return (project.root ? "/" + project.root : '') + "/src/" + projectDirName;
        }
        return options.path;
    }
    exports.getProjectPath = getProjectPath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvc3RvcmUvc2NoZW1hdGljcy1jb3JlL3V0aWxpdHkvcHJvamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBLHFFQUF3QztJQUd4Qyx3QkFDRSxJQUFVLEVBQ1YsT0FBb0U7UUFFcEUsSUFBTSxTQUFTLEdBQUcscUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVyQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELElBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXBELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwQyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQU0sY0FBYyxHQUNsQixPQUFPLENBQUMsV0FBVyxLQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFFeEQsTUFBTSxDQUFDLENBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBSSxPQUFPLENBQUMsSUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQVEsY0FBZ0IsQ0FBQztRQUMzRSxDQUFDO1FBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQXhCRCx3Q0F3QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRXb3Jrc3BhY2UgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvamVjdFBhdGgoXG4gIGhvc3Q6IFRyZWUsXG4gIG9wdGlvbnM6IHsgcHJvamVjdD86IHN0cmluZyB8IHVuZGVmaW5lZDsgcGF0aD86IHN0cmluZyB8IHVuZGVmaW5lZCB9XG4pIHtcbiAgY29uc3Qgd29ya3NwYWNlID0gZ2V0V29ya3NwYWNlKGhvc3QpO1xuXG4gIGlmICghb3B0aW9ucy5wcm9qZWN0KSB7XG4gICAgb3B0aW9ucy5wcm9qZWN0ID0gT2JqZWN0LmtleXMod29ya3NwYWNlLnByb2plY3RzKVswXTtcbiAgfVxuXG4gIGNvbnN0IHByb2plY3QgPSB3b3Jrc3BhY2UucHJvamVjdHNbb3B0aW9ucy5wcm9qZWN0XTtcblxuICBpZiAocHJvamVjdC5yb290LnN1YnN0cigtMSkgPT09ICcvJykge1xuICAgIHByb2plY3Qucm9vdCA9IHByb2plY3Qucm9vdC5zdWJzdHIoMCwgcHJvamVjdC5yb290Lmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMucGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgcHJvamVjdERpck5hbWUgPVxuICAgICAgcHJvamVjdC5wcm9qZWN0VHlwZSA9PT0gJ2FwcGxpY2F0aW9uJyA/ICdhcHAnIDogJ2xpYic7XG5cbiAgICByZXR1cm4gYCR7cHJvamVjdC5yb290ID8gYC8ke3Byb2plY3Qucm9vdH1gIDogJyd9L3NyYy8ke3Byb2plY3REaXJOYW1lfWA7XG4gIH1cblxuICByZXR1cm4gb3B0aW9ucy5wYXRoO1xufVxuIl19