/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { identifierName } from '../compile_metadata';
import { ASTWithSource, EmptyExpr } from '../expression_parser/ast';
import { Identifiers, createTokenForExternalReference, createTokenForReference } from '../identifiers';
import * as html from '../ml_parser/ast';
import { ParseTreeResult } from '../ml_parser/html_parser';
import { removeWhitespaces, replaceNgsp } from '../ml_parser/html_whitespaces';
import { expandNodes } from '../ml_parser/icu_ast_expander';
import { InterpolationConfig } from '../ml_parser/interpolation_config';
import { isNgTemplate, splitNsName } from '../ml_parser/tags';
import { ParseError, ParseErrorLevel, ParseSourceSpan } from '../parse_util';
import { ProviderElementContext, ProviderViewContext } from '../provider_analyzer';
import { CssSelector, SelectorMatcher } from '../selector';
import { isStyleUrlResolvable } from '../style_url_resolver';
import { syntaxError } from '../util';
import { BindingParser } from './binding_parser';
import * as t from './template_ast';
import { PreparsedElementType, preparseElement } from './template_preparser';
var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-)|(@))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/;
// Group 1 = "bind-"
var KW_BIND_IDX = 1;
// Group 2 = "let-"
var KW_LET_IDX = 2;
// Group 3 = "ref-/#"
var KW_REF_IDX = 3;
// Group 4 = "on-"
var KW_ON_IDX = 4;
// Group 5 = "bindon-"
var KW_BINDON_IDX = 5;
// Group 6 = "@"
var KW_AT_IDX = 6;
// Group 7 = the identifier after "bind-", "let-", "ref-/#", "on-", "bindon-" or "@"
var IDENT_KW_IDX = 7;
// Group 8 = identifier inside [()]
var IDENT_BANANA_BOX_IDX = 8;
// Group 9 = identifier inside []
var IDENT_PROPERTY_IDX = 9;
// Group 10 = identifier inside ()
var IDENT_EVENT_IDX = 10;
var TEMPLATE_ATTR_PREFIX = '*';
var CLASS_ATTR = 'class';
var TEXT_CSS_SELECTOR = CssSelector.parse('*')[0];
var TemplateParseError = /** @class */ (function (_super) {
    tslib_1.__extends(TemplateParseError, _super);
    function TemplateParseError(message, span, level) {
        return _super.call(this, span, message, level) || this;
    }
    return TemplateParseError;
}(ParseError));
export { TemplateParseError };
var TemplateParseResult = /** @class */ (function () {
    function TemplateParseResult(templateAst, usedPipes, errors) {
        this.templateAst = templateAst;
        this.usedPipes = usedPipes;
        this.errors = errors;
    }
    return TemplateParseResult;
}());
export { TemplateParseResult };
var TemplateParser = /** @class */ (function () {
    function TemplateParser(_config, _reflector, _exprParser, _schemaRegistry, _htmlParser, _console, transforms) {
        this._config = _config;
        this._reflector = _reflector;
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this._htmlParser = _htmlParser;
        this._console = _console;
        this.transforms = transforms;
    }
    Object.defineProperty(TemplateParser.prototype, "expressionParser", {
        get: function () { return this._exprParser; },
        enumerable: true,
        configurable: true
    });
    TemplateParser.prototype.parse = function (component, template, directives, pipes, schemas, templateUrl, preserveWhitespaces) {
        var result = this.tryParse(component, template, directives, pipes, schemas, templateUrl, preserveWhitespaces);
        var warnings = result.errors.filter(function (error) { return error.level === ParseErrorLevel.WARNING; });
        var errors = result.errors.filter(function (error) { return error.level === ParseErrorLevel.ERROR; });
        if (warnings.length > 0) {
            this._console.warn("Template parse warnings:\n" + warnings.join('\n'));
        }
        if (errors.length > 0) {
            var errorString = errors.join('\n');
            throw syntaxError("Template parse errors:\n" + errorString, errors);
        }
        return { template: result.templateAst, pipes: result.usedPipes };
    };
    TemplateParser.prototype.tryParse = function (component, template, directives, pipes, schemas, templateUrl, preserveWhitespaces) {
        var htmlParseResult = typeof template === 'string' ?
            this._htmlParser.parse(template, templateUrl, true, this.getInterpolationConfig(component)) :
            template;
        if (!preserveWhitespaces) {
            htmlParseResult = removeWhitespaces(htmlParseResult);
        }
        return this.tryParseHtml(this.expandHtml(htmlParseResult), component, directives, pipes, schemas);
    };
    TemplateParser.prototype.tryParseHtml = function (htmlAstWithErrors, component, directives, pipes, schemas) {
        var result;
        var errors = htmlAstWithErrors.errors;
        var usedPipes = [];
        if (htmlAstWithErrors.rootNodes.length > 0) {
            var uniqDirectives = removeSummaryDuplicates(directives);
            var uniqPipes = removeSummaryDuplicates(pipes);
            var providerViewContext = new ProviderViewContext(this._reflector, component);
            var interpolationConfig = undefined;
            if (component.template && component.template.interpolation) {
                interpolationConfig = {
                    start: component.template.interpolation[0],
                    end: component.template.interpolation[1]
                };
            }
            var bindingParser = new BindingParser(this._exprParser, interpolationConfig, this._schemaRegistry, uniqPipes, errors);
            var parseVisitor = new TemplateParseVisitor(this._reflector, this._config, providerViewContext, uniqDirectives, bindingParser, this._schemaRegistry, schemas, errors);
            result = html.visitAll(parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_ELEMENT_CONTEXT);
            errors.push.apply(errors, tslib_1.__spread(providerViewContext.errors));
            usedPipes.push.apply(usedPipes, tslib_1.__spread(bindingParser.getUsedPipes()));
        }
        else {
            result = [];
        }
        this._assertNoReferenceDuplicationOnTemplate(result, errors);
        if (errors.length > 0) {
            return new TemplateParseResult(result, usedPipes, errors);
        }
        if (this.transforms) {
            this.transforms.forEach(function (transform) { result = t.templateVisitAll(transform, result); });
        }
        return new TemplateParseResult(result, usedPipes, errors);
    };
    TemplateParser.prototype.expandHtml = function (htmlAstWithErrors, forced) {
        if (forced === void 0) { forced = false; }
        var errors = htmlAstWithErrors.errors;
        if (errors.length == 0 || forced) {
            // Transform ICU messages to angular directives
            var expandedHtmlAst = expandNodes(htmlAstWithErrors.rootNodes);
            errors.push.apply(errors, tslib_1.__spread(expandedHtmlAst.errors));
            htmlAstWithErrors = new ParseTreeResult(expandedHtmlAst.nodes, errors);
        }
        return htmlAstWithErrors;
    };
    TemplateParser.prototype.getInterpolationConfig = function (component) {
        if (component.template) {
            return InterpolationConfig.fromArray(component.template.interpolation);
        }
        return undefined;
    };
    /** @internal */
    TemplateParser.prototype._assertNoReferenceDuplicationOnTemplate = function (result, errors) {
        var existingReferences = [];
        result.filter(function (element) { return !!element.references; })
            .forEach(function (element) { return element.references.forEach(function (reference) {
            var name = reference.name;
            if (existingReferences.indexOf(name) < 0) {
                existingReferences.push(name);
            }
            else {
                var error = new TemplateParseError("Reference \"#" + name + "\" is defined several times", reference.sourceSpan, ParseErrorLevel.ERROR);
                errors.push(error);
            }
        }); });
    };
    return TemplateParser;
}());
export { TemplateParser };
var TemplateParseVisitor = /** @class */ (function () {
    function TemplateParseVisitor(reflector, config, providerViewContext, directives, _bindingParser, _schemaRegistry, _schemas, _targetErrors) {
        var _this = this;
        this.reflector = reflector;
        this.config = config;
        this.providerViewContext = providerViewContext;
        this._bindingParser = _bindingParser;
        this._schemaRegistry = _schemaRegistry;
        this._schemas = _schemas;
        this._targetErrors = _targetErrors;
        this.selectorMatcher = new SelectorMatcher();
        this.directivesIndex = new Map();
        this.ngContentCount = 0;
        // Note: queries start with id 1 so we can use the number in a Bloom filter!
        this.contentQueryStartId = providerViewContext.component.viewQueries.length + 1;
        directives.forEach(function (directive, index) {
            var selector = CssSelector.parse(directive.selector);
            _this.selectorMatcher.addSelectables(selector, directive);
            _this.directivesIndex.set(directive, index);
        });
    }
    TemplateParseVisitor.prototype.visitExpansion = function (expansion, context) { return null; };
    TemplateParseVisitor.prototype.visitExpansionCase = function (expansionCase, context) { return null; };
    TemplateParseVisitor.prototype.visitText = function (text, parent) {
        var ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR);
        var valueNoNgsp = replaceNgsp(text.value);
        var expr = this._bindingParser.parseInterpolation(valueNoNgsp, text.sourceSpan);
        return expr ? new t.BoundTextAst(expr, ngContentIndex, text.sourceSpan) :
            new t.TextAst(valueNoNgsp, ngContentIndex, text.sourceSpan);
    };
    TemplateParseVisitor.prototype.visitAttribute = function (attribute, context) {
        return new t.AttrAst(attribute.name, attribute.value, attribute.sourceSpan);
    };
    TemplateParseVisitor.prototype.visitComment = function (comment, context) { return null; };
    TemplateParseVisitor.prototype.visitElement = function (element, parent) {
        var _this = this;
        var queryStartIndex = this.contentQueryStartId;
        var elName = element.name;
        var preparsedElement = preparseElement(element);
        if (preparsedElement.type === PreparsedElementType.SCRIPT ||
            preparsedElement.type === PreparsedElementType.STYLE) {
            // Skipping <script> for security reasons
            // Skipping <style> as we already processed them
            // in the StyleCompiler
            return null;
        }
        if (preparsedElement.type === PreparsedElementType.STYLESHEET &&
            isStyleUrlResolvable(preparsedElement.hrefAttr)) {
            // Skipping stylesheets with either relative urls or package scheme as we already processed
            // them in the StyleCompiler
            return null;
        }
        var matchableAttrs = [];
        var elementOrDirectiveProps = [];
        var elementOrDirectiveRefs = [];
        var elementVars = [];
        var events = [];
        var templateElementOrDirectiveProps = [];
        var templateMatchableAttrs = [];
        var templateElementVars = [];
        var hasInlineTemplates = false;
        var attrs = [];
        var isTemplateElement = isNgTemplate(element.name);
        element.attrs.forEach(function (attr) {
            var parsedVariables = [];
            var hasBinding = _this._parseAttr(isTemplateElement, attr, matchableAttrs, elementOrDirectiveProps, events, elementOrDirectiveRefs, elementVars);
            elementVars.push.apply(elementVars, tslib_1.__spread(parsedVariables.map(function (v) { return t.VariableAst.fromParsedVariable(v); })));
            var templateValue;
            var templateKey;
            var normalizedName = _this._normalizeAttributeName(attr.name);
            if (normalizedName.startsWith(TEMPLATE_ATTR_PREFIX)) {
                templateValue = attr.value;
                templateKey = normalizedName.substring(TEMPLATE_ATTR_PREFIX.length);
            }
            var hasTemplateBinding = templateValue != null;
            if (hasTemplateBinding) {
                if (hasInlineTemplates) {
                    _this._reportError("Can't have multiple template bindings on one element. Use only one attribute prefixed with *", attr.sourceSpan);
                }
                hasInlineTemplates = true;
                var parsedVariables_1 = [];
                _this._bindingParser.parseInlineTemplateBinding(templateKey, templateValue, attr.sourceSpan, templateMatchableAttrs, templateElementOrDirectiveProps, parsedVariables_1);
                templateElementVars.push.apply(templateElementVars, tslib_1.__spread(parsedVariables_1.map(function (v) { return t.VariableAst.fromParsedVariable(v); })));
            }
            if (!hasBinding && !hasTemplateBinding) {
                // don't include the bindings as attributes as well in the AST
                attrs.push(_this.visitAttribute(attr, null));
                matchableAttrs.push([attr.name, attr.value]);
            }
        });
        var elementCssSelector = createElementCssSelector(elName, matchableAttrs);
        var _a = this._parseDirectives(this.selectorMatcher, elementCssSelector), directiveMetas = _a.directives, matchElement = _a.matchElement;
        var references = [];
        var boundDirectivePropNames = new Set();
        var directiveAsts = this._createDirectiveAsts(isTemplateElement, element.name, directiveMetas, elementOrDirectiveProps, elementOrDirectiveRefs, element.sourceSpan, references, boundDirectivePropNames);
        var elementProps = this._createElementPropertyAsts(element.name, elementOrDirectiveProps, boundDirectivePropNames);
        var isViewRoot = parent.isTemplateElement || hasInlineTemplates;
        var providerContext = new ProviderElementContext(this.providerViewContext, parent.providerContext, isViewRoot, directiveAsts, attrs, references, isTemplateElement, queryStartIndex, element.sourceSpan);
        var children = html.visitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children, ElementContext.create(isTemplateElement, directiveAsts, isTemplateElement ? parent.providerContext : providerContext));
        providerContext.afterElement();
        // Override the actual selector when the `ngProjectAs` attribute is provided
        var projectionSelector = preparsedElement.projectAs != '' ?
            CssSelector.parse(preparsedElement.projectAs)[0] :
            elementCssSelector;
        var ngContentIndex = parent.findNgContentIndex(projectionSelector);
        var parsedElement;
        if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
            // `<ng-content>` element
            if (element.children && !element.children.every(_isEmptyTextNode)) {
                this._reportError("<ng-content> element cannot have content.", element.sourceSpan);
            }
            parsedElement = new t.NgContentAst(this.ngContentCount++, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        else if (isTemplateElement) {
            // `<ng-template>` element
            this._assertAllEventsPublishedByDirectives(directiveAsts, events);
            this._assertNoComponentsNorElementBindingsOnTemplate(directiveAsts, elementProps, element.sourceSpan);
            parsedElement = new t.EmbeddedTemplateAst(attrs, events, references, elementVars, providerContext.transformedDirectiveAsts, providerContext.transformProviders, providerContext.transformedHasViewContainer, providerContext.queryMatches, children, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        else {
            // element other than `<ng-content>` and `<ng-template>`
            this._assertElementExists(matchElement, element);
            this._assertOnlyOneComponent(directiveAsts, element.sourceSpan);
            var ngContentIndex_1 = hasInlineTemplates ? null : parent.findNgContentIndex(projectionSelector);
            parsedElement = new t.ElementAst(elName, attrs, elementProps, events, references, providerContext.transformedDirectiveAsts, providerContext.transformProviders, providerContext.transformedHasViewContainer, providerContext.queryMatches, children, hasInlineTemplates ? null : ngContentIndex_1, element.sourceSpan, element.endSourceSpan || null);
        }
        if (hasInlineTemplates) {
            // The element as a *-attribute
            var templateQueryStartIndex = this.contentQueryStartId;
            var templateSelector = createElementCssSelector('ng-template', templateMatchableAttrs);
            var directives = this._parseDirectives(this.selectorMatcher, templateSelector).directives;
            var templateBoundDirectivePropNames = new Set();
            var templateDirectiveAsts = this._createDirectiveAsts(true, elName, directives, templateElementOrDirectiveProps, [], element.sourceSpan, [], templateBoundDirectivePropNames);
            var templateElementProps = this._createElementPropertyAsts(elName, templateElementOrDirectiveProps, templateBoundDirectivePropNames);
            this._assertNoComponentsNorElementBindingsOnTemplate(templateDirectiveAsts, templateElementProps, element.sourceSpan);
            var templateProviderContext = new ProviderElementContext(this.providerViewContext, parent.providerContext, parent.isTemplateElement, templateDirectiveAsts, [], [], true, templateQueryStartIndex, element.sourceSpan);
            templateProviderContext.afterElement();
            parsedElement = new t.EmbeddedTemplateAst([], [], [], templateElementVars, templateProviderContext.transformedDirectiveAsts, templateProviderContext.transformProviders, templateProviderContext.transformedHasViewContainer, templateProviderContext.queryMatches, [parsedElement], ngContentIndex, element.sourceSpan);
        }
        return parsedElement;
    };
    TemplateParseVisitor.prototype._parseAttr = function (isTemplateElement, attr, targetMatchableAttrs, targetProps, targetEvents, targetRefs, targetVars) {
        var name = this._normalizeAttributeName(attr.name);
        var value = attr.value;
        var srcSpan = attr.sourceSpan;
        var boundEvents = [];
        var bindParts = name.match(BIND_NAME_REGEXP);
        var hasBinding = false;
        if (bindParts !== null) {
            hasBinding = true;
            if (bindParts[KW_BIND_IDX] != null) {
                this._bindingParser.parsePropertyBinding(bindParts[IDENT_KW_IDX], value, false, srcSpan, targetMatchableAttrs, targetProps);
            }
            else if (bindParts[KW_LET_IDX]) {
                if (isTemplateElement) {
                    var identifier = bindParts[IDENT_KW_IDX];
                    this._parseVariable(identifier, value, srcSpan, targetVars);
                }
                else {
                    this._reportError("\"let-\" is only supported on ng-template elements.", srcSpan);
                }
            }
            else if (bindParts[KW_REF_IDX]) {
                var identifier = bindParts[IDENT_KW_IDX];
                this._parseReference(identifier, value, srcSpan, targetRefs);
            }
            else if (bindParts[KW_ON_IDX]) {
                this._bindingParser.parseEvent(bindParts[IDENT_KW_IDX], value, srcSpan, targetMatchableAttrs, boundEvents);
            }
            else if (bindParts[KW_BINDON_IDX]) {
                this._bindingParser.parsePropertyBinding(bindParts[IDENT_KW_IDX], value, false, srcSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[IDENT_KW_IDX], value, srcSpan, targetMatchableAttrs, boundEvents);
            }
            else if (bindParts[KW_AT_IDX]) {
                this._bindingParser.parseLiteralAttr(name, value, srcSpan, targetMatchableAttrs, targetProps);
            }
            else if (bindParts[IDENT_BANANA_BOX_IDX]) {
                this._bindingParser.parsePropertyBinding(bindParts[IDENT_BANANA_BOX_IDX], value, false, srcSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[IDENT_BANANA_BOX_IDX], value, srcSpan, targetMatchableAttrs, boundEvents);
            }
            else if (bindParts[IDENT_PROPERTY_IDX]) {
                this._bindingParser.parsePropertyBinding(bindParts[IDENT_PROPERTY_IDX], value, false, srcSpan, targetMatchableAttrs, targetProps);
            }
            else if (bindParts[IDENT_EVENT_IDX]) {
                this._bindingParser.parseEvent(bindParts[IDENT_EVENT_IDX], value, srcSpan, targetMatchableAttrs, boundEvents);
            }
        }
        else {
            hasBinding = this._bindingParser.parsePropertyInterpolation(name, value, srcSpan, targetMatchableAttrs, targetProps);
        }
        if (!hasBinding) {
            this._bindingParser.parseLiteralAttr(name, value, srcSpan, targetMatchableAttrs, targetProps);
        }
        targetEvents.push.apply(targetEvents, tslib_1.__spread(boundEvents.map(function (e) { return t.BoundEventAst.fromParsedEvent(e); })));
        return hasBinding;
    };
    TemplateParseVisitor.prototype._normalizeAttributeName = function (attrName) {
        return /^data-/i.test(attrName) ? attrName.substring(5) : attrName;
    };
    TemplateParseVisitor.prototype._parseVariable = function (identifier, value, sourceSpan, targetVars) {
        if (identifier.indexOf('-') > -1) {
            this._reportError("\"-\" is not allowed in variable names", sourceSpan);
        }
        targetVars.push(new t.VariableAst(identifier, value, sourceSpan));
    };
    TemplateParseVisitor.prototype._parseReference = function (identifier, value, sourceSpan, targetRefs) {
        if (identifier.indexOf('-') > -1) {
            this._reportError("\"-\" is not allowed in reference names", sourceSpan);
        }
        targetRefs.push(new ElementOrDirectiveRef(identifier, value, sourceSpan));
    };
    TemplateParseVisitor.prototype._parseAssignmentEvent = function (name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        this._bindingParser.parseEvent(name + "Change", expression + "=$event", sourceSpan, targetMatchableAttrs, targetEvents);
    };
    TemplateParseVisitor.prototype._parseDirectives = function (selectorMatcher, elementCssSelector) {
        var _this = this;
        // Need to sort the directives so that we get consistent results throughout,
        // as selectorMatcher uses Maps inside.
        // Also deduplicate directives as they might match more than one time!
        var directives = new Array(this.directivesIndex.size);
        // Whether any directive selector matches on the element name
        var matchElement = false;
        selectorMatcher.match(elementCssSelector, function (selector, directive) {
            directives[_this.directivesIndex.get(directive)] = directive;
            matchElement = matchElement || selector.hasElementSelector();
        });
        return {
            directives: directives.filter(function (dir) { return !!dir; }),
            matchElement: matchElement,
        };
    };
    TemplateParseVisitor.prototype._createDirectiveAsts = function (isTemplateElement, elementName, directives, props, elementOrDirectiveRefs, elementSourceSpan, targetReferences, targetBoundDirectivePropNames) {
        var _this = this;
        var matchedReferences = new Set();
        var component = null;
        var directiveAsts = directives.map(function (directive) {
            var sourceSpan = new ParseSourceSpan(elementSourceSpan.start, elementSourceSpan.end, "Directive " + identifierName(directive.type));
            if (directive.isComponent) {
                component = directive;
            }
            var directiveProperties = [];
            var boundProperties = _this._bindingParser.createDirectiveHostPropertyAsts(directive, elementName, sourceSpan);
            var hostProperties = boundProperties.map(function (prop) { return t.BoundElementPropertyAst.fromBoundProperty(prop); });
            // Note: We need to check the host properties here as well,
            // as we don't know the element name in the DirectiveWrapperCompiler yet.
            hostProperties = _this._checkPropertiesInSchema(elementName, hostProperties);
            var parsedEvents = _this._bindingParser.createDirectiveHostEventAsts(directive, sourceSpan);
            _this._createDirectivePropertyAsts(directive.inputs, props, directiveProperties, targetBoundDirectivePropNames);
            elementOrDirectiveRefs.forEach(function (elOrDirRef) {
                if ((elOrDirRef.value.length === 0 && directive.isComponent) ||
                    (elOrDirRef.isReferenceToDirective(directive))) {
                    targetReferences.push(new t.ReferenceAst(elOrDirRef.name, createTokenForReference(directive.type.reference), elOrDirRef.value, elOrDirRef.sourceSpan));
                    matchedReferences.add(elOrDirRef.name);
                }
            });
            var hostEvents = parsedEvents.map(function (e) { return t.BoundEventAst.fromParsedEvent(e); });
            var contentQueryStartId = _this.contentQueryStartId;
            _this.contentQueryStartId += directive.queries.length;
            return new t.DirectiveAst(directive, directiveProperties, hostProperties, hostEvents, contentQueryStartId, sourceSpan);
        });
        elementOrDirectiveRefs.forEach(function (elOrDirRef) {
            if (elOrDirRef.value.length > 0) {
                if (!matchedReferences.has(elOrDirRef.name)) {
                    _this._reportError("There is no directive with \"exportAs\" set to \"" + elOrDirRef.value + "\"", elOrDirRef.sourceSpan);
                }
            }
            else if (!component) {
                var refToken = null;
                if (isTemplateElement) {
                    refToken = createTokenForExternalReference(_this.reflector, Identifiers.TemplateRef);
                }
                targetReferences.push(new t.ReferenceAst(elOrDirRef.name, refToken, elOrDirRef.value, elOrDirRef.sourceSpan));
            }
        });
        return directiveAsts;
    };
    TemplateParseVisitor.prototype._createDirectivePropertyAsts = function (directiveProperties, boundProps, targetBoundDirectiveProps, targetBoundDirectivePropNames) {
        if (directiveProperties) {
            var boundPropsByName_1 = new Map();
            boundProps.forEach(function (boundProp) {
                var prevValue = boundPropsByName_1.get(boundProp.name);
                if (!prevValue || prevValue.isLiteral) {
                    // give [a]="b" a higher precedence than a="b" on the same element
                    boundPropsByName_1.set(boundProp.name, boundProp);
                }
            });
            Object.keys(directiveProperties).forEach(function (dirProp) {
                var elProp = directiveProperties[dirProp];
                var boundProp = boundPropsByName_1.get(elProp);
                // Bindings are optional, so this binding only needs to be set up if an expression is given.
                if (boundProp) {
                    targetBoundDirectivePropNames.add(boundProp.name);
                    if (!isEmptyExpression(boundProp.expression)) {
                        targetBoundDirectiveProps.push(new t.BoundDirectivePropertyAst(dirProp, boundProp.name, boundProp.expression, boundProp.sourceSpan));
                    }
                }
            });
        }
    };
    TemplateParseVisitor.prototype._createElementPropertyAsts = function (elementName, props, boundDirectivePropNames) {
        var _this = this;
        var boundElementProps = [];
        props.forEach(function (prop) {
            if (!prop.isLiteral && !boundDirectivePropNames.has(prop.name)) {
                var boundProp = _this._bindingParser.createBoundElementProperty(elementName, prop);
                boundElementProps.push(t.BoundElementPropertyAst.fromBoundProperty(boundProp));
            }
        });
        return this._checkPropertiesInSchema(elementName, boundElementProps);
    };
    TemplateParseVisitor.prototype._findComponentDirectives = function (directives) {
        return directives.filter(function (directive) { return directive.directive.isComponent; });
    };
    TemplateParseVisitor.prototype._findComponentDirectiveNames = function (directives) {
        return this._findComponentDirectives(directives)
            .map(function (directive) { return identifierName(directive.directive.type); });
    };
    TemplateParseVisitor.prototype._assertOnlyOneComponent = function (directives, sourceSpan) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 1) {
            this._reportError("More than one component matched on this element.\n" +
                "Make sure that only one component's selector can match a given element.\n" +
                ("Conflicting components: " + componentTypeNames.join(',')), sourceSpan);
        }
    };
    /**
     * Make sure that non-angular tags conform to the schemas.
     *
     * Note: An element is considered an angular tag when at least one directive selector matches the
     * tag name.
     *
     * @param matchElement Whether any directive has matched on the tag name
     * @param element the html element
     */
    TemplateParseVisitor.prototype._assertElementExists = function (matchElement, element) {
        var elName = element.name.replace(/^:xhtml:/, '');
        if (!matchElement && !this._schemaRegistry.hasElement(elName, this._schemas)) {
            var errorMsg = "'" + elName + "' is not a known element:\n";
            errorMsg +=
                "1. If '" + elName + "' is an Angular component, then verify that it is part of this module.\n";
            if (elName.indexOf('-') > -1) {
                errorMsg +=
                    "2. If '" + elName + "' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.";
            }
            else {
                errorMsg +=
                    "2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.";
            }
            this._reportError(errorMsg, element.sourceSpan);
        }
    };
    TemplateParseVisitor.prototype._assertNoComponentsNorElementBindingsOnTemplate = function (directives, elementProps, sourceSpan) {
        var _this = this;
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 0) {
            this._reportError("Components on an embedded template: " + componentTypeNames.join(','), sourceSpan);
        }
        elementProps.forEach(function (prop) {
            _this._reportError("Property binding " + prop.name + " not used by any directive on an embedded template. Make sure that the property name is spelled correctly and all directives are listed in the \"@NgModule.declarations\".", sourceSpan);
        });
    };
    TemplateParseVisitor.prototype._assertAllEventsPublishedByDirectives = function (directives, events) {
        var _this = this;
        var allDirectiveEvents = new Set();
        directives.forEach(function (directive) {
            Object.keys(directive.directive.outputs).forEach(function (k) {
                var eventName = directive.directive.outputs[k];
                allDirectiveEvents.add(eventName);
            });
        });
        events.forEach(function (event) {
            if (event.target != null || !allDirectiveEvents.has(event.name)) {
                _this._reportError("Event binding " + event.fullName + " not emitted by any directive on an embedded template. Make sure that the event name is spelled correctly and all directives are listed in the \"@NgModule.declarations\".", event.sourceSpan);
            }
        });
    };
    TemplateParseVisitor.prototype._checkPropertiesInSchema = function (elementName, boundProps) {
        var _this = this;
        // Note: We can't filter out empty expressions before this method,
        // as we still want to validate them!
        return boundProps.filter(function (boundProp) {
            if (boundProp.type === 0 /* Property */ &&
                !_this._schemaRegistry.hasProperty(elementName, boundProp.name, _this._schemas)) {
                var errorMsg = "Can't bind to '" + boundProp.name + "' since it isn't a known property of '" + elementName + "'.";
                if (elementName.startsWith('ng-')) {
                    errorMsg +=
                        "\n1. If '" + boundProp.name + "' is an Angular directive, then add 'CommonModule' to the '@NgModule.imports' of this component." +
                            "\n2. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.";
                }
                else if (elementName.indexOf('-') > -1) {
                    errorMsg +=
                        "\n1. If '" + elementName + "' is an Angular component and it has '" + boundProp.name + "' input, then verify that it is part of this module." +
                            ("\n2. If '" + elementName + "' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.") +
                            "\n3. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.";
                }
                _this._reportError(errorMsg, boundProp.sourceSpan);
            }
            return !isEmptyExpression(boundProp.value);
        });
    };
    TemplateParseVisitor.prototype._reportError = function (message, sourceSpan, level) {
        if (level === void 0) { level = ParseErrorLevel.ERROR; }
        this._targetErrors.push(new ParseError(sourceSpan, message, level));
    };
    return TemplateParseVisitor;
}());
var NonBindableVisitor = /** @class */ (function () {
    function NonBindableVisitor() {
    }
    NonBindableVisitor.prototype.visitElement = function (ast, parent) {
        var preparsedElement = preparseElement(ast);
        if (preparsedElement.type === PreparsedElementType.SCRIPT ||
            preparsedElement.type === PreparsedElementType.STYLE ||
            preparsedElement.type === PreparsedElementType.STYLESHEET) {
            // Skipping <script> for security reasons
            // Skipping <style> and stylesheets as we already processed them
            // in the StyleCompiler
            return null;
        }
        var attrNameAndValues = ast.attrs.map(function (attr) { return [attr.name, attr.value]; });
        var selector = createElementCssSelector(ast.name, attrNameAndValues);
        var ngContentIndex = parent.findNgContentIndex(selector);
        var children = html.visitAll(this, ast.children, EMPTY_ELEMENT_CONTEXT);
        return new t.ElementAst(ast.name, html.visitAll(this, ast.attrs), [], [], [], [], [], false, [], children, ngContentIndex, ast.sourceSpan, ast.endSourceSpan);
    };
    NonBindableVisitor.prototype.visitComment = function (comment, context) { return null; };
    NonBindableVisitor.prototype.visitAttribute = function (attribute, context) {
        return new t.AttrAst(attribute.name, attribute.value, attribute.sourceSpan);
    };
    NonBindableVisitor.prototype.visitText = function (text, parent) {
        var ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR);
        return new t.TextAst(text.value, ngContentIndex, text.sourceSpan);
    };
    NonBindableVisitor.prototype.visitExpansion = function (expansion, context) { return expansion; };
    NonBindableVisitor.prototype.visitExpansionCase = function (expansionCase, context) { return expansionCase; };
    return NonBindableVisitor;
}());
/**
 * A reference to an element or directive in a template. E.g., the reference in this template:
 *
 * <div #myMenu="coolMenu">
 *
 * would be {name: 'myMenu', value: 'coolMenu', sourceSpan: ...}
 */
var ElementOrDirectiveRef = /** @class */ (function () {
    function ElementOrDirectiveRef(name, value, sourceSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    /** Gets whether this is a reference to the given directive. */
    ElementOrDirectiveRef.prototype.isReferenceToDirective = function (directive) {
        return splitExportAs(directive.exportAs).indexOf(this.value) !== -1;
    };
    return ElementOrDirectiveRef;
}());
/** Splits a raw, potentially comma-delimited `exportAs` value into an array of names. */
function splitExportAs(exportAs) {
    return exportAs ? exportAs.split(',').map(function (e) { return e.trim(); }) : [];
}
export function splitClasses(classAttrValue) {
    return classAttrValue.trim().split(/\s+/g);
}
var ElementContext = /** @class */ (function () {
    function ElementContext(isTemplateElement, _ngContentIndexMatcher, _wildcardNgContentIndex, providerContext) {
        this.isTemplateElement = isTemplateElement;
        this._ngContentIndexMatcher = _ngContentIndexMatcher;
        this._wildcardNgContentIndex = _wildcardNgContentIndex;
        this.providerContext = providerContext;
    }
    ElementContext.create = function (isTemplateElement, directives, providerContext) {
        var matcher = new SelectorMatcher();
        var wildcardNgContentIndex = null;
        var component = directives.find(function (directive) { return directive.directive.isComponent; });
        if (component) {
            var ngContentSelectors = component.directive.template.ngContentSelectors;
            for (var i = 0; i < ngContentSelectors.length; i++) {
                var selector = ngContentSelectors[i];
                if (selector === '*') {
                    wildcardNgContentIndex = i;
                }
                else {
                    matcher.addSelectables(CssSelector.parse(ngContentSelectors[i]), i);
                }
            }
        }
        return new ElementContext(isTemplateElement, matcher, wildcardNgContentIndex, providerContext);
    };
    ElementContext.prototype.findNgContentIndex = function (selector) {
        var ngContentIndices = [];
        this._ngContentIndexMatcher.match(selector, function (selector, ngContentIndex) { ngContentIndices.push(ngContentIndex); });
        ngContentIndices.sort();
        if (this._wildcardNgContentIndex != null) {
            ngContentIndices.push(this._wildcardNgContentIndex);
        }
        return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
    };
    return ElementContext;
}());
export function createElementCssSelector(elementName, attributes) {
    var cssSelector = new CssSelector();
    var elNameNoNs = splitNsName(elementName)[1];
    cssSelector.setElement(elNameNoNs);
    for (var i = 0; i < attributes.length; i++) {
        var attrName = attributes[i][0];
        var attrNameNoNs = splitNsName(attrName)[1];
        var attrValue = attributes[i][1];
        cssSelector.addAttribute(attrNameNoNs, attrValue);
        if (attrName.toLowerCase() == CLASS_ATTR) {
            var classes = splitClasses(attrValue);
            classes.forEach(function (className) { return cssSelector.addClassName(className); });
        }
    }
    return cssSelector;
}
var EMPTY_ELEMENT_CONTEXT = new ElementContext(true, new SelectorMatcher(), null, null);
var NON_BINDABLE_VISITOR = new NonBindableVisitor();
function _isEmptyTextNode(node) {
    return node instanceof html.Text && node.value.trim().length == 0;
}
export function removeSummaryDuplicates(items) {
    var map = new Map();
    items.forEach(function (item) {
        if (!map.get(item.type.reference)) {
            map.set(item.type.reference, item);
        }
    });
    return Array.from(map.values());
}
function isEmptyExpression(ast) {
    if (ast instanceof ASTWithSource) {
        ast = ast.ast;
    }
    return ast instanceof EmptyExpr;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlX3BhcnNlci90ZW1wbGF0ZV9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBbUgsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFJckssT0FBTyxFQUFNLGFBQWEsRUFBRSxTQUFTLEVBQThDLE1BQU0sMEJBQTBCLENBQUM7QUFFcEgsT0FBTyxFQUFDLFdBQVcsRUFBRSwrQkFBK0IsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JHLE9BQU8sS0FBSyxJQUFJLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxFQUFhLGVBQWUsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3JFLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxXQUFXLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUM3RSxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDMUQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFDdEUsT0FBTyxFQUFDLFlBQVksRUFBRSxXQUFXLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFDLHNCQUFzQixFQUFFLG1CQUFtQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFakYsT0FBTyxFQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDekQsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDM0QsT0FBTyxFQUFVLFdBQVcsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUU3QyxP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QUMsR0FBRyxDQUFDO0lBQ2hCLENBQUM7SUFDRCxNQUFNLENBQUMsR0FBRyxZQUFZLFNBQVMsQ0FBQztBQUNsQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnksIENvbXBpbGVQaXBlU3VtbWFyeSwgQ29tcGlsZVRva2VuTWV0YWRhdGEsIENvbXBpbGVUeXBlTWV0YWRhdGEsIGlkZW50aWZpZXJOYW1lfSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7Q29tcGlsZVJlZmxlY3Rvcn0gZnJvbSAnLi4vY29tcGlsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtDb21waWxlckNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7U2NoZW1hTWV0YWRhdGF9IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtBU1QsIEFTVFdpdGhTb3VyY2UsIEVtcHR5RXhwciwgUGFyc2VkRXZlbnQsIFBhcnNlZFByb3BlcnR5LCBQYXJzZWRWYXJpYWJsZX0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCB7UGFyc2VyfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9wYXJzZXInO1xuaW1wb3J0IHtJZGVudGlmaWVycywgY3JlYXRlVG9rZW5Gb3JFeHRlcm5hbFJlZmVyZW5jZSwgY3JlYXRlVG9rZW5Gb3JSZWZlcmVuY2V9IGZyb20gJy4uL2lkZW50aWZpZXJzJztcbmltcG9ydCAqIGFzIGh0bWwgZnJvbSAnLi4vbWxfcGFyc2VyL2FzdCc7XG5pbXBvcnQge0h0bWxQYXJzZXIsIFBhcnNlVHJlZVJlc3VsdH0gZnJvbSAnLi4vbWxfcGFyc2VyL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7cmVtb3ZlV2hpdGVzcGFjZXMsIHJlcGxhY2VOZ3NwfSBmcm9tICcuLi9tbF9wYXJzZXIvaHRtbF93aGl0ZXNwYWNlcyc7XG5pbXBvcnQge2V4cGFuZE5vZGVzfSBmcm9tICcuLi9tbF9wYXJzZXIvaWN1X2FzdF9leHBhbmRlcic7XG5pbXBvcnQge0ludGVycG9sYXRpb25Db25maWd9IGZyb20gJy4uL21sX3BhcnNlci9pbnRlcnBvbGF0aW9uX2NvbmZpZyc7XG5pbXBvcnQge2lzTmdUZW1wbGF0ZSwgc3BsaXROc05hbWV9IGZyb20gJy4uL21sX3BhcnNlci90YWdzJztcbmltcG9ydCB7UGFyc2VFcnJvciwgUGFyc2VFcnJvckxldmVsLCBQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtQcm92aWRlckVsZW1lbnRDb250ZXh0LCBQcm92aWRlclZpZXdDb250ZXh0fSBmcm9tICcuLi9wcm92aWRlcl9hbmFseXplcic7XG5pbXBvcnQge0VsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi4vc2NoZW1hL2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcbmltcG9ydCB7Q3NzU2VsZWN0b3IsIFNlbGVjdG9yTWF0Y2hlcn0gZnJvbSAnLi4vc2VsZWN0b3InO1xuaW1wb3J0IHtpc1N0eWxlVXJsUmVzb2x2YWJsZX0gZnJvbSAnLi4vc3R5bGVfdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7Q29uc29sZSwgc3ludGF4RXJyb3J9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0JpbmRpbmdQYXJzZXJ9IGZyb20gJy4vYmluZGluZ19wYXJzZXInO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge1ByZXBhcnNlZEVsZW1lbnRUeXBlLCBwcmVwYXJzZUVsZW1lbnR9IGZyb20gJy4vdGVtcGxhdGVfcHJlcGFyc2VyJztcblxuY29uc3QgQklORF9OQU1FX1JFR0VYUCA9XG4gICAgL14oPzooPzooPzooYmluZC0pfChsZXQtKXwocmVmLXwjKXwob24tKXwoYmluZG9uLSl8KEApKSguKykpfFxcW1xcKChbXlxcKV0rKVxcKVxcXXxcXFsoW15cXF1dKylcXF18XFwoKFteXFwpXSspXFwpKSQvO1xuXG4vLyBHcm91cCAxID0gXCJiaW5kLVwiXG5jb25zdCBLV19CSU5EX0lEWCA9IDE7XG4vLyBHcm91cCAyID0gXCJsZXQtXCJcbmNvbnN0IEtXX0xFVF9JRFggPSAyO1xuLy8gR3JvdXAgMyA9IFwicmVmLS8jXCJcbmNvbnN0IEtXX1JFRl9JRFggPSAzO1xuLy8gR3JvdXAgNCA9IFwib24tXCJcbmNvbnN0IEtXX09OX0lEWCA9IDQ7XG4vLyBHcm91cCA1ID0gXCJiaW5kb24tXCJcbmNvbnN0IEtXX0JJTkRPTl9JRFggPSA1O1xuLy8gR3JvdXAgNiA9IFwiQFwiXG5jb25zdCBLV19BVF9JRFggPSA2O1xuLy8gR3JvdXAgNyA9IHRoZSBpZGVudGlmaWVyIGFmdGVyIFwiYmluZC1cIiwgXCJsZXQtXCIsIFwicmVmLS8jXCIsIFwib24tXCIsIFwiYmluZG9uLVwiIG9yIFwiQFwiXG5jb25zdCBJREVOVF9LV19JRFggPSA3O1xuLy8gR3JvdXAgOCA9IGlkZW50aWZpZXIgaW5zaWRlIFsoKV1cbmNvbnN0IElERU5UX0JBTkFOQV9CT1hfSURYID0gODtcbi8vIEdyb3VwIDkgPSBpZGVudGlmaWVyIGluc2lkZSBbXVxuY29uc3QgSURFTlRfUFJPUEVSVFlfSURYID0gOTtcbi8vIEdyb3VwIDEwID0gaWRlbnRpZmllciBpbnNpZGUgKClcbmNvbnN0IElERU5UX0VWRU5UX0lEWCA9IDEwO1xuXG5jb25zdCBURU1QTEFURV9BVFRSX1BSRUZJWCA9ICcqJztcbmNvbnN0IENMQVNTX0FUVFIgPSAnY2xhc3MnO1xuXG5jb25zdCBURVhUX0NTU19TRUxFQ1RPUiA9IENzc1NlbGVjdG9yLnBhcnNlKCcqJylbMF07XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVBhcnNlRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGxldmVsOiBQYXJzZUVycm9yTGV2ZWwpIHtcbiAgICBzdXBlcihzcGFuLCBtZXNzYWdlLCBsZXZlbCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUGFyc2VSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyB0ZW1wbGF0ZUFzdD86IHQuVGVtcGxhdGVBc3RbXSwgcHVibGljIHVzZWRQaXBlcz86IENvbXBpbGVQaXBlU3VtbWFyeVtdLFxuICAgICAgcHVibGljIGVycm9ycz86IFBhcnNlRXJyb3JbXSkge31cbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUGFyc2VyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9jb25maWc6IENvbXBpbGVyQ29uZmlnLCBwcml2YXRlIF9yZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsXG4gICAgICBwcml2YXRlIF9leHByUGFyc2VyOiBQYXJzZXIsIHByaXZhdGUgX3NjaGVtYVJlZ2lzdHJ5OiBFbGVtZW50U2NoZW1hUmVnaXN0cnksXG4gICAgICBwcml2YXRlIF9odG1sUGFyc2VyOiBIdG1sUGFyc2VyLCBwcml2YXRlIF9jb25zb2xlOiBDb25zb2xlLFxuICAgICAgcHVibGljIHRyYW5zZm9ybXM6IHQuVGVtcGxhdGVBc3RWaXNpdG9yW10pIHt9XG5cbiAgcHVibGljIGdldCBleHByZXNzaW9uUGFyc2VyKCkgeyByZXR1cm4gdGhpcy5fZXhwclBhcnNlcjsgfVxuXG4gIHBhcnNlKFxuICAgICAgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIHRlbXBsYXRlOiBzdHJpbmd8UGFyc2VUcmVlUmVzdWx0LFxuICAgICAgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnlbXSwgcGlwZXM6IENvbXBpbGVQaXBlU3VtbWFyeVtdLCBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdLFxuICAgICAgdGVtcGxhdGVVcmw6IHN0cmluZyxcbiAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXM6IGJvb2xlYW4pOiB7dGVtcGxhdGU6IHQuVGVtcGxhdGVBc3RbXSwgcGlwZXM6IENvbXBpbGVQaXBlU3VtbWFyeVtdfSB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy50cnlQYXJzZShcbiAgICAgICAgY29tcG9uZW50LCB0ZW1wbGF0ZSwgZGlyZWN0aXZlcywgcGlwZXMsIHNjaGVtYXMsIHRlbXBsYXRlVXJsLCBwcmVzZXJ2ZVdoaXRlc3BhY2VzKTtcbiAgICBjb25zdCB3YXJuaW5ncyA9IHJlc3VsdC5lcnJvcnMgIS5maWx0ZXIoZXJyb3IgPT4gZXJyb3IubGV2ZWwgPT09IFBhcnNlRXJyb3JMZXZlbC5XQVJOSU5HKTtcblxuICAgIGNvbnN0IGVycm9ycyA9IHJlc3VsdC5lcnJvcnMgIS5maWx0ZXIoZXJyb3IgPT4gZXJyb3IubGV2ZWwgPT09IFBhcnNlRXJyb3JMZXZlbC5FUlJPUik7XG5cbiAgICBpZiAod2FybmluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fY29uc29sZS53YXJuKGBUZW1wbGF0ZSBwYXJzZSB3YXJuaW5nczpcXG4ke3dhcm5pbmdzLmpvaW4oJ1xcbicpfWApO1xuICAgIH1cblxuICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZXJyb3JTdHJpbmcgPSBlcnJvcnMuam9pbignXFxuJyk7XG4gICAgICB0aHJvdyBzeW50YXhFcnJvcihgVGVtcGxhdGUgcGFyc2UgZXJyb3JzOlxcbiR7ZXJyb3JTdHJpbmd9YCwgZXJyb3JzKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge3RlbXBsYXRlOiByZXN1bHQudGVtcGxhdGVBc3QgISwgcGlwZXM6IHJlc3VsdC51c2VkUGlwZXMgIX07XG4gIH1cblxuICB0cnlQYXJzZShcbiAgICAgIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCB0ZW1wbGF0ZTogc3RyaW5nfFBhcnNlVHJlZVJlc3VsdCxcbiAgICAgIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5W10sIHBpcGVzOiBDb21waWxlUGlwZVN1bW1hcnlbXSwgc2NoZW1hczogU2NoZW1hTWV0YWRhdGFbXSxcbiAgICAgIHRlbXBsYXRlVXJsOiBzdHJpbmcsIHByZXNlcnZlV2hpdGVzcGFjZXM6IGJvb2xlYW4pOiBUZW1wbGF0ZVBhcnNlUmVzdWx0IHtcbiAgICBsZXQgaHRtbFBhcnNlUmVzdWx0ID0gdHlwZW9mIHRlbXBsYXRlID09PSAnc3RyaW5nJyA/XG4gICAgICAgIHRoaXMuX2h0bWxQYXJzZXIgIS5wYXJzZShcbiAgICAgICAgICAgIHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCwgdHJ1ZSwgdGhpcy5nZXRJbnRlcnBvbGF0aW9uQ29uZmlnKGNvbXBvbmVudCkpIDpcbiAgICAgICAgdGVtcGxhdGU7XG5cbiAgICBpZiAoIXByZXNlcnZlV2hpdGVzcGFjZXMpIHtcbiAgICAgIGh0bWxQYXJzZVJlc3VsdCA9IHJlbW92ZVdoaXRlc3BhY2VzKGh0bWxQYXJzZVJlc3VsdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudHJ5UGFyc2VIdG1sKFxuICAgICAgICB0aGlzLmV4cGFuZEh0bWwoaHRtbFBhcnNlUmVzdWx0KSwgY29tcG9uZW50LCBkaXJlY3RpdmVzLCBwaXBlcywgc2NoZW1hcyk7XG4gIH1cblxuICB0cnlQYXJzZUh0bWwoXG4gICAgICBodG1sQXN0V2l0aEVycm9yczogUGFyc2VUcmVlUmVzdWx0LCBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5W10sIHBpcGVzOiBDb21waWxlUGlwZVN1bW1hcnlbXSxcbiAgICAgIHNjaGVtYXM6IFNjaGVtYU1ldGFkYXRhW10pOiBUZW1wbGF0ZVBhcnNlUmVzdWx0IHtcbiAgICBsZXQgcmVzdWx0OiB0LlRlbXBsYXRlQXN0W107XG4gICAgY29uc3QgZXJyb3JzID0gaHRtbEFzdFdpdGhFcnJvcnMuZXJyb3JzO1xuICAgIGNvbnN0IHVzZWRQaXBlczogQ29tcGlsZVBpcGVTdW1tYXJ5W10gPSBbXTtcbiAgICBpZiAoaHRtbEFzdFdpdGhFcnJvcnMucm9vdE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHVuaXFEaXJlY3RpdmVzID0gcmVtb3ZlU3VtbWFyeUR1cGxpY2F0ZXMoZGlyZWN0aXZlcyk7XG4gICAgICBjb25zdCB1bmlxUGlwZXMgPSByZW1vdmVTdW1tYXJ5RHVwbGljYXRlcyhwaXBlcyk7XG4gICAgICBjb25zdCBwcm92aWRlclZpZXdDb250ZXh0ID0gbmV3IFByb3ZpZGVyVmlld0NvbnRleHQodGhpcy5fcmVmbGVjdG9yLCBjb21wb25lbnQpO1xuICAgICAgbGV0IGludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWcgPSB1bmRlZmluZWQgITtcbiAgICAgIGlmIChjb21wb25lbnQudGVtcGxhdGUgJiYgY29tcG9uZW50LnRlbXBsYXRlLmludGVycG9sYXRpb24pIHtcbiAgICAgICAgaW50ZXJwb2xhdGlvbkNvbmZpZyA9IHtcbiAgICAgICAgICBzdGFydDogY29tcG9uZW50LnRlbXBsYXRlLmludGVycG9sYXRpb25bMF0sXG4gICAgICAgICAgZW5kOiBjb21wb25lbnQudGVtcGxhdGUuaW50ZXJwb2xhdGlvblsxXVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgY29uc3QgYmluZGluZ1BhcnNlciA9IG5ldyBCaW5kaW5nUGFyc2VyKFxuICAgICAgICAgIHRoaXMuX2V4cHJQYXJzZXIsIGludGVycG9sYXRpb25Db25maWcgISwgdGhpcy5fc2NoZW1hUmVnaXN0cnksIHVuaXFQaXBlcywgZXJyb3JzKTtcbiAgICAgIGNvbnN0IHBhcnNlVmlzaXRvciA9IG5ldyBUZW1wbGF0ZVBhcnNlVmlzaXRvcihcbiAgICAgICAgICB0aGlzLl9yZWZsZWN0b3IsIHRoaXMuX2NvbmZpZywgcHJvdmlkZXJWaWV3Q29udGV4dCwgdW5pcURpcmVjdGl2ZXMsIGJpbmRpbmdQYXJzZXIsXG4gICAgICAgICAgdGhpcy5fc2NoZW1hUmVnaXN0cnksIHNjaGVtYXMsIGVycm9ycyk7XG4gICAgICByZXN1bHQgPSBodG1sLnZpc2l0QWxsKHBhcnNlVmlzaXRvciwgaHRtbEFzdFdpdGhFcnJvcnMucm9vdE5vZGVzLCBFTVBUWV9FTEVNRU5UX0NPTlRFWFQpO1xuICAgICAgZXJyb3JzLnB1c2goLi4ucHJvdmlkZXJWaWV3Q29udGV4dC5lcnJvcnMpO1xuICAgICAgdXNlZFBpcGVzLnB1c2goLi4uYmluZGluZ1BhcnNlci5nZXRVc2VkUGlwZXMoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IFtdO1xuICAgIH1cbiAgICB0aGlzLl9hc3NlcnROb1JlZmVyZW5jZUR1cGxpY2F0aW9uT25UZW1wbGF0ZShyZXN1bHQsIGVycm9ycyk7XG5cbiAgICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBuZXcgVGVtcGxhdGVQYXJzZVJlc3VsdChyZXN1bHQsIHVzZWRQaXBlcywgZXJyb3JzKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy50cmFuc2Zvcm1zKSB7XG4gICAgICB0aGlzLnRyYW5zZm9ybXMuZm9yRWFjaChcbiAgICAgICAgICAodHJhbnNmb3JtOiB0LlRlbXBsYXRlQXN0VmlzaXRvcikgPT4geyByZXN1bHQgPSB0LnRlbXBsYXRlVmlzaXRBbGwodHJhbnNmb3JtLCByZXN1bHQpOyB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFRlbXBsYXRlUGFyc2VSZXN1bHQocmVzdWx0LCB1c2VkUGlwZXMsIGVycm9ycyk7XG4gIH1cblxuICBleHBhbmRIdG1sKGh0bWxBc3RXaXRoRXJyb3JzOiBQYXJzZVRyZWVSZXN1bHQsIGZvcmNlZDogYm9vbGVhbiA9IGZhbHNlKTogUGFyc2VUcmVlUmVzdWx0IHtcbiAgICBjb25zdCBlcnJvcnM6IFBhcnNlRXJyb3JbXSA9IGh0bWxBc3RXaXRoRXJyb3JzLmVycm9ycztcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoID09IDAgfHwgZm9yY2VkKSB7XG4gICAgICAvLyBUcmFuc2Zvcm0gSUNVIG1lc3NhZ2VzIHRvIGFuZ3VsYXIgZGlyZWN0aXZlc1xuICAgICAgY29uc3QgZXhwYW5kZWRIdG1sQXN0ID0gZXhwYW5kTm9kZXMoaHRtbEFzdFdpdGhFcnJvcnMucm9vdE5vZGVzKTtcbiAgICAgIGVycm9ycy5wdXNoKC4uLmV4cGFuZGVkSHRtbEFzdC5lcnJvcnMpO1xuICAgICAgaHRtbEFzdFdpdGhFcnJvcnMgPSBuZXcgUGFyc2VUcmVlUmVzdWx0KGV4cGFuZGVkSHRtbEFzdC5ub2RlcywgZXJyb3JzKTtcbiAgICB9XG4gICAgcmV0dXJuIGh0bWxBc3RXaXRoRXJyb3JzO1xuICB9XG5cbiAgZ2V0SW50ZXJwb2xhdGlvbkNvbmZpZyhjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSk6IEludGVycG9sYXRpb25Db25maWd8dW5kZWZpbmVkIHtcbiAgICBpZiAoY29tcG9uZW50LnRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gSW50ZXJwb2xhdGlvbkNvbmZpZy5mcm9tQXJyYXkoY29tcG9uZW50LnRlbXBsYXRlLmludGVycG9sYXRpb24pO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXNzZXJ0Tm9SZWZlcmVuY2VEdXBsaWNhdGlvbk9uVGVtcGxhdGUocmVzdWx0OiB0LlRlbXBsYXRlQXN0W10sIGVycm9yczogVGVtcGxhdGVQYXJzZUVycm9yW10pOlxuICAgICAgdm9pZCB7XG4gICAgY29uc3QgZXhpc3RpbmdSZWZlcmVuY2VzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgcmVzdWx0LmZpbHRlcihlbGVtZW50ID0+ICEhKDxhbnk+ZWxlbWVudCkucmVmZXJlbmNlcylcbiAgICAgICAgLmZvckVhY2goZWxlbWVudCA9PiAoPGFueT5lbGVtZW50KS5yZWZlcmVuY2VzLmZvckVhY2goKHJlZmVyZW5jZTogdC5SZWZlcmVuY2VBc3QpID0+IHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gcmVmZXJlbmNlLm5hbWU7XG4gICAgICAgICAgaWYgKGV4aXN0aW5nUmVmZXJlbmNlcy5pbmRleE9mKG5hbWUpIDwgMCkge1xuICAgICAgICAgICAgZXhpc3RpbmdSZWZlcmVuY2VzLnB1c2gobmFtZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IFRlbXBsYXRlUGFyc2VFcnJvcihcbiAgICAgICAgICAgICAgICBgUmVmZXJlbmNlIFwiIyR7bmFtZX1cIiBpcyBkZWZpbmVkIHNldmVyYWwgdGltZXNgLCByZWZlcmVuY2Uuc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICBQYXJzZUVycm9yTGV2ZWwuRVJST1IpO1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICB9XG59XG5cbmNsYXNzIFRlbXBsYXRlUGFyc2VWaXNpdG9yIGltcGxlbWVudHMgaHRtbC5WaXNpdG9yIHtcbiAgc2VsZWN0b3JNYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICBkaXJlY3RpdmVzSW5kZXggPSBuZXcgTWFwPENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5LCBudW1iZXI+KCk7XG4gIG5nQ29udGVudENvdW50ID0gMDtcbiAgY29udGVudFF1ZXJ5U3RhcnRJZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsIHByaXZhdGUgY29uZmlnOiBDb21waWxlckNvbmZpZyxcbiAgICAgIHB1YmxpYyBwcm92aWRlclZpZXdDb250ZXh0OiBQcm92aWRlclZpZXdDb250ZXh0LCBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeVtdLFxuICAgICAgcHJpdmF0ZSBfYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlciwgcHJpdmF0ZSBfc2NoZW1hUmVnaXN0cnk6IEVsZW1lbnRTY2hlbWFSZWdpc3RyeSxcbiAgICAgIHByaXZhdGUgX3NjaGVtYXM6IFNjaGVtYU1ldGFkYXRhW10sIHByaXZhdGUgX3RhcmdldEVycm9yczogVGVtcGxhdGVQYXJzZUVycm9yW10pIHtcbiAgICAvLyBOb3RlOiBxdWVyaWVzIHN0YXJ0IHdpdGggaWQgMSBzbyB3ZSBjYW4gdXNlIHRoZSBudW1iZXIgaW4gYSBCbG9vbSBmaWx0ZXIhXG4gICAgdGhpcy5jb250ZW50UXVlcnlTdGFydElkID0gcHJvdmlkZXJWaWV3Q29udGV4dC5jb21wb25lbnQudmlld1F1ZXJpZXMubGVuZ3RoICsgMTtcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goKGRpcmVjdGl2ZSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gQ3NzU2VsZWN0b3IucGFyc2UoZGlyZWN0aXZlLnNlbGVjdG9yICEpO1xuICAgICAgdGhpcy5zZWxlY3Rvck1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoc2VsZWN0b3IsIGRpcmVjdGl2ZSk7XG4gICAgICB0aGlzLmRpcmVjdGl2ZXNJbmRleC5zZXQoZGlyZWN0aXZlLCBpbmRleCk7XG4gICAgfSk7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbihleHBhbnNpb246IGh0bWwuRXhwYW5zaW9uLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShleHBhbnNpb25DYXNlOiBodG1sLkV4cGFuc2lvbkNhc2UsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGh0bWwuVGV4dCwgcGFyZW50OiBFbGVtZW50Q29udGV4dCk6IGFueSB7XG4gICAgY29uc3QgbmdDb250ZW50SW5kZXggPSBwYXJlbnQuZmluZE5nQ29udGVudEluZGV4KFRFWFRfQ1NTX1NFTEVDVE9SKSAhO1xuICAgIGNvbnN0IHZhbHVlTm9OZ3NwID0gcmVwbGFjZU5nc3AodGV4dC52YWx1ZSk7XG4gICAgY29uc3QgZXhwciA9IHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlTm9OZ3NwLCB0ZXh0LnNvdXJjZVNwYW4gISk7XG4gICAgcmV0dXJuIGV4cHIgPyBuZXcgdC5Cb3VuZFRleHRBc3QoZXhwciwgbmdDb250ZW50SW5kZXgsIHRleHQuc291cmNlU3BhbiAhKSA6XG4gICAgICAgICAgICAgICAgICBuZXcgdC5UZXh0QXN0KHZhbHVlTm9OZ3NwLCBuZ0NvbnRlbnRJbmRleCwgdGV4dC5zb3VyY2VTcGFuICEpO1xuICB9XG5cbiAgdmlzaXRBdHRyaWJ1dGUoYXR0cmlidXRlOiBodG1sLkF0dHJpYnV0ZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IHQuQXR0ckFzdChhdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLnZhbHVlLCBhdHRyaWJ1dGUuc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdENvbW1lbnQoY29tbWVudDogaHRtbC5Db21tZW50LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBodG1sLkVsZW1lbnQsIHBhcmVudDogRWxlbWVudENvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IHF1ZXJ5U3RhcnRJbmRleCA9IHRoaXMuY29udGVudFF1ZXJ5U3RhcnRJZDtcbiAgICBjb25zdCBlbE5hbWUgPSBlbGVtZW50Lm5hbWU7XG4gICAgY29uc3QgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChlbGVtZW50KTtcbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TQ1JJUFQgfHxcbiAgICAgICAgcHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRSkge1xuICAgICAgLy8gU2tpcHBpbmcgPHNjcmlwdD4gZm9yIHNlY3VyaXR5IHJlYXNvbnNcbiAgICAgIC8vIFNraXBwaW5nIDxzdHlsZT4gYXMgd2UgYWxyZWFkeSBwcm9jZXNzZWQgdGhlbVxuICAgICAgLy8gaW4gdGhlIFN0eWxlQ29tcGlsZXJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRVNIRUVUICYmXG4gICAgICAgIGlzU3R5bGVVcmxSZXNvbHZhYmxlKHByZXBhcnNlZEVsZW1lbnQuaHJlZkF0dHIpKSB7XG4gICAgICAvLyBTa2lwcGluZyBzdHlsZXNoZWV0cyB3aXRoIGVpdGhlciByZWxhdGl2ZSB1cmxzIG9yIHBhY2thZ2Ugc2NoZW1lIGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkXG4gICAgICAvLyB0aGVtIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBtYXRjaGFibGVBdHRyczogW3N0cmluZywgc3RyaW5nXVtdID0gW107XG4gICAgY29uc3QgZWxlbWVudE9yRGlyZWN0aXZlUHJvcHM6IFBhcnNlZFByb3BlcnR5W10gPSBbXTtcbiAgICBjb25zdCBlbGVtZW50T3JEaXJlY3RpdmVSZWZzOiBFbGVtZW50T3JEaXJlY3RpdmVSZWZbXSA9IFtdO1xuICAgIGNvbnN0IGVsZW1lbnRWYXJzOiB0LlZhcmlhYmxlQXN0W10gPSBbXTtcbiAgICBjb25zdCBldmVudHM6IHQuQm91bmRFdmVudEFzdFtdID0gW107XG5cbiAgICBjb25zdCB0ZW1wbGF0ZUVsZW1lbnRPckRpcmVjdGl2ZVByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdID0gW107XG4gICAgY29uc3QgdGVtcGxhdGVNYXRjaGFibGVBdHRyczogW3N0cmluZywgc3RyaW5nXVtdID0gW107XG4gICAgY29uc3QgdGVtcGxhdGVFbGVtZW50VmFyczogdC5WYXJpYWJsZUFzdFtdID0gW107XG5cbiAgICBsZXQgaGFzSW5saW5lVGVtcGxhdGVzID0gZmFsc2U7XG4gICAgY29uc3QgYXR0cnM6IHQuQXR0ckFzdFtdID0gW107XG4gICAgY29uc3QgaXNUZW1wbGF0ZUVsZW1lbnQgPSBpc05nVGVtcGxhdGUoZWxlbWVudC5uYW1lKTtcblxuICAgIGVsZW1lbnQuYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGNvbnN0IHBhcnNlZFZhcmlhYmxlczogUGFyc2VkVmFyaWFibGVbXSA9IFtdO1xuICAgICAgY29uc3QgaGFzQmluZGluZyA9IHRoaXMuX3BhcnNlQXR0cihcbiAgICAgICAgICBpc1RlbXBsYXRlRWxlbWVudCwgYXR0ciwgbWF0Y2hhYmxlQXR0cnMsIGVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCBldmVudHMsXG4gICAgICAgICAgZWxlbWVudE9yRGlyZWN0aXZlUmVmcywgZWxlbWVudFZhcnMpO1xuICAgICAgZWxlbWVudFZhcnMucHVzaCguLi5wYXJzZWRWYXJpYWJsZXMubWFwKHYgPT4gdC5WYXJpYWJsZUFzdC5mcm9tUGFyc2VkVmFyaWFibGUodikpKTtcblxuICAgICAgbGV0IHRlbXBsYXRlVmFsdWU6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgICBsZXQgdGVtcGxhdGVLZXk6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IHRoaXMuX25vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0ci5uYW1lKTtcblxuICAgICAgaWYgKG5vcm1hbGl6ZWROYW1lLnN0YXJ0c1dpdGgoVEVNUExBVEVfQVRUUl9QUkVGSVgpKSB7XG4gICAgICAgIHRlbXBsYXRlVmFsdWUgPSBhdHRyLnZhbHVlO1xuICAgICAgICB0ZW1wbGF0ZUtleSA9IG5vcm1hbGl6ZWROYW1lLnN1YnN0cmluZyhURU1QTEFURV9BVFRSX1BSRUZJWC5sZW5ndGgpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBoYXNUZW1wbGF0ZUJpbmRpbmcgPSB0ZW1wbGF0ZVZhbHVlICE9IG51bGw7XG4gICAgICBpZiAoaGFzVGVtcGxhdGVCaW5kaW5nKSB7XG4gICAgICAgIGlmIChoYXNJbmxpbmVUZW1wbGF0ZXMpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgYENhbid0IGhhdmUgbXVsdGlwbGUgdGVtcGxhdGUgYmluZGluZ3Mgb24gb25lIGVsZW1lbnQuIFVzZSBvbmx5IG9uZSBhdHRyaWJ1dGUgcHJlZml4ZWQgd2l0aCAqYCxcbiAgICAgICAgICAgICAgYXR0ci5zb3VyY2VTcGFuKTtcbiAgICAgICAgfVxuICAgICAgICBoYXNJbmxpbmVUZW1wbGF0ZXMgPSB0cnVlO1xuICAgICAgICBjb25zdCBwYXJzZWRWYXJpYWJsZXM6IFBhcnNlZFZhcmlhYmxlW10gPSBbXTtcbiAgICAgICAgdGhpcy5fYmluZGluZ1BhcnNlci5wYXJzZUlubGluZVRlbXBsYXRlQmluZGluZyhcbiAgICAgICAgICAgIHRlbXBsYXRlS2V5ICEsIHRlbXBsYXRlVmFsdWUgISwgYXR0ci5zb3VyY2VTcGFuLCB0ZW1wbGF0ZU1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgdGVtcGxhdGVFbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgcGFyc2VkVmFyaWFibGVzKTtcbiAgICAgICAgdGVtcGxhdGVFbGVtZW50VmFycy5wdXNoKC4uLnBhcnNlZFZhcmlhYmxlcy5tYXAodiA9PiB0LlZhcmlhYmxlQXN0LmZyb21QYXJzZWRWYXJpYWJsZSh2KSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWhhc0JpbmRpbmcgJiYgIWhhc1RlbXBsYXRlQmluZGluZykge1xuICAgICAgICAvLyBkb24ndCBpbmNsdWRlIHRoZSBiaW5kaW5ncyBhcyBhdHRyaWJ1dGVzIGFzIHdlbGwgaW4gdGhlIEFTVFxuICAgICAgICBhdHRycy5wdXNoKHRoaXMudmlzaXRBdHRyaWJ1dGUoYXR0ciwgbnVsbCkpO1xuICAgICAgICBtYXRjaGFibGVBdHRycy5wdXNoKFthdHRyLm5hbWUsIGF0dHIudmFsdWVdKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGVsZW1lbnRDc3NTZWxlY3RvciA9IGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3RvcihlbE5hbWUsIG1hdGNoYWJsZUF0dHJzKTtcbiAgICBjb25zdCB7ZGlyZWN0aXZlczogZGlyZWN0aXZlTWV0YXMsIG1hdGNoRWxlbWVudH0gPVxuICAgICAgICB0aGlzLl9wYXJzZURpcmVjdGl2ZXModGhpcy5zZWxlY3Rvck1hdGNoZXIsIGVsZW1lbnRDc3NTZWxlY3Rvcik7XG4gICAgY29uc3QgcmVmZXJlbmNlczogdC5SZWZlcmVuY2VBc3RbXSA9IFtdO1xuICAgIGNvbnN0IGJvdW5kRGlyZWN0aXZlUHJvcE5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgZGlyZWN0aXZlQXN0cyA9IHRoaXMuX2NyZWF0ZURpcmVjdGl2ZUFzdHMoXG4gICAgICAgIGlzVGVtcGxhdGVFbGVtZW50LCBlbGVtZW50Lm5hbWUsIGRpcmVjdGl2ZU1ldGFzLCBlbGVtZW50T3JEaXJlY3RpdmVQcm9wcyxcbiAgICAgICAgZWxlbWVudE9yRGlyZWN0aXZlUmVmcywgZWxlbWVudC5zb3VyY2VTcGFuICEsIHJlZmVyZW5jZXMsIGJvdW5kRGlyZWN0aXZlUHJvcE5hbWVzKTtcbiAgICBjb25zdCBlbGVtZW50UHJvcHM6IHQuQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSA9IHRoaXMuX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdHMoXG4gICAgICAgIGVsZW1lbnQubmFtZSwgZWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIGJvdW5kRGlyZWN0aXZlUHJvcE5hbWVzKTtcbiAgICBjb25zdCBpc1ZpZXdSb290ID0gcGFyZW50LmlzVGVtcGxhdGVFbGVtZW50IHx8IGhhc0lubGluZVRlbXBsYXRlcztcblxuICAgIGNvbnN0IHByb3ZpZGVyQ29udGV4dCA9IG5ldyBQcm92aWRlckVsZW1lbnRDb250ZXh0KFxuICAgICAgICB0aGlzLnByb3ZpZGVyVmlld0NvbnRleHQsIHBhcmVudC5wcm92aWRlckNvbnRleHQgISwgaXNWaWV3Um9vdCwgZGlyZWN0aXZlQXN0cywgYXR0cnMsXG4gICAgICAgIHJlZmVyZW5jZXMsIGlzVGVtcGxhdGVFbGVtZW50LCBxdWVyeVN0YXJ0SW5kZXgsIGVsZW1lbnQuc291cmNlU3BhbiAhKTtcblxuICAgIGNvbnN0IGNoaWxkcmVuOiB0LlRlbXBsYXRlQXN0W10gPSBodG1sLnZpc2l0QWxsKFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50Lm5vbkJpbmRhYmxlID8gTk9OX0JJTkRBQkxFX1ZJU0lUT1IgOiB0aGlzLCBlbGVtZW50LmNoaWxkcmVuLFxuICAgICAgICBFbGVtZW50Q29udGV4dC5jcmVhdGUoXG4gICAgICAgICAgICBpc1RlbXBsYXRlRWxlbWVudCwgZGlyZWN0aXZlQXN0cyxcbiAgICAgICAgICAgIGlzVGVtcGxhdGVFbGVtZW50ID8gcGFyZW50LnByb3ZpZGVyQ29udGV4dCAhIDogcHJvdmlkZXJDb250ZXh0KSk7XG4gICAgcHJvdmlkZXJDb250ZXh0LmFmdGVyRWxlbWVudCgpO1xuICAgIC8vIE92ZXJyaWRlIHRoZSBhY3R1YWwgc2VsZWN0b3Igd2hlbiB0aGUgYG5nUHJvamVjdEFzYCBhdHRyaWJ1dGUgaXMgcHJvdmlkZWRcbiAgICBjb25zdCBwcm9qZWN0aW9uU2VsZWN0b3IgPSBwcmVwYXJzZWRFbGVtZW50LnByb2plY3RBcyAhPSAnJyA/XG4gICAgICAgIENzc1NlbGVjdG9yLnBhcnNlKHByZXBhcnNlZEVsZW1lbnQucHJvamVjdEFzKVswXSA6XG4gICAgICAgIGVsZW1lbnRDc3NTZWxlY3RvcjtcbiAgICBjb25zdCBuZ0NvbnRlbnRJbmRleCA9IHBhcmVudC5maW5kTmdDb250ZW50SW5kZXgocHJvamVjdGlvblNlbGVjdG9yKSAhO1xuICAgIGxldCBwYXJzZWRFbGVtZW50OiB0LlRlbXBsYXRlQXN0O1xuXG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuTkdfQ09OVEVOVCkge1xuICAgICAgLy8gYDxuZy1jb250ZW50PmAgZWxlbWVudFxuICAgICAgaWYgKGVsZW1lbnQuY2hpbGRyZW4gJiYgIWVsZW1lbnQuY2hpbGRyZW4uZXZlcnkoX2lzRW1wdHlUZXh0Tm9kZSkpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYDxuZy1jb250ZW50PiBlbGVtZW50IGNhbm5vdCBoYXZlIGNvbnRlbnQuYCwgZWxlbWVudC5zb3VyY2VTcGFuICEpO1xuICAgICAgfVxuXG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IHQuTmdDb250ZW50QXN0KFxuICAgICAgICAgIHRoaXMubmdDb250ZW50Q291bnQrKywgaGFzSW5saW5lVGVtcGxhdGVzID8gbnVsbCAhIDogbmdDb250ZW50SW5kZXgsXG4gICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuICEpO1xuICAgIH0gZWxzZSBpZiAoaXNUZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgIC8vIGA8bmctdGVtcGxhdGU+YCBlbGVtZW50XG4gICAgICB0aGlzLl9hc3NlcnRBbGxFdmVudHNQdWJsaXNoZWRCeURpcmVjdGl2ZXMoZGlyZWN0aXZlQXN0cywgZXZlbnRzKTtcbiAgICAgIHRoaXMuX2Fzc2VydE5vQ29tcG9uZW50c05vckVsZW1lbnRCaW5kaW5nc09uVGVtcGxhdGUoXG4gICAgICAgICAgZGlyZWN0aXZlQXN0cywgZWxlbWVudFByb3BzLCBlbGVtZW50LnNvdXJjZVNwYW4gISk7XG5cbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgdC5FbWJlZGRlZFRlbXBsYXRlQXN0KFxuICAgICAgICAgIGF0dHJzLCBldmVudHMsIHJlZmVyZW5jZXMsIGVsZW1lbnRWYXJzLCBwcm92aWRlckNvbnRleHQudHJhbnNmb3JtZWREaXJlY3RpdmVBc3RzLFxuICAgICAgICAgIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1Qcm92aWRlcnMsIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZEhhc1ZpZXdDb250YWluZXIsXG4gICAgICAgICAgcHJvdmlkZXJDb250ZXh0LnF1ZXJ5TWF0Y2hlcywgY2hpbGRyZW4sIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgISA6IG5nQ29udGVudEluZGV4LFxuICAgICAgICAgIGVsZW1lbnQuc291cmNlU3BhbiAhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZWxlbWVudCBvdGhlciB0aGFuIGA8bmctY29udGVudD5gIGFuZCBgPG5nLXRlbXBsYXRlPmBcbiAgICAgIHRoaXMuX2Fzc2VydEVsZW1lbnRFeGlzdHMobWF0Y2hFbGVtZW50LCBlbGVtZW50KTtcbiAgICAgIHRoaXMuX2Fzc2VydE9ubHlPbmVDb21wb25lbnQoZGlyZWN0aXZlQXN0cywgZWxlbWVudC5zb3VyY2VTcGFuICEpO1xuXG4gICAgICBjb25zdCBuZ0NvbnRlbnRJbmRleCA9XG4gICAgICAgICAgaGFzSW5saW5lVGVtcGxhdGVzID8gbnVsbCA6IHBhcmVudC5maW5kTmdDb250ZW50SW5kZXgocHJvamVjdGlvblNlbGVjdG9yKTtcbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgdC5FbGVtZW50QXN0KFxuICAgICAgICAgIGVsTmFtZSwgYXR0cnMsIGVsZW1lbnRQcm9wcywgZXZlbnRzLCByZWZlcmVuY2VzLCBwcm92aWRlckNvbnRleHQudHJhbnNmb3JtZWREaXJlY3RpdmVBc3RzLFxuICAgICAgICAgIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1Qcm92aWRlcnMsIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZEhhc1ZpZXdDb250YWluZXIsXG4gICAgICAgICAgcHJvdmlkZXJDb250ZXh0LnF1ZXJ5TWF0Y2hlcywgY2hpbGRyZW4sIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBuZ0NvbnRlbnRJbmRleCxcbiAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4sIGVsZW1lbnQuZW5kU291cmNlU3BhbiB8fCBudWxsKTtcbiAgICB9XG5cbiAgICBpZiAoaGFzSW5saW5lVGVtcGxhdGVzKSB7XG4gICAgICAvLyBUaGUgZWxlbWVudCBhcyBhICotYXR0cmlidXRlXG4gICAgICBjb25zdCB0ZW1wbGF0ZVF1ZXJ5U3RhcnRJbmRleCA9IHRoaXMuY29udGVudFF1ZXJ5U3RhcnRJZDtcbiAgICAgIGNvbnN0IHRlbXBsYXRlU2VsZWN0b3IgPSBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3IoJ25nLXRlbXBsYXRlJywgdGVtcGxhdGVNYXRjaGFibGVBdHRycyk7XG4gICAgICBjb25zdCB7ZGlyZWN0aXZlc30gPSB0aGlzLl9wYXJzZURpcmVjdGl2ZXModGhpcy5zZWxlY3Rvck1hdGNoZXIsIHRlbXBsYXRlU2VsZWN0b3IpO1xuICAgICAgY29uc3QgdGVtcGxhdGVCb3VuZERpcmVjdGl2ZVByb3BOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgY29uc3QgdGVtcGxhdGVEaXJlY3RpdmVBc3RzID0gdGhpcy5fY3JlYXRlRGlyZWN0aXZlQXN0cyhcbiAgICAgICAgICB0cnVlLCBlbE5hbWUsIGRpcmVjdGl2ZXMsIHRlbXBsYXRlRWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIFtdLCBlbGVtZW50LnNvdXJjZVNwYW4gISwgW10sXG4gICAgICAgICAgdGVtcGxhdGVCb3VuZERpcmVjdGl2ZVByb3BOYW1lcyk7XG4gICAgICBjb25zdCB0ZW1wbGF0ZUVsZW1lbnRQcm9wczogdC5Cb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gdGhpcy5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhcbiAgICAgICAgICBlbE5hbWUsIHRlbXBsYXRlRWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIHRlbXBsYXRlQm91bmREaXJlY3RpdmVQcm9wTmFtZXMpO1xuICAgICAgdGhpcy5fYXNzZXJ0Tm9Db21wb25lbnRzTm9yRWxlbWVudEJpbmRpbmdzT25UZW1wbGF0ZShcbiAgICAgICAgICB0ZW1wbGF0ZURpcmVjdGl2ZUFzdHMsIHRlbXBsYXRlRWxlbWVudFByb3BzLCBlbGVtZW50LnNvdXJjZVNwYW4gISk7XG4gICAgICBjb25zdCB0ZW1wbGF0ZVByb3ZpZGVyQ29udGV4dCA9IG5ldyBQcm92aWRlckVsZW1lbnRDb250ZXh0KFxuICAgICAgICAgIHRoaXMucHJvdmlkZXJWaWV3Q29udGV4dCwgcGFyZW50LnByb3ZpZGVyQ29udGV4dCAhLCBwYXJlbnQuaXNUZW1wbGF0ZUVsZW1lbnQsXG4gICAgICAgICAgdGVtcGxhdGVEaXJlY3RpdmVBc3RzLCBbXSwgW10sIHRydWUsIHRlbXBsYXRlUXVlcnlTdGFydEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4gISk7XG4gICAgICB0ZW1wbGF0ZVByb3ZpZGVyQ29udGV4dC5hZnRlckVsZW1lbnQoKTtcblxuICAgICAgcGFyc2VkRWxlbWVudCA9IG5ldyB0LkVtYmVkZGVkVGVtcGxhdGVBc3QoXG4gICAgICAgICAgW10sIFtdLCBbXSwgdGVtcGxhdGVFbGVtZW50VmFycywgdGVtcGxhdGVQcm92aWRlckNvbnRleHQudHJhbnNmb3JtZWREaXJlY3RpdmVBc3RzLFxuICAgICAgICAgIHRlbXBsYXRlUHJvdmlkZXJDb250ZXh0LnRyYW5zZm9ybVByb3ZpZGVycyxcbiAgICAgICAgICB0ZW1wbGF0ZVByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZEhhc1ZpZXdDb250YWluZXIsIHRlbXBsYXRlUHJvdmlkZXJDb250ZXh0LnF1ZXJ5TWF0Y2hlcyxcbiAgICAgICAgICBbcGFyc2VkRWxlbWVudF0sIG5nQ29udGVudEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4gISk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlZEVsZW1lbnQ7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUF0dHIoXG4gICAgICBpc1RlbXBsYXRlRWxlbWVudDogYm9vbGVhbiwgYXR0cjogaHRtbC5BdHRyaWJ1dGUsIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgICAgdGFyZ2V0UHJvcHM6IFBhcnNlZFByb3BlcnR5W10sIHRhcmdldEV2ZW50czogdC5Cb3VuZEV2ZW50QXN0W10sXG4gICAgICB0YXJnZXRSZWZzOiBFbGVtZW50T3JEaXJlY3RpdmVSZWZbXSwgdGFyZ2V0VmFyczogdC5WYXJpYWJsZUFzdFtdKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbmFtZSA9IHRoaXMuX25vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0ci5uYW1lKTtcbiAgICBjb25zdCB2YWx1ZSA9IGF0dHIudmFsdWU7XG4gICAgY29uc3Qgc3JjU3BhbiA9IGF0dHIuc291cmNlU3BhbjtcblxuICAgIGNvbnN0IGJvdW5kRXZlbnRzOiBQYXJzZWRFdmVudFtdID0gW107XG4gICAgY29uc3QgYmluZFBhcnRzID0gbmFtZS5tYXRjaChCSU5EX05BTUVfUkVHRVhQKTtcbiAgICBsZXQgaGFzQmluZGluZyA9IGZhbHNlO1xuXG4gICAgaWYgKGJpbmRQYXJ0cyAhPT0gbnVsbCkge1xuICAgICAgaGFzQmluZGluZyA9IHRydWU7XG4gICAgICBpZiAoYmluZFBhcnRzW0tXX0JJTkRfSURYXSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VQcm9wZXJ0eUJpbmRpbmcoXG4gICAgICAgICAgICBiaW5kUGFydHNbSURFTlRfS1dfSURYXSwgdmFsdWUsIGZhbHNlLCBzcmNTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tLV19MRVRfSURYXSkge1xuICAgICAgICBpZiAoaXNUZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gYmluZFBhcnRzW0lERU5UX0tXX0lEWF07XG4gICAgICAgICAgdGhpcy5fcGFyc2VWYXJpYWJsZShpZGVudGlmaWVyLCB2YWx1ZSwgc3JjU3BhbiwgdGFyZ2V0VmFycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYFwibGV0LVwiIGlzIG9ubHkgc3VwcG9ydGVkIG9uIG5nLXRlbXBsYXRlIGVsZW1lbnRzLmAsIHNyY1NwYW4pO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0tXX1JFRl9JRFhdKSB7XG4gICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBiaW5kUGFydHNbSURFTlRfS1dfSURYXTtcbiAgICAgICAgdGhpcy5fcGFyc2VSZWZlcmVuY2UoaWRlbnRpZmllciwgdmFsdWUsIHNyY1NwYW4sIHRhcmdldFJlZnMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tLV19PTl9JRFhdKSB7XG4gICAgICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VFdmVudChcbiAgICAgICAgICAgIGJpbmRQYXJ0c1tJREVOVF9LV19JRFhdLCB2YWx1ZSwgc3JjU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIGJvdW5kRXZlbnRzKTtcblxuICAgICAgfSBlbHNlIGlmIChiaW5kUGFydHNbS1dfQklORE9OX0lEWF0pIHtcbiAgICAgICAgdGhpcy5fYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICAgIGJpbmRQYXJ0c1tJREVOVF9LV19JRFhdLCB2YWx1ZSwgZmFsc2UsIHNyY1NwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgICAgIHRoaXMuX3BhcnNlQXNzaWdubWVudEV2ZW50KFxuICAgICAgICAgICAgYmluZFBhcnRzW0lERU5UX0tXX0lEWF0sIHZhbHVlLCBzcmNTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycywgYm91bmRFdmVudHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tLV19BVF9JRFhdKSB7XG4gICAgICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VMaXRlcmFsQXR0cihcbiAgICAgICAgICAgIG5hbWUsIHZhbHVlLCBzcmNTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tJREVOVF9CQU5BTkFfQk9YX0lEWF0pIHtcbiAgICAgICAgdGhpcy5fYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICAgIGJpbmRQYXJ0c1tJREVOVF9CQU5BTkFfQk9YX0lEWF0sIHZhbHVlLCBmYWxzZSwgc3JjU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICB0YXJnZXRQcm9wcyk7XG4gICAgICAgIHRoaXMuX3BhcnNlQXNzaWdubWVudEV2ZW50KFxuICAgICAgICAgICAgYmluZFBhcnRzW0lERU5UX0JBTkFOQV9CT1hfSURYXSwgdmFsdWUsIHNyY1NwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLCBib3VuZEV2ZW50cyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0lERU5UX1BST1BFUlRZX0lEWF0pIHtcbiAgICAgICAgdGhpcy5fYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICAgIGJpbmRQYXJ0c1tJREVOVF9QUk9QRVJUWV9JRFhdLCB2YWx1ZSwgZmFsc2UsIHNyY1NwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgdGFyZ2V0UHJvcHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tJREVOVF9FVkVOVF9JRFhdKSB7XG4gICAgICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VFdmVudChcbiAgICAgICAgICAgIGJpbmRQYXJ0c1tJREVOVF9FVkVOVF9JRFhdLCB2YWx1ZSwgc3JjU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIGJvdW5kRXZlbnRzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaGFzQmluZGluZyA9IHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VQcm9wZXJ0eUludGVycG9sYXRpb24oXG4gICAgICAgICAgbmFtZSwgdmFsdWUsIHNyY1NwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgfVxuXG4gICAgaWYgKCFoYXNCaW5kaW5nKSB7XG4gICAgICB0aGlzLl9iaW5kaW5nUGFyc2VyLnBhcnNlTGl0ZXJhbEF0dHIobmFtZSwgdmFsdWUsIHNyY1NwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgfVxuXG4gICAgdGFyZ2V0RXZlbnRzLnB1c2goLi4uYm91bmRFdmVudHMubWFwKGUgPT4gdC5Cb3VuZEV2ZW50QXN0LmZyb21QYXJzZWRFdmVudChlKSkpO1xuXG4gICAgcmV0dXJuIGhhc0JpbmRpbmc7XG4gIH1cblxuICBwcml2YXRlIF9ub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHJOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiAvXmRhdGEtL2kudGVzdChhdHRyTmFtZSkgPyBhdHRyTmFtZS5zdWJzdHJpbmcoNSkgOiBhdHRyTmFtZTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlVmFyaWFibGUoXG4gICAgICBpZGVudGlmaWVyOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgdGFyZ2V0VmFyczogdC5WYXJpYWJsZUFzdFtdKSB7XG4gICAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBcIi1cIiBpcyBub3QgYWxsb3dlZCBpbiB2YXJpYWJsZSBuYW1lc2AsIHNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIHRhcmdldFZhcnMucHVzaChuZXcgdC5WYXJpYWJsZUFzdChpZGVudGlmaWVyLCB2YWx1ZSwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VSZWZlcmVuY2UoXG4gICAgICBpZGVudGlmaWVyOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHRhcmdldFJlZnM6IEVsZW1lbnRPckRpcmVjdGl2ZVJlZltdKSB7XG4gICAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBcIi1cIiBpcyBub3QgYWxsb3dlZCBpbiByZWZlcmVuY2UgbmFtZXNgLCBzb3VyY2VTcGFuKTtcbiAgICB9XG5cbiAgICB0YXJnZXRSZWZzLnB1c2gobmV3IEVsZW1lbnRPckRpcmVjdGl2ZVJlZihpZGVudGlmaWVyLCB2YWx1ZSwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VBc3NpZ25tZW50RXZlbnQoXG4gICAgICBuYW1lOiBzdHJpbmcsIGV4cHJlc3Npb246IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sIHRhcmdldEV2ZW50czogUGFyc2VkRXZlbnRbXSkge1xuICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VFdmVudChcbiAgICAgICAgYCR7bmFtZX1DaGFuZ2VgLCBgJHtleHByZXNzaW9ufT0kZXZlbnRgLCBzb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0RXZlbnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlRGlyZWN0aXZlcyhzZWxlY3Rvck1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlciwgZWxlbWVudENzc1NlbGVjdG9yOiBDc3NTZWxlY3Rvcik6XG4gICAgICB7ZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnlbXSwgbWF0Y2hFbGVtZW50OiBib29sZWFufSB7XG4gICAgLy8gTmVlZCB0byBzb3J0IHRoZSBkaXJlY3RpdmVzIHNvIHRoYXQgd2UgZ2V0IGNvbnNpc3RlbnQgcmVzdWx0cyB0aHJvdWdob3V0LFxuICAgIC8vIGFzIHNlbGVjdG9yTWF0Y2hlciB1c2VzIE1hcHMgaW5zaWRlLlxuICAgIC8vIEFsc28gZGVkdXBsaWNhdGUgZGlyZWN0aXZlcyBhcyB0aGV5IG1pZ2h0IG1hdGNoIG1vcmUgdGhhbiBvbmUgdGltZSFcbiAgICBjb25zdCBkaXJlY3RpdmVzID0gbmV3IEFycmF5KHRoaXMuZGlyZWN0aXZlc0luZGV4LnNpemUpO1xuICAgIC8vIFdoZXRoZXIgYW55IGRpcmVjdGl2ZSBzZWxlY3RvciBtYXRjaGVzIG9uIHRoZSBlbGVtZW50IG5hbWVcbiAgICBsZXQgbWF0Y2hFbGVtZW50ID0gZmFsc2U7XG5cbiAgICBzZWxlY3Rvck1hdGNoZXIubWF0Y2goZWxlbWVudENzc1NlbGVjdG9yLCAoc2VsZWN0b3IsIGRpcmVjdGl2ZSkgPT4ge1xuICAgICAgZGlyZWN0aXZlc1t0aGlzLmRpcmVjdGl2ZXNJbmRleC5nZXQoZGlyZWN0aXZlKSAhXSA9IGRpcmVjdGl2ZTtcbiAgICAgIG1hdGNoRWxlbWVudCA9IG1hdGNoRWxlbWVudCB8fCBzZWxlY3Rvci5oYXNFbGVtZW50U2VsZWN0b3IoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBkaXJlY3RpdmVzOiBkaXJlY3RpdmVzLmZpbHRlcihkaXIgPT4gISFkaXIpLFxuICAgICAgbWF0Y2hFbGVtZW50LFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVBc3RzKFxuICAgICAgaXNUZW1wbGF0ZUVsZW1lbnQ6IGJvb2xlYW4sIGVsZW1lbnROYW1lOiBzdHJpbmcsIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5W10sXG4gICAgICBwcm9wczogUGFyc2VkUHJvcGVydHlbXSwgZWxlbWVudE9yRGlyZWN0aXZlUmVmczogRWxlbWVudE9yRGlyZWN0aXZlUmVmW10sXG4gICAgICBlbGVtZW50U291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCB0YXJnZXRSZWZlcmVuY2VzOiB0LlJlZmVyZW5jZUFzdFtdLFxuICAgICAgdGFyZ2V0Qm91bmREaXJlY3RpdmVQcm9wTmFtZXM6IFNldDxzdHJpbmc+KTogdC5EaXJlY3RpdmVBc3RbXSB7XG4gICAgY29uc3QgbWF0Y2hlZFJlZmVyZW5jZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBsZXQgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSA9IG51bGwgITtcblxuICAgIGNvbnN0IGRpcmVjdGl2ZUFzdHMgPSBkaXJlY3RpdmVzLm1hcCgoZGlyZWN0aXZlKSA9PiB7XG4gICAgICBjb25zdCBzb3VyY2VTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgICAgICBlbGVtZW50U291cmNlU3Bhbi5zdGFydCwgZWxlbWVudFNvdXJjZVNwYW4uZW5kLFxuICAgICAgICAgIGBEaXJlY3RpdmUgJHtpZGVudGlmaWVyTmFtZShkaXJlY3RpdmUudHlwZSl9YCk7XG5cbiAgICAgIGlmIChkaXJlY3RpdmUuaXNDb21wb25lbnQpIHtcbiAgICAgICAgY29tcG9uZW50ID0gZGlyZWN0aXZlO1xuICAgICAgfVxuICAgICAgY29uc3QgZGlyZWN0aXZlUHJvcGVydGllczogdC5Cb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0W10gPSBbXTtcbiAgICAgIGNvbnN0IGJvdW5kUHJvcGVydGllcyA9XG4gICAgICAgICAgdGhpcy5fYmluZGluZ1BhcnNlci5jcmVhdGVEaXJlY3RpdmVIb3N0UHJvcGVydHlBc3RzKGRpcmVjdGl2ZSwgZWxlbWVudE5hbWUsIHNvdXJjZVNwYW4pICE7XG5cbiAgICAgIGxldCBob3N0UHJvcGVydGllcyA9XG4gICAgICAgICAgYm91bmRQcm9wZXJ0aWVzLm1hcChwcm9wID0+IHQuQm91bmRFbGVtZW50UHJvcGVydHlBc3QuZnJvbUJvdW5kUHJvcGVydHkocHJvcCkpO1xuICAgICAgLy8gTm90ZTogV2UgbmVlZCB0byBjaGVjayB0aGUgaG9zdCBwcm9wZXJ0aWVzIGhlcmUgYXMgd2VsbCxcbiAgICAgIC8vIGFzIHdlIGRvbid0IGtub3cgdGhlIGVsZW1lbnQgbmFtZSBpbiB0aGUgRGlyZWN0aXZlV3JhcHBlckNvbXBpbGVyIHlldC5cbiAgICAgIGhvc3RQcm9wZXJ0aWVzID0gdGhpcy5fY2hlY2tQcm9wZXJ0aWVzSW5TY2hlbWEoZWxlbWVudE5hbWUsIGhvc3RQcm9wZXJ0aWVzKTtcbiAgICAgIGNvbnN0IHBhcnNlZEV2ZW50cyA9XG4gICAgICAgICAgdGhpcy5fYmluZGluZ1BhcnNlci5jcmVhdGVEaXJlY3RpdmVIb3N0RXZlbnRBc3RzKGRpcmVjdGl2ZSwgc291cmNlU3BhbikgITtcbiAgICAgIHRoaXMuX2NyZWF0ZURpcmVjdGl2ZVByb3BlcnR5QXN0cyhcbiAgICAgICAgICBkaXJlY3RpdmUuaW5wdXRzLCBwcm9wcywgZGlyZWN0aXZlUHJvcGVydGllcywgdGFyZ2V0Qm91bmREaXJlY3RpdmVQcm9wTmFtZXMpO1xuICAgICAgZWxlbWVudE9yRGlyZWN0aXZlUmVmcy5mb3JFYWNoKChlbE9yRGlyUmVmKSA9PiB7XG4gICAgICAgIGlmICgoZWxPckRpclJlZi52YWx1ZS5sZW5ndGggPT09IDAgJiYgZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB8fFxuICAgICAgICAgICAgKGVsT3JEaXJSZWYuaXNSZWZlcmVuY2VUb0RpcmVjdGl2ZShkaXJlY3RpdmUpKSkge1xuICAgICAgICAgIHRhcmdldFJlZmVyZW5jZXMucHVzaChuZXcgdC5SZWZlcmVuY2VBc3QoXG4gICAgICAgICAgICAgIGVsT3JEaXJSZWYubmFtZSwgY3JlYXRlVG9rZW5Gb3JSZWZlcmVuY2UoZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlKSwgZWxPckRpclJlZi52YWx1ZSxcbiAgICAgICAgICAgICAgZWxPckRpclJlZi5zb3VyY2VTcGFuKSk7XG4gICAgICAgICAgbWF0Y2hlZFJlZmVyZW5jZXMuYWRkKGVsT3JEaXJSZWYubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3QgaG9zdEV2ZW50cyA9IHBhcnNlZEV2ZW50cy5tYXAoZSA9PiB0LkJvdW5kRXZlbnRBc3QuZnJvbVBhcnNlZEV2ZW50KGUpKTtcbiAgICAgIGNvbnN0IGNvbnRlbnRRdWVyeVN0YXJ0SWQgPSB0aGlzLmNvbnRlbnRRdWVyeVN0YXJ0SWQ7XG4gICAgICB0aGlzLmNvbnRlbnRRdWVyeVN0YXJ0SWQgKz0gZGlyZWN0aXZlLnF1ZXJpZXMubGVuZ3RoO1xuICAgICAgcmV0dXJuIG5ldyB0LkRpcmVjdGl2ZUFzdChcbiAgICAgICAgICBkaXJlY3RpdmUsIGRpcmVjdGl2ZVByb3BlcnRpZXMsIGhvc3RQcm9wZXJ0aWVzLCBob3N0RXZlbnRzLCBjb250ZW50UXVlcnlTdGFydElkLFxuICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgIH0pO1xuXG4gICAgZWxlbWVudE9yRGlyZWN0aXZlUmVmcy5mb3JFYWNoKChlbE9yRGlyUmVmKSA9PiB7XG4gICAgICBpZiAoZWxPckRpclJlZi52YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmICghbWF0Y2hlZFJlZmVyZW5jZXMuaGFzKGVsT3JEaXJSZWYubmFtZSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgYFRoZXJlIGlzIG5vIGRpcmVjdGl2ZSB3aXRoIFwiZXhwb3J0QXNcIiBzZXQgdG8gXCIke2VsT3JEaXJSZWYudmFsdWV9XCJgLFxuICAgICAgICAgICAgICBlbE9yRGlyUmVmLnNvdXJjZVNwYW4pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgICAgbGV0IHJlZlRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSA9IG51bGwgITtcbiAgICAgICAgaWYgKGlzVGVtcGxhdGVFbGVtZW50KSB7XG4gICAgICAgICAgcmVmVG9rZW4gPSBjcmVhdGVUb2tlbkZvckV4dGVybmFsUmVmZXJlbmNlKHRoaXMucmVmbGVjdG9yLCBJZGVudGlmaWVycy5UZW1wbGF0ZVJlZik7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0UmVmZXJlbmNlcy5wdXNoKFxuICAgICAgICAgICAgbmV3IHQuUmVmZXJlbmNlQXN0KGVsT3JEaXJSZWYubmFtZSwgcmVmVG9rZW4sIGVsT3JEaXJSZWYudmFsdWUsIGVsT3JEaXJSZWYuc291cmNlU3BhbikpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkaXJlY3RpdmVBc3RzO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRGlyZWN0aXZlUHJvcGVydHlBc3RzKFxuICAgICAgZGlyZWN0aXZlUHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sIGJvdW5kUHJvcHM6IFBhcnNlZFByb3BlcnR5W10sXG4gICAgICB0YXJnZXRCb3VuZERpcmVjdGl2ZVByb3BzOiB0LkJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3RbXSxcbiAgICAgIHRhcmdldEJvdW5kRGlyZWN0aXZlUHJvcE5hbWVzOiBTZXQ8c3RyaW5nPikge1xuICAgIGlmIChkaXJlY3RpdmVQcm9wZXJ0aWVzKSB7XG4gICAgICBjb25zdCBib3VuZFByb3BzQnlOYW1lID0gbmV3IE1hcDxzdHJpbmcsIFBhcnNlZFByb3BlcnR5PigpO1xuICAgICAgYm91bmRQcm9wcy5mb3JFYWNoKGJvdW5kUHJvcCA9PiB7XG4gICAgICAgIGNvbnN0IHByZXZWYWx1ZSA9IGJvdW5kUHJvcHNCeU5hbWUuZ2V0KGJvdW5kUHJvcC5uYW1lKTtcbiAgICAgICAgaWYgKCFwcmV2VmFsdWUgfHwgcHJldlZhbHVlLmlzTGl0ZXJhbCkge1xuICAgICAgICAgIC8vIGdpdmUgW2FdPVwiYlwiIGEgaGlnaGVyIHByZWNlZGVuY2UgdGhhbiBhPVwiYlwiIG9uIHRoZSBzYW1lIGVsZW1lbnRcbiAgICAgICAgICBib3VuZFByb3BzQnlOYW1lLnNldChib3VuZFByb3AubmFtZSwgYm91bmRQcm9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIE9iamVjdC5rZXlzKGRpcmVjdGl2ZVByb3BlcnRpZXMpLmZvckVhY2goZGlyUHJvcCA9PiB7XG4gICAgICAgIGNvbnN0IGVsUHJvcCA9IGRpcmVjdGl2ZVByb3BlcnRpZXNbZGlyUHJvcF07XG4gICAgICAgIGNvbnN0IGJvdW5kUHJvcCA9IGJvdW5kUHJvcHNCeU5hbWUuZ2V0KGVsUHJvcCk7XG5cbiAgICAgICAgLy8gQmluZGluZ3MgYXJlIG9wdGlvbmFsLCBzbyB0aGlzIGJpbmRpbmcgb25seSBuZWVkcyB0byBiZSBzZXQgdXAgaWYgYW4gZXhwcmVzc2lvbiBpcyBnaXZlbi5cbiAgICAgICAgaWYgKGJvdW5kUHJvcCkge1xuICAgICAgICAgIHRhcmdldEJvdW5kRGlyZWN0aXZlUHJvcE5hbWVzLmFkZChib3VuZFByb3AubmFtZSk7XG4gICAgICAgICAgaWYgKCFpc0VtcHR5RXhwcmVzc2lvbihib3VuZFByb3AuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICAgIHRhcmdldEJvdW5kRGlyZWN0aXZlUHJvcHMucHVzaChuZXcgdC5Cb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0KFxuICAgICAgICAgICAgICAgIGRpclByb3AsIGJvdW5kUHJvcC5uYW1lLCBib3VuZFByb3AuZXhwcmVzc2lvbiwgYm91bmRQcm9wLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdHMoXG4gICAgICBlbGVtZW50TmFtZTogc3RyaW5nLCBwcm9wczogUGFyc2VkUHJvcGVydHlbXSxcbiAgICAgIGJvdW5kRGlyZWN0aXZlUHJvcE5hbWVzOiBTZXQ8c3RyaW5nPik6IHQuQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSB7XG4gICAgY29uc3QgYm91bmRFbGVtZW50UHJvcHM6IHQuQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSA9IFtdO1xuXG4gICAgcHJvcHMuZm9yRWFjaCgocHJvcDogUGFyc2VkUHJvcGVydHkpID0+IHtcbiAgICAgIGlmICghcHJvcC5pc0xpdGVyYWwgJiYgIWJvdW5kRGlyZWN0aXZlUHJvcE5hbWVzLmhhcyhwcm9wLm5hbWUpKSB7XG4gICAgICAgIGNvbnN0IGJvdW5kUHJvcCA9IHRoaXMuX2JpbmRpbmdQYXJzZXIuY3JlYXRlQm91bmRFbGVtZW50UHJvcGVydHkoZWxlbWVudE5hbWUsIHByb3ApO1xuICAgICAgICBib3VuZEVsZW1lbnRQcm9wcy5wdXNoKHQuQm91bmRFbGVtZW50UHJvcGVydHlBc3QuZnJvbUJvdW5kUHJvcGVydHkoYm91bmRQcm9wKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX2NoZWNrUHJvcGVydGllc0luU2NoZW1hKGVsZW1lbnROYW1lLCBib3VuZEVsZW1lbnRQcm9wcyk7XG4gIH1cblxuICBwcml2YXRlIF9maW5kQ29tcG9uZW50RGlyZWN0aXZlcyhkaXJlY3RpdmVzOiB0LkRpcmVjdGl2ZUFzdFtdKTogdC5EaXJlY3RpdmVBc3RbXSB7XG4gICAgcmV0dXJuIGRpcmVjdGl2ZXMuZmlsdGVyKGRpcmVjdGl2ZSA9PiBkaXJlY3RpdmUuZGlyZWN0aXZlLmlzQ29tcG9uZW50KTtcbiAgfVxuXG4gIHByaXZhdGUgX2ZpbmRDb21wb25lbnREaXJlY3RpdmVOYW1lcyhkaXJlY3RpdmVzOiB0LkRpcmVjdGl2ZUFzdFtdKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLl9maW5kQ29tcG9uZW50RGlyZWN0aXZlcyhkaXJlY3RpdmVzKVxuICAgICAgICAubWFwKGRpcmVjdGl2ZSA9PiBpZGVudGlmaWVyTmFtZShkaXJlY3RpdmUuZGlyZWN0aXZlLnR5cGUpICEpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXNzZXJ0T25seU9uZUNvbXBvbmVudChkaXJlY3RpdmVzOiB0LkRpcmVjdGl2ZUFzdFtdLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICBjb25zdCBjb21wb25lbnRUeXBlTmFtZXMgPSB0aGlzLl9maW5kQ29tcG9uZW50RGlyZWN0aXZlTmFtZXMoZGlyZWN0aXZlcyk7XG4gICAgaWYgKGNvbXBvbmVudFR5cGVOYW1lcy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBgTW9yZSB0aGFuIG9uZSBjb21wb25lbnQgbWF0Y2hlZCBvbiB0aGlzIGVsZW1lbnQuXFxuYCArXG4gICAgICAgICAgICAgIGBNYWtlIHN1cmUgdGhhdCBvbmx5IG9uZSBjb21wb25lbnQncyBzZWxlY3RvciBjYW4gbWF0Y2ggYSBnaXZlbiBlbGVtZW50LlxcbmAgK1xuICAgICAgICAgICAgICBgQ29uZmxpY3RpbmcgY29tcG9uZW50czogJHtjb21wb25lbnRUeXBlTmFtZXMuam9pbignLCcpfWAsXG4gICAgICAgICAgc291cmNlU3Bhbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1ha2Ugc3VyZSB0aGF0IG5vbi1hbmd1bGFyIHRhZ3MgY29uZm9ybSB0byB0aGUgc2NoZW1hcy5cbiAgICpcbiAgICogTm90ZTogQW4gZWxlbWVudCBpcyBjb25zaWRlcmVkIGFuIGFuZ3VsYXIgdGFnIHdoZW4gYXQgbGVhc3Qgb25lIGRpcmVjdGl2ZSBzZWxlY3RvciBtYXRjaGVzIHRoZVxuICAgKiB0YWcgbmFtZS5cbiAgICpcbiAgICogQHBhcmFtIG1hdGNoRWxlbWVudCBXaGV0aGVyIGFueSBkaXJlY3RpdmUgaGFzIG1hdGNoZWQgb24gdGhlIHRhZyBuYW1lXG4gICAqIEBwYXJhbSBlbGVtZW50IHRoZSBodG1sIGVsZW1lbnRcbiAgICovXG4gIHByaXZhdGUgX2Fzc2VydEVsZW1lbnRFeGlzdHMobWF0Y2hFbGVtZW50OiBib29sZWFuLCBlbGVtZW50OiBodG1sLkVsZW1lbnQpIHtcbiAgICBjb25zdCBlbE5hbWUgPSBlbGVtZW50Lm5hbWUucmVwbGFjZSgvXjp4aHRtbDovLCAnJyk7XG5cbiAgICBpZiAoIW1hdGNoRWxlbWVudCAmJiAhdGhpcy5fc2NoZW1hUmVnaXN0cnkuaGFzRWxlbWVudChlbE5hbWUsIHRoaXMuX3NjaGVtYXMpKSB7XG4gICAgICBsZXQgZXJyb3JNc2cgPSBgJyR7ZWxOYW1lfScgaXMgbm90IGEga25vd24gZWxlbWVudDpcXG5gO1xuICAgICAgZXJyb3JNc2cgKz1cbiAgICAgICAgICBgMS4gSWYgJyR7ZWxOYW1lfScgaXMgYW4gQW5ndWxhciBjb21wb25lbnQsIHRoZW4gdmVyaWZ5IHRoYXQgaXQgaXMgcGFydCBvZiB0aGlzIG1vZHVsZS5cXG5gO1xuICAgICAgaWYgKGVsTmFtZS5pbmRleE9mKCctJykgPiAtMSkge1xuICAgICAgICBlcnJvck1zZyArPVxuICAgICAgICAgICAgYDIuIElmICcke2VsTmFtZX0nIGlzIGEgV2ViIENvbXBvbmVudCB0aGVuIGFkZCAnQ1VTVE9NX0VMRU1FTlRTX1NDSEVNQScgdG8gdGhlICdATmdNb2R1bGUuc2NoZW1hcycgb2YgdGhpcyBjb21wb25lbnQgdG8gc3VwcHJlc3MgdGhpcyBtZXNzYWdlLmA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnJvck1zZyArPVxuICAgICAgICAgICAgYDIuIFRvIGFsbG93IGFueSBlbGVtZW50IGFkZCAnTk9fRVJST1JTX1NDSEVNQScgdG8gdGhlICdATmdNb2R1bGUuc2NoZW1hcycgb2YgdGhpcyBjb21wb25lbnQuYDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGVycm9yTXNnLCBlbGVtZW50LnNvdXJjZVNwYW4gISk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXNzZXJ0Tm9Db21wb25lbnRzTm9yRWxlbWVudEJpbmRpbmdzT25UZW1wbGF0ZShcbiAgICAgIGRpcmVjdGl2ZXM6IHQuRGlyZWN0aXZlQXN0W10sIGVsZW1lbnRQcm9wczogdC5Cb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdLFxuICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgY29uc3QgY29tcG9uZW50VHlwZU5hbWVzOiBzdHJpbmdbXSA9IHRoaXMuX2ZpbmRDb21wb25lbnREaXJlY3RpdmVOYW1lcyhkaXJlY3RpdmVzKTtcbiAgICBpZiAoY29tcG9uZW50VHlwZU5hbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIGBDb21wb25lbnRzIG9uIGFuIGVtYmVkZGVkIHRlbXBsYXRlOiAke2NvbXBvbmVudFR5cGVOYW1lcy5qb2luKCcsJyl9YCwgc291cmNlU3Bhbik7XG4gICAgfVxuICAgIGVsZW1lbnRQcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgYFByb3BlcnR5IGJpbmRpbmcgJHtwcm9wLm5hbWV9IG5vdCB1c2VkIGJ5IGFueSBkaXJlY3RpdmUgb24gYW4gZW1iZWRkZWQgdGVtcGxhdGUuIE1ha2Ugc3VyZSB0aGF0IHRoZSBwcm9wZXJ0eSBuYW1lIGlzIHNwZWxsZWQgY29ycmVjdGx5IGFuZCBhbGwgZGlyZWN0aXZlcyBhcmUgbGlzdGVkIGluIHRoZSBcIkBOZ01vZHVsZS5kZWNsYXJhdGlvbnNcIi5gLFxuICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXNzZXJ0QWxsRXZlbnRzUHVibGlzaGVkQnlEaXJlY3RpdmVzKFxuICAgICAgZGlyZWN0aXZlczogdC5EaXJlY3RpdmVBc3RbXSwgZXZlbnRzOiB0LkJvdW5kRXZlbnRBc3RbXSkge1xuICAgIGNvbnN0IGFsbERpcmVjdGl2ZUV2ZW50cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gICAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpcmVjdGl2ZSA9PiB7XG4gICAgICBPYmplY3Qua2V5cyhkaXJlY3RpdmUuZGlyZWN0aXZlLm91dHB1dHMpLmZvckVhY2goayA9PiB7XG4gICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IGRpcmVjdGl2ZS5kaXJlY3RpdmUub3V0cHV0c1trXTtcbiAgICAgICAgYWxsRGlyZWN0aXZlRXZlbnRzLmFkZChldmVudE5hbWUpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9IG51bGwgfHwgIWFsbERpcmVjdGl2ZUV2ZW50cy5oYXMoZXZlbnQubmFtZSkpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICBgRXZlbnQgYmluZGluZyAke2V2ZW50LmZ1bGxOYW1lfSBub3QgZW1pdHRlZCBieSBhbnkgZGlyZWN0aXZlIG9uIGFuIGVtYmVkZGVkIHRlbXBsYXRlLiBNYWtlIHN1cmUgdGhhdCB0aGUgZXZlbnQgbmFtZSBpcyBzcGVsbGVkIGNvcnJlY3RseSBhbmQgYWxsIGRpcmVjdGl2ZXMgYXJlIGxpc3RlZCBpbiB0aGUgXCJATmdNb2R1bGUuZGVjbGFyYXRpb25zXCIuYCxcbiAgICAgICAgICAgIGV2ZW50LnNvdXJjZVNwYW4pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tQcm9wZXJ0aWVzSW5TY2hlbWEoZWxlbWVudE5hbWU6IHN0cmluZywgYm91bmRQcm9wczogdC5Cb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdKTpcbiAgICAgIHQuQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSB7XG4gICAgLy8gTm90ZTogV2UgY2FuJ3QgZmlsdGVyIG91dCBlbXB0eSBleHByZXNzaW9ucyBiZWZvcmUgdGhpcyBtZXRob2QsXG4gICAgLy8gYXMgd2Ugc3RpbGwgd2FudCB0byB2YWxpZGF0ZSB0aGVtIVxuICAgIHJldHVybiBib3VuZFByb3BzLmZpbHRlcigoYm91bmRQcm9wKSA9PiB7XG4gICAgICBpZiAoYm91bmRQcm9wLnR5cGUgPT09IHQuUHJvcGVydHlCaW5kaW5nVHlwZS5Qcm9wZXJ0eSAmJlxuICAgICAgICAgICF0aGlzLl9zY2hlbWFSZWdpc3RyeS5oYXNQcm9wZXJ0eShlbGVtZW50TmFtZSwgYm91bmRQcm9wLm5hbWUsIHRoaXMuX3NjaGVtYXMpKSB7XG4gICAgICAgIGxldCBlcnJvck1zZyA9XG4gICAgICAgICAgICBgQ2FuJ3QgYmluZCB0byAnJHtib3VuZFByb3AubmFtZX0nIHNpbmNlIGl0IGlzbid0IGEga25vd24gcHJvcGVydHkgb2YgJyR7ZWxlbWVudE5hbWV9Jy5gO1xuICAgICAgICBpZiAoZWxlbWVudE5hbWUuc3RhcnRzV2l0aCgnbmctJykpIHtcbiAgICAgICAgICBlcnJvck1zZyArPVxuICAgICAgICAgICAgICBgXFxuMS4gSWYgJyR7Ym91bmRQcm9wLm5hbWV9JyBpcyBhbiBBbmd1bGFyIGRpcmVjdGl2ZSwgdGhlbiBhZGQgJ0NvbW1vbk1vZHVsZScgdG8gdGhlICdATmdNb2R1bGUuaW1wb3J0cycgb2YgdGhpcyBjb21wb25lbnQuYCArXG4gICAgICAgICAgICAgIGBcXG4yLiBUbyBhbGxvdyBhbnkgcHJvcGVydHkgYWRkICdOT19FUlJPUlNfU0NIRU1BJyB0byB0aGUgJ0BOZ01vZHVsZS5zY2hlbWFzJyBvZiB0aGlzIGNvbXBvbmVudC5gO1xuICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnROYW1lLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICAgICAgZXJyb3JNc2cgKz1cbiAgICAgICAgICAgICAgYFxcbjEuIElmICcke2VsZW1lbnROYW1lfScgaXMgYW4gQW5ndWxhciBjb21wb25lbnQgYW5kIGl0IGhhcyAnJHtib3VuZFByb3AubmFtZX0nIGlucHV0LCB0aGVuIHZlcmlmeSB0aGF0IGl0IGlzIHBhcnQgb2YgdGhpcyBtb2R1bGUuYCArXG4gICAgICAgICAgICAgIGBcXG4yLiBJZiAnJHtlbGVtZW50TmFtZX0nIGlzIGEgV2ViIENvbXBvbmVudCB0aGVuIGFkZCAnQ1VTVE9NX0VMRU1FTlRTX1NDSEVNQScgdG8gdGhlICdATmdNb2R1bGUuc2NoZW1hcycgb2YgdGhpcyBjb21wb25lbnQgdG8gc3VwcHJlc3MgdGhpcyBtZXNzYWdlLmAgK1xuICAgICAgICAgICAgICBgXFxuMy4gVG8gYWxsb3cgYW55IHByb3BlcnR5IGFkZCAnTk9fRVJST1JTX1NDSEVNQScgdG8gdGhlICdATmdNb2R1bGUuc2NoZW1hcycgb2YgdGhpcyBjb21wb25lbnQuYDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihlcnJvck1zZywgYm91bmRQcm9wLnNvdXJjZVNwYW4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuICFpc0VtcHR5RXhwcmVzc2lvbihib3VuZFByb3AudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwb3J0RXJyb3IoXG4gICAgICBtZXNzYWdlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIGxldmVsOiBQYXJzZUVycm9yTGV2ZWwgPSBQYXJzZUVycm9yTGV2ZWwuRVJST1IpIHtcbiAgICB0aGlzLl90YXJnZXRFcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihzb3VyY2VTcGFuLCBtZXNzYWdlLCBsZXZlbCkpO1xuICB9XG59XG5cbmNsYXNzIE5vbkJpbmRhYmxlVmlzaXRvciBpbXBsZW1lbnRzIGh0bWwuVmlzaXRvciB7XG4gIHZpc2l0RWxlbWVudChhc3Q6IGh0bWwuRWxlbWVudCwgcGFyZW50OiBFbGVtZW50Q29udGV4dCk6IHQuRWxlbWVudEFzdHxudWxsIHtcbiAgICBjb25zdCBwcmVwYXJzZWRFbGVtZW50ID0gcHJlcGFyc2VFbGVtZW50KGFzdCk7XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU0NSSVBUIHx8XG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEUgfHxcbiAgICAgICAgcHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRVNIRUVUKSB7XG4gICAgICAvLyBTa2lwcGluZyA8c2NyaXB0PiBmb3Igc2VjdXJpdHkgcmVhc29uc1xuICAgICAgLy8gU2tpcHBpbmcgPHN0eWxlPiBhbmQgc3R5bGVzaGVldHMgYXMgd2UgYWxyZWFkeSBwcm9jZXNzZWQgdGhlbVxuICAgICAgLy8gaW4gdGhlIFN0eWxlQ29tcGlsZXJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGF0dHJOYW1lQW5kVmFsdWVzID0gYXN0LmF0dHJzLm1hcCgoYXR0cik6IFtzdHJpbmcsIHN0cmluZ10gPT4gW2F0dHIubmFtZSwgYXR0ci52YWx1ZV0pO1xuICAgIGNvbnN0IHNlbGVjdG9yID0gY3JlYXRlRWxlbWVudENzc1NlbGVjdG9yKGFzdC5uYW1lLCBhdHRyTmFtZUFuZFZhbHVlcyk7XG4gICAgY29uc3QgbmdDb250ZW50SW5kZXggPSBwYXJlbnQuZmluZE5nQ29udGVudEluZGV4KHNlbGVjdG9yKTtcbiAgICBjb25zdCBjaGlsZHJlbjogdC5UZW1wbGF0ZUFzdFtdID0gaHRtbC52aXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4sIEVNUFRZX0VMRU1FTlRfQ09OVEVYVCk7XG4gICAgcmV0dXJuIG5ldyB0LkVsZW1lbnRBc3QoXG4gICAgICAgIGFzdC5uYW1lLCBodG1sLnZpc2l0QWxsKHRoaXMsIGFzdC5hdHRycyksIFtdLCBbXSwgW10sIFtdLCBbXSwgZmFsc2UsIFtdLCBjaGlsZHJlbixcbiAgICAgICAgbmdDb250ZW50SW5kZXgsIGFzdC5zb3VyY2VTcGFuLCBhc3QuZW5kU291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXRDb21tZW50KGNvbW1lbnQ6IGh0bWwuQ29tbWVudCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cblxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IGh0bWwuQXR0cmlidXRlLCBjb250ZXh0OiBhbnkpOiB0LkF0dHJBc3Qge1xuICAgIHJldHVybiBuZXcgdC5BdHRyQXN0KGF0dHJpYnV0ZS5uYW1lLCBhdHRyaWJ1dGUudmFsdWUsIGF0dHJpYnV0ZS5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiBodG1sLlRleHQsIHBhcmVudDogRWxlbWVudENvbnRleHQpOiB0LlRleHRBc3Qge1xuICAgIGNvbnN0IG5nQ29udGVudEluZGV4ID0gcGFyZW50LmZpbmROZ0NvbnRlbnRJbmRleChURVhUX0NTU19TRUxFQ1RPUikgITtcbiAgICByZXR1cm4gbmV3IHQuVGV4dEFzdCh0ZXh0LnZhbHVlLCBuZ0NvbnRlbnRJbmRleCwgdGV4dC5zb3VyY2VTcGFuICEpO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb24oZXhwYW5zaW9uOiBodG1sLkV4cGFuc2lvbiwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGV4cGFuc2lvbjsgfVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShleHBhbnNpb25DYXNlOiBodG1sLkV4cGFuc2lvbkNhc2UsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBleHBhbnNpb25DYXNlOyB9XG59XG5cbi8qKlxuICogQSByZWZlcmVuY2UgdG8gYW4gZWxlbWVudCBvciBkaXJlY3RpdmUgaW4gYSB0ZW1wbGF0ZS4gRS5nLiwgdGhlIHJlZmVyZW5jZSBpbiB0aGlzIHRlbXBsYXRlOlxuICpcbiAqIDxkaXYgI215TWVudT1cImNvb2xNZW51XCI+XG4gKlxuICogd291bGQgYmUge25hbWU6ICdteU1lbnUnLCB2YWx1ZTogJ2Nvb2xNZW51Jywgc291cmNlU3BhbjogLi4ufVxuICovXG5jbGFzcyBFbGVtZW50T3JEaXJlY3RpdmVSZWYge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoaXMgaXMgYSByZWZlcmVuY2UgdG8gdGhlIGdpdmVuIGRpcmVjdGl2ZS4gKi9cbiAgaXNSZWZlcmVuY2VUb0RpcmVjdGl2ZShkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5KSB7XG4gICAgcmV0dXJuIHNwbGl0RXhwb3J0QXMoZGlyZWN0aXZlLmV4cG9ydEFzKS5pbmRleE9mKHRoaXMudmFsdWUpICE9PSAtMTtcbiAgfVxufVxuXG4vKiogU3BsaXRzIGEgcmF3LCBwb3RlbnRpYWxseSBjb21tYS1kZWxpbWl0ZWQgYGV4cG9ydEFzYCB2YWx1ZSBpbnRvIGFuIGFycmF5IG9mIG5hbWVzLiAqL1xuZnVuY3Rpb24gc3BsaXRFeHBvcnRBcyhleHBvcnRBczogc3RyaW5nIHwgbnVsbCk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIGV4cG9ydEFzID8gZXhwb3J0QXMuc3BsaXQoJywnKS5tYXAoZSA9PiBlLnRyaW0oKSkgOiBbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0Q2xhc3NlcyhjbGFzc0F0dHJWYWx1ZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICByZXR1cm4gY2xhc3NBdHRyVmFsdWUudHJpbSgpLnNwbGl0KC9cXHMrL2cpO1xufVxuXG5jbGFzcyBFbGVtZW50Q29udGV4dCB7XG4gIHN0YXRpYyBjcmVhdGUoXG4gICAgICBpc1RlbXBsYXRlRWxlbWVudDogYm9vbGVhbiwgZGlyZWN0aXZlczogdC5EaXJlY3RpdmVBc3RbXSxcbiAgICAgIHByb3ZpZGVyQ29udGV4dDogUHJvdmlkZXJFbGVtZW50Q29udGV4dCk6IEVsZW1lbnRDb250ZXh0IHtcbiAgICBjb25zdCBtYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgIGxldCB3aWxkY2FyZE5nQ29udGVudEluZGV4OiBudW1iZXIgPSBudWxsICE7XG4gICAgY29uc3QgY29tcG9uZW50ID0gZGlyZWN0aXZlcy5maW5kKGRpcmVjdGl2ZSA9PiBkaXJlY3RpdmUuZGlyZWN0aXZlLmlzQ29tcG9uZW50KTtcbiAgICBpZiAoY29tcG9uZW50KSB7XG4gICAgICBjb25zdCBuZ0NvbnRlbnRTZWxlY3RvcnMgPSBjb21wb25lbnQuZGlyZWN0aXZlLnRlbXBsYXRlICEubmdDb250ZW50U2VsZWN0b3JzO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBuZ0NvbnRlbnRTZWxlY3RvcnNbaV07XG4gICAgICAgIGlmIChzZWxlY3RvciA9PT0gJyonKSB7XG4gICAgICAgICAgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCA9IGk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShuZ0NvbnRlbnRTZWxlY3RvcnNbaV0pLCBpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEVsZW1lbnRDb250ZXh0KGlzVGVtcGxhdGVFbGVtZW50LCBtYXRjaGVyLCB3aWxkY2FyZE5nQ29udGVudEluZGV4LCBwcm92aWRlckNvbnRleHQpO1xuICB9XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGlzVGVtcGxhdGVFbGVtZW50OiBib29sZWFuLCBwcml2YXRlIF9uZ0NvbnRlbnRJbmRleE1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcixcbiAgICAgIHByaXZhdGUgX3dpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlcnxudWxsLFxuICAgICAgcHVibGljIHByb3ZpZGVyQ29udGV4dDogUHJvdmlkZXJFbGVtZW50Q29udGV4dHxudWxsKSB7fVxuXG4gIGZpbmROZ0NvbnRlbnRJbmRleChzZWxlY3RvcjogQ3NzU2VsZWN0b3IpOiBudW1iZXJ8bnVsbCB7XG4gICAgY29uc3QgbmdDb250ZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgICB0aGlzLl9uZ0NvbnRlbnRJbmRleE1hdGNoZXIubWF0Y2goXG4gICAgICAgIHNlbGVjdG9yLCAoc2VsZWN0b3IsIG5nQ29udGVudEluZGV4KSA9PiB7IG5nQ29udGVudEluZGljZXMucHVzaChuZ0NvbnRlbnRJbmRleCk7IH0pO1xuICAgIG5nQ29udGVudEluZGljZXMuc29ydCgpO1xuICAgIGlmICh0aGlzLl93aWxkY2FyZE5nQ29udGVudEluZGV4ICE9IG51bGwpIHtcbiAgICAgIG5nQ29udGVudEluZGljZXMucHVzaCh0aGlzLl93aWxkY2FyZE5nQ29udGVudEluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIG5nQ29udGVudEluZGljZXMubGVuZ3RoID4gMCA/IG5nQ29udGVudEluZGljZXNbMF0gOiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3IoXG4gICAgZWxlbWVudE5hbWU6IHN0cmluZywgYXR0cmlidXRlczogW3N0cmluZywgc3RyaW5nXVtdKTogQ3NzU2VsZWN0b3Ige1xuICBjb25zdCBjc3NTZWxlY3RvciA9IG5ldyBDc3NTZWxlY3RvcigpO1xuICBjb25zdCBlbE5hbWVOb05zID0gc3BsaXROc05hbWUoZWxlbWVudE5hbWUpWzFdO1xuXG4gIGNzc1NlbGVjdG9yLnNldEVsZW1lbnQoZWxOYW1lTm9Ocyk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYXR0ck5hbWUgPSBhdHRyaWJ1dGVzW2ldWzBdO1xuICAgIGNvbnN0IGF0dHJOYW1lTm9OcyA9IHNwbGl0TnNOYW1lKGF0dHJOYW1lKVsxXTtcbiAgICBjb25zdCBhdHRyVmFsdWUgPSBhdHRyaWJ1dGVzW2ldWzFdO1xuXG4gICAgY3NzU2VsZWN0b3IuYWRkQXR0cmlidXRlKGF0dHJOYW1lTm9OcywgYXR0clZhbHVlKTtcbiAgICBpZiAoYXR0ck5hbWUudG9Mb3dlckNhc2UoKSA9PSBDTEFTU19BVFRSKSB7XG4gICAgICBjb25zdCBjbGFzc2VzID0gc3BsaXRDbGFzc2VzKGF0dHJWYWx1ZSk7XG4gICAgICBjbGFzc2VzLmZvckVhY2goY2xhc3NOYW1lID0+IGNzc1NlbGVjdG9yLmFkZENsYXNzTmFtZShjbGFzc05hbWUpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNzc1NlbGVjdG9yO1xufVxuXG5jb25zdCBFTVBUWV9FTEVNRU5UX0NPTlRFWFQgPSBuZXcgRWxlbWVudENvbnRleHQodHJ1ZSwgbmV3IFNlbGVjdG9yTWF0Y2hlcigpLCBudWxsLCBudWxsKTtcbmNvbnN0IE5PTl9CSU5EQUJMRV9WSVNJVE9SID0gbmV3IE5vbkJpbmRhYmxlVmlzaXRvcigpO1xuXG5mdW5jdGlvbiBfaXNFbXB0eVRleHROb2RlKG5vZGU6IGh0bWwuTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIGh0bWwuVGV4dCAmJiBub2RlLnZhbHVlLnRyaW0oKS5sZW5ndGggPT0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVN1bW1hcnlEdXBsaWNhdGVzPFQgZXh0ZW5kc3t0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhfT4oaXRlbXM6IFRbXSk6IFRbXSB7XG4gIGNvbnN0IG1hcCA9IG5ldyBNYXA8YW55LCBUPigpO1xuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICBpZiAoIW1hcC5nZXQoaXRlbS50eXBlLnJlZmVyZW5jZSkpIHtcbiAgICAgIG1hcC5zZXQoaXRlbS50eXBlLnJlZmVyZW5jZSwgaXRlbSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQXJyYXkuZnJvbShtYXAudmFsdWVzKCkpO1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5RXhwcmVzc2lvbihhc3Q6IEFTVCk6IGJvb2xlYW4ge1xuICBpZiAoYXN0IGluc3RhbmNlb2YgQVNUV2l0aFNvdXJjZSkge1xuICAgIGFzdCA9IGFzdC5hc3Q7XG4gIH1cbiAgcmV0dXJuIGFzdCBpbnN0YW5jZW9mIEVtcHR5RXhwcjtcbn0iXX0=