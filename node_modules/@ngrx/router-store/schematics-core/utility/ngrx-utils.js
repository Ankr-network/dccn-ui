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
        define("@ngrx/router-store/schematics-core/utility/ngrx-utils", ["require", "exports", "typescript", "@ngrx/router-store/schematics-core/utility/strings", "@ngrx/router-store/schematics-core/utility/change", "@angular-devkit/schematics", "@angular-devkit/core", "@ngrx/router-store/schematics-core/utility/find-module", "@ngrx/router-store/schematics-core/utility/route-utils", "@ngrx/router-store/schematics-core/utility/ast-utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("typescript");
    var stringUtils = require("@ngrx/router-store/schematics-core/utility/strings");
    var change_1 = require("@ngrx/router-store/schematics-core/utility/change");
    var schematics_1 = require("@angular-devkit/schematics");
    var core_1 = require("@angular-devkit/core");
    var find_module_1 = require("@ngrx/router-store/schematics-core/utility/find-module");
    var route_utils_1 = require("@ngrx/router-store/schematics-core/utility/route-utils");
    var ast_utils_1 = require("@ngrx/router-store/schematics-core/utility/ast-utils");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdyeC11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvcm91dGVyLXN0b3JlL3NjaGVtYXRpY3MtY29yZS91dGlsaXR5L25ncngtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSwrQkFBaUM7SUFDakMsZ0ZBQXlDO0lBQ3pDLDRFQUE0RDtJQUM1RCx5REFBNkU7SUFDN0UsNkNBQWlEO0lBQ2pELHNGQUFrRDtJQUNsRCxzRkFBNkM7SUFDN0Msa0ZBQWdEO0lBRWhELDJCQUFrQyxPQUFZO1FBQzVDLE1BQU0sQ0FBQyxVQUFDLElBQVU7WUFDaEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNkLENBQUM7WUFFRCxJQUFNLFlBQVksR0FBRyxnQkFBUyxDQUFDLE1BQUksT0FBTyxDQUFDLElBQUksU0FBSSxPQUFPLENBQUMsUUFBVSxDQUFDLENBQUM7WUFFdkUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1lBQzVELENBQUM7WUFFRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixNQUFNLElBQUksZ0NBQW1CLENBQUMsVUFBUSxZQUFZLHFCQUFrQixDQUFDLENBQUM7WUFDeEUsQ0FBQztZQUVELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFMUMsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUNoQyxZQUFZLEVBQ1osVUFBVSxFQUNWLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUN0QixJQUFJLENBQ0wsQ0FBQztZQUVGLElBQU0sV0FBVyxHQUNmLE1BQUksT0FBTyxDQUFDLElBQUksTUFBRztnQkFDbkIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztnQkFDL0QsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDbEMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUNuQyxVQUFVLENBQUM7WUFFYixJQUFNLFlBQVksR0FBRywrQkFBaUIsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDbEUsSUFBTSxhQUFhLEdBQUcsMEJBQVksQ0FDaEMsTUFBTSxFQUNOLFlBQVksRUFDWixjQUFZLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRyxFQUNoRCxZQUFZLEVBQ1osSUFBSSxDQUNMLENBQUM7WUFFRixJQUFNLG9CQUFvQixHQUFHLDBCQUEwQixDQUNyRCxNQUFNLEVBQ04sWUFBWSxFQUNaLE9BQU8sQ0FDUixDQUFDO1lBQ0YsSUFBTSxnQkFBZ0IsR0FBRyw0QkFBNEIsQ0FDbkQsTUFBTSxFQUNOLFlBQVksRUFDWixPQUFPLENBQ1IsQ0FBQztZQUVGLElBQU0sT0FBTyxHQUFHLENBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDeEUsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7Z0JBQ2hELEdBQUcsQ0FBQyxDQUFpQixJQUFBLFlBQUEsU0FBQSxPQUFPLENBQUEsZ0NBQUE7b0JBQXZCLElBQU0sTUFBTSxvQkFBQTtvQkFDZixFQUFFLENBQUMsQ0FBQyxNQUFNLFlBQVkscUJBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ25DLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2hELENBQUM7aUJBQ0Y7Ozs7Ozs7OztZQUNELElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFNUIsTUFBTSxDQUFDLElBQUksQ0FBQzs7UUFDZCxDQUFDLENBQUM7SUFDSixDQUFDO0lBaEVELDhDQWdFQztJQUVEOztPQUVHO0lBQ0gsb0NBQ0UsTUFBcUIsRUFDckIsWUFBb0IsRUFDcEIsT0FBeUI7UUFFekIsSUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQzNDLFVBQUEsR0FBRyxJQUFJLE9BQUEsR0FBRyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUEvQyxDQUErQyxDQUN2RCxDQUFDO1FBQ0YsSUFBSSxJQUFJLEdBQUcsY0FBOEIsQ0FBQztRQUUxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVixNQUFNLENBQUMsSUFBSSxtQkFBVSxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVELElBQU0sU0FBUyxHQUNiLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztZQUNsQyxRQUFRO1lBQ1IsV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ2xDLFNBQVMsQ0FBQztRQUNaLElBQU0sSUFBSSxHQUFHLElBQVcsQ0FBQztRQUN6QixJQUFJLFFBQVEsQ0FBQztRQUNiLElBQUksUUFBUSxDQUFDO1FBRWIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM3QixRQUFRLEdBQUcsT0FBSyxTQUFTLE9BQUksQ0FBQztRQUNoQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3QyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM3QixtREFBbUQ7WUFDbkQsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRTNDLEVBQUUsQ0FBQyxDQUFDLE9BQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsUUFBUSxHQUFHLEtBQUcsT0FBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsT0FBSSxDQUFDO1lBQzVDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixRQUFRLEdBQUcsT0FBSyxTQUFXLENBQUM7WUFDOUIsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxxQkFBWSxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQXpDRCxnRUF5Q0M7SUFFRDs7T0FFRztJQUNILHNDQUNFLE1BQXFCLEVBQ3JCLFlBQW9CLEVBQ3BCLE9BQXlCO1FBRXpCLElBQUksV0FBZ0IsQ0FBQztRQUNyQixJQUFNLGdCQUFnQixHQUFRLE1BQU0sQ0FBQyxVQUFVO2FBQzVDLE1BQU0sQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLEdBQUcsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBNUMsQ0FBNEMsQ0FBQzthQUMzRCxNQUFNLENBQUMsVUFBQyxHQUFRLElBQUssT0FBQSxDQUFDLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBckIsQ0FBcUIsQ0FBQzthQUMzQyxHQUFHLENBQUMsVUFBQyxHQUFRO1lBRVYsSUFBQSwrQ0FBWSxDQUdVO1lBQ3hCLElBQU0sUUFBUSxHQUFRLFlBQVksQ0FBQyxJQUFJLENBQ3JDLFVBQUMsSUFBUyxJQUFLLE9BQUEsSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUEvQyxDQUErQyxDQUMvRCxDQUFDO1lBQ0YsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFM0MsTUFBTSxDQUFDLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxNQUFBLEVBQUUsQ0FBQztRQUNyRCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsVUFBQyxFQUFRO2dCQUFOLGNBQUk7WUFBTyxPQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLGtCQUFrQjtRQUF6QyxDQUF5QyxDQUFDLENBQUM7UUFFakUsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLElBQUksbUJBQVUsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxJQUFJLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUM7UUFFeEMsSUFBTSxTQUFTLEdBQ2IsV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ2xDLFFBQVE7WUFDUixXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDbEMsV0FBVyxDQUFDO1FBQ2QsSUFBTSxJQUFJLEdBQUcsSUFBVyxDQUFDO1FBQ3pCLElBQUksUUFBUSxDQUFDO1FBQ2IsSUFBSSxRQUFRLENBQUM7UUFFYixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLFFBQVEsR0FBRyxPQUFLLFNBQVMsT0FBSSxDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25ELFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLG1EQUFtRDtZQUNuRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFM0MsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixRQUFRLEdBQUcsT0FBSyxPQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBVyxDQUFDO1lBQzVDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixRQUFRLEdBQUcsT0FBSyxTQUFXLENBQUM7WUFDOUIsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxxQkFBWSxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQXpERCxvRUF5REM7SUFFRDs7T0FFRztJQUNILG9DQUEyQyxPQUFZO1FBQ3JELE1BQU0sQ0FBQyxVQUFDLElBQVU7WUFDaEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNkLENBQUM7WUFFRCxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFDckQsQ0FBQztZQUVELElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbkMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQyxVQUFRLFVBQVUscUJBQWtCLENBQUMsQ0FBQztZQUN0RSxDQUFDO1lBQ0QsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUxQyxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQ2hDLFVBQVUsRUFDVixVQUFVLEVBQ1YsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQ3RCLElBQUksQ0FDTCxDQUFDO1lBRUYsSUFBTSxhQUFhLEdBQUc7Z0JBQ3BCLDBCQUFZLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFDO2FBQy9ELENBQUM7WUFFRixJQUFNLFdBQVcsR0FDZixNQUFJLE9BQU8sQ0FBQyxJQUFJLE1BQUc7Z0JBQ25CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7Z0JBQy9ELENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztnQkFDbkMsVUFBVSxDQUFDO1lBQ2IsSUFBTSxZQUFZLEdBQUcsK0JBQWlCLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2hFLElBQU0sYUFBYSxHQUFHLDBCQUFZLENBQ2hDLE1BQU0sRUFDTixVQUFVLEVBQ1YsY0FBWSxXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUcsRUFDaEQsWUFBWSxFQUNaLElBQUksQ0FDTCxDQUFDO1lBQ0ksSUFBQSwrTUFPTCxFQVBNLDJCQUFtQixDQU94QjtZQUNGLElBQU0sT0FBTyxZQUFPLGFBQWEsR0FBRSxhQUFhLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQztZQUN2RSxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztnQkFDOUMsR0FBRyxDQUFDLENBQWlCLElBQUEsWUFBQSxTQUFBLE9BQU8sQ0FBQSxnQ0FBQTtvQkFBdkIsSUFBTSxNQUFNLG9CQUFBO29CQUNmLEVBQUUsQ0FBQyxDQUFDLE1BQU0sWUFBWSxxQkFBWSxDQUFDLENBQUMsQ0FBQzt3QkFDbkMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDaEQsQ0FBQztpQkFDRjs7Ozs7Ozs7O1lBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU1QixNQUFNLENBQUMsSUFBSSxDQUFDOztRQUNkLENBQUMsQ0FBQztJQUNKLENBQUM7SUE3REQsZ0VBNkRDO0lBRUQsY0FDRSxNQUFTLEVBQ1QsV0FBb0I7UUFFcEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ3ZCLE1BQU0sQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLEdBQUcsS0FBSyxXQUFXLEVBQW5CLENBQW1CLENBQUM7YUFDbEMsTUFBTSxDQUFDLFVBQUMsTUFBTSxFQUFFLEdBQUc7WUFBSyxPQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxZQUFJLEdBQUMsR0FBRyxJQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBRzs7UUFBN0MsQ0FBNkMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBUEQsb0JBT0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIHN0cmluZ1V0aWxzIGZyb20gJy4vc3RyaW5ncyc7XG5pbXBvcnQgeyBJbnNlcnRDaGFuZ2UsIENoYW5nZSwgTm9vcENoYW5nZSB9IGZyb20gJy4vY2hhbmdlJztcbmltcG9ydCB7IFRyZWUsIFNjaGVtYXRpY3NFeGNlcHRpb24sIFJ1bGUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBub3JtYWxpemUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBidWlsZFJlbGF0aXZlUGF0aCB9IGZyb20gJy4vZmluZC1tb2R1bGUnO1xuaW1wb3J0IHsgaW5zZXJ0SW1wb3J0IH0gZnJvbSAnLi9yb3V0ZS11dGlscyc7XG5pbXBvcnQgeyBhZGRJbXBvcnRUb01vZHVsZSB9IGZyb20gJy4vYXN0LXV0aWxzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlZHVjZXJUb1N0YXRlKG9wdGlvbnM6IGFueSk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBpZiAoIW9wdGlvbnMucmVkdWNlcnMpIHtcbiAgICAgIHJldHVybiBob3N0O1xuICAgIH1cblxuICAgIGNvbnN0IHJlZHVjZXJzUGF0aCA9IG5vcm1hbGl6ZShgLyR7b3B0aW9ucy5wYXRofS8ke29wdGlvbnMucmVkdWNlcnN9YCk7XG5cbiAgICBpZiAoIWhvc3QuZXhpc3RzKHJlZHVjZXJzUGF0aCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU3BlY2lmaWVkIHJlZHVjZXJzIHBhdGggZG9lcyBub3QgZXhpc3QnKTtcbiAgICB9XG5cbiAgICBjb25zdCB0ZXh0ID0gaG9zdC5yZWFkKHJlZHVjZXJzUGF0aCk7XG4gICAgaWYgKHRleHQgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBGaWxlICR7cmVkdWNlcnNQYXRofSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBzb3VyY2VUZXh0ID0gdGV4dC50b1N0cmluZygndXRmLTgnKTtcblxuICAgIGNvbnN0IHNvdXJjZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICByZWR1Y2Vyc1BhdGgsXG4gICAgICBzb3VyY2VUZXh0LFxuICAgICAgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCxcbiAgICAgIHRydWVcbiAgICApO1xuXG4gICAgY29uc3QgcmVkdWNlclBhdGggPVxuICAgICAgYC8ke29wdGlvbnMucGF0aH0vYCArXG4gICAgICAob3B0aW9ucy5mbGF0ID8gJycgOiBzdHJpbmdVdGlscy5kYXNoZXJpemUob3B0aW9ucy5uYW1lKSArICcvJykgK1xuICAgICAgKG9wdGlvbnMuZ3JvdXAgPyAncmVkdWNlcnMvJyA6ICcnKSArXG4gICAgICBzdHJpbmdVdGlscy5kYXNoZXJpemUob3B0aW9ucy5uYW1lKSArXG4gICAgICAnLnJlZHVjZXInO1xuXG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gYnVpbGRSZWxhdGl2ZVBhdGgocmVkdWNlcnNQYXRoLCByZWR1Y2VyUGF0aCk7XG4gICAgY29uc3QgcmVkdWNlckltcG9ydCA9IGluc2VydEltcG9ydChcbiAgICAgIHNvdXJjZSxcbiAgICAgIHJlZHVjZXJzUGF0aCxcbiAgICAgIGAqIGFzIGZyb20ke3N0cmluZ1V0aWxzLmNsYXNzaWZ5KG9wdGlvbnMubmFtZSl9YCxcbiAgICAgIHJlbGF0aXZlUGF0aCxcbiAgICAgIHRydWVcbiAgICApO1xuXG4gICAgY29uc3Qgc3RhdGVJbmZlcmZhY2VJbnNlcnQgPSBhZGRSZWR1Y2VyVG9TdGF0ZUluZmVyZmFjZShcbiAgICAgIHNvdXJjZSxcbiAgICAgIHJlZHVjZXJzUGF0aCxcbiAgICAgIG9wdGlvbnNcbiAgICApO1xuICAgIGNvbnN0IHJlZHVjZXJNYXBJbnNlcnQgPSBhZGRSZWR1Y2VyVG9BY3Rpb25SZWR1Y2VyTWFwKFxuICAgICAgc291cmNlLFxuICAgICAgcmVkdWNlcnNQYXRoLFxuICAgICAgb3B0aW9uc1xuICAgICk7XG5cbiAgICBjb25zdCBjaGFuZ2VzID0gW3JlZHVjZXJJbXBvcnQsIHN0YXRlSW5mZXJmYWNlSW5zZXJ0LCByZWR1Y2VyTWFwSW5zZXJ0XTtcbiAgICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUocmVkdWNlcnNQYXRoKTtcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzKSB7XG4gICAgICBpZiAoY2hhbmdlIGluc3RhbmNlb2YgSW5zZXJ0Q2hhbmdlKSB7XG4gICAgICAgIHJlY29yZGVyLmluc2VydExlZnQoY2hhbmdlLnBvcywgY2hhbmdlLnRvQWRkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaG9zdC5jb21taXRVcGRhdGUocmVjb3JkZXIpO1xuXG4gICAgcmV0dXJuIGhvc3Q7XG4gIH07XG59XG5cbi8qKlxuICogSW5zZXJ0IHRoZSByZWR1Y2VyIGludG8gdGhlIGZpcnN0IGRlZmluZWQgdG9wIGxldmVsIGludGVyZmFjZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkUmVkdWNlclRvU3RhdGVJbmZlcmZhY2UoXG4gIHNvdXJjZTogdHMuU291cmNlRmlsZSxcbiAgcmVkdWNlcnNQYXRoOiBzdHJpbmcsXG4gIG9wdGlvbnM6IHsgbmFtZTogc3RyaW5nIH1cbik6IENoYW5nZSB7XG4gIGNvbnN0IHN0YXRlSW50ZXJmYWNlID0gc291cmNlLnN0YXRlbWVudHMuZmluZChcbiAgICBzdG0gPT4gc3RtLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb25cbiAgKTtcbiAgbGV0IG5vZGUgPSBzdGF0ZUludGVyZmFjZSBhcyB0cy5TdGF0ZW1lbnQ7XG5cbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIG5ldyBOb29wQ2hhbmdlKCk7XG4gIH1cblxuICBjb25zdCBrZXlJbnNlcnQgPVxuICAgIHN0cmluZ1V0aWxzLmNhbWVsaXplKG9wdGlvbnMubmFtZSkgK1xuICAgICc6IGZyb20nICtcbiAgICBzdHJpbmdVdGlscy5jbGFzc2lmeShvcHRpb25zLm5hbWUpICtcbiAgICAnLlN0YXRlOyc7XG4gIGNvbnN0IGV4cHIgPSBub2RlIGFzIGFueTtcbiAgbGV0IHBvc2l0aW9uO1xuICBsZXQgdG9JbnNlcnQ7XG5cbiAgaWYgKGV4cHIubWVtYmVycy5sZW5ndGggPT09IDApIHtcbiAgICBwb3NpdGlvbiA9IGV4cHIuZ2V0RW5kKCkgLSAxO1xuICAgIHRvSW5zZXJ0ID0gYCAgJHtrZXlJbnNlcnR9XFxuYDtcbiAgfSBlbHNlIHtcbiAgICBub2RlID0gZXhwci5tZW1iZXJzW2V4cHIubWVtYmVycy5sZW5ndGggLSAxXTtcbiAgICBwb3NpdGlvbiA9IG5vZGUuZ2V0RW5kKCkgKyAxO1xuICAgIC8vIEdldCB0aGUgaW5kZW50YXRpb24gb2YgdGhlIGxhc3QgZWxlbWVudCwgaWYgYW55LlxuICAgIGNvbnN0IHRleHQgPSBub2RlLmdldEZ1bGxUZXh0KHNvdXJjZSk7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHRleHQubWF0Y2goL15cXHI/XFxuKyhcXHMqKS8pO1xuXG4gICAgaWYgKG1hdGNoZXMhLmxlbmd0aCA+IDApIHtcbiAgICAgIHRvSW5zZXJ0ID0gYCR7bWF0Y2hlcyFbMV19JHtrZXlJbnNlcnR9XFxuYDtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9JbnNlcnQgPSBgXFxuJHtrZXlJbnNlcnR9YDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IEluc2VydENoYW5nZShyZWR1Y2Vyc1BhdGgsIHBvc2l0aW9uLCB0b0luc2VydCk7XG59XG5cbi8qKlxuICogSW5zZXJ0IHRoZSByZWR1Y2VyIGludG8gdGhlIEFjdGlvblJlZHVjZXJNYXBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlZHVjZXJUb0FjdGlvblJlZHVjZXJNYXAoXG4gIHNvdXJjZTogdHMuU291cmNlRmlsZSxcbiAgcmVkdWNlcnNQYXRoOiBzdHJpbmcsXG4gIG9wdGlvbnM6IHsgbmFtZTogc3RyaW5nIH1cbik6IENoYW5nZSB7XG4gIGxldCBpbml0aWFsaXplcjogYW55O1xuICBjb25zdCBhY3Rpb25SZWR1Y2VyTWFwOiBhbnkgPSBzb3VyY2Uuc3RhdGVtZW50c1xuICAgIC5maWx0ZXIoc3RtID0+IHN0bS5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50KVxuICAgIC5maWx0ZXIoKHN0bTogYW55KSA9PiAhIXN0bS5kZWNsYXJhdGlvbkxpc3QpXG4gICAgLm1hcCgoc3RtOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgZGVjbGFyYXRpb25zLFxuICAgICAgfToge1xuICAgICAgICBkZWNsYXJhdGlvbnM6IHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbkxpc3RbXTtcbiAgICAgIH0gPSBzdG0uZGVjbGFyYXRpb25MaXN0O1xuICAgICAgY29uc3QgdmFyaWFibGU6IGFueSA9IGRlY2xhcmF0aW9ucy5maW5kKFxuICAgICAgICAoZGVjbDogYW55KSA9PiBkZWNsLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvblxuICAgICAgKTtcbiAgICAgIGNvbnN0IHR5cGUgPSB2YXJpYWJsZSA/IHZhcmlhYmxlLnR5cGUgOiB7fTtcblxuICAgICAgcmV0dXJuIHsgaW5pdGlhbGl6ZXI6IHZhcmlhYmxlLmluaXRpYWxpemVyLCB0eXBlIH07XG4gICAgfSlcbiAgICAuZmluZCgoeyB0eXBlIH0pID0+IHR5cGUudHlwZU5hbWUudGV4dCA9PT0gJ0FjdGlvblJlZHVjZXJNYXAnKTtcblxuICBpZiAoIWFjdGlvblJlZHVjZXJNYXAgfHwgIWFjdGlvblJlZHVjZXJNYXAuaW5pdGlhbGl6ZXIpIHtcbiAgICByZXR1cm4gbmV3IE5vb3BDaGFuZ2UoKTtcbiAgfVxuXG4gIGxldCBub2RlID0gYWN0aW9uUmVkdWNlck1hcC5pbml0aWFsaXplcjtcblxuICBjb25zdCBrZXlJbnNlcnQgPVxuICAgIHN0cmluZ1V0aWxzLmNhbWVsaXplKG9wdGlvbnMubmFtZSkgK1xuICAgICc6IGZyb20nICtcbiAgICBzdHJpbmdVdGlscy5jbGFzc2lmeShvcHRpb25zLm5hbWUpICtcbiAgICAnLnJlZHVjZXIsJztcbiAgY29uc3QgZXhwciA9IG5vZGUgYXMgYW55O1xuICBsZXQgcG9zaXRpb247XG4gIGxldCB0b0luc2VydDtcblxuICBpZiAoZXhwci5wcm9wZXJ0aWVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHBvc2l0aW9uID0gZXhwci5nZXRFbmQoKSAtIDE7XG4gICAgdG9JbnNlcnQgPSBgICAke2tleUluc2VydH1cXG5gO1xuICB9IGVsc2Uge1xuICAgIG5vZGUgPSBleHByLnByb3BlcnRpZXNbZXhwci5wcm9wZXJ0aWVzLmxlbmd0aCAtIDFdO1xuICAgIHBvc2l0aW9uID0gbm9kZS5nZXRFbmQoKSArIDE7XG4gICAgLy8gR2V0IHRoZSBpbmRlbnRhdGlvbiBvZiB0aGUgbGFzdCBlbGVtZW50LCBpZiBhbnkuXG4gICAgY29uc3QgdGV4dCA9IG5vZGUuZ2V0RnVsbFRleHQoc291cmNlKTtcbiAgICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaCgvXlxccj9cXG4rKFxccyopLyk7XG5cbiAgICBpZiAobWF0Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0b0luc2VydCA9IGBcXG4ke21hdGNoZXMhWzFdfSR7a2V5SW5zZXJ0fWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvSW5zZXJ0ID0gYFxcbiR7a2V5SW5zZXJ0fWA7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBJbnNlcnRDaGFuZ2UocmVkdWNlcnNQYXRoLCBwb3NpdGlvbiwgdG9JbnNlcnQpO1xufVxuXG4vKipcbiAqIEFkZCByZWR1Y2VyIGZlYXR1cmUgdG8gTmdNb2R1bGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlZHVjZXJJbXBvcnRUb05nTW9kdWxlKG9wdGlvbnM6IGFueSk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBpZiAoIW9wdGlvbnMubW9kdWxlKSB7XG4gICAgICByZXR1cm4gaG9zdDtcbiAgICB9XG5cbiAgICBjb25zdCBtb2R1bGVQYXRoID0gb3B0aW9ucy5tb2R1bGU7XG4gICAgaWYgKCFob3N0LmV4aXN0cyhvcHRpb25zLm1vZHVsZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU3BlY2lmaWVkIG1vZHVsZSBkb2VzIG5vdCBleGlzdCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHRleHQgPSBob3N0LnJlYWQobW9kdWxlUGF0aCk7XG4gICAgaWYgKHRleHQgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBGaWxlICR7bW9kdWxlUGF0aH0gZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgfVxuICAgIGNvbnN0IHNvdXJjZVRleHQgPSB0ZXh0LnRvU3RyaW5nKCd1dGYtOCcpO1xuXG4gICAgY29uc3Qgc291cmNlID0gdHMuY3JlYXRlU291cmNlRmlsZShcbiAgICAgIG1vZHVsZVBhdGgsXG4gICAgICBzb3VyY2VUZXh0LFxuICAgICAgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCxcbiAgICAgIHRydWVcbiAgICApO1xuXG4gICAgY29uc3QgY29tbW9uSW1wb3J0cyA9IFtcbiAgICAgIGluc2VydEltcG9ydChzb3VyY2UsIG1vZHVsZVBhdGgsICdTdG9yZU1vZHVsZScsICdAbmdyeC9zdG9yZScpLFxuICAgIF07XG5cbiAgICBjb25zdCByZWR1Y2VyUGF0aCA9XG4gICAgICBgLyR7b3B0aW9ucy5wYXRofS9gICtcbiAgICAgIChvcHRpb25zLmZsYXQgPyAnJyA6IHN0cmluZ1V0aWxzLmRhc2hlcml6ZShvcHRpb25zLm5hbWUpICsgJy8nKSArXG4gICAgICAob3B0aW9ucy5ncm91cCA/ICdyZWR1Y2Vycy8nIDogJycpICtcbiAgICAgIHN0cmluZ1V0aWxzLmRhc2hlcml6ZShvcHRpb25zLm5hbWUpICtcbiAgICAgICcucmVkdWNlcic7XG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gYnVpbGRSZWxhdGl2ZVBhdGgobW9kdWxlUGF0aCwgcmVkdWNlclBhdGgpO1xuICAgIGNvbnN0IHJlZHVjZXJJbXBvcnQgPSBpbnNlcnRJbXBvcnQoXG4gICAgICBzb3VyY2UsXG4gICAgICBtb2R1bGVQYXRoLFxuICAgICAgYCogYXMgZnJvbSR7c3RyaW5nVXRpbHMuY2xhc3NpZnkob3B0aW9ucy5uYW1lKX1gLFxuICAgICAgcmVsYXRpdmVQYXRoLFxuICAgICAgdHJ1ZVxuICAgICk7XG4gICAgY29uc3QgW3N0b3JlTmdNb2R1bGVJbXBvcnRdID0gYWRkSW1wb3J0VG9Nb2R1bGUoXG4gICAgICBzb3VyY2UsXG4gICAgICBtb2R1bGVQYXRoLFxuICAgICAgYFN0b3JlTW9kdWxlLmZvckZlYXR1cmUoJyR7c3RyaW5nVXRpbHMuY2FtZWxpemUoXG4gICAgICAgIG9wdGlvbnMubmFtZVxuICAgICAgKX0nLCBmcm9tJHtzdHJpbmdVdGlscy5jbGFzc2lmeShvcHRpb25zLm5hbWUpfS5yZWR1Y2VyKWAsXG4gICAgICByZWxhdGl2ZVBhdGhcbiAgICApO1xuICAgIGNvbnN0IGNoYW5nZXMgPSBbLi4uY29tbW9uSW1wb3J0cywgcmVkdWNlckltcG9ydCwgc3RvcmVOZ01vZHVsZUltcG9ydF07XG4gICAgY29uc3QgcmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKG1vZHVsZVBhdGgpO1xuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXMpIHtcbiAgICAgIGlmIChjaGFuZ2UgaW5zdGFuY2VvZiBJbnNlcnRDaGFuZ2UpIHtcbiAgICAgICAgcmVjb3JkZXIuaW5zZXJ0TGVmdChjaGFuZ2UucG9zLCBjaGFuZ2UudG9BZGQpO1xuICAgICAgfVxuICAgIH1cbiAgICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9taXQ8VCBleHRlbmRzIHsgW2tleTogc3RyaW5nXTogYW55IH0+KFxuICBvYmplY3Q6IFQsXG4gIGtleVRvUmVtb3ZlOiBrZXlvZiBUXG4pOiBQYXJ0aWFsPFQ+IHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG9iamVjdClcbiAgICAuZmlsdGVyKGtleSA9PiBrZXkgIT09IGtleVRvUmVtb3ZlKVxuICAgIC5yZWR1Y2UoKHJlc3VsdCwga2V5KSA9PiBPYmplY3QuYXNzaWduKHJlc3VsdCwgeyBba2V5XTogb2JqZWN0W2tleV0gfSksIHt9KTtcbn1cbiJdfQ==