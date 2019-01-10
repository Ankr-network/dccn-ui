(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/effects/schematics-core/utility/project", ["require", "exports", "@ngrx/effects/schematics-core/utility/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var config_1 = require("@ngrx/effects/schematics-core/utility/config");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zY2hlbWF0aWNzLWNvcmUvdXRpbGl0eS9wcm9qZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUEsdUVBQXdDO0lBR3hDLHdCQUNFLElBQVUsRUFDVixPQUFvRTtRQUVwRSxJQUFNLFNBQVMsR0FBRyxxQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXJDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDckIsT0FBTyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRUQsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFcEQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBTSxjQUFjLEdBQ2xCLE9BQU8sQ0FBQyxXQUFXLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUV4RCxNQUFNLENBQUMsQ0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFJLE9BQU8sQ0FBQyxJQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBUSxjQUFnQixDQUFDO1FBQzNFLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUN0QixDQUFDO0lBeEJELHdDQXdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldFdvcmtzcGFjZSB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9qZWN0UGF0aChcbiAgaG9zdDogVHJlZSxcbiAgb3B0aW9uczogeyBwcm9qZWN0Pzogc3RyaW5nIHwgdW5kZWZpbmVkOyBwYXRoPzogc3RyaW5nIHwgdW5kZWZpbmVkIH1cbikge1xuICBjb25zdCB3b3Jrc3BhY2UgPSBnZXRXb3Jrc3BhY2UoaG9zdCk7XG5cbiAgaWYgKCFvcHRpb25zLnByb2plY3QpIHtcbiAgICBvcHRpb25zLnByb2plY3QgPSBPYmplY3Qua2V5cyh3b3Jrc3BhY2UucHJvamVjdHMpWzBdO1xuICB9XG5cbiAgY29uc3QgcHJvamVjdCA9IHdvcmtzcGFjZS5wcm9qZWN0c1tvcHRpb25zLnByb2plY3RdO1xuXG4gIGlmIChwcm9qZWN0LnJvb3Quc3Vic3RyKC0xKSA9PT0gJy8nKSB7XG4gICAgcHJvamVjdC5yb290ID0gcHJvamVjdC5yb290LnN1YnN0cigwLCBwcm9qZWN0LnJvb3QubGVuZ3RoIC0gMSk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5wYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBwcm9qZWN0RGlyTmFtZSA9XG4gICAgICBwcm9qZWN0LnByb2plY3RUeXBlID09PSAnYXBwbGljYXRpb24nID8gJ2FwcCcgOiAnbGliJztcblxuICAgIHJldHVybiBgJHtwcm9qZWN0LnJvb3QgPyBgLyR7cHJvamVjdC5yb290fWAgOiAnJ30vc3JjLyR7cHJvamVjdERpck5hbWV9YDtcbiAgfVxuXG4gIHJldHVybiBvcHRpb25zLnBhdGg7XG59XG4iXX0=