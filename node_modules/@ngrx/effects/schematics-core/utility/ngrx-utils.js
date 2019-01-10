var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/effects/schematics-core/utility/ngrx-utils", ["require", "exports", "typescript", "@ngrx/effects/schematics-core/utility/strings", "@ngrx/effects/schematics-core/utility/change", "@angular-devkit/schematics", "@angular-devkit/core", "@ngrx/effects/schematics-core/utility/find-module", "@ngrx/effects/schematics-core/utility/route-utils", "@ngrx/effects/schematics-core/utility/ast-utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("typescript");
    var stringUtils = require("@ngrx/effects/schematics-core/utility/strings");
    var change_1 = require("@ngrx/effects/schematics-core/utility/change");
    var schematics_1 = require("@angular-devkit/schematics");
    var core_1 = require("@angular-devkit/core");
    var find_module_1 = require("@ngrx/effects/schematics-core/utility/find-module");
    var route_utils_1 = require("@ngrx/effects/schematics-core/utility/route-utils");
    var ast_utils_1 = require("@ngrx/effects/schematics-core/utility/ast-utils");
    function addReducerToState(options) {
        return function (host) {
            if (!options.reducers) {
                return host;
            }
            var reducersPath = core_1.normalize("/" + options.path + "/" + options.reducers);
            if (!host.exists(reducersPath)) {
                throw new Error('Specified reducers path does not exist');
            }
            var text = host.read(reducersPath);
            if (text === null) {
                throw new schematics_1.SchematicsException("File " + reducersPath + " does not exist.");
            }
            var sourceText = text.toString('utf-8');
            var source = ts.createSourceFile(reducersPath, sourceText, ts.ScriptTarget.Latest, true);
            var reducerPath = "/" + options.path + "/" +
                (options.flat ? '' : stringUtils.dasherize(options.name) + '/') +
                (options.group ? 'reducers/' : '') +
                stringUtils.dasherize(options.name) +
                '.reducer';
            var relativePath = find_module_1.buildRelativePath(reducersPath, reducerPath);
            var reducerImport = route_utils_1.insertImport(source, reducersPath, "* as from" + stringUtils.classify(options.name), relativePath, true);
            var stateInferfaceInsert = addReducerToStateInferface(source, reducersPath, options);
            var reducerMapInsert = addReducerToActionReducerMap(source, reducersPath, options);
            var changes = [reducerImport, stateInferfaceInsert, reducerMapInsert];
            var recorder = host.beginUpdate(reducersPath);
            try {
                for (var changes_1 = __values(changes), changes_1_1 = changes_1.next(); !changes_1_1.done; changes_1_1 = changes_1.next()) {
                    var change = changes_1_1.value;
                    if (change instanceof change_1.InsertChange) {
                        recorder.insertLeft(change.pos, change.toAdd);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (changes_1_1 && !changes_1_1.done && (_a = changes_1.return)) _a.call(changes_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            host.commitUpdate(recorder);
            return host;
            var e_1, _a;
        };
    }
    exports.addReducerToState = addReducerToState;
    /**
     * Insert the reducer into the first defined top level interface
     */
    function addReducerToStateInferface(source, reducersPath, options) {
        var stateInterface = source.statements.find(function (stm) { return stm.kind === ts.SyntaxKind.InterfaceDeclaration; });
        var node = stateInterface;
        if (!node) {
            return new change_1.NoopChange();
        }
        var keyInsert = stringUtils.camelize(options.name) +
            ': from' +
            stringUtils.classify(options.name) +
            '.State;';
        var expr = node;
        var position;
        var toInsert;
        if (expr.members.length === 0) {
            position = expr.getEnd() - 1;
            toInsert = "  " + keyInsert + "\n";
        }
        else {
            node = expr.members[expr.members.length - 1];
            position = node.getEnd() + 1;
            // Get the indentation of the last element, if any.
            var text = node.getFullText(source);
            var matches = text.match(/^\r?\n+(\s*)/);
            if (matches.length > 0) {
                toInsert = "" + matches[1] + keyInsert + "\n";
            }
            else {
                toInsert = "\n" + keyInsert;
            }
        }
        return new change_1.InsertChange(reducersPath, position, toInsert);
    }
    exports.addReducerToStateInferface = addReducerToStateInferface;
    /**
     * Insert the reducer into the ActionReducerMap
     */
    function addReducerToActionReducerMap(source, reducersPath, options) {
        var initializer;
        var actionReducerMap = source.statements
            .filter(function (stm) { return stm.kind === ts.SyntaxKind.VariableStatement; })
            .filter(function (stm) { return !!stm.declarationList; })
            .map(function (stm) {
            var declarations = stm.declarationList.declarations;
            var variable = declarations.find(function (decl) { return decl.kind === ts.SyntaxKind.VariableDeclaration; });
            var type = variable ? variable.type : {};
            return { initializer: variable.initializer, type: type };
        })
            .find(function (_a) {
            var type = _a.type;
            return type.typeName.text === 'ActionReducerMap';
        });
        if (!actionReducerMap || !actionReducerMap.initializer) {
            return new change_1.NoopChange();
        }
        var node = actionReducerMap.initializer;
        var keyInsert = stringUtils.camelize(options.name) +
            ': from' +
            stringUtils.classify(options.name) +
            '.reducer,';
        var expr = node;
        var position;
        var toInsert;
        if (expr.properties.length === 0) {
            position = expr.getEnd() - 1;
            toInsert = "  " + keyInsert + "\n";
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd() + 1;
            // Get the indentation of the last element, if any.
            var text = node.getFullText(source);
            var matches = text.match(/^\r?\n+(\s*)/);
            if (matches.length > 0) {
                toInsert = "\n" + matches[1] + keyInsert;
            }
            else {
                toInsert = "\n" + keyInsert;
            }
        }
        return new change_1.InsertChange(reducersPath, position, toInsert);
    }
    exports.addReducerToActionReducerMap = addReducerToActionReducerMap;
    /**
     * Add reducer feature to NgModule
     */
    function addReducerImportToNgModule(options) {
        return function (host) {
            if (!options.module) {
                return host;
            }
            var modulePath = options.module;
            if (!host.exists(options.module)) {
                throw new Error('Specified module does not exist');
            }
            var text = host.read(modulePath);
            if (text === null) {
                throw new schematics_1.SchematicsException("File " + modulePath + " does not exist.");
            }
            var sourceText = text.toString('utf-8');
            var source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
            var commonImports = [
                route_utils_1.insertImport(source, modulePath, 'StoreModule', '@ngrx/store'),
            ];
            var reducerPath = "/" + options.path + "/" +
                (options.flat ? '' : stringUtils.dasherize(options.name) + '/') +
                (options.group ? 'reducers/' : '') +
                stringUtils.dasherize(options.name) +
                '.reducer';
            var relativePath = find_module_1.buildRelativePath(modulePath, reducerPath);
            var reducerImport = route_utils_1.insertImport(source, modulePath, "* as from" + stringUtils.classify(options.name), relativePath, true);
            var _a = __read(ast_utils_1.addImportToModule(source, modulePath, "StoreModule.forFeature('" + stringUtils.camelize(options.name) + "', from" + stringUtils.classify(options.name) + ".reducer)", relativePath), 1), storeNgModuleImport = _a[0];
            var changes = __spread(commonImports, [reducerImport, storeNgModuleImport]);
            var recorder = host.beginUpdate(modulePath);
            try {
                for (var changes_2 = __values(changes), changes_2_1 = changes_2.next(); !changes_2_1.done; changes_2_1 = changes_2.next()) {
                    var change = changes_2_1.value;
                    if (change instanceof change_1.InsertChange) {
                        recorder.insertLeft(change.pos, change.toAdd);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (changes_2_1 && !changes_2_1.done && (_b = changes_2.return)) _b.call(changes_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            host.commitUpdate(recorder);
            return host;
            var e_2, _b;
        };
    }
    exports.addReducerImportToNgModule = addReducerImportToNgModule;
    function omit(object, keyToRemove) {
        return Object.keys(object)
            .filter(function (key) { return key !== keyToRemove; })
            .reduce(function (result, key) {
            return Object.assign(result, (_a = {}, _a[key] = object[key], _a));
            var _a;
        }, {});
    }
    exports.omit = omit;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdyeC11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zY2hlbWF0aWNzLWNvcmUvdXRpbGl0eS9uZ3J4LXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsK0JBQWlDO0lBQ2pDLDJFQUF5QztJQUN6Qyx1RUFBNEQ7SUFDNUQseURBQTZFO0lBQzdFLDZDQUFpRDtJQUNqRCxpRkFBa0Q7SUFDbEQsaUZBQTZDO0lBQzdDLDZFQUFnRDtJQUVoRCwyQkFBa0MsT0FBWTtRQUM1QyxNQUFNLENBQUMsVUFBQyxJQUFVO1lBQ2hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBRUQsSUFBTSxZQUFZLEdBQUcsZ0JBQVMsQ0FBQyxNQUFJLE9BQU8sQ0FBQyxJQUFJLFNBQUksT0FBTyxDQUFDLFFBQVUsQ0FBQyxDQUFDO1lBRXZFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBRUQsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNyQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbEIsTUFBTSxJQUFJLGdDQUFtQixDQUFDLFVBQVEsWUFBWSxxQkFBa0IsQ0FBQyxDQUFDO1lBQ3hFLENBQUM7WUFFRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTFDLElBQU0sTUFBTSxHQUFH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c291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgKiBhcyBzdHJpbmdVdGlscyBmcm9tICcuL3N0cmluZ3MnO1xuaW1wb3J0IHsgSW5zZXJ0Q2hhbmdlLCBDaGFuZ2UsIE5vb3BDaGFuZ2UgfSBmcm9tICcuL2NoYW5nZSc7XG5pbXBvcnQgeyBUcmVlLCBTY2hlbWF0aWNzRXhjZXB0aW9uLCBSdWxlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHsgbm9ybWFsaXplIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgYnVpbGRSZWxhdGl2ZVBhdGggfSBmcm9tICcuL2ZpbmQtbW9kdWxlJztcbmltcG9ydCB7IGluc2VydEltcG9ydCB9IGZyb20gJy4vcm91dGUtdXRpbHMnO1xuaW1wb3J0IHsgYWRkSW1wb3J0VG9Nb2R1bGUgfSBmcm9tICcuL2FzdC11dGlscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRSZWR1Y2VyVG9TdGF0ZShvcHRpb25zOiBhbnkpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlKSA9PiB7XG4gICAgaWYgKCFvcHRpb25zLnJlZHVjZXJzKSB7XG4gICAgICByZXR1cm4gaG9zdDtcbiAgICB9XG5cbiAgICBjb25zdCByZWR1Y2Vyc1BhdGggPSBub3JtYWxpemUoYC8ke29wdGlvbnMucGF0aH0vJHtvcHRpb25zLnJlZHVjZXJzfWApO1xuXG4gICAgaWYgKCFob3N0LmV4aXN0cyhyZWR1Y2Vyc1BhdGgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NwZWNpZmllZCByZWR1Y2VycyBwYXRoIGRvZXMgbm90IGV4aXN0Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgdGV4dCA9IGhvc3QucmVhZChyZWR1Y2Vyc1BhdGgpO1xuICAgIGlmICh0ZXh0ID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgRmlsZSAke3JlZHVjZXJzUGF0aH0gZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc291cmNlVGV4dCA9IHRleHQudG9TdHJpbmcoJ3V0Zi04Jyk7XG5cbiAgICBjb25zdCBzb3VyY2UgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKFxuICAgICAgcmVkdWNlcnNQYXRoLFxuICAgICAgc291cmNlVGV4dCxcbiAgICAgIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsXG4gICAgICB0cnVlXG4gICAgKTtcblxuICAgIGNvbnN0IHJlZHVjZXJQYXRoID1cbiAgICAgIGAvJHtvcHRpb25zLnBhdGh9L2AgK1xuICAgICAgKG9wdGlvbnMuZmxhdCA/ICcnIDogc3RyaW5nVXRpbHMuZGFzaGVyaXplKG9wdGlvbnMubmFtZSkgKyAnLycpICtcbiAgICAgIChvcHRpb25zLmdyb3VwID8gJ3JlZHVjZXJzLycgOiAnJykgK1xuICAgICAgc3RyaW5nVXRpbHMuZGFzaGVyaXplKG9wdGlvbnMubmFtZSkgK1xuICAgICAgJy5yZWR1Y2VyJztcblxuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGJ1aWxkUmVsYXRpdmVQYXRoKHJlZHVjZXJzUGF0aCwgcmVkdWNlclBhdGgpO1xuICAgIGNvbnN0IHJlZHVjZXJJbXBvcnQgPSBpbnNlcnRJbXBvcnQoXG4gICAgICBzb3VyY2UsXG4gICAgICByZWR1Y2Vyc1BhdGgsXG4gICAgICBgKiBhcyBmcm9tJHtzdHJpbmdVdGlscy5jbGFzc2lmeShvcHRpb25zLm5hbWUpfWAsXG4gICAgICByZWxhdGl2ZVBhdGgsXG4gICAgICB0cnVlXG4gICAgKTtcblxuICAgIGNvbnN0IHN0YXRlSW5mZXJmYWNlSW5zZXJ0ID0gYWRkUmVkdWNlclRvU3RhdGVJbmZlcmZhY2UoXG4gICAgICBzb3VyY2UsXG4gICAgICByZWR1Y2Vyc1BhdGgsXG4gICAgICBvcHRpb25zXG4gICAgKTtcbiAgICBjb25zdCByZWR1Y2VyTWFwSW5zZXJ0ID0gYWRkUmVkdWNlclRvQWN0aW9uUmVkdWNlck1hcChcbiAgICAgIHNvdXJjZSxcbiAgICAgIHJlZHVjZXJzUGF0aCxcbiAgICAgIG9wdGlvbnNcbiAgICApO1xuXG4gICAgY29uc3QgY2hhbmdlcyA9IFtyZWR1Y2VySW1wb3J0LCBzdGF0ZUluZmVyZmFjZUluc2VydCwgcmVkdWNlck1hcEluc2VydF07XG4gICAgY29uc3QgcmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKHJlZHVjZXJzUGF0aCk7XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgY2hhbmdlcykge1xuICAgICAgaWYgKGNoYW5nZSBpbnN0YW5jZW9mIEluc2VydENoYW5nZSkge1xuICAgICAgICByZWNvcmRlci5pbnNlcnRMZWZ0KGNoYW5nZS5wb3MsIGNoYW5nZS50b0FkZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGhvc3QuY29tbWl0VXBkYXRlKHJlY29yZGVyKTtcblxuICAgIHJldHVybiBob3N0O1xuICB9O1xufVxuXG4vKipcbiAqIEluc2VydCB0aGUgcmVkdWNlciBpbnRvIHRoZSBmaXJzdCBkZWZpbmVkIHRvcCBsZXZlbCBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlZHVjZXJUb1N0YXRlSW5mZXJmYWNlKFxuICBzb3VyY2U6IHRzLlNvdXJjZUZpbGUsXG4gIHJlZHVjZXJzUGF0aDogc3RyaW5nLFxuICBvcHRpb25zOiB7IG5hbWU6IHN0cmluZyB9XG4pOiBDaGFuZ2Uge1xuICBjb25zdCBzdGF0ZUludGVyZmFjZSA9IHNvdXJjZS5zdGF0ZW1lbnRzLmZpbmQoXG4gICAgc3RtID0+IHN0bS5raW5kID09PSB0cy5TeW50YXhLaW5kLkludGVyZmFjZURlY2xhcmF0aW9uXG4gICk7XG4gIGxldCBub2RlID0gc3RhdGVJbnRlcmZhY2UgYXMgdHMuU3RhdGVtZW50O1xuXG4gIGlmICghbm9kZSkge1xuICAgIHJldHVybiBuZXcgTm9vcENoYW5nZSgpO1xuICB9XG5cbiAgY29uc3Qga2V5SW5zZXJ0ID1cbiAgICBzdHJpbmdVdGlscy5jYW1lbGl6ZShvcHRpb25zLm5hbWUpICtcbiAgICAnOiBmcm9tJyArXG4gICAgc3RyaW5nVXRpbHMuY2xhc3NpZnkob3B0aW9ucy5uYW1lKSArXG4gICAgJy5TdGF0ZTsnO1xuICBjb25zdCBleHByID0gbm9kZSBhcyBhbnk7XG4gIGxldCBwb3NpdGlvbjtcbiAgbGV0IHRvSW5zZXJ0O1xuXG4gIGlmIChleHByLm1lbWJlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcG9zaXRpb24gPSBleHByLmdldEVuZCgpIC0gMTtcbiAgICB0b0luc2VydCA9IGAgICR7a2V5SW5zZXJ0fVxcbmA7XG4gIH0gZWxzZSB7XG4gICAgbm9kZSA9IGV4cHIubWVtYmVyc1tleHByLm1lbWJlcnMubGVuZ3RoIC0gMV07XG4gICAgcG9zaXRpb24gPSBub2RlLmdldEVuZCgpICsgMTtcbiAgICAvLyBHZXQgdGhlIGluZGVudGF0aW9uIG9mIHRoZSBsYXN0IGVsZW1lbnQsIGlmIGFueS5cbiAgICBjb25zdCB0ZXh0ID0gbm9kZS5nZXRGdWxsVGV4dChzb3VyY2UpO1xuICAgIGNvbnN0IG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKC9eXFxyP1xcbisoXFxzKikvKTtcblxuICAgIGlmIChtYXRjaGVzIS5sZW5ndGggPiAwKSB7XG4gICAgICB0b0luc2VydCA9IGAke21hdGNoZXMhWzFdfSR7a2V5SW5zZXJ0fVxcbmA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvSW5zZXJ0ID0gYFxcbiR7a2V5SW5zZXJ0fWA7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBJbnNlcnRDaGFuZ2UocmVkdWNlcnNQYXRoLCBwb3NpdGlvbiwgdG9JbnNlcnQpO1xufVxuXG4vKipcbiAqIEluc2VydCB0aGUgcmVkdWNlciBpbnRvIHRoZSBBY3Rpb25SZWR1Y2VyTWFwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRSZWR1Y2VyVG9BY3Rpb25SZWR1Y2VyTWFwKFxuICBzb3VyY2U6IHRzLlNvdXJjZUZpbGUsXG4gIHJlZHVjZXJzUGF0aDogc3RyaW5nLFxuICBvcHRpb25zOiB7IG5hbWU6IHN0cmluZyB9XG4pOiBDaGFuZ2Uge1xuICBsZXQgaW5pdGlhbGl6ZXI6IGFueTtcbiAgY29uc3QgYWN0aW9uUmVkdWNlck1hcDogYW55ID0gc291cmNlLnN0YXRlbWVudHNcbiAgICAuZmlsdGVyKHN0bSA9PiBzdG0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudClcbiAgICAuZmlsdGVyKChzdG06IGFueSkgPT4gISFzdG0uZGVjbGFyYXRpb25MaXN0KVxuICAgIC5tYXAoKHN0bTogYW55KSA9PiB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGRlY2xhcmF0aW9ucyxcbiAgICAgIH06IHtcbiAgICAgICAgZGVjbGFyYXRpb25zOiB0cy5TeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb25MaXN0W107XG4gICAgICB9ID0gc3RtLmRlY2xhcmF0aW9uTGlzdDtcbiAgICAgIGNvbnN0IHZhcmlhYmxlOiBhbnkgPSBkZWNsYXJhdGlvbnMuZmluZChcbiAgICAgICAgKGRlY2w6IGFueSkgPT4gZGVjbC5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb25cbiAgICAgICk7XG4gICAgICBjb25zdCB0eXBlID0gdmFyaWFibGUgPyB2YXJpYWJsZS50eXBlIDoge307XG5cbiAgICAgIHJldHVybiB7IGluaXRpYWxpemVyOiB2YXJpYWJsZS5pbml0aWFsaXplciwgdHlwZSB9O1xuICAgIH0pXG4gICAgLmZpbmQoKHsgdHlwZSB9KSA9PiB0eXBlLnR5cGVOYW1lLnRleHQgPT09ICdBY3Rpb25SZWR1Y2VyTWFwJyk7XG5cbiAgaWYgKCFhY3Rpb25SZWR1Y2VyTWFwIHx8ICFhY3Rpb25SZWR1Y2VyTWFwLmluaXRpYWxpemVyKSB7XG4gICAgcmV0dXJuIG5ldyBOb29wQ2hhbmdlKCk7XG4gIH1cblxuICBsZXQgbm9kZSA9IGFjdGlvblJlZHVjZXJNYXAuaW5pdGlhbGl6ZXI7XG5cbiAgY29uc3Qga2V5SW5zZXJ0ID1cbiAgICBzdHJpbmdVdGlscy5jYW1lbGl6ZShvcHRpb25zLm5hbWUpICtcbiAgICAnOiBmcm9tJyArXG4gICAgc3RyaW5nVXRpbHMuY2xhc3NpZnkob3B0aW9ucy5uYW1lKSArXG4gICAgJy5yZWR1Y2VyLCc7XG4gIGNvbnN0IGV4cHIgPSBub2RlIGFzIGFueTtcbiAgbGV0IHBvc2l0aW9uO1xuICBsZXQgdG9JbnNlcnQ7XG5cbiAgaWYgKGV4cHIucHJvcGVydGllcy5sZW5ndGggPT09IDApIHtcbiAgICBwb3NpdGlvbiA9IGV4cHIuZ2V0RW5kKCkgLSAxO1xuICAgIHRvSW5zZXJ0ID0gYCAgJHtrZXlJbnNlcnR9XFxuYDtcbiAgfSBlbHNlIHtcbiAgICBub2RlID0gZXhwci5wcm9wZXJ0aWVzW2V4cHIucHJvcGVydGllcy5sZW5ndGggLSAxXTtcbiAgICBwb3NpdGlvbiA9IG5vZGUuZ2V0RW5kKCkgKyAxO1xuICAgIC8vIEdldCB0aGUgaW5kZW50YXRpb24gb2YgdGhlIGxhc3QgZWxlbWVudCwgaWYgYW55LlxuICAgIGNvbnN0IHRleHQgPSBub2RlLmdldEZ1bGxUZXh0KHNvdXJjZSk7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHRleHQubWF0Y2goL15cXHI/XFxuKyhcXHMqKS8pO1xuXG4gICAgaWYgKG1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgdG9JbnNlcnQgPSBgXFxuJHttYXRjaGVzIVsxXX0ke2tleUluc2VydH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b0luc2VydCA9IGBcXG4ke2tleUluc2VydH1gO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgSW5zZXJ0Q2hhbmdlKHJlZHVjZXJzUGF0aCwgcG9zaXRpb24sIHRvSW5zZXJ0KTtcbn1cblxuLyoqXG4gKiBBZGQgcmVkdWNlciBmZWF0dXJlIHRvIE5nTW9kdWxlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRSZWR1Y2VySW1wb3J0VG9OZ01vZHVsZShvcHRpb25zOiBhbnkpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlKSA9PiB7XG4gICAgaWYgKCFvcHRpb25zLm1vZHVsZSkge1xuICAgICAgcmV0dXJuIGhvc3Q7XG4gICAgfVxuXG4gICAgY29uc3QgbW9kdWxlUGF0aCA9IG9wdGlvbnMubW9kdWxlO1xuICAgIGlmICghaG9zdC5leGlzdHMob3B0aW9ucy5tb2R1bGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NwZWNpZmllZCBtb2R1bGUgZG9lcyBub3QgZXhpc3QnKTtcbiAgICB9XG5cbiAgICBjb25zdCB0ZXh0ID0gaG9zdC5yZWFkKG1vZHVsZVBhdGgpO1xuICAgIGlmICh0ZXh0ID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgRmlsZSAke21vZHVsZVBhdGh9IGRvZXMgbm90IGV4aXN0LmApO1xuICAgIH1cbiAgICBjb25zdCBzb3VyY2VUZXh0ID0gdGV4dC50b1N0cmluZygndXRmLTgnKTtcblxuICAgIGNvbnN0IHNvdXJjZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICBtb2R1bGVQYXRoLFxuICAgICAgc291cmNlVGV4dCxcbiAgICAgIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsXG4gICAgICB0cnVlXG4gICAgKTtcblxuICAgIGNvbnN0IGNvbW1vbkltcG9ydHMgPSBbXG4gICAgICBpbnNlcnRJbXBvcnQoc291cmNlLCBtb2R1bGVQYXRoLCAnU3RvcmVNb2R1bGUnLCAnQG5ncngvc3RvcmUnKSxcbiAgICBdO1xuXG4gICAgY29uc3QgcmVkdWNlclBhdGggPVxuICAgICAgYC8ke29wdGlvbnMucGF0aH0vYCArXG4gICAgICAob3B0aW9ucy5mbGF0ID8gJycgOiBzdHJpbmdVdGlscy5kYXNoZXJpemUob3B0aW9ucy5uYW1lKSArICcvJykgK1xuICAgICAgKG9wdGlvbnMuZ3JvdXAgPyAncmVkdWNlcnMvJyA6ICcnKSArXG4gICAgICBzdHJpbmdVdGlscy5kYXNoZXJpemUob3B0aW9ucy5uYW1lKSArXG4gICAgICAnLnJlZHVjZXInO1xuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGJ1aWxkUmVsYXRpdmVQYXRoKG1vZHVsZVBhdGgsIHJlZHVjZXJQYXRoKTtcbiAgICBjb25zdCByZWR1Y2VySW1wb3J0ID0gaW5zZXJ0SW1wb3J0KFxuICAgICAgc291cmNlLFxuICAgICAgbW9kdWxlUGF0aCxcbiAgICAgIGAqIGFzIGZyb20ke3N0cmluZ1V0aWxzLmNsYXNzaWZ5KG9wdGlvbnMubmFtZSl9YCxcbiAgICAgIHJlbGF0aXZlUGF0aCxcbiAgICAgIHRydWVcbiAgICApO1xuICAgIGNvbnN0IFtzdG9yZU5nTW9kdWxlSW1wb3J0XSA9IGFkZEltcG9ydFRvTW9kdWxlKFxuICAgICAgc291cmNlLFxuICAgICAgbW9kdWxlUGF0aCxcbiAgICAgIGBTdG9yZU1vZHVsZS5mb3JGZWF0dXJlKCcke3N0cmluZ1V0aWxzLmNhbWVsaXplKFxuICAgICAgICBvcHRpb25zLm5hbWVcbiAgICAgICl9JywgZnJvbSR7c3RyaW5nVXRpbHMuY2xhc3NpZnkob3B0aW9ucy5uYW1lKX0ucmVkdWNlcilgLFxuICAgICAgcmVsYXRpdmVQYXRoXG4gICAgKTtcbiAgICBjb25zdCBjaGFuZ2VzID0gWy4uLmNvbW1vbkltcG9ydHMsIHJlZHVjZXJJbXBvcnQsIHN0b3JlTmdNb2R1bGVJbXBvcnRdO1xuICAgIGNvbnN0IHJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShtb2R1bGVQYXRoKTtcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzKSB7XG4gICAgICBpZiAoY2hhbmdlIGluc3RhbmNlb2YgSW5zZXJ0Q2hhbmdlKSB7XG4gICAgICAgIHJlY29yZGVyLmluc2VydExlZnQoY2hhbmdlLnBvcywgY2hhbmdlLnRvQWRkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaG9zdC5jb21taXRVcGRhdGUocmVjb3JkZXIpO1xuXG4gICAgcmV0dXJuIGhvc3Q7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvbWl0PFQgZXh0ZW5kcyB7IFtrZXk6IHN0cmluZ106IGFueSB9PihcbiAgb2JqZWN0OiBULFxuICBrZXlUb1JlbW92ZToga2V5b2YgVFxuKTogUGFydGlhbDxUPiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmplY3QpXG4gICAgLmZpbHRlcihrZXkgPT4ga2V5ICE9PSBrZXlUb1JlbW92ZSlcbiAgICAucmVkdWNlKChyZXN1bHQsIGtleSkgPT4gT2JqZWN0LmFzc2lnbihyZXN1bHQsIHsgW2tleV06IG9iamVjdFtrZXldIH0pLCB7fSk7XG59XG4iXX0=