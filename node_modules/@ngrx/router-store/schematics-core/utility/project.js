(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/router-store/schematics-core/utility/project", ["require", "exports", "@ngrx/router-store/schematics-core/utility/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var config_1 = require("@ngrx/router-store/schematics-core/utility/config");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvcm91dGVyLXN0b3JlL3NjaGVtYXRpY3MtY29yZS91dGlsaXR5L3Byb2plY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQSw0RUFBd0M7SUFHeEMsd0JBQ0UsSUFBVSxFQUNWLE9BQW9FO1FBRXBFLElBQU0sU0FBUyxHQUFHLHFCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFckMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNyQixPQUFPLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxJQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVwRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDcEMsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFNLGNBQWMsR0FDbEIsT0FBTyxDQUFDLFdBQVcsS0FBSyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBRXhELE1BQU0sQ0FBQyxDQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQUksT0FBTyxDQUFDLElBQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFRLGNBQWdCLENBQUM7UUFDM0UsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUF4QkQsd0NBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0V29ya3NwYWNlIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgVHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb2plY3RQYXRoKFxuICBob3N0OiBUcmVlLFxuICBvcHRpb25zOiB7IHByb2plY3Q/OiBzdHJpbmcgfCB1bmRlZmluZWQ7IHBhdGg/OiBzdHJpbmcgfCB1bmRlZmluZWQgfVxuKSB7XG4gIGNvbnN0IHdvcmtzcGFjZSA9IGdldFdvcmtzcGFjZShob3N0KTtcblxuICBpZiAoIW9wdGlvbnMucHJvamVjdCkge1xuICAgIG9wdGlvbnMucHJvamVjdCA9IE9iamVjdC5rZXlzKHdvcmtzcGFjZS5wcm9qZWN0cylbMF07XG4gIH1cblxuICBjb25zdCBwcm9qZWN0ID0gd29ya3NwYWNlLnByb2plY3RzW29wdGlvbnMucHJvamVjdF07XG5cbiAgaWYgKHByb2plY3Qucm9vdC5zdWJzdHIoLTEpID09PSAnLycpIHtcbiAgICBwcm9qZWN0LnJvb3QgPSBwcm9qZWN0LnJvb3Quc3Vic3RyKDAsIHByb2plY3Qucm9vdC5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLnBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHByb2plY3REaXJOYW1lID1cbiAgICAgIHByb2plY3QucHJvamVjdFR5cGUgPT09ICdhcHBsaWNhdGlvbicgPyAnYXBwJyA6ICdsaWInO1xuXG4gICAgcmV0dXJuIGAke3Byb2plY3Qucm9vdCA/IGAvJHtwcm9qZWN0LnJvb3R9YCA6ICcnfS9zcmMvJHtwcm9qZWN0RGlyTmFtZX1gO1xuICB9XG5cbiAgcmV0dXJuIG9wdGlvbnMucGF0aDtcbn1cbiJdfQ==