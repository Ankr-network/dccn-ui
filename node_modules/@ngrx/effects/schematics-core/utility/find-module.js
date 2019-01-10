(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/effects/schematics-core/utility/find-module", ["require", "exports", "@angular-devkit/core"], factory);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc2NoZW1hdGljcy1jb3JlL3V0aWxpdHkvZmluZC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2Q0FTOEI7SUFXOUI7O09BRUc7SUFDSCwrQkFDRSxJQUFVLEVBQ1YsT0FBc0I7UUFFdEIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQU0sV0FBVyxHQUNmLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3BCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsY0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUU5RCxNQUFNLENBQUMsZ0JBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBTSxVQUFVLEdBQUcsZ0JBQVMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hFLElBQU0sY0FBYyxHQUFHLGdCQUFTLENBQUMsVUFBVSxDQUFDO2lCQUN6QyxLQUFLLENBQUMsR0FBRyxDQUFDO2lCQUNWLEdBQUcsRUFBRSxDQUFDO1lBRVQsRUFBRSxDQUFDLENB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QUMsVUFBVSxJQUFJLFVBQVUsS0FBSyxVQUFVO1lBQzdDLENBQUMsQ0FBQyxpQkFBaUI7WUFDbkIsQ0FBQyxDQUFDLE1BQ0UsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztnQkFDN0IsQ0FBQyxDQUFDLGlCQUFpQjtnQkFDbkIsQ0FBQyxDQUFDLGlCQUFpQixHQUFHLEdBQUcsSUFDMUIsMkJBQTJCLENBQUMsVUFBVSxDQUFHLENBQUM7SUFDbkQsQ0FBQztJQXZCRCw4Q0F1QkM7SUFFRCxtQkFBbUIsSUFBWTtRQUM3QixJQUFNLGNBQWMsR0FBRyxnQkFBUyxDQUFDLElBQUksQ0FBUyxDQUFDO1FBQy9DLElBQU0sUUFBUSxHQUFHLGNBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDekUsSUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxjQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUN0RSxNQUFNLENBQUM7WUFDTCxJQUFJLEVBQUUsY0FBYztZQUNwQixRQUFRLFVBQUE7WUFDUixTQUFTLFdBQUE7U0FDVixDQUFDO0lBQ0osQ0FBQztJQUNEOzs7O09BSUc7SUFDSCxxQ0FBcUMsUUFBNEI7UUFDL0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ3JFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBQYXRoLFxuICBqb2luLFxuICBub3JtYWxpemUsXG4gIHJlbGF0aXZlLFxuICBzdHJpbmdzLFxuICBiYXNlbmFtZSxcbiAgZXh0bmFtZSxcbiAgZGlybmFtZSxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgRGlyRW50cnksIFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW9kdWxlT3B0aW9ucyB7XG4gIG1vZHVsZT86IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBmbGF0PzogYm9vbGVhbjtcbiAgcGF0aD86IHN0cmluZztcbiAgc2tpcEltcG9ydD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogRmluZCB0aGUgbW9kdWxlIHJlZmVycmVkIGJ5IGEgc2V0IG9mIG9wdGlvbnMgcGFzc2VkIHRvIHRoZSBzY2hlbWF0aWNzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZHVsZUZyb21PcHRpb25zKFxuICBob3N0OiBUcmVlLFxuICBvcHRpb25zOiBNb2R1bGVPcHRpb25zXG4pOiBQYXRoIHwgdW5kZWZpbmVkIHtcbiAgaWYgKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ3NraXBJbXBvcnQnKSAmJiBvcHRpb25zLnNraXBJbXBvcnQpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKCFvcHRpb25zLm1vZHVsZSkge1xuICAgIGNvbnN0IHBhdGhUb0NoZWNrID1cbiAgICAgIChvcHRpb25zLnBhdGggfHwgJycpICtcbiAgICAgIChvcHRpb25zLmZsYXQgPyAnJyA6ICcvJyArIHN0cmluZ3MuZGFzaGVyaXplKG9wdGlvbnMubmFtZSkpO1xuXG4gICAgcmV0dXJuIG5vcm1hbGl6ZShmaW5kTW9kdWxlKGhvc3QsIHBhdGhUb0NoZWNrKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbW9kdWxlUGF0aCA9IG5vcm1hbGl6ZSgnLycgKyBvcHRpb25zLnBhdGggKyAnLycgKyBvcHRpb25zLm1vZHVsZSk7XG4gICAgY29uc3QgbW9kdWxlQmFzZU5hbWUgPSBub3JtYWxpemUobW9kdWxlUGF0aClcbiAgICAgIC5zcGxpdCgnLycpXG4gICAgICAucG9wKCk7XG5cbiAgICBpZiAoaG9zdC5leGlzdHMobW9kdWxlUGF0aCkpIHtcbiAgICAgIHJldHVybiBub3JtYWxpemUobW9kdWxlUGF0aCk7XG4gICAgfSBlbHNlIGlmIChob3N0LmV4aXN0cyhtb2R1bGVQYXRoICsgJy50cycpKSB7XG4gICAgICByZXR1cm4gbm9ybWFsaXplKG1vZHVsZVBhdGggKyAnLnRzJyk7XG4gICAgfSBlbHNlIGlmIChob3N0LmV4aXN0cyhtb2R1bGVQYXRoICsgJy5tb2R1bGUudHMnKSkge1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShtb2R1bGVQYXRoICsgJy5tb2R1bGUudHMnKTtcbiAgICB9IGVsc2UgaWYgKGhvc3QuZXhpc3RzKG1vZHVsZVBhdGggKyAnLycgKyBtb2R1bGVCYXNlTmFtZSArICcubW9kdWxlLnRzJykpIHtcbiAgICAgIHJldHVybiBub3JtYWxpemUobW9kdWxlUGF0aCArICcvJyArIG1vZHVsZUJhc2VOYW1lICsgJy5tb2R1bGUudHMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTcGVjaWZpZWQgbW9kdWxlIGRvZXMgbm90IGV4aXN0Jyk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZmluZCB0aGUgXCJjbG9zZXN0XCIgbW9kdWxlIHRvIGEgZ2VuZXJhdGVkIGZpbGUncyBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZHVsZShob3N0OiBUcmVlLCBnZW5lcmF0ZURpcjogc3RyaW5nKTogUGF0aCB7XG4gIGxldCBkaXI6IERpckVudHJ5IHwgbnVsbCA9IGhvc3QuZ2V0RGlyKCcvJyArIGdlbmVyYXRlRGlyKTtcblxuICBjb25zdCBtb2R1bGVSZSA9IC9cXC5tb2R1bGVcXC50cyQvO1xuICBjb25zdCByb3V0aW5nTW9kdWxlUmUgPSAvLXJvdXRpbmdcXC5tb2R1bGVcXC50cy87XG5cbiAgd2hpbGUgKGRpcikge1xuICAgIGNvbnN0IG1hdGNoZXMgPSBkaXIuc3ViZmlsZXMuZmlsdGVyKFxuICAgICAgcCA9PiBtb2R1bGVSZS50ZXN0KHApICYmICFyb3V0aW5nTW9kdWxlUmUudGVzdChwKVxuICAgICk7XG5cbiAgICBpZiAobWF0Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgcmV0dXJuIGpvaW4oZGlyLnBhdGgsIG1hdGNoZXNbMF0pO1xuICAgIH0gZWxzZSBpZiAobWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdNb3JlIHRoYW4gb25lIG1vZHVsZSBtYXRjaGVzLiBVc2Ugc2tpcC1pbXBvcnQgb3B0aW9uIHRvIHNraXAgaW1wb3J0aW5nICcgK1xuICAgICAgICAgICd0aGUgY29tcG9uZW50IGludG8gdGhlIGNsb3Nlc3QgbW9kdWxlLidcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZGlyID0gZGlyLnBhcmVudDtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAnQ291bGQgbm90IGZpbmQgYW4gTmdNb2R1bGUuIFVzZSB0aGUgc2tpcC1pbXBvcnQgJyArXG4gICAgICAnb3B0aW9uIHRvIHNraXAgaW1wb3J0aW5nIGluIE5nTW9kdWxlLidcbiAgKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIHJlbGF0aXZlIHBhdGggZnJvbSBvbmUgZmlsZSBwYXRoIHRvIGFub3RoZXIgZmlsZSBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZWxhdGl2ZVBhdGgoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3Qge1xuICAgIHBhdGg6IGZyb21QYXRoLFxuICAgIGZpbGVuYW1lOiBmcm9tRmlsZU5hbWUsXG4gICAgZGlyZWN0b3J5OiBmcm9tRGlyZWN0b3J5LFxuICB9ID0gcGFyc2VQYXRoKGZyb20pO1xuICBjb25zdCB7XG4gICAgcGF0aDogdG9QYXRoLFxuICAgIGZpbGVuYW1lOiB0b0ZpbGVOYW1lLFxuICAgIGRpcmVjdG9yeTogdG9EaXJlY3RvcnksXG4gIH0gPSBwYXJzZVBhdGgodG8pO1xuICBjb25zdCByZWxhdGl2ZVBhdGggPSByZWxhdGl2ZShmcm9tRGlyZWN0b3J5LCB0b0RpcmVjdG9yeSk7XG4gIGNvbnN0IGZpeGVkUmVsYXRpdmVQYXRoID0gcmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgoJy4nKVxuICAgID8gcmVsYXRpdmVQYXRoXG4gICAgOiBgLi8ke3JlbGF0aXZlUGF0aH1gO1xuXG4gIHJldHVybiAhdG9GaWxlTmFtZSB8fCB0b0ZpbGVOYW1lID09PSAnaW5kZXgudHMnXG4gICAgPyBmaXhlZFJlbGF0aXZlUGF0aFxuICAgIDogYCR7XG4gICAgICAgIGZpeGVkUmVsYXRpdmVQYXRoLmVuZHNXaXRoKCcvJylcbiAgICAgICAgICA/IGZpeGVkUmVsYXRpdmVQYXRoXG4gICAgICAgICAgOiBmaXhlZFJlbGF0aXZlUGF0aCArICcvJ1xuICAgICAgfSR7Y29udmVydFRvVHlwZVNjcmlwdEZpbGVOYW1lKHRvRmlsZU5hbWUpfWA7XG59XG5cbmZ1bmN0aW9uIHBhcnNlUGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgcGF0aE5vcm1hbGl6ZWQgPSBub3JtYWxpemUocGF0aCkgYXMgUGF0aDtcbiAgY29uc3QgZmlsZW5hbWUgPSBleHRuYW1lKHBhdGhOb3JtYWxpemVkKSA/IGJhc2VuYW1lKHBhdGhOb3JtYWxpemVkKSA6ICcnO1xuICBjb25zdCBkaXJlY3RvcnkgPSBmaWxlbmFtZSA/IGRpcm5hbWUocGF0aE5vcm1hbGl6ZWQpIDogcGF0aE5vcm1hbGl6ZWQ7XG4gIHJldHVybiB7XG4gICAgcGF0aDogcGF0aE5vcm1hbGl6ZWQsXG4gICAgZmlsZW5hbWUsXG4gICAgZGlyZWN0b3J5LFxuICB9O1xufVxuLyoqXG4gKiBTdHJpcHMgdGhlIHR5cGVzY3JpcHQgZXh0ZW5zaW9uIGFuZCBjbGVhcnMgaW5kZXggZmlsZW5hbWVzXG4gKiBmb28udHMgLT4gZm9vXG4gKiBpbmRleC50cyAtPiBlbXB0eVxuICovXG5mdW5jdGlvbiBjb252ZXJ0VG9UeXBlU2NyaXB0RmlsZU5hbWUoZmlsZW5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICByZXR1cm4gZmlsZW5hbWUgPyBmaWxlbmFtZS5yZXBsYWNlKC8oXFwudHMpfChpbmRleFxcLnRzKSQvLCAnJykgOiAnJztcbn1cbiJdfQ==