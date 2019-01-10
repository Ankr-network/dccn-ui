/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { identifierName, sanitizeIdentifier } from '../../compile_metadata';
import { BindingForm, convertActionBinding, convertPropertyBinding } from '../../compiler_util/expression_converter';
import * as core from '../../core';
import { LifecycleHooks } from '../../lifecycle_reflector';
import * as o from '../../output/output_ast';
import { typeSourceSpan } from '../../parse_util';
import { CssSelector, SelectorMatcher } from '../../selector';
import { error } from '../../util';
import { compileFactoryFunction, dependenciesFromGlobalMetadata } from '../r3_factory';
import { Identifiers as R3 } from '../r3_identifiers';
import { typeWithParameters } from '../util';
import { BindingScope, TemplateDefinitionBuilder, renderFlagCheckIfStmt } from './template';
import { CONTEXT_NAME, DefinitionMap, RENDER_FLAGS, TEMPORARY_NAME, asLiteral, conditionallyCreateMapObjectLiteral, getQueryPredicate, temporaryAllocator } from './util';
function baseDirectiveFields(meta, constantPool, bindingParser) {
    var definitionMap = new DefinitionMap();
    // e.g. `type: MyDirective`
    definitionMap.set('type', meta.type);
    // e.g. `selectors: [['', 'someDir', '']]`
    definitionMap.set('selectors', createDirectiveSelector(meta.selector));
    // e.g. `factory: () => new MyApp(injectElementRef())`
    definitionMap.set('factory', compileFactoryFunction({
        name: meta.name,
        fnOrClass: meta.type,
        deps: meta.deps,
        useNew: true,
        injectFn: R3.directiveInject,
    }));
    definitionMap.set('contentQueries', createContentQueriesFunction(meta, constantPool));
    definitionMap.set('contentQueriesRefresh', createContentQueriesRefreshFunction(meta));
    // e.g. `hostBindings: (dirIndex, elIndex) => { ... }
    definitionMap.set('hostBindings', createHostBindingsFunction(meta, bindingParser));
    // e.g. `attributes: ['role', 'listbox']`
    definitionMap.set('attributes', createHostAttributesArray(meta));
    // e.g 'inputs: {a: 'a'}`
    definitionMap.set('inputs', conditionallyCreateMapObjectLiteral(meta.inputs));
    // e.g 'outputs: {a: 'a'}`
    definitionMap.set('outputs', conditionallyCreateMapObjectLiteral(meta.outputs));
    // e.g. `features: [NgOnChangesFeature]`
    var features = [];
    if (meta.usesInheritance) {
        features.push(o.importExpr(R3.InheritDefinitionFeature));
    }
    if (meta.lifecycle.usesOnChanges) {
        features.push(o.importExpr(R3.NgOnChangesFeature));
    }
    if (features.length) {
        definitionMap.set('features', o.literalArr(features));
    }
    return definitionMap;
}
/**
 * Compile a directive for the render3 runtime as defined by the `R3DirectiveMetadata`.
 */
export function compileDirectiveFromMetadata(meta, constantPool, bindingParser) {
    var definitionMap = baseDirectiveFields(meta, constantPool, bindingParser);
    var expression = o.importExpr(R3.defineDirective).callFn([definitionMap.toLiteralMap()]);
    // On the type side, remove newlines from the selector as it will need to fit into a TypeScript
    // string literal, which must be on one line.
    var selectorForType = (meta.selector || '').replace(/\n/g, '');
    var type = new o.ExpressionType(o.importExpr(R3.DirectiveDef, [
        typeWithParameters(meta.type, meta.typeArgumentCount),
        new o.ExpressionType(o.literal(selectorForType))
    ]));
    return { expression: expression, type: type };
}
/**
 * Compile a component for the render3 runtime as defined by the `R3ComponentMetadata`.
 */
export function compileComponentFromMetadata(meta, constantPool, bindingParser) {
    var definitionMap = baseDirectiveFields(meta, constantPool, bindingParser);
    var selector = meta.selector && CssSelector.parse(meta.selector);
    var firstSelector = selector && selector[0];
    // e.g. `attr: ["class", ".my.app"]`
    // This is optional an only included if the first selector of a component specifies attributes.
    if (firstSelector) {
        var selectorAttributes = firstSelector.getAttrs();
        if (selectorAttributes.length) {
            definitionMap.set('attrs', constantPool.getConstLiteral(o.literalArr(selectorAttributes.map(function (value) { return value != null ? o.literal(value) : o.literal(undefined); })), 
            /* forceShared */ true));
        }
    }
    // Generate the CSS matcher that recognize directive
    var directiveMatcher = null;
    if (meta.directives.size) {
        var matcher_1 = new SelectorMatcher();
        meta.directives.forEach(function (expression, selector) {
            matcher_1.addSelectables(CssSelector.parse(selector), expression);
        });
        directiveMatcher = matcher_1;
    }
    if (meta.viewQueries.length) {
        definitionMap.set('viewQuery', createViewQueriesFunction(meta, constantPool));
    }
    // e.g. `template: function MyComponent_Template(_ctx, _cm) {...}`
    var templateTypeName = meta.name;
    var templateName = templateTypeName ? templateTypeName + "_Template" : null;
    var directivesUsed = new Set();
    var pipesUsed = new Set();
    var template = meta.template;
    var templateFunctionExpression = new TemplateDefinitionBuilder(constantPool, CONTEXT_NAME, BindingScope.ROOT_SCOPE, 0, templateTypeName, templateName, meta.viewQueries, directiveMatcher, directivesUsed, meta.pipes, pipesUsed, R3.namespaceHTML)
        .buildTemplateFunction(template.nodes, [], template.hasNgContent, template.ngContentSelectors);
    definitionMap.set('template', templateFunctionExpression);
    // e.g. `directives: [MyDirective]`
    if (directivesUsed.size) {
        definitionMap.set('directives', o.literalArr(Array.from(directivesUsed)));
    }
    // e.g. `pipes: [MyPipe]`
    if (pipesUsed.size) {
        definitionMap.set('pipes', o.literalArr(Array.from(pipesUsed)));
    }
    // On the type side, remove newlines from the selector as it will need to fit into a TypeScript
    // string literal, which must be on one line.
    var selectorForType = (meta.selector || '').replace(/\n/g, '');
    var expression = o.importExpr(R3.defineComponent).callFn([definitionMap.toLiteralMap()]);
    var type = new o.ExpressionType(o.importExpr(R3.ComponentDef, [
        typeWithParameters(meta.type, meta.typeArgumentCount),
        new o.ExpressionType(o.literal(selectorForType))
    ]));
    return { expression: expression, type: type };
}
/**
 * A wrapper around `compileDirective` which depends on render2 global analysis data as its input
 * instead of the `R3DirectiveMetadata`.
 *
 * `R3DirectiveMetadata` is computed from `CompileDirectiveMetadata` and other statically reflected
 * information.
 */
export function compileDirectiveFromRender2(outputCtx, directive, reflector, bindingParser) {
    var name = identifierName(directive.type);
    name || error("Cannot resolver the name of " + directive.type);
    var definitionField = outputCtx.constantPool.propertyNameOf(1 /* Directive */);
    var meta = directiveMetadataFromGlobalMetadata(directive, outputCtx, reflector);
    var res = compileDirectiveFromMetadata(meta, outputCtx.constantPool, bindingParser);
    // Create the partial class to be merged with the actual class.
    outputCtx.statements.push(new o.ClassStmt(name, null, [new o.ClassField(definitionField, o.INFERRED_TYPE, [o.StmtModifier.Static], res.expression)], [], new o.ClassMethod(null, [], []), []));
}
/**
 * A wrapper around `compileComponent` which depends on render2 global analysis data as its input
 * instead of the `R3DirectiveMetadata`.
 *
 * `R3ComponentMetadata` is computed from `CompileDirectiveMetadata` and other statically reflected
 * information.
 */
export function compileComponentFromRender2(outputCtx, component, render3Ast, reflector, bindingParser, directiveTypeBySel, pipeTypeByName) {
    var name = identifierName(component.type);
    name || error("Cannot resolver the name of " + component.type);
    var definitionField = outputCtx.constantPool.propertyNameOf(2 /* Component */);
    var summary = component.toSummary();
    // Compute the R3ComponentMetadata from the CompileDirectiveMetadata
    var meta = tslib_1.__assign({}, directiveMetadataFromGlobalMetadata(component, outputCtx, reflector), { selector: component.selector, template: {
            nodes: render3Ast.nodes,
            hasNgContent: render3Ast.hasNgContent,
            ngContentSelectors: render3Ast.ngContentSelectors,
        }, directives: typeMapToExpressionMap(directiveTypeBySel, outputCtx), pipes: typeMapToExpressionMap(pipeTypeByName, outputCtx), viewQueries: queriesFromGlobalMetadata(component.viewQueries, outputCtx) });
    var res = compileComponentFromMetadata(meta, outputCtx.constantPool, bindingParser);
    // Create the partial class to be merged with the actual class.
    outputCtx.statements.push(new o.ClassStmt(name, null, [new o.ClassField(definitionField, o.INFERRED_TYPE, [o.StmtModifier.Static], res.expression)], [], new o.ClassMethod(null, [], []), []));
}
/**
 * Compute `R3DirectiveMetadata` given `CompileDirectiveMetadata` and a `CompileReflector`.
 */
function directiveMetadataFromGlobalMetadata(directive, outputCtx, reflector) {
    var summary = directive.toSummary();
    var name = identifierName(directive.type);
    name || error("Cannot resolver the name of " + directive.type);
    return {
        name: name,
        type: outputCtx.importExpr(directive.type.reference),
        typeArgumentCount: 0,
        typeSourceSpan: typeSourceSpan(directive.isComponent ? 'Component' : 'Directive', directive.type),
        selector: directive.selector,
        deps: dependenciesFromGlobalMetadata(directive.type, outputCtx, reflector),
        queries: queriesFromGlobalMetadata(directive.queries, outputCtx),
        lifecycle: {
            usesOnChanges: directive.type.lifecycleHooks.some(function (lifecycle) { return lifecycle == LifecycleHooks.OnChanges; }),
        },
        host: {
            attributes: directive.hostAttributes,
            listeners: summary.hostListeners,
            properties: summary.hostProperties,
        },
        inputs: directive.inputs,
        outputs: directive.outputs,
        usesInheritance: false,
    };
}
/**
 * Convert `CompileQueryMetadata` into `R3QueryMetadata`.
 */
function queriesFromGlobalMetadata(queries, outputCtx) {
    return queries.map(function (query) {
        var read = null;
        if (query.read && query.read.identifier) {
            read = outputCtx.importExpr(query.read.identifier.reference);
        }
        return {
            propertyName: query.propertyName,
            first: query.first,
            predicate: selectorsFromGlobalMetadata(query.selectors, outputCtx),
            descendants: query.descendants, read: read,
        };
    });
}
/**
 * Convert `CompileTokenMetadata` for query selectors into either an expression for a predicate
 * type, or a list of string predicates.
 */
function selectorsFromGlobalMetadata(selectors, outputCtx) {
    if (selectors.length > 1 || (selectors.length == 1 && selectors[0].value)) {
        var selectorStrings = selectors.map(function (value) { return value.value; });
        selectorStrings.some(function (value) { return !value; }) &&
            error('Found a type among the string selectors expected');
        return outputCtx.constantPool.getConstLiteral(o.literalArr(selectorStrings.map(function (value) { return o.literal(value); })));
    }
    if (selectors.length == 1) {
        var first = selectors[0];
        if (first.identifier) {
            return outputCtx.importExpr(first.identifier.reference);
        }
    }
    error('Unexpected query form');
    return o.NULL_EXPR;
}
function createQueryDefinition(query, constantPool, idx) {
    var predicate = getQueryPredicate(query, constantPool);
    // e.g. r3.Q(null, somePredicate, false) or r3.Q(0, ['div'], false)
    var parameters = [
        o.literal(idx, o.INFERRED_TYPE),
        predicate,
        o.literal(query.descendants),
    ];
    if (query.read) {
        parameters.push(query.read);
    }
    return o.importExpr(R3.query).callFn(parameters);
}
// Turn a directive selector into an R3-compatible selector for directive def
function createDirectiveSelector(selector) {
    return asLiteral(core.parseSelectorToR3Selector(selector));
}
function createHostAttributesArray(meta) {
    var values = [];
    var attributes = meta.host.attributes;
    try {
        for (var _a = tslib_1.__values(Object.getOwnPropertyNames(attributes)), _b = _a.next(); !_b.done; _b = _a.next()) {
            var key = _b.value;
            var value = attributes[key];
            values.push(o.literal(key), o.literal(value));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (values.length > 0) {
        return o.literalArr(values);
    }
    return null;
    var e_1, _c;
}
// Return a contentQueries function or null if one is not necessary.
function createContentQueriesFunction(meta, constantPool) {
    if (meta.queries.length) {
        var statements = meta.queries.map(function (query) {
            var queryDefinition = createQueryDefinition(query, constantPool, null);
            return o.importExpr(R3.registerContentQuery).callFn([queryDefinition]).toStmt();
        });
        var typeName = meta.name;
        return o.fn([], statements, o.INFERRED_TYPE, null, typeName ? typeName + "_ContentQueries" : null);
    }
    return null;
}
// Return a contentQueriesRefresh function or null if one is not necessary.
function createContentQueriesRefreshFunction(meta) {
    if (meta.queries.length > 0) {
        var statements_1 = [];
        var typeName = meta.name;
        var parameters = [
            new o.FnParam('dirIndex', o.NUMBER_TYPE),
            new o.FnParam('queryStartIndex', o.NUMBER_TYPE),
        ];
        var directiveInstanceVar_1 = o.variable('instance');
        // var $tmp$: any;
        var temporary_1 = temporaryAllocator(statements_1, TEMPORARY_NAME);
        // const $instance$ = $r3$.ɵd(dirIndex);
        statements_1.push(directiveInstanceVar_1.set(o.importExpr(R3.loadDirective).callFn([o.variable('dirIndex')]))
            .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
        meta.queries.forEach(function (query, idx) {
            var loadQLArg = o.variable('queryStartIndex');
            var getQueryList = o.importExpr(R3.loadQueryList).callFn([
                idx > 0 ? loadQLArg.plus(o.literal(idx)) : loadQLArg
            ]);
            var assignToTemporary = temporary_1().set(getQueryList);
            var callQueryRefresh = o.importExpr(R3.queryRefresh).callFn([assignToTemporary]);
            var updateDirective = directiveInstanceVar_1.prop(query.propertyName)
                .set(query.first ? temporary_1().prop('first') : temporary_1());
            var refreshQueryAndUpdateDirective = callQueryRefresh.and(updateDirective);
            statements_1.push(refreshQueryAndUpdateDirective.toStmt());
        });
        return o.fn(parameters, statements_1, o.INFERRED_TYPE, null, typeName ? typeName + "_ContentQueriesRefresh" : null);
    }
    return null;
}
// Define and update any view queries
function createViewQueriesFunction(meta, constantPool) {
    var createStatements = [];
    var updateStatements = [];
    var tempAllocator = temporaryAllocator(updateStatements, TEMPORARY_NAME);
    for (var i = 0; i < meta.viewQueries.length; i++) {
        var query = meta.viewQueries[i];
        // creation, e.g. r3.Q(0, somePredicate, true);
        var queryDefinition = createQueryDefinition(query, constantPool, i);
        createStatements.push(queryDefinition.toStmt());
        // update, e.g. (r3.qR(tmp = r3.ɵld(0)) && (ctx.someDir = tmp));
        var temporary = tempAllocator();
        var getQueryList = o.importExpr(R3.load).callFn([o.literal(i)]);
        var refresh = o.importExpr(R3.queryRefresh).callFn([temporary.set(getQueryList)]);
        var updateDirective = o.variable(CONTEXT_NAME)
            .prop(query.propertyName)
            .set(query.first ? temporary.prop('first') : temporary);
        updateStatements.push(refresh.and(updateDirective).toStmt());
    }
    var viewQueryFnName = meta.name ? meta.name + "_Query" : null;
    return o.fn([new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(CONTEXT_NAME, null)], [
        renderFlagCheckIfStmt(1 /* Create */, createStatements),
        renderFlagCheckIfStmt(2 /* Update */, updateStatements)
    ], o.INFERRED_TYPE, null, viewQueryFnName);
}
// Return a host binding function or null if one is not necessary.
function createHostBindingsFunction(meta, bindingParser) {
    var statements = [];
    var hostBindingSourceSpan = meta.typeSourceSpan;
    var directiveSummary = metadataAsSummary(meta);
    // Calculate the host property bindings
    var bindings = bindingParser.createBoundHostProperties(directiveSummary, hostBindingSourceSpan);
    var bindingContext = o.importExpr(R3.loadDirective).callFn([o.variable('dirIndex')]);
    if (bindings) {
        try {
            for (var bindings_1 = tslib_1.__values(bindings), bindings_1_1 = bindings_1.next(); !bindings_1_1.done; bindings_1_1 = bindings_1.next()) {
                var binding = bindings_1_1.value;
                var bindingExpr = convertPropertyBinding(null, bindingContext, binding.expression, 'b', BindingForm.TrySimple, function () { return error('Unexpected interpolation'); });
                statements.push.apply(statements, tslib_1.__spread(bindingExpr.stmts));
                statements.push(o.importExpr(R3.elementProperty)
                    .callFn([
                    o.variable('elIndex'),
                    o.literal(binding.name),
                    o.importExpr(R3.bind).callFn([bindingExpr.currValExpr]),
                ])
                    .toStmt());
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (bindings_1_1 && !bindings_1_1.done && (_a = bindings_1.return)) _a.call(bindings_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    // Calculate host event bindings
    var eventBindings = bindingParser.createDirectiveHostEventAsts(directiveSummary, hostBindingSourceSpan);
    if (eventBindings) {
        try {
            for (var eventBindings_1 = tslib_1.__values(eventBindings), eventBindings_1_1 = eventBindings_1.next(); !eventBindings_1_1.done; eventBindings_1_1 = eventBindings_1.next()) {
                var binding = eventBindings_1_1.value;
                var bindingExpr = convertActionBinding(null, bindingContext, binding.handler, 'b', function () { return error('Unexpected interpolation'); });
                var bindingName = binding.name && sanitizeIdentifier(binding.name);
                var typeName = meta.name;
                var functionName = typeName && bindingName ? typeName + "_" + bindingName + "_HostBindingHandler" : null;
                var handler = o.fn([new o.FnParam('$event', o.DYNAMIC_TYPE)], tslib_1.__spread(bindingExpr.stmts, [new o.ReturnStatement(bindingExpr.allowDefault)]), o.INFERRED_TYPE, null, functionName);
                statements.push(o.importExpr(R3.listener).callFn([o.literal(binding.name), handler]).toStmt());
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (eventBindings_1_1 && !eventBindings_1_1.done && (_b = eventBindings_1.return)) _b.call(eventBindings_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    if (statements.length > 0) {
        var typeName = meta.name;
        return o.fn([
            new o.FnParam('dirIndex', o.NUMBER_TYPE),
            new o.FnParam('elIndex', o.NUMBER_TYPE),
        ], statements, o.INFERRED_TYPE, null, typeName ? typeName + "_HostBindings" : null);
    }
    return null;
    var e_2, _a, e_3, _b;
}
function metadataAsSummary(meta) {
    // clang-format off
    return {
        hostAttributes: meta.host.attributes,
        hostListeners: meta.host.listeners,
        hostProperties: meta.host.properties,
    };
    // clang-format on
}
function typeMapToExpressionMap(map, outputCtx) {
    // Convert each map entry into another entry where the value is an expression importing the type.
    var entries = Array.from(map).map(function (_a) {
        var _b = tslib_1.__read(_a, 2), key = _b[0], type = _b[1];
        return [key, outputCtx.importExpr(type)];
    });
    return new Map(entries);
}
var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;
export function parseHostBindings(host) {
    var attributes = {};
    var listeners = {};
    var properties = {};
    var animations = {};
    Object.keys(host).forEach(function (key) {
        var value = host[key];
        var matches = key.match(HOST_REG_EXP);
        if (matches === null) {
            attributes[key] = value;
        }
        else if (matches[1 /* Property */] != null) {
            properties[matches[1 /* Property */]] = value;
        }
        else if (matches[2 /* Event */] != null) {
            listeners[matches[2 /* Event */]] = value;
        }
        else if (matches[3 /* Animation */] != null) {
            animations[matches[3 /* Animation */]] = value;
        }
    });
    return { attributes: attributes, listeners: listeners, properties: properties, animations: animations };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy92aWV3L2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQWdMLGNBQWMsRUFBRSxrQkFBa0IsRUFBaUIsTUFBTSx3QkFBd0IsQ0FBQztBQUV6USxPQUFPLEVBQUMsV0FBVyxFQUFzQyxvQkFBb0IsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBRXZKLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBR25DLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLEtBQUssQ0FBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzdDLE9BQU8sRUFBa0IsY0FBYyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDakUsT0FBTyxFQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1RCxPQUFPLEVBQWdCLEtBQUssRUFBQyxNQUFNLFlBQVksQ0FBQztBQUVoRCxPQUFPLEVBQWlELHNCQUFzQixFQUFFLDhCQUE4QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3JJLE9BQU8sRUFBQyxXQUFXLElBQUksRUFBRSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFcEQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRzNDLE9BQU8sRUFBQyxZQUFZLEVBQUUseUJBQXlCLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDMUYsT0FBTyxFQUFDLFlBQVksRUFBRSxhQUFhLEVBQW1DLFlBQVksRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLG1DQUFtQyxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFjLE1BQU0sUUFBUSxDQUFDO0FBRXROLDZCQUNJLElBQXlCLEVBQUUsWUFBMEIsRUFDckQsYUFBNEI7SUFDOUIsSUFBTSxhQUFhLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztJQUUxQywyQkFBMkI7SUFDM0IsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXJDLDBDQUEwQztJQUMxQyxhQUFhLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsUUFBVSxDQUFDLENBQUMsQ0FBQztJQUd6RSxzREFBc0Q7SUFDdEQsYUFBYSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsc0JBQXNCLENBQUM7UUFDaEMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1FBQ2YsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJO1FBQ3BCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtRQUNmLE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFLEVBQUUsQ0FBQyxlQUFlO0tBQzdCLENBQUMsQ0FBQyxDQUFDO0lBRXRCLGFBQWEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsNEJBQTRCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFFdEYsYUFBYSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxtQ0FBbUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRXRGLHFEQUFxRDtJQUNyRCxhQUFhLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSwwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUVuRix5Q0FBeUM7SUFDekMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUVqRSx5QkFBeUI7SUFDekIsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsbUNBQW1DLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFFOUUsMEJBQTBCO0lBQzFCLGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLG1DQUFtQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBRWhGLHdDQUF3QztJQUN4QyxJQUFNLFFBQVEsR0FBbUIsRUFBRSxDQUFDO0lBRXBDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDakMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUN2QixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLHVDQUNGLElBQXlCLEVBQUUsWUFBMEIsRUFDckQsYUFBNEI7SUFDOUIsSUFBTSxhQUFhLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM3RSxJQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTNGLCtGQUErRjtJQUMvRiw2Q0FBNkM7SUFDN0MsSUFBTSxlQUFlLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFakUsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRTtRQUM5RCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUNyRCxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUNqRCxDQUFDLENBQUMsQ0FBQztJQUNKLE1BQU0sQ0FBQyxFQUFDLFVBQVUsWUFBQSxFQUFFLElBQUksTUFBQSxFQUFDLENBQUM7QUFDNUIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSx1Q0FDRixJQUF5QixFQUFFLFlBQTBCLEVBQ3JELGFBQTRCO0lBQzlCLElBQU0sYUFBYSxHQUFHLG1CQUFtQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFFN0UsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuRSxJQUFNLGFBQWEsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTlDLG9DQUFvQztJQUNwQywrRkFBK0Y7SUFDL0YsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUNsQixJQUFNLGtCQUFrQixHQUFHLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNwRCxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzlCLGFBQWEsQ0FBQyxHQUFHLENBQ2IsT0FBTyxFQUFFLFlBQVksQ0FBQyxlQUFlLENBQ3hCLENBQUMsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUMvQixVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQXZELENBQXVELENBQUMsQ0FBQztZQUN0RSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUM7SUFDSCxDQUFDO0lBRUQsb0RBQW9EO0lBQ3BELElBQUksZ0JBQWdCLEdBQXlCLElBQUksQ0FBQztJQUVsRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekIsSUFBTSxTQUFPLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFVBQVUsRUFBRSxRQUFnQjtZQUNuRCxTQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEUsQ0FBQyxDQUFDLENBQUM7UUFDSCxnQkFBZ0IsR0FBRyxTQUFPLENBQUM7SUFDN0IsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM1QixhQUFhLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQsa0VBQWtFO0lBQ2xFLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuQyxJQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUksZ0JBQWdCLGNBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRTlFLElBQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUFnQixDQUFDO0lBQy9DLElBQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFnQixDQUFDO0lBRTFDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDL0IsSUFBTSwwQkFBMEIsR0FDNUIsSUFBSSx5QkFBeUIsQ0FDekIsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQ3RGLElBQUksQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUN6RSxFQUFFLENBQUMsYUFBYSxDQUFDO1NBQ2hCLHFCQUFxQixDQUNsQixRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBRXBGLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFFMUQsbUNBQW1DO0lBQ25DLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELHlCQUF5QjtJQUN6QixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRCwrRkFBK0Y7SUFDL0YsNkNBQTZDO0lBQzdDLElBQU0sZUFBZSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRWpFLElBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0YsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRTtRQUM5RCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUNyRCxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUNqRCxDQUFDLENBQUMsQ0FBQztJQUVKLE1BQU0sQ0FBQyxFQUFDLFVBQVUsWUFBQSxFQUFFLElBQUksTUFBQSxFQUFDLENBQUM7QUFDNUIsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sc0NBQ0YsU0FBd0IsRUFBRSxTQUFtQyxFQUFFLFNBQTJCLEVBQzFGLGFBQTRCO0lBQzlCLElBQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFHLENBQUM7SUFDOUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxpQ0FBK0IsU0FBUyxDQUFDLElBQU0sQ0FBQyxDQUFDO0lBRS9ELElBQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsY0FBYyxtQkFBMEIsQ0FBQztJQUV4RixJQUFNLElBQUksR0FBRyxtQ0FBbUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2xGLElBQU0sR0FBRyxHQUFHLDRCQUE0QixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBRXRGLCtEQUErRDtJQUMvRCxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQ3JDLElBQUksRUFBRSxJQUFJLEVBQ1YsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUM3RixFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxzQ0FDRixTQUF3QixFQUFFLFNBQW1DLEVBQUUsVUFBOEIsRUFDN0YsU0FBMkIsRUFBRSxhQUE0QixFQUFFLGtCQUFvQyxFQUMvRixjQUFnQztJQUNsQyxJQUFNLElBQUksR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBRyxDQUFDO0lBQzlDLElBQUksSUFBSSxLQUFLLENBQUMsaUNBQStCLFNBQVMsQ0FBQyxJQUFNLENBQUMsQ0FBQztJQUUvRCxJQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLGNBQWMsbUJBQTBCLENBQUM7SUFFeEYsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBRXRDLG9FQUFvRTtJQUNwRSxJQUFNLElBQUksd0JBQ0wsbUNBQW1DLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsSUFDdkUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQzVCLFFBQVEsRUFBRTtZQUNSLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSztZQUN2QixZQUFZLEVBQUUsVUFBVSxDQUFDLFlBQVk7WUFDckMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLGtCQUFrQjtTQUNsRCxFQUNELFVBQVUsRUFBRSxzQkFBc0IsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsRUFDakUsS0FBSyxFQUFFLHNCQUFzQixDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsRUFDeEQsV0FBVyxFQUFFLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLEdBQ3pFLENBQUM7SUFDRixJQUFNLEdBQUcsR0FBRyw0QkFBNEIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztJQUV0RiwrREFBK0Q7SUFDL0QsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUNyQyxJQUFJLEVBQUUsSUFBSSxFQUNWLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDN0YsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUVEOztHQUVHO0FBQ0gsNkNBQ0ksU0FBbUMsRUFBRSxTQUF3QixFQUM3RCxTQUEyQjtJQUM3QixJQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDdEMsSUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUcsQ0FBQztJQUM5QyxJQUFJLElBQUksS0FBSyxDQUFDLGlDQUErQixTQUFTLENBQUMsSUFBTSxDQUFDLENBQUM7SUFFL0QsTUFBTSxDQUFDO1FBQ0wsSUFBSSxNQUFBO1FBQ0osSUFBSSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDcEQsaUJBQWlCLEVBQUUsQ0FBQztRQUNwQixjQUFjLEVBQ1YsY0FBYyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDckYsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRO1FBQzVCLElBQUksRUFBRSw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDMUUsT0FBTyxFQUFFLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO1FBQ2hFLFNBQVMsRUFBRTtZQUNULGFBQWEsRUFDVCxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBQSxTQUFTLElBQUksT0FBQSxTQUFTLElBQUksY0FBYyxDQUFDLFNBQVMsRUFBckMsQ0FBcUMsQ0FBQztTQUMzRjtRQUNELElBQUksRUFBRTtZQUNKLFVBQVUsRUFBRSxTQUFTLENBQUMsY0FBYztZQUNwQyxTQUFTLEVBQUUsT0FBTyxDQUFDLGFBQWE7WUFDaEMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxjQUFjO1NBQ25DO1FBQ0QsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNO1FBQ3hCLE9BQU8sRUFBRSxTQUFTLENBQUMsT0FBTztRQUMxQixlQUFlLEVBQUUsS0FBSztLQUN2QixDQUFDO0FBQ0osQ0FBQztBQUVEOztHQUVHO0FBQ0gsbUNBQ0ksT0FBK0IsRUFBRSxTQUF3QjtJQUMzRCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7UUFDdEIsSUFBSSxJQUFJLEdBQXNCLElBQUksQ0FBQztRQUNuQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN4QyxJQUFJLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBQ0QsTUFBTSxDQUFDO1lBQ0wsWUFBWSxFQUFFLEtBQUssQ0FBQyxZQUFZO1lBQ2hDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztZQUNsQixTQUFTLEVBQUUsMkJBQTJCLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7WUFDbEUsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxNQUFBO1NBQ3JDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxxQ0FDSSxTQUFpQyxFQUFFLFNBQXdCO0lBQzdELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRSxJQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLEtBQWUsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1FBQ3RFLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxDQUFDLEtBQUssRUFBTixDQUFNLENBQUM7WUFDakMsS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7UUFDOUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUN6QyxDQUFDLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFoQixDQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUQsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUMvQixNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsK0JBQ0ksS0FBc0IsRUFBRSxZQUEwQixFQUFFLEdBQWtCO0lBQ3hFLElBQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztJQUV6RCxtRUFBbUU7SUFDbkUsSUFBTSxVQUFVLEdBQUc7UUFDakIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUMvQixTQUFTO1FBQ1QsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO0tBQzdCLENBQUM7SUFFRixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNmLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELENBQUM7QUFFRCw2RUFBNkU7QUFDN0UsaUNBQWlDLFFBQWdCO0lBQy9DLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDN0QsQ0FBQztBQUVELG1DQUFtQyxJQUF5QjtJQUMxRCxJQUFNLE1BQU0sR0FBbUIsRUFBRSxDQUFDO0lBQ2xDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDOztRQUN4QyxHQUFHLENBQUMsQ0FBWSxJQUFBLEtBQUEsaUJBQUEsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFBLGdCQUFBO1lBQWpELElBQUksR0FBRyxXQUFBO1lBQ1YsSUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDL0M7Ozs7Ozs7OztJQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQzs7QUFDZCxDQUFDO0FBRUQsb0VBQW9FO0FBQ3BFLHNDQUNJLElBQXlCLEVBQUUsWUFBMEI7SUFDdkQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLElBQU0sVUFBVSxHQUFrQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQXNCO1lBQ3hFLElBQU0sZUFBZSxHQUFHLHFCQUFxQixDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekUsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNsRixDQUFDLENBQUMsQ0FBQztRQUNILElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDM0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQ1AsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFJLFFBQVEsb0JBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELDJFQUEyRTtBQUMzRSw2Q0FBNkMsSUFBeUI7SUFDcEUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFNLFlBQVUsR0FBa0IsRUFBRSxDQUFDO1FBQ3JDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDM0IsSUFBTSxVQUFVLEdBQUc7WUFDakIsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDO1NBQ2hELENBQUM7UUFDRixJQUFNLHNCQUFvQixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEQsa0JBQWtCO1FBQ2xCLElBQU0sV0FBUyxHQUFHLGtCQUFrQixDQUFDLFlBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUVqRSx3Q0FBd0M7UUFDeEMsWUFBVSxDQUFDLElBQUksQ0FDWCxzQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEYsVUFBVSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5RCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQXNCLEVBQUUsR0FBVztZQUN2RCxJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDaEQsSUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUN6RCxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUzthQUNyRCxDQUFDLENBQUM7WUFDSCxJQUFNLGlCQUFpQixHQUFHLFdBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN4RCxJQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUVuRixJQUFNLGVBQWUsR0FBRyxzQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztpQkFDeEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBUyxFQUFFLENBQUMsQ0FBQztZQUN4RixJQUFNLDhCQUE4QixHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUU3RSxZQUFVLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDUCxVQUFVLEVBQUUsWUFBVSxFQUFFLENBQUMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUM3QyxRQUFRLENBQUMsQ0FBQyxDQUFJLFFBQVEsMkJBQXdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELHFDQUFxQztBQUNyQyxtQ0FDSSxJQUF5QixFQUFFLFlBQTBCO0lBQ3ZELElBQU0sZ0JBQWdCLEdBQWtCLEVBQUUsQ0FBQztJQUMzQyxJQUFNLGdCQUFnQixHQUFrQixFQUFFLENBQUM7SUFDM0MsSUFBTSxhQUFhLEdBQUcsa0JBQWtCLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFM0UsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2pELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbEMsK0NBQStDO1FBQy9DLElBQU0sZUFBZSxHQUFHLHFCQUFxQixDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdEUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRWhELGdFQUFnRTtRQUNoRSxJQUFNLFNBQVMsR0FBRyxhQUFhLEVBQUUsQ0FBQztRQUNsQyxJQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRixJQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQzthQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQzthQUN4QixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEYsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUksSUFBSSxDQUFDLElBQUksV0FBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDaEUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQy9FO1FBQ0UscUJBQXFCLGlCQUEwQixnQkFBZ0IsQ0FBQztRQUNoRSxxQkFBcUIsaUJBQTBCLGdCQUFnQixDQUFDO0tBQ2pFLEVBQ0QsQ0FBQyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUVELGtFQUFrRTtBQUNsRSxvQ0FDSSxJQUF5QixFQUFFLGFBQTRCO0lBQ3pELElBQU0sVUFBVSxHQUFrQixFQUFFLENBQUM7SUFFckMsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBRWxELElBQU0sZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFakQsdUNBQXVDO0lBQ3ZDLElBQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxnQkFBZ0IsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2xHLElBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7O1lBQ2IsR0FBRyxDQUFDLENBQWtCLElBQUEsYUFBQSxpQkFBQSxRQUFRLENBQUEsa0NBQUE7Z0JBQXpCLElBQU0sT0FBTyxxQkFBQTtnQkFDaEIsSUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQ3RDLElBQUksRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsV0FBVyxDQUFDLFNBQVMsRUFDcEUsY0FBTSxPQUFBLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxFQUFqQyxDQUFpQyxDQUFDLENBQUM7Z0JBQzdDLFVBQVUsQ0FBQyxJQUFJLE9BQWYsVUFBVSxtQkFBUyxXQUFXLENBQUMsS0FBSyxHQUFFO2dCQUN0QyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQztxQkFDM0IsTUFBTSxDQUFDO29CQUNOLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO29CQUNyQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDeEQsQ0FBQztxQkFDRCxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQ2hDOzs7Ozs7Ozs7SUFDSCxDQUFDO0lBRUQsZ0NBQWdDO0lBQ2hDLElBQU0sYUFBYSxHQUNmLGFBQWEsQ0FBQyw0QkFBNEIsQ0FBQyxnQkFBZ0IsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3hGLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7O1lBQ2xCLEdBQUcsQ0FBQyxDQUFrQixJQUFBLGtCQUFBLGlCQUFBLGFBQWEsQ0FBQSw0Q0FBQTtnQkFBOUIsSUFBTSxPQUFPLDBCQUFBO2dCQUNoQixJQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FDcEMsSUFBSSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxjQUFNLE9BQUEsS0FBSyxDQUFDLDBCQUEwQixDQUFDLEVBQWpDLENBQWlDLENBQUMsQ0FBQztnQkFDekYsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JFLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzNCLElBQU0sWUFBWSxHQUNkLFFBQVEsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFJLFFBQVEsU0FBSSxXQUFXLHdCQUFxQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3JGLElBQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQ2hCLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsbUJBQ3JDLFdBQVcsQ0FBQyxLQUFLLEdBQUUsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBRyxDQUFDLENBQUMsYUFBYSxFQUN4RixJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ3hCLFVBQVUsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQ3BGOzs7Ozs7Ozs7SUFDSCxDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDM0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQ1A7WUFDRSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUM7WUFDeEMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDO1NBQ3hDLEVBQ0QsVUFBVSxFQUFFLENBQUMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUksUUFBUSxrQkFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQzs7QUFDZCxDQUFDO0FBRUQsMkJBQTJCLElBQXlCO0lBQ2xELG1CQUFtQjtJQUNuQixNQUFNLENBQUM7UUFDTCxjQUFjLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO1FBQ3BDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7UUFDbEMsY0FBYyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtLQUNWLENBQUM7SUFDN0Isa0JBQWtCO0FBQ3BCLENBQUM7QUFHRCxnQ0FDSSxHQUE4QixFQUFFLFNBQXdCO0lBQzFELGlHQUFpRztJQUNqRyxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FDL0IsVUFBQyxFQUFXO1lBQVgsMEJBQVcsRUFBVixXQUFHLEVBQUUsWUFBSTtRQUE4QixPQUFBLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFBakMsQ0FBaUMsQ0FBQyxDQUFDO0lBQ2hGLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRUQsSUFBTSxZQUFZLEdBQUcsb0RBQW9ELENBQUM7QUFjMUUsTUFBTSw0QkFBNEIsSUFBNkI7SUFNN0QsSUFBTSxVQUFVLEdBQTRCLEVBQUUsQ0FBQztJQUMvQyxJQUFNLFNBQVMsR0FBNEIsRUFBRSxDQUFDO0lBQzlDLElBQU0sVUFBVSxHQUE0QixFQUFFLENBQUM7SUFDL0MsSUFBTSxVQUFVLEdBQTRCLEVBQUUsQ0FBQztJQUUvQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7UUFDM0IsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLElBQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDeEMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUMxQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sa0JBQTJCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN0RCxVQUFVLENBQUMsT0FBTyxrQkFBMkIsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUN6RCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sZUFBd0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ25ELFNBQVMsQ0FBQyxPQUFPLGVBQXdCLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDckQsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLG1CQUE0QixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkQsVUFBVSxDQUFDLE9BQU8sbUJBQTRCLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDMUQsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLEVBQUMsVUFBVSxZQUFBLEVBQUUsU0FBUyxXQUFBLEVBQUUsVUFBVSxZQUFBLEVBQUUsVUFBVSxZQUFBLEVBQUMsQ0FBQztBQUN6RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N0YXRpY1N5bWJvbH0gZnJvbSAnLi4vLi4vYW90L3N0YXRpY19zeW1ib2wnO1xuaW1wb3J0IHtDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEsIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnksIENvbXBpbGVQaXBlTWV0YWRhdGEsIENvbXBpbGVRdWVyeU1ldGFkYXRhLCBDb21waWxlVG9rZW5NZXRhZGF0YSwgQ29tcGlsZVR5cGVNZXRhZGF0YSwgZmxhdHRlbiwgaWRlbnRpZmllck5hbWUsIHNhbml0aXplSWRlbnRpZmllciwgdG9rZW5SZWZlcmVuY2V9IGZyb20gJy4uLy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtDb21waWxlUmVmbGVjdG9yfSBmcm9tICcuLi8uLi9jb21waWxlX3JlZmxlY3Rvcic7XG5pbXBvcnQge0JpbmRpbmdGb3JtLCBCdWlsdGluRnVuY3Rpb25DYWxsLCBMb2NhbFJlc29sdmVyLCBjb252ZXJ0QWN0aW9uQmluZGluZywgY29udmVydFByb3BlcnR5QmluZGluZ30gZnJvbSAnLi4vLi4vY29tcGlsZXJfdXRpbC9leHByZXNzaW9uX2NvbnZlcnRlcic7XG5pbXBvcnQge0NvbnN0YW50UG9vbCwgRGVmaW5pdGlvbktpbmR9IGZyb20gJy4uLy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0ICogYXMgY29yZSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCB7QVNULCBBc3RNZW1vcnlFZmZpY2llbnRUcmFuc2Zvcm1lciwgQmluZGluZ1BpcGUsIEJpbmRpbmdUeXBlLCBGdW5jdGlvbkNhbGwsIEltcGxpY2l0UmVjZWl2ZXIsIExpdGVyYWxBcnJheSwgTGl0ZXJhbE1hcCwgTGl0ZXJhbFByaW1pdGl2ZSwgUHJvcGVydHlSZWFkfSBmcm9tICcuLi8uLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi4vLi4vaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rc30gZnJvbSAnLi4vLi4vbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFuLCB0eXBlU291cmNlU3Bhbn0gZnJvbSAnLi4vLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0Nzc1NlbGVjdG9yLCBTZWxlY3Rvck1hdGNoZXJ9IGZyb20gJy4uLy4uL3NlbGVjdG9yJztcbmltcG9ydCB7QmluZGluZ1BhcnNlcn0gZnJvbSAnLi4vLi4vdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyJztcbmltcG9ydCB7T3V0cHV0Q29udGV4dCwgZXJyb3J9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuLi9yM19hc3QnO1xuaW1wb3J0IHtSM0RlcGVuZGVuY3lNZXRhZGF0YSwgUjNSZXNvbHZlZERlcGVuZGVuY3lUeXBlLCBjb21waWxlRmFjdG9yeUZ1bmN0aW9uLCBkZXBlbmRlbmNpZXNGcm9tR2xvYmFsTWV0YWRhdGF9IGZyb20gJy4uL3IzX2ZhY3RvcnknO1xuaW1wb3J0IHtJZGVudGlmaWVycyBhcyBSM30gZnJvbSAnLi4vcjNfaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtSZW5kZXIzUGFyc2VSZXN1bHR9IGZyb20gJy4uL3IzX3RlbXBsYXRlX3RyYW5zZm9ybSc7XG5pbXBvcnQge3R5cGVXaXRoUGFyYW1ldGVyc30gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7UjNDb21wb25lbnREZWYsIFIzQ29tcG9uZW50TWV0YWRhdGEsIFIzRGlyZWN0aXZlRGVmLCBSM0RpcmVjdGl2ZU1ldGFkYXRhLCBSM1F1ZXJ5TWV0YWRhdGF9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7QmluZGluZ1Njb3BlLCBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyLCByZW5kZXJGbGFnQ2hlY2tJZlN0bXR9IGZyb20gJy4vdGVtcGxhdGUnO1xuaW1wb3J0IHtDT05URVhUX05BTUUsIERlZmluaXRpb25NYXAsIElEX1NFUEFSQVRPUiwgTUVBTklOR19TRVBBUkFUT1IsIFJFTkRFUl9GTEFHUywgVEVNUE9SQVJZX05BTUUsIGFzTGl0ZXJhbCwgY29uZGl0aW9uYWxseUNyZWF0ZU1hcE9iamVjdExpdGVyYWwsIGdldFF1ZXJ5UHJlZGljYXRlLCB0ZW1wb3JhcnlBbGxvY2F0b3IsIHVuc3VwcG9ydGVkfSBmcm9tICcuL3V0aWwnO1xuXG5mdW5jdGlvbiBiYXNlRGlyZWN0aXZlRmllbGRzKFxuICAgIG1ldGE6IFIzRGlyZWN0aXZlTWV0YWRhdGEsIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sLFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIpOiBEZWZpbml0aW9uTWFwIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcCA9IG5ldyBEZWZpbml0aW9uTWFwKCk7XG5cbiAgLy8gZS5nLiBgdHlwZTogTXlEaXJlY3RpdmVgXG4gIGRlZmluaXRpb25NYXAuc2V0KCd0eXBlJywgbWV0YS50eXBlKTtcblxuICAvLyBlLmcuIGBzZWxlY3RvcnM6IFtbJycsICdzb21lRGlyJywgJyddXWBcbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ3NlbGVjdG9ycycsIGNyZWF0ZURpcmVjdGl2ZVNlbGVjdG9yKG1ldGEuc2VsZWN0b3IgISkpO1xuXG5cbiAgLy8gZS5nLiBgZmFjdG9yeTogKCkgPT4gbmV3IE15QXBwKGluamVjdEVsZW1lbnRSZWYoKSlgXG4gIGRlZmluaXRpb25NYXAuc2V0KCdmYWN0b3J5JywgY29tcGlsZUZhY3RvcnlGdW5jdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogbWV0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgIGZuT3JDbGFzczogbWV0YS50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IG1ldGEuZGVwcyxcbiAgICAgICAgICAgICAgICAgICAgICB1c2VOZXc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgaW5qZWN0Rm46IFIzLmRpcmVjdGl2ZUluamVjdCxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gIGRlZmluaXRpb25NYXAuc2V0KCdjb250ZW50UXVlcmllcycsIGNyZWF0ZUNvbnRlbnRRdWVyaWVzRnVuY3Rpb24obWV0YSwgY29uc3RhbnRQb29sKSk7XG5cbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ2NvbnRlbnRRdWVyaWVzUmVmcmVzaCcsIGNyZWF0ZUNvbnRlbnRRdWVyaWVzUmVmcmVzaEZ1bmN0aW9uKG1ldGEpKTtcblxuICAvLyBlLmcuIGBob3N0QmluZGluZ3M6IChkaXJJbmRleCwgZWxJbmRleCkgPT4geyAuLi4gfVxuICBkZWZpbml0aW9uTWFwLnNldCgnaG9zdEJpbmRpbmdzJywgY3JlYXRlSG9zdEJpbmRpbmdzRnVuY3Rpb24obWV0YSwgYmluZGluZ1BhcnNlcikpO1xuXG4gIC8vIGUuZy4gYGF0dHJpYnV0ZXM6IFsncm9sZScsICdsaXN0Ym94J11gXG4gIGRlZmluaXRpb25NYXAuc2V0KCdhdHRyaWJ1dGVzJywgY3JlYXRlSG9zdEF0dHJpYnV0ZXNBcnJheShtZXRhKSk7XG5cbiAgLy8gZS5nICdpbnB1dHM6IHthOiAnYSd9YFxuICBkZWZpbml0aW9uTWFwLnNldCgnaW5wdXRzJywgY29uZGl0aW9uYWxseUNyZWF0ZU1hcE9iamVjdExpdGVyYWwobWV0YS5pbnB1dHMpKTtcblxuICAvLyBlLmcgJ291dHB1dHM6IHthOiAnYSd9YFxuICBkZWZpbml0aW9uTWFwLnNldCgnb3V0cHV0cycsIGNvbmRpdGlvbmFsbHlDcmVhdGVNYXBPYmplY3RMaXRlcmFsKG1ldGEub3V0cHV0cykpO1xuXG4gIC8vIGUuZy4gYGZlYXR1cmVzOiBbTmdPbkNoYW5nZXNGZWF0dXJlXWBcbiAgY29uc3QgZmVhdHVyZXM6IG8uRXhwcmVzc2lvbltdID0gW107XG5cbiAgaWYgKG1ldGEudXNlc0luaGVyaXRhbmNlKSB7XG4gICAgZmVhdHVyZXMucHVzaChvLmltcG9ydEV4cHIoUjMuSW5oZXJpdERlZmluaXRpb25GZWF0dXJlKSk7XG4gIH1cbiAgaWYgKG1ldGEubGlmZWN5Y2xlLnVzZXNPbkNoYW5nZXMpIHtcbiAgICBmZWF0dXJlcy5wdXNoKG8uaW1wb3J0RXhwcihSMy5OZ09uQ2hhbmdlc0ZlYXR1cmUpKTtcbiAgfVxuICBpZiAoZmVhdHVyZXMubGVuZ3RoKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2ZlYXR1cmVzJywgby5saXRlcmFsQXJyKGZlYXR1cmVzKSk7XG4gIH1cblxuICByZXR1cm4gZGVmaW5pdGlvbk1hcDtcbn1cblxuLyoqXG4gKiBDb21waWxlIGEgZGlyZWN0aXZlIGZvciB0aGUgcmVuZGVyMyBydW50aW1lIGFzIGRlZmluZWQgYnkgdGhlIGBSM0RpcmVjdGl2ZU1ldGFkYXRhYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVEaXJlY3RpdmVGcm9tTWV0YWRhdGEoXG4gICAgbWV0YTogUjNEaXJlY3RpdmVNZXRhZGF0YSwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsXG4gICAgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlcik6IFIzRGlyZWN0aXZlRGVmIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcCA9IGJhc2VEaXJlY3RpdmVGaWVsZHMobWV0YSwgY29uc3RhbnRQb29sLCBiaW5kaW5nUGFyc2VyKTtcbiAgY29uc3QgZXhwcmVzc2lvbiA9IG8uaW1wb3J0RXhwcihSMy5kZWZpbmVEaXJlY3RpdmUpLmNhbGxGbihbZGVmaW5pdGlvbk1hcC50b0xpdGVyYWxNYXAoKV0pO1xuXG4gIC8vIE9uIHRoZSB0eXBlIHNpZGUsIHJlbW92ZSBuZXdsaW5lcyBmcm9tIHRoZSBzZWxlY3RvciBhcyBpdCB3aWxsIG5lZWQgdG8gZml0IGludG8gYSBUeXBlU2NyaXB0XG4gIC8vIHN0cmluZyBsaXRlcmFsLCB3aGljaCBtdXN0IGJlIG9uIG9uZSBsaW5lLlxuICBjb25zdCBzZWxlY3RvckZvclR5cGUgPSAobWV0YS5zZWxlY3RvciB8fCAnJykucmVwbGFjZSgvXFxuL2csICcnKTtcblxuICBjb25zdCB0eXBlID0gbmV3IG8uRXhwcmVzc2lvblR5cGUoby5pbXBvcnRFeHByKFIzLkRpcmVjdGl2ZURlZiwgW1xuICAgIHR5cGVXaXRoUGFyYW1ldGVycyhtZXRhLnR5cGUsIG1ldGEudHlwZUFyZ3VtZW50Q291bnQpLFxuICAgIG5ldyBvLkV4cHJlc3Npb25UeXBlKG8ubGl0ZXJhbChzZWxlY3RvckZvclR5cGUpKVxuICBdKSk7XG4gIHJldHVybiB7ZXhwcmVzc2lvbiwgdHlwZX07XG59XG5cbi8qKlxuICogQ29tcGlsZSBhIGNvbXBvbmVudCBmb3IgdGhlIHJlbmRlcjMgcnVudGltZSBhcyBkZWZpbmVkIGJ5IHRoZSBgUjNDb21wb25lbnRNZXRhZGF0YWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlQ29tcG9uZW50RnJvbU1ldGFkYXRhKFxuICAgIG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGEsIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sLFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIpOiBSM0NvbXBvbmVudERlZiB7XG4gIGNvbnN0IGRlZmluaXRpb25NYXAgPSBiYXNlRGlyZWN0aXZlRmllbGRzKG1ldGEsIGNvbnN0YW50UG9vbCwgYmluZGluZ1BhcnNlcik7XG5cbiAgY29uc3Qgc2VsZWN0b3IgPSBtZXRhLnNlbGVjdG9yICYmIENzc1NlbGVjdG9yLnBhcnNlKG1ldGEuc2VsZWN0b3IpO1xuICBjb25zdCBmaXJzdFNlbGVjdG9yID0gc2VsZWN0b3IgJiYgc2VsZWN0b3JbMF07XG5cbiAgLy8gZS5nLiBgYXR0cjogW1wiY2xhc3NcIiwgXCIubXkuYXBwXCJdYFxuICAvLyBUaGlzIGlzIG9wdGlvbmFsIGFuIG9ubHkgaW5jbHVkZWQgaWYgdGhlIGZpcnN0IHNlbGVjdG9yIG9mIGEgY29tcG9uZW50IHNwZWNpZmllcyBhdHRyaWJ1dGVzLlxuICBpZiAoZmlyc3RTZWxlY3Rvcikge1xuICAgIGNvbnN0IHNlbGVjdG9yQXR0cmlidXRlcyA9IGZpcnN0U2VsZWN0b3IuZ2V0QXR0cnMoKTtcbiAgICBpZiAoc2VsZWN0b3JBdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgICAgZGVmaW5pdGlvbk1hcC5zZXQoXG4gICAgICAgICAgJ2F0dHJzJywgY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChcbiAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsQXJyKHNlbGVjdG9yQXR0cmlidXRlcy5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9PiB2YWx1ZSAhPSBudWxsID8gby5saXRlcmFsKHZhbHVlKSA6IG8ubGl0ZXJhbCh1bmRlZmluZWQpKSksXG4gICAgICAgICAgICAgICAgICAgICAgIC8qIGZvcmNlU2hhcmVkICovIHRydWUpKTtcbiAgICB9XG4gIH1cblxuICAvLyBHZW5lcmF0ZSB0aGUgQ1NTIG1hdGNoZXIgdGhhdCByZWNvZ25pemUgZGlyZWN0aXZlXG4gIGxldCBkaXJlY3RpdmVNYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXJ8bnVsbCA9IG51bGw7XG5cbiAgaWYgKG1ldGEuZGlyZWN0aXZlcy5zaXplKSB7XG4gICAgY29uc3QgbWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXIoKTtcbiAgICBtZXRhLmRpcmVjdGl2ZXMuZm9yRWFjaCgoZXhwcmVzc2lvbiwgc2VsZWN0b3I6IHN0cmluZykgPT4ge1xuICAgICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShzZWxlY3RvciksIGV4cHJlc3Npb24pO1xuICAgIH0pO1xuICAgIGRpcmVjdGl2ZU1hdGNoZXIgPSBtYXRjaGVyO1xuICB9XG5cbiAgaWYgKG1ldGEudmlld1F1ZXJpZXMubGVuZ3RoKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ3ZpZXdRdWVyeScsIGNyZWF0ZVZpZXdRdWVyaWVzRnVuY3Rpb24obWV0YSwgY29uc3RhbnRQb29sKSk7XG4gIH1cblxuICAvLyBlLmcuIGB0ZW1wbGF0ZTogZnVuY3Rpb24gTXlDb21wb25lbnRfVGVtcGxhdGUoX2N0eCwgX2NtKSB7Li4ufWBcbiAgY29uc3QgdGVtcGxhdGVUeXBlTmFtZSA9IG1ldGEubmFtZTtcbiAgY29uc3QgdGVtcGxhdGVOYW1lID0gdGVtcGxhdGVUeXBlTmFtZSA/IGAke3RlbXBsYXRlVHlwZU5hbWV9X1RlbXBsYXRlYCA6IG51bGw7XG5cbiAgY29uc3QgZGlyZWN0aXZlc1VzZWQgPSBuZXcgU2V0PG8uRXhwcmVzc2lvbj4oKTtcbiAgY29uc3QgcGlwZXNVc2VkID0gbmV3IFNldDxvLkV4cHJlc3Npb24+KCk7XG5cbiAgY29uc3QgdGVtcGxhdGUgPSBtZXRhLnRlbXBsYXRlO1xuICBjb25zdCB0ZW1wbGF0ZUZ1bmN0aW9uRXhwcmVzc2lvbiA9XG4gICAgICBuZXcgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcihcbiAgICAgICAgICBjb25zdGFudFBvb2wsIENPTlRFWFRfTkFNRSwgQmluZGluZ1Njb3BlLlJPT1RfU0NPUEUsIDAsIHRlbXBsYXRlVHlwZU5hbWUsIHRlbXBsYXRlTmFtZSxcbiAgICAgICAgICBtZXRhLnZpZXdRdWVyaWVzLCBkaXJlY3RpdmVNYXRjaGVyLCBkaXJlY3RpdmVzVXNlZCwgbWV0YS5waXBlcywgcGlwZXNVc2VkLFxuICAgICAgICAgIFIzLm5hbWVzcGFjZUhUTUwpXG4gICAgICAgICAgLmJ1aWxkVGVtcGxhdGVGdW5jdGlvbihcbiAgICAgICAgICAgICAgdGVtcGxhdGUubm9kZXMsIFtdLCB0ZW1wbGF0ZS5oYXNOZ0NvbnRlbnQsIHRlbXBsYXRlLm5nQ29udGVudFNlbGVjdG9ycyk7XG5cbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ3RlbXBsYXRlJywgdGVtcGxhdGVGdW5jdGlvbkV4cHJlc3Npb24pO1xuXG4gIC8vIGUuZy4gYGRpcmVjdGl2ZXM6IFtNeURpcmVjdGl2ZV1gXG4gIGlmIChkaXJlY3RpdmVzVXNlZC5zaXplKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2RpcmVjdGl2ZXMnLCBvLmxpdGVyYWxBcnIoQXJyYXkuZnJvbShkaXJlY3RpdmVzVXNlZCkpKTtcbiAgfVxuXG4gIC8vIGUuZy4gYHBpcGVzOiBbTXlQaXBlXWBcbiAgaWYgKHBpcGVzVXNlZC5zaXplKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ3BpcGVzJywgby5saXRlcmFsQXJyKEFycmF5LmZyb20ocGlwZXNVc2VkKSkpO1xuICB9XG5cbiAgLy8gT24gdGhlIHR5cGUgc2lkZSwgcmVtb3ZlIG5ld2xpbmVzIGZyb20gdGhlIHNlbGVjdG9yIGFzIGl0IHdpbGwgbmVlZCB0byBmaXQgaW50byBhIFR5cGVTY3JpcHRcbiAgLy8gc3RyaW5nIGxpdGVyYWwsIHdoaWNoIG11c3QgYmUgb24gb25lIGxpbmUuXG4gIGNvbnN0IHNlbGVjdG9yRm9yVHlwZSA9IChtZXRhLnNlbGVjdG9yIHx8ICcnKS5yZXBsYWNlKC9cXG4vZywgJycpO1xuXG4gIGNvbnN0IGV4cHJlc3Npb24gPSBvLmltcG9ydEV4cHIoUjMuZGVmaW5lQ29tcG9uZW50KS5jYWxsRm4oW2RlZmluaXRpb25NYXAudG9MaXRlcmFsTWFwKCldKTtcbiAgY29uc3QgdHlwZSA9IG5ldyBvLkV4cHJlc3Npb25UeXBlKG8uaW1wb3J0RXhwcihSMy5Db21wb25lbnREZWYsIFtcbiAgICB0eXBlV2l0aFBhcmFtZXRlcnMobWV0YS50eXBlLCBtZXRhLnR5cGVBcmd1bWVudENvdW50KSxcbiAgICBuZXcgby5FeHByZXNzaW9uVHlwZShvLmxpdGVyYWwoc2VsZWN0b3JGb3JUeXBlKSlcbiAgXSkpO1xuXG4gIHJldHVybiB7ZXhwcmVzc2lvbiwgdHlwZX07XG59XG5cbi8qKlxuICogQSB3cmFwcGVyIGFyb3VuZCBgY29tcGlsZURpcmVjdGl2ZWAgd2hpY2ggZGVwZW5kcyBvbiByZW5kZXIyIGdsb2JhbCBhbmFseXNpcyBkYXRhIGFzIGl0cyBpbnB1dFxuICogaW5zdGVhZCBvZiB0aGUgYFIzRGlyZWN0aXZlTWV0YWRhdGFgLlxuICpcbiAqIGBSM0RpcmVjdGl2ZU1ldGFkYXRhYCBpcyBjb21wdXRlZCBmcm9tIGBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFgIGFuZCBvdGhlciBzdGF0aWNhbGx5IHJlZmxlY3RlZFxuICogaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlRGlyZWN0aXZlRnJvbVJlbmRlcjIoXG4gICAgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCBkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIpIHtcbiAgY29uc3QgbmFtZSA9IGlkZW50aWZpZXJOYW1lKGRpcmVjdGl2ZS50eXBlKSAhO1xuICBuYW1lIHx8IGVycm9yKGBDYW5ub3QgcmVzb2x2ZXIgdGhlIG5hbWUgb2YgJHtkaXJlY3RpdmUudHlwZX1gKTtcblxuICBjb25zdCBkZWZpbml0aW9uRmllbGQgPSBvdXRwdXRDdHguY29uc3RhbnRQb29sLnByb3BlcnR5TmFtZU9mKERlZmluaXRpb25LaW5kLkRpcmVjdGl2ZSk7XG5cbiAgY29uc3QgbWV0YSA9IGRpcmVjdGl2ZU1ldGFkYXRhRnJvbUdsb2JhbE1ldGFkYXRhKGRpcmVjdGl2ZSwgb3V0cHV0Q3R4LCByZWZsZWN0b3IpO1xuICBjb25zdCByZXMgPSBjb21waWxlRGlyZWN0aXZlRnJvbU1ldGFkYXRhKG1ldGEsIG91dHB1dEN0eC5jb25zdGFudFBvb2wsIGJpbmRpbmdQYXJzZXIpO1xuXG4gIC8vIENyZWF0ZSB0aGUgcGFydGlhbCBjbGFzcyB0byBiZSBtZXJnZWQgd2l0aCB0aGUgYWN0dWFsIGNsYXNzLlxuICBvdXRwdXRDdHguc3RhdGVtZW50cy5wdXNoKG5ldyBvLkNsYXNzU3RtdChcbiAgICAgIG5hbWUsIG51bGwsXG4gICAgICBbbmV3IG8uQ2xhc3NGaWVsZChkZWZpbml0aW9uRmllbGQsIG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLlN0YXRpY10sIHJlcy5leHByZXNzaW9uKV0sXG4gICAgICBbXSwgbmV3IG8uQ2xhc3NNZXRob2QobnVsbCwgW10sIFtdKSwgW10pKTtcbn1cblxuLyoqXG4gKiBBIHdyYXBwZXIgYXJvdW5kIGBjb21waWxlQ29tcG9uZW50YCB3aGljaCBkZXBlbmRzIG9uIHJlbmRlcjIgZ2xvYmFsIGFuYWx5c2lzIGRhdGEgYXMgaXRzIGlucHV0XG4gKiBpbnN0ZWFkIG9mIHRoZSBgUjNEaXJlY3RpdmVNZXRhZGF0YWAuXG4gKlxuICogYFIzQ29tcG9uZW50TWV0YWRhdGFgIGlzIGNvbXB1dGVkIGZyb20gYENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YWAgYW5kIG90aGVyIHN0YXRpY2FsbHkgcmVmbGVjdGVkXG4gKiBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVDb21wb25lbnRGcm9tUmVuZGVyMihcbiAgICBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQsIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCByZW5kZXIzQXN0OiBSZW5kZXIzUGFyc2VSZXN1bHQsXG4gICAgcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLCBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyLCBkaXJlY3RpdmVUeXBlQnlTZWw6IE1hcDxzdHJpbmcsIGFueT4sXG4gICAgcGlwZVR5cGVCeU5hbWU6IE1hcDxzdHJpbmcsIGFueT4pIHtcbiAgY29uc3QgbmFtZSA9IGlkZW50aWZpZXJOYW1lKGNvbXBvbmVudC50eXBlKSAhO1xuICBuYW1lIHx8IGVycm9yKGBDYW5ub3QgcmVzb2x2ZXIgdGhlIG5hbWUgb2YgJHtjb21wb25lbnQudHlwZX1gKTtcblxuICBjb25zdCBkZWZpbml0aW9uRmllbGQgPSBvdXRwdXRDdHguY29uc3RhbnRQb29sLnByb3BlcnR5TmFtZU9mKERlZmluaXRpb25LaW5kLkNvbXBvbmVudCk7XG5cbiAgY29uc3Qgc3VtbWFyeSA9IGNvbXBvbmVudC50b1N1bW1hcnkoKTtcblxuICAvLyBDb21wdXRlIHRoZSBSM0NvbXBvbmVudE1ldGFkYXRhIGZyb20gdGhlIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVxuICBjb25zdCBtZXRhOiBSM0NvbXBvbmVudE1ldGFkYXRhID0ge1xuICAgIC4uLmRpcmVjdGl2ZU1ldGFkYXRhRnJvbUdsb2JhbE1ldGFkYXRhKGNvbXBvbmVudCwgb3V0cHV0Q3R4LCByZWZsZWN0b3IpLFxuICAgIHNlbGVjdG9yOiBjb21wb25lbnQuc2VsZWN0b3IsXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIG5vZGVzOiByZW5kZXIzQXN0Lm5vZGVzLFxuICAgICAgaGFzTmdDb250ZW50OiByZW5kZXIzQXN0Lmhhc05nQ29udGVudCxcbiAgICAgIG5nQ29udGVudFNlbGVjdG9yczogcmVuZGVyM0FzdC5uZ0NvbnRlbnRTZWxlY3RvcnMsXG4gICAgfSxcbiAgICBkaXJlY3RpdmVzOiB0eXBlTWFwVG9FeHByZXNzaW9uTWFwKGRpcmVjdGl2ZVR5cGVCeVNlbCwgb3V0cHV0Q3R4KSxcbiAgICBwaXBlczogdHlwZU1hcFRvRXhwcmVzc2lvbk1hcChwaXBlVHlwZUJ5TmFtZSwgb3V0cHV0Q3R4KSxcbiAgICB2aWV3UXVlcmllczogcXVlcmllc0Zyb21HbG9iYWxNZXRhZGF0YShjb21wb25lbnQudmlld1F1ZXJpZXMsIG91dHB1dEN0eCksXG4gIH07XG4gIGNvbnN0IHJlcyA9IGNvbXBpbGVDb21wb25lbnRGcm9tTWV0YWRhdGEobWV0YSwgb3V0cHV0Q3R4LmNvbnN0YW50UG9vbCwgYmluZGluZ1BhcnNlcik7XG5cbiAgLy8gQ3JlYXRlIHRoZSBwYXJ0aWFsIGNsYXNzIHRvIGJlIG1lcmdlZCB3aXRoIHRoZSBhY3R1YWwgY2xhc3MuXG4gIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2gobmV3IG8uQ2xhc3NTdG10KFxuICAgICAgbmFtZSwgbnVsbCxcbiAgICAgIFtuZXcgby5DbGFzc0ZpZWxkKGRlZmluaXRpb25GaWVsZCwgby5JTkZFUlJFRF9UWVBFLCBbby5TdG10TW9kaWZpZXIuU3RhdGljXSwgcmVzLmV4cHJlc3Npb24pXSxcbiAgICAgIFtdLCBuZXcgby5DbGFzc01ldGhvZChudWxsLCBbXSwgW10pLCBbXSkpO1xufVxuXG4vKipcbiAqIENvbXB1dGUgYFIzRGlyZWN0aXZlTWV0YWRhdGFgIGdpdmVuIGBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFgIGFuZCBhIGBDb21waWxlUmVmbGVjdG9yYC5cbiAqL1xuZnVuY3Rpb24gZGlyZWN0aXZlTWV0YWRhdGFGcm9tR2xvYmFsTWV0YWRhdGEoXG4gICAgZGlyZWN0aXZlOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCxcbiAgICByZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IpOiBSM0RpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgY29uc3Qgc3VtbWFyeSA9IGRpcmVjdGl2ZS50b1N1bW1hcnkoKTtcbiAgY29uc3QgbmFtZSA9IGlkZW50aWZpZXJOYW1lKGRpcmVjdGl2ZS50eXBlKSAhO1xuICBuYW1lIHx8IGVycm9yKGBDYW5ub3QgcmVzb2x2ZXIgdGhlIG5hbWUgb2YgJHtkaXJlY3RpdmUudHlwZX1gKTtcblxuICByZXR1cm4ge1xuICAgIG5hbWUsXG4gICAgdHlwZTogb3V0cHV0Q3R4LmltcG9ydEV4cHIoZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlKSxcbiAgICB0eXBlQXJndW1lbnRDb3VudDogMCxcbiAgICB0eXBlU291cmNlU3BhbjpcbiAgICAgICAgdHlwZVNvdXJjZVNwYW4oZGlyZWN0aXZlLmlzQ29tcG9uZW50ID8gJ0NvbXBvbmVudCcgOiAnRGlyZWN0aXZlJywgZGlyZWN0aXZlLnR5cGUpLFxuICAgIHNlbGVjdG9yOiBkaXJlY3RpdmUuc2VsZWN0b3IsXG4gICAgZGVwczogZGVwZW5kZW5jaWVzRnJvbUdsb2JhbE1ldGFkYXRhKGRpcmVjdGl2ZS50eXBlLCBvdXRwdXRDdHgsIHJlZmxlY3RvciksXG4gICAgcXVlcmllczogcXVlcmllc0Zyb21HbG9iYWxNZXRhZGF0YShkaXJlY3RpdmUucXVlcmllcywgb3V0cHV0Q3R4KSxcbiAgICBsaWZlY3ljbGU6IHtcbiAgICAgIHVzZXNPbkNoYW5nZXM6XG4gICAgICAgICAgZGlyZWN0aXZlLnR5cGUubGlmZWN5Y2xlSG9va3Muc29tZShsaWZlY3ljbGUgPT4gbGlmZWN5Y2xlID09IExpZmVjeWNsZUhvb2tzLk9uQ2hhbmdlcyksXG4gICAgfSxcbiAgICBob3N0OiB7XG4gICAgICBhdHRyaWJ1dGVzOiBkaXJlY3RpdmUuaG9zdEF0dHJpYnV0ZXMsXG4gICAgICBsaXN0ZW5lcnM6IHN1bW1hcnkuaG9zdExpc3RlbmVycyxcbiAgICAgIHByb3BlcnRpZXM6IHN1bW1hcnkuaG9zdFByb3BlcnRpZXMsXG4gICAgfSxcbiAgICBpbnB1dHM6IGRpcmVjdGl2ZS5pbnB1dHMsXG4gICAgb3V0cHV0czogZGlyZWN0aXZlLm91dHB1dHMsXG4gICAgdXNlc0luaGVyaXRhbmNlOiBmYWxzZSxcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGBDb21waWxlUXVlcnlNZXRhZGF0YWAgaW50byBgUjNRdWVyeU1ldGFkYXRhYC5cbiAqL1xuZnVuY3Rpb24gcXVlcmllc0Zyb21HbG9iYWxNZXRhZGF0YShcbiAgICBxdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLCBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQpOiBSM1F1ZXJ5TWV0YWRhdGFbXSB7XG4gIHJldHVybiBxdWVyaWVzLm1hcChxdWVyeSA9PiB7XG4gICAgbGV0IHJlYWQ6IG8uRXhwcmVzc2lvbnxudWxsID0gbnVsbDtcbiAgICBpZiAocXVlcnkucmVhZCAmJiBxdWVyeS5yZWFkLmlkZW50aWZpZXIpIHtcbiAgICAgIHJlYWQgPSBvdXRwdXRDdHguaW1wb3J0RXhwcihxdWVyeS5yZWFkLmlkZW50aWZpZXIucmVmZXJlbmNlKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3BlcnR5TmFtZTogcXVlcnkucHJvcGVydHlOYW1lLFxuICAgICAgZmlyc3Q6IHF1ZXJ5LmZpcnN0LFxuICAgICAgcHJlZGljYXRlOiBzZWxlY3RvcnNGcm9tR2xvYmFsTWV0YWRhdGEocXVlcnkuc2VsZWN0b3JzLCBvdXRwdXRDdHgpLFxuICAgICAgZGVzY2VuZGFudHM6IHF1ZXJ5LmRlc2NlbmRhbnRzLCByZWFkLFxuICAgIH07XG4gIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYENvbXBpbGVUb2tlbk1ldGFkYXRhYCBmb3IgcXVlcnkgc2VsZWN0b3JzIGludG8gZWl0aGVyIGFuIGV4cHJlc3Npb24gZm9yIGEgcHJlZGljYXRlXG4gKiB0eXBlLCBvciBhIGxpc3Qgb2Ygc3RyaW5nIHByZWRpY2F0ZXMuXG4gKi9cbmZ1bmN0aW9uIHNlbGVjdG9yc0Zyb21HbG9iYWxNZXRhZGF0YShcbiAgICBzZWxlY3RvcnM6IENvbXBpbGVUb2tlbk1ldGFkYXRhW10sIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCk6IG8uRXhwcmVzc2lvbnxzdHJpbmdbXSB7XG4gIGlmIChzZWxlY3RvcnMubGVuZ3RoID4gMSB8fCAoc2VsZWN0b3JzLmxlbmd0aCA9PSAxICYmIHNlbGVjdG9yc1swXS52YWx1ZSkpIHtcbiAgICBjb25zdCBzZWxlY3RvclN0cmluZ3MgPSBzZWxlY3RvcnMubWFwKHZhbHVlID0+IHZhbHVlLnZhbHVlIGFzIHN0cmluZyk7XG4gICAgc2VsZWN0b3JTdHJpbmdzLnNvbWUodmFsdWUgPT4gIXZhbHVlKSAmJlxuICAgICAgICBlcnJvcignRm91bmQgYSB0eXBlIGFtb25nIHRoZSBzdHJpbmcgc2VsZWN0b3JzIGV4cGVjdGVkJyk7XG4gICAgcmV0dXJuIG91dHB1dEN0eC5jb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKFxuICAgICAgICBvLmxpdGVyYWxBcnIoc2VsZWN0b3JTdHJpbmdzLm1hcCh2YWx1ZSA9PiBvLmxpdGVyYWwodmFsdWUpKSkpO1xuICB9XG5cbiAgaWYgKHNlbGVjdG9ycy5sZW5ndGggPT0gMSkge1xuICAgIGNvbnN0IGZpcnN0ID0gc2VsZWN0b3JzWzBdO1xuICAgIGlmIChmaXJzdC5pZGVudGlmaWVyKSB7XG4gICAgICByZXR1cm4gb3V0cHV0Q3R4LmltcG9ydEV4cHIoZmlyc3QuaWRlbnRpZmllci5yZWZlcmVuY2UpO1xuICAgIH1cbiAgfVxuXG4gIGVycm9yKCdVbmV4cGVjdGVkIHF1ZXJ5IGZvcm0nKTtcbiAgcmV0dXJuIG8uTlVMTF9FWFBSO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVRdWVyeURlZmluaXRpb24oXG4gICAgcXVlcnk6IFIzUXVlcnlNZXRhZGF0YSwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsIGlkeDogbnVtYmVyIHwgbnVsbCk6IG8uRXhwcmVzc2lvbiB7XG4gIGNvbnN0IHByZWRpY2F0ZSA9IGdldFF1ZXJ5UHJlZGljYXRlKHF1ZXJ5LCBjb25zdGFudFBvb2wpO1xuXG4gIC8vIGUuZy4gcjMuUShudWxsLCBzb21lUHJlZGljYXRlLCBmYWxzZSkgb3IgcjMuUSgwLCBbJ2RpdiddLCBmYWxzZSlcbiAgY29uc3QgcGFyYW1ldGVycyA9IFtcbiAgICBvLmxpdGVyYWwoaWR4LCBvLklORkVSUkVEX1RZUEUpLFxuICAgIHByZWRpY2F0ZSxcbiAgICBvLmxpdGVyYWwocXVlcnkuZGVzY2VuZGFudHMpLFxuICBdO1xuXG4gIGlmIChxdWVyeS5yZWFkKSB7XG4gICAgcGFyYW1ldGVycy5wdXNoKHF1ZXJ5LnJlYWQpO1xuICB9XG5cbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5xdWVyeSkuY2FsbEZuKHBhcmFtZXRlcnMpO1xufVxuXG4vLyBUdXJuIGEgZGlyZWN0aXZlIHNlbGVjdG9yIGludG8gYW4gUjMtY29tcGF0aWJsZSBzZWxlY3RvciBmb3IgZGlyZWN0aXZlIGRlZlxuZnVuY3Rpb24gY3JlYXRlRGlyZWN0aXZlU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IG8uRXhwcmVzc2lvbiB7XG4gIHJldHVybiBhc0xpdGVyYWwoY29yZS5wYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yKHNlbGVjdG9yKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhvc3RBdHRyaWJ1dGVzQXJyYXkobWV0YTogUjNEaXJlY3RpdmVNZXRhZGF0YSk6IG8uRXhwcmVzc2lvbnxudWxsIHtcbiAgY29uc3QgdmFsdWVzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICBjb25zdCBhdHRyaWJ1dGVzID0gbWV0YS5ob3N0LmF0dHJpYnV0ZXM7XG4gIGZvciAobGV0IGtleSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhdHRyaWJ1dGVzKSkge1xuICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1trZXldO1xuICAgIHZhbHVlcy5wdXNoKG8ubGl0ZXJhbChrZXkpLCBvLmxpdGVyYWwodmFsdWUpKTtcbiAgfVxuICBpZiAodmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gby5saXRlcmFsQXJyKHZhbHVlcyk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIFJldHVybiBhIGNvbnRlbnRRdWVyaWVzIGZ1bmN0aW9uIG9yIG51bGwgaWYgb25lIGlzIG5vdCBuZWNlc3NhcnkuXG5mdW5jdGlvbiBjcmVhdGVDb250ZW50UXVlcmllc0Z1bmN0aW9uKFxuICAgIG1ldGE6IFIzRGlyZWN0aXZlTWV0YWRhdGEsIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sKTogby5FeHByZXNzaW9ufG51bGwge1xuICBpZiAobWV0YS5xdWVyaWVzLmxlbmd0aCkge1xuICAgIGNvbnN0IHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBtZXRhLnF1ZXJpZXMubWFwKChxdWVyeTogUjNRdWVyeU1ldGFkYXRhKSA9PiB7XG4gICAgICBjb25zdCBxdWVyeURlZmluaXRpb24gPSBjcmVhdGVRdWVyeURlZmluaXRpb24ocXVlcnksIGNvbnN0YW50UG9vbCwgbnVsbCk7XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLnJlZ2lzdGVyQ29udGVudFF1ZXJ5KS5jYWxsRm4oW3F1ZXJ5RGVmaW5pdGlvbl0pLnRvU3RtdCgpO1xuICAgIH0pO1xuICAgIGNvbnN0IHR5cGVOYW1lID0gbWV0YS5uYW1lO1xuICAgIHJldHVybiBvLmZuKFxuICAgICAgICBbXSwgc3RhdGVtZW50cywgby5JTkZFUlJFRF9UWVBFLCBudWxsLCB0eXBlTmFtZSA/IGAke3R5cGVOYW1lfV9Db250ZW50UXVlcmllc2AgOiBudWxsKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG4vLyBSZXR1cm4gYSBjb250ZW50UXVlcmllc1JlZnJlc2ggZnVuY3Rpb24gb3IgbnVsbCBpZiBvbmUgaXMgbm90IG5lY2Vzc2FyeS5cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRlbnRRdWVyaWVzUmVmcmVzaEZ1bmN0aW9uKG1ldGE6IFIzRGlyZWN0aXZlTWV0YWRhdGEpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gIGlmIChtZXRhLnF1ZXJpZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgICBjb25zdCB0eXBlTmFtZSA9IG1ldGEubmFtZTtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gW1xuICAgICAgbmV3IG8uRm5QYXJhbSgnZGlySW5kZXgnLCBvLk5VTUJFUl9UWVBFKSxcbiAgICAgIG5ldyBvLkZuUGFyYW0oJ3F1ZXJ5U3RhcnRJbmRleCcsIG8uTlVNQkVSX1RZUEUpLFxuICAgIF07XG4gICAgY29uc3QgZGlyZWN0aXZlSW5zdGFuY2VWYXIgPSBvLnZhcmlhYmxlKCdpbnN0YW5jZScpO1xuICAgIC8vIHZhciAkdG1wJDogYW55O1xuICAgIGNvbnN0IHRlbXBvcmFyeSA9IHRlbXBvcmFyeUFsbG9jYXRvcihzdGF0ZW1lbnRzLCBURU1QT1JBUllfTkFNRSk7XG5cbiAgICAvLyBjb25zdCAkaW5zdGFuY2UkID0gJHIzJC7JtWQoZGlySW5kZXgpO1xuICAgIHN0YXRlbWVudHMucHVzaChcbiAgICAgICAgZGlyZWN0aXZlSW5zdGFuY2VWYXIuc2V0KG8uaW1wb3J0RXhwcihSMy5sb2FkRGlyZWN0aXZlKS5jYWxsRm4oW28udmFyaWFibGUoJ2RpckluZGV4JyldKSlcbiAgICAgICAgICAgIC50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuXG4gICAgbWV0YS5xdWVyaWVzLmZvckVhY2goKHF1ZXJ5OiBSM1F1ZXJ5TWV0YWRhdGEsIGlkeDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBsb2FkUUxBcmcgPSBvLnZhcmlhYmxlKCdxdWVyeVN0YXJ0SW5kZXgnKTtcbiAgICAgIGNvbnN0IGdldFF1ZXJ5TGlzdCA9IG8uaW1wb3J0RXhwcihSMy5sb2FkUXVlcnlMaXN0KS5jYWxsRm4oW1xuICAgICAgICBpZHggPiAwID8gbG9hZFFMQXJnLnBsdXMoby5saXRlcmFsKGlkeCkpIDogbG9hZFFMQXJnXG4gICAgICBdKTtcbiAgICAgIGNvbnN0IGFzc2lnblRvVGVtcG9yYXJ5ID0gdGVtcG9yYXJ5KCkuc2V0KGdldFF1ZXJ5TGlzdCk7XG4gICAgICBjb25zdCBjYWxsUXVlcnlSZWZyZXNoID0gby5pbXBvcnRFeHByKFIzLnF1ZXJ5UmVmcmVzaCkuY2FsbEZuKFthc3NpZ25Ub1RlbXBvcmFyeV0pO1xuXG4gICAgICBjb25zdCB1cGRhdGVEaXJlY3RpdmUgPSBkaXJlY3RpdmVJbnN0YW5jZVZhci5wcm9wKHF1ZXJ5LnByb3BlcnR5TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KHF1ZXJ5LmZpcnN0ID8gdGVtcG9yYXJ5KCkucHJvcCgnZmlyc3QnKSA6IHRlbXBvcmFyeSgpKTtcbiAgICAgIGNvbnN0IHJlZnJlc2hRdWVyeUFuZFVwZGF0ZURpcmVjdGl2ZSA9IGNhbGxRdWVyeVJlZnJlc2guYW5kKHVwZGF0ZURpcmVjdGl2ZSk7XG5cbiAgICAgIHN0YXRlbWVudHMucHVzaChyZWZyZXNoUXVlcnlBbmRVcGRhdGVEaXJlY3RpdmUudG9TdG10KCkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG8uZm4oXG4gICAgICAgIHBhcmFtZXRlcnMsIHN0YXRlbWVudHMsIG8uSU5GRVJSRURfVFlQRSwgbnVsbCxcbiAgICAgICAgdHlwZU5hbWUgPyBgJHt0eXBlTmFtZX1fQ29udGVudFF1ZXJpZXNSZWZyZXNoYCA6IG51bGwpO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIERlZmluZSBhbmQgdXBkYXRlIGFueSB2aWV3IHF1ZXJpZXNcbmZ1bmN0aW9uIGNyZWF0ZVZpZXdRdWVyaWVzRnVuY3Rpb24oXG4gICAgbWV0YTogUjNDb21wb25lbnRNZXRhZGF0YSwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wpOiBvLkV4cHJlc3Npb24ge1xuICBjb25zdCBjcmVhdGVTdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gIGNvbnN0IHVwZGF0ZVN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgY29uc3QgdGVtcEFsbG9jYXRvciA9IHRlbXBvcmFyeUFsbG9jYXRvcih1cGRhdGVTdGF0ZW1lbnRzLCBURU1QT1JBUllfTkFNRSk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXRhLnZpZXdRdWVyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcXVlcnkgPSBtZXRhLnZpZXdRdWVyaWVzW2ldO1xuXG4gICAgLy8gY3JlYXRpb24sIGUuZy4gcjMuUSgwLCBzb21lUHJlZGljYXRlLCB0cnVlKTtcbiAgICBjb25zdCBxdWVyeURlZmluaXRpb24gPSBjcmVhdGVRdWVyeURlZmluaXRpb24ocXVlcnksIGNvbnN0YW50UG9vbCwgaSk7XG4gICAgY3JlYXRlU3RhdGVtZW50cy5wdXNoKHF1ZXJ5RGVmaW5pdGlvbi50b1N0bXQoKSk7XG5cbiAgICAvLyB1cGRhdGUsIGUuZy4gKHIzLnFSKHRtcCA9IHIzLsm1bGQoMCkpICYmIChjdHguc29tZURpciA9IHRtcCkpO1xuICAgIGNvbnN0IHRlbXBvcmFyeSA9IHRlbXBBbGxvY2F0b3IoKTtcbiAgICBjb25zdCBnZXRRdWVyeUxpc3QgPSBvLmltcG9ydEV4cHIoUjMubG9hZCkuY2FsbEZuKFtvLmxpdGVyYWwoaSldKTtcbiAgICBjb25zdCByZWZyZXNoID0gby5pbXBvcnRFeHByKFIzLnF1ZXJ5UmVmcmVzaCkuY2FsbEZuKFt0ZW1wb3Jhcnkuc2V0KGdldFF1ZXJ5TGlzdCldKTtcbiAgICBjb25zdCB1cGRhdGVEaXJlY3RpdmUgPSBvLnZhcmlhYmxlKENPTlRFWFRfTkFNRSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AocXVlcnkucHJvcGVydHlOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KHF1ZXJ5LmZpcnN0ID8gdGVtcG9yYXJ5LnByb3AoJ2ZpcnN0JykgOiB0ZW1wb3JhcnkpO1xuICAgIHVwZGF0ZVN0YXRlbWVudHMucHVzaChyZWZyZXNoLmFuZCh1cGRhdGVEaXJlY3RpdmUpLnRvU3RtdCgpKTtcbiAgfVxuXG4gIGNvbnN0IHZpZXdRdWVyeUZuTmFtZSA9IG1ldGEubmFtZSA/IGAke21ldGEubmFtZX1fUXVlcnlgIDogbnVsbDtcbiAgcmV0dXJuIG8uZm4oXG4gICAgICBbbmV3IG8uRm5QYXJhbShSRU5ERVJfRkxBR1MsIG8uTlVNQkVSX1RZUEUpLCBuZXcgby5GblBhcmFtKENPTlRFWFRfTkFNRSwgbnVsbCldLFxuICAgICAgW1xuICAgICAgICByZW5kZXJGbGFnQ2hlY2tJZlN0bXQoY29yZS5SZW5kZXJGbGFncy5DcmVhdGUsIGNyZWF0ZVN0YXRlbWVudHMpLFxuICAgICAgICByZW5kZXJGbGFnQ2hlY2tJZlN0bXQoY29yZS5SZW5kZXJGbGFncy5VcGRhdGUsIHVwZGF0ZVN0YXRlbWVudHMpXG4gICAgICBdLFxuICAgICAgby5JTkZFUlJFRF9UWVBFLCBudWxsLCB2aWV3UXVlcnlGbk5hbWUpO1xufVxuXG4vLyBSZXR1cm4gYSBob3N0IGJpbmRpbmcgZnVuY3Rpb24gb3IgbnVsbCBpZiBvbmUgaXMgbm90IG5lY2Vzc2FyeS5cbmZ1bmN0aW9uIGNyZWF0ZUhvc3RCaW5kaW5nc0Z1bmN0aW9uKFxuICAgIG1ldGE6IFIzRGlyZWN0aXZlTWV0YWRhdGEsIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gIGNvbnN0IHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcblxuICBjb25zdCBob3N0QmluZGluZ1NvdXJjZVNwYW4gPSBtZXRhLnR5cGVTb3VyY2VTcGFuO1xuXG4gIGNvbnN0IGRpcmVjdGl2ZVN1bW1hcnkgPSBtZXRhZGF0YUFzU3VtbWFyeShtZXRhKTtcblxuICAvLyBDYWxjdWxhdGUgdGhlIGhvc3QgcHJvcGVydHkgYmluZGluZ3NcbiAgY29uc3QgYmluZGluZ3MgPSBiaW5kaW5nUGFyc2VyLmNyZWF0ZUJvdW5kSG9zdFByb3BlcnRpZXMoZGlyZWN0aXZlU3VtbWFyeSwgaG9zdEJpbmRpbmdTb3VyY2VTcGFuKTtcbiAgY29uc3QgYmluZGluZ0NvbnRleHQgPSBvLmltcG9ydEV4cHIoUjMubG9hZERpcmVjdGl2ZSkuY2FsbEZuKFtvLnZhcmlhYmxlKCdkaXJJbmRleCcpXSk7XG4gIGlmIChiaW5kaW5ncykge1xuICAgIGZvciAoY29uc3QgYmluZGluZyBvZiBiaW5kaW5ncykge1xuICAgICAgY29uc3QgYmluZGluZ0V4cHIgPSBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKFxuICAgICAgICAgIG51bGwsIGJpbmRpbmdDb250ZXh0LCBiaW5kaW5nLmV4cHJlc3Npb24sICdiJywgQmluZGluZ0Zvcm0uVHJ5U2ltcGxlLFxuICAgICAgICAgICgpID0+IGVycm9yKCdVbmV4cGVjdGVkIGludGVycG9sYXRpb24nKSk7XG4gICAgICBzdGF0ZW1lbnRzLnB1c2goLi4uYmluZGluZ0V4cHIuc3RtdHMpO1xuICAgICAgc3RhdGVtZW50cy5wdXNoKG8uaW1wb3J0RXhwcihSMy5lbGVtZW50UHJvcGVydHkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsRm4oW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8udmFyaWFibGUoJ2VsSW5kZXgnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwoYmluZGluZy5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmltcG9ydEV4cHIoUjMuYmluZCkuY2FsbEZuKFtiaW5kaW5nRXhwci5jdXJyVmFsRXhwcl0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAudG9TdG10KCkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIENhbGN1bGF0ZSBob3N0IGV2ZW50IGJpbmRpbmdzXG4gIGNvbnN0IGV2ZW50QmluZGluZ3MgPVxuICAgICAgYmluZGluZ1BhcnNlci5jcmVhdGVEaXJlY3RpdmVIb3N0RXZlbnRBc3RzKGRpcmVjdGl2ZVN1bW1hcnksIGhvc3RCaW5kaW5nU291cmNlU3Bhbik7XG4gIGlmIChldmVudEJpbmRpbmdzKSB7XG4gICAgZm9yIChjb25zdCBiaW5kaW5nIG9mIGV2ZW50QmluZGluZ3MpIHtcbiAgICAgIGNvbnN0IGJpbmRpbmdFeHByID0gY29udmVydEFjdGlvbkJpbmRpbmcoXG4gICAgICAgICAgbnVsbCwgYmluZGluZ0NvbnRleHQsIGJpbmRpbmcuaGFuZGxlciwgJ2InLCAoKSA9PiBlcnJvcignVW5leHBlY3RlZCBpbnRlcnBvbGF0aW9uJykpO1xuICAgICAgY29uc3QgYmluZGluZ05hbWUgPSBiaW5kaW5nLm5hbWUgJiYgc2FuaXRpemVJZGVudGlmaWVyKGJpbmRpbmcubmFtZSk7XG4gICAgICBjb25zdCB0eXBlTmFtZSA9IG1ldGEubmFtZTtcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9XG4gICAgICAgICAgdHlwZU5hbWUgJiYgYmluZGluZ05hbWUgPyBgJHt0eXBlTmFtZX1fJHtiaW5kaW5nTmFtZX1fSG9zdEJpbmRpbmdIYW5kbGVyYCA6IG51bGw7XG4gICAgICBjb25zdCBoYW5kbGVyID0gby5mbihcbiAgICAgICAgICBbbmV3IG8uRm5QYXJhbSgnJGV2ZW50Jywgby5EWU5BTUlDX1RZUEUpXSxcbiAgICAgICAgICBbLi4uYmluZGluZ0V4cHIuc3RtdHMsIG5ldyBvLlJldHVyblN0YXRlbWVudChiaW5kaW5nRXhwci5hbGxvd0RlZmF1bHQpXSwgby5JTkZFUlJFRF9UWVBFLFxuICAgICAgICAgIG51bGwsIGZ1bmN0aW9uTmFtZSk7XG4gICAgICBzdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgICAgby5pbXBvcnRFeHByKFIzLmxpc3RlbmVyKS5jYWxsRm4oW28ubGl0ZXJhbChiaW5kaW5nLm5hbWUpLCBoYW5kbGVyXSkudG9TdG10KCkpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzdGF0ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCB0eXBlTmFtZSA9IG1ldGEubmFtZTtcbiAgICByZXR1cm4gby5mbihcbiAgICAgICAgW1xuICAgICAgICAgIG5ldyBvLkZuUGFyYW0oJ2RpckluZGV4Jywgby5OVU1CRVJfVFlQRSksXG4gICAgICAgICAgbmV3IG8uRm5QYXJhbSgnZWxJbmRleCcsIG8uTlVNQkVSX1RZUEUpLFxuICAgICAgICBdLFxuICAgICAgICBzdGF0ZW1lbnRzLCBvLklORkVSUkVEX1RZUEUsIG51bGwsIHR5cGVOYW1lID8gYCR7dHlwZU5hbWV9X0hvc3RCaW5kaW5nc2AgOiBudWxsKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBtZXRhZGF0YUFzU3VtbWFyeShtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhKTogQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnkge1xuICAvLyBjbGFuZy1mb3JtYXQgb2ZmXG4gIHJldHVybiB7XG4gICAgaG9zdEF0dHJpYnV0ZXM6IG1ldGEuaG9zdC5hdHRyaWJ1dGVzLFxuICAgIGhvc3RMaXN0ZW5lcnM6IG1ldGEuaG9zdC5saXN0ZW5lcnMsXG4gICAgaG9zdFByb3BlcnRpZXM6IG1ldGEuaG9zdC5wcm9wZXJ0aWVzLFxuICB9IGFzIENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5O1xuICAvLyBjbGFuZy1mb3JtYXQgb25cbn1cblxuXG5mdW5jdGlvbiB0eXBlTWFwVG9FeHByZXNzaW9uTWFwKFxuICAgIG1hcDogTWFwPHN0cmluZywgU3RhdGljU3ltYm9sPiwgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0KTogTWFwPHN0cmluZywgby5FeHByZXNzaW9uPiB7XG4gIC8vIENvbnZlcnQgZWFjaCBtYXAgZW50cnkgaW50byBhbm90aGVyIGVudHJ5IHdoZXJlIHRoZSB2YWx1ZSBpcyBhbiBleHByZXNzaW9uIGltcG9ydGluZyB0aGUgdHlwZS5cbiAgY29uc3QgZW50cmllcyA9IEFycmF5LmZyb20obWFwKS5tYXAoXG4gICAgICAoW2tleSwgdHlwZV0pOiBbc3RyaW5nLCBvLkV4cHJlc3Npb25dID0+IFtrZXksIG91dHB1dEN0eC5pbXBvcnRFeHByKHR5cGUpXSk7XG4gIHJldHVybiBuZXcgTWFwKGVudHJpZXMpO1xufVxuXG5jb25zdCBIT1NUX1JFR19FWFAgPSAvXig/Oig/OlxcWyhbXlxcXV0rKVxcXSl8KD86XFwoKFteXFwpXSspXFwpKSl8KFxcQFstXFx3XSspJC87XG5cbi8vIFJlcHJlc2VudHMgdGhlIGdyb3VwcyBpbiB0aGUgYWJvdmUgcmVnZXguXG5jb25zdCBlbnVtIEhvc3RCaW5kaW5nR3JvdXAge1xuICAvLyBncm91cCAxOiBcInByb3BcIiBmcm9tIFwiW3Byb3BdXCJcbiAgUHJvcGVydHkgPSAxLFxuXG4gIC8vIGdyb3VwIDI6IFwiZXZlbnRcIiBmcm9tIFwiKGV2ZW50KVwiXG4gIEV2ZW50ID0gMixcblxuICAvLyBncm91cCAzOiBcIkB0cmlnZ2VyXCIgZnJvbSBcIkB0cmlnZ2VyXCJcbiAgQW5pbWF0aW9uID0gMyxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSG9zdEJpbmRpbmdzKGhvc3Q6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KToge1xuICBhdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgbGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgcHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gIGFuaW1hdGlvbnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxufSB7XG4gIGNvbnN0IGF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGNvbnN0IGxpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgY29uc3QgcHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgY29uc3QgYW5pbWF0aW9uczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcblxuICBPYmplY3Qua2V5cyhob3N0KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSBob3N0W2tleV07XG4gICAgY29uc3QgbWF0Y2hlcyA9IGtleS5tYXRjaChIT1NUX1JFR19FWFApO1xuICAgIGlmIChtYXRjaGVzID09PSBudWxsKSB7XG4gICAgICBhdHRyaWJ1dGVzW2tleV0gPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKG1hdGNoZXNbSG9zdEJpbmRpbmdHcm91cC5Qcm9wZXJ0eV0gIT0gbnVsbCkge1xuICAgICAgcHJvcGVydGllc1ttYXRjaGVzW0hvc3RCaW5kaW5nR3JvdXAuUHJvcGVydHldXSA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAobWF0Y2hlc1tIb3N0QmluZGluZ0dyb3VwLkV2ZW50XSAhPSBudWxsKSB7XG4gICAgICBsaXN0ZW5lcnNbbWF0Y2hlc1tIb3N0QmluZGluZ0dyb3VwLkV2ZW50XV0gPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKG1hdGNoZXNbSG9zdEJpbmRpbmdHcm91cC5BbmltYXRpb25dICE9IG51bGwpIHtcbiAgICAgIGFuaW1hdGlvbnNbbWF0Y2hlc1tIb3N0QmluZGluZ0dyb3VwLkFuaW1hdGlvbl1dID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge2F0dHJpYnV0ZXMsIGxpc3RlbmVycywgcHJvcGVydGllcywgYW5pbWF0aW9uc307XG59XG4iXX0=