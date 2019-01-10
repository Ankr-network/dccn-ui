(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/store/schematics-core/utility/find-module", ["require", "exports", "@angular-devkit/core"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var core_1 = require("@angular-devkit/core");
    /**
     * Find the module referred by a set of options passed to the schematics.
     */
    function findModuleFromOptions(host, options) {
        if (options.hasOwnProperty('skipImport') && options.skipImport) {
            return undefined;
        }
        if (!options.module) {
            var pathToCheck = (options.path || '') +
                (options.flat ? '' : '/' + core_1.strings.dasherize(options.name));
            return core_1.normalize(findModule(host, pathToCheck));
        }
        else {
            var modulePath = core_1.normalize('/' + options.path + '/' + options.module);
            var moduleBaseName = core_1.normalize(modulePath)
                .split('/')
                .pop();
            if (host.exists(modulePath)) {
                return core_1.normalize(modulePath);
            }
            else if (host.exists(modulePath + '.ts')) {
                return core_1.normalize(modulePath + '.ts');
            }
            else if (host.exists(modulePath + '.module.ts')) {
                return core_1.normalize(modulePath + '.module.ts');
            }
            else if (host.exists(modulePath + '/' + moduleBaseName + '.module.ts')) {
                return core_1.normalize(modulePath + '/' + moduleBaseName + '.module.ts');
            }
            else {
                throw new Error('Specified module does not exist');
            }
        }
    }
    exports.findModuleFromOptions = findModuleFromOptions;
    /**
     * Function to find the "closest" module to a generated file's path.
     */
    function findModule(host, generateDir) {
        var dir = host.getDir('/' + generateDir);
        var moduleRe = /\.module\.ts$/;
        var routingModuleRe = /-routing\.module\.ts/;
        while (dir) {
            var matches = dir.subfiles.filter(function (p) { return moduleRe.test(p) && !routingModuleRe.test(p); });
            if (matches.length == 1) {
                return core_1.join(dir.path, matches[0]);
            }
            else if (matches.length > 1) {
                throw new Error('More than one module matches. Use skip-import option to skip importing ' +
                    'the component into the closest module.');
            }
            dir = dir.parent;
        }
        throw new Error('Could not find an NgModule. Use the skip-import ' +
            'option to skip importing in NgModule.');
    }
    exports.findModule = findModule;
    /**
     * Build a relative path from one file path to another file path.
     */
    function buildRelativePath(from, to) {
        var _a = parsePath(from), fromPath = _a.path, fromFileName = _a.filename, fromDirectory = _a.directory;
        var _b = parsePath(to), toPath = _b.path, toFileName = _b.filename, toDirectory = _b.directory;
        var relativePath = core_1.relative(fromDirectory, toDirectory);
        var fixedRelativePath = relativePath.startsWith('.')
            ? relativePath
            : "./" + relativePath;
        return !toFileName || toFileName === 'index.ts'
            ? fixedRelativePath
            : "" + (fixedRelativePath.endsWith('/')
                ? fixedRelativePath
                : fixedRelativePath + '/') + convertToTypeScriptFileName(toFileName);
    }
    exports.buildRelativePath = buildRelativePath;
    function parsePath(path) {
        var pathNormalized = core_1.normalize(path);
        var filename = core_1.extname(pathNormalized) ? core_1.basename(pathNormalized) : '';
        var directory = filename ? core_1.dirname(pathNormalized) : pathNormalized;
        return {
            path: pathNormalized,
            filename: filename,
            directory: directory,
        };
    }
    /**
     * Strips the typescript extension and clears index filenames
     * foo.ts -> foo
     * index.ts -> empty
     */
    function convertToTypeScriptFileName(filename) {
        return filename ? filename.replace(/(\.ts)|(index\.ts)$/, '') : '';
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3N0b3JlL3NjaGVtYXRpY3MtY29yZS91dGlsaXR5L2ZpbmQtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkNBUzhCO0lBVzlCOztPQUVHO0lBQ0gsK0JBQ0UsSUFBVSxFQUNWLE9BQXNCO1FBRXRCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFNLFdBQVcsR0FDZixDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNwQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLGNBQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFOUQsTUFBTSxDQUFDLGdCQUFTLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQU0sVUFBVSxHQUFHLGdCQUFTLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4RSxJQUFNLGNBQWMsR0FBRyxnQkFBUyxDQUFDLFVBQVUsQ0FBQztpQkFDekMsS0FBSyxDQUFDLEdBQUcsQ0FBQztpQkFDVixHQUFHLEVBQUUsQ0FBQztZQUVULEVBQUUsQ0FBQyxDQUFD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LFVBQVUsSUFBSSxVQUFVLEtBQUssVUFBVTtZQUM3QyxDQUFDLENBQUMsaUJBQWlCO1lBQ25CLENBQUMsQ0FBQyxNQUNFLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQzdCLENBQUMsQ0FBQyxpQkFBaUI7Z0JBQ25CLENBQUMsQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLElBQzFCLDJCQUEyQixDQUFDLFVBQVUsQ0FBRyxDQUFDO0lBQ25ELENBQUM7SUF2QkQsOENBdUJDO0lBRUQsbUJBQW1CLElBQVk7UUFDN0IsSUFBTSxjQUFjLEdBQUcsZ0JBQVMsQ0FBQyxJQUFJLENBQVMsQ0FBQztRQUMvQyxJQUFNLFFBQVEsR0FBRyxjQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3pFLElBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsY0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFDdEUsTUFBTSxDQUFDO1lBQ0wsSUFBSSxFQUFFLGNBQWM7WUFDcEIsUUFBUSxVQUFBO1lBQ1IsU0FBUyxXQUFBO1NBQ1YsQ0FBQztJQUNKLENBQUM7SUFDRDs7OztPQUlHO0lBQ0gscUNBQXFDLFFBQTRCO1FBQy9ELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtcbiAgUGF0aCxcbiAgam9pbixcbiAgbm9ybWFsaXplLFxuICByZWxhdGl2ZSxcbiAgc3RyaW5ncyxcbiAgYmFzZW5hbWUsXG4gIGV4dG5hbWUsXG4gIGRpcm5hbWUsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IERpckVudHJ5LCBUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1vZHVsZU9wdGlvbnMge1xuICBtb2R1bGU/OiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgZmxhdD86IGJvb2xlYW47XG4gIHBhdGg/OiBzdHJpbmc7XG4gIHNraXBJbXBvcnQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIEZpbmQgdGhlIG1vZHVsZSByZWZlcnJlZCBieSBhIHNldCBvZiBvcHRpb25zIHBhc3NlZCB0byB0aGUgc2NoZW1hdGljcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRNb2R1bGVGcm9tT3B0aW9ucyhcbiAgaG9zdDogVHJlZSxcbiAgb3B0aW9uczogTW9kdWxlT3B0aW9uc1xuKTogUGF0aCB8IHVuZGVmaW5lZCB7XG4gIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KCdza2lwSW1wb3J0JykgJiYgb3B0aW9ucy5za2lwSW1wb3J0KSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICghb3B0aW9ucy5tb2R1bGUpIHtcbiAgICBjb25zdCBwYXRoVG9DaGVjayA9XG4gICAgICAob3B0aW9ucy5wYXRoIHx8ICcnKSArXG4gICAgICAob3B0aW9ucy5mbGF0ID8gJycgOiAnLycgKyBzdHJpbmdzLmRhc2hlcml6ZShvcHRpb25zLm5hbWUpKTtcblxuICAgIHJldHVybiBub3JtYWxpemUoZmluZE1vZHVsZShob3N0LCBwYXRoVG9DaGVjaykpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IG1vZHVsZVBhdGggPSBub3JtYWxpemUoJy8nICsgb3B0aW9ucy5wYXRoICsgJy8nICsgb3B0aW9ucy5tb2R1bGUpO1xuICAgIGNvbnN0IG1vZHVsZUJhc2VOYW1lID0gbm9ybWFsaXplKG1vZHVsZVBhdGgpXG4gICAgICAuc3BsaXQoJy8nKVxuICAgICAgLnBvcCgpO1xuXG4gICAgaWYgKGhvc3QuZXhpc3RzKG1vZHVsZVBhdGgpKSB7XG4gICAgICByZXR1cm4gbm9ybWFsaXplKG1vZHVsZVBhdGgpO1xuICAgIH0gZWxzZSBpZiAoaG9zdC5leGlzdHMobW9kdWxlUGF0aCArICcudHMnKSkge1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShtb2R1bGVQYXRoICsgJy50cycpO1xuICAgIH0gZWxzZSBpZiAoaG9zdC5leGlzdHMobW9kdWxlUGF0aCArICcubW9kdWxlLnRzJykpIHtcbiAgICAgIHJldHVybiBub3JtYWxpemUobW9kdWxlUGF0aCArICcubW9kdWxlLnRzJyk7XG4gICAgfSBlbHNlIGlmIChob3N0LmV4aXN0cyhtb2R1bGVQYXRoICsgJy8nICsgbW9kdWxlQmFzZU5hbWUgKyAnLm1vZHVsZS50cycpKSB7XG4gICAgICByZXR1cm4gbm9ybWFsaXplKG1vZHVsZVBhdGggKyAnLycgKyBtb2R1bGVCYXNlTmFtZSArICcubW9kdWxlLnRzJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU3BlY2lmaWVkIG1vZHVsZSBkb2VzIG5vdCBleGlzdCcpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGZpbmQgdGhlIFwiY2xvc2VzdFwiIG1vZHVsZSB0byBhIGdlbmVyYXRlZCBmaWxlJ3MgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRNb2R1bGUoaG9zdDogVHJlZSwgZ2VuZXJhdGVEaXI6IHN0cmluZyk6IFBhdGgge1xuICBsZXQgZGlyOiBEaXJFbnRyeSB8IG51bGwgPSBob3N0LmdldERpcignLycgKyBnZW5lcmF0ZURpcik7XG5cbiAgY29uc3QgbW9kdWxlUmUgPSAvXFwubW9kdWxlXFwudHMkLztcbiAgY29uc3Qgcm91dGluZ01vZHVsZVJlID0gLy1yb3V0aW5nXFwubW9kdWxlXFwudHMvO1xuXG4gIHdoaWxlIChkaXIpIHtcbiAgICBjb25zdCBtYXRjaGVzID0gZGlyLnN1YmZpbGVzLmZpbHRlcihcbiAgICAgIHAgPT4gbW9kdWxlUmUudGVzdChwKSAmJiAhcm91dGluZ01vZHVsZVJlLnRlc3QocClcbiAgICApO1xuXG4gICAgaWYgKG1hdGNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIHJldHVybiBqb2luKGRpci5wYXRoLCBtYXRjaGVzWzBdKTtcbiAgICB9IGVsc2UgaWYgKG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnTW9yZSB0aGFuIG9uZSBtb2R1bGUgbWF0Y2hlcy4gVXNlIHNraXAtaW1wb3J0IG9wdGlvbiB0byBza2lwIGltcG9ydGluZyAnICtcbiAgICAgICAgICAndGhlIGNvbXBvbmVudCBpbnRvIHRoZSBjbG9zZXN0IG1vZHVsZS4nXG4gICAgICApO1xuICAgIH1cblxuICAgIGRpciA9IGRpci5wYXJlbnQ7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgJ0NvdWxkIG5vdCBmaW5kIGFuIE5nTW9kdWxlLiBVc2UgdGhlIHNraXAtaW1wb3J0ICcgK1xuICAgICAgJ29wdGlvbiB0byBza2lwIGltcG9ydGluZyBpbiBOZ01vZHVsZS4nXG4gICk7XG59XG5cbi8qKlxuICogQnVpbGQgYSByZWxhdGl2ZSBwYXRoIGZyb20gb25lIGZpbGUgcGF0aCB0byBhbm90aGVyIGZpbGUgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmVsYXRpdmVQYXRoKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHtcbiAgICBwYXRoOiBmcm9tUGF0aCxcbiAgICBmaWxlbmFtZTogZnJvbUZpbGVOYW1lLFxuICAgIGRpcmVjdG9yeTogZnJvbURpcmVjdG9yeSxcbiAgfSA9IHBhcnNlUGF0aChmcm9tKTtcbiAgY29uc3Qge1xuICAgIHBhdGg6IHRvUGF0aCxcbiAgICBmaWxlbmFtZTogdG9GaWxlTmFtZSxcbiAgICBkaXJlY3Rvcnk6IHRvRGlyZWN0b3J5LFxuICB9ID0gcGFyc2VQYXRoKHRvKTtcbiAgY29uc3QgcmVsYXRpdmVQYXRoID0gcmVsYXRpdmUoZnJvbURpcmVjdG9yeSwgdG9EaXJlY3RvcnkpO1xuICBjb25zdCBmaXhlZFJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKCcuJylcbiAgICA/IHJlbGF0aXZlUGF0aFxuICAgIDogYC4vJHtyZWxhdGl2ZVBhdGh9YDtcblxuICByZXR1cm4gIXRvRmlsZU5hbWUgfHwgdG9GaWxlTmFtZSA9PT0gJ2luZGV4LnRzJ1xuICAgID8gZml4ZWRSZWxhdGl2ZVBhdGhcbiAgICA6IGAke1xuICAgICAgICBmaXhlZFJlbGF0aXZlUGF0aC5lbmRzV2l0aCgnLycpXG4gICAgICAgICAgPyBmaXhlZFJlbGF0aXZlUGF0aFxuICAgICAgICAgIDogZml4ZWRSZWxhdGl2ZVBhdGggKyAnLydcbiAgICAgIH0ke2NvbnZlcnRUb1R5cGVTY3JpcHRGaWxlTmFtZSh0b0ZpbGVOYW1lKX1gO1xufVxuXG5mdW5jdGlvbiBwYXJzZVBhdGgocGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IHBhdGhOb3JtYWxpemVkID0gbm9ybWFsaXplKHBhdGgpIGFzIFBhdGg7XG4gIGNvbnN0IGZpbGVuYW1lID0gZXh0bmFtZShwYXRoTm9ybWFsaXplZCkgPyBiYXNlbmFtZShwYXRoTm9ybWFsaXplZCkgOiAnJztcbiAgY29uc3QgZGlyZWN0b3J5ID0gZmlsZW5hbWUgPyBkaXJuYW1lKHBhdGhOb3JtYWxpemVkKSA6IHBhdGhOb3JtYWxpemVkO1xuICByZXR1cm4ge1xuICAgIHBhdGg6IHBhdGhOb3JtYWxpemVkLFxuICAgIGZpbGVuYW1lLFxuICAgIGRpcmVjdG9yeSxcbiAgfTtcbn1cbi8qKlxuICogU3RyaXBzIHRoZSB0eXBlc2NyaXB0IGV4dGVuc2lvbiBhbmQgY2xlYXJzIGluZGV4IGZpbGVuYW1lc1xuICogZm9vLnRzIC0+IGZvb1xuICogaW5kZXgudHMgLT4gZW1wdHlcbiAqL1xuZnVuY3Rpb24gY29udmVydFRvVHlwZVNjcmlwdEZpbGVOYW1lKGZpbGVuYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgcmV0dXJuIGZpbGVuYW1lID8gZmlsZW5hbWUucmVwbGFjZSgvKFxcLnRzKXwoaW5kZXhcXC50cykkLywgJycpIDogJyc7XG59XG4iXX0=