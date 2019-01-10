/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { rendererTypeName, tokenReference, viewClassName } from '../compile_metadata';
import { BindingForm, EventHandlerVars, convertActionBinding, convertPropertyBinding, convertPropertyBindingBuiltins } from '../compiler_util/expression_converter';
import { ChangeDetectionStrategy } from '../core';
import { Identifiers } from '../identifiers';
import { LifecycleHooks } from '../lifecycle_reflector';
import { isNgContainer } from '../ml_parser/tags';
import * as o from '../output/output_ast';
import { convertValueToOutputAst } from '../output/value_util';
import { ElementAst, EmbeddedTemplateAst, NgContentAst, templateVisitAll } from '../template_parser/template_ast';
import { componentFactoryResolverProviderDef, depDef, lifecycleHookToNodeFlag, providerDef } from './provider_compiler';
var CLASS_ATTR = 'class';
var STYLE_ATTR = 'style';
var IMPLICIT_TEMPLATE_VAR = '\$implicit';
var ViewCompileResult = /** @class */ (function () {
    function ViewCompileResult(viewClassVar, rendererTypeVar) {
        this.viewClassVar = viewClassVar;
        this.rendererTypeVar = rendererTypeVar;
    }
    return ViewCompileResult;
}());
export { ViewCompileResult };
var ViewCompiler = /** @class */ (function () {
    function ViewCompiler(_reflector) {
        this._reflector = _reflector;
    }
    ViewCompiler.prototype.compileComponent = function (outputCtx, component, template, styles, usedPipes) {
        var _this = this;
        var embeddedViewCount = 0;
        var staticQueryIds = findStaticQueryIds(template);
        var renderComponentVarName = undefined;
        if (!component.isHost) {
            var template_1 = component.template;
            var customRenderData = [];
            if (template_1.animations && template_1.animations.length) {
                customRenderData.push(new o.LiteralMapEntry('animation', convertValueToOutputAst(outputCtx, template_1.animations), true));
            }
            var renderComponentVar = o.variable(rendererTypeName(component.type.reference));
            renderComponentVarName = renderComponentVar.name;
            outputCtx.statements.push(renderComponentVar
                .set(o.importExpr(Identifiers.createRendererType2).callFn([new o.LiteralMapExpr([
                    new o.LiteralMapEntry('encapsulation', o.literal(template_1.encapsulation), false),
                    new o.LiteralMapEntry('styles', styles, false),
                    new o.LiteralMapEntry('data', new o.LiteralMapExpr(customRenderData), false)
                ])]))
                .toDeclStmt(o.importType(Identifiers.RendererType2), [o.StmtModifier.Final, o.StmtModifier.Exported]));
        }
        var viewBuilderFactory = function (parent) {
            var embeddedViewIndex = embeddedViewCount++;
            return new ViewBuilder(_this._reflector, outputCtx, parent, component, embeddedViewIndex, usedPipes, staticQueryIds, viewBuilderFactory);
        };
        var visitor = viewBuilderFactory(null);
        visitor.visitAll([], template);
        (_a = outputCtx.statements).push.apply(_a, tslib_1.__spread(visitor.build()));
        return new ViewCompileResult(visitor.viewName, renderComponentVarName);
        var _a;
    };
    return ViewCompiler;
}());
export { ViewCompiler };
var LOG_VAR = o.variable('_l');
var VIEW_VAR = o.variable('_v');
var CHECK_VAR = o.variable('_ck');
var COMP_VAR = o.variable('_co');
var EVENT_NAME_VAR = o.variable('en');
var ALLOW_DEFAULT_VAR = o.variable("ad");
var ViewBuilder = /** @class */ (function () {
    function ViewBuilder(reflector, outputCtx, parent, component, embeddedViewIndex, usedPipes, staticQueryIds, viewBuilderFactory) {
        this.reflector = reflector;
        this.outputCtx = outputCtx;
        this.parent = parent;
        this.component = component;
        this.embeddedViewIndex = embeddedViewIndex;
        this.usedPipes = usedPipes;
        this.staticQueryIds = staticQueryIds;
        this.viewBuilderFactory = viewBuilderFactory;
        this.nodes = [];
        this.purePipeNodeIndices = Object.create(null);
        // Need Object.create so that we don't have builtin values...
        this.refNodeIndices = Object.create(null);
        this.variables = [];
        this.children = [];
        // TODO(tbosch): The old view compiler used to use an `any` type
        // for the context in any embedded view. We keep this behaivor for now
        // to be able to introduce the new view compiler without too many errors.
        this.compType = this.embeddedViewIndex > 0 ?
            o.DYNAMIC_TYPE :
            o.expressionType(outputCtx.importExpr(this.component.type.reference));
        this.viewName = viewClassName(this.component.type.reference, this.embeddedViewIndex);
    }
    ViewBuilder.prototype.visitAll = function (variables, astNodes) {
        var _this = this;
        this.variables = variables;
        // create the pipes for the pure pipes immediately, so that we know their indices.
        if (!this.parent) {
            this.usedPipes.forEach(function (pipe) {
                if (pipe.pure) {
                    _this.purePipeNodeIndices[pipe.name] = _this._createPipe(null, pipe);
                }
            });
        }
        if (!this.parent) {
            var queryIds_1 = staticViewQueryIds(this.staticQueryIds);
            this.component.viewQueries.forEach(function (query, queryIndex) {
                // Note: queries start with id 1 so we can use the number in a Bloom filter!
                var queryId = queryIndex + 1;
                var bindingType = query.first ? 0 /* First */ : 1 /* All */;
                var flags = 134217728 /* TypeViewQuery */ | calcStaticDynamicQueryFlags(queryIds_1, queryId, query.first);
                _this.nodes.push(function () { return ({
                    sourceSpan: null,
                    nodeFlags: flags,
                    nodeDef: o.importExpr(Identifiers.queryDef).callFn([
                        o.literal(flags), o.literal(queryId),
                        new o.LiteralMapExpr([new o.LiteralMapEntry(query.propertyName, o.literal(bindingType), false)])
                    ])
                }); });
            });
        }
        templateVisitAll(this, astNodes);
        if (this.parent && (astNodes.length === 0 || needsAdditionalRootNode(astNodes))) {
            // if the view is an embedded view, then we need to add an additional root node in some cases
            this.nodes.push(function () { return ({
                sourceSpan: null,
                nodeFlags: 1 /* TypeElement */,
                nodeDef: o.importExpr(Identifiers.anchorDef).callFn([
                    o.literal(0 /* None */), o.NULL_EXPR, o.NULL_EXPR, o.literal(0)
                ])
            }); });
        }
    };
    ViewBuilder.prototype.build = function (targetStatements) {
        if (targetStatements === void 0) { targetStatements = []; }
        this.children.forEach(function (child) { return child.build(targetStatements); });
        var _a = this._createNodeExpressions(), updateRendererStmts = _a.updateRendererStmts, updateDirectivesStmts = _a.updateDirectivesStmts, nodeDefExprs = _a.nodeDefExprs;
        var updateRendererFn = this._createUpdateFn(updateRendererStmts);
        var updateDirectivesFn = this._createUpdateFn(updateDirectivesStmts);
        var viewFlags = 0 /* None */;
        if (!this.parent && this.component.changeDetection === ChangeDetectionStrategy.OnPush) {
            viewFlags |= 2 /* OnPush */;
        }
        var viewFactory = new o.DeclareFunctionStmt(this.viewName, [new o.FnParam(LOG_VAR.name)], [new o.ReturnStatement(o.importExpr(Identifiers.viewDef).callFn([
                o.literal(viewFlags),
                o.literalArr(nodeDefExprs),
                updateDirectivesFn,
                updateRendererFn,
            ]))], o.importType(Identifiers.ViewDefinition), this.embeddedViewIndex === 0 ? [o.StmtModifier.Exported] : []);
        targetStatements.push(viewFactory);
        return targetStatements;
    };
    ViewBuilder.prototype._createUpdateFn = function (updateStmts) {
        var updateFn;
        if (updateStmts.length > 0) {
            var preStmts = [];
            if (!this.component.isHost && o.findReadVarNames(updateStmts).has(COMP_VAR.name)) {
                preStmts.push(COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(this.compType));
            }
            updateFn = o.fn([
                new o.FnParam(CHECK_VAR.name, o.INFERRED_TYPE),
                new o.FnParam(VIEW_VAR.name, o.INFERRED_TYPE)
            ], tslib_1.__spread(preStmts, updateStmts), o.INFERRED_TYPE);
        }
        else {
            updateFn = o.NULL_EXPR;
        }
        return updateFn;
    };
    ViewBuilder.prototype.visitNgContent = function (ast, context) {
        // ngContentDef(ngContentIndex: number, index: number): NodeDef;
        this.nodes.push(function () { return ({
            sourceSpan: ast.sourceSpan,
            nodeFlags: 8 /* TypeNgContent */,
            nodeDef: o.importExpr(Identifiers.ngContentDef).callFn([
                o.literal(ast.ngContentIndex), o.literal(ast.index)
            ])
        }); });
    };
    ViewBuilder.prototype.visitText = function (ast, context) {
        // Static text nodes have no check function
        var checkIndex = -1;
        this.nodes.push(function () { return ({
            sourceSpan: ast.sourceSpan,
            nodeFlags: 2 /* TypeText */,
            nodeDef: o.importExpr(Identifiers.textDef).callFn([
                o.literal(checkIndex),
                o.literal(ast.ngContentIndex),
                o.literalArr([o.literal(ast.value)]),
            ])
        }); });
    };
    ViewBuilder.prototype.visitBoundText = function (ast, context) {
        var _this = this;
        var nodeIndex = this.nodes.length;
        // reserve the space in the nodeDefs array
        this.nodes.push(null);
        var astWithSource = ast.value;
        var inter = astWithSource.ast;
        var updateRendererExpressions = inter.expressions.map(function (expr, bindingIndex) { return _this._preprocessUpdateExpression({ nodeIndex: nodeIndex, bindingIndex: bindingIndex, sourceSpan: ast.sourceSpan, context: COMP_VAR, value: expr }); });
        // Check index is the same as the node index during compilation
        // They might only differ at runtime
        var checkIndex = nodeIndex;
        this.nodes[nodeIndex] = function () { return ({
            sourceSpan: ast.sourceSpan,
            nodeFlags: 2 /* TypeText */,
            nodeDef: o.importExpr(Identifiers.textDef).callFn([
                o.literal(checkIndex),
                o.literal(ast.ngContentIndex),
                o.literalArr(inter.strings.map(function (s) { return o.literal(s); })),
            ]),
            updateRenderer: updateRendererExpressions
        }); };
    };
    ViewBuilder.prototype.visitEmbeddedTemplate = function (ast, context) {
        var _this = this;
        var nodeIndex = this.nodes.length;
        // reserve the space in the nodeDefs array
        this.nodes.push(null);
        var _a = this._visitElementOrTemplate(nodeIndex, ast), flags = _a.flags, queryMatchesExpr = _a.queryMatchesExpr, hostEvents = _a.hostEvents;
        var childVisitor = this.viewBuilderFactory(this);
        this.children.push(childVisitor);
        childVisitor.visitAll(ast.variables, ast.children);
        var childCount = this.nodes.length - nodeIndex - 1;
        // anchorDef(
        //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], ngContentIndex: number,
        //   childCount: number, handleEventFn?: ElementHandleEventFn, templateFactory?:
        //   ViewDefinitionFactory): NodeDef;
        this.nodes[nodeIndex] = function () { return ({
            sourceSpan: ast.sourceSpan,
            nodeFlags: 1 /* TypeElement */ | flags,
            nodeDef: o.importExpr(Identifiers.anchorDef).callFn([
                o.literal(flags),
                queryMatchesExpr,
                o.literal(ast.ngContentIndex),
                o.literal(childCount),
                _this._createElementHandleEventFn(nodeIndex, hostEvents),
                o.variable(childVisitor.viewName),
            ])
        }); };
    };
    ViewBuilder.prototype.visitElement = function (ast, context) {
        var _this = this;
        var nodeIndex = this.nodes.length;
        // reserve the space in the nodeDefs array so we can add children
        this.nodes.push(null);
        // Using a null element name creates an anchor.
        var elName = isNgContainer(ast.name) ? null : ast.name;
        var _a = this._visitElementOrTemplate(nodeIndex, ast), flags = _a.flags, usedEvents = _a.usedEvents, queryMatchesExpr = _a.queryMatchesExpr, dirHostBindings = _a.hostBindings, hostEvents = _a.hostEvents;
        var inputDefs = [];
        var updateRendererExpressions = [];
        var outputDefs = [];
        if (elName) {
            var hostBindings = ast.inputs
                .map(function (inputAst) { return ({
                context: COMP_VAR,
                inputAst: inputAst,
                dirAst: null,
            }); })
                .concat(dirHostBindings);
            if (hostBindings.length) {
                updateRendererExpressions =
                    hostBindings.map(function (hostBinding, bindingIndex) { return _this._preprocessUpdateExpression({
                        context: hostBinding.context,
                        nodeIndex: nodeIndex,
                        bindingIndex: bindingIndex,
                        sourceSpan: hostBinding.inputAst.sourceSpan,
                        value: hostBinding.inputAst.value
                    }); });
                inputDefs = hostBindings.map(function (hostBinding) { return elementBindingDef(hostBinding.inputAst, hostBinding.dirAst); });
            }
            outputDefs = usedEvents.map(function (_a) {
                var _b = tslib_1.__read(_a, 2), target = _b[0], eventName = _b[1];
                return o.literalArr([o.literal(target), o.literal(eventName)]);
            });
        }
        templateVisitAll(this, ast.children);
        var childCount = this.nodes.length - nodeIndex - 1;
        var compAst = ast.directives.find(function (dirAst) { return dirAst.directive.isComponent; });
        var compRendererType = o.NULL_EXPR;
        var compView = o.NULL_EXPR;
        if (compAst) {
            compView = this.outputCtx.importExpr(compAst.directive.componentViewType);
            compRendererType = this.outputCtx.importExpr(compAst.directive.rendererType);
        }
        // Check index is the same as the node index during compilation
        // They might only differ at runtime
        var checkIndex = nodeIndex;
        this.nodes[nodeIndex] = function () { return ({
            sourceSpan: ast.sourceSpan,
            nodeFlags: 1 /* TypeElement */ | flags,
            nodeDef: o.importExpr(Identifiers.elementDef).callFn([
                o.literal(checkIndex),
                o.literal(flags),
                queryMatchesExpr,
                o.literal(ast.ngContentIndex),
                o.literal(childCount),
                o.literal(elName),
                elName ? fixedAttrsDef(ast) : o.NULL_EXPR,
                inputDefs.length ? o.literalArr(inputDefs) : o.NULL_EXPR,
                outputDefs.length ? o.literalArr(outputDefs) : o.NULL_EXPR,
                _this._createElementHandleEventFn(nodeIndex, hostEvents),
                compView,
                compRendererType,
            ]),
            updateRenderer: updateRendererExpressions
        }); };
    };
    ViewBuilder.prototype._visitElementOrTemplate = function (nodeIndex, ast) {
        var _this = this;
        var flags = 0 /* None */;
        if (ast.hasViewContainer) {
            flags |= 16777216 /* EmbeddedViews */;
        }
        var usedEvents = new Map();
        ast.outputs.forEach(function (event) {
            var _a = elementEventNameAndTarget(event, null), name = _a.name, target = _a.target;
            usedEvents.set(elementEventFullName(target, name), [target, name]);
        });
        ast.directives.forEach(function (dirAst) {
            dirAst.hostEvents.forEach(function (event) {
                var _a = elementEventNameAndTarget(event, dirAst), name = _a.name, target = _a.target;
                usedEvents.set(elementEventFullName(target, name), [target, name]);
            });
        });
        var hostBindings = [];
        var hostEvents = [];
        this._visitComponentFactoryResolverProvider(ast.directives);
        ast.providers.forEach(function (providerAst, providerIndex) {
            var dirAst = undefined;
            var dirIndex = undefined;
            ast.directives.forEach(function (localDirAst, i) {
                if (localDirAst.directive.type.reference === tokenReference(providerAst.token)) {
                    dirAst = localDirAst;
                    dirIndex = i;
                }
            });
            if (dirAst) {
                var _a = _this._visitDirective(providerAst, dirAst, dirIndex, nodeIndex, ast.references, ast.queryMatches, usedEvents, _this.staticQueryIds.get(ast)), dirHostBindings = _a.hostBindings, dirHostEvents = _a.hostEvents;
                hostBindings.push.apply(hostBindings, tslib_1.__spread(dirHostBindings));
                hostEvents.push.apply(hostEvents, tslib_1.__spread(dirHostEvents));
            }
            else {
                _this._visitProvider(providerAst, ast.queryMatches);
            }
        });
        var queryMatchExprs = [];
        ast.queryMatches.forEach(function (match) {
            var valueType = undefined;
            if (tokenReference(match.value) ===
                _this.reflector.resolveExternalReference(Identifiers.ElementRef)) {
                valueType = 0 /* ElementRef */;
            }
            else if (tokenReference(match.value) ===
                _this.reflector.resolveExternalReference(Identifiers.ViewContainerRef)) {
                valueType = 3 /* ViewContainerRef */;
            }
            else if (tokenReference(match.value) ===
                _this.reflector.resolveExternalReference(Identifiers.TemplateRef)) {
                valueType = 2 /* TemplateRef */;
            }
            if (valueType != null) {
                queryMatchExprs.push(o.literalArr([o.literal(match.queryId), o.literal(valueType)]));
            }
        });
        ast.references.forEach(function (ref) {
            var valueType = undefined;
            if (!ref.value) {
                valueType = 1 /* RenderElement */;
            }
            else if (tokenReference(ref.value) ===
                _this.reflector.resolveExternalReference(Identifiers.TemplateRef)) {
                valueType = 2 /* TemplateRef */;
            }
            if (valueType != null) {
                _this.refNodeIndices[ref.name] = nodeIndex;
                queryMatchExprs.push(o.literalArr([o.literal(ref.name), o.literal(valueType)]));
            }
        });
        ast.outputs.forEach(function (outputAst) {
            hostEvents.push({ context: COMP_VAR, eventAst: outputAst, dirAst: null });
        });
        return {
            flags: flags,
            usedEvents: Array.from(usedEvents.values()),
            queryMatchesExpr: queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
            hostBindings: hostBindings,
            hostEvents: hostEvents
        };
    };
    ViewBuilder.prototype._visitDirective = function (providerAst, dirAst, directiveIndex, elementNodeIndex, refs, queryMatches, usedEvents, queryIds) {
        var _this = this;
        var nodeIndex = this.nodes.length;
        // reserve the space in the nodeDefs array so we can add children
        this.nodes.push(null);
        dirAst.directive.queries.forEach(function (query, queryIndex) {
            var queryId = dirAst.contentQueryStartId + queryIndex;
            var flags = 67108864 /* TypeContentQuery */ | calcStaticDynamicQueryFlags(queryIds, queryId, query.first);
            var bindingType = query.first ? 0 /* First */ : 1 /* All */;
            _this.nodes.push(function () { return ({
                sourceSpan: dirAst.sourceSpan,
                nodeFlags: flags,
                nodeDef: o.importExpr(Identifiers.queryDef).callFn([
                    o.literal(flags), o.literal(queryId),
                    new o.LiteralMapExpr([new o.LiteralMapEntry(query.propertyName, o.literal(bindingType), false)])
                ]),
            }); });
        });
        // Note: the operation below might also create new nodeDefs,
        // but we don't want them to be a child of a directive,
        // as they might be a provider/pipe on their own.
        // I.e. we only allow queries as children of directives nodes.
        var childCount = this.nodes.length - nodeIndex - 1;
        var _a = this._visitProviderOrDirective(providerAst, queryMatches), flags = _a.flags, queryMatchExprs = _a.queryMatchExprs, providerExpr = _a.providerExpr, depsExpr = _a.depsExpr;
        refs.forEach(function (ref) {
            if (ref.value && tokenReference(ref.value) === tokenReference(providerAst.token)) {
                _this.refNodeIndices[ref.name] = nodeIndex;
                queryMatchExprs.push(o.literalArr([o.literal(ref.name), o.literal(4 /* Provider */)]));
            }
        });
        if (dirAst.directive.isComponent) {
            flags |= 32768 /* Component */;
        }
        var inputDefs = dirAst.inputs.map(function (inputAst, inputIndex) {
            var mapValue = o.literalArr([o.literal(inputIndex), o.literal(inputAst.directiveName)]);
            // Note: it's important to not quote the key so that we can capture renames by minifiers!
            return new o.LiteralMapEntry(inputAst.directiveName, mapValue, false);
        });
        var outputDefs = [];
        var dirMeta = dirAst.directive;
        Object.keys(dirMeta.outputs).forEach(function (propName) {
            var eventName = dirMeta.outputs[propName];
            if (usedEvents.has(eventName)) {
                // Note: it's important to not quote the key so that we can capture renames by minifiers!
                outputDefs.push(new o.LiteralMapEntry(propName, o.literal(eventName), false));
            }
        });
        var updateDirectiveExpressions = [];
        if (dirAst.inputs.length || (flags & (262144 /* DoCheck */ | 65536 /* OnInit */)) > 0) {
            updateDirectiveExpressions =
                dirAst.inputs.map(function (input, bindingIndex) { return _this._preprocessUpdateExpression({
                    nodeIndex: nodeIndex,
                    bindingIndex: bindingIndex,
                    sourceSpan: input.sourceSpan,
                    context: COMP_VAR,
                    value: input.value
                }); });
        }
        var dirContextExpr = o.importExpr(Identifiers.nodeValue).callFn([VIEW_VAR, o.literal(nodeIndex)]);
        var hostBindings = dirAst.hostProperties.map(function (inputAst) { return ({
            context: dirContextExpr,
            dirAst: dirAst,
            inputAst: inputAst,
        }); });
        var hostEvents = dirAst.hostEvents.map(function (hostEventAst) { return ({
            context: dirContextExpr,
            eventAst: hostEventAst, dirAst: dirAst,
        }); });
        // Check index is the same as the node index during compilation
        // They might only differ at runtime
        var checkIndex = nodeIndex;
        this.nodes[nodeIndex] = function () { return ({
            sourceSpan: dirAst.sourceSpan,
            nodeFlags: 16384 /* TypeDirective */ | flags,
            nodeDef: o.importExpr(Identifiers.directiveDef).callFn([
                o.literal(checkIndex),
                o.literal(flags),
                queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
                o.literal(childCount),
                providerExpr,
                depsExpr,
                inputDefs.length ? new o.LiteralMapExpr(inputDefs) : o.NULL_EXPR,
                outputDefs.length ? new o.LiteralMapExpr(outputDefs) : o.NULL_EXPR,
            ]),
            updateDirectives: updateDirectiveExpressions,
            directive: dirAst.directive.type,
        }); };
        return { hostBindings: hostBindings, hostEvents: hostEvents };
    };
    ViewBuilder.prototype._visitProvider = function (providerAst, queryMatches) {
        this._addProviderNode(this._visitProviderOrDirective(providerAst, queryMatches));
    };
    ViewBuilder.prototype._visitComponentFactoryResolverProvider = function (directives) {
        var componentDirMeta = directives.find(function (dirAst) { return dirAst.directive.isComponent; });
        if (componentDirMeta && componentDirMeta.directive.entryComponents.length) {
            var _a = componentFactoryResolverProviderDef(this.reflector, this.outputCtx, 8192 /* PrivateProvider */, componentDirMeta.directive.entryComponents), providerExpr = _a.providerExpr, depsExpr = _a.depsExpr, flags = _a.flags, tokenExpr = _a.tokenExpr;
            this._addProviderNode({
                providerExpr: providerExpr,
                depsExpr: depsExpr,
                flags: flags,
                tokenExpr: tokenExpr,
                queryMatchExprs: [],
                sourceSpan: componentDirMeta.sourceSpan
            });
        }
    };
    ViewBuilder.prototype._addProviderNode = function (data) {
        var nodeIndex = this.nodes.length;
        // providerDef(
        //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], token:any,
        //   value: any, deps: ([DepFlags, any] | any)[]): NodeDef;
        this.nodes.push(function () { return ({
            sourceSpan: data.sourceSpan,
            nodeFlags: data.flags,
            nodeDef: o.importExpr(Identifiers.providerDef).callFn([
                o.literal(data.flags),
                data.queryMatchExprs.length ? o.literalArr(data.queryMatchExprs) : o.NULL_EXPR,
                data.tokenExpr, data.providerExpr, data.depsExpr
            ])
        }); });
    };
    ViewBuilder.prototype._visitProviderOrDirective = function (providerAst, queryMatches) {
        var flags = 0 /* None */;
        var queryMatchExprs = [];
        queryMatches.forEach(function (match) {
            if (tokenReference(match.value) === tokenReference(providerAst.token)) {
                queryMatchExprs.push(o.literalArr([o.literal(match.queryId), o.literal(4 /* Provider */)]));
            }
        });
        var _a = providerDef(this.outputCtx, providerAst), providerExpr = _a.providerExpr, depsExpr = _a.depsExpr, providerFlags = _a.flags, tokenExpr = _a.tokenExpr;
        return {
            flags: flags | providerFlags,
            queryMatchExprs: queryMatchExprs,
            providerExpr: providerExpr,
            depsExpr: depsExpr,
            tokenExpr: tokenExpr,
            sourceSpan: providerAst.sourceSpan
        };
    };
    ViewBuilder.prototype.getLocal = function (name) {
        if (name == EventHandlerVars.event.name) {
            return EventHandlerVars.event;
        }
        var currViewExpr = VIEW_VAR;
        for (var currBuilder = this; currBuilder; currBuilder = currBuilder.parent,
            currViewExpr = currViewExpr.prop('parent').cast(o.DYNAMIC_TYPE)) {
            // check references
            var refNodeIndex = currBuilder.refNodeIndices[name];
            if (refNodeIndex != null) {
                return o.importExpr(Identifiers.nodeValue).callFn([currViewExpr, o.literal(refNodeIndex)]);
            }
            // check variables
            var varAst = currBuilder.variables.find(function (varAst) { return varAst.name === name; });
            if (varAst) {
                var varValue = varAst.value || IMPLICIT_TEMPLATE_VAR;
                return currViewExpr.prop('context').prop(varValue);
            }
        }
        return null;
    };
    ViewBuilder.prototype._createLiteralArrayConverter = function (sourceSpan, argCount) {
        if (argCount === 0) {
            var valueExpr_1 = o.importExpr(Identifiers.EMPTY_ARRAY);
            return function () { return valueExpr_1; };
        }
        var checkIndex = this.nodes.length;
        this.nodes.push(function () { return ({
            sourceSpan: sourceSpan,
            nodeFlags: 32 /* TypePureArray */,
            nodeDef: o.importExpr(Identifiers.pureArrayDef).callFn([
                o.literal(checkIndex),
                o.literal(argCount),
            ])
        }); });
        return function (args) { return callCheckStmt(checkIndex, args); };
    };
    ViewBuilder.prototype._createLiteralMapConverter = function (sourceSpan, keys) {
        if (keys.length === 0) {
            var valueExpr_2 = o.importExpr(Identifiers.EMPTY_MAP);
            return function () { return valueExpr_2; };
        }
        var map = o.literalMap(keys.map(function (e, i) { return (tslib_1.__assign({}, e, { value: o.literal(i) })); }));
        var checkIndex = this.nodes.length;
        this.nodes.push(function () { return ({
            sourceSpan: sourceSpan,
            nodeFlags: 64 /* TypePureObject */,
            nodeDef: o.importExpr(Identifiers.pureObjectDef).callFn([
                o.literal(checkIndex),
                map,
            ])
        }); });
        return function (args) { return callCheckStmt(checkIndex, args); };
    };
    ViewBuilder.prototype._createPipeConverter = function (expression, name, argCount) {
        var pipe = this.usedPipes.find(function (pipeSummary) { return pipeSummary.name === name; });
        if (pipe.pure) {
            var checkIndex_1 = this.nodes.length;
            this.nodes.push(function () { return ({
                sourceSpan: expression.sourceSpan,
                nodeFlags: 128 /* TypePurePipe */,
                nodeDef: o.importExpr(Identifiers.purePipeDef).callFn([
                    o.literal(checkIndex_1),
                    o.literal(argCount),
                ])
            }); });
            // find underlying pipe in the component view
            var compViewExpr = VIEW_VAR;
            var compBuilder = this;
            while (compBuilder.parent) {
                compBuilder = compBuilder.parent;
                compViewExpr = compViewExpr.prop('parent').cast(o.DYNAMIC_TYPE);
            }
            var pipeNodeIndex = compBuilder.purePipeNodeIndices[name];
            var pipeValueExpr_1 = o.importExpr(Identifiers.nodeValue).callFn([compViewExpr, o.literal(pipeNodeIndex)]);
            return function (args) { return callUnwrapValue(expression.nodeIndex, expression.bindingIndex, callCheckStmt(checkIndex_1, [pipeValueExpr_1].concat(args))); };
        }
        else {
            var nodeIndex = this._createPipe(expression.sourceSpan, pipe);
            var nodeValueExpr_1 = o.importExpr(Identifiers.nodeValue).callFn([VIEW_VAR, o.literal(nodeIndex)]);
            return function (args) { return callUnwrapValue(expression.nodeIndex, expression.bindingIndex, nodeValueExpr_1.callMethod('transform', args)); };
        }
    };
    ViewBuilder.prototype._createPipe = function (sourceSpan, pipe) {
        var _this = this;
        var nodeIndex = this.nodes.length;
        var flags = 0 /* None */;
        pipe.type.lifecycleHooks.forEach(function (lifecycleHook) {
            // for pipes, we only support ngOnDestroy
            if (lifecycleHook === LifecycleHooks.OnDestroy) {
                flags |= lifecycleHookToNodeFlag(lifecycleHook);
            }
        });
        var depExprs = pipe.type.diDeps.map(function (diDep) { return depDef(_this.outputCtx, diDep); });
        // function pipeDef(
        //   flags: NodeFlags, ctor: any, deps: ([DepFlags, any] | any)[]): NodeDef
        this.nodes.push(function () { return ({
            sourceSpan: sourceSpan,
            nodeFlags: 16 /* TypePipe */,
            nodeDef: o.importExpr(Identifiers.pipeDef).callFn([
                o.literal(flags), _this.outputCtx.importExpr(pipe.type.reference), o.literalArr(depExprs)
            ])
        }); });
        return nodeIndex;
    };
    /**
     * For the AST in `UpdateExpression.value`:
     * - create nodes for pipes, literal arrays and, literal maps,
     * - update the AST to replace pipes, literal arrays and, literal maps with calls to check fn.
     *
     * WARNING: This might create new nodeDefs (for pipes and literal arrays and literal maps)!
     */
    ViewBuilder.prototype._preprocessUpdateExpression = function (expression) {
        var _this = this;
        return {
            nodeIndex: expression.nodeIndex,
            bindingIndex: expression.bindingIndex,
            sourceSpan: expression.sourceSpan,
            context: expression.context,
            value: convertPropertyBindingBuiltins({
                createLiteralArrayConverter: function (argCount) { return _this._createLiteralArrayConverter(expression.sourceSpan, argCount); },
                createLiteralMapConverter: function (keys) {
                    return _this._createLiteralMapConverter(expression.sourceSpan, keys);
                },
                createPipeConverter: function (name, argCount) {
                    return _this._createPipeConverter(expression, name, argCount);
                }
            }, expression.value)
        };
    };
    ViewBuilder.prototype._createNodeExpressions = function () {
        var self = this;
        var updateBindingCount = 0;
        var updateRendererStmts = [];
        var updateDirectivesStmts = [];
        var nodeDefExprs = this.nodes.map(function (factory, nodeIndex) {
            var _a = factory(), nodeDef = _a.nodeDef, nodeFlags = _a.nodeFlags, updateDirectives = _a.updateDirectives, updateRenderer = _a.updateRenderer, sourceSpan = _a.sourceSpan;
            if (updateRenderer) {
                updateRendererStmts.push.apply(updateRendererStmts, tslib_1.__spread(createUpdateStatements(nodeIndex, sourceSpan, updateRenderer, false)));
            }
            if (updateDirectives) {
                updateDirectivesStmts.push.apply(updateDirectivesStmts, tslib_1.__spread(createUpdateStatements(nodeIndex, sourceSpan, updateDirectives, (nodeFlags & (262144 /* DoCheck */ | 65536 /* OnInit */)) > 0)));
            }
            // We use a comma expression to call the log function before
            // the nodeDef function, but still use the result of the nodeDef function
            // as the value.
            // Note: We only add the logger to elements / text nodes,
            // so we don't generate too much code.
            var logWithNodeDef = nodeFlags & 3 /* CatRenderNode */ ?
                new o.CommaExpr([LOG_VAR.callFn([]).callFn([]), nodeDef]) :
                nodeDef;
            return o.applySourceSpanToExpressionIfNeeded(logWithNodeDef, sourceSpan);
        });
        return { updateRendererStmts: updateRendererStmts, updateDirectivesStmts: updateDirectivesStmts, nodeDefExprs: nodeDefExprs };
        function createUpdateStatements(nodeIndex, sourceSpan, expressions, allowEmptyExprs) {
            var updateStmts = [];
            var exprs = expressions.map(function (_a) {
                var sourceSpan = _a.sourceSpan, context = _a.context, value = _a.value;
                var bindingId = "" + updateBindingCount++;
                var nameResolver = context === COMP_VAR ? self : null;
                var _b = convertPropertyBinding(nameResolver, context, value, bindingId, BindingForm.General), stmts = _b.stmts, currValExpr = _b.currValExpr;
                updateStmts.push.apply(updateStmts, tslib_1.__spread(stmts.map(function (stmt) { return o.applySourceSpanToStatementIfNeeded(stmt, sourceSpan); })));
                return o.applySourceSpanToExpressionIfNeeded(currValExpr, sourceSpan);
            });
            if (expressions.length || allowEmptyExprs) {
                updateStmts.push(o.applySourceSpanToStatementIfNeeded(callCheckStmt(nodeIndex, exprs).toStmt(), sourceSpan));
            }
            return updateStmts;
        }
    };
    ViewBuilder.prototype._createElementHandleEventFn = function (nodeIndex, handlers) {
        var _this = this;
        var handleEventStmts = [];
        var handleEventBindingCount = 0;
        handlers.forEach(function (_a) {
            var context = _a.context, eventAst = _a.eventAst, dirAst = _a.dirAst;
            var bindingId = "" + handleEventBindingCount++;
            var nameResolver = context === COMP_VAR ? _this : null;
            var _b = convertActionBinding(nameResolver, context, eventAst.handler, bindingId), stmts = _b.stmts, allowDefault = _b.allowDefault;
            var trueStmts = stmts;
            if (allowDefault) {
                trueStmts.push(ALLOW_DEFAULT_VAR.set(allowDefault.and(ALLOW_DEFAULT_VAR)).toStmt());
            }
            var _c = elementEventNameAndTarget(eventAst, dirAst), eventTarget = _c.target, eventName = _c.name;
            var fullEventName = elementEventFullName(eventTarget, eventName);
            handleEventStmts.push(o.applySourceSpanToStatementIfNeeded(new o.IfStmt(o.literal(fullEventName).identical(EVENT_NAME_VAR), trueStmts), eventAst.sourceSpan));
        });
        var handleEventFn;
        if (handleEventStmts.length > 0) {
            var preStmts = [ALLOW_DEFAULT_VAR.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE)];
            if (!this.component.isHost && o.findReadVarNames(handleEventStmts).has(COMP_VAR.name)) {
                preStmts.push(COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(this.compType));
            }
            handleEventFn = o.fn([
                new o.FnParam(VIEW_VAR.name, o.INFERRED_TYPE),
                new o.FnParam(EVENT_NAME_VAR.name, o.INFERRED_TYPE),
                new o.FnParam(EventHandlerVars.event.name, o.INFERRED_TYPE)
            ], tslib_1.__spread(preStmts, handleEventStmts, [new o.ReturnStatement(ALLOW_DEFAULT_VAR)]), o.INFERRED_TYPE);
        }
        else {
            handleEventFn = o.NULL_EXPR;
        }
        return handleEventFn;
    };
    ViewBuilder.prototype.visitDirective = function (ast, context) { };
    ViewBuilder.prototype.visitDirectiveProperty = function (ast, context) { };
    ViewBuilder.prototype.visitReference = function (ast, context) { };
    ViewBuilder.prototype.visitVariable = function (ast, context) { };
    ViewBuilder.prototype.visitEvent = function (ast, context) { };
    ViewBuilder.prototype.visitElementProperty = function (ast, context) { };
    ViewBuilder.prototype.visitAttr = function (ast, context) { };
    return ViewBuilder;
}());
function needsAdditionalRootNode(astNodes) {
    var lastAstNode = astNodes[astNodes.length - 1];
    if (lastAstNode instanceof EmbeddedTemplateAst) {
        return lastAstNode.hasViewContainer;
    }
    if (lastAstNode instanceof ElementAst) {
        if (isNgContainer(lastAstNode.name) && lastAstNode.children.length) {
            return needsAdditionalRootNode(lastAstNode.children);
        }
        return lastAstNode.hasViewContainer;
    }
    return lastAstNode instanceof NgContentAst;
}
function elementBindingDef(inputAst, dirAst) {
    switch (inputAst.type) {
        case 1 /* Attribute */:
            return o.literalArr([
                o.literal(1 /* TypeElementAttribute */), o.literal(inputAst.name),
                o.literal(inputAst.securityContext)
            ]);
        case 0 /* Property */:
            return o.literalArr([
                o.literal(8 /* TypeProperty */), o.literal(inputAst.name),
                o.literal(inputAst.securityContext)
            ]);
        case 4 /* Animation */:
            var bindingType = 8 /* TypeProperty */ |
                (dirAst && dirAst.directive.isComponent ? 32 /* SyntheticHostProperty */ :
                    16 /* SyntheticProperty */);
            return o.literalArr([
                o.literal(bindingType), o.literal('@' + inputAst.name), o.literal(inputAst.securityContext)
            ]);
        case 2 /* Class */:
            return o.literalArr([o.literal(2 /* TypeElementClass */), o.literal(inputAst.name), o.NULL_EXPR]);
        case 3 /* Style */:
            return o.literalArr([
                o.literal(4 /* TypeElementStyle */), o.literal(inputAst.name), o.literal(inputAst.unit)
            ]);
    }
}
function fixedAttrsDef(elementAst) {
    var mapResult = Object.create(null);
    elementAst.attrs.forEach(function (attrAst) { mapResult[attrAst.name] = attrAst.value; });
    elementAst.directives.forEach(function (dirAst) {
        Object.keys(dirAst.directive.hostAttributes).forEach(function (name) {
            var value = dirAst.directive.hostAttributes[name];
            var prevValue = mapResult[name];
            mapResult[name] = prevValue != null ? mergeAttributeValue(name, prevValue, value) : value;
        });
    });
    // Note: We need to sort to get a defined output order
    // for tests and for caching generated artifacts...
    return o.literalArr(Object.keys(mapResult).sort().map(function (attrName) { return o.literalArr([o.literal(attrName), o.literal(mapResult[attrName])]); }));
}
function mergeAttributeValue(attrName, attrValue1, attrValue2) {
    if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
        return attrValue1 + " " + attrValue2;
    }
    else {
        return attrValue2;
    }
}
function callCheckStmt(nodeIndex, exprs) {
    if (exprs.length > 10) {
        return CHECK_VAR.callFn([VIEW_VAR, o.literal(nodeIndex), o.literal(1 /* Dynamic */), o.literalArr(exprs)]);
    }
    else {
        return CHECK_VAR.callFn(tslib_1.__spread([VIEW_VAR, o.literal(nodeIndex), o.literal(0 /* Inline */)], exprs));
    }
}
function callUnwrapValue(nodeIndex, bindingIdx, expr) {
    return o.importExpr(Identifiers.unwrapValue).callFn([
        VIEW_VAR, o.literal(nodeIndex), o.literal(bindingIdx), expr
    ]);
}
function findStaticQueryIds(nodes, result) {
    if (result === void 0) { result = new Map(); }
    nodes.forEach(function (node) {
        var staticQueryIds = new Set();
        var dynamicQueryIds = new Set();
        var queryMatches = undefined;
        if (node instanceof ElementAst) {
            findStaticQueryIds(node.children, result);
            node.children.forEach(function (child) {
                var childData = result.get(child);
                childData.staticQueryIds.forEach(function (queryId) { return staticQueryIds.add(queryId); });
                childData.dynamicQueryIds.forEach(function (queryId) { return dynamicQueryIds.add(queryId); });
            });
            queryMatches = node.queryMatches;
        }
        else if (node instanceof EmbeddedTemplateAst) {
            findStaticQueryIds(node.children, result);
            node.children.forEach(function (child) {
                var childData = result.get(child);
                childData.staticQueryIds.forEach(function (queryId) { return dynamicQueryIds.add(queryId); });
                childData.dynamicQueryIds.forEach(function (queryId) { return dynamicQueryIds.add(queryId); });
            });
            queryMatches = node.queryMatches;
        }
        if (queryMatches) {
            queryMatches.forEach(function (match) { return staticQueryIds.add(match.queryId); });
        }
        dynamicQueryIds.forEach(function (queryId) { return staticQueryIds.delete(queryId); });
        result.set(node, { staticQueryIds: staticQueryIds, dynamicQueryIds: dynamicQueryIds });
    });
    return result;
}
function staticViewQueryIds(nodeStaticQueryIds) {
    var staticQueryIds = new Set();
    var dynamicQueryIds = new Set();
    Array.from(nodeStaticQueryIds.values()).forEach(function (entry) {
        entry.staticQueryIds.forEach(function (queryId) { return staticQueryIds.add(queryId); });
        entry.dynamicQueryIds.forEach(function (queryId) { return dynamicQueryIds.add(queryId); });
    });
    dynamicQueryIds.forEach(function (queryId) { return staticQueryIds.delete(queryId); });
    return { staticQueryIds: staticQueryIds, dynamicQueryIds: dynamicQueryIds };
}
function elementEventNameAndTarget(eventAst, dirAst) {
    if (eventAst.isAnimation) {
        return {
            name: "@" + eventAst.name + "." + eventAst.phase,
            target: dirAst && dirAst.directive.isComponent ? 'component' : null
        };
    }
    else {
        return eventAst;
    }
}
function calcStaticDynamicQueryFlags(queryIds, queryId, isFirst) {
    var flags = 0 /* None */;
    // Note: We only make queries static that query for a single item.
    // This is because of backwards compatibility with the old view compiler...
    if (isFirst && (queryIds.staticQueryIds.has(queryId) || !queryIds.dynamicQueryIds.has(queryId))) {
        flags |= 268435456 /* StaticQuery */;
    }
    else {
        flags |= 536870912 /* DynamicQuery */;
    }
    return flags;
}
export function elementEventFullName(target, name) {
    return target ? target + ":" + name : name;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy92aWV3X2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBK0MsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRWxJLE9BQU8sRUFBQyxXQUFXLEVBQW9CLGdCQUFnQixFQUFpQixvQkFBb0IsRUFBRSxzQkFBc0IsRUFBRSw4QkFBOEIsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBQ25NLE9BQU8sRUFBNkIsdUJBQXVCLEVBQXlELE1BQU0sU0FBUyxDQUFDO0FBRXBJLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2hELE9BQU8sS0FBSyxDQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDMUMsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFN0QsT0FBTyxFQUF5RyxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxFQUFxSCxnQkFBZ0IsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBRzNVLE9BQU8sRUFBQyxtQ0FBbUMsRUFBRSxNQUFNLEVBQUUsdUJBQXVCLEVBQUUsV0FBVyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFdEgsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDO0FBQzNCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQztBQUMzQixJQUFNLHFCQUFxQixHQUFHLFlBQVksQ0FBQztBQUUzQztJQUNFLDJCQUFtQixZQUFvQixFQUFTLGVBQXVCO1FBQXBELGlC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QU0sSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJO1NBQ3BFLENBQUM7SUFDSixDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ2xCLENBQUM7QUFDSCxDQUFDO0FBRUQscUNBQ0ksUUFBa0MsRUFBRSxPQUFlLEVBQUUsT0FBZ0I7SUFDdkUsSUFBSSxLQUFLLGVBQWlCLENBQUM7SUFDM0Isa0VBQWtFO0lBQ2xFLDJFQUEyRTtJQUMzRSxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLEtBQUssK0JBQXlCLENBQUM7SUFDakMsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sS0FBSyxnQ0FBMEIsQ0FBQztJQUNsQyxDQUFDO0lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNmLENBQUM7QUFFRCxNQUFNLCtCQUErQixNQUFxQixFQUFFLElBQVk7SUFDdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUksTUFBTSxTQUFJLElBQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzdDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBDb21waWxlUGlwZVN1bW1hcnksIHJlbmRlcmVyVHlwZU5hbWUsIHRva2VuUmVmZXJlbmNlLCB2aWV3Q2xhc3NOYW1lfSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7Q29tcGlsZVJlZmxlY3Rvcn0gZnJvbSAnLi4vY29tcGlsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtCaW5kaW5nRm9ybSwgQnVpbHRpbkNvbnZlcnRlciwgRXZlbnRIYW5kbGVyVmFycywgTG9jYWxSZXNvbHZlciwgY29udmVydEFjdGlvbkJpbmRpbmcsIGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcsIGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmdCdWlsdGluc30gZnJvbSAnLi4vY29tcGlsZXJfdXRpbC9leHByZXNzaW9uX2NvbnZlcnRlcic7XG5pbXBvcnQge0FyZ3VtZW50VHlwZSwgQmluZGluZ0ZsYWdzLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgTm9kZUZsYWdzLCBRdWVyeUJpbmRpbmdUeXBlLCBRdWVyeVZhbHVlVHlwZSwgVmlld0ZsYWdzfSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCB7QVNULCBBU1RXaXRoU291cmNlLCBJbnRlcnBvbGF0aW9ufSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi4vaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rc30gZnJvbSAnLi4vbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge2lzTmdDb250YWluZXJ9IGZyb20gJy4uL21sX3BhcnNlci90YWdzJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtjb252ZXJ0VmFsdWVUb091dHB1dEFzdH0gZnJvbSAnLi4vb3V0cHV0L3ZhbHVlX3V0aWwnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtBdHRyQXN0LCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgQm91bmRFdmVudEFzdCwgQm91bmRUZXh0QXN0LCBEaXJlY3RpdmVBc3QsIEVsZW1lbnRBc3QsIEVtYmVkZGVkVGVtcGxhdGVBc3QsIE5nQ29udGVudEFzdCwgUHJvcGVydHlCaW5kaW5nVHlwZSwgUHJvdmlkZXJBc3QsIFF1ZXJ5TWF0Y2gsIFJlZmVyZW5jZUFzdCwgVGVtcGxhdGVBc3QsIFRlbXBsYXRlQXN0VmlzaXRvciwgVGV4dEFzdCwgVmFyaWFibGVBc3QsIHRlbXBsYXRlVmlzaXRBbGx9IGZyb20gJy4uL3RlbXBsYXRlX3BhcnNlci90ZW1wbGF0ZV9hc3QnO1xuaW1wb3J0IHtPdXRwdXRDb250ZXh0fSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJQcm92aWRlckRlZiwgZGVwRGVmLCBsaWZlY3ljbGVIb29rVG9Ob2RlRmxhZywgcHJvdmlkZXJEZWZ9IGZyb20gJy4vcHJvdmlkZXJfY29tcGlsZXInO1xuXG5jb25zdCBDTEFTU19BVFRSID0gJ2NsYXNzJztcbmNvbnN0IFNUWUxFX0FUVFIgPSAnc3R5bGUnO1xuY29uc3QgSU1QTElDSVRfVEVNUExBVEVfVkFSID0gJ1xcJGltcGxpY2l0JztcblxuZXhwb3J0IGNsYXNzIFZpZXdDb21waWxlUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHZpZXdDbGFzc1Zhcjogc3RyaW5nLCBwdWJsaWMgcmVuZGVyZXJUeXBlVmFyOiBzdHJpbmcpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q29tcGlsZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IpIHt9XG5cbiAgY29tcGlsZUNvbXBvbmVudChcbiAgICAgIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIHRlbXBsYXRlOiBUZW1wbGF0ZUFzdFtdLFxuICAgICAgc3R5bGVzOiBvLkV4cHJlc3Npb24sIHVzZWRQaXBlczogQ29tcGlsZVBpcGVTdW1tYXJ5W10pOiBWaWV3Q29tcGlsZVJlc3VsdCB7XG4gICAgbGV0IGVtYmVkZGVkVmlld0NvdW50ID0gMDtcbiAgICBjb25zdCBzdGF0aWNRdWVyeUlkcyA9IGZpbmRTdGF0aWNRdWVyeUlkcyh0ZW1wbGF0ZSk7XG5cbiAgICBsZXQgcmVuZGVyQ29tcG9uZW50VmFyTmFtZTogc3RyaW5nID0gdW5kZWZpbmVkICE7XG4gICAgaWYgKCFjb21wb25lbnQuaXNIb3N0KSB7XG4gICAgICBjb25zdCB0ZW1wbGF0ZSA9IGNvbXBvbmVudC50ZW1wbGF0ZSAhO1xuICAgICAgY29uc3QgY3VzdG9tUmVuZGVyRGF0YTogby5MaXRlcmFsTWFwRW50cnlbXSA9IFtdO1xuICAgICAgaWYgKHRlbXBsYXRlLmFuaW1hdGlvbnMgJiYgdGVtcGxhdGUuYW5pbWF0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgY3VzdG9tUmVuZGVyRGF0YS5wdXNoKG5ldyBvLkxpdGVyYWxNYXBFbnRyeShcbiAgICAgICAgICAgICdhbmltYXRpb24nLCBjb252ZXJ0VmFsdWVUb091dHB1dEFzdChvdXRwdXRDdHgsIHRlbXBsYXRlLmFuaW1hdGlvbnMpLCB0cnVlKSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlbmRlckNvbXBvbmVudFZhciA9IG8udmFyaWFibGUocmVuZGVyZXJUeXBlTmFtZShjb21wb25lbnQudHlwZS5yZWZlcmVuY2UpKTtcbiAgICAgIHJlbmRlckNvbXBvbmVudFZhck5hbWUgPSByZW5kZXJDb21wb25lbnRWYXIubmFtZSAhO1xuICAgICAgb3V0cHV0Q3R4LnN0YXRlbWVudHMucHVzaChcbiAgICAgICAgICByZW5kZXJDb21wb25lbnRWYXJcbiAgICAgICAgICAgICAgLnNldChvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuY3JlYXRlUmVuZGVyZXJUeXBlMikuY2FsbEZuKFtuZXcgby5MaXRlcmFsTWFwRXhwcihbXG4gICAgICAgICAgICAgICAgbmV3IG8uTGl0ZXJhbE1hcEVudHJ5KCdlbmNhcHN1bGF0aW9uJywgby5saXRlcmFsKHRlbXBsYXRlLmVuY2Fwc3VsYXRpb24pLCBmYWxzZSksXG4gICAgICAgICAgICAgICAgbmV3IG8uTGl0ZXJhbE1hcEVudHJ5KCdzdHlsZXMnLCBzdHlsZXMsIGZhbHNlKSxcbiAgICAgICAgICAgICAgICBuZXcgby5MaXRlcmFsTWFwRW50cnkoJ2RhdGEnLCBuZXcgby5MaXRlcmFsTWFwRXhwcihjdXN0b21SZW5kZXJEYXRhKSwgZmFsc2UpXG4gICAgICAgICAgICAgIF0pXSkpXG4gICAgICAgICAgICAgIC50b0RlY2xTdG10KFxuICAgICAgICAgICAgICAgICAgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlJlbmRlcmVyVHlwZTIpLFxuICAgICAgICAgICAgICAgICAgW28uU3RtdE1vZGlmaWVyLkZpbmFsLCBvLlN0bXRNb2RpZmllci5FeHBvcnRlZF0pKTtcbiAgICB9XG5cbiAgICBjb25zdCB2aWV3QnVpbGRlckZhY3RvcnkgPSAocGFyZW50OiBWaWV3QnVpbGRlciB8IG51bGwpOiBWaWV3QnVpbGRlciA9PiB7XG4gICAgICBjb25zdCBlbWJlZGRlZFZpZXdJbmRleCA9IGVtYmVkZGVkVmlld0NvdW50Kys7XG4gICAgICByZXR1cm4gbmV3IFZpZXdCdWlsZGVyKFxuICAgICAgICAgIHRoaXMuX3JlZmxlY3Rvciwgb3V0cHV0Q3R4LCBwYXJlbnQsIGNvbXBvbmVudCwgZW1iZWRkZWRWaWV3SW5kZXgsIHVzZWRQaXBlcyxcbiAgICAgICAgICBzdGF0aWNRdWVyeUlkcywgdmlld0J1aWxkZXJGYWN0b3J5KTtcbiAgICB9O1xuXG4gICAgY29uc3QgdmlzaXRvciA9IHZpZXdCdWlsZGVyRmFjdG9yeShudWxsKTtcbiAgICB2aXNpdG9yLnZpc2l0QWxsKFtdLCB0ZW1wbGF0ZSk7XG5cbiAgICBvdXRwdXRDdHguc3RhdGVtZW50cy5wdXNoKC4uLnZpc2l0b3IuYnVpbGQoKSk7XG5cbiAgICByZXR1cm4gbmV3IFZpZXdDb21waWxlUmVzdWx0KHZpc2l0b3Iudmlld05hbWUsIHJlbmRlckNvbXBvbmVudFZhck5hbWUpO1xuICB9XG59XG5cbmludGVyZmFjZSBWaWV3QnVpbGRlckZhY3Rvcnkge1xuICAocGFyZW50OiBWaWV3QnVpbGRlcik6IFZpZXdCdWlsZGVyO1xufVxuXG5pbnRlcmZhY2UgVXBkYXRlRXhwcmVzc2lvbiB7XG4gIGNvbnRleHQ6IG8uRXhwcmVzc2lvbjtcbiAgbm9kZUluZGV4OiBudW1iZXI7XG4gIGJpbmRpbmdJbmRleDogbnVtYmVyO1xuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW47XG4gIHZhbHVlOiBBU1Q7XG59XG5cbmNvbnN0IExPR19WQVIgPSBvLnZhcmlhYmxlKCdfbCcpO1xuY29uc3QgVklFV19WQVIgPSBvLnZhcmlhYmxlKCdfdicpO1xuY29uc3QgQ0hFQ0tfVkFSID0gby52YXJpYWJsZSgnX2NrJyk7XG5jb25zdCBDT01QX1ZBUiA9IG8udmFyaWFibGUoJ19jbycpO1xuY29uc3QgRVZFTlRfTkFNRV9WQVIgPSBvLnZhcmlhYmxlKCdlbicpO1xuY29uc3QgQUxMT1dfREVGQVVMVF9WQVIgPSBvLnZhcmlhYmxlKGBhZGApO1xuXG5jbGFzcyBWaWV3QnVpbGRlciBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0VmlzaXRvciwgTG9jYWxSZXNvbHZlciB7XG4gIHByaXZhdGUgY29tcFR5cGU6IG8uVHlwZTtcbiAgcHJpdmF0ZSBub2RlczogKCgpID0+IHtcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICAgIG5vZGVEZWY6IG8uRXhwcmVzc2lvbixcbiAgICBub2RlRmxhZ3M6IE5vZGVGbGFncywgdXBkYXRlRGlyZWN0aXZlcz86IFVwZGF0ZUV4cHJlc3Npb25bXSwgdXBkYXRlUmVuZGVyZXI/OiBVcGRhdGVFeHByZXNzaW9uW11cbiAgfSlbXSA9IFtdO1xuICBwcml2YXRlIHB1cmVQaXBlTm9kZUluZGljZXM6IHtbcGlwZU5hbWU6IHN0cmluZ106IG51bWJlcn0gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAvLyBOZWVkIE9iamVjdC5jcmVhdGUgc28gdGhhdCB3ZSBkb24ndCBoYXZlIGJ1aWx0aW4gdmFsdWVzLi4uXG4gIHByaXZhdGUgcmVmTm9kZUluZGljZXM6IHtbcmVmTmFtZTogc3RyaW5nXTogbnVtYmVyfSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHByaXZhdGUgdmFyaWFibGVzOiBWYXJpYWJsZUFzdFtdID0gW107XG4gIHByaXZhdGUgY2hpbGRyZW46IFZpZXdCdWlsZGVyW10gPSBbXTtcblxuICBwdWJsaWMgcmVhZG9ubHkgdmlld05hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLCBwcml2YXRlIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCxcbiAgICAgIHByaXZhdGUgcGFyZW50OiBWaWV3QnVpbGRlcnxudWxsLCBwcml2YXRlIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgcHJpdmF0ZSBlbWJlZGRlZFZpZXdJbmRleDogbnVtYmVyLCBwcml2YXRlIHVzZWRQaXBlczogQ29tcGlsZVBpcGVTdW1tYXJ5W10sXG4gICAgICBwcml2YXRlIHN0YXRpY1F1ZXJ5SWRzOiBNYXA8VGVtcGxhdGVBc3QsIFN0YXRpY0FuZER5bmFtaWNRdWVyeUlkcz4sXG4gICAgICBwcml2YXRlIHZpZXdCdWlsZGVyRmFjdG9yeTogVmlld0J1aWxkZXJGYWN0b3J5KSB7XG4gICAgLy8gVE9ETyh0Ym9zY2gpOiBUaGUgb2xkIHZpZXcgY29tcGlsZXIgdXNlZCB0byB1c2UgYW4gYGFueWAgdHlwZVxuICAgIC8vIGZvciB0aGUgY29udGV4dCBpbiBhbnkgZW1iZWRkZWQgdmlldy4gV2Uga2VlcCB0aGlzIGJlaGFpdm9yIGZvciBub3dcbiAgICAvLyB0byBiZSBhYmxlIHRvIGludHJvZHVjZSB0aGUgbmV3IHZpZXcgY29tcGlsZXIgd2l0aG91dCB0b28gbWFueSBlcnJvcnMuXG4gICAgdGhpcy5jb21wVHlwZSA9IHRoaXMuZW1iZWRkZWRWaWV3SW5kZXggPiAwID9cbiAgICAgICAgby5EWU5BTUlDX1RZUEUgOlxuICAgICAgICBvLmV4cHJlc3Npb25UeXBlKG91dHB1dEN0eC5pbXBvcnRFeHByKHRoaXMuY29tcG9uZW50LnR5cGUucmVmZXJlbmNlKSkgITtcbiAgICB0aGlzLnZpZXdOYW1lID0gdmlld0NsYXNzTmFtZSh0aGlzLmNvbXBvbmVudC50eXBlLnJlZmVyZW5jZSwgdGhpcy5lbWJlZGRlZFZpZXdJbmRleCk7XG4gIH1cblxuICB2aXNpdEFsbCh2YXJpYWJsZXM6IFZhcmlhYmxlQXN0W10sIGFzdE5vZGVzOiBUZW1wbGF0ZUFzdFtdKSB7XG4gICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgLy8gY3JlYXRlIHRoZSBwaXBlcyBmb3IgdGhlIHB1cmUgcGlwZXMgaW1tZWRpYXRlbHksIHNvIHRoYXQgd2Uga25vdyB0aGVpciBpbmRpY2VzLlxuICAgIGlmICghdGhpcy5wYXJlbnQpIHtcbiAgICAgIHRoaXMudXNlZFBpcGVzLmZvckVhY2goKHBpcGUpID0+IHtcbiAgICAgICAgaWYgKHBpcGUucHVyZSkge1xuICAgICAgICAgIHRoaXMucHVyZVBpcGVOb2RlSW5kaWNlc1twaXBlLm5hbWVdID0gdGhpcy5fY3JlYXRlUGlwZShudWxsLCBwaXBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnBhcmVudCkge1xuICAgICAgY29uc3QgcXVlcnlJZHMgPSBzdGF0aWNWaWV3UXVlcnlJZHModGhpcy5zdGF0aWNRdWVyeUlkcyk7XG4gICAgICB0aGlzLmNvbXBvbmVudC52aWV3UXVlcmllcy5mb3JFYWNoKChxdWVyeSwgcXVlcnlJbmRleCkgPT4ge1xuICAgICAgICAvLyBOb3RlOiBxdWVyaWVzIHN0YXJ0IHdpdGggaWQgMSBzbyB3ZSBjYW4gdXNlIHRoZSBudW1iZXIgaW4gYSBCbG9vbSBmaWx0ZXIhXG4gICAgICAgIGNvbnN0IHF1ZXJ5SWQgPSBxdWVyeUluZGV4ICsgMTtcbiAgICAgICAgY29uc3QgYmluZGluZ1R5cGUgPSBxdWVyeS5maXJzdCA/IFF1ZXJ5QmluZGluZ1R5cGUuRmlyc3QgOiBRdWVyeUJpbmRpbmdUeXBlLkFsbDtcbiAgICAgICAgY29uc3QgZmxhZ3MgPVxuICAgICAgICAgICAgTm9kZUZsYWdzLlR5cGVWaWV3UXVlcnkgfCBjYWxjU3RhdGljRHluYW1pY1F1ZXJ5RmxhZ3MocXVlcnlJZHMsIHF1ZXJ5SWQsIHF1ZXJ5LmZpcnN0KTtcbiAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKCgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVGbGFnczogZmxhZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVEZWY6IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5xdWVyeURlZikuY2FsbEZuKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwoZmxhZ3MpLCBvLmxpdGVyYWwocXVlcnlJZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IG8uTGl0ZXJhbE1hcEV4cHIoW25ldyBvLkxpdGVyYWxNYXBFbnRyeShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnkucHJvcGVydHlOYW1lLCBvLmxpdGVyYWwoYmluZGluZ1R5cGUpLCBmYWxzZSldKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRlbXBsYXRlVmlzaXRBbGwodGhpcywgYXN0Tm9kZXMpO1xuICAgIGlmICh0aGlzLnBhcmVudCAmJiAoYXN0Tm9kZXMubGVuZ3RoID09PSAwIHx8IG5lZWRzQWRkaXRpb25hbFJvb3ROb2RlKGFzdE5vZGVzKSkpIHtcbiAgICAgIC8vIGlmIHRoZSB2aWV3IGlzIGFuIGVtYmVkZGVkIHZpZXcsIHRoZW4gd2UgbmVlZCB0byBhZGQgYW4gYWRkaXRpb25hbCByb290IG5vZGUgaW4gc29tZSBjYXNlc1xuICAgICAgdGhpcy5ub2Rlcy5wdXNoKCgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZUZsYWdzOiBOb2RlRmxhZ3MuVHlwZUVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlRGVmOiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuYW5jaG9yRGVmKS5jYWxsRm4oW1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwoTm9kZUZsYWdzLk5vbmUpLCBvLk5VTExfRVhQUiwgby5OVUxMX0VYUFIsIG8ubGl0ZXJhbCgwKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfVxuICB9XG5cbiAgYnVpbGQodGFyZ2V0U3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSA9IFtdKTogby5TdGF0ZW1lbnRbXSB7XG4gICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4gY2hpbGQuYnVpbGQodGFyZ2V0U3RhdGVtZW50cykpO1xuXG4gICAgY29uc3Qge3VwZGF0ZVJlbmRlcmVyU3RtdHMsIHVwZGF0ZURpcmVjdGl2ZXNTdG10cywgbm9kZURlZkV4cHJzfSA9XG4gICAgICAgIHRoaXMuX2NyZWF0ZU5vZGVFeHByZXNzaW9ucygpO1xuXG4gICAgY29uc3QgdXBkYXRlUmVuZGVyZXJGbiA9IHRoaXMuX2NyZWF0ZVVwZGF0ZUZuKHVwZGF0ZVJlbmRlcmVyU3RtdHMpO1xuICAgIGNvbnN0IHVwZGF0ZURpcmVjdGl2ZXNGbiA9IHRoaXMuX2NyZWF0ZVVwZGF0ZUZuKHVwZGF0ZURpcmVjdGl2ZXNTdG10cyk7XG5cblxuICAgIGxldCB2aWV3RmxhZ3MgPSBWaWV3RmxhZ3MuTm9uZTtcbiAgICBpZiAoIXRoaXMucGFyZW50ICYmIHRoaXMuY29tcG9uZW50LmNoYW5nZURldGVjdGlvbiA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoKSB7XG4gICAgICB2aWV3RmxhZ3MgfD0gVmlld0ZsYWdzLk9uUHVzaDtcbiAgICB9XG4gICAgY29uc3Qgdmlld0ZhY3RvcnkgPSBuZXcgby5EZWNsYXJlRnVuY3Rpb25TdG10KFxuICAgICAgICB0aGlzLnZpZXdOYW1lLCBbbmV3IG8uRm5QYXJhbShMT0dfVkFSLm5hbWUgISldLFxuICAgICAgICBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy52aWV3RGVmKS5jYWxsRm4oW1xuICAgICAgICAgIG8ubGl0ZXJhbCh2aWV3RmxhZ3MpLFxuICAgICAgICAgIG8ubGl0ZXJhbEFycihub2RlRGVmRXhwcnMpLFxuICAgICAgICAgIHVwZGF0ZURpcmVjdGl2ZXNGbixcbiAgICAgICAgICB1cGRhdGVSZW5kZXJlckZuLFxuICAgICAgICBdKSldLFxuICAgICAgICBvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuVmlld0RlZmluaXRpb24pLFxuICAgICAgICB0aGlzLmVtYmVkZGVkVmlld0luZGV4ID09PSAwID8gW28uU3RtdE1vZGlmaWVyLkV4cG9ydGVkXSA6IFtdKTtcblxuICAgIHRhcmdldFN0YXRlbWVudHMucHVzaCh2aWV3RmFjdG9yeSk7XG4gICAgcmV0dXJuIHRhcmdldFN0YXRlbWVudHM7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVVcGRhdGVGbih1cGRhdGVTdG10czogby5TdGF0ZW1lbnRbXSk6IG8uRXhwcmVzc2lvbiB7XG4gICAgbGV0IHVwZGF0ZUZuOiBvLkV4cHJlc3Npb247XG4gICAgaWYgKHVwZGF0ZVN0bXRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHByZVN0bXRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gICAgICBpZiAoIXRoaXMuY29tcG9uZW50LmlzSG9zdCAmJiBvLmZpbmRSZWFkVmFyTmFtZXModXBkYXRlU3RtdHMpLmhhcyhDT01QX1ZBUi5uYW1lICEpKSB7XG4gICAgICAgIHByZVN0bXRzLnB1c2goQ09NUF9WQVIuc2V0KFZJRVdfVkFSLnByb3AoJ2NvbXBvbmVudCcpKS50b0RlY2xTdG10KHRoaXMuY29tcFR5cGUpKTtcbiAgICAgIH1cbiAgICAgIHVwZGF0ZUZuID0gby5mbihcbiAgICAgICAgICBbXG4gICAgICAgICAgICBuZXcgby5GblBhcmFtKENIRUNLX1ZBUi5uYW1lICEsIG8uSU5GRVJSRURfVFlQRSksXG4gICAgICAgICAgICBuZXcgby5GblBhcmFtKFZJRVdfVkFSLm5hbWUgISwgby5JTkZFUlJFRF9UWVBFKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgWy4uLnByZVN0bXRzLCAuLi51cGRhdGVTdG10c10sIG8uSU5GRVJSRURfVFlQRSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVwZGF0ZUZuID0gby5OVUxMX0VYUFI7XG4gICAgfVxuICAgIHJldHVybiB1cGRhdGVGbjtcbiAgfVxuXG4gIHZpc2l0TmdDb250ZW50KGFzdDogTmdDb250ZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIC8vIG5nQ29udGVudERlZihuZ0NvbnRlbnRJbmRleDogbnVtYmVyLCBpbmRleDogbnVtYmVyKTogTm9kZURlZjtcbiAgICB0aGlzLm5vZGVzLnB1c2goKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBhc3Quc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICBub2RlRmxhZ3M6IE5vZGVGbGFncy5UeXBlTmdDb250ZW50LFxuICAgICAgICAgICAgICAgICAgICAgIG5vZGVEZWY6IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5uZ0NvbnRlbnREZWYpLmNhbGxGbihbXG4gICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwoYXN0Lm5nQ29udGVudEluZGV4KSwgby5saXRlcmFsKGFzdC5pbmRleClcbiAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICB2aXNpdFRleHQoYXN0OiBUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIC8vIFN0YXRpYyB0ZXh0IG5vZGVzIGhhdmUgbm8gY2hlY2sgZnVuY3Rpb25cbiAgICBjb25zdCBjaGVja0luZGV4ID0gLTE7XG4gICAgdGhpcy5ub2Rlcy5wdXNoKCgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogYXN0LnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgbm9kZUZsYWdzOiBOb2RlRmxhZ3MuVHlwZVRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgbm9kZURlZjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnRleHREZWYpLmNhbGxGbihbXG4gICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwoY2hlY2tJbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwoYXN0Lm5nQ29udGVudEluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbEFycihbby5saXRlcmFsKGFzdC52YWx1ZSldKSxcbiAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICB2aXNpdEJvdW5kVGV4dChhc3Q6IEJvdW5kVGV4dEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBjb25zdCBub2RlSW5kZXggPSB0aGlzLm5vZGVzLmxlbmd0aDtcbiAgICAvLyByZXNlcnZlIHRoZSBzcGFjZSBpbiB0aGUgbm9kZURlZnMgYXJyYXlcbiAgICB0aGlzLm5vZGVzLnB1c2gobnVsbCAhKTtcblxuICAgIGNvbnN0IGFzdFdpdGhTb3VyY2UgPSA8QVNUV2l0aFNvdXJjZT5hc3QudmFsdWU7XG4gICAgY29uc3QgaW50ZXIgPSA8SW50ZXJwb2xhdGlvbj5hc3RXaXRoU291cmNlLmFzdDtcblxuICAgIGNvbnN0IHVwZGF0ZVJlbmRlcmVyRXhwcmVzc2lvbnMgPSBpbnRlci5leHByZXNzaW9ucy5tYXAoXG4gICAgICAgIChleHByLCBiaW5kaW5nSW5kZXgpID0+IHRoaXMuX3ByZXByb2Nlc3NVcGRhdGVFeHByZXNzaW9uKFxuICAgICAgICAgICAge25vZGVJbmRleCwgYmluZGluZ0luZGV4LCBzb3VyY2VTcGFuOiBhc3Quc291cmNlU3BhbiwgY29udGV4dDogQ09NUF9WQVIsIHZhbHVlOiBleHByfSkpO1xuXG4gICAgLy8gQ2hlY2sgaW5kZXggaXMgdGhlIHNhbWUgYXMgdGhlIG5vZGUgaW5kZXggZHVyaW5nIGNvbXBpbGF0aW9uXG4gICAgLy8gVGhleSBtaWdodCBvbmx5IGRpZmZlciBhdCBydW50aW1lXG4gICAgY29uc3QgY2hlY2tJbmRleCA9IG5vZGVJbmRleDtcblxuICAgIHRoaXMubm9kZXNbbm9kZUluZGV4XSA9ICgpID0+ICh7XG4gICAgICBzb3VyY2VTcGFuOiBhc3Quc291cmNlU3BhbixcbiAgICAgIG5vZGVGbGFnczogTm9kZUZsYWdzLlR5cGVUZXh0LFxuICAgICAgbm9kZURlZjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnRleHREZWYpLmNhbGxGbihbXG4gICAgICAgIG8ubGl0ZXJhbChjaGVja0luZGV4KSxcbiAgICAgICAgby5saXRlcmFsKGFzdC5uZ0NvbnRlbnRJbmRleCksXG4gICAgICAgIG8ubGl0ZXJhbEFycihpbnRlci5zdHJpbmdzLm1hcChzID0+IG8ubGl0ZXJhbChzKSkpLFxuICAgICAgXSksXG4gICAgICB1cGRhdGVSZW5kZXJlcjogdXBkYXRlUmVuZGVyZXJFeHByZXNzaW9uc1xuICAgIH0pO1xuICB9XG5cbiAgdmlzaXRFbWJlZGRlZFRlbXBsYXRlKGFzdDogRW1iZWRkZWRUZW1wbGF0ZUFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBjb25zdCBub2RlSW5kZXggPSB0aGlzLm5vZGVzLmxlbmd0aDtcbiAgICAvLyByZXNlcnZlIHRoZSBzcGFjZSBpbiB0aGUgbm9kZURlZnMgYXJyYXlcbiAgICB0aGlzLm5vZGVzLnB1c2gobnVsbCAhKTtcblxuICAgIGNvbnN0IHtmbGFncywgcXVlcnlNYXRjaGVzRXhwciwgaG9zdEV2ZW50c30gPSB0aGlzLl92aXNpdEVsZW1lbnRPclRlbXBsYXRlKG5vZGVJbmRleCwgYXN0KTtcblxuICAgIGNvbnN0IGNoaWxkVmlzaXRvciA9IHRoaXMudmlld0J1aWxkZXJGYWN0b3J5KHRoaXMpO1xuICAgIHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZFZpc2l0b3IpO1xuICAgIGNoaWxkVmlzaXRvci52aXNpdEFsbChhc3QudmFyaWFibGVzLCBhc3QuY2hpbGRyZW4pO1xuXG4gICAgY29uc3QgY2hpbGRDb3VudCA9IHRoaXMubm9kZXMubGVuZ3RoIC0gbm9kZUluZGV4IC0gMTtcblxuICAgIC8vIGFuY2hvckRlZihcbiAgICAvLyAgIGZsYWdzOiBOb2RlRmxhZ3MsIG1hdGNoZWRRdWVyaWVzOiBbc3RyaW5nLCBRdWVyeVZhbHVlVHlwZV1bXSwgbmdDb250ZW50SW5kZXg6IG51bWJlcixcbiAgICAvLyAgIGNoaWxkQ291bnQ6IG51bWJlciwgaGFuZGxlRXZlbnRGbj86IEVsZW1lbnRIYW5kbGVFdmVudEZuLCB0ZW1wbGF0ZUZhY3Rvcnk/OlxuICAgIC8vICAgVmlld0RlZmluaXRpb25GYWN0b3J5KTogTm9kZURlZjtcbiAgICB0aGlzLm5vZGVzW25vZGVJbmRleF0gPSAoKSA9PiAoe1xuICAgICAgc291cmNlU3BhbjogYXN0LnNvdXJjZVNwYW4sXG4gICAgICBub2RlRmxhZ3M6IE5vZGVGbGFncy5UeXBlRWxlbWVudCB8IGZsYWdzLFxuICAgICAgbm9kZURlZjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmFuY2hvckRlZikuY2FsbEZuKFtcbiAgICAgICAgby5saXRlcmFsKGZsYWdzKSxcbiAgICAgICAgcXVlcnlNYXRjaGVzRXhwcixcbiAgICAgICAgby5saXRlcmFsKGFzdC5uZ0NvbnRlbnRJbmRleCksXG4gICAgICAgIG8ubGl0ZXJhbChjaGlsZENvdW50KSxcbiAgICAgICAgdGhpcy5fY3JlYXRlRWxlbWVudEhhbmRsZUV2ZW50Rm4obm9kZUluZGV4LCBob3N0RXZlbnRzKSxcbiAgICAgICAgby52YXJpYWJsZShjaGlsZFZpc2l0b3Iudmlld05hbWUpLFxuICAgICAgXSlcbiAgICB9KTtcbiAgfVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgY29uc3Qgbm9kZUluZGV4ID0gdGhpcy5ub2Rlcy5sZW5ndGg7XG4gICAgLy8gcmVzZXJ2ZSB0aGUgc3BhY2UgaW4gdGhlIG5vZGVEZWZzIGFycmF5IHNvIHdlIGNhbiBhZGQgY2hpbGRyZW5cbiAgICB0aGlzLm5vZGVzLnB1c2gobnVsbCAhKTtcblxuICAgIC8vIFVzaW5nIGEgbnVsbCBlbGVtZW50IG5hbWUgY3JlYXRlcyBhbiBhbmNob3IuXG4gICAgY29uc3QgZWxOYW1lOiBzdHJpbmd8bnVsbCA9IGlzTmdDb250YWluZXIoYXN0Lm5hbWUpID8gbnVsbCA6IGFzdC5uYW1lO1xuXG4gICAgY29uc3Qge2ZsYWdzLCB1c2VkRXZlbnRzLCBxdWVyeU1hdGNoZXNFeHByLCBob3N0QmluZGluZ3M6IGRpckhvc3RCaW5kaW5ncywgaG9zdEV2ZW50c30gPVxuICAgICAgICB0aGlzLl92aXNpdEVsZW1lbnRPclRlbXBsYXRlKG5vZGVJbmRleCwgYXN0KTtcblxuICAgIGxldCBpbnB1dERlZnM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgbGV0IHVwZGF0ZVJlbmRlcmVyRXhwcmVzc2lvbnM6IFVwZGF0ZUV4cHJlc3Npb25bXSA9IFtdO1xuICAgIGxldCBvdXRwdXREZWZzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICAgIGlmIChlbE5hbWUpIHtcbiAgICAgIGNvbnN0IGhvc3RCaW5kaW5nczogYW55W10gPSBhc3QuaW5wdXRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGlucHV0QXN0KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogQ09NUF9WQVIgYXMgby5FeHByZXNzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJBc3Q6IG51bGwgYXMgYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY29uY2F0KGRpckhvc3RCaW5kaW5ncyk7XG4gICAgICBpZiAoaG9zdEJpbmRpbmdzLmxlbmd0aCkge1xuICAgICAgICB1cGRhdGVSZW5kZXJlckV4cHJlc3Npb25zID1cbiAgICAgICAgICAgIGhvc3RCaW5kaW5ncy5tYXAoKGhvc3RCaW5kaW5nLCBiaW5kaW5nSW5kZXgpID0+IHRoaXMuX3ByZXByb2Nlc3NVcGRhdGVFeHByZXNzaW9uKHtcbiAgICAgICAgICAgICAgY29udGV4dDogaG9zdEJpbmRpbmcuY29udGV4dCxcbiAgICAgICAgICAgICAgbm9kZUluZGV4LFxuICAgICAgICAgICAgICBiaW5kaW5nSW5kZXgsXG4gICAgICAgICAgICAgIHNvdXJjZVNwYW46IGhvc3RCaW5kaW5nLmlucHV0QXN0LnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgIHZhbHVlOiBob3N0QmluZGluZy5pbnB1dEFzdC52YWx1ZVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICBpbnB1dERlZnMgPSBob3N0QmluZGluZ3MubWFwKFxuICAgICAgICAgICAgaG9zdEJpbmRpbmcgPT4gZWxlbWVudEJpbmRpbmdEZWYoaG9zdEJpbmRpbmcuaW5wdXRBc3QsIGhvc3RCaW5kaW5nLmRpckFzdCkpO1xuICAgICAgfVxuICAgICAgb3V0cHV0RGVmcyA9IHVzZWRFdmVudHMubWFwKFxuICAgICAgICAgIChbdGFyZ2V0LCBldmVudE5hbWVdKSA9PiBvLmxpdGVyYWxBcnIoW28ubGl0ZXJhbCh0YXJnZXQpLCBvLmxpdGVyYWwoZXZlbnROYW1lKV0pKTtcbiAgICB9XG5cbiAgICB0ZW1wbGF0ZVZpc2l0QWxsKHRoaXMsIGFzdC5jaGlsZHJlbik7XG5cbiAgICBjb25zdCBjaGlsZENvdW50ID0gdGhpcy5ub2Rlcy5sZW5ndGggLSBub2RlSW5kZXggLSAxO1xuXG4gICAgY29uc3QgY29tcEFzdCA9IGFzdC5kaXJlY3RpdmVzLmZpbmQoZGlyQXN0ID0+IGRpckFzdC5kaXJlY3RpdmUuaXNDb21wb25lbnQpO1xuICAgIGxldCBjb21wUmVuZGVyZXJUeXBlID0gby5OVUxMX0VYUFIgYXMgby5FeHByZXNzaW9uO1xuICAgIGxldCBjb21wVmlldyA9IG8uTlVMTF9FWFBSIGFzIG8uRXhwcmVzc2lvbjtcbiAgICBpZiAoY29tcEFzdCkge1xuICAgICAgY29tcFZpZXcgPSB0aGlzLm91dHB1dEN0eC5pbXBvcnRFeHByKGNvbXBBc3QuZGlyZWN0aXZlLmNvbXBvbmVudFZpZXdUeXBlKTtcbiAgICAgIGNvbXBSZW5kZXJlclR5cGUgPSB0aGlzLm91dHB1dEN0eC5pbXBvcnRFeHByKGNvbXBBc3QuZGlyZWN0aXZlLnJlbmRlcmVyVHlwZSk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaW5kZXggaXMgdGhlIHNhbWUgYXMgdGhlIG5vZGUgaW5kZXggZHVyaW5nIGNvbXBpbGF0aW9uXG4gICAgLy8gVGhleSBtaWdodCBvbmx5IGRpZmZlciBhdCBydW50aW1lXG4gICAgY29uc3QgY2hlY2tJbmRleCA9IG5vZGVJbmRleDtcblxuICAgIHRoaXMubm9kZXNbbm9kZUluZGV4XSA9ICgpID0+ICh7XG4gICAgICBzb3VyY2VTcGFuOiBhc3Quc291cmNlU3BhbixcbiAgICAgIG5vZGVGbGFnczogTm9kZUZsYWdzLlR5cGVFbGVtZW50IHwgZmxhZ3MsXG4gICAgICBub2RlRGVmOiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuZWxlbWVudERlZikuY2FsbEZuKFtcbiAgICAgICAgby5saXRlcmFsKGNoZWNrSW5kZXgpLFxuICAgICAgICBvLmxpdGVyYWwoZmxhZ3MpLFxuICAgICAgICBxdWVyeU1hdGNoZXNFeHByLFxuICAgICAgICBvLmxpdGVyYWwoYXN0Lm5nQ29udGVudEluZGV4KSxcbiAgICAgICAgby5saXRlcmFsKGNoaWxkQ291bnQpLFxuICAgICAgICBvLmxpdGVyYWwoZWxOYW1lKSxcbiAgICAgICAgZWxOYW1lID8gZml4ZWRBdHRyc0RlZihhc3QpIDogby5OVUxMX0VYUFIsXG4gICAgICAgIGlucHV0RGVmcy5sZW5ndGggPyBvLmxpdGVyYWxBcnIoaW5wdXREZWZzKSA6IG8uTlVMTF9FWFBSLFxuICAgICAgICBvdXRwdXREZWZzLmxlbmd0aCA/IG8ubGl0ZXJhbEFycihvdXRwdXREZWZzKSA6IG8uTlVMTF9FWFBSLFxuICAgICAgICB0aGlzLl9jcmVhdGVFbGVtZW50SGFuZGxlRXZlbnRGbihub2RlSW5kZXgsIGhvc3RFdmVudHMpLFxuICAgICAgICBjb21wVmlldyxcbiAgICAgICAgY29tcFJlbmRlcmVyVHlwZSxcbiAgICAgIF0pLFxuICAgICAgdXBkYXRlUmVuZGVyZXI6IHVwZGF0ZVJlbmRlcmVyRXhwcmVzc2lvbnNcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0RWxlbWVudE9yVGVtcGxhdGUobm9kZUluZGV4OiBudW1iZXIsIGFzdDoge1xuICAgIGhhc1ZpZXdDb250YWluZXI6IGJvb2xlYW4sXG4gICAgb3V0cHV0czogQm91bmRFdmVudEFzdFtdLFxuICAgIGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdLFxuICAgIHByb3ZpZGVyczogUHJvdmlkZXJBc3RbXSxcbiAgICByZWZlcmVuY2VzOiBSZWZlcmVuY2VBc3RbXSxcbiAgICBxdWVyeU1hdGNoZXM6IFF1ZXJ5TWF0Y2hbXVxuICB9KToge1xuICAgIGZsYWdzOiBOb2RlRmxhZ3MsXG4gICAgdXNlZEV2ZW50czogW3N0cmluZyB8IG51bGwsIHN0cmluZ11bXSxcbiAgICBxdWVyeU1hdGNoZXNFeHByOiBvLkV4cHJlc3Npb24sXG4gICAgaG9zdEJpbmRpbmdzOlxuICAgICAgICB7Y29udGV4dDogby5FeHByZXNzaW9uLCBpbnB1dEFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGRpckFzdDogRGlyZWN0aXZlQXN0fVtdLFxuICAgIGhvc3RFdmVudHM6IHtjb250ZXh0OiBvLkV4cHJlc3Npb24sIGV2ZW50QXN0OiBCb3VuZEV2ZW50QXN0LCBkaXJBc3Q6IERpcmVjdGl2ZUFzdH1bXSxcbiAgfSB7XG4gICAgbGV0IGZsYWdzID0gTm9kZUZsYWdzLk5vbmU7XG4gICAgaWYgKGFzdC5oYXNWaWV3Q29udGFpbmVyKSB7XG4gICAgICBmbGFncyB8PSBOb2RlRmxhZ3MuRW1iZWRkZWRWaWV3cztcbiAgICB9XG4gICAgY29uc3QgdXNlZEV2ZW50cyA9IG5ldyBNYXA8c3RyaW5nLCBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nXT4oKTtcbiAgICBhc3Qub3V0cHV0cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgY29uc3Qge25hbWUsIHRhcmdldH0gPSBlbGVtZW50RXZlbnROYW1lQW5kVGFyZ2V0KGV2ZW50LCBudWxsKTtcbiAgICAgIHVzZWRFdmVudHMuc2V0KGVsZW1lbnRFdmVudEZ1bGxOYW1lKHRhcmdldCwgbmFtZSksIFt0YXJnZXQsIG5hbWVdKTtcbiAgICB9KTtcbiAgICBhc3QuZGlyZWN0aXZlcy5mb3JFYWNoKChkaXJBc3QpID0+IHtcbiAgICAgIGRpckFzdC5ob3N0RXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHtuYW1lLCB0YXJnZXR9ID0gZWxlbWVudEV2ZW50TmFtZUFuZFRhcmdldChldmVudCwgZGlyQXN0KTtcbiAgICAgICAgdXNlZEV2ZW50cy5zZXQoZWxlbWVudEV2ZW50RnVsbE5hbWUodGFyZ2V0LCBuYW1lKSwgW3RhcmdldCwgbmFtZV0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29uc3QgaG9zdEJpbmRpbmdzOlxuICAgICAgICB7Y29udGV4dDogby5FeHByZXNzaW9uLCBpbnB1dEFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGRpckFzdDogRGlyZWN0aXZlQXN0fVtdID0gW107XG4gICAgY29uc3QgaG9zdEV2ZW50czoge2NvbnRleHQ6IG8uRXhwcmVzc2lvbiwgZXZlbnRBc3Q6IEJvdW5kRXZlbnRBc3QsIGRpckFzdDogRGlyZWN0aXZlQXN0fVtdID0gW107XG4gICAgdGhpcy5fdmlzaXRDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJQcm92aWRlcihhc3QuZGlyZWN0aXZlcyk7XG5cbiAgICBhc3QucHJvdmlkZXJzLmZvckVhY2goKHByb3ZpZGVyQXN0LCBwcm92aWRlckluZGV4KSA9PiB7XG4gICAgICBsZXQgZGlyQXN0OiBEaXJlY3RpdmVBc3QgPSB1bmRlZmluZWQgITtcbiAgICAgIGxldCBkaXJJbmRleDogbnVtYmVyID0gdW5kZWZpbmVkICE7XG4gICAgICBhc3QuZGlyZWN0aXZlcy5mb3JFYWNoKChsb2NhbERpckFzdCwgaSkgPT4ge1xuICAgICAgICBpZiAobG9jYWxEaXJBc3QuZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlID09PSB0b2tlblJlZmVyZW5jZShwcm92aWRlckFzdC50b2tlbikpIHtcbiAgICAgICAgICBkaXJBc3QgPSBsb2NhbERpckFzdDtcbiAgICAgICAgICBkaXJJbmRleCA9IGk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKGRpckFzdCkge1xuICAgICAgICBjb25zdCB7aG9zdEJpbmRpbmdzOiBkaXJIb3N0QmluZGluZ3MsIGhvc3RFdmVudHM6IGRpckhvc3RFdmVudHN9ID0gdGhpcy5fdmlzaXREaXJlY3RpdmUoXG4gICAgICAgICAgICBwcm92aWRlckFzdCwgZGlyQXN0LCBkaXJJbmRleCwgbm9kZUluZGV4LCBhc3QucmVmZXJlbmNlcywgYXN0LnF1ZXJ5TWF0Y2hlcywgdXNlZEV2ZW50cyxcbiAgICAgICAgICAgIHRoaXMuc3RhdGljUXVlcnlJZHMuZ2V0KDxhbnk+YXN0KSAhKTtcbiAgICAgICAgaG9zdEJpbmRpbmdzLnB1c2goLi4uZGlySG9zdEJpbmRpbmdzKTtcbiAgICAgICAgaG9zdEV2ZW50cy5wdXNoKC4uLmRpckhvc3RFdmVudHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fdmlzaXRQcm92aWRlcihwcm92aWRlckFzdCwgYXN0LnF1ZXJ5TWF0Y2hlcyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgcXVlcnlNYXRjaEV4cHJzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICAgIGFzdC5xdWVyeU1hdGNoZXMuZm9yRWFjaCgobWF0Y2gpID0+IHtcbiAgICAgIGxldCB2YWx1ZVR5cGU6IFF1ZXJ5VmFsdWVUeXBlID0gdW5kZWZpbmVkICE7XG4gICAgICBpZiAodG9rZW5SZWZlcmVuY2UobWF0Y2gudmFsdWUpID09PVxuICAgICAgICAgIHRoaXMucmVmbGVjdG9yLnJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShJZGVudGlmaWVycy5FbGVtZW50UmVmKSkge1xuICAgICAgICB2YWx1ZVR5cGUgPSBRdWVyeVZhbHVlVHlwZS5FbGVtZW50UmVmO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB0b2tlblJlZmVyZW5jZShtYXRjaC52YWx1ZSkgPT09XG4gICAgICAgICAgdGhpcy5yZWZsZWN0b3IucmVzb2x2ZUV4dGVybmFsUmVmZXJlbmNlKElkZW50aWZpZXJzLlZpZXdDb250YWluZXJSZWYpKSB7XG4gICAgICAgIHZhbHVlVHlwZSA9IFF1ZXJ5VmFsdWVUeXBlLlZpZXdDb250YWluZXJSZWY7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHRva2VuUmVmZXJlbmNlKG1hdGNoLnZhbHVlKSA9PT1cbiAgICAgICAgICB0aGlzLnJlZmxlY3Rvci5yZXNvbHZlRXh0ZXJuYWxSZWZlcmVuY2UoSWRlbnRpZmllcnMuVGVtcGxhdGVSZWYpKSB7XG4gICAgICAgIHZhbHVlVHlwZSA9IFF1ZXJ5VmFsdWVUeXBlLlRlbXBsYXRlUmVmO1xuICAgICAgfVxuICAgICAgaWYgKHZhbHVlVHlwZSAhPSBudWxsKSB7XG4gICAgICAgIHF1ZXJ5TWF0Y2hFeHBycy5wdXNoKG8ubGl0ZXJhbEFycihbby5saXRlcmFsKG1hdGNoLnF1ZXJ5SWQpLCBvLmxpdGVyYWwodmFsdWVUeXBlKV0pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBhc3QucmVmZXJlbmNlcy5mb3JFYWNoKChyZWYpID0+IHtcbiAgICAgIGxldCB2YWx1ZVR5cGU6IFF1ZXJ5VmFsdWVUeXBlID0gdW5kZWZpbmVkICE7XG4gICAgICBpZiAoIXJlZi52YWx1ZSkge1xuICAgICAgICB2YWx1ZVR5cGUgPSBRdWVyeVZhbHVlVHlwZS5SZW5kZXJFbGVtZW50O1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB0b2tlblJlZmVyZW5jZShyZWYudmFsdWUpID09PVxuICAgICAgICAgIHRoaXMucmVmbGVjdG9yLnJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShJZGVudGlmaWVycy5UZW1wbGF0ZVJlZikpIHtcbiAgICAgICAgdmFsdWVUeXBlID0gUXVlcnlWYWx1ZVR5cGUuVGVtcGxhdGVSZWY7XG4gICAgICB9XG4gICAgICBpZiAodmFsdWVUeXBlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZWZOb2RlSW5kaWNlc1tyZWYubmFtZV0gPSBub2RlSW5kZXg7XG4gICAgICAgIHF1ZXJ5TWF0Y2hFeHBycy5wdXNoKG8ubGl0ZXJhbEFycihbby5saXRlcmFsKHJlZi5uYW1lKSwgby5saXRlcmFsKHZhbHVlVHlwZSldKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYXN0Lm91dHB1dHMuZm9yRWFjaCgob3V0cHV0QXN0KSA9PiB7XG4gICAgICBob3N0RXZlbnRzLnB1c2goe2NvbnRleHQ6IENPTVBfVkFSLCBldmVudEFzdDogb3V0cHV0QXN0LCBkaXJBc3Q6IG51bGwgIX0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZsYWdzLFxuICAgICAgdXNlZEV2ZW50czogQXJyYXkuZnJvbSh1c2VkRXZlbnRzLnZhbHVlcygpKSxcbiAgICAgIHF1ZXJ5TWF0Y2hlc0V4cHI6IHF1ZXJ5TWF0Y2hFeHBycy5sZW5ndGggPyBvLmxpdGVyYWxBcnIocXVlcnlNYXRjaEV4cHJzKSA6IG8uTlVMTF9FWFBSLFxuICAgICAgaG9zdEJpbmRpbmdzLFxuICAgICAgaG9zdEV2ZW50czogaG9zdEV2ZW50c1xuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF92aXNpdERpcmVjdGl2ZShcbiAgICAgIHByb3ZpZGVyQXN0OiBQcm92aWRlckFzdCwgZGlyQXN0OiBEaXJlY3RpdmVBc3QsIGRpcmVjdGl2ZUluZGV4OiBudW1iZXIsXG4gICAgICBlbGVtZW50Tm9kZUluZGV4OiBudW1iZXIsIHJlZnM6IFJlZmVyZW5jZUFzdFtdLCBxdWVyeU1hdGNoZXM6IFF1ZXJ5TWF0Y2hbXSxcbiAgICAgIHVzZWRFdmVudHM6IE1hcDxzdHJpbmcsIGFueT4sIHF1ZXJ5SWRzOiBTdGF0aWNBbmREeW5hbWljUXVlcnlJZHMpOiB7XG4gICAgaG9zdEJpbmRpbmdzOlxuICAgICAgICB7Y29udGV4dDogby5FeHByZXNzaW9uLCBpbnB1dEFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGRpckFzdDogRGlyZWN0aXZlQXN0fVtdLFxuICAgIGhvc3RFdmVudHM6IHtjb250ZXh0OiBvLkV4cHJlc3Npb24sIGV2ZW50QXN0OiBCb3VuZEV2ZW50QXN0LCBkaXJBc3Q6IERpcmVjdGl2ZUFzdH1bXVxuICB9IHtcbiAgICBjb25zdCBub2RlSW5kZXggPSB0aGlzLm5vZGVzLmxlbmd0aDtcbiAgICAvLyByZXNlcnZlIHRoZSBzcGFjZSBpbiB0aGUgbm9kZURlZnMgYXJyYXkgc28gd2UgY2FuIGFkZCBjaGlsZHJlblxuICAgIHRoaXMubm9kZXMucHVzaChudWxsICEpO1xuXG4gICAgZGlyQXN0LmRpcmVjdGl2ZS5xdWVyaWVzLmZvckVhY2goKHF1ZXJ5LCBxdWVyeUluZGV4KSA9PiB7XG4gICAgICBjb25zdCBxdWVyeUlkID0gZGlyQXN0LmNvbnRlbnRRdWVyeVN0YXJ0SWQgKyBxdWVyeUluZGV4O1xuICAgICAgY29uc3QgZmxhZ3MgPVxuICAgICAgICAgIE5vZGVGbGFncy5UeXBlQ29udGVudFF1ZXJ5IHwgY2FsY1N0YXRpY0R5bmFtaWNRdWVyeUZsYWdzKHF1ZXJ5SWRzLCBxdWVyeUlkLCBxdWVyeS5maXJzdCk7XG4gICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IHF1ZXJ5LmZpcnN0ID8gUXVlcnlCaW5kaW5nVHlwZS5GaXJzdCA6IFF1ZXJ5QmluZGluZ1R5cGUuQWxsO1xuICAgICAgdGhpcy5ub2Rlcy5wdXNoKCgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBkaXJBc3Quc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVGbGFnczogZmxhZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlRGVmOiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMucXVlcnlEZWYpLmNhbGxGbihbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChmbGFncyksIG8ubGl0ZXJhbChxdWVyeUlkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IG8uTGl0ZXJhbE1hcEV4cHIoW25ldyBvLkxpdGVyYWxNYXBFbnRyeShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5LnByb3BlcnR5TmFtZSwgby5saXRlcmFsKGJpbmRpbmdUeXBlKSwgZmFsc2UpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9KTtcblxuICAgIC8vIE5vdGU6IHRoZSBvcGVyYXRpb24gYmVsb3cgbWlnaHQgYWxzbyBjcmVhdGUgbmV3IG5vZGVEZWZzLFxuICAgIC8vIGJ1dCB3ZSBkb24ndCB3YW50IHRoZW0gdG8gYmUgYSBjaGlsZCBvZiBhIGRpcmVjdGl2ZSxcbiAgICAvLyBhcyB0aGV5IG1pZ2h0IGJlIGEgcHJvdmlkZXIvcGlwZSBvbiB0aGVpciBvd24uXG4gICAgLy8gSS5lLiB3ZSBvbmx5IGFsbG93IHF1ZXJpZXMgYXMgY2hpbGRyZW4gb2YgZGlyZWN0aXZlcyBub2Rlcy5cbiAgICBjb25zdCBjaGlsZENvdW50ID0gdGhpcy5ub2Rlcy5sZW5ndGggLSBub2RlSW5kZXggLSAxO1xuXG4gICAgbGV0IHtmbGFncywgcXVlcnlNYXRjaEV4cHJzLCBwcm92aWRlckV4cHIsIGRlcHNFeHByfSA9XG4gICAgICAgIHRoaXMuX3Zpc2l0UHJvdmlkZXJPckRpcmVjdGl2ZShwcm92aWRlckFzdCwgcXVlcnlNYXRjaGVzKTtcblxuICAgIHJlZnMuZm9yRWFjaCgocmVmKSA9PiB7XG4gICAgICBpZiAocmVmLnZhbHVlICYmIHRva2VuUmVmZXJlbmNlKHJlZi52YWx1ZSkgPT09IHRva2VuUmVmZXJlbmNlKHByb3ZpZGVyQXN0LnRva2VuKSkge1xuICAgICAgICB0aGlzLnJlZk5vZGVJbmRpY2VzW3JlZi5uYW1lXSA9IG5vZGVJbmRleDtcbiAgICAgICAgcXVlcnlNYXRjaEV4cHJzLnB1c2goXG4gICAgICAgICAgICBvLmxpdGVyYWxBcnIoW28ubGl0ZXJhbChyZWYubmFtZSksIG8ubGl0ZXJhbChRdWVyeVZhbHVlVHlwZS5Qcm92aWRlcildKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoZGlyQXN0LmRpcmVjdGl2ZS5pc0NvbXBvbmVudCkge1xuICAgICAgZmxhZ3MgfD0gTm9kZUZsYWdzLkNvbXBvbmVudDtcbiAgICB9XG5cbiAgICBjb25zdCBpbnB1dERlZnMgPSBkaXJBc3QuaW5wdXRzLm1hcCgoaW5wdXRBc3QsIGlucHV0SW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IG1hcFZhbHVlID0gby5saXRlcmFsQXJyKFtvLmxpdGVyYWwoaW5wdXRJbmRleCksIG8ubGl0ZXJhbChpbnB1dEFzdC5kaXJlY3RpdmVOYW1lKV0pO1xuICAgICAgLy8gTm90ZTogaXQncyBpbXBvcnRhbnQgdG8gbm90IHF1b3RlIHRoZSBrZXkgc28gdGhhdCB3ZSBjYW4gY2FwdHVyZSByZW5hbWVzIGJ5IG1pbmlmaWVycyFcbiAgICAgIHJldHVybiBuZXcgby5MaXRlcmFsTWFwRW50cnkoaW5wdXRBc3QuZGlyZWN0aXZlTmFtZSwgbWFwVmFsdWUsIGZhbHNlKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IG91dHB1dERlZnM6IG8uTGl0ZXJhbE1hcEVudHJ5W10gPSBbXTtcbiAgICBjb25zdCBkaXJNZXRhID0gZGlyQXN0LmRpcmVjdGl2ZTtcbiAgICBPYmplY3Qua2V5cyhkaXJNZXRhLm91dHB1dHMpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG4gICAgICBjb25zdCBldmVudE5hbWUgPSBkaXJNZXRhLm91dHB1dHNbcHJvcE5hbWVdO1xuICAgICAgaWYgKHVzZWRFdmVudHMuaGFzKGV2ZW50TmFtZSkpIHtcbiAgICAgICAgLy8gTm90ZTogaXQncyBpbXBvcnRhbnQgdG8gbm90IHF1b3RlIHRoZSBrZXkgc28gdGhhdCB3ZSBjYW4gY2FwdHVyZSByZW5hbWVzIGJ5IG1pbmlmaWVycyFcbiAgICAgICAgb3V0cHV0RGVmcy5wdXNoKG5ldyBvLkxpdGVyYWxNYXBFbnRyeShwcm9wTmFtZSwgby5saXRlcmFsKGV2ZW50TmFtZSksIGZhbHNlKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgbGV0IHVwZGF0ZURpcmVjdGl2ZUV4cHJlc3Npb25zOiBVcGRhdGVFeHByZXNzaW9uW10gPSBbXTtcbiAgICBpZiAoZGlyQXN0LmlucHV0cy5sZW5ndGggfHwgKGZsYWdzICYgKE5vZGVGbGFncy5Eb0NoZWNrIHwgTm9kZUZsYWdzLk9uSW5pdCkpID4gMCkge1xuICAgICAgdXBkYXRlRGlyZWN0aXZlRXhwcmVzc2lvbnMgPVxuICAgICAgICAgIGRpckFzdC5pbnB1dHMubWFwKChpbnB1dCwgYmluZGluZ0luZGV4KSA9PiB0aGlzLl9wcmVwcm9jZXNzVXBkYXRlRXhwcmVzc2lvbih7XG4gICAgICAgICAgICBub2RlSW5kZXgsXG4gICAgICAgICAgICBiaW5kaW5nSW5kZXgsXG4gICAgICAgICAgICBzb3VyY2VTcGFuOiBpbnB1dC5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgY29udGV4dDogQ09NUF9WQVIsXG4gICAgICAgICAgICB2YWx1ZTogaW5wdXQudmFsdWVcbiAgICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgY29uc3QgZGlyQ29udGV4dEV4cHIgPVxuICAgICAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMubm9kZVZhbHVlKS5jYWxsRm4oW1ZJRVdfVkFSLCBvLmxpdGVyYWwobm9kZUluZGV4KV0pO1xuICAgIGNvbnN0IGhvc3RCaW5kaW5ncyA9IGRpckFzdC5ob3N0UHJvcGVydGllcy5tYXAoKGlucHV0QXN0KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBkaXJDb250ZXh0RXhwcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyQXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dEFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICBjb25zdCBob3N0RXZlbnRzID0gZGlyQXN0Lmhvc3RFdmVudHMubWFwKChob3N0RXZlbnRBc3QpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGRpckNvbnRleHRFeHByLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudEFzdDogaG9zdEV2ZW50QXN0LCBkaXJBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAvLyBDaGVjayBpbmRleCBpcyB0aGUgc2FtZSBhcyB0aGUgbm9kZSBpbmRleCBkdXJpbmcgY29tcGlsYXRpb25cbiAgICAvLyBUaGV5IG1pZ2h0IG9ubHkgZGlmZmVyIGF0IHJ1bnRpbWVcbiAgICBjb25zdCBjaGVja0luZGV4ID0gbm9kZUluZGV4O1xuXG4gICAgdGhpcy5ub2Rlc1tub2RlSW5kZXhdID0gKCkgPT4gKHtcbiAgICAgIHNvdXJjZVNwYW46IGRpckFzdC5zb3VyY2VTcGFuLFxuICAgICAgbm9kZUZsYWdzOiBOb2RlRmxhZ3MuVHlwZURpcmVjdGl2ZSB8IGZsYWdzLFxuICAgICAgbm9kZURlZjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmRpcmVjdGl2ZURlZikuY2FsbEZuKFtcbiAgICAgICAgby5saXRlcmFsKGNoZWNrSW5kZXgpLFxuICAgICAgICBvLmxpdGVyYWwoZmxhZ3MpLFxuICAgICAgICBxdWVyeU1hdGNoRXhwcnMubGVuZ3RoID8gby5saXRlcmFsQXJyKHF1ZXJ5TWF0Y2hFeHBycykgOiBvLk5VTExfRVhQUixcbiAgICAgICAgby5saXRlcmFsKGNoaWxkQ291bnQpLFxuICAgICAgICBwcm92aWRlckV4cHIsXG4gICAgICAgIGRlcHNFeHByLFxuICAgICAgICBpbnB1dERlZnMubGVuZ3RoID8gbmV3IG8uTGl0ZXJhbE1hcEV4cHIoaW5wdXREZWZzKSA6IG8uTlVMTF9FWFBSLFxuICAgICAgICBvdXRwdXREZWZzLmxlbmd0aCA/IG5ldyBvLkxpdGVyYWxNYXBFeHByKG91dHB1dERlZnMpIDogby5OVUxMX0VYUFIsXG4gICAgICBdKSxcbiAgICAgIHVwZGF0ZURpcmVjdGl2ZXM6IHVwZGF0ZURpcmVjdGl2ZUV4cHJlc3Npb25zLFxuICAgICAgZGlyZWN0aXZlOiBkaXJBc3QuZGlyZWN0aXZlLnR5cGUsXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge2hvc3RCaW5kaW5ncywgaG9zdEV2ZW50c307XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFByb3ZpZGVyKHByb3ZpZGVyQXN0OiBQcm92aWRlckFzdCwgcXVlcnlNYXRjaGVzOiBRdWVyeU1hdGNoW10pOiB2b2lkIHtcbiAgICB0aGlzLl9hZGRQcm92aWRlck5vZGUodGhpcy5fdmlzaXRQcm92aWRlck9yRGlyZWN0aXZlKHByb3ZpZGVyQXN0LCBxdWVyeU1hdGNoZXMpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyUHJvdmlkZXIoZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10pIHtcbiAgICBjb25zdCBjb21wb25lbnREaXJNZXRhID0gZGlyZWN0aXZlcy5maW5kKGRpckFzdCA9PiBkaXJBc3QuZGlyZWN0aXZlLmlzQ29tcG9uZW50KTtcbiAgICBpZiAoY29tcG9uZW50RGlyTWV0YSAmJiBjb21wb25lbnREaXJNZXRhLmRpcmVjdGl2ZS5lbnRyeUNvbXBvbmVudHMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB7cHJvdmlkZXJFeHByLCBkZXBzRXhwciwgZmxhZ3MsIHRva2VuRXhwcn0gPSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJQcm92aWRlckRlZihcbiAgICAgICAgICB0aGlzLnJlZmxlY3RvciwgdGhpcy5vdXRwdXRDdHgsIE5vZGVGbGFncy5Qcml2YXRlUHJvdmlkZXIsXG4gICAgICAgICAgY29tcG9uZW50RGlyTWV0YS5kaXJlY3RpdmUuZW50cnlDb21wb25lbnRzKTtcbiAgICAgIHRoaXMuX2FkZFByb3ZpZGVyTm9kZSh7XG4gICAgICAgIHByb3ZpZGVyRXhwcixcbiAgICAgICAgZGVwc0V4cHIsXG4gICAgICAgIGZsYWdzLFxuICAgICAgICB0b2tlbkV4cHIsXG4gICAgICAgIHF1ZXJ5TWF0Y2hFeHByczogW10sXG4gICAgICAgIHNvdXJjZVNwYW46IGNvbXBvbmVudERpck1ldGEuc291cmNlU3BhblxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYWRkUHJvdmlkZXJOb2RlKGRhdGE6IHtcbiAgICBmbGFnczogTm9kZUZsYWdzLFxuICAgIHF1ZXJ5TWF0Y2hFeHByczogby5FeHByZXNzaW9uW10sXG4gICAgcHJvdmlkZXJFeHByOiBvLkV4cHJlc3Npb24sXG4gICAgZGVwc0V4cHI6IG8uRXhwcmVzc2lvbixcbiAgICB0b2tlbkV4cHI6IG8uRXhwcmVzc2lvbixcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW5cbiAgfSkge1xuICAgIGNvbnN0IG5vZGVJbmRleCA9IHRoaXMubm9kZXMubGVuZ3RoO1xuICAgIC8vIHByb3ZpZGVyRGVmKFxuICAgIC8vICAgZmxhZ3M6IE5vZGVGbGFncywgbWF0Y2hlZFF1ZXJpZXM6IFtzdHJpbmcsIFF1ZXJ5VmFsdWVUeXBlXVtdLCB0b2tlbjphbnksXG4gICAgLy8gICB2YWx1ZTogYW55LCBkZXBzOiAoW0RlcEZsYWdzLCBhbnldIHwgYW55KVtdKTogTm9kZURlZjtcbiAgICB0aGlzLm5vZGVzLnB1c2goXG4gICAgICAgICgpID0+ICh7XG4gICAgICAgICAgc291cmNlU3BhbjogZGF0YS5zb3VyY2VTcGFuLFxuICAgICAgICAgIG5vZGVGbGFnczogZGF0YS5mbGFncyxcbiAgICAgICAgICBub2RlRGVmOiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMucHJvdmlkZXJEZWYpLmNhbGxGbihbXG4gICAgICAgICAgICBvLmxpdGVyYWwoZGF0YS5mbGFncyksXG4gICAgICAgICAgICBkYXRhLnF1ZXJ5TWF0Y2hFeHBycy5sZW5ndGggPyBvLmxpdGVyYWxBcnIoZGF0YS5xdWVyeU1hdGNoRXhwcnMpIDogby5OVUxMX0VYUFIsXG4gICAgICAgICAgICBkYXRhLnRva2VuRXhwciwgZGF0YS5wcm92aWRlckV4cHIsIGRhdGEuZGVwc0V4cHJcbiAgICAgICAgICBdKVxuICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFByb3ZpZGVyT3JEaXJlY3RpdmUocHJvdmlkZXJBc3Q6IFByb3ZpZGVyQXN0LCBxdWVyeU1hdGNoZXM6IFF1ZXJ5TWF0Y2hbXSk6IHtcbiAgICBmbGFnczogTm9kZUZsYWdzLFxuICAgIHRva2VuRXhwcjogby5FeHByZXNzaW9uLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBxdWVyeU1hdGNoRXhwcnM6IG8uRXhwcmVzc2lvbltdLFxuICAgIHByb3ZpZGVyRXhwcjogby5FeHByZXNzaW9uLFxuICAgIGRlcHNFeHByOiBvLkV4cHJlc3Npb25cbiAgfSB7XG4gICAgbGV0IGZsYWdzID0gTm9kZUZsYWdzLk5vbmU7XG4gICAgbGV0IHF1ZXJ5TWF0Y2hFeHByczogby5FeHByZXNzaW9uW10gPSBbXTtcblxuICAgIHF1ZXJ5TWF0Y2hlcy5mb3JFYWNoKChtYXRjaCkgPT4ge1xuICAgICAgaWYgKHRva2VuUmVmZXJlbmNlKG1hdGNoLnZhbHVlKSA9PT0gdG9rZW5SZWZlcmVuY2UocHJvdmlkZXJBc3QudG9rZW4pKSB7XG4gICAgICAgIHF1ZXJ5TWF0Y2hFeHBycy5wdXNoKFxuICAgICAgICAgICAgby5saXRlcmFsQXJyKFtvLmxpdGVyYWwobWF0Y2gucXVlcnlJZCksIG8ubGl0ZXJhbChRdWVyeVZhbHVlVHlwZS5Qcm92aWRlcildKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc3Qge3Byb3ZpZGVyRXhwciwgZGVwc0V4cHIsIGZsYWdzOiBwcm92aWRlckZsYWdzLCB0b2tlbkV4cHJ9ID1cbiAgICAgICAgcHJvdmlkZXJEZWYodGhpcy5vdXRwdXRDdHgsIHByb3ZpZGVyQXN0KTtcbiAgICByZXR1cm4ge1xuICAgICAgZmxhZ3M6IGZsYWdzIHwgcHJvdmlkZXJGbGFncyxcbiAgICAgIHF1ZXJ5TWF0Y2hFeHBycyxcbiAgICAgIHByb3ZpZGVyRXhwcixcbiAgICAgIGRlcHNFeHByLFxuICAgICAgdG9rZW5FeHByLFxuICAgICAgc291cmNlU3BhbjogcHJvdmlkZXJBc3Quc291cmNlU3BhblxuICAgIH07XG4gIH1cblxuICBnZXRMb2NhbChuYW1lOiBzdHJpbmcpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gICAgaWYgKG5hbWUgPT0gRXZlbnRIYW5kbGVyVmFycy5ldmVudC5uYW1lKSB7XG4gICAgICByZXR1cm4gRXZlbnRIYW5kbGVyVmFycy5ldmVudDtcbiAgICB9XG4gICAgbGV0IGN1cnJWaWV3RXhwcjogby5FeHByZXNzaW9uID0gVklFV19WQVI7XG4gICAgZm9yIChsZXQgY3VyckJ1aWxkZXI6IFZpZXdCdWlsZGVyfG51bGwgPSB0aGlzOyBjdXJyQnVpbGRlcjsgY3VyckJ1aWxkZXIgPSBjdXJyQnVpbGRlci5wYXJlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJWaWV3RXhwciA9IGN1cnJWaWV3RXhwci5wcm9wKCdwYXJlbnQnKS5jYXN0KG8uRFlOQU1JQ19UWVBFKSkge1xuICAgICAgLy8gY2hlY2sgcmVmZXJlbmNlc1xuICAgICAgY29uc3QgcmVmTm9kZUluZGV4ID0gY3VyckJ1aWxkZXIucmVmTm9kZUluZGljZXNbbmFtZV07XG4gICAgICBpZiAocmVmTm9kZUluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5ub2RlVmFsdWUpLmNhbGxGbihbY3VyclZpZXdFeHByLCBvLmxpdGVyYWwocmVmTm9kZUluZGV4KV0pO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayB2YXJpYWJsZXNcbiAgICAgIGNvbnN0IHZhckFzdCA9IGN1cnJCdWlsZGVyLnZhcmlhYmxlcy5maW5kKCh2YXJBc3QpID0+IHZhckFzdC5uYW1lID09PSBuYW1lKTtcbiAgICAgIGlmICh2YXJBc3QpIHtcbiAgICAgICAgY29uc3QgdmFyVmFsdWUgPSB2YXJBc3QudmFsdWUgfHwgSU1QTElDSVRfVEVNUExBVEVfVkFSO1xuICAgICAgICByZXR1cm4gY3VyclZpZXdFeHByLnByb3AoJ2NvbnRleHQnKS5wcm9wKHZhclZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVMaXRlcmFsQXJyYXlDb252ZXJ0ZXIoc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBhcmdDb3VudDogbnVtYmVyKTpcbiAgICAgIEJ1aWx0aW5Db252ZXJ0ZXIge1xuICAgIGlmIChhcmdDb3VudCA9PT0gMCkge1xuICAgICAgY29uc3QgdmFsdWVFeHByID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkVNUFRZX0FSUkFZKTtcbiAgICAgIHJldHVybiAoKSA9PiB2YWx1ZUV4cHI7XG4gICAgfVxuXG4gICAgY29uc3QgY2hlY2tJbmRleCA9IHRoaXMubm9kZXMubGVuZ3RoO1xuXG4gICAgdGhpcy5ub2Rlcy5wdXNoKCgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICBub2RlRmxhZ3M6IE5vZGVGbGFncy5UeXBlUHVyZUFycmF5LFxuICAgICAgICAgICAgICAgICAgICAgIG5vZGVEZWY6IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5wdXJlQXJyYXlEZWYpLmNhbGxGbihbXG4gICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwoY2hlY2tJbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwoYXJnQ291bnQpLFxuICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgIHJldHVybiAoYXJnczogby5FeHByZXNzaW9uW10pID0+IGNhbGxDaGVja1N0bXQoY2hlY2tJbmRleCwgYXJncyk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVMaXRlcmFsTWFwQ29udmVydGVyKFxuICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBrZXlzOiB7a2V5OiBzdHJpbmcsIHF1b3RlZDogYm9vbGVhbn1bXSk6IEJ1aWx0aW5Db252ZXJ0ZXIge1xuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgdmFsdWVFeHByID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkVNUFRZX01BUCk7XG4gICAgICByZXR1cm4gKCkgPT4gdmFsdWVFeHByO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcCA9IG8ubGl0ZXJhbE1hcChrZXlzLm1hcCgoZSwgaSkgPT4gKHsuLi5lLCB2YWx1ZTogby5saXRlcmFsKGkpfSkpKTtcbiAgICBjb25zdCBjaGVja0luZGV4ID0gdGhpcy5ub2Rlcy5sZW5ndGg7XG4gICAgdGhpcy5ub2Rlcy5wdXNoKCgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICBub2RlRmxhZ3M6IE5vZGVGbGFncy5UeXBlUHVyZU9iamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICBub2RlRGVmOiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMucHVyZU9iamVjdERlZikuY2FsbEZuKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChjaGVja0luZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcCxcbiAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICByZXR1cm4gKGFyZ3M6IG8uRXhwcmVzc2lvbltdKSA9PiBjYWxsQ2hlY2tTdG10KGNoZWNrSW5kZXgsIGFyZ3MpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlUGlwZUNvbnZlcnRlcihleHByZXNzaW9uOiBVcGRhdGVFeHByZXNzaW9uLCBuYW1lOiBzdHJpbmcsIGFyZ0NvdW50OiBudW1iZXIpOlxuICAgICAgQnVpbHRpbkNvbnZlcnRlciB7XG4gICAgY29uc3QgcGlwZSA9IHRoaXMudXNlZFBpcGVzLmZpbmQoKHBpcGVTdW1tYXJ5KSA9PiBwaXBlU3VtbWFyeS5uYW1lID09PSBuYW1lKSAhO1xuICAgIGlmIChwaXBlLnB1cmUpIHtcbiAgICAgIGNvbnN0IGNoZWNrSW5kZXggPSB0aGlzLm5vZGVzLmxlbmd0aDtcbiAgICAgIHRoaXMubm9kZXMucHVzaCgoKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogZXhwcmVzc2lvbi5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZUZsYWdzOiBOb2RlRmxhZ3MuVHlwZVB1cmVQaXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZURlZjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnB1cmVQaXBlRGVmKS5jYWxsRm4oW1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwoY2hlY2tJbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChhcmdDb3VudCksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgLy8gZmluZCB1bmRlcmx5aW5nIHBpcGUgaW4gdGhlIGNvbXBvbmVudCB2aWV3XG4gICAgICBsZXQgY29tcFZpZXdFeHByOiBvLkV4cHJlc3Npb24gPSBWSUVXX1ZBUjtcbiAgICAgIGxldCBjb21wQnVpbGRlcjogVmlld0J1aWxkZXIgPSB0aGlzO1xuICAgICAgd2hpbGUgKGNvbXBCdWlsZGVyLnBhcmVudCkge1xuICAgICAgICBjb21wQnVpbGRlciA9IGNvbXBCdWlsZGVyLnBhcmVudDtcbiAgICAgICAgY29tcFZpZXdFeHByID0gY29tcFZpZXdFeHByLnByb3AoJ3BhcmVudCcpLmNhc3Qoby5EWU5BTUlDX1RZUEUpO1xuICAgICAgfVxuICAgICAgY29uc3QgcGlwZU5vZGVJbmRleCA9IGNvbXBCdWlsZGVyLnB1cmVQaXBlTm9kZUluZGljZXNbbmFtZV07XG4gICAgICBjb25zdCBwaXBlVmFsdWVFeHByOiBvLkV4cHJlc3Npb24gPVxuICAgICAgICAgIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5ub2RlVmFsdWUpLmNhbGxGbihbY29tcFZpZXdFeHByLCBvLmxpdGVyYWwocGlwZU5vZGVJbmRleCldKTtcblxuICAgICAgcmV0dXJuIChhcmdzOiBvLkV4cHJlc3Npb25bXSkgPT4gY2FsbFVud3JhcFZhbHVlKFxuICAgICAgICAgICAgICAgICBleHByZXNzaW9uLm5vZGVJbmRleCwgZXhwcmVzc2lvbi5iaW5kaW5nSW5kZXgsXG4gICAgICAgICAgICAgICAgIGNhbGxDaGVja1N0bXQoY2hlY2tJbmRleCwgW3BpcGVWYWx1ZUV4cHJdLmNvbmNhdChhcmdzKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBub2RlSW5kZXggPSB0aGlzLl9jcmVhdGVQaXBlKGV4cHJlc3Npb24uc291cmNlU3BhbiwgcGlwZSk7XG4gICAgICBjb25zdCBub2RlVmFsdWVFeHByID1cbiAgICAgICAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMubm9kZVZhbHVlKS5jYWxsRm4oW1ZJRVdfVkFSLCBvLmxpdGVyYWwobm9kZUluZGV4KV0pO1xuXG4gICAgICByZXR1cm4gKGFyZ3M6IG8uRXhwcmVzc2lvbltdKSA9PiBjYWxsVW53cmFwVmFsdWUoXG4gICAgICAgICAgICAgICAgIGV4cHJlc3Npb24ubm9kZUluZGV4LCBleHByZXNzaW9uLmJpbmRpbmdJbmRleCxcbiAgICAgICAgICAgICAgICAgbm9kZVZhbHVlRXhwci5jYWxsTWV0aG9kKCd0cmFuc2Zvcm0nLCBhcmdzKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlUGlwZShzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCwgcGlwZTogQ29tcGlsZVBpcGVTdW1tYXJ5KTogbnVtYmVyIHtcbiAgICBjb25zdCBub2RlSW5kZXggPSB0aGlzLm5vZGVzLmxlbmd0aDtcbiAgICBsZXQgZmxhZ3MgPSBOb2RlRmxhZ3MuTm9uZTtcbiAgICBwaXBlLnR5cGUubGlmZWN5Y2xlSG9va3MuZm9yRWFjaCgobGlmZWN5Y2xlSG9vaykgPT4ge1xuICAgICAgLy8gZm9yIHBpcGVzLCB3ZSBvbmx5IHN1cHBvcnQgbmdPbkRlc3Ryb3lcbiAgICAgIGlmIChsaWZlY3ljbGVIb29rID09PSBMaWZlY3ljbGVIb29rcy5PbkRlc3Ryb3kpIHtcbiAgICAgICAgZmxhZ3MgfD0gbGlmZWN5Y2xlSG9va1RvTm9kZUZsYWcobGlmZWN5Y2xlSG9vayk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBkZXBFeHBycyA9IHBpcGUudHlwZS5kaURlcHMubWFwKChkaURlcCkgPT4gZGVwRGVmKHRoaXMub3V0cHV0Q3R4LCBkaURlcCkpO1xuICAgIC8vIGZ1bmN0aW9uIHBpcGVEZWYoXG4gICAgLy8gICBmbGFnczogTm9kZUZsYWdzLCBjdG9yOiBhbnksIGRlcHM6IChbRGVwRmxhZ3MsIGFueV0gfCBhbnkpW10pOiBOb2RlRGVmXG4gICAgdGhpcy5ub2Rlcy5wdXNoKFxuICAgICAgICAoKSA9PiAoe1xuICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICAgbm9kZUZsYWdzOiBOb2RlRmxhZ3MuVHlwZVBpcGUsXG4gICAgICAgICAgbm9kZURlZjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnBpcGVEZWYpLmNhbGxGbihbXG4gICAgICAgICAgICBvLmxpdGVyYWwoZmxhZ3MpLCB0aGlzLm91dHB1dEN0eC5pbXBvcnRFeHByKHBpcGUudHlwZS5yZWZlcmVuY2UpLCBvLmxpdGVyYWxBcnIoZGVwRXhwcnMpXG4gICAgICAgICAgXSlcbiAgICAgICAgfSkpO1xuICAgIHJldHVybiBub2RlSW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogRm9yIHRoZSBBU1QgaW4gYFVwZGF0ZUV4cHJlc3Npb24udmFsdWVgOlxuICAgKiAtIGNyZWF0ZSBub2RlcyBmb3IgcGlwZXMsIGxpdGVyYWwgYXJyYXlzIGFuZCwgbGl0ZXJhbCBtYXBzLFxuICAgKiAtIHVwZGF0ZSB0aGUgQVNUIHRvIHJlcGxhY2UgcGlwZXMsIGxpdGVyYWwgYXJyYXlzIGFuZCwgbGl0ZXJhbCBtYXBzIHdpdGggY2FsbHMgdG8gY2hlY2sgZm4uXG4gICAqXG4gICAqIFdBUk5JTkc6IFRoaXMgbWlnaHQgY3JlYXRlIG5ldyBub2RlRGVmcyAoZm9yIHBpcGVzIGFuZCBsaXRlcmFsIGFycmF5cyBhbmQgbGl0ZXJhbCBtYXBzKSFcbiAgICovXG4gIHByaXZhdGUgX3ByZXByb2Nlc3NVcGRhdGVFeHByZXNzaW9uKGV4cHJlc3Npb246IFVwZGF0ZUV4cHJlc3Npb24pOiBVcGRhdGVFeHByZXNzaW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgbm9kZUluZGV4OiBleHByZXNzaW9uLm5vZGVJbmRleCxcbiAgICAgIGJpbmRpbmdJbmRleDogZXhwcmVzc2lvbi5iaW5kaW5nSW5kZXgsXG4gICAgICBzb3VyY2VTcGFuOiBleHByZXNzaW9uLnNvdXJjZVNwYW4sXG4gICAgICBjb250ZXh0OiBleHByZXNzaW9uLmNvbnRleHQsXG4gICAgICB2YWx1ZTogY29udmVydFByb3BlcnR5QmluZGluZ0J1aWx0aW5zKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNyZWF0ZUxpdGVyYWxBcnJheUNvbnZlcnRlcjogKGFyZ0NvdW50OiBudW1iZXIpID0+IHRoaXMuX2NyZWF0ZUxpdGVyYWxBcnJheUNvbnZlcnRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24uc291cmNlU3BhbiwgYXJnQ291bnQpLFxuICAgICAgICAgICAgY3JlYXRlTGl0ZXJhbE1hcENvbnZlcnRlcjpcbiAgICAgICAgICAgICAgICAoa2V5czoge2tleTogc3RyaW5nLCBxdW90ZWQ6IGJvb2xlYW59W10pID0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUxpdGVyYWxNYXBDb252ZXJ0ZXIoZXhwcmVzc2lvbi5zb3VyY2VTcGFuLCBrZXlzKSxcbiAgICAgICAgICAgIGNyZWF0ZVBpcGVDb252ZXJ0ZXI6IChuYW1lOiBzdHJpbmcsIGFyZ0NvdW50OiBudW1iZXIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlUGlwZUNvbnZlcnRlcihleHByZXNzaW9uLCBuYW1lLCBhcmdDb3VudClcbiAgICAgICAgICB9LFxuICAgICAgICAgIGV4cHJlc3Npb24udmFsdWUpXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZU5vZGVFeHByZXNzaW9ucygpOiB7XG4gICAgdXBkYXRlUmVuZGVyZXJTdG10czogby5TdGF0ZW1lbnRbXSxcbiAgICB1cGRhdGVEaXJlY3RpdmVzU3RtdHM6IG8uU3RhdGVtZW50W10sXG4gICAgbm9kZURlZkV4cHJzOiBvLkV4cHJlc3Npb25bXVxuICB9IHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBsZXQgdXBkYXRlQmluZGluZ0NvdW50ID0gMDtcbiAgICBjb25zdCB1cGRhdGVSZW5kZXJlclN0bXRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gICAgY29uc3QgdXBkYXRlRGlyZWN0aXZlc1N0bXRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gICAgY29uc3Qgbm9kZURlZkV4cHJzID0gdGhpcy5ub2Rlcy5tYXAoKGZhY3RvcnksIG5vZGVJbmRleCkgPT4ge1xuICAgICAgY29uc3Qge25vZGVEZWYsIG5vZGVGbGFncywgdXBkYXRlRGlyZWN0aXZlcywgdXBkYXRlUmVuZGVyZXIsIHNvdXJjZVNwYW59ID0gZmFjdG9yeSgpO1xuICAgICAgaWYgKHVwZGF0ZVJlbmRlcmVyKSB7XG4gICAgICAgIHVwZGF0ZVJlbmRlcmVyU3RtdHMucHVzaChcbiAgICAgICAgICAgIC4uLmNyZWF0ZVVwZGF0ZVN0YXRlbWVudHMobm9kZUluZGV4LCBzb3VyY2VTcGFuLCB1cGRhdGVSZW5kZXJlciwgZmFsc2UpKTtcbiAgICAgIH1cbiAgICAgIGlmICh1cGRhdGVEaXJlY3RpdmVzKSB7XG4gICAgICAgIHVwZGF0ZURpcmVjdGl2ZXNTdG10cy5wdXNoKC4uLmNyZWF0ZVVwZGF0ZVN0YXRlbWVudHMoXG4gICAgICAgICAgICBub2RlSW5kZXgsIHNvdXJjZVNwYW4sIHVwZGF0ZURpcmVjdGl2ZXMsXG4gICAgICAgICAgICAobm9kZUZsYWdzICYgKE5vZGVGbGFncy5Eb0NoZWNrIHwgTm9kZUZsYWdzLk9uSW5pdCkpID4gMCkpO1xuICAgICAgfVxuICAgICAgLy8gV2UgdXNlIGEgY29tbWEgZXhwcmVzc2lvbiB0byBjYWxsIHRoZSBsb2cgZnVuY3Rpb24gYmVmb3JlXG4gICAgICAvLyB0aGUgbm9kZURlZiBmdW5jdGlvbiwgYnV0IHN0aWxsIHVzZSB0aGUgcmVzdWx0IG9mIHRoZSBub2RlRGVmIGZ1bmN0aW9uXG4gICAgICAvLyBhcyB0aGUgdmFsdWUuXG4gICAgICAvLyBOb3RlOiBXZSBvbmx5IGFkZCB0aGUgbG9nZ2VyIHRvIGVsZW1lbnRzIC8gdGV4dCBub2RlcyxcbiAgICAgIC8vIHNvIHdlIGRvbid0IGdlbmVyYXRlIHRvbyBtdWNoIGNvZGUuXG4gICAgICBjb25zdCBsb2dXaXRoTm9kZURlZiA9IG5vZGVGbGFncyAmIE5vZGVGbGFncy5DYXRSZW5kZXJOb2RlID9cbiAgICAgICAgICBuZXcgby5Db21tYUV4cHIoW0xPR19WQVIuY2FsbEZuKFtdKS5jYWxsRm4oW10pLCBub2RlRGVmXSkgOlxuICAgICAgICAgIG5vZGVEZWY7XG4gICAgICByZXR1cm4gby5hcHBseVNvdXJjZVNwYW5Ub0V4cHJlc3Npb25JZk5lZWRlZChsb2dXaXRoTm9kZURlZiwgc291cmNlU3Bhbik7XG4gICAgfSk7XG4gICAgcmV0dXJuIHt1cGRhdGVSZW5kZXJlclN0bXRzLCB1cGRhdGVEaXJlY3RpdmVzU3RtdHMsIG5vZGVEZWZFeHByc307XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVVcGRhdGVTdGF0ZW1lbnRzKFxuICAgICAgICBub2RlSW5kZXg6IG51bWJlciwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCwgZXhwcmVzc2lvbnM6IFVwZGF0ZUV4cHJlc3Npb25bXSxcbiAgICAgICAgYWxsb3dFbXB0eUV4cHJzOiBib29sZWFuKTogby5TdGF0ZW1lbnRbXSB7XG4gICAgICBjb25zdCB1cGRhdGVTdG10czogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgICAgY29uc3QgZXhwcnMgPSBleHByZXNzaW9ucy5tYXAoKHtzb3VyY2VTcGFuLCBjb250ZXh0LCB2YWx1ZX0pID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZ0lkID0gYCR7dXBkYXRlQmluZGluZ0NvdW50Kyt9YDtcbiAgICAgICAgY29uc3QgbmFtZVJlc29sdmVyID0gY29udGV4dCA9PT0gQ09NUF9WQVIgPyBzZWxmIDogbnVsbDtcbiAgICAgICAgY29uc3Qge3N0bXRzLCBjdXJyVmFsRXhwcn0gPVxuICAgICAgICAgICAgY29udmVydFByb3BlcnR5QmluZGluZyhuYW1lUmVzb2x2ZXIsIGNvbnRleHQsIHZhbHVlLCBiaW5kaW5nSWQsIEJpbmRpbmdGb3JtLkdlbmVyYWwpO1xuICAgICAgICB1cGRhdGVTdG10cy5wdXNoKC4uLnN0bXRzLm1hcChcbiAgICAgICAgICAgIChzdG10OiBvLlN0YXRlbWVudCkgPT4gby5hcHBseVNvdXJjZVNwYW5Ub1N0YXRlbWVudElmTmVlZGVkKHN0bXQsIHNvdXJjZVNwYW4pKSk7XG4gICAgICAgIHJldHVybiBvLmFwcGx5U291cmNlU3BhblRvRXhwcmVzc2lvbklmTmVlZGVkKGN1cnJWYWxFeHByLCBzb3VyY2VTcGFuKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKGV4cHJlc3Npb25zLmxlbmd0aCB8fCBhbGxvd0VtcHR5RXhwcnMpIHtcbiAgICAgICAgdXBkYXRlU3RtdHMucHVzaChvLmFwcGx5U291cmNlU3BhblRvU3RhdGVtZW50SWZOZWVkZWQoXG4gICAgICAgICAgICBjYWxsQ2hlY2tTdG10KG5vZGVJbmRleCwgZXhwcnMpLnRvU3RtdCgpLCBzb3VyY2VTcGFuKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdXBkYXRlU3RtdHM7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWxlbWVudEhhbmRsZUV2ZW50Rm4oXG4gICAgICBub2RlSW5kZXg6IG51bWJlcixcbiAgICAgIGhhbmRsZXJzOiB7Y29udGV4dDogby5FeHByZXNzaW9uLCBldmVudEFzdDogQm91bmRFdmVudEFzdCwgZGlyQXN0OiBEaXJlY3RpdmVBc3R9W10pIHtcbiAgICBjb25zdCBoYW5kbGVFdmVudFN0bXRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gICAgbGV0IGhhbmRsZUV2ZW50QmluZGluZ0NvdW50ID0gMDtcbiAgICBoYW5kbGVycy5mb3JFYWNoKCh7Y29udGV4dCwgZXZlbnRBc3QsIGRpckFzdH0pID0+IHtcbiAgICAgIGNvbnN0IGJpbmRpbmdJZCA9IGAke2hhbmRsZUV2ZW50QmluZGluZ0NvdW50Kyt9YDtcbiAgICAgIGNvbnN0IG5hbWVSZXNvbHZlciA9IGNvbnRleHQgPT09IENPTVBfVkFSID8gdGhpcyA6IG51bGw7XG4gICAgICBjb25zdCB7c3RtdHMsIGFsbG93RGVmYXVsdH0gPVxuICAgICAgICAgIGNvbnZlcnRBY3Rpb25CaW5kaW5nKG5hbWVSZXNvbHZlciwgY29udGV4dCwgZXZlbnRBc3QuaGFuZGxlciwgYmluZGluZ0lkKTtcbiAgICAgIGNvbnN0IHRydWVTdG10cyA9IHN0bXRzO1xuICAgICAgaWYgKGFsbG93RGVmYXVsdCkge1xuICAgICAgICB0cnVlU3RtdHMucHVzaChBTExPV19ERUZBVUxUX1ZBUi5zZXQoYWxsb3dEZWZhdWx0LmFuZChBTExPV19ERUZBVUxUX1ZBUikpLnRvU3RtdCgpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHt0YXJnZXQ6IGV2ZW50VGFyZ2V0LCBuYW1lOiBldmVudE5hbWV9ID0gZWxlbWVudEV2ZW50TmFtZUFuZFRhcmdldChldmVudEFzdCwgZGlyQXN0KTtcbiAgICAgIGNvbnN0IGZ1bGxFdmVudE5hbWUgPSBlbGVtZW50RXZlbnRGdWxsTmFtZShldmVudFRhcmdldCwgZXZlbnROYW1lKTtcbiAgICAgIGhhbmRsZUV2ZW50U3RtdHMucHVzaChvLmFwcGx5U291cmNlU3BhblRvU3RhdGVtZW50SWZOZWVkZWQoXG4gICAgICAgICAgbmV3IG8uSWZTdG10KG8ubGl0ZXJhbChmdWxsRXZlbnROYW1lKS5pZGVudGljYWwoRVZFTlRfTkFNRV9WQVIpLCB0cnVlU3RtdHMpLFxuICAgICAgICAgIGV2ZW50QXN0LnNvdXJjZVNwYW4pKTtcbiAgICB9KTtcbiAgICBsZXQgaGFuZGxlRXZlbnRGbjogby5FeHByZXNzaW9uO1xuICAgIGlmIChoYW5kbGVFdmVudFN0bXRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHByZVN0bXRzOiBvLlN0YXRlbWVudFtdID1cbiAgICAgICAgICBbQUxMT1dfREVGQVVMVF9WQVIuc2V0KG8ubGl0ZXJhbCh0cnVlKSkudG9EZWNsU3RtdChvLkJPT0xfVFlQRSldO1xuICAgICAgaWYgKCF0aGlzLmNvbXBvbmVudC5pc0hvc3QgJiYgby5maW5kUmVhZFZhck5hbWVzKGhhbmRsZUV2ZW50U3RtdHMpLmhhcyhDT01QX1ZBUi5uYW1lICEpKSB7XG4gICAgICAgIHByZVN0bXRzLnB1c2goQ09NUF9WQVIuc2V0KFZJRVdfVkFSLnByb3AoJ2NvbXBvbmVudCcpKS50b0RlY2xTdG10KHRoaXMuY29tcFR5cGUpKTtcbiAgICAgIH1cbiAgICAgIGhhbmRsZUV2ZW50Rm4gPSBvLmZuKFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIG5ldyBvLkZuUGFyYW0oVklFV19WQVIubmFtZSAhLCBvLklORkVSUkVEX1RZUEUpLFxuICAgICAgICAgICAgbmV3IG8uRm5QYXJhbShFVkVOVF9OQU1FX1ZBUi5uYW1lICEsIG8uSU5GRVJSRURfVFlQRSksXG4gICAgICAgICAgICBuZXcgby5GblBhcmFtKEV2ZW50SGFuZGxlclZhcnMuZXZlbnQubmFtZSAhLCBvLklORkVSUkVEX1RZUEUpXG4gICAgICAgICAgXSxcbiAgICAgICAgICBbLi4ucHJlU3RtdHMsIC4uLmhhbmRsZUV2ZW50U3RtdHMsIG5ldyBvLlJldHVyblN0YXRlbWVudChBTExPV19ERUZBVUxUX1ZBUildLFxuICAgICAgICAgIG8uSU5GRVJSRURfVFlQRSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhbmRsZUV2ZW50Rm4gPSBvLk5VTExfRVhQUjtcbiAgICB9XG4gICAgcmV0dXJuIGhhbmRsZUV2ZW50Rm47XG4gIH1cblxuICB2aXNpdERpcmVjdGl2ZShhc3Q6IERpcmVjdGl2ZUFzdCwgY29udGV4dDoge3VzZWRFdmVudHM6IFNldDxzdHJpbmc+fSk6IGFueSB7fVxuICB2aXNpdERpcmVjdGl2ZVByb3BlcnR5KGFzdDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0UmVmZXJlbmNlKGFzdDogUmVmZXJlbmNlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRWYXJpYWJsZShhc3Q6IFZhcmlhYmxlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRFdmVudChhc3Q6IEJvdW5kRXZlbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdEVsZW1lbnRQcm9wZXJ0eShhc3Q6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRBdHRyKGFzdDogQXR0ckFzdCwgY29udGV4dDogYW55KTogYW55IHt9XG59XG5cbmZ1bmN0aW9uIG5lZWRzQWRkaXRpb25hbFJvb3ROb2RlKGFzdE5vZGVzOiBUZW1wbGF0ZUFzdFtdKTogYm9vbGVhbiB7XG4gIGNvbnN0IGxhc3RBc3ROb2RlID0gYXN0Tm9kZXNbYXN0Tm9kZXMubGVuZ3RoIC0gMV07XG4gIGlmIChsYXN0QXN0Tm9kZSBpbnN0YW5jZW9mIEVtYmVkZGVkVGVtcGxhdGVBc3QpIHtcbiAgICByZXR1cm4gbGFzdEFzdE5vZGUuaGFzVmlld0NvbnRhaW5lcjtcbiAgfVxuXG4gIGlmIChsYXN0QXN0Tm9kZSBpbnN0YW5jZW9mIEVsZW1lbnRBc3QpIHtcbiAgICBpZiAoaXNOZ0NvbnRhaW5lcihsYXN0QXN0Tm9kZS5uYW1lKSAmJiBsYXN0QXN0Tm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBuZWVkc0FkZGl0aW9uYWxSb290Tm9kZShsYXN0QXN0Tm9kZS5jaGlsZHJlbik7XG4gICAgfVxuICAgIHJldHVybiBsYXN0QXN0Tm9kZS5oYXNWaWV3Q29udGFpbmVyO1xuICB9XG5cbiAgcmV0dXJuIGxhc3RBc3ROb2RlIGluc3RhbmNlb2YgTmdDb250ZW50QXN0O1xufVxuXG5cbmZ1bmN0aW9uIGVsZW1lbnRCaW5kaW5nRGVmKGlucHV0QXN0OiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgZGlyQXN0OiBEaXJlY3RpdmVBc3QpOiBvLkV4cHJlc3Npb24ge1xuICBzd2l0Y2ggKGlucHV0QXN0LnR5cGUpIHtcbiAgICBjYXNlIFByb3BlcnR5QmluZGluZ1R5cGUuQXR0cmlidXRlOlxuICAgICAgcmV0dXJuIG8ubGl0ZXJhbEFycihbXG4gICAgICAgIG8ubGl0ZXJhbChCaW5kaW5nRmxhZ3MuVHlwZUVsZW1lbnRBdHRyaWJ1dGUpLCBvLmxpdGVyYWwoaW5wdXRBc3QubmFtZSksXG4gICAgICAgIG8ubGl0ZXJhbChpbnB1dEFzdC5zZWN1cml0eUNvbnRleHQpXG4gICAgICBdKTtcbiAgICBjYXNlIFByb3BlcnR5QmluZGluZ1R5cGUuUHJvcGVydHk6XG4gICAgICByZXR1cm4gby5saXRlcmFsQXJyKFtcbiAgICAgICAgby5saXRlcmFsKEJpbmRpbmdGbGFncy5UeXBlUHJvcGVydHkpLCBvLmxpdGVyYWwoaW5wdXRBc3QubmFtZSksXG4gICAgICAgIG8ubGl0ZXJhbChpbnB1dEFzdC5zZWN1cml0eUNvbnRleHQpXG4gICAgICBdKTtcbiAgICBjYXNlIFByb3BlcnR5QmluZGluZ1R5cGUuQW5pbWF0aW9uOlxuICAgICAgY29uc3QgYmluZGluZ1R5cGUgPSBCaW5kaW5nRmxhZ3MuVHlwZVByb3BlcnR5IHxcbiAgICAgICAgICAoZGlyQXN0ICYmIGRpckFzdC5kaXJlY3RpdmUuaXNDb21wb25lbnQgPyBCaW5kaW5nRmxhZ3MuU3ludGhldGljSG9zdFByb3BlcnR5IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCaW5kaW5nRmxhZ3MuU3ludGhldGljUHJvcGVydHkpO1xuICAgICAgcmV0dXJuIG8ubGl0ZXJhbEFycihbXG4gICAgICAgIG8ubGl0ZXJhbChiaW5kaW5nVHlwZSksIG8ubGl0ZXJhbCgnQCcgKyBpbnB1dEFzdC5uYW1lKSwgby5saXRlcmFsKGlucHV0QXN0LnNlY3VyaXR5Q29udGV4dClcbiAgICAgIF0pO1xuICAgIGNhc2UgUHJvcGVydHlCaW5kaW5nVHlwZS5DbGFzczpcbiAgICAgIHJldHVybiBvLmxpdGVyYWxBcnIoXG4gICAgICAgICAgW28ubGl0ZXJhbChCaW5kaW5nRmxhZ3MuVHlwZUVsZW1lbnRDbGFzcyksIG8ubGl0ZXJhbChpbnB1dEFzdC5uYW1lKSwgby5OVUxMX0VYUFJdKTtcbiAgICBjYXNlIFByb3BlcnR5QmluZGluZ1R5cGUuU3R5bGU6XG4gICAgICByZXR1cm4gby5saXRlcmFsQXJyKFtcbiAgICAgICAgby5saXRlcmFsKEJpbmRpbmdGbGFncy5UeXBlRWxlbWVudFN0eWxlKSwgby5saXRlcmFsKGlucHV0QXN0Lm5hbWUpLCBvLmxpdGVyYWwoaW5wdXRBc3QudW5pdClcbiAgICAgIF0pO1xuICB9XG59XG5cblxuZnVuY3Rpb24gZml4ZWRBdHRyc0RlZihlbGVtZW50QXN0OiBFbGVtZW50QXN0KTogby5FeHByZXNzaW9uIHtcbiAgY29uc3QgbWFwUmVzdWx0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGVsZW1lbnRBc3QuYXR0cnMuZm9yRWFjaChhdHRyQXN0ID0+IHsgbWFwUmVzdWx0W2F0dHJBc3QubmFtZV0gPSBhdHRyQXN0LnZhbHVlOyB9KTtcbiAgZWxlbWVudEFzdC5kaXJlY3RpdmVzLmZvckVhY2goZGlyQXN0ID0+IHtcbiAgICBPYmplY3Qua2V5cyhkaXJBc3QuZGlyZWN0aXZlLmhvc3RBdHRyaWJ1dGVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBkaXJBc3QuZGlyZWN0aXZlLmhvc3RBdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgY29uc3QgcHJldlZhbHVlID0gbWFwUmVzdWx0W25hbWVdO1xuICAgICAgbWFwUmVzdWx0W25hbWVdID0gcHJldlZhbHVlICE9IG51bGwgPyBtZXJnZUF0dHJpYnV0ZVZhbHVlKG5hbWUsIHByZXZWYWx1ZSwgdmFsdWUpIDogdmFsdWU7XG4gICAgfSk7XG4gIH0pO1xuICAvLyBOb3RlOiBXZSBuZWVkIHRvIHNvcnQgdG8gZ2V0IGEgZGVmaW5lZCBvdXRwdXQgb3JkZXJcbiAgLy8gZm9yIHRlc3RzIGFuZCBmb3IgY2FjaGluZyBnZW5lcmF0ZWQgYXJ0aWZhY3RzLi4uXG4gIHJldHVybiBvLmxpdGVyYWxBcnIoT2JqZWN0LmtleXMobWFwUmVzdWx0KS5zb3J0KCkubWFwKFxuICAgICAgKGF0dHJOYW1lKSA9PiBvLmxpdGVyYWxBcnIoW28ubGl0ZXJhbChhdHRyTmFtZSksIG8ubGl0ZXJhbChtYXBSZXN1bHRbYXR0ck5hbWVdKV0pKSk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlQXR0cmlidXRlVmFsdWUoYXR0ck5hbWU6IHN0cmluZywgYXR0clZhbHVlMTogc3RyaW5nLCBhdHRyVmFsdWUyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoYXR0ck5hbWUgPT0gQ0xBU1NfQVRUUiB8fCBhdHRyTmFtZSA9PSBTVFlMRV9BVFRSKSB7XG4gICAgcmV0dXJuIGAke2F0dHJWYWx1ZTF9ICR7YXR0clZhbHVlMn1gO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBhdHRyVmFsdWUyO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGxDaGVja1N0bXQobm9kZUluZGV4OiBudW1iZXIsIGV4cHJzOiBvLkV4cHJlc3Npb25bXSk6IG8uRXhwcmVzc2lvbiB7XG4gIGlmIChleHBycy5sZW5ndGggPiAxMCkge1xuICAgIHJldHVybiBDSEVDS19WQVIuY2FsbEZuKFxuICAgICAgICBbVklFV19WQVIsIG8ubGl0ZXJhbChub2RlSW5kZXgpLCBvLmxpdGVyYWwoQXJndW1lbnRUeXBlLkR5bmFtaWMpLCBvLmxpdGVyYWxBcnIoZXhwcnMpXSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIENIRUNLX1ZBUi5jYWxsRm4oXG4gICAgICAgIFtWSUVXX1ZBUiwgby5saXRlcmFsKG5vZGVJbmRleCksIG8ubGl0ZXJhbChBcmd1bWVudFR5cGUuSW5saW5lKSwgLi4uZXhwcnNdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxsVW53cmFwVmFsdWUobm9kZUluZGV4OiBudW1iZXIsIGJpbmRpbmdJZHg6IG51bWJlciwgZXhwcjogby5FeHByZXNzaW9uKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy51bndyYXBWYWx1ZSkuY2FsbEZuKFtcbiAgICBWSUVXX1ZBUiwgby5saXRlcmFsKG5vZGVJbmRleCksIG8ubGl0ZXJhbChiaW5kaW5nSWR4KSwgZXhwclxuICBdKTtcbn1cblxuaW50ZXJmYWNlIFN0YXRpY0FuZER5bmFtaWNRdWVyeUlkcyB7XG4gIHN0YXRpY1F1ZXJ5SWRzOiBTZXQ8bnVtYmVyPjtcbiAgZHluYW1pY1F1ZXJ5SWRzOiBTZXQ8bnVtYmVyPjtcbn1cblxuXG5mdW5jdGlvbiBmaW5kU3RhdGljUXVlcnlJZHMoXG4gICAgbm9kZXM6IFRlbXBsYXRlQXN0W10sIHJlc3VsdCA9IG5ldyBNYXA8VGVtcGxhdGVBc3QsIFN0YXRpY0FuZER5bmFtaWNRdWVyeUlkcz4oKSk6XG4gICAgTWFwPFRlbXBsYXRlQXN0LCBTdGF0aWNBbmREeW5hbWljUXVlcnlJZHM+IHtcbiAgbm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgIGNvbnN0IHN0YXRpY1F1ZXJ5SWRzID0gbmV3IFNldDxudW1iZXI+KCk7XG4gICAgY29uc3QgZHluYW1pY1F1ZXJ5SWRzID0gbmV3IFNldDxudW1iZXI+KCk7XG4gICAgbGV0IHF1ZXJ5TWF0Y2hlczogUXVlcnlNYXRjaFtdID0gdW5kZWZpbmVkICE7XG4gICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50QXN0KSB7XG4gICAgICBmaW5kU3RhdGljUXVlcnlJZHMobm9kZS5jaGlsZHJlbiwgcmVzdWx0KTtcbiAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgY29uc3QgY2hpbGREYXRhID0gcmVzdWx0LmdldChjaGlsZCkgITtcbiAgICAgICAgY2hpbGREYXRhLnN0YXRpY1F1ZXJ5SWRzLmZvckVhY2gocXVlcnlJZCA9PiBzdGF0aWNRdWVyeUlkcy5hZGQocXVlcnlJZCkpO1xuICAgICAgICBjaGlsZERhdGEuZHluYW1pY1F1ZXJ5SWRzLmZvckVhY2gocXVlcnlJZCA9PiBkeW5hbWljUXVlcnlJZHMuYWRkKHF1ZXJ5SWQpKTtcbiAgICAgIH0pO1xuICAgICAgcXVlcnlNYXRjaGVzID0gbm9kZS5xdWVyeU1hdGNoZXM7XG4gICAgfSBlbHNlIGlmIChub2RlIGluc3RhbmNlb2YgRW1iZWRkZWRUZW1wbGF0ZUFzdCkge1xuICAgICAgZmluZFN0YXRpY1F1ZXJ5SWRzKG5vZGUuY2hpbGRyZW4sIHJlc3VsdCk7XG4gICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIGNvbnN0IGNoaWxkRGF0YSA9IHJlc3VsdC5nZXQoY2hpbGQpICE7XG4gICAgICAgIGNoaWxkRGF0YS5zdGF0aWNRdWVyeUlkcy5mb3JFYWNoKHF1ZXJ5SWQgPT4gZHluYW1pY1F1ZXJ5SWRzLmFkZChxdWVyeUlkKSk7XG4gICAgICAgIGNoaWxkRGF0YS5keW5hbWljUXVlcnlJZHMuZm9yRWFjaChxdWVyeUlkID0+IGR5bmFtaWNRdWVyeUlkcy5hZGQocXVlcnlJZCkpO1xuICAgICAgfSk7XG4gICAgICBxdWVyeU1hdGNoZXMgPSBub2RlLnF1ZXJ5TWF0Y2hlcztcbiAgICB9XG4gICAgaWYgKHF1ZXJ5TWF0Y2hlcykge1xuICAgICAgcXVlcnlNYXRjaGVzLmZvckVhY2goKG1hdGNoKSA9PiBzdGF0aWNRdWVyeUlkcy5hZGQobWF0Y2gucXVlcnlJZCkpO1xuICAgIH1cbiAgICBkeW5hbWljUXVlcnlJZHMuZm9yRWFjaChxdWVyeUlkID0+IHN0YXRpY1F1ZXJ5SWRzLmRlbGV0ZShxdWVyeUlkKSk7XG4gICAgcmVzdWx0LnNldChub2RlLCB7c3RhdGljUXVlcnlJZHMsIGR5bmFtaWNRdWVyeUlkc30pO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gc3RhdGljVmlld1F1ZXJ5SWRzKG5vZGVTdGF0aWNRdWVyeUlkczogTWFwPFRlbXBsYXRlQXN0LCBTdGF0aWNBbmREeW5hbWljUXVlcnlJZHM+KTpcbiAgICBTdGF0aWNBbmREeW5hbWljUXVlcnlJZHMge1xuICBjb25zdCBzdGF0aWNRdWVyeUlkcyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICBjb25zdCBkeW5hbWljUXVlcnlJZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgQXJyYXkuZnJvbShub2RlU3RhdGljUXVlcnlJZHMudmFsdWVzKCkpLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgZW50cnkuc3RhdGljUXVlcnlJZHMuZm9yRWFjaChxdWVyeUlkID0+IHN0YXRpY1F1ZXJ5SWRzLmFkZChxdWVyeUlkKSk7XG4gICAgZW50cnkuZHluYW1pY1F1ZXJ5SWRzLmZvckVhY2gocXVlcnlJZCA9PiBkeW5hbWljUXVlcnlJZHMuYWRkKHF1ZXJ5SWQpKTtcbiAgfSk7XG4gIGR5bmFtaWNRdWVyeUlkcy5mb3JFYWNoKHF1ZXJ5SWQgPT4gc3RhdGljUXVlcnlJZHMuZGVsZXRlKHF1ZXJ5SWQpKTtcbiAgcmV0dXJuIHtzdGF0aWNRdWVyeUlkcywgZHluYW1pY1F1ZXJ5SWRzfTtcbn1cblxuZnVuY3Rpb24gZWxlbWVudEV2ZW50TmFtZUFuZFRhcmdldChcbiAgICBldmVudEFzdDogQm91bmRFdmVudEFzdCwgZGlyQXN0OiBEaXJlY3RpdmVBc3QgfCBudWxsKToge25hbWU6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcgfCBudWxsfSB7XG4gIGlmIChldmVudEFzdC5pc0FuaW1hdGlvbikge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBgQCR7ZXZlbnRBc3QubmFtZX0uJHtldmVudEFzdC5waGFzZX1gLFxuICAgICAgdGFyZ2V0OiBkaXJBc3QgJiYgZGlyQXN0LmRpcmVjdGl2ZS5pc0NvbXBvbmVudCA/ICdjb21wb25lbnQnIDogbnVsbFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGV2ZW50QXN0O1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGNTdGF0aWNEeW5hbWljUXVlcnlGbGFncyhcbiAgICBxdWVyeUlkczogU3RhdGljQW5kRHluYW1pY1F1ZXJ5SWRzLCBxdWVyeUlkOiBudW1iZXIsIGlzRmlyc3Q6IGJvb2xlYW4pIHtcbiAgbGV0IGZsYWdzID0gTm9kZUZsYWdzLk5vbmU7XG4gIC8vIE5vdGU6IFdlIG9ubHkgbWFrZSBxdWVyaWVzIHN0YXRpYyB0aGF0IHF1ZXJ5IGZvciBhIHNpbmdsZSBpdGVtLlxuICAvLyBUaGlzIGlzIGJlY2F1c2Ugb2YgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgb2xkIHZpZXcgY29tcGlsZXIuLi5cbiAgaWYgKGlzRmlyc3QgJiYgKHF1ZXJ5SWRzLnN0YXRpY1F1ZXJ5SWRzLmhhcyhxdWVyeUlkKSB8fCAhcXVlcnlJZHMuZHluYW1pY1F1ZXJ5SWRzLmhhcyhxdWVyeUlkKSkpIHtcbiAgICBmbGFncyB8PSBOb2RlRmxhZ3MuU3RhdGljUXVlcnk7XG4gIH0gZWxzZSB7XG4gICAgZmxhZ3MgfD0gTm9kZUZsYWdzLkR5bmFtaWNRdWVyeTtcbiAgfVxuICByZXR1cm4gZmxhZ3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbGVtZW50RXZlbnRGdWxsTmFtZSh0YXJnZXQ6IHN0cmluZyB8IG51bGwsIG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB0YXJnZXQgPyBgJHt0YXJnZXR9OiR7bmFtZX1gIDogbmFtZTtcbn1cbiJdfQ==