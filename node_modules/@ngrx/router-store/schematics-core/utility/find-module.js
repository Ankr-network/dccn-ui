(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/router-store/schematics-core/utility/find-module", ["require", "exports", "@angular-devkit/core"], factory);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3JvdXRlci1zdG9yZS9zY2hlbWF0aWNzLWNvcmUvdXRpbGl0eS9maW5kLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDZDQVM4QjtJQVc5Qjs7T0FFRztJQUNILCtCQUNFLElBQVUsRUFDVixPQUFzQjtRQUV0QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDbkIsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBTSxXQUFXLEdBQ2YsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDcEIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxjQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRTlELE1BQU0sQ0FBQyxnQkFBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFNLFVBQVUsR0FBRyxnQkFBUyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEUsSUFBTSxjQUFjLEdBQUcsZ0JBQVMsQ0FBQyxVQUFVLENBQUM7aUJBQ3pDLEtBQUssQ0FBQyxHQUFHLENBQUM7aUJBQ1YsR0FBRyxFQUFFLENBQUM7WUFFVCxFQUFFLENB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QUMsQ0FBQyxVQUFVLElBQUksVUFBVSxLQUFLLFVBQVU7WUFDN0MsQ0FBQyxDQUFDLGlCQUFpQjtZQUNuQixDQUFDLENBQUMsTUFDRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO2dCQUM3QixDQUFDLENBQUMsaUJBQWlCO2dCQUNuQixDQUFDLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxJQUMxQiwyQkFBMkIsQ0FBQyxVQUFVLENBQUcsQ0FBQztJQUNuRCxDQUFDO0lBdkJELDhDQXVCQztJQUVELG1CQUFtQixJQUFZO1FBQzdCLElBQU0sY0FBYyxHQUFHLGdCQUFTLENBQUMsSUFBSSxDQUFTLENBQUM7UUFDL0MsSUFBTSxRQUFRLEdBQUcsY0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN6RSxJQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO1FBQ3RFLE1BQU0sQ0FBQztZQUNMLElBQUksRUFBRSxjQUFjO1lBQ3BCLFFBQVEsVUFBQTtZQUNSLFNBQVMsV0FBQTtTQUNWLENBQUM7SUFDSixDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNILHFDQUFxQyxRQUE0QjtRQUMvRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDckUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7XG4gIFBhdGgsXG4gIGpvaW4sXG4gIG5vcm1hbGl6ZSxcbiAgcmVsYXRpdmUsXG4gIHN0cmluZ3MsXG4gIGJhc2VuYW1lLFxuICBleHRuYW1lLFxuICBkaXJuYW1lLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBEaXJFbnRyeSwgVHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcblxuZXhwb3J0IGludGVyZmFjZSBNb2R1bGVPcHRpb25zIHtcbiAgbW9kdWxlPzogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIGZsYXQ/OiBib29sZWFuO1xuICBwYXRoPzogc3RyaW5nO1xuICBza2lwSW1wb3J0PzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBGaW5kIHRoZSBtb2R1bGUgcmVmZXJyZWQgYnkgYSBzZXQgb2Ygb3B0aW9ucyBwYXNzZWQgdG8gdGhlIHNjaGVtYXRpY3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kTW9kdWxlRnJvbU9wdGlvbnMoXG4gIGhvc3Q6IFRyZWUsXG4gIG9wdGlvbnM6IE1vZHVsZU9wdGlvbnNcbik6IFBhdGggfCB1bmRlZmluZWQge1xuICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnc2tpcEltcG9ydCcpICYmIG9wdGlvbnMuc2tpcEltcG9ydCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMubW9kdWxlKSB7XG4gICAgY29uc3QgcGF0aFRvQ2hlY2sgPVxuICAgICAgKG9wdGlvbnMucGF0aCB8fCAnJykgK1xuICAgICAgKG9wdGlvbnMuZmxhdCA/ICcnIDogJy8nICsgc3RyaW5ncy5kYXNoZXJpemUob3B0aW9ucy5uYW1lKSk7XG5cbiAgICByZXR1cm4gbm9ybWFsaXplKGZpbmRNb2R1bGUoaG9zdCwgcGF0aFRvQ2hlY2spKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBtb2R1bGVQYXRoID0gbm9ybWFsaXplKCcvJyArIG9wdGlvbnMucGF0aCArICcvJyArIG9wdGlvbnMubW9kdWxlKTtcbiAgICBjb25zdCBtb2R1bGVCYXNlTmFtZSA9IG5vcm1hbGl6ZShtb2R1bGVQYXRoKVxuICAgICAgLnNwbGl0KCcvJylcbiAgICAgIC5wb3AoKTtcblxuICAgIGlmIChob3N0LmV4aXN0cyhtb2R1bGVQYXRoKSkge1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShtb2R1bGVQYXRoKTtcbiAgICB9IGVsc2UgaWYgKGhvc3QuZXhpc3RzKG1vZHVsZVBhdGggKyAnLnRzJykpIHtcbiAgICAgIHJldHVybiBub3JtYWxpemUobW9kdWxlUGF0aCArICcudHMnKTtcbiAgICB9IGVsc2UgaWYgKGhvc3QuZXhpc3RzKG1vZHVsZVBhdGggKyAnLm1vZHVsZS50cycpKSB7XG4gICAgICByZXR1cm4gbm9ybWFsaXplKG1vZHVsZVBhdGggKyAnLm1vZHVsZS50cycpO1xuICAgIH0gZWxzZSBpZiAoaG9zdC5leGlzdHMobW9kdWxlUGF0aCArICcvJyArIG1vZHVsZUJhc2VOYW1lICsgJy5tb2R1bGUudHMnKSkge1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShtb2R1bGVQYXRoICsgJy8nICsgbW9kdWxlQmFzZU5hbWUgKyAnLm1vZHVsZS50cycpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NwZWNpZmllZCBtb2R1bGUgZG9lcyBub3QgZXhpc3QnKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmaW5kIHRoZSBcImNsb3Nlc3RcIiBtb2R1bGUgdG8gYSBnZW5lcmF0ZWQgZmlsZSdzIHBhdGguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kTW9kdWxlKGhvc3Q6IFRyZWUsIGdlbmVyYXRlRGlyOiBzdHJpbmcpOiBQYXRoIHtcbiAgbGV0IGRpcjogRGlyRW50cnkgfCBudWxsID0gaG9zdC5nZXREaXIoJy8nICsgZ2VuZXJhdGVEaXIpO1xuXG4gIGNvbnN0IG1vZHVsZVJlID0gL1xcLm1vZHVsZVxcLnRzJC87XG4gIGNvbnN0IHJvdXRpbmdNb2R1bGVSZSA9IC8tcm91dGluZ1xcLm1vZHVsZVxcLnRzLztcblxuICB3aGlsZSAoZGlyKSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IGRpci5zdWJmaWxlcy5maWx0ZXIoXG4gICAgICBwID0+IG1vZHVsZVJlLnRlc3QocCkgJiYgIXJvdXRpbmdNb2R1bGVSZS50ZXN0KHApXG4gICAgKTtcblxuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICByZXR1cm4gam9pbihkaXIucGF0aCwgbWF0Y2hlc1swXSk7XG4gICAgfSBlbHNlIGlmIChtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ01vcmUgdGhhbiBvbmUgbW9kdWxlIG1hdGNoZXMuIFVzZSBza2lwLWltcG9ydCBvcHRpb24gdG8gc2tpcCBpbXBvcnRpbmcgJyArXG4gICAgICAgICAgJ3RoZSBjb21wb25lbnQgaW50byB0aGUgY2xvc2VzdCBtb2R1bGUuJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBkaXIgPSBkaXIucGFyZW50O1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICdDb3VsZCBub3QgZmluZCBhbiBOZ01vZHVsZS4gVXNlIHRoZSBza2lwLWltcG9ydCAnICtcbiAgICAgICdvcHRpb24gdG8gc2tpcCBpbXBvcnRpbmcgaW4gTmdNb2R1bGUuJ1xuICApO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgcmVsYXRpdmUgcGF0aCBmcm9tIG9uZSBmaWxlIHBhdGggdG8gYW5vdGhlciBmaWxlIHBhdGguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJlbGF0aXZlUGF0aChmcm9tOiBzdHJpbmcsIHRvOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB7XG4gICAgcGF0aDogZnJvbVBhdGgsXG4gICAgZmlsZW5hbWU6IGZyb21GaWxlTmFtZSxcbiAgICBkaXJlY3Rvcnk6IGZyb21EaXJlY3RvcnksXG4gIH0gPSBwYXJzZVBhdGgoZnJvbSk7XG4gIGNvbnN0IHtcbiAgICBwYXRoOiB0b1BhdGgsXG4gICAgZmlsZW5hbWU6IHRvRmlsZU5hbWUsXG4gICAgZGlyZWN0b3J5OiB0b0RpcmVjdG9yeSxcbiAgfSA9IHBhcnNlUGF0aCh0byk7XG4gIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlKGZyb21EaXJlY3RvcnksIHRvRGlyZWN0b3J5KTtcbiAgY29uc3QgZml4ZWRSZWxhdGl2ZVBhdGggPSByZWxhdGl2ZVBhdGguc3RhcnRzV2l0aCgnLicpXG4gICAgPyByZWxhdGl2ZVBhdGhcbiAgICA6IGAuLyR7cmVsYXRpdmVQYXRofWA7XG5cbiAgcmV0dXJuICF0b0ZpbGVOYW1lIHx8IHRvRmlsZU5hbWUgPT09ICdpbmRleC50cydcbiAgICA/IGZpeGVkUmVsYXRpdmVQYXRoXG4gICAgOiBgJHtcbiAgICAgICAgZml4ZWRSZWxhdGl2ZVBhdGguZW5kc1dpdGgoJy8nKVxuICAgICAgICAgID8gZml4ZWRSZWxhdGl2ZVBhdGhcbiAgICAgICAgICA6IGZpeGVkUmVsYXRpdmVQYXRoICsgJy8nXG4gICAgICB9JHtjb252ZXJ0VG9UeXBlU2NyaXB0RmlsZU5hbWUodG9GaWxlTmFtZSl9YDtcbn1cblxuZnVuY3Rpb24gcGFyc2VQYXRoKHBhdGg6IHN0cmluZykge1xuICBjb25zdCBwYXRoTm9ybWFsaXplZCA9IG5vcm1hbGl6ZShwYXRoKSBhcyBQYXRoO1xuICBjb25zdCBmaWxlbmFtZSA9IGV4dG5hbWUocGF0aE5vcm1hbGl6ZWQpID8gYmFzZW5hbWUocGF0aE5vcm1hbGl6ZWQpIDogJyc7XG4gIGNvbnN0IGRpcmVjdG9yeSA9IGZpbGVuYW1lID8gZGlybmFtZShwYXRoTm9ybWFsaXplZCkgOiBwYXRoTm9ybWFsaXplZDtcbiAgcmV0dXJuIHtcbiAgICBwYXRoOiBwYXRoTm9ybWFsaXplZCxcbiAgICBmaWxlbmFtZSxcbiAgICBkaXJlY3RvcnksXG4gIH07XG59XG4vKipcbiAqIFN0cmlwcyB0aGUgdHlwZXNjcmlwdCBleHRlbnNpb24gYW5kIGNsZWFycyBpbmRleCBmaWxlbmFtZXNcbiAqIGZvby50cyAtPiBmb29cbiAqIGluZGV4LnRzIC0+IGVtcHR5XG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRUb1R5cGVTY3JpcHRGaWxlTmFtZShmaWxlbmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gIHJldHVybiBmaWxlbmFtZSA/IGZpbGVuYW1lLnJlcGxhY2UoLyhcXC50cyl8KGluZGV4XFwudHMpJC8sICcnKSA6ICcnO1xufVxuIl19