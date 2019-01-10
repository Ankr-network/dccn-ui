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
        define("@ngrx/store/schematics-core/utility/ngrx-utils", ["require", "exports", "typescript", "@ngrx/store/schematics-core/utility/strings", "@ngrx/store/schematics-core/utility/change", "@angular-devkit/schematics", "@angular-devkit/core", "@ngrx/store/schematics-core/utility/find-module", "@ngrx/store/schematics-core/utility/route-utils", "@ngrx/store/schematics-core/utility/ast-utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("typescript");
    var stringUtils = require("@ngrx/store/schematics-core/utility/strings");
    var change_1 = require("@ngrx/store/schematics-core/utility/change");
    var schematics_1 = require("@angular-devkit/schematics");
    var core_1 = require("@angular-devkit/core");
    var find_module_1 = require("@ngrx/store/schematics-core/utility/find-module");
    var route_utils_1 = require("@ngrx/store/schematics-core/utility/route-utils");
    var ast_utils_1 = require("@ngrx/store/schematics-core/utility/ast-utils");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdyeC11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvc3RvcmUvc2NoZW1hdGljcy1jb3JlL3V0aWxpdHkvbmdyeC11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLCtCQUFpQztJQUNqQyx5RUFBeUM7SUFDekMscUVBQTREO0lBQzVELHlEQUE2RTtJQUM3RSw2Q0FBaUQ7SUFDakQsK0VBQWtEO0lBQ2xELCtFQUE2QztJQUM3QywyRUFBZ0Q7SUFFaEQsMkJBQWtDLE9BQVk7UUFDNUMsTUFBTSxDQUFDLFVBQUMsSUFBVTtZQUNoQixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztZQUVELElBQU0sWUFBWSxHQUFHLGdCQUFTLENBQUMsTUFBSSxPQUFPLENBQUMsSUFBSSxTQUFJLE9BQU8sQ0FBQyxRQUFVLENBQUMsQ0FBQztZQUV2RSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7WUFDNUQsQ0FBQztZQUVELElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQyxVQUFRLFlBQVkscUJBQWtCLENBQUMsQ0FBQztZQUN4RSxDQUFDO1lBRUQsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUxQyxJQUFNLE1BQU0sR0FBRyxF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dXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0ICogYXMgc3RyaW5nVXRpbHMgZnJvbSAnLi9zdHJpbmdzJztcbmltcG9ydCB7IEluc2VydENoYW5nZSwgQ2hhbmdlLCBOb29wQ2hhbmdlIH0gZnJvbSAnLi9jaGFuZ2UnO1xuaW1wb3J0IHsgVHJlZSwgU2NoZW1hdGljc0V4Y2VwdGlvbiwgUnVsZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IG5vcm1hbGl6ZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IGJ1aWxkUmVsYXRpdmVQYXRoIH0gZnJvbSAnLi9maW5kLW1vZHVsZSc7XG5pbXBvcnQgeyBpbnNlcnRJbXBvcnQgfSBmcm9tICcuL3JvdXRlLXV0aWxzJztcbmltcG9ydCB7IGFkZEltcG9ydFRvTW9kdWxlIH0gZnJvbSAnLi9hc3QtdXRpbHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gYWRkUmVkdWNlclRvU3RhdGUob3B0aW9uczogYW55KTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSkgPT4ge1xuICAgIGlmICghb3B0aW9ucy5yZWR1Y2Vycykge1xuICAgICAgcmV0dXJuIGhvc3Q7XG4gICAgfVxuXG4gICAgY29uc3QgcmVkdWNlcnNQYXRoID0gbm9ybWFsaXplKGAvJHtvcHRpb25zLnBhdGh9LyR7b3B0aW9ucy5yZWR1Y2Vyc31gKTtcblxuICAgIGlmICghaG9zdC5leGlzdHMocmVkdWNlcnNQYXRoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTcGVjaWZpZWQgcmVkdWNlcnMgcGF0aCBkb2VzIG5vdCBleGlzdCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHRleHQgPSBob3N0LnJlYWQocmVkdWNlcnNQYXRoKTtcbiAgICBpZiAodGV4dCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYEZpbGUgJHtyZWR1Y2Vyc1BhdGh9IGRvZXMgbm90IGV4aXN0LmApO1xuICAgIH1cblxuICAgIGNvbnN0IHNvdXJjZVRleHQgPSB0ZXh0LnRvU3RyaW5nKCd1dGYtOCcpO1xuXG4gICAgY29uc3Qgc291cmNlID0gdHMuY3JlYXRlU291cmNlRmlsZShcbiAgICAgIHJlZHVjZXJzUGF0aCxcbiAgICAgIHNvdXJjZVRleHQsXG4gICAgICB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LFxuICAgICAgdHJ1ZVxuICAgICk7XG5cbiAgICBjb25zdCByZWR1Y2VyUGF0aCA9XG4gICAgICBgLyR7b3B0aW9ucy5wYXRofS9gICtcbiAgICAgIChvcHRpb25zLmZsYXQgPyAnJyA6IHN0cmluZ1V0aWxzLmRhc2hlcml6ZShvcHRpb25zLm5hbWUpICsgJy8nKSArXG4gICAgICAob3B0aW9ucy5ncm91cCA/ICdyZWR1Y2Vycy8nIDogJycpICtcbiAgICAgIHN0cmluZ1V0aWxzLmRhc2hlcml6ZShvcHRpb25zLm5hbWUpICtcbiAgICAgICcucmVkdWNlcic7XG5cbiAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBidWlsZFJlbGF0aXZlUGF0aChyZWR1Y2Vyc1BhdGgsIHJlZHVjZXJQYXRoKTtcbiAgICBjb25zdCByZWR1Y2VySW1wb3J0ID0gaW5zZXJ0SW1wb3J0KFxuICAgICAgc291cmNlLFxuICAgICAgcmVkdWNlcnNQYXRoLFxuICAgICAgYCogYXMgZnJvbSR7c3RyaW5nVXRpbHMuY2xhc3NpZnkob3B0aW9ucy5uYW1lKX1gLFxuICAgICAgcmVsYXRpdmVQYXRoLFxuICAgICAgdHJ1ZVxuICAgICk7XG5cbiAgICBjb25zdCBzdGF0ZUluZmVyZmFjZUluc2VydCA9IGFkZFJlZHVjZXJUb1N0YXRlSW5mZXJmYWNlKFxuICAgICAgc291cmNlLFxuICAgICAgcmVkdWNlcnNQYXRoLFxuICAgICAgb3B0aW9uc1xuICAgICk7XG4gICAgY29uc3QgcmVkdWNlck1hcEluc2VydCA9IGFkZFJlZHVjZXJUb0FjdGlvblJlZHVjZXJNYXAoXG4gICAgICBzb3VyY2UsXG4gICAgICByZWR1Y2Vyc1BhdGgsXG4gICAgICBvcHRpb25zXG4gICAgKTtcblxuICAgIGNvbnN0IGNoYW5nZXMgPSBbcmVkdWNlckltcG9ydCwgc3RhdGVJbmZlcmZhY2VJbnNlcnQsIHJlZHVjZXJNYXBJbnNlcnRdO1xuICAgIGNvbnN0IHJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShyZWR1Y2Vyc1BhdGgpO1xuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXMpIHtcbiAgICAgIGlmIChjaGFuZ2UgaW5zdGFuY2VvZiBJbnNlcnRDaGFuZ2UpIHtcbiAgICAgICAgcmVjb3JkZXIuaW5zZXJ0TGVmdChjaGFuZ2UucG9zLCBjaGFuZ2UudG9BZGQpO1xuICAgICAgfVxuICAgIH1cbiAgICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuLyoqXG4gKiBJbnNlcnQgdGhlIHJlZHVjZXIgaW50byB0aGUgZmlyc3QgZGVmaW5lZCB0b3AgbGV2ZWwgaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRSZWR1Y2VyVG9TdGF0ZUluZmVyZmFjZShcbiAgc291cmNlOiB0cy5Tb3VyY2VGaWxlLFxuICByZWR1Y2Vyc1BhdGg6IHN0cmluZyxcbiAgb3B0aW9uczogeyBuYW1lOiBzdHJpbmcgfVxuKTogQ2hhbmdlIHtcbiAgY29uc3Qgc3RhdGVJbnRlcmZhY2UgPSBzb3VyY2Uuc3RhdGVtZW50cy5maW5kKFxuICAgIHN0bSA9PiBzdG0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbnRlcmZhY2VEZWNsYXJhdGlvblxuICApO1xuICBsZXQgbm9kZSA9IHN0YXRlSW50ZXJmYWNlIGFzIHRzLlN0YXRlbWVudDtcblxuICBpZiAoIW5vZGUpIHtcbiAgICByZXR1cm4gbmV3IE5vb3BDaGFuZ2UoKTtcbiAgfVxuXG4gIGNvbnN0IGtleUluc2VydCA9XG4gICAgc3RyaW5nVXRpbHMuY2FtZWxpemUob3B0aW9ucy5uYW1lKSArXG4gICAgJzogZnJvbScgK1xuICAgIHN0cmluZ1V0aWxzLmNsYXNzaWZ5KG9wdGlvbnMubmFtZSkgK1xuICAgICcuU3RhdGU7JztcbiAgY29uc3QgZXhwciA9IG5vZGUgYXMgYW55O1xuICBsZXQgcG9zaXRpb247XG4gIGxldCB0b0luc2VydDtcblxuICBpZiAoZXhwci5tZW1iZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIHBvc2l0aW9uID0gZXhwci5nZXRFbmQoKSAtIDE7XG4gICAgdG9JbnNlcnQgPSBgICAke2tleUluc2VydH1cXG5gO1xuICB9IGVsc2Uge1xuICAgIG5vZGUgPSBleHByLm1lbWJlcnNbZXhwci5tZW1iZXJzLmxlbmd0aCAtIDFdO1xuICAgIHBvc2l0aW9uID0gbm9kZS5nZXRFbmQoKSArIDE7XG4gICAgLy8gR2V0IHRoZSBpbmRlbnRhdGlvbiBvZiB0aGUgbGFzdCBlbGVtZW50LCBpZiBhbnkuXG4gICAgY29uc3QgdGV4dCA9IG5vZGUuZ2V0RnVsbFRleHQoc291cmNlKTtcbiAgICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaCgvXlxccj9cXG4rKFxccyopLyk7XG5cbiAgICBpZiAobWF0Y2hlcyEubGVuZ3RoID4gMCkge1xuICAgICAgdG9JbnNlcnQgPSBgJHttYXRjaGVzIVsxXX0ke2tleUluc2VydH1cXG5gO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b0luc2VydCA9IGBcXG4ke2tleUluc2VydH1gO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgSW5zZXJ0Q2hhbmdlKHJlZHVjZXJzUGF0aCwgcG9zaXRpb24sIHRvSW5zZXJ0KTtcbn1cblxuLyoqXG4gKiBJbnNlcnQgdGhlIHJlZHVjZXIgaW50byB0aGUgQWN0aW9uUmVkdWNlck1hcFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkUmVkdWNlclRvQWN0aW9uUmVkdWNlck1hcChcbiAgc291cmNlOiB0cy5Tb3VyY2VGaWxlLFxuICByZWR1Y2Vyc1BhdGg6IHN0cmluZyxcbiAgb3B0aW9uczogeyBuYW1lOiBzdHJpbmcgfVxuKTogQ2hhbmdlIHtcbiAgbGV0IGluaXRpYWxpemVyOiBhbnk7XG4gIGNvbnN0IGFjdGlvblJlZHVjZXJNYXA6IGFueSA9IHNvdXJjZS5zdGF0ZW1lbnRzXG4gICAgLmZpbHRlcihzdG0gPT4gc3RtLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQpXG4gICAgLmZpbHRlcigoc3RtOiBhbnkpID0+ICEhc3RtLmRlY2xhcmF0aW9uTGlzdClcbiAgICAubWFwKChzdG06IGFueSkgPT4ge1xuICAgICAgY29uc3Qge1xuICAgICAgICBkZWNsYXJhdGlvbnMsXG4gICAgICB9OiB7XG4gICAgICAgIGRlY2xhcmF0aW9uczogdHMuU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uTGlzdFtdO1xuICAgICAgfSA9IHN0bS5kZWNsYXJhdGlvbkxpc3Q7XG4gICAgICBjb25zdCB2YXJpYWJsZTogYW55ID0gZGVjbGFyYXRpb25zLmZpbmQoXG4gICAgICAgIChkZWNsOiBhbnkpID0+IGRlY2wua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uXG4gICAgICApO1xuICAgICAgY29uc3QgdHlwZSA9IHZhcmlhYmxlID8gdmFyaWFibGUudHlwZSA6IHt9O1xuXG4gICAgICByZXR1cm4geyBpbml0aWFsaXplcjogdmFyaWFibGUuaW5pdGlhbGl6ZXIsIHR5cGUgfTtcbiAgICB9KVxuICAgIC5maW5kKCh7IHR5cGUgfSkgPT4gdHlwZS50eXBlTmFtZS50ZXh0ID09PSAnQWN0aW9uUmVkdWNlck1hcCcpO1xuXG4gIGlmICghYWN0aW9uUmVkdWNlck1hcCB8fCAhYWN0aW9uUmVkdWNlck1hcC5pbml0aWFsaXplcikge1xuICAgIHJldHVybiBuZXcgTm9vcENoYW5nZSgpO1xuICB9XG5cbiAgbGV0IG5vZGUgPSBhY3Rpb25SZWR1Y2VyTWFwLmluaXRpYWxpemVyO1xuXG4gIGNvbnN0IGtleUluc2VydCA9XG4gICAgc3RyaW5nVXRpbHMuY2FtZWxpemUob3B0aW9ucy5uYW1lKSArXG4gICAgJzogZnJvbScgK1xuICAgIHN0cmluZ1V0aWxzLmNsYXNzaWZ5KG9wdGlvbnMubmFtZSkgK1xuICAgICcucmVkdWNlciwnO1xuICBjb25zdCBleHByID0gbm9kZSBhcyBhbnk7XG4gIGxldCBwb3NpdGlvbjtcbiAgbGV0IHRvSW5zZXJ0O1xuXG4gIGlmIChleHByLnByb3BlcnRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcG9zaXRpb24gPSBleHByLmdldEVuZCgpIC0gMTtcbiAgICB0b0luc2VydCA9IGAgICR7a2V5SW5zZXJ0fVxcbmA7XG4gIH0gZWxzZSB7XG4gICAgbm9kZSA9IGV4cHIucHJvcGVydGllc1tleHByLnByb3BlcnRpZXMubGVuZ3RoIC0gMV07XG4gICAgcG9zaXRpb24gPSBub2RlLmdldEVuZCgpICsgMTtcbiAgICAvLyBHZXQgdGhlIGluZGVudGF0aW9uIG9mIHRoZSBsYXN0IGVsZW1lbnQsIGlmIGFueS5cbiAgICBjb25zdCB0ZXh0ID0gbm9kZS5nZXRGdWxsVGV4dChzb3VyY2UpO1xuICAgIGNvbnN0IG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKC9eXFxyP1xcbisoXFxzKikvKTtcblxuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRvSW5zZXJ0ID0gYFxcbiR7bWF0Y2hlcyFbMV19JHtrZXlJbnNlcnR9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9JbnNlcnQgPSBgXFxuJHtrZXlJbnNlcnR9YDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IEluc2VydENoYW5nZShyZWR1Y2Vyc1BhdGgsIHBvc2l0aW9uLCB0b0luc2VydCk7XG59XG5cbi8qKlxuICogQWRkIHJlZHVjZXIgZmVhdHVyZSB0byBOZ01vZHVsZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkUmVkdWNlckltcG9ydFRvTmdNb2R1bGUob3B0aW9uczogYW55KTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSkgPT4ge1xuICAgIGlmICghb3B0aW9ucy5tb2R1bGUpIHtcbiAgICAgIHJldHVybiBob3N0O1xuICAgIH1cblxuICAgIGNvbnN0IG1vZHVsZVBhdGggPSBvcHRpb25zLm1vZHVsZTtcbiAgICBpZiAoIWhvc3QuZXhpc3RzKG9wdGlvbnMubW9kdWxlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTcGVjaWZpZWQgbW9kdWxlIGRvZXMgbm90IGV4aXN0Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgdGV4dCA9IGhvc3QucmVhZChtb2R1bGVQYXRoKTtcbiAgICBpZiAodGV4dCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYEZpbGUgJHttb2R1bGVQYXRofSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICB9XG4gICAgY29uc3Qgc291cmNlVGV4dCA9IHRleHQudG9TdHJpbmcoJ3V0Zi04Jyk7XG5cbiAgICBjb25zdCBzb3VyY2UgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKFxuICAgICAgbW9kdWxlUGF0aCxcbiAgICAgIHNvdXJjZVRleHQsXG4gICAgICB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LFxuICAgICAgdHJ1ZVxuICAgICk7XG5cbiAgICBjb25zdCBjb21tb25JbXBvcnRzID0gW1xuICAgICAgaW5zZXJ0SW1wb3J0KHNvdXJjZSwgbW9kdWxlUGF0aCwgJ1N0b3JlTW9kdWxlJywgJ0BuZ3J4L3N0b3JlJyksXG4gICAgXTtcblxuICAgIGNvbnN0IHJlZHVjZXJQYXRoID1cbiAgICAgIGAvJHtvcHRpb25zLnBhdGh9L2AgK1xuICAgICAgKG9wdGlvbnMuZmxhdCA/ICcnIDogc3RyaW5nVXRpbHMuZGFzaGVyaXplKG9wdGlvbnMubmFtZSkgKyAnLycpICtcbiAgICAgIChvcHRpb25zLmdyb3VwID8gJ3JlZHVjZXJzLycgOiAnJykgK1xuICAgICAgc3RyaW5nVXRpbHMuZGFzaGVyaXplKG9wdGlvbnMubmFtZSkgK1xuICAgICAgJy5yZWR1Y2VyJztcbiAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBidWlsZFJlbGF0aXZlUGF0aChtb2R1bGVQYXRoLCByZWR1Y2VyUGF0aCk7XG4gICAgY29uc3QgcmVkdWNlckltcG9ydCA9IGluc2VydEltcG9ydChcbiAgICAgIHNvdXJjZSxcbiAgICAgIG1vZHVsZVBhdGgsXG4gICAgICBgKiBhcyBmcm9tJHtzdHJpbmdVdGlscy5jbGFzc2lmeShvcHRpb25zLm5hbWUpfWAsXG4gICAgICByZWxhdGl2ZVBhdGgsXG4gICAgICB0cnVlXG4gICAgKTtcbiAgICBjb25zdCBbc3RvcmVOZ01vZHVsZUltcG9ydF0gPSBhZGRJbXBvcnRUb01vZHVsZShcbiAgICAgIHNvdXJjZSxcbiAgICAgIG1vZHVsZVBhdGgsXG4gICAgICBgU3RvcmVNb2R1bGUuZm9yRmVhdHVyZSgnJHtzdHJpbmdVdGlscy5jYW1lbGl6ZShcbiAgICAgICAgb3B0aW9ucy5uYW1lXG4gICAgICApfScsIGZyb20ke3N0cmluZ1V0aWxzLmNsYXNzaWZ5KG9wdGlvbnMubmFtZSl9LnJlZHVjZXIpYCxcbiAgICAgIHJlbGF0aXZlUGF0aFxuICAgICk7XG4gICAgY29uc3QgY2hhbmdlcyA9IFsuLi5jb21tb25JbXBvcnRzLCByZWR1Y2VySW1wb3J0LCBzdG9yZU5nTW9kdWxlSW1wb3J0XTtcbiAgICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUobW9kdWxlUGF0aCk7XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgY2hhbmdlcykge1xuICAgICAgaWYgKGNoYW5nZSBpbnN0YW5jZW9mIEluc2VydENoYW5nZSkge1xuICAgICAgICByZWNvcmRlci5pbnNlcnRMZWZ0KGNoYW5nZS5wb3MsIGNoYW5nZS50b0FkZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGhvc3QuY29tbWl0VXBkYXRlKHJlY29yZGVyKTtcblxuICAgIHJldHVybiBob3N0O1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb21pdDxUIGV4dGVuZHMgeyBba2V5OiBzdHJpbmddOiBhbnkgfT4oXG4gIG9iamVjdDogVCxcbiAga2V5VG9SZW1vdmU6IGtleW9mIFRcbik6IFBhcnRpYWw8VD4ge1xuICByZXR1cm4gT2JqZWN0LmtleXMob2JqZWN0KVxuICAgIC5maWx0ZXIoa2V5ID0+IGtleSAhPT0ga2V5VG9SZW1vdmUpXG4gICAgLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IE9iamVjdC5hc3NpZ24ocmVzdWx0LCB7IFtrZXldOiBvYmplY3Rba2V5XSB9KSwge30pO1xufVxuIl19