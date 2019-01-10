/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { flatten, sanitizeIdentifier } from '../../compile_metadata';
import { BindingForm, BuiltinFunctionCall, convertActionBinding, convertPropertyBinding } from '../../compiler_util/expression_converter';
import * as core from '../../core';
import { AstMemoryEfficientTransformer, FunctionCall, ImplicitReceiver, Interpolation, LiteralArray, LiteralPrimitive, PropertyRead } from '../../expression_parser/ast';
import { Lexer } from '../../expression_parser/lexer';
import { Parser } from '../../expression_parser/parser';
import * as html from '../../ml_parser/ast';
import { HtmlParser } from '../../ml_parser/html_parser';
import { WhitespaceVisitor } from '../../ml_parser/html_whitespaces';
import { DEFAULT_INTERPOLATION_CONFIG } from '../../ml_parser/interpolation_config';
import { splitNsName } from '../../ml_parser/tags';
import * as o from '../../output/output_ast';
import { DomElementSchemaRegistry } from '../../schema/dom_element_schema_registry';
import { CssSelector } from '../../selector';
import { BindingParser } from '../../template_parser/binding_parser';
import { error } from '../../util';
import * as t from '../r3_ast';
import { Identifiers as R3 } from '../r3_identifiers';
import { htmlAstToRender3Ast } from '../r3_template_transform';
import { parseStyle } from './styling';
import { CONTEXT_NAME, I18N_ATTR, I18N_ATTR_PREFIX, ID_SEPARATOR, IMPLICIT_REFERENCE, MEANING_SEPARATOR, REFERENCE_PREFIX, RENDER_FLAGS, asLiteral, invalid, mapToExpression, noop, trimTrailingNulls, unsupported } from './util';
function mapBindingToInstruction(type) {
    switch (type) {
        case 0 /* Property */:
            return R3.elementProperty;
        case 1 /* Attribute */:
            return R3.elementAttribute;
        case 2 /* Class */:
            return R3.elementClassProp;
        default:
            return undefined;
    }
}
//  if (rf & flags) { .. }
export function renderFlagCheckIfStmt(flags, statements) {
    return o.ifStmt(o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(flags), null, false), statements);
}
var TemplateDefinitionBuilder = /** @class */ (function () {
    function TemplateDefinitionBuilder(constantPool, contextParameter, parentBindingScope, level, contextName, templateName, viewQueries, directiveMatcher, directives, pipeTypeByName, pipes, _namespace) {
        if (level === void 0) { level = 0; }
        var _this = this;
        this.constantPool = constantPool;
        this.contextParameter = contextParameter;
        this.level = level;
        this.contextName = contextName;
        this.templateName = templateName;
        this.viewQueries = viewQueries;
        this.directiveMatcher = directiveMatcher;
        this.directives = directives;
        this.pipeTypeByName = pipeTypeByName;
        this.pipes = pipes;
        this._namespace = _namespace;
        this._dataIndex = 0;
        this._bindingContext = 0;
        this._prefixCode = [];
        this._creationCode = [];
        this._variableCode = [];
        this._bindingCode = [];
        this._postfixCode = [];
        this._unsupported = unsupported;
        // Whether we are inside a translatable element (`<p i18n>... somewhere here ... </p>)
        this._inI18nSection = false;
        this._i18nSectionIndex = -1;
        // Maps of placeholder to node indexes for each of the i18n section
        this._phToNodeIdxes = [{}];
        // Number of slots to reserve for pureFunctions
        this._pureFunctionSlots = 0;
        // These should be handled in the template or element directly.
        this.visitReference = invalid;
        this.visitVariable = invalid;
        this.visitTextAttribute = invalid;
        this.visitBoundAttribute = invalid;
        this.visitBoundEvent = invalid;
        // view queries can take up space in data and allocation happens earlier (in the "viewQuery"
        // function)
        this._dataIndex = viewQueries.length;
        this._bindingScope =
            parentBindingScope.nestedScope(function (lhsVar, expression) {
                _this._bindingCode.push(lhsVar.set(expression).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
            });
        this._valueConverter = new ValueConverter(constantPool, function () { return _this.allocateDataSlot(); }, function (numSlots) { return _this._pureFunctionSlots += numSlots; }, function (name, localName, slot, value) {
            var pipeType = pipeTypeByName.get(name);
            if (pipeType) {
                _this.pipes.add(pipeType);
            }
            _this._bindingScope.set(localName, value);
            _this._creationCode.push(o.importExpr(R3.pipe).callFn([o.literal(slot), o.literal(name)]).toStmt());
        });
    }
    TemplateDefinitionBuilder.prototype.buildTemplateFunction = function (nodes, variables, hasNgContent, ngContentSelectors) {
        if (hasNgContent === void 0) { hasNgContent = false; }
        if (ngContentSelectors === void 0) { ngContentSelectors = []; }
        if (this._namespace !== R3.namespaceHTML) {
            this.instruction(this._creationCode, null, this._namespace);
        }
        try {
            // Create variable bindings
            for (var variables_1 = tslib_1.__values(variables), variables_1_1 = variables_1.next(); !variables_1_1.done; variables_1_1 = variables_1.next()) {
                var variable = variables_1_1.value;
                var variableName = variable.name;
                var expression = o.variable(this.contextParameter).prop(variable.value || IMPLICIT_REFERENCE);
                var scopedName = this._bindingScope.freshReferenceName();
                // Add the reference to the local scope.
                this._bindingScope.set(variableName, o.variable(variableName + scopedName), expression);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (variables_1_1 && !variables_1_1.done && (_a = variables_1.return)) _a.call(variables_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Output a `ProjectionDef` instruction when some `<ng-content>` are present
        if (hasNgContent) {
            var parameters = [];
            // Only selectors with a non-default value are generated
            if (ngContentSelectors.length > 1) {
                var r3Selectors = ngContentSelectors.map(function (s) { return core.parseSelectorToR3Selector(s); });
                // `projectionDef` needs both the parsed and raw value of the selectors
                var parsed = this.constantPool.getConstLiteral(asLiteral(r3Selectors), true);
                var unParsed = this.constantPool.getConstLiteral(asLiteral(ngContentSelectors), true);
                parameters.push(parsed, unParsed);
            }
            this.instruction.apply(this, tslib_1.__spread([this._creationCode, null, R3.projectionDef], parameters));
        }
        t.visitAll(this, nodes);
        if (this._pureFunctionSlots > 0) {
            this.instruction(this._creationCode, null, R3.reserveSlots, o.literal(this._pureFunctionSlots));
        }
        var creationCode = this._creationCode.length > 0 ?
            [renderFlagCheckIfStmt(1 /* Create */, this._creationCode)] :
            [];
        var updateCode = this._bindingCode.length > 0 ?
            [renderFlagCheckIfStmt(2 /* Update */, this._bindingCode)] :
            [];
        try {
            // Generate maps of placeholder name to node indexes
            // TODO(vicb): This is a WIP, not fully supported yet
            for (var _b = tslib_1.__values(this._phToNodeIdxes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var phToNodeIdx = _c.value;
                if (Object.keys(phToNodeIdx).length > 0) {
                    var scopedName = this._bindingScope.freshReferenceName();
                    var phMap = o.variable(scopedName)
                        .set(mapToExpression(phToNodeIdx, true))
                        .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]);
                    this._prefixCode.push(phMap);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return o.fn([new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(this.contextParameter, null)], tslib_1.__spread(this._prefixCode, creationCode, this._variableCode, updateCode, this._postfixCode), o.INFERRED_TYPE, null, this.templateName);
        var e_1, _a, e_2, _d;
    };
    // LocalResolver
    TemplateDefinitionBuilder.prototype.getLocal = function (name) { return this._bindingScope.get(name); };
    TemplateDefinitionBuilder.prototype.visitContent = function (ngContent) {
        var slot = this.allocateDataSlot();
        var selectorIndex = ngContent.selectorIndex;
        var parameters = [o.literal(slot)];
        var attributeAsList = [];
        ngContent.attributes.forEach(function (attribute) {
            var name = attribute.name;
            if (name !== 'select') {
                attributeAsList.push(name, attribute.value);
            }
        });
        if (attributeAsList.length > 0) {
            parameters.push(o.literal(selectorIndex), asLiteral(attributeAsList));
        }
        else if (selectorIndex !== 0) {
            parameters.push(o.literal(selectorIndex));
        }
        this.instruction.apply(this, tslib_1.__spread([this._creationCode, ngContent.sourceSpan, R3.projection], parameters));
    };
    TemplateDefinitionBuilder.prototype.getNamespaceInstruction = function (namespaceKey) {
        switch (namespaceKey) {
            case 'math':
                return R3.namespaceMathML;
            case 'svg':
                return R3.namespaceSVG;
            default:
                return R3.namespaceHTML;
        }
    };
    TemplateDefinitionBuilder.prototype.addNamespaceInstruction = function (nsInstruction, element) {
        this._namespace = nsInstruction;
        this.instruction(this._creationCode, element.sourceSpan, nsInstruction);
    };
    TemplateDefinitionBuilder.prototype.visitElement = function (element) {
        var _this = this;
        var elementIndex = this.allocateDataSlot();
        var referenceDataSlots = new Map();
        var wasInI18nSection = this._inI18nSection;
        var outputAttrs = {};
        var attrI18nMetas = {};
        var i18nMeta = '';
        var _a = tslib_1.__read(splitNsName(element.name), 2), namespaceKey = _a[0], elementName = _a[1];
        // Elements inside i18n sections are replaced with placeholders
        // TODO(vicb): nested elements are a WIP in this phase
        if (this._inI18nSection) {
            var phName = element.name.toLowerCase();
            if (!this._phToNodeIdxes[this._i18nSectionIndex][phName]) {
                this._phToNodeIdxes[this._i18nSectionIndex][phName] = [];
            }
            this._phToNodeIdxes[this._i18nSectionIndex][phName].push(elementIndex);
        }
        try {
            // Handle i18n attributes
            for (var _b = tslib_1.__values(element.attributes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var attr = _c.value;
                var name_1 = attr.name;
                var value = attr.value;
                if (name_1 === I18N_ATTR) {
                    if (this._inI18nSection) {
                        throw new Error("Could not mark an element as translatable inside of a translatable section");
                    }
                    this._inI18nSection = true;
                    this._i18nSectionIndex++;
                    this._phToNodeIdxes[this._i18nSectionIndex] = {};
                    i18nMeta = value;
                }
                else if (name_1.startsWith(I18N_ATTR_PREFIX)) {
                    attrI18nMetas[name_1.slice(I18N_ATTR_PREFIX.length)] = value;
                }
                else {
                    outputAttrs[name_1] = value;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // Match directives on non i18n attributes
        if (this.directiveMatcher) {
            var selector = createCssSelector(element.name, outputAttrs);
            this.directiveMatcher.match(selector, function (sel, staticType) { _this.directives.add(staticType); });
        }
        // Element creation mode
        var parameters = [
            o.literal(elementIndex),
            o.literal(elementName),
        ];
        // Add the attributes
        var i18nMessages = [];
        var attributes = [];
        var initialStyleDeclarations = [];
        var initialClassDeclarations = [];
        var styleInputs = [];
        var classInputs = [];
        var allOtherInputs = [];
        element.inputs.forEach(function (input) {
            switch (input.type) {
                // [attr.style] or [attr.class] should not be treated as styling-based
                // bindings since they are intended to be written directly to the attr
                // and therefore will skip all style/class resolution that is present
                // with style="", [style]="" and [style.prop]="", class="",
                // [class.prop]="". [class]="" assignments
                case 0 /* Property */:
                    if (input.name == 'style') {
                        // this should always go first in the compilation (for [style])
                        styleInputs.splice(0, 0, input);
                    }
                    else if (isClassBinding(input)) {
                        // this should always go first in the compilation (for [class])
                        classInputs.splice(0, 0, input);
                    }
                    else {
                        allOtherInputs.push(input);
                    }
                    break;
                case 3 /* Style */:
                    styleInputs.push(input);
                    break;
                case 2 /* Class */:
                    classInputs.push(input);
                    break;
                default:
                    allOtherInputs.push(input);
                    break;
            }
        });
        var currStyleIndex = 0;
        var currClassIndex = 0;
        var staticStylesMap = null;
        var staticClassesMap = null;
        var stylesIndexMap = {};
        var classesIndexMap = {};
        Object.getOwnPropertyNames(outputAttrs).forEach(function (name) {
            var value = outputAttrs[name];
            if (name == 'style') {
                staticStylesMap = parseStyle(value);
                Object.keys(staticStylesMap).forEach(function (prop) { stylesIndexMap[prop] = currStyleIndex++; });
            }
            else if (name == 'class') {
                staticClassesMap = {};
                value.split(/\s+/g).forEach(function (className) {
                    classesIndexMap[className] = currClassIndex++;
                    staticClassesMap[className] = true;
                });
            }
            else {
                attributes.push(o.literal(name));
                if (attrI18nMetas.hasOwnProperty(name)) {
                    var meta = parseI18nMeta(attrI18nMetas[name]);
                    var variable = _this.constantPool.getTranslation(value, meta);
                    attributes.push(variable);
                }
                else {
                    attributes.push(o.literal(value));
                }
            }
        });
        var hasMapBasedStyling = false;
        for (var i = 0; i < styleInputs.length; i++) {
            var input = styleInputs[i];
            var isMapBasedStyleBinding = i === 0 && input.name === 'style';
            if (isMapBasedStyleBinding) {
                hasMapBasedStyling = true;
            }
            else if (!stylesIndexMap.hasOwnProperty(input.name)) {
                stylesIndexMap[input.name] = currStyleIndex++;
            }
        }
        for (var i = 0; i < classInputs.length; i++) {
            var input = classInputs[i];
            var isMapBasedClassBinding = i === 0 && isClassBinding(input);
            if (!isMapBasedClassBinding && !stylesIndexMap.hasOwnProperty(input.name)) {
                classesIndexMap[input.name] = currClassIndex++;
            }
        }
        // in the event that a [style] binding is used then sanitization will
        // always be imported because it is not possible to know ahead of time
        // whether style bindings will use or not use any sanitizable properties
        // that isStyleSanitizable() will detect
        var useDefaultStyleSanitizer = hasMapBasedStyling;
        // this will build the instructions so that they fall into the following syntax
        // => [prop1, prop2, prop3, 0, prop1, value1, prop2, value2]
        Object.keys(stylesIndexMap).forEach(function (prop) {
            useDefaultStyleSanitizer = useDefaultStyleSanitizer || isStyleSanitizable(prop);
            initialStyleDeclarations.push(o.literal(prop));
        });
        if (staticStylesMap) {
            initialStyleDeclarations.push(o.literal(1 /* VALUES_MODE */));
            Object.keys(staticStylesMap).forEach(function (prop) {
                initialStyleDeclarations.push(o.literal(prop));
                var value = staticStylesMap[prop];
                initialStyleDeclarations.push(o.literal(value));
            });
        }
        Object.keys(classesIndexMap).forEach(function (prop) {
            initialClassDeclarations.push(o.literal(prop));
        });
        if (staticClassesMap) {
            initialClassDeclarations.push(o.literal(1 /* VALUES_MODE */));
            Object.keys(staticClassesMap).forEach(function (className) {
                initialClassDeclarations.push(o.literal(className));
                initialClassDeclarations.push(o.literal(true));
            });
        }
        var hasStylingInstructions = initialStyleDeclarations.length || styleInputs.length ||
            initialClassDeclarations.length || classInputs.length;
        var attrArg = attributes.length > 0 ?
            this.constantPool.getConstLiteral(o.literalArr(attributes), true) :
            o.TYPED_NULL_EXPR;
        parameters.push(attrArg);
        if (element.references && element.references.length > 0) {
            var references = flatten(element.references.map(function (reference) {
                var slot = _this.allocateDataSlot();
                referenceDataSlots.set(reference.name, slot);
                // Generate the update temporary.
                var variableName = _this._bindingScope.freshReferenceName();
                _this._variableCode.push(o.variable(variableName, o.INFERRED_TYPE)
                    .set(o.importExpr(R3.load).callFn([o.literal(slot)]))
                    .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
                _this._bindingScope.set(reference.name, o.variable(variableName));
                return [reference.name, reference.value];
            }));
            parameters.push(this.constantPool.getConstLiteral(asLiteral(references), true));
        }
        else {
            parameters.push(o.TYPED_NULL_EXPR);
        }
        // Generate the instruction create element instruction
        if (i18nMessages.length > 0) {
            (_e = this._creationCode).push.apply(_e, tslib_1.__spread(i18nMessages));
        }
        var wasInNamespace = this._namespace;
        var currentNamespace = this.getNamespaceInstruction(namespaceKey);
        // If the namespace is changing now, include an instruction to change it
        // during element creation.
        if (currentNamespace !== wasInNamespace) {
            this.addNamespaceInstruction(currentNamespace, element);
        }
        var implicit = o.variable(CONTEXT_NAME);
        var createSelfClosingInstruction = !hasStylingInstructions && element.children.length === 0 && element.outputs.length === 0;
        if (createSelfClosingInstruction) {
            this.instruction.apply(this, tslib_1.__spread([this._creationCode, element.sourceSpan, R3.element], trimTrailingNulls(parameters)));
        }
        else {
            // Generate the instruction create element instruction
            if (i18nMessages.length > 0) {
                (_f = this._creationCode).push.apply(_f, tslib_1.__spread(i18nMessages));
            }
            this.instruction.apply(this, tslib_1.__spread([this._creationCode, element.sourceSpan, R3.elementStart], trimTrailingNulls(parameters)));
            // initial styling for static style="..." attributes
            if (hasStylingInstructions) {
                var paramsList = [];
                if (initialClassDeclarations.length) {
                    // the template compiler handles initial class styling (e.g. class="foo") values
                    // in a special command called `elementClass` so that the initial class
                    // can be processed during runtime. These initial class values are bound to
                    // a constant because the inital class values do not change (since they're static).
                    paramsList.push(this.constantPool.getConstLiteral(o.literalArr(initialClassDeclarations), true));
                }
                else if (initialStyleDeclarations.length || useDefaultStyleSanitizer) {
                    // no point in having an extra `null` value unless there are follow-up params
                    paramsList.push(o.NULL_EXPR);
                }
                if (initialStyleDeclarations.length) {
                    // the template compiler handles initial style (e.g. style="foo") values
                    // in a special command called `elementStyle` so that the initial styles
                    // can be processed during runtime. These initial styles values are bound to
                    // a constant because the inital style values do not change (since they're static).
                    paramsList.push(this.constantPool.getConstLiteral(o.literalArr(initialStyleDeclarations), true));
                }
                else if (useDefaultStyleSanitizer) {
                    // no point in having an extra `null` value unless there are follow-up params
                    paramsList.push(o.NULL_EXPR);
                }
                if (useDefaultStyleSanitizer) {
                    paramsList.push(o.importExpr(R3.defaultStyleSanitizer));
                }
                this._creationCode.push(o.importExpr(R3.elementStyling).callFn(paramsList).toStmt());
            }
            // Generate Listeners (outputs)
            element.outputs.forEach(function (outputAst) {
                var elName = sanitizeIdentifier(element.name);
                var evName = sanitizeIdentifier(outputAst.name);
                var functionName = _this.templateName + "_" + elName + "_" + evName + "_listener";
                var localVars = [];
                var bindingScope = _this._bindingScope.nestedScope(function (lhsVar, rhsExpression) {
                    localVars.push(lhsVar.set(rhsExpression).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
                });
                var bindingExpr = convertActionBinding(bindingScope, implicit, outputAst.handler, 'b', function () { return error('Unexpected interpolation'); });
                var handler = o.fn([new o.FnParam('$event', o.DYNAMIC_TYPE)], tslib_1.__spread(localVars, bindingExpr.render3Stmts), o.INFERRED_TYPE, null, functionName);
                _this.instruction(_this._creationCode, outputAst.sourceSpan, R3.listener, o.literal(outputAst.name), handler);
            });
        }
        if ((styleInputs.length || classInputs.length) && hasStylingInstructions) {
            var indexLiteral = o.literal(elementIndex);
            var firstStyle = styleInputs[0];
            var mapBasedStyleInput = firstStyle && firstStyle.name == 'style' ? firstStyle : null;
            var firstClass = classInputs[0];
            var mapBasedClassInput = firstClass && isClassBinding(firstClass) ? firstClass : null;
            var stylingInput = mapBasedStyleInput || mapBasedClassInput;
            if (stylingInput) {
                var params = [];
                if (mapBasedClassInput) {
                    params.push(this.convertPropertyBinding(implicit, mapBasedClassInput.value, true));
                }
                else if (mapBasedStyleInput) {
                    params.push(o.NULL_EXPR);
                }
                if (mapBasedStyleInput) {
                    params.push(this.convertPropertyBinding(implicit, mapBasedStyleInput.value, true));
                }
                this.instruction.apply(this, tslib_1.__spread([this._bindingCode, stylingInput.sourceSpan, R3.elementStylingMap, indexLiteral], params));
            }
            var lastInputCommand = null;
            if (styleInputs.length) {
                var i = mapBasedStyleInput ? 1 : 0;
                for (i; i < styleInputs.length; i++) {
                    var input = styleInputs[i];
                    var convertedBinding = this.convertPropertyBinding(implicit, input.value, true);
                    var params = [convertedBinding];
                    var sanitizationRef = resolveSanitizationFn(input, input.securityContext);
                    if (sanitizationRef) {
                        params.push(sanitizationRef);
                    }
                    var key = input.name;
                    var styleIndex = stylesIndexMap[key];
                    this.instruction.apply(this, tslib_1.__spread([this._bindingCode, input.sourceSpan, R3.elementStyleProp, indexLiteral,
                        o.literal(styleIndex)], params));
                }
                lastInputCommand = styleInputs[styleInputs.length - 1];
            }
            if (classInputs.length) {
                var i = mapBasedClassInput ? 1 : 0;
                for (i; i < classInputs.length; i++) {
                    var input = classInputs[i];
                    var convertedBinding = this.convertPropertyBinding(implicit, input.value, true);
                    var params = [convertedBinding];
                    var sanitizationRef = resolveSanitizationFn(input, input.securityContext);
                    if (sanitizationRef) {
                        params.push(sanitizationRef);
                    }
                    var key = input.name;
                    var classIndex = classesIndexMap[key];
                    this.instruction.apply(this, tslib_1.__spread([this._bindingCode, input.sourceSpan, R3.elementClassProp, indexLiteral,
                        o.literal(classIndex)], params));
                }
                lastInputCommand = classInputs[classInputs.length - 1];
            }
            this.instruction(this._bindingCode, lastInputCommand.sourceSpan, R3.elementStylingApply, indexLiteral);
        }
        // Generate element input bindings
        allOtherInputs.forEach(function (input) {
            if (input.type === 4 /* Animation */) {
                console.error('warning: animation bindings not yet supported');
                return;
            }
            var convertedBinding = _this.convertPropertyBinding(implicit, input.value);
            var instruction = mapBindingToInstruction(input.type);
            if (instruction) {
                var params = [convertedBinding];
                var sanitizationRef = resolveSanitizationFn(input, input.securityContext);
                if (sanitizationRef) {
                    params.push(sanitizationRef);
                }
                // TODO(chuckj): runtime: security context?
                _this.instruction.apply(_this, tslib_1.__spread([_this._bindingCode, input.sourceSpan, instruction, o.literal(elementIndex),
                    o.literal(input.name)], params));
            }
            else {
                _this._unsupported("binding type " + input.type);
            }
        });
        // Traverse element child nodes
        if (this._inI18nSection && element.children.length == 1 &&
            element.children[0] instanceof t.Text) {
            var text = element.children[0];
            this.visitSingleI18nTextChild(text, i18nMeta);
        }
        else {
            t.visitAll(this, element.children);
        }
        if (!createSelfClosingInstruction) {
            // Finish element construction mode.
            this.instruction(this._creationCode, element.endSourceSpan || element.sourceSpan, R3.elementEnd);
        }
        // Restore the state before exiting this node
        this._inI18nSection = wasInI18nSection;
        var e_3, _d, _e, _f;
    };
    TemplateDefinitionBuilder.prototype.visitTemplate = function (template) {
        var _this = this;
        var templateIndex = this.allocateDataSlot();
        var elName = '';
        if (template.children.length === 1 && template.children[0] instanceof t.Element) {
            // When the template as a single child, derive the context name from the tag
            elName = sanitizeIdentifier(template.children[0].name);
        }
        var contextName = elName ? this.contextName + "_" + elName : '';
        var templateName = contextName ? contextName + "_Template_" + templateIndex : "Template_" + templateIndex;
        var templateContext = "ctx" + this.level;
        var parameters = [
            o.literal(templateIndex),
            o.variable(templateName),
            o.TYPED_NULL_EXPR,
        ];
        var attributeNames = [];
        var attributeMap = {};
        template.attributes.forEach(function (a) {
            attributeNames.push(asLiteral(a.name), asLiteral(''));
            attributeMap[a.name] = a.value;
        });
        // Match directives on template attributes
        if (this.directiveMatcher) {
            var selector = createCssSelector('ng-template', attributeMap);
            this.directiveMatcher.match(selector, function (cssSelector, staticType) { _this.directives.add(staticType); });
        }
        if (attributeNames.length) {
            parameters.push(this.constantPool.getConstLiteral(o.literalArr(attributeNames), true));
        }
        // e.g. C(1, C1Template)
        this.instruction.apply(this, tslib_1.__spread([this._creationCode, template.sourceSpan, R3.containerCreate], trimTrailingNulls(parameters)));
        // e.g. p(1, 'forOf', ɵb(ctx.items));
        var context = o.variable(CONTEXT_NAME);
        template.inputs.forEach(function (input) {
            var convertedBinding = _this.convertPropertyBinding(context, input.value);
            _this.instruction(_this._bindingCode, template.sourceSpan, R3.elementProperty, o.literal(templateIndex), o.literal(input.name), convertedBinding);
        });
        // Create the template function
        var templateVisitor = new TemplateDefinitionBuilder(this.constantPool, templateContext, this._bindingScope, this.level + 1, contextName, templateName, [], this.directiveMatcher, this.directives, this.pipeTypeByName, this.pipes, this._namespace);
        var templateFunctionExpr = templateVisitor.buildTemplateFunction(template.children, template.variables);
        this._postfixCode.push(templateFunctionExpr.toDeclStmt(templateName, null));
    };
    TemplateDefinitionBuilder.prototype.visitBoundText = function (text) {
        var nodeIndex = this.allocateDataSlot();
        this.instruction(this._creationCode, text.sourceSpan, R3.text, o.literal(nodeIndex));
        this.instruction(this._bindingCode, text.sourceSpan, R3.textBinding, o.literal(nodeIndex), this.convertPropertyBinding(o.variable(CONTEXT_NAME), text.value));
    };
    TemplateDefinitionBuilder.prototype.visitText = function (text) {
        this.instruction(this._creationCode, text.sourceSpan, R3.text, o.literal(this.allocateDataSlot()), o.literal(text.value));
    };
    // When the content of the element is a single text node the translation can be inlined:
    //
    // `<p i18n="desc|mean">some content</p>`
    // compiles to
    // ```
    // /**
    // * @desc desc
    // * @meaning mean
    // */
    // const MSG_XYZ = goog.getMsg('some content');
    // i0.ɵT(1, MSG_XYZ);
    // ```
    TemplateDefinitionBuilder.prototype.visitSingleI18nTextChild = function (text, i18nMeta) {
        var meta = parseI18nMeta(i18nMeta);
        var variable = this.constantPool.getTranslation(text.value, meta);
        this.instruction(this._creationCode, text.sourceSpan, R3.text, o.literal(this.allocateDataSlot()), variable);
    };
    TemplateDefinitionBuilder.prototype.allocateDataSlot = function () { return this._dataIndex++; };
    TemplateDefinitionBuilder.prototype.bindingContext = function () { return "" + this._bindingContext++; };
    TemplateDefinitionBuilder.prototype.instruction = function (statements, span, reference) {
        var params = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            params[_i - 3] = arguments[_i];
        }
        statements.push(o.importExpr(reference, null, span).callFn(params, span).toStmt());
    };
    TemplateDefinitionBuilder.prototype.convertPropertyBinding = function (implicit, value, skipBindFn) {
        var pipesConvertedValue = value.visit(this._valueConverter);
        if (pipesConvertedValue instanceof Interpolation) {
            var convertedPropertyBinding = convertPropertyBinding(this, implicit, pipesConvertedValue, this.bindingContext(), BindingForm.TrySimple, interpolate);
            (_a = this._bindingCode).push.apply(_a, tslib_1.__spread(convertedPropertyBinding.stmts));
            return convertedPropertyBinding.currValExpr;
        }
        else {
            var convertedPropertyBinding = convertPropertyBinding(this, implicit, pipesConvertedValue, this.bindingContext(), BindingForm.TrySimple, function () { return error('Unexpected interpolation'); });
            (_b = this._bindingCode).push.apply(_b, tslib_1.__spread(convertedPropertyBinding.stmts));
            var valExpr = convertedPropertyBinding.currValExpr;
            return skipBindFn ? valExpr : o.importExpr(R3.bind).callFn([valExpr]);
        }
        var _a, _b;
    };
    return TemplateDefinitionBuilder;
}());
export { TemplateDefinitionBuilder };
var ValueConverter = /** @class */ (function (_super) {
    tslib_1.__extends(ValueConverter, _super);
    function ValueConverter(constantPool, allocateSlot, allocatePureFunctionSlots, definePipe) {
        var _this = _super.call(this) || this;
        _this.constantPool = constantPool;
        _this.allocateSlot = allocateSlot;
        _this.allocatePureFunctionSlots = allocatePureFunctionSlots;
        _this.definePipe = definePipe;
        return _this;
    }
    // AstMemoryEfficientTransformer
    ValueConverter.prototype.visitPipe = function (pipe, context) {
        // Allocate a slot to create the pipe
        var slot = this.allocateSlot();
        var slotPseudoLocal = "PIPE:" + slot;
        // Allocate one slot for the result plus one slot per pipe argument
        var pureFunctionSlot = this.allocatePureFunctionSlots(2 + pipe.args.length);
        var target = new PropertyRead(pipe.span, new ImplicitReceiver(pipe.span), slotPseudoLocal);
        var _a = pipeBindingCallInfo(pipe.args), identifier = _a.identifier, isVarLength = _a.isVarLength;
        this.definePipe(pipe.name, slotPseudoLocal, slot, o.importExpr(identifier));
        var args = tslib_1.__spread([pipe.exp], pipe.args);
        var convertedArgs = isVarLength ? this.visitAll([new LiteralArray(pipe.span, args)]) : this.visitAll(args);
        return new FunctionCall(pipe.span, target, tslib_1.__spread([
            new LiteralPrimitive(pipe.span, slot),
            new LiteralPrimitive(pipe.span, pureFunctionSlot)
        ], convertedArgs));
    };
    ValueConverter.prototype.visitLiteralArray = function (array, context) {
        var _this = this;
        return new BuiltinFunctionCall(array.span, this.visitAll(array.expressions), function (values) {
            // If the literal has calculated (non-literal) elements transform it into
            // calls to literal factories that compose the literal and will cache intermediate
            // values. Otherwise, just return an literal array that contains the values.
            var literal = o.literalArr(values);
            return values.every(function (a) { return a.isConstant(); }) ?
                _this.constantPool.getConstLiteral(literal, true) :
                getLiteralFactory(_this.constantPool, literal, _this.allocatePureFunctionSlots);
        });
    };
    ValueConverter.prototype.visitLiteralMap = function (map, context) {
        var _this = this;
        return new BuiltinFunctionCall(map.span, this.visitAll(map.values), function (values) {
            // If the literal has calculated (non-literal) elements  transform it into
            // calls to literal factories that compose the literal and will cache intermediate
            // values. Otherwise, just return an literal array that contains the values.
            var literal = o.literalMap(values.map(function (value, index) { return ({ key: map.keys[index].key, value: value, quoted: map.keys[index].quoted }); }));
            return values.every(function (a) { return a.isConstant(); }) ?
                _this.constantPool.getConstLiteral(literal, true) :
                getLiteralFactory(_this.constantPool, literal, _this.allocatePureFunctionSlots);
        });
    };
    return ValueConverter;
}(AstMemoryEfficientTransformer));
// Pipes always have at least one parameter, the value they operate on
var pipeBindingIdentifiers = [R3.pipeBind1, R3.pipeBind2, R3.pipeBind3, R3.pipeBind4];
function pipeBindingCallInfo(args) {
    var identifier = pipeBindingIdentifiers[args.length];
    return {
        identifier: identifier || R3.pipeBindV,
        isVarLength: !identifier,
    };
}
var pureFunctionIdentifiers = [
    R3.pureFunction0, R3.pureFunction1, R3.pureFunction2, R3.pureFunction3, R3.pureFunction4,
    R3.pureFunction5, R3.pureFunction6, R3.pureFunction7, R3.pureFunction8
];
function pureFunctionCallInfo(args) {
    var identifier = pureFunctionIdentifiers[args.length];
    return {
        identifier: identifier || R3.pureFunctionV,
        isVarLength: !identifier,
    };
}
function getLiteralFactory(constantPool, literal, allocateSlots) {
    var _a = constantPool.getLiteralFactory(literal), literalFactory = _a.literalFactory, literalFactoryArguments = _a.literalFactoryArguments;
    // Allocate 1 slot for the result plus 1 per argument
    var startSlot = allocateSlots(1 + literalFactoryArguments.length);
    literalFactoryArguments.length > 0 || error("Expected arguments to a literal factory function");
    var _b = pureFunctionCallInfo(literalFactoryArguments), identifier = _b.identifier, isVarLength = _b.isVarLength;
    // Literal factories are pure functions that only need to be re-invoked when the parameters
    // change.
    var args = [
        o.literal(startSlot),
        literalFactory,
    ];
    if (isVarLength) {
        args.push(o.literalArr(literalFactoryArguments));
    }
    else {
        args.push.apply(args, tslib_1.__spread(literalFactoryArguments));
    }
    return o.importExpr(identifier).callFn(args);
}
var BindingScope = /** @class */ (function () {
    function BindingScope(parent, declareLocalVarCallback) {
        if (parent === void 0) { parent = null; }
        if (declareLocalVarCallback === void 0) { declareLocalVarCallback = noop; }
        this.parent = parent;
        this.declareLocalVarCallback = declareLocalVarCallback;
        /**
         * Keeps a map from local variables to their expressions.
         *
         * This is used when one refers to variable such as: 'let abc = a.b.c`.
         * - key to the map is the string literal `"abc"`.
         * - value `lhs` is the left hand side which is an AST representing `abc`.
         * - value `rhs` is the right hand side which is an AST representing `a.b.c`.
         * - value `declared` is true if the `declareLocalVarCallback` has been called for this scope
         * already.
         */
        this.map = new Map();
        this.referenceNameIndex = 0;
    }
    BindingScope.prototype.get = function (name) {
        var current = this;
        while (current) {
            var value = current.map.get(name);
            if (value != null) {
                if (current !== this) {
                    // make a local copy and reset the `declared` state.
                    value = { lhs: value.lhs, rhs: value.rhs, declared: false };
                    // Cache the value locally.
                    this.map.set(name, value);
                }
                if (value.rhs && !value.declared) {
                    // if it is first time we are referencing the variable in the scope
                    // than invoke the callback to insert variable declaration.
                    this.declareLocalVarCallback(value.lhs, value.rhs);
                    value.declared = true;
                }
                return value.lhs;
            }
            current = current.parent;
        }
        return null;
    };
    /**
     * Create a local variable for later reference.
     *
     * @param name Name of the variable.
     * @param lhs AST representing the left hand side of the `let lhs = rhs;`.
     * @param rhs AST representing the right hand side of the `let lhs = rhs;`. The `rhs` can be
     * `undefined` for variable that are ambient such as `$event` and which don't have `rhs`
     * declaration.
     */
    BindingScope.prototype.set = function (name, lhs, rhs) {
        !this.map.has(name) ||
            error("The name " + name + " is already defined in scope to be " + this.map.get(name));
        this.map.set(name, { lhs: lhs, rhs: rhs, declared: false });
        return this;
    };
    BindingScope.prototype.getLocal = function (name) { return this.get(name); };
    BindingScope.prototype.nestedScope = function (declareCallback) {
        return new BindingScope(this, declareCallback);
    };
    BindingScope.prototype.freshReferenceName = function () {
        var current = this;
        // Find the top scope as it maintains the global reference count
        while (current.parent)
            current = current.parent;
        var ref = "" + REFERENCE_PREFIX + current.referenceNameIndex++;
        return ref;
    };
    BindingScope.ROOT_SCOPE = new BindingScope().set('$event', o.variable('$event'));
    return BindingScope;
}());
export { BindingScope };
/**
 * Creates a `CssSelector` given a tag name and a map of attributes
 */
function createCssSelector(tag, attributes) {
    var cssSelector = new CssSelector();
    cssSelector.setElement(tag);
    Object.getOwnPropertyNames(attributes).forEach(function (name) {
        var value = attributes[name];
        cssSelector.addAttribute(name, value);
        if (name.toLowerCase() === 'class') {
            var classes = value.trim().split(/\s+/g);
            classes.forEach(function (className) { return cssSelector.addClassName(className); });
        }
    });
    return cssSelector;
}
// Parse i18n metas like:
// - "@@id",
// - "description[@@id]",
// - "meaning|description[@@id]"
function parseI18nMeta(i18n) {
    var meaning;
    var description;
    var id;
    if (i18n) {
        // TODO(vicb): figure out how to force a message ID with closure ?
        var idIndex = i18n.indexOf(ID_SEPARATOR);
        var descIndex = i18n.indexOf(MEANING_SEPARATOR);
        var meaningAndDesc = void 0;
        _a = tslib_1.__read((idIndex > -1) ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ''], 2), meaningAndDesc = _a[0], id = _a[1];
        _b = tslib_1.__read((descIndex > -1) ?
            [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
            ['', meaningAndDesc], 2), meaning = _b[0], description = _b[1];
    }
    return { description: description, id: id, meaning: meaning };
    var _a, _b;
}
function interpolate(args) {
    args = args.slice(1); // Ignore the length prefix added for render2
    switch (args.length) {
        case 3:
            return o.importExpr(R3.interpolation1).callFn(args);
        case 5:
            return o.importExpr(R3.interpolation2).callFn(args);
        case 7:
            return o.importExpr(R3.interpolation3).callFn(args);
        case 9:
            return o.importExpr(R3.interpolation4).callFn(args);
        case 11:
            return o.importExpr(R3.interpolation5).callFn(args);
        case 13:
            return o.importExpr(R3.interpolation6).callFn(args);
        case 15:
            return o.importExpr(R3.interpolation7).callFn(args);
        case 17:
            return o.importExpr(R3.interpolation8).callFn(args);
    }
    (args.length >= 19 && args.length % 2 == 1) ||
        error("Invalid interpolation argument length " + args.length);
    return o.importExpr(R3.interpolationV).callFn([o.literalArr(args)]);
}
/**
 * Parse a template into render3 `Node`s and additional metadata, with no other dependencies.
 *
 * @param template text of the template to parse
 * @param templateUrl URL to use for source mapping of the parsed template
 */
export function parseTemplate(template, templateUrl, options) {
    if (options === void 0) { options = {}; }
    var bindingParser = makeBindingParser();
    var htmlParser = new HtmlParser();
    var parseResult = htmlParser.parse(template, templateUrl);
    if (parseResult.errors && parseResult.errors.length > 0) {
        return { errors: parseResult.errors, nodes: [], hasNgContent: false, ngContentSelectors: [] };
    }
    var rootNodes = parseResult.rootNodes;
    if (!options.preserveWhitespaces) {
        rootNodes = html.visitAll(new WhitespaceVisitor(), rootNodes);
    }
    var _a = htmlAstToRender3Ast(rootNodes, bindingParser), nodes = _a.nodes, hasNgContent = _a.hasNgContent, ngContentSelectors = _a.ngContentSelectors, errors = _a.errors;
    if (errors && errors.length > 0) {
        return { errors: errors, nodes: [], hasNgContent: false, ngContentSelectors: [] };
    }
    return { nodes: nodes, hasNgContent: hasNgContent, ngContentSelectors: ngContentSelectors };
}
/**
 * Construct a `BindingParser` with a default configuration.
 */
export function makeBindingParser() {
    return new BindingParser(new Parser(new Lexer()), DEFAULT_INTERPOLATION_CONFIG, new DomElementSchemaRegistry(), null, []);
}
function isClassBinding(input) {
    return input.name == 'className' || input.name == 'class';
}
function resolveSanitizationFn(input, context) {
    switch (context) {
        case core.SecurityContext.HTML:
            return o.importExpr(R3.sanitizeHtml);
        case core.SecurityContext.SCRIPT:
            return o.importExpr(R3.sanitizeScript);
        case core.SecurityContext.STYLE:
            // the compiler does not fill in an instruction for [style.prop?] binding
            // values because the style algorithm knows internally what props are subject
            // to sanitization (only [attr.style] values are explicitly sanitized)
            return input.type === 1 /* Attribute */ ? o.importExpr(R3.sanitizeStyle) : null;
        case core.SecurityContext.URL:
            return o.importExpr(R3.sanitizeUrl);
        case core.SecurityContext.RESOURCE_URL:
            return o.importExpr(R3.sanitizeResourceUrl);
        default:
            return null;
    }
}
function isStyleSanitizable(prop) {
    switch (prop) {
        case 'background-image':
        case 'background':
        case 'border-image':
        case 'filter':
        case 'list-style':
        case 'list-style-image':
            return true;
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy92aWV3L3RlbXBsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFFbkUsT0FBTyxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBaUIsb0JBQW9CLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQztBQUV2SixPQUFPLEtBQUssSUFBSSxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQU0sNkJBQTZCLEVBQTRCLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFjLGdCQUFnQixFQUFFLFlBQVksRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQ2xOLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNwRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDdEQsT0FBTyxLQUFLLElBQUksTUFBTSxxQkFBcUIsQ0FBQztBQUM1QyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDdkQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDbkUsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDbEYsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2pELE9BQU8sS0FBSyxDQUFDLE1BQU0seUJBQXlCLENBQUM7QUFFN0MsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFDbEYsT0FBTyxFQUFDLFdBQVcsRUFBa0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1RCxPQUFP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QUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDdEYsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFDM0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZO1lBQ3BDLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzlDO1lBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0FBQ0gsQ0FBQztBQUVELDRCQUE0QixJQUFZO0lBQ3RDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDYixLQUFLLGtCQUFrQixDQUFDO1FBQ3hCLEtBQUssWUFBWSxDQUFDO1FBQ2xCLEtBQUssY0FBYyxDQUFDO1FBQ3BCLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxZQUFZLENBQUM7UUFDbEIsS0FBSyxrQkFBa0I7WUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZmxhdHRlbiwgc2FuaXRpemVJZGVudGlmaWVyfSBmcm9tICcuLi8uLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7Q29tcGlsZVJlZmxlY3Rvcn0gZnJvbSAnLi4vLi4vY29tcGlsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtCaW5kaW5nRm9ybSwgQnVpbHRpbkZ1bmN0aW9uQ2FsbCwgTG9jYWxSZXNvbHZlciwgY29udmVydEFjdGlvbkJpbmRpbmcsIGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmd9IGZyb20gJy4uLy4uL2NvbXBpbGVyX3V0aWwvZXhwcmVzc2lvbl9jb252ZXJ0ZXInO1xuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJy4uLy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0ICogYXMgY29yZSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCB7QVNULCBBc3RNZW1vcnlFZmZpY2llbnRUcmFuc2Zvcm1lciwgQmluZGluZ1BpcGUsIEJpbmRpbmdUeXBlLCBGdW5jdGlvbkNhbGwsIEltcGxpY2l0UmVjZWl2ZXIsIEludGVycG9sYXRpb24sIExpdGVyYWxBcnJheSwgTGl0ZXJhbE1hcCwgTGl0ZXJhbFByaW1pdGl2ZSwgUHJvcGVydHlSZWFkfSBmcm9tICcuLi8uLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtMZXhlcn0gZnJvbSAnLi4vLi4vZXhwcmVzc2lvbl9wYXJzZXIvbGV4ZXInO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJy4uLy4uL2V4cHJlc3Npb25fcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4uLy4uL21sX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtIdG1sUGFyc2VyfSBmcm9tICcuLi8uLi9tbF9wYXJzZXIvaHRtbF9wYXJzZXInO1xuaW1wb3J0IHtXaGl0ZXNwYWNlVmlzaXRvcn0gZnJvbSAnLi4vLi4vbWxfcGFyc2VyL2h0bWxfd2hpdGVzcGFjZXMnO1xuaW1wb3J0IHtERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHfSBmcm9tICcuLi8uLi9tbF9wYXJzZXIvaW50ZXJwb2xhdGlvbl9jb25maWcnO1xuaW1wb3J0IHtzcGxpdE5zTmFtZX0gZnJvbSAnLi4vLi4vbWxfcGFyc2VyL3RhZ3MnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1BhcnNlRXJyb3IsIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0RvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi4vLi4vc2NoZW1hL2RvbV9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5pbXBvcnQge0Nzc1NlbGVjdG9yLCBTZWxlY3Rvck1hdGNoZXJ9IGZyb20gJy4uLy4uL3NlbGVjdG9yJztcbmltcG9ydCB7QmluZGluZ1BhcnNlcn0gZnJvbSAnLi4vLi4vdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyJztcbmltcG9ydCB7T3V0cHV0Q29udGV4dCwgZXJyb3J9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuLi9yM19hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycyBhcyBSM30gZnJvbSAnLi4vcjNfaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtodG1sQXN0VG9SZW5kZXIzQXN0fSBmcm9tICcuLi9yM190ZW1wbGF0ZV90cmFuc2Zvcm0nO1xuXG5pbXBvcnQge1IzUXVlcnlNZXRhZGF0YX0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtwYXJzZVN0eWxlfSBmcm9tICcuL3N0eWxpbmcnO1xuaW1wb3J0IHtDT05URVhUX05BTUUsIEkxOE5fQVRUUiwgSTE4Tl9BVFRSX1BSRUZJWCwgSURfU0VQQVJBVE9SLCBJTVBMSUNJVF9SRUZFUkVOQ0UsIE1FQU5JTkdfU0VQQVJBVE9SLCBSRUZFUkVOQ0VfUFJFRklYLCBSRU5ERVJfRkxBR1MsIFRFTVBPUkFSWV9OQU1FLCBhc0xpdGVyYWwsIGdldFF1ZXJ5UHJlZGljYXRlLCBpbnZhbGlkLCBtYXBUb0V4cHJlc3Npb24sIG5vb3AsIHRlbXBvcmFyeUFsbG9jYXRvciwgdHJpbVRyYWlsaW5nTnVsbHMsIHVuc3VwcG9ydGVkfSBmcm9tICcuL3V0aWwnO1xuXG5mdW5jdGlvbiBtYXBCaW5kaW5nVG9JbnN0cnVjdGlvbih0eXBlOiBCaW5kaW5nVHlwZSk6IG8uRXh0ZXJuYWxSZWZlcmVuY2V8dW5kZWZpbmVkIHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBCaW5kaW5nVHlwZS5Qcm9wZXJ0eTpcbiAgICAgIHJldHVybiBSMy5lbGVtZW50UHJvcGVydHk7XG4gICAgY2FzZSBCaW5kaW5nVHlwZS5BdHRyaWJ1dGU6XG4gICAgICByZXR1cm4gUjMuZWxlbWVudEF0dHJpYnV0ZTtcbiAgICBjYXNlIEJpbmRpbmdUeXBlLkNsYXNzOlxuICAgICAgcmV0dXJuIFIzLmVsZW1lbnRDbGFzc1Byb3A7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLy8gIGlmIChyZiAmIGZsYWdzKSB7IC4uIH1cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJGbGFnQ2hlY2tJZlN0bXQoXG4gICAgZmxhZ3M6IGNvcmUuUmVuZGVyRmxhZ3MsIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10pOiBvLklmU3RtdCB7XG4gIHJldHVybiBvLmlmU3RtdChvLnZhcmlhYmxlKFJFTkRFUl9GTEFHUykuYml0d2lzZUFuZChvLmxpdGVyYWwoZmxhZ3MpLCBudWxsLCBmYWxzZSksIHN0YXRlbWVudHMpO1xufVxuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciBpbXBsZW1lbnRzIHQuVmlzaXRvcjx2b2lkPiwgTG9jYWxSZXNvbHZlciB7XG4gIHByaXZhdGUgX2RhdGFJbmRleCA9IDA7XG4gIHByaXZhdGUgX2JpbmRpbmdDb250ZXh0ID0gMDtcbiAgcHJpdmF0ZSBfcHJlZml4Q29kZTogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICBwcml2YXRlIF9jcmVhdGlvbkNvZGU6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgcHJpdmF0ZSBfdmFyaWFibGVDb2RlOiBvLlN0YXRlbWVudFtdID0gW107XG4gIHByaXZhdGUgX2JpbmRpbmdDb2RlOiBvLlN0YXRlbWVudFtdID0gW107XG4gIHByaXZhdGUgX3Bvc3RmaXhDb2RlOiBvLlN0YXRlbWVudFtdID0gW107XG4gIHByaXZhdGUgX3ZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcjtcbiAgcHJpdmF0ZSBfdW5zdXBwb3J0ZWQgPSB1bnN1cHBvcnRlZDtcbiAgcHJpdmF0ZSBfYmluZGluZ1Njb3BlOiBCaW5kaW5nU2NvcGU7XG5cbiAgLy8gV2hldGhlciB3ZSBhcmUgaW5zaWRlIGEgdHJhbnNsYXRhYmxlIGVsZW1lbnQgKGA8cCBpMThuPi4uLiBzb21ld2hlcmUgaGVyZSAuLi4gPC9wPilcbiAgcHJpdmF0ZSBfaW5JMThuU2VjdGlvbjogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9pMThuU2VjdGlvbkluZGV4ID0gLTE7XG4gIC8vIE1hcHMgb2YgcGxhY2Vob2xkZXIgdG8gbm9kZSBpbmRleGVzIGZvciBlYWNoIG9mIHRoZSBpMThuIHNlY3Rpb25cbiAgcHJpdmF0ZSBfcGhUb05vZGVJZHhlczoge1twaE5hbWU6IHN0cmluZ106IG51bWJlcltdfVtdID0gW3t9XTtcblxuICAvLyBOdW1iZXIgb2Ygc2xvdHMgdG8gcmVzZXJ2ZSBmb3IgcHVyZUZ1bmN0aW9uc1xuICBwcml2YXRlIF9wdXJlRnVuY3Rpb25TbG90cyA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sLCBwcml2YXRlIGNvbnRleHRQYXJhbWV0ZXI6IHN0cmluZyxcbiAgICAgIHBhcmVudEJpbmRpbmdTY29wZTogQmluZGluZ1Njb3BlLCBwcml2YXRlIGxldmVsID0gMCwgcHJpdmF0ZSBjb250ZXh0TmFtZTogc3RyaW5nfG51bGwsXG4gICAgICBwcml2YXRlIHRlbXBsYXRlTmFtZTogc3RyaW5nfG51bGwsIHByaXZhdGUgdmlld1F1ZXJpZXM6IFIzUXVlcnlNZXRhZGF0YVtdLFxuICAgICAgcHJpdmF0ZSBkaXJlY3RpdmVNYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXJ8bnVsbCwgcHJpdmF0ZSBkaXJlY3RpdmVzOiBTZXQ8by5FeHByZXNzaW9uPixcbiAgICAgIHByaXZhdGUgcGlwZVR5cGVCeU5hbWU6IE1hcDxzdHJpbmcsIG8uRXhwcmVzc2lvbj4sIHByaXZhdGUgcGlwZXM6IFNldDxvLkV4cHJlc3Npb24+LFxuICAgICAgcHJpdmF0ZSBfbmFtZXNwYWNlOiBvLkV4dGVybmFsUmVmZXJlbmNlKSB7XG4gICAgLy8gdmlldyBxdWVyaWVzIGNhbiB0YWtlIHVwIHNwYWNlIGluIGRhdGEgYW5kIGFsbG9jYXRpb24gaGFwcGVucyBlYXJsaWVyIChpbiB0aGUgXCJ2aWV3UXVlcnlcIlxuICAgIC8vIGZ1bmN0aW9uKVxuICAgIHRoaXMuX2RhdGFJbmRleCA9IHZpZXdRdWVyaWVzLmxlbmd0aDtcbiAgICB0aGlzLl9iaW5kaW5nU2NvcGUgPVxuICAgICAgICBwYXJlbnRCaW5kaW5nU2NvcGUubmVzdGVkU2NvcGUoKGxoc1Zhcjogby5SZWFkVmFyRXhwciwgZXhwcmVzc2lvbjogby5FeHByZXNzaW9uKSA9PiB7XG4gICAgICAgICAgdGhpcy5fYmluZGluZ0NvZGUucHVzaChcbiAgICAgICAgICAgICAgbGhzVmFyLnNldChleHByZXNzaW9uKS50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuICAgICAgICB9KTtcbiAgICB0aGlzLl92YWx1ZUNvbnZlcnRlciA9IG5ldyBWYWx1ZUNvbnZlcnRlcihcbiAgICAgICAgY29uc3RhbnRQb29sLCAoKSA9PiB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKSxcbiAgICAgICAgKG51bVNsb3RzOiBudW1iZXIpOiBudW1iZXIgPT4gdGhpcy5fcHVyZUZ1bmN0aW9uU2xvdHMgKz0gbnVtU2xvdHMsXG4gICAgICAgIChuYW1lLCBsb2NhbE5hbWUsIHNsb3QsIHZhbHVlOiBvLlJlYWRWYXJFeHByKSA9PiB7XG4gICAgICAgICAgY29uc3QgcGlwZVR5cGUgPSBwaXBlVHlwZUJ5TmFtZS5nZXQobmFtZSk7XG4gICAgICAgICAgaWYgKHBpcGVUeXBlKSB7XG4gICAgICAgICAgICB0aGlzLnBpcGVzLmFkZChwaXBlVHlwZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX2JpbmRpbmdTY29wZS5zZXQobG9jYWxOYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgdGhpcy5fY3JlYXRpb25Db2RlLnB1c2goXG4gICAgICAgICAgICAgIG8uaW1wb3J0RXhwcihSMy5waXBlKS5jYWxsRm4oW28ubGl0ZXJhbChzbG90KSwgby5saXRlcmFsKG5hbWUpXSkudG9TdG10KCkpO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIGJ1aWxkVGVtcGxhdGVGdW5jdGlvbihcbiAgICAgIG5vZGVzOiB0Lk5vZGVbXSwgdmFyaWFibGVzOiB0LlZhcmlhYmxlW10sIGhhc05nQ29udGVudDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSA9IFtdKTogby5GdW5jdGlvbkV4cHIge1xuICAgIGlmICh0aGlzLl9uYW1lc3BhY2UgIT09IFIzLm5hbWVzcGFjZUhUTUwpIHtcbiAgICAgIHRoaXMuaW5zdHJ1Y3Rpb24odGhpcy5fY3JlYXRpb25Db2RlLCBudWxsLCB0aGlzLl9uYW1lc3BhY2UpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB2YXJpYWJsZSBiaW5kaW5nc1xuICAgIGZvciAoY29uc3QgdmFyaWFibGUgb2YgdmFyaWFibGVzKSB7XG4gICAgICBjb25zdCB2YXJpYWJsZU5hbWUgPSB2YXJpYWJsZS5uYW1lO1xuICAgICAgY29uc3QgZXhwcmVzc2lvbiA9XG4gICAgICAgICAgby52YXJpYWJsZSh0aGlzLmNvbnRleHRQYXJhbWV0ZXIpLnByb3AodmFyaWFibGUudmFsdWUgfHwgSU1QTElDSVRfUkVGRVJFTkNFKTtcbiAgICAgIGNvbnN0IHNjb3BlZE5hbWUgPSB0aGlzLl9iaW5kaW5nU2NvcGUuZnJlc2hSZWZlcmVuY2VOYW1lKCk7XG4gICAgICAvLyBBZGQgdGhlIHJlZmVyZW5jZSB0byB0aGUgbG9jYWwgc2NvcGUuXG4gICAgICB0aGlzLl9iaW5kaW5nU2NvcGUuc2V0KHZhcmlhYmxlTmFtZSwgby52YXJpYWJsZSh2YXJpYWJsZU5hbWUgKyBzY29wZWROYW1lKSwgZXhwcmVzc2lvbik7XG4gICAgfVxuXG4gICAgLy8gT3V0cHV0IGEgYFByb2plY3Rpb25EZWZgIGluc3RydWN0aW9uIHdoZW4gc29tZSBgPG5nLWNvbnRlbnQ+YCBhcmUgcHJlc2VudFxuICAgIGlmIChoYXNOZ0NvbnRlbnQpIHtcbiAgICAgIGNvbnN0IHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdID0gW107XG5cbiAgICAgIC8vIE9ubHkgc2VsZWN0b3JzIHdpdGggYSBub24tZGVmYXVsdCB2YWx1ZSBhcmUgZ2VuZXJhdGVkXG4gICAgICBpZiAobmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc3QgcjNTZWxlY3RvcnMgPSBuZ0NvbnRlbnRTZWxlY3RvcnMubWFwKHMgPT4gY29yZS5wYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yKHMpKTtcbiAgICAgICAgLy8gYHByb2plY3Rpb25EZWZgIG5lZWRzIGJvdGggdGhlIHBhcnNlZCBhbmQgcmF3IHZhbHVlIG9mIHRoZSBzZWxlY3RvcnNcbiAgICAgICAgY29uc3QgcGFyc2VkID0gdGhpcy5jb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKGFzTGl0ZXJhbChyM1NlbGVjdG9ycyksIHRydWUpO1xuICAgICAgICBjb25zdCB1blBhcnNlZCA9IHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChhc0xpdGVyYWwobmdDb250ZW50U2VsZWN0b3JzKSwgdHJ1ZSk7XG4gICAgICAgIHBhcmFtZXRlcnMucHVzaChwYXJzZWQsIHVuUGFyc2VkKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnN0cnVjdGlvbih0aGlzLl9jcmVhdGlvbkNvZGUsIG51bGwsIFIzLnByb2plY3Rpb25EZWYsIC4uLnBhcmFtZXRlcnMpO1xuICAgIH1cblxuICAgIHQudmlzaXRBbGwodGhpcywgbm9kZXMpO1xuXG4gICAgaWYgKHRoaXMuX3B1cmVGdW5jdGlvblNsb3RzID4gMCkge1xuICAgICAgdGhpcy5pbnN0cnVjdGlvbihcbiAgICAgICAgICB0aGlzLl9jcmVhdGlvbkNvZGUsIG51bGwsIFIzLnJlc2VydmVTbG90cywgby5saXRlcmFsKHRoaXMuX3B1cmVGdW5jdGlvblNsb3RzKSk7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRpb25Db2RlID0gdGhpcy5fY3JlYXRpb25Db2RlLmxlbmd0aCA+IDAgP1xuICAgICAgICBbcmVuZGVyRmxhZ0NoZWNrSWZTdG10KGNvcmUuUmVuZGVyRmxhZ3MuQ3JlYXRlLCB0aGlzLl9jcmVhdGlvbkNvZGUpXSA6XG4gICAgICAgIFtdO1xuXG4gICAgY29uc3QgdXBkYXRlQ29kZSA9IHRoaXMuX2JpbmRpbmdDb2RlLmxlbmd0aCA+IDAgP1xuICAgICAgICBbcmVuZGVyRmxhZ0NoZWNrSWZTdG10KGNvcmUuUmVuZGVyRmxhZ3MuVXBkYXRlLCB0aGlzLl9iaW5kaW5nQ29kZSldIDpcbiAgICAgICAgW107XG5cbiAgICAvLyBHZW5lcmF0ZSBtYXBzIG9mIHBsYWNlaG9sZGVyIG5hbWUgdG8gbm9kZSBpbmRleGVzXG4gICAgLy8gVE9ETyh2aWNiKTogVGhpcyBpcyBhIFdJUCwgbm90IGZ1bGx5IHN1cHBvcnRlZCB5ZXRcbiAgICBmb3IgKGNvbnN0IHBoVG9Ob2RlSWR4IG9mIHRoaXMuX3BoVG9Ob2RlSWR4ZXMpIHtcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwaFRvTm9kZUlkeCkubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBzY29wZWROYW1lID0gdGhpcy5fYmluZGluZ1Njb3BlLmZyZXNoUmVmZXJlbmNlTmFtZSgpO1xuICAgICAgICBjb25zdCBwaE1hcCA9IG8udmFyaWFibGUoc2NvcGVkTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldChtYXBUb0V4cHJlc3Npb24ocGhUb05vZGVJZHgsIHRydWUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAudG9EZWNsU3RtdChvLklORkVSUkVEX1RZUEUsIFtvLlN0bXRNb2RpZmllci5GaW5hbF0pO1xuXG4gICAgICAgIHRoaXMuX3ByZWZpeENvZGUucHVzaChwaE1hcCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG8uZm4oXG4gICAgICAgIFtuZXcgby5GblBhcmFtKFJFTkRFUl9GTEFHUywgby5OVU1CRVJfVFlQRSksIG5ldyBvLkZuUGFyYW0odGhpcy5jb250ZXh0UGFyYW1ldGVyLCBudWxsKV0sXG4gICAgICAgIFtcbiAgICAgICAgICAvLyBUZW1wb3JhcnkgdmFyaWFibGUgZGVjbGFyYXRpb25zIGZvciBxdWVyeSByZWZyZXNoIChpLmUuIGxldCBfdDogYW55OylcbiAgICAgICAgICAuLi50aGlzLl9wcmVmaXhDb2RlLFxuICAgICAgICAgIC8vIENyZWF0aW5nIG1vZGUgKGkuZS4gaWYgKHJmICYgUmVuZGVyRmxhZ3MuQ3JlYXRlKSB7IC4uLiB9KVxuICAgICAgICAgIC4uLmNyZWF0aW9uQ29kZSxcbiAgICAgICAgICAvLyBUZW1wb3JhcnkgdmFyaWFibGUgZGVjbGFyYXRpb25zIGZvciBsb2NhbCByZWZzIChpLmUuIGNvbnN0IHRtcCA9IGxkKDEpIGFzIGFueSlcbiAgICAgICAgICAuLi50aGlzLl92YXJpYWJsZUNvZGUsXG4gICAgICAgICAgLy8gQmluZGluZyBhbmQgcmVmcmVzaCBtb2RlIChpLmUuIGlmIChyZiAmIFJlbmRlckZsYWdzLlVwZGF0ZSkgey4uLn0pXG4gICAgICAgICAgLi4udXBkYXRlQ29kZSxcbiAgICAgICAgICAvLyBOZXN0ZWQgdGVtcGxhdGVzIChpLmUuIGZ1bmN0aW9uIENvbXBUZW1wbGF0ZSgpIHt9KVxuICAgICAgICAgIC4uLnRoaXMuX3Bvc3RmaXhDb2RlXG4gICAgICAgIF0sXG4gICAgICAgIG8uSU5GRVJSRURfVFlQRSwgbnVsbCwgdGhpcy50ZW1wbGF0ZU5hbWUpO1xuICB9XG5cbiAgLy8gTG9jYWxSZXNvbHZlclxuICBnZXRMb2NhbChuYW1lOiBzdHJpbmcpOiBvLkV4cHJlc3Npb258bnVsbCB7IHJldHVybiB0aGlzLl9iaW5kaW5nU2NvcGUuZ2V0KG5hbWUpOyB9XG5cbiAgdmlzaXRDb250ZW50KG5nQ29udGVudDogdC5Db250ZW50KSB7XG4gICAgY29uc3Qgc2xvdCA9IHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpO1xuICAgIGNvbnN0IHNlbGVjdG9ySW5kZXggPSBuZ0NvbnRlbnQuc2VsZWN0b3JJbmRleDtcbiAgICBjb25zdCBwYXJhbWV0ZXJzOiBvLkV4cHJlc3Npb25bXSA9IFtvLmxpdGVyYWwoc2xvdCldO1xuXG4gICAgY29uc3QgYXR0cmlidXRlQXNMaXN0OiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgbmdDb250ZW50LmF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiB7XG4gICAgICBjb25zdCBuYW1lID0gYXR0cmlidXRlLm5hbWU7XG4gICAgICBpZiAobmFtZSAhPT0gJ3NlbGVjdCcpIHtcbiAgICAgICAgYXR0cmlidXRlQXNMaXN0LnB1c2gobmFtZSwgYXR0cmlidXRlLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChhdHRyaWJ1dGVBc0xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8ubGl0ZXJhbChzZWxlY3RvckluZGV4KSwgYXNMaXRlcmFsKGF0dHJpYnV0ZUFzTGlzdCkpO1xuICAgIH0gZWxzZSBpZiAoc2VsZWN0b3JJbmRleCAhPT0gMCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8ubGl0ZXJhbChzZWxlY3RvckluZGV4KSk7XG4gICAgfVxuXG4gICAgdGhpcy5pbnN0cnVjdGlvbih0aGlzLl9jcmVhdGlvbkNvZGUsIG5nQ29udGVudC5zb3VyY2VTcGFuLCBSMy5wcm9qZWN0aW9uLCAuLi5wYXJhbWV0ZXJzKTtcbiAgfVxuXG5cbiAgZ2V0TmFtZXNwYWNlSW5zdHJ1Y3Rpb24obmFtZXNwYWNlS2V5OiBzdHJpbmd8bnVsbCkge1xuICAgIHN3aXRjaCAobmFtZXNwYWNlS2V5KSB7XG4gICAgICBjYXNlICdtYXRoJzpcbiAgICAgICAgcmV0dXJuIFIzLm5hbWVzcGFjZU1hdGhNTDtcbiAgICAgIGNhc2UgJ3N2Zyc6XG4gICAgICAgIHJldHVybiBSMy5uYW1lc3BhY2VTVkc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gUjMubmFtZXNwYWNlSFRNTDtcbiAgICB9XG4gIH1cblxuICBhZGROYW1lc3BhY2VJbnN0cnVjdGlvbihuc0luc3RydWN0aW9uOiBvLkV4dGVybmFsUmVmZXJlbmNlLCBlbGVtZW50OiB0LkVsZW1lbnQpIHtcbiAgICB0aGlzLl9uYW1lc3BhY2UgPSBuc0luc3RydWN0aW9uO1xuICAgIHRoaXMuaW5zdHJ1Y3Rpb24odGhpcy5fY3JlYXRpb25Db2RlLCBlbGVtZW50LnNvdXJjZVNwYW4sIG5zSW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IHQuRWxlbWVudCkge1xuICAgIGNvbnN0IGVsZW1lbnRJbmRleCA9IHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpO1xuICAgIGNvbnN0IHJlZmVyZW5jZURhdGFTbG90cyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gICAgY29uc3Qgd2FzSW5JMThuU2VjdGlvbiA9IHRoaXMuX2luSTE4blNlY3Rpb247XG5cbiAgICBjb25zdCBvdXRwdXRBdHRyczoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgY29uc3QgYXR0ckkxOG5NZXRhczoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgbGV0IGkxOG5NZXRhOiBzdHJpbmcgPSAnJztcblxuICAgIGNvbnN0IFtuYW1lc3BhY2VLZXksIGVsZW1lbnROYW1lXSA9IHNwbGl0TnNOYW1lKGVsZW1lbnQubmFtZSk7XG5cbiAgICAvLyBFbGVtZW50cyBpbnNpZGUgaTE4biBzZWN0aW9ucyBhcmUgcmVwbGFjZWQgd2l0aCBwbGFjZWhvbGRlcnNcbiAgICAvLyBUT0RPKHZpY2IpOiBuZXN0ZWQgZWxlbWVudHMgYXJlIGEgV0lQIGluIHRoaXMgcGhhc2VcbiAgICBpZiAodGhpcy5faW5JMThuU2VjdGlvbikge1xuICAgICAgY29uc3QgcGhOYW1lID0gZWxlbWVudC5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIXRoaXMuX3BoVG9Ob2RlSWR4ZXNbdGhpcy5faTE4blNlY3Rpb25JbmRleF1bcGhOYW1lXSkge1xuICAgICAgICB0aGlzLl9waFRvTm9kZUlkeGVzW3RoaXMuX2kxOG5TZWN0aW9uSW5kZXhdW3BoTmFtZV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3BoVG9Ob2RlSWR4ZXNbdGhpcy5faTE4blNlY3Rpb25JbmRleF1bcGhOYW1lXS5wdXNoKGVsZW1lbnRJbmRleCk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGkxOG4gYXR0cmlidXRlc1xuICAgIGZvciAoY29uc3QgYXR0ciBvZiBlbGVtZW50LmF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBhdHRyLm5hbWU7XG4gICAgICBjb25zdCB2YWx1ZSA9IGF0dHIudmFsdWU7XG4gICAgICBpZiAobmFtZSA9PT0gSTE4Tl9BVFRSKSB7XG4gICAgICAgIGlmICh0aGlzLl9pbkkxOG5TZWN0aW9uKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgQ291bGQgbm90IG1hcmsgYW4gZWxlbWVudCBhcyB0cmFuc2xhdGFibGUgaW5zaWRlIG9mIGEgdHJhbnNsYXRhYmxlIHNlY3Rpb25gKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbkkxOG5TZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5faTE4blNlY3Rpb25JbmRleCsrO1xuICAgICAgICB0aGlzLl9waFRvTm9kZUlkeGVzW3RoaXMuX2kxOG5TZWN0aW9uSW5kZXhdID0ge307XG4gICAgICAgIGkxOG5NZXRhID0gdmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUuc3RhcnRzV2l0aChJMThOX0FUVFJfUFJFRklYKSkge1xuICAgICAgICBhdHRySTE4bk1ldGFzW25hbWUuc2xpY2UoSTE4Tl9BVFRSX1BSRUZJWC5sZW5ndGgpXSA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0QXR0cnNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYXRjaCBkaXJlY3RpdmVzIG9uIG5vbiBpMThuIGF0dHJpYnV0ZXNcbiAgICBpZiAodGhpcy5kaXJlY3RpdmVNYXRjaGVyKSB7XG4gICAgICBjb25zdCBzZWxlY3RvciA9IGNyZWF0ZUNzc1NlbGVjdG9yKGVsZW1lbnQubmFtZSwgb3V0cHV0QXR0cnMpO1xuICAgICAgdGhpcy5kaXJlY3RpdmVNYXRjaGVyLm1hdGNoKFxuICAgICAgICAgIHNlbGVjdG9yLCAoc2VsOiBDc3NTZWxlY3Rvciwgc3RhdGljVHlwZTogYW55KSA9PiB7IHRoaXMuZGlyZWN0aXZlcy5hZGQoc3RhdGljVHlwZSk7IH0pO1xuICAgIH1cblxuICAgIC8vIEVsZW1lbnQgY3JlYXRpb24gbW9kZVxuICAgIGNvbnN0IHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdID0gW1xuICAgICAgby5saXRlcmFsKGVsZW1lbnRJbmRleCksXG4gICAgICBvLmxpdGVyYWwoZWxlbWVudE5hbWUpLFxuICAgIF07XG5cbiAgICAvLyBBZGQgdGhlIGF0dHJpYnV0ZXNcbiAgICBjb25zdCBpMThuTWVzc2FnZXM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgICBjb25zdCBhdHRyaWJ1dGVzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICAgIGNvbnN0IGluaXRpYWxTdHlsZURlY2xhcmF0aW9uczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBjb25zdCBpbml0aWFsQ2xhc3NEZWNsYXJhdGlvbnM6IG8uRXhwcmVzc2lvbltdID0gW107XG5cbiAgICBjb25zdCBzdHlsZUlucHV0czogdC5Cb3VuZEF0dHJpYnV0ZVtdID0gW107XG4gICAgY29uc3QgY2xhc3NJbnB1dHM6IHQuQm91bmRBdHRyaWJ1dGVbXSA9IFtdO1xuICAgIGNvbnN0IGFsbE90aGVySW5wdXRzOiB0LkJvdW5kQXR0cmlidXRlW10gPSBbXTtcblxuICAgIGVsZW1lbnQuaW5wdXRzLmZvckVhY2goKGlucHV0OiB0LkJvdW5kQXR0cmlidXRlKSA9PiB7XG4gICAgICBzd2l0Y2ggKGlucHV0LnR5cGUpIHtcbiAgICAgICAgLy8gW2F0dHIuc3R5bGVdIG9yIFthdHRyLmNsYXNzXSBzaG91bGQgbm90IGJlIHRyZWF0ZWQgYXMgc3R5bGluZy1iYXNlZFxuICAgICAgICAvLyBiaW5kaW5ncyBzaW5jZSB0aGV5IGFyZSBpbnRlbmRlZCB0byBiZSB3cml0dGVuIGRpcmVjdGx5IHRvIHRoZSBhdHRyXG4gICAgICAgIC8vIGFuZCB0aGVyZWZvcmUgd2lsbCBza2lwIGFsbCBzdHlsZS9jbGFzcyByZXNvbHV0aW9uIHRoYXQgaXMgcHJlc2VudFxuICAgICAgICAvLyB3aXRoIHN0eWxlPVwiXCIsIFtzdHlsZV09XCJcIiBhbmQgW3N0eWxlLnByb3BdPVwiXCIsIGNsYXNzPVwiXCIsXG4gICAgICAgIC8vIFtjbGFzcy5wcm9wXT1cIlwiLiBbY2xhc3NdPVwiXCIgYXNzaWdubWVudHNcbiAgICAgICAgY2FzZSBCaW5kaW5nVHlwZS5Qcm9wZXJ0eTpcbiAgICAgICAgICBpZiAoaW5wdXQubmFtZSA9PSAnc3R5bGUnKSB7XG4gICAgICAgICAgICAvLyB0aGlzIHNob3VsZCBhbHdheXMgZ28gZmlyc3QgaW4gdGhlIGNvbXBpbGF0aW9uIChmb3IgW3N0eWxlXSlcbiAgICAgICAgICAgIHN0eWxlSW5wdXRzLnNwbGljZSgwLCAwLCBpbnB1dCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpc0NsYXNzQmluZGluZyhpbnB1dCkpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgc2hvdWxkIGFsd2F5cyBnbyBmaXJzdCBpbiB0aGUgY29tcGlsYXRpb24gKGZvciBbY2xhc3NdKVxuICAgICAgICAgICAgY2xhc3NJbnB1dHMuc3BsaWNlKDAsIDAsIGlucHV0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWxsT3RoZXJJbnB1dHMucHVzaChpbnB1dCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEJpbmRpbmdUeXBlLlN0eWxlOlxuICAgICAgICAgIHN0eWxlSW5wdXRzLnB1c2goaW5wdXQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEJpbmRpbmdUeXBlLkNsYXNzOlxuICAgICAgICAgIGNsYXNzSW5wdXRzLnB1c2goaW5wdXQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGFsbE90aGVySW5wdXRzLnB1c2goaW5wdXQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IGN1cnJTdHlsZUluZGV4ID0gMDtcbiAgICBsZXQgY3VyckNsYXNzSW5kZXggPSAwO1xuICAgIGxldCBzdGF0aWNTdHlsZXNNYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGwgPSBudWxsO1xuICAgIGxldCBzdGF0aWNDbGFzc2VzTWFwOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn18bnVsbCA9IG51bGw7XG4gICAgY29uc3Qgc3R5bGVzSW5kZXhNYXA6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9ID0ge307XG4gICAgY29uc3QgY2xhc3Nlc0luZGV4TWFwOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSA9IHt9O1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG91dHB1dEF0dHJzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBvdXRwdXRBdHRyc1tuYW1lXTtcbiAgICAgIGlmIChuYW1lID09ICdzdHlsZScpIHtcbiAgICAgICAgc3RhdGljU3R5bGVzTWFwID0gcGFyc2VTdHlsZSh2YWx1ZSk7XG4gICAgICAgIE9iamVjdC5rZXlzKHN0YXRpY1N0eWxlc01hcCkuZm9yRWFjaChwcm9wID0+IHsgc3R5bGVzSW5kZXhNYXBbcHJvcF0gPSBjdXJyU3R5bGVJbmRleCsrOyB9KTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZSA9PSAnY2xhc3MnKSB7XG4gICAgICAgIHN0YXRpY0NsYXNzZXNNYXAgPSB7fTtcbiAgICAgICAgdmFsdWUuc3BsaXQoL1xccysvZykuZm9yRWFjaChjbGFzc05hbWUgPT4ge1xuICAgICAgICAgIGNsYXNzZXNJbmRleE1hcFtjbGFzc05hbWVdID0gY3VyckNsYXNzSW5kZXgrKztcbiAgICAgICAgICBzdGF0aWNDbGFzc2VzTWFwICFbY2xhc3NOYW1lXSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXR0cmlidXRlcy5wdXNoKG8ubGl0ZXJhbChuYW1lKSk7XG4gICAgICAgIGlmIChhdHRySTE4bk1ldGFzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgY29uc3QgbWV0YSA9IHBhcnNlSTE4bk1ldGEoYXR0ckkxOG5NZXRhc1tuYW1lXSk7XG4gICAgICAgICAgY29uc3QgdmFyaWFibGUgPSB0aGlzLmNvbnN0YW50UG9vbC5nZXRUcmFuc2xhdGlvbih2YWx1ZSwgbWV0YSk7XG4gICAgICAgICAgYXR0cmlidXRlcy5wdXNoKHZhcmlhYmxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhdHRyaWJ1dGVzLnB1c2goby5saXRlcmFsKHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCBoYXNNYXBCYXNlZFN0eWxpbmcgPSBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0eWxlSW5wdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IHN0eWxlSW5wdXRzW2ldO1xuICAgICAgY29uc3QgaXNNYXBCYXNlZFN0eWxlQmluZGluZyA9IGkgPT09IDAgJiYgaW5wdXQubmFtZSA9PT0gJ3N0eWxlJztcbiAgICAgIGlmIChpc01hcEJhc2VkU3R5bGVCaW5kaW5nKSB7XG4gICAgICAgIGhhc01hcEJhc2VkU3R5bGluZyA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKCFzdHlsZXNJbmRleE1hcC5oYXNPd25Qcm9wZXJ0eShpbnB1dC5uYW1lKSkge1xuICAgICAgICBzdHlsZXNJbmRleE1hcFtpbnB1dC5uYW1lXSA9IGN1cnJTdHlsZUluZGV4Kys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc0lucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaW5wdXQgPSBjbGFzc0lucHV0c1tpXTtcbiAgICAgIGNvbnN0IGlzTWFwQmFzZWRDbGFzc0JpbmRpbmcgPSBpID09PSAwICYmIGlzQ2xhc3NCaW5kaW5nKGlucHV0KTtcbiAgICAgIGlmICghaXNNYXBCYXNlZENsYXNzQmluZGluZyAmJiAhc3R5bGVzSW5kZXhNYXAuaGFzT3duUHJvcGVydHkoaW5wdXQubmFtZSkpIHtcbiAgICAgICAgY2xhc3Nlc0luZGV4TWFwW2lucHV0Lm5hbWVdID0gY3VyckNsYXNzSW5kZXgrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpbiB0aGUgZXZlbnQgdGhhdCBhIFtzdHlsZV0gYmluZGluZyBpcyB1c2VkIHRoZW4gc2FuaXRpemF0aW9uIHdpbGxcbiAgICAvLyBhbHdheXMgYmUgaW1wb3J0ZWQgYmVjYXVzZSBpdCBpcyBub3QgcG9zc2libGUgdG8ga25vdyBhaGVhZCBvZiB0aW1lXG4gICAgLy8gd2hldGhlciBzdHlsZSBiaW5kaW5ncyB3aWxsIHVzZSBvciBub3QgdXNlIGFueSBzYW5pdGl6YWJsZSBwcm9wZXJ0aWVzXG4gICAgLy8gdGhhdCBpc1N0eWxlU2FuaXRpemFibGUoKSB3aWxsIGRldGVjdFxuICAgIGxldCB1c2VEZWZhdWx0U3R5bGVTYW5pdGl6ZXIgPSBoYXNNYXBCYXNlZFN0eWxpbmc7XG5cbiAgICAvLyB0aGlzIHdpbGwgYnVpbGQgdGhlIGluc3RydWN0aW9ucyBzbyB0aGF0IHRoZXkgZmFsbCBpbnRvIHRoZSBmb2xsb3dpbmcgc3ludGF4XG4gICAgLy8gPT4gW3Byb3AxLCBwcm9wMiwgcHJvcDMsIDAsIHByb3AxLCB2YWx1ZTEsIHByb3AyLCB2YWx1ZTJdXG4gICAgT2JqZWN0LmtleXMoc3R5bGVzSW5kZXhNYXApLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICB1c2VEZWZhdWx0U3R5bGVTYW5pdGl6ZXIgPSB1c2VEZWZhdWx0U3R5bGVTYW5pdGl6ZXIgfHwgaXNTdHlsZVNhbml0aXphYmxlKHByb3ApO1xuICAgICAgaW5pdGlhbFN0eWxlRGVjbGFyYXRpb25zLnB1c2goby5saXRlcmFsKHByb3ApKTtcbiAgICB9KTtcblxuICAgIGlmIChzdGF0aWNTdHlsZXNNYXApIHtcbiAgICAgIGluaXRpYWxTdHlsZURlY2xhcmF0aW9ucy5wdXNoKG8ubGl0ZXJhbChjb3JlLkluaXRpYWxTdHlsaW5nRmxhZ3MuVkFMVUVTX01PREUpKTtcblxuICAgICAgT2JqZWN0LmtleXMoc3RhdGljU3R5bGVzTWFwKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBpbml0aWFsU3R5bGVEZWNsYXJhdGlvbnMucHVzaChvLmxpdGVyYWwocHJvcCkpO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHN0YXRpY1N0eWxlc01hcCAhW3Byb3BdO1xuICAgICAgICBpbml0aWFsU3R5bGVEZWNsYXJhdGlvbnMucHVzaChvLmxpdGVyYWwodmFsdWUpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKGNsYXNzZXNJbmRleE1hcCkuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGluaXRpYWxDbGFzc0RlY2xhcmF0aW9ucy5wdXNoKG8ubGl0ZXJhbChwcm9wKSk7XG4gICAgfSk7XG5cbiAgICBpZiAoc3RhdGljQ2xhc3Nlc01hcCkge1xuICAgICAgaW5pdGlhbENsYXNzRGVjbGFyYXRpb25zLnB1c2goby5saXRlcmFsKGNvcmUuSW5pdGlhbFN0eWxpbmdGbGFncy5WQUxVRVNfTU9ERSkpO1xuXG4gICAgICBPYmplY3Qua2V5cyhzdGF0aWNDbGFzc2VzTWFwKS5mb3JFYWNoKGNsYXNzTmFtZSA9PiB7XG4gICAgICAgIGluaXRpYWxDbGFzc0RlY2xhcmF0aW9ucy5wdXNoKG8ubGl0ZXJhbChjbGFzc05hbWUpKTtcbiAgICAgICAgaW5pdGlhbENsYXNzRGVjbGFyYXRpb25zLnB1c2goby5saXRlcmFsKHRydWUpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc1N0eWxpbmdJbnN0cnVjdGlvbnMgPSBpbml0aWFsU3R5bGVEZWNsYXJhdGlvbnMubGVuZ3RoIHx8IHN0eWxlSW5wdXRzLmxlbmd0aCB8fFxuICAgICAgICBpbml0aWFsQ2xhc3NEZWNsYXJhdGlvbnMubGVuZ3RoIHx8IGNsYXNzSW5wdXRzLmxlbmd0aDtcblxuICAgIGNvbnN0IGF0dHJBcmc6IG8uRXhwcmVzc2lvbiA9IGF0dHJpYnV0ZXMubGVuZ3RoID4gMCA/XG4gICAgICAgIHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChvLmxpdGVyYWxBcnIoYXR0cmlidXRlcyksIHRydWUpIDpcbiAgICAgICAgby5UWVBFRF9OVUxMX0VYUFI7XG4gICAgcGFyYW1ldGVycy5wdXNoKGF0dHJBcmcpO1xuXG4gICAgaWYgKGVsZW1lbnQucmVmZXJlbmNlcyAmJiBlbGVtZW50LnJlZmVyZW5jZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgcmVmZXJlbmNlcyA9IGZsYXR0ZW4oZWxlbWVudC5yZWZlcmVuY2VzLm1hcChyZWZlcmVuY2UgPT4ge1xuICAgICAgICBjb25zdCBzbG90ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG4gICAgICAgIHJlZmVyZW5jZURhdGFTbG90cy5zZXQocmVmZXJlbmNlLm5hbWUsIHNsb3QpO1xuICAgICAgICAvLyBHZW5lcmF0ZSB0aGUgdXBkYXRlIHRlbXBvcmFyeS5cbiAgICAgICAgY29uc3QgdmFyaWFibGVOYW1lID0gdGhpcy5fYmluZGluZ1Njb3BlLmZyZXNoUmVmZXJlbmNlTmFtZSgpO1xuICAgICAgICB0aGlzLl92YXJpYWJsZUNvZGUucHVzaChvLnZhcmlhYmxlKHZhcmlhYmxlTmFtZSwgby5JTkZFUlJFRF9UWVBFKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldChvLmltcG9ydEV4cHIoUjMubG9hZCkuY2FsbEZuKFtvLmxpdGVyYWwoc2xvdCldKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuICAgICAgICB0aGlzLl9iaW5kaW5nU2NvcGUuc2V0KHJlZmVyZW5jZS5uYW1lLCBvLnZhcmlhYmxlKHZhcmlhYmxlTmFtZSkpO1xuICAgICAgICByZXR1cm4gW3JlZmVyZW5jZS5uYW1lLCByZWZlcmVuY2UudmFsdWVdO1xuICAgICAgfSkpO1xuICAgICAgcGFyYW1ldGVycy5wdXNoKHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChhc0xpdGVyYWwocmVmZXJlbmNlcyksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8uVFlQRURfTlVMTF9FWFBSKTtcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSB0aGUgaW5zdHJ1Y3Rpb24gY3JlYXRlIGVsZW1lbnQgaW5zdHJ1Y3Rpb25cbiAgICBpZiAoaTE4bk1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX2NyZWF0aW9uQ29kZS5wdXNoKC4uLmkxOG5NZXNzYWdlcyk7XG4gICAgfVxuXG4gICAgY29uc3Qgd2FzSW5OYW1lc3BhY2UgPSB0aGlzLl9uYW1lc3BhY2U7XG4gICAgY29uc3QgY3VycmVudE5hbWVzcGFjZSA9IHRoaXMuZ2V0TmFtZXNwYWNlSW5zdHJ1Y3Rpb24obmFtZXNwYWNlS2V5KTtcblxuICAgIC8vIElmIHRoZSBuYW1lc3BhY2UgaXMgY2hhbmdpbmcgbm93LCBpbmNsdWRlIGFuIGluc3RydWN0aW9uIHRvIGNoYW5nZSBpdFxuICAgIC8vIGR1cmluZyBlbGVtZW50IGNyZWF0aW9uLlxuICAgIGlmIChjdXJyZW50TmFtZXNwYWNlICE9PSB3YXNJbk5hbWVzcGFjZSkge1xuICAgICAgdGhpcy5hZGROYW1lc3BhY2VJbnN0cnVjdGlvbihjdXJyZW50TmFtZXNwYWNlLCBlbGVtZW50KTtcbiAgICB9XG5cbiAgICBjb25zdCBpbXBsaWNpdCA9IG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKTtcblxuICAgIGNvbnN0IGNyZWF0ZVNlbGZDbG9zaW5nSW5zdHJ1Y3Rpb24gPVxuICAgICAgICAhaGFzU3R5bGluZ0luc3RydWN0aW9ucyAmJiBlbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA9PT0gMCAmJiBlbGVtZW50Lm91dHB1dHMubGVuZ3RoID09PSAwO1xuXG4gICAgaWYgKGNyZWF0ZVNlbGZDbG9zaW5nSW5zdHJ1Y3Rpb24pIHtcbiAgICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgdGhpcy5fY3JlYXRpb25Db2RlLCBlbGVtZW50LnNvdXJjZVNwYW4sIFIzLmVsZW1lbnQsIC4uLnRyaW1UcmFpbGluZ051bGxzKHBhcmFtZXRlcnMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gR2VuZXJhdGUgdGhlIGluc3RydWN0aW9uIGNyZWF0ZSBlbGVtZW50IGluc3RydWN0aW9uXG4gICAgICBpZiAoaTE4bk1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fY3JlYXRpb25Db2RlLnB1c2goLi4uaTE4bk1lc3NhZ2VzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgdGhpcy5fY3JlYXRpb25Db2RlLCBlbGVtZW50LnNvdXJjZVNwYW4sIFIzLmVsZW1lbnRTdGFydCxcbiAgICAgICAgICAuLi50cmltVHJhaWxpbmdOdWxscyhwYXJhbWV0ZXJzKSk7XG5cbiAgICAgIC8vIGluaXRpYWwgc3R5bGluZyBmb3Igc3RhdGljIHN0eWxlPVwiLi4uXCIgYXR0cmlidXRlc1xuICAgICAgaWYgKGhhc1N0eWxpbmdJbnN0cnVjdGlvbnMpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zTGlzdDogKG8uRXhwcmVzc2lvbilbXSA9IFtdO1xuXG4gICAgICAgIGlmIChpbml0aWFsQ2xhc3NEZWNsYXJhdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdGhlIHRlbXBsYXRlIGNvbXBpbGVyIGhhbmRsZXMgaW5pdGlhbCBjbGFzcyBzdHlsaW5nIChlLmcuIGNsYXNzPVwiZm9vXCIpIHZhbHVlc1xuICAgICAgICAgIC8vIGluIGEgc3BlY2lhbCBjb21tYW5kIGNhbGxlZCBgZWxlbWVudENsYXNzYCBzbyB0aGF0IHRoZSBpbml0aWFsIGNsYXNzXG4gICAgICAgICAgLy8gY2FuIGJlIHByb2Nlc3NlZCBkdXJpbmcgcnVudGltZS4gVGhlc2UgaW5pdGlhbCBjbGFzcyB2YWx1ZXMgYXJlIGJvdW5kIHRvXG4gICAgICAgICAgLy8gYSBjb25zdGFudCBiZWNhdXNlIHRoZSBpbml0YWwgY2xhc3MgdmFsdWVzIGRvIG5vdCBjaGFuZ2UgKHNpbmNlIHRoZXkncmUgc3RhdGljKS5cbiAgICAgICAgICBwYXJhbXNMaXN0LnB1c2goXG4gICAgICAgICAgICAgIHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChvLmxpdGVyYWxBcnIoaW5pdGlhbENsYXNzRGVjbGFyYXRpb25zKSwgdHJ1ZSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGluaXRpYWxTdHlsZURlY2xhcmF0aW9ucy5sZW5ndGggfHwgdXNlRGVmYXVsdFN0eWxlU2FuaXRpemVyKSB7XG4gICAgICAgICAgLy8gbm8gcG9pbnQgaW4gaGF2aW5nIGFuIGV4dHJhIGBudWxsYCB2YWx1ZSB1bmxlc3MgdGhlcmUgYXJlIGZvbGxvdy11cCBwYXJhbXNcbiAgICAgICAgICBwYXJhbXNMaXN0LnB1c2goby5OVUxMX0VYUFIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXRpYWxTdHlsZURlY2xhcmF0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAvLyB0aGUgdGVtcGxhdGUgY29tcGlsZXIgaGFuZGxlcyBpbml0aWFsIHN0eWxlIChlLmcuIHN0eWxlPVwiZm9vXCIpIHZhbHVlc1xuICAgICAgICAgIC8vIGluIGEgc3BlY2lhbCBjb21tYW5kIGNhbGxlZCBgZWxlbWVudFN0eWxlYCBzbyB0aGF0IHRoZSBpbml0aWFsIHN0eWxlc1xuICAgICAgICAgIC8vIGNhbiBiZSBwcm9jZXNzZWQgZHVyaW5nIHJ1bnRpbWUuIFRoZXNlIGluaXRpYWwgc3R5bGVzIHZhbHVlcyBhcmUgYm91bmQgdG9cbiAgICAgICAgICAvLyBhIGNvbnN0YW50IGJlY2F1c2UgdGhlIGluaXRhbCBzdHlsZSB2YWx1ZXMgZG8gbm90IGNoYW5nZSAoc2luY2UgdGhleSdyZSBzdGF0aWMpLlxuICAgICAgICAgIHBhcmFtc0xpc3QucHVzaChcbiAgICAgICAgICAgICAgdGhpcy5jb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKG8ubGl0ZXJhbEFycihpbml0aWFsU3R5bGVEZWNsYXJhdGlvbnMpLCB0cnVlKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodXNlRGVmYXVsdFN0eWxlU2FuaXRpemVyKSB7XG4gICAgICAgICAgLy8gbm8gcG9pbnQgaW4gaGF2aW5nIGFuIGV4dHJhIGBudWxsYCB2YWx1ZSB1bmxlc3MgdGhlcmUgYXJlIGZvbGxvdy11cCBwYXJhbXNcbiAgICAgICAgICBwYXJhbXNMaXN0LnB1c2goby5OVUxMX0VYUFIpO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAodXNlRGVmYXVsdFN0eWxlU2FuaXRpemVyKSB7XG4gICAgICAgICAgcGFyYW1zTGlzdC5wdXNoKG8uaW1wb3J0RXhwcihSMy5kZWZhdWx0U3R5bGVTYW5pdGl6ZXIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NyZWF0aW9uQ29kZS5wdXNoKG8uaW1wb3J0RXhwcihSMy5lbGVtZW50U3R5bGluZykuY2FsbEZuKHBhcmFtc0xpc3QpLnRvU3RtdCgpKTtcbiAgICAgIH1cblxuICAgICAgLy8gR2VuZXJhdGUgTGlzdGVuZXJzIChvdXRwdXRzKVxuICAgICAgZWxlbWVudC5vdXRwdXRzLmZvckVhY2goKG91dHB1dEFzdDogdC5Cb3VuZEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGVsTmFtZSA9IHNhbml0aXplSWRlbnRpZmllcihlbGVtZW50Lm5hbWUpO1xuICAgICAgICBjb25zdCBldk5hbWUgPSBzYW5pdGl6ZUlkZW50aWZpZXIob3V0cHV0QXN0Lm5hbWUpO1xuICAgICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBgJHt0aGlzLnRlbXBsYXRlTmFtZX1fJHtlbE5hbWV9XyR7ZXZOYW1lfV9saXN0ZW5lcmA7XG4gICAgICAgIGNvbnN0IGxvY2FsVmFyczogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgICAgICBjb25zdCBiaW5kaW5nU2NvcGUgPVxuICAgICAgICAgICAgdGhpcy5fYmluZGluZ1Njb3BlLm5lc3RlZFNjb3BlKChsaHNWYXI6IG8uUmVhZFZhckV4cHIsIHJoc0V4cHJlc3Npb246IG8uRXhwcmVzc2lvbikgPT4ge1xuICAgICAgICAgICAgICBsb2NhbFZhcnMucHVzaChcbiAgICAgICAgICAgICAgICAgIGxoc1Zhci5zZXQocmhzRXhwcmVzc2lvbikudG9EZWNsU3RtdChvLklORkVSUkVEX1RZUEUsIFtvLlN0bXRNb2RpZmllci5GaW5hbF0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjb25zdCBiaW5kaW5nRXhwciA9IGNvbnZlcnRBY3Rpb25CaW5kaW5nKFxuICAgICAgICAgICAgYmluZGluZ1Njb3BlLCBpbXBsaWNpdCwgb3V0cHV0QXN0LmhhbmRsZXIsICdiJyxcbiAgICAgICAgICAgICgpID0+IGVycm9yKCdVbmV4cGVjdGVkIGludGVycG9sYXRpb24nKSk7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBvLmZuKFxuICAgICAgICAgICAgW25ldyBvLkZuUGFyYW0oJyRldmVudCcsIG8uRFlOQU1JQ19UWVBFKV0sIFsuLi5sb2NhbFZhcnMsIC4uLmJpbmRpbmdFeHByLnJlbmRlcjNTdG10c10sXG4gICAgICAgICAgICBvLklORkVSUkVEX1RZUEUsIG51bGwsIGZ1bmN0aW9uTmFtZSk7XG4gICAgICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGlvbkNvZGUsIG91dHB1dEFzdC5zb3VyY2VTcGFuLCBSMy5saXN0ZW5lciwgby5saXRlcmFsKG91dHB1dEFzdC5uYW1lKSxcbiAgICAgICAgICAgIGhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKChzdHlsZUlucHV0cy5sZW5ndGggfHwgY2xhc3NJbnB1dHMubGVuZ3RoKSAmJiBoYXNTdHlsaW5nSW5zdHJ1Y3Rpb25zKSB7XG4gICAgICBjb25zdCBpbmRleExpdGVyYWwgPSBvLmxpdGVyYWwoZWxlbWVudEluZGV4KTtcblxuICAgICAgY29uc3QgZmlyc3RTdHlsZSA9IHN0eWxlSW5wdXRzWzBdO1xuICAgICAgY29uc3QgbWFwQmFzZWRTdHlsZUlucHV0ID0gZmlyc3RTdHlsZSAmJiBmaXJzdFN0eWxlLm5hbWUgPT0gJ3N0eWxlJyA/IGZpcnN0U3R5bGUgOiBudWxsO1xuXG4gICAgICBjb25zdCBmaXJzdENsYXNzID0gY2xhc3NJbnB1dHNbMF07XG4gICAgICBjb25zdCBtYXBCYXNlZENsYXNzSW5wdXQgPSBmaXJzdENsYXNzICYmIGlzQ2xhc3NCaW5kaW5nKGZpcnN0Q2xhc3MpID8gZmlyc3RDbGFzcyA6IG51bGw7XG5cbiAgICAgIGNvbnN0IHN0eWxpbmdJbnB1dCA9IG1hcEJhc2VkU3R5bGVJbnB1dCB8fCBtYXBCYXNlZENsYXNzSW5wdXQ7XG4gICAgICBpZiAoc3R5bGluZ0lucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcmFtczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICAgICAgaWYgKG1hcEJhc2VkQ2xhc3NJbnB1dCkge1xuICAgICAgICAgIHBhcmFtcy5wdXNoKHRoaXMuY29udmVydFByb3BlcnR5QmluZGluZyhpbXBsaWNpdCwgbWFwQmFzZWRDbGFzc0lucHV0LnZhbHVlLCB0cnVlKSk7XG4gICAgICAgIH0gZWxzZSBpZiAobWFwQmFzZWRTdHlsZUlucHV0KSB7XG4gICAgICAgICAgcGFyYW1zLnB1c2goby5OVUxMX0VYUFIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtYXBCYXNlZFN0eWxlSW5wdXQpIHtcbiAgICAgICAgICBwYXJhbXMucHVzaCh0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoaW1wbGljaXQsIG1hcEJhc2VkU3R5bGVJbnB1dC52YWx1ZSwgdHJ1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgICB0aGlzLl9iaW5kaW5nQ29kZSwgc3R5bGluZ0lucHV0LnNvdXJjZVNwYW4sIFIzLmVsZW1lbnRTdHlsaW5nTWFwLCBpbmRleExpdGVyYWwsXG4gICAgICAgICAgICAuLi5wYXJhbXMpO1xuICAgICAgfVxuXG4gICAgICBsZXQgbGFzdElucHV0Q29tbWFuZDogdC5Cb3VuZEF0dHJpYnV0ZXxudWxsID0gbnVsbDtcbiAgICAgIGlmIChzdHlsZUlucHV0cy5sZW5ndGgpIHtcbiAgICAgICAgbGV0IGkgPSBtYXBCYXNlZFN0eWxlSW5wdXQgPyAxIDogMDtcbiAgICAgICAgZm9yIChpOyBpIDwgc3R5bGVJbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBpbnB1dCA9IHN0eWxlSW5wdXRzW2ldO1xuICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZEJpbmRpbmcgPSB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoaW1wbGljaXQsIGlucHV0LnZhbHVlLCB0cnVlKTtcbiAgICAgICAgICBjb25zdCBwYXJhbXMgPSBbY29udmVydGVkQmluZGluZ107XG4gICAgICAgICAgY29uc3Qgc2FuaXRpemF0aW9uUmVmID0gcmVzb2x2ZVNhbml0aXphdGlvbkZuKGlucHV0LCBpbnB1dC5zZWN1cml0eUNvbnRleHQpO1xuICAgICAgICAgIGlmIChzYW5pdGl6YXRpb25SZWYpIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKHNhbml0aXphdGlvblJlZik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qga2V5ID0gaW5wdXQubmFtZTtcbiAgICAgICAgICBjb25zdCBzdHlsZUluZGV4OiBudW1iZXIgPSBzdHlsZXNJbmRleE1hcFtrZXldICE7XG4gICAgICAgICAgdGhpcy5pbnN0cnVjdGlvbihcbiAgICAgICAgICAgICAgdGhpcy5fYmluZGluZ0NvZGUsIGlucHV0LnNvdXJjZVNwYW4sIFIzLmVsZW1lbnRTdHlsZVByb3AsIGluZGV4TGl0ZXJhbCxcbiAgICAgICAgICAgICAgby5saXRlcmFsKHN0eWxlSW5kZXgpLCAuLi5wYXJhbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGFzdElucHV0Q29tbWFuZCA9IHN0eWxlSW5wdXRzW3N0eWxlSW5wdXRzLmxlbmd0aCAtIDFdO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2xhc3NJbnB1dHMubGVuZ3RoKSB7XG4gICAgICAgIGxldCBpID0gbWFwQmFzZWRDbGFzc0lucHV0ID8gMSA6IDA7XG4gICAgICAgIGZvciAoaTsgaSA8IGNsYXNzSW5wdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgaW5wdXQgPSBjbGFzc0lucHV0c1tpXTtcbiAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRCaW5kaW5nID0gdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKGltcGxpY2l0LCBpbnB1dC52YWx1ZSwgdHJ1ZSk7XG4gICAgICAgICAgY29uc3QgcGFyYW1zID0gW2NvbnZlcnRlZEJpbmRpbmddO1xuICAgICAgICAgIGNvbnN0IHNhbml0aXphdGlvblJlZiA9IHJlc29sdmVTYW5pdGl6YXRpb25GbihpbnB1dCwgaW5wdXQuc2VjdXJpdHlDb250ZXh0KTtcbiAgICAgICAgICBpZiAoc2FuaXRpemF0aW9uUmVmKSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaChzYW5pdGl6YXRpb25SZWYpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGtleSA9IGlucHV0Lm5hbWU7XG4gICAgICAgICAgY29uc3QgY2xhc3NJbmRleDogbnVtYmVyID0gY2xhc3Nlc0luZGV4TWFwW2tleV0gITtcbiAgICAgICAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICAgICAgICB0aGlzLl9iaW5kaW5nQ29kZSwgaW5wdXQuc291cmNlU3BhbiwgUjMuZWxlbWVudENsYXNzUHJvcCwgaW5kZXhMaXRlcmFsLFxuICAgICAgICAgICAgICBvLmxpdGVyYWwoY2xhc3NJbmRleCksIC4uLnBhcmFtcyk7XG4gICAgICAgIH1cblxuICAgICAgICBsYXN0SW5wdXRDb21tYW5kID0gY2xhc3NJbnB1dHNbY2xhc3NJbnB1dHMubGVuZ3RoIC0gMV07XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgdGhpcy5fYmluZGluZ0NvZGUsIGxhc3RJbnB1dENvbW1hbmQgIS5zb3VyY2VTcGFuLCBSMy5lbGVtZW50U3R5bGluZ0FwcGx5LCBpbmRleExpdGVyYWwpO1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlIGVsZW1lbnQgaW5wdXQgYmluZGluZ3NcbiAgICBhbGxPdGhlcklucHV0cy5mb3JFYWNoKChpbnB1dDogdC5Cb3VuZEF0dHJpYnV0ZSkgPT4ge1xuICAgICAgaWYgKGlucHV0LnR5cGUgPT09IEJpbmRpbmdUeXBlLkFuaW1hdGlvbikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCd3YXJuaW5nOiBhbmltYXRpb24gYmluZGluZ3Mgbm90IHlldCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb252ZXJ0ZWRCaW5kaW5nID0gdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKGltcGxpY2l0LCBpbnB1dC52YWx1ZSk7XG5cbiAgICAgIGNvbnN0IGluc3RydWN0aW9uID0gbWFwQmluZGluZ1RvSW5zdHJ1Y3Rpb24oaW5wdXQudHlwZSk7XG4gICAgICBpZiAoaW5zdHJ1Y3Rpb24pIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gW2NvbnZlcnRlZEJpbmRpbmddO1xuICAgICAgICBjb25zdCBzYW5pdGl6YXRpb25SZWYgPSByZXNvbHZlU2FuaXRpemF0aW9uRm4oaW5wdXQsIGlucHV0LnNlY3VyaXR5Q29udGV4dCk7XG4gICAgICAgIGlmIChzYW5pdGl6YXRpb25SZWYpIHtcbiAgICAgICAgICBwYXJhbXMucHVzaChzYW5pdGl6YXRpb25SZWYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETyhjaHVja2opOiBydW50aW1lOiBzZWN1cml0eSBjb250ZXh0P1xuICAgICAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICAgICAgdGhpcy5fYmluZGluZ0NvZGUsIGlucHV0LnNvdXJjZVNwYW4sIGluc3RydWN0aW9uLCBvLmxpdGVyYWwoZWxlbWVudEluZGV4KSxcbiAgICAgICAgICAgIG8ubGl0ZXJhbChpbnB1dC5uYW1lKSwgLi4ucGFyYW1zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Vuc3VwcG9ydGVkKGBiaW5kaW5nIHR5cGUgJHtpbnB1dC50eXBlfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVHJhdmVyc2UgZWxlbWVudCBjaGlsZCBub2Rlc1xuICAgIGlmICh0aGlzLl9pbkkxOG5TZWN0aW9uICYmIGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoID09IDEgJiZcbiAgICAgICAgZWxlbWVudC5jaGlsZHJlblswXSBpbnN0YW5jZW9mIHQuVGV4dCkge1xuICAgICAgY29uc3QgdGV4dCA9IGVsZW1lbnQuY2hpbGRyZW5bMF0gYXMgdC5UZXh0O1xuICAgICAgdGhpcy52aXNpdFNpbmdsZUkxOG5UZXh0Q2hpbGQodGV4dCwgaTE4bk1ldGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0LnZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIGlmICghY3JlYXRlU2VsZkNsb3NpbmdJbnN0cnVjdGlvbikge1xuICAgICAgLy8gRmluaXNoIGVsZW1lbnQgY29uc3RydWN0aW9uIG1vZGUuXG4gICAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICAgIHRoaXMuX2NyZWF0aW9uQ29kZSwgZWxlbWVudC5lbmRTb3VyY2VTcGFuIHx8IGVsZW1lbnQuc291cmNlU3BhbiwgUjMuZWxlbWVudEVuZCk7XG4gICAgfVxuXG4gICAgLy8gUmVzdG9yZSB0aGUgc3RhdGUgYmVmb3JlIGV4aXRpbmcgdGhpcyBub2RlXG4gICAgdGhpcy5faW5JMThuU2VjdGlvbiA9IHdhc0luSTE4blNlY3Rpb247XG4gIH1cblxuICB2aXNpdFRlbXBsYXRlKHRlbXBsYXRlOiB0LlRlbXBsYXRlKSB7XG4gICAgY29uc3QgdGVtcGxhdGVJbmRleCA9IHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpO1xuXG4gICAgbGV0IGVsTmFtZSA9ICcnO1xuICAgIGlmICh0ZW1wbGF0ZS5jaGlsZHJlbi5sZW5ndGggPT09IDEgJiYgdGVtcGxhdGUuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiB0LkVsZW1lbnQpIHtcbiAgICAgIC8vIFdoZW4gdGhlIHRlbXBsYXRlIGFzIGEgc2luZ2xlIGNoaWxkLCBkZXJpdmUgdGhlIGNvbnRleHQgbmFtZSBmcm9tIHRoZSB0YWdcbiAgICAgIGVsTmFtZSA9IHNhbml0aXplSWRlbnRpZmllcigodGVtcGxhdGUuY2hpbGRyZW5bMF0gYXMgdC5FbGVtZW50KS5uYW1lKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0TmFtZSA9IGVsTmFtZSA/IGAke3RoaXMuY29udGV4dE5hbWV9XyR7ZWxOYW1lfWAgOiAnJztcblxuICAgIGNvbnN0IHRlbXBsYXRlTmFtZSA9XG4gICAgICAgIGNvbnRleHROYW1lID8gYCR7Y29udGV4dE5hbWV9X1RlbXBsYXRlXyR7dGVtcGxhdGVJbmRleH1gIDogYFRlbXBsYXRlXyR7dGVtcGxhdGVJbmRleH1gO1xuXG4gICAgY29uc3QgdGVtcGxhdGVDb250ZXh0ID0gYGN0eCR7dGhpcy5sZXZlbH1gO1xuXG4gICAgY29uc3QgcGFyYW1ldGVyczogby5FeHByZXNzaW9uW10gPSBbXG4gICAgICBvLmxpdGVyYWwodGVtcGxhdGVJbmRleCksXG4gICAgICBvLnZhcmlhYmxlKHRlbXBsYXRlTmFtZSksXG4gICAgICBvLlRZUEVEX05VTExfRVhQUixcbiAgICBdO1xuXG4gICAgY29uc3QgYXR0cmlidXRlTmFtZXM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgY29uc3QgYXR0cmlidXRlTWFwOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcblxuICAgIHRlbXBsYXRlLmF0dHJpYnV0ZXMuZm9yRWFjaChhID0+IHtcbiAgICAgIGF0dHJpYnV0ZU5hbWVzLnB1c2goYXNMaXRlcmFsKGEubmFtZSksIGFzTGl0ZXJhbCgnJykpO1xuICAgICAgYXR0cmlidXRlTWFwW2EubmFtZV0gPSBhLnZhbHVlO1xuICAgIH0pO1xuXG4gICAgLy8gTWF0Y2ggZGlyZWN0aXZlcyBvbiB0ZW1wbGF0ZSBhdHRyaWJ1dGVzXG4gICAgaWYgKHRoaXMuZGlyZWN0aXZlTWF0Y2hlcikge1xuICAgICAgY29uc3Qgc2VsZWN0b3IgPSBjcmVhdGVDc3NTZWxlY3RvcignbmctdGVtcGxhdGUnLCBhdHRyaWJ1dGVNYXApO1xuICAgICAgdGhpcy5kaXJlY3RpdmVNYXRjaGVyLm1hdGNoKFxuICAgICAgICAgIHNlbGVjdG9yLCAoY3NzU2VsZWN0b3IsIHN0YXRpY1R5cGUpID0+IHsgdGhpcy5kaXJlY3RpdmVzLmFkZChzdGF0aWNUeXBlKTsgfSk7XG4gICAgfVxuXG4gICAgaWYgKGF0dHJpYnV0ZU5hbWVzLmxlbmd0aCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChvLmxpdGVyYWxBcnIoYXR0cmlidXRlTmFtZXMpLCB0cnVlKSk7XG4gICAgfVxuXG4gICAgLy8gZS5nLiBDKDEsIEMxVGVtcGxhdGUpXG4gICAgdGhpcy5pbnN0cnVjdGlvbihcbiAgICAgICAgdGhpcy5fY3JlYXRpb25Db2RlLCB0ZW1wbGF0ZS5zb3VyY2VTcGFuLCBSMy5jb250YWluZXJDcmVhdGUsXG4gICAgICAgIC4uLnRyaW1UcmFpbGluZ051bGxzKHBhcmFtZXRlcnMpKTtcblxuICAgIC8vIGUuZy4gcCgxLCAnZm9yT2YnLCDJtWIoY3R4Lml0ZW1zKSk7XG4gICAgY29uc3QgY29udGV4dCA9IG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKTtcbiAgICB0ZW1wbGF0ZS5pbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgICBjb25zdCBjb252ZXJ0ZWRCaW5kaW5nID0gdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKGNvbnRleHQsIGlucHV0LnZhbHVlKTtcbiAgICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgdGhpcy5fYmluZGluZ0NvZGUsIHRlbXBsYXRlLnNvdXJjZVNwYW4sIFIzLmVsZW1lbnRQcm9wZXJ0eSwgby5saXRlcmFsKHRlbXBsYXRlSW5kZXgpLFxuICAgICAgICAgIG8ubGl0ZXJhbChpbnB1dC5uYW1lKSwgY29udmVydGVkQmluZGluZyk7XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHRlbXBsYXRlIGZ1bmN0aW9uXG4gICAgY29uc3QgdGVtcGxhdGVWaXNpdG9yID0gbmV3IFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIoXG4gICAgICAgIHRoaXMuY29uc3RhbnRQb29sLCB0ZW1wbGF0ZUNvbnRleHQsIHRoaXMuX2JpbmRpbmdTY29wZSwgdGhpcy5sZXZlbCArIDEsIGNvbnRleHROYW1lLFxuICAgICAgICB0ZW1wbGF0ZU5hbWUsIFtdLCB0aGlzLmRpcmVjdGl2ZU1hdGNoZXIsIHRoaXMuZGlyZWN0aXZlcywgdGhpcy5waXBlVHlwZUJ5TmFtZSwgdGhpcy5waXBlcyxcbiAgICAgICAgdGhpcy5fbmFtZXNwYWNlKTtcbiAgICBjb25zdCB0ZW1wbGF0ZUZ1bmN0aW9uRXhwciA9XG4gICAgICAgIHRlbXBsYXRlVmlzaXRvci5idWlsZFRlbXBsYXRlRnVuY3Rpb24odGVtcGxhdGUuY2hpbGRyZW4sIHRlbXBsYXRlLnZhcmlhYmxlcyk7XG4gICAgdGhpcy5fcG9zdGZpeENvZGUucHVzaCh0ZW1wbGF0ZUZ1bmN0aW9uRXhwci50b0RlY2xTdG10KHRlbXBsYXRlTmFtZSwgbnVsbCkpO1xuICB9XG5cbiAgLy8gVGhlc2Ugc2hvdWxkIGJlIGhhbmRsZWQgaW4gdGhlIHRlbXBsYXRlIG9yIGVsZW1lbnQgZGlyZWN0bHkuXG4gIHJlYWRvbmx5IHZpc2l0UmVmZXJlbmNlID0gaW52YWxpZDtcbiAgcmVhZG9ubHkgdmlzaXRWYXJpYWJsZSA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0VGV4dEF0dHJpYnV0ZSA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0Qm91bmRBdHRyaWJ1dGUgPSBpbnZhbGlkO1xuICByZWFkb25seSB2aXNpdEJvdW5kRXZlbnQgPSBpbnZhbGlkO1xuXG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IHQuQm91bmRUZXh0KSB7XG4gICAgY29uc3Qgbm9kZUluZGV4ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG5cbiAgICB0aGlzLmluc3RydWN0aW9uKHRoaXMuX2NyZWF0aW9uQ29kZSwgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0LCBvLmxpdGVyYWwobm9kZUluZGV4KSk7XG5cbiAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLl9iaW5kaW5nQ29kZSwgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0QmluZGluZywgby5saXRlcmFsKG5vZGVJbmRleCksXG4gICAgICAgIHRoaXMuY29udmVydFByb3BlcnR5QmluZGluZyhvLnZhcmlhYmxlKENPTlRFWFRfTkFNRSksIHRleHQudmFsdWUpKTtcbiAgfVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiB0LlRleHQpIHtcbiAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLl9jcmVhdGlvbkNvZGUsIHRleHQuc291cmNlU3BhbiwgUjMudGV4dCwgby5saXRlcmFsKHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpKSxcbiAgICAgICAgby5saXRlcmFsKHRleHQudmFsdWUpKTtcbiAgfVxuXG4gIC8vIFdoZW4gdGhlIGNvbnRlbnQgb2YgdGhlIGVsZW1lbnQgaXMgYSBzaW5nbGUgdGV4dCBub2RlIHRoZSB0cmFuc2xhdGlvbiBjYW4gYmUgaW5saW5lZDpcbiAgLy9cbiAgLy8gYDxwIGkxOG49XCJkZXNjfG1lYW5cIj5zb21lIGNvbnRlbnQ8L3A+YFxuICAvLyBjb21waWxlcyB0b1xuICAvLyBgYGBcbiAgLy8gLyoqXG4gIC8vICogQGRlc2MgZGVzY1xuICAvLyAqIEBtZWFuaW5nIG1lYW5cbiAgLy8gKi9cbiAgLy8gY29uc3QgTVNHX1hZWiA9IGdvb2cuZ2V0TXNnKCdzb21lIGNvbnRlbnQnKTtcbiAgLy8gaTAuybVUKDEsIE1TR19YWVopO1xuICAvLyBgYGBcbiAgdmlzaXRTaW5nbGVJMThuVGV4dENoaWxkKHRleHQ6IHQuVGV4dCwgaTE4bk1ldGE6IHN0cmluZykge1xuICAgIGNvbnN0IG1ldGEgPSBwYXJzZUkxOG5NZXRhKGkxOG5NZXRhKTtcbiAgICBjb25zdCB2YXJpYWJsZSA9IHRoaXMuY29uc3RhbnRQb29sLmdldFRyYW5zbGF0aW9uKHRleHQudmFsdWUsIG1ldGEpO1xuICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgIHRoaXMuX2NyZWF0aW9uQ29kZSwgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0LCBvLmxpdGVyYWwodGhpcy5hbGxvY2F0ZURhdGFTbG90KCkpLCB2YXJpYWJsZSk7XG4gIH1cblxuICBwcml2YXRlIGFsbG9jYXRlRGF0YVNsb3QoKSB7IHJldHVybiB0aGlzLl9kYXRhSW5kZXgrKzsgfVxuICBwcml2YXRlIGJpbmRpbmdDb250ZXh0KCkgeyByZXR1cm4gYCR7dGhpcy5fYmluZGluZ0NvbnRleHQrK31gOyB9XG5cbiAgcHJpdmF0ZSBpbnN0cnVjdGlvbihcbiAgICAgIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sIHNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCByZWZlcmVuY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2UsXG4gICAgICAuLi5wYXJhbXM6IG8uRXhwcmVzc2lvbltdKSB7XG4gICAgc3RhdGVtZW50cy5wdXNoKG8uaW1wb3J0RXhwcihyZWZlcmVuY2UsIG51bGwsIHNwYW4pLmNhbGxGbihwYXJhbXMsIHNwYW4pLnRvU3RtdCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydFByb3BlcnR5QmluZGluZyhpbXBsaWNpdDogby5FeHByZXNzaW9uLCB2YWx1ZTogQVNULCBza2lwQmluZEZuPzogYm9vbGVhbik6XG4gICAgICBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IHBpcGVzQ29udmVydGVkVmFsdWUgPSB2YWx1ZS52aXNpdCh0aGlzLl92YWx1ZUNvbnZlcnRlcik7XG4gICAgaWYgKHBpcGVzQ29udmVydGVkVmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uKSB7XG4gICAgICBjb25zdCBjb252ZXJ0ZWRQcm9wZXJ0eUJpbmRpbmcgPSBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKFxuICAgICAgICAgIHRoaXMsIGltcGxpY2l0LCBwaXBlc0NvbnZlcnRlZFZhbHVlLCB0aGlzLmJpbmRpbmdDb250ZXh0KCksIEJpbmRpbmdGb3JtLlRyeVNpbXBsZSxcbiAgICAgICAgICBpbnRlcnBvbGF0ZSk7XG4gICAgICB0aGlzLl9iaW5kaW5nQ29kZS5wdXNoKC4uLmNvbnZlcnRlZFByb3BlcnR5QmluZGluZy5zdG10cyk7XG4gICAgICByZXR1cm4gY29udmVydGVkUHJvcGVydHlCaW5kaW5nLmN1cnJWYWxFeHByO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb252ZXJ0ZWRQcm9wZXJ0eUJpbmRpbmcgPSBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKFxuICAgICAgICAgIHRoaXMsIGltcGxpY2l0LCBwaXBlc0NvbnZlcnRlZFZhbHVlLCB0aGlzLmJpbmRpbmdDb250ZXh0KCksIEJpbmRpbmdGb3JtLlRyeVNpbXBsZSxcbiAgICAgICAgICAoKSA9PiBlcnJvcignVW5leHBlY3RlZCBpbnRlcnBvbGF0aW9uJykpO1xuICAgICAgdGhpcy5fYmluZGluZ0NvZGUucHVzaCguLi5jb252ZXJ0ZWRQcm9wZXJ0eUJpbmRpbmcuc3RtdHMpO1xuICAgICAgY29uc3QgdmFsRXhwciA9IGNvbnZlcnRlZFByb3BlcnR5QmluZGluZy5jdXJyVmFsRXhwcjtcbiAgICAgIHJldHVybiBza2lwQmluZEZuID8gdmFsRXhwciA6IG8uaW1wb3J0RXhwcihSMy5iaW5kKS5jYWxsRm4oW3ZhbEV4cHJdKTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgVmFsdWVDb252ZXJ0ZXIgZXh0ZW5kcyBBc3RNZW1vcnlFZmZpY2llbnRUcmFuc2Zvcm1lciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCwgcHJpdmF0ZSBhbGxvY2F0ZVNsb3Q6ICgpID0+IG51bWJlcixcbiAgICAgIHByaXZhdGUgYWxsb2NhdGVQdXJlRnVuY3Rpb25TbG90czogKG51bVNsb3RzOiBudW1iZXIpID0+IG51bWJlcixcbiAgICAgIHByaXZhdGUgZGVmaW5lUGlwZTpcbiAgICAgICAgICAobmFtZTogc3RyaW5nLCBsb2NhbE5hbWU6IHN0cmluZywgc2xvdDogbnVtYmVyLCB2YWx1ZTogby5FeHByZXNzaW9uKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIC8vIEFzdE1lbW9yeUVmZmljaWVudFRyYW5zZm9ybWVyXG4gIHZpc2l0UGlwZShwaXBlOiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICAvLyBBbGxvY2F0ZSBhIHNsb3QgdG8gY3JlYXRlIHRoZSBwaXBlXG4gICAgY29uc3Qgc2xvdCA9IHRoaXMuYWxsb2NhdGVTbG90KCk7XG4gICAgY29uc3Qgc2xvdFBzZXVkb0xvY2FsID0gYFBJUEU6JHtzbG90fWA7XG4gICAgLy8gQWxsb2NhdGUgb25lIHNsb3QgZm9yIHRoZSByZXN1bHQgcGx1cyBvbmUgc2xvdCBwZXIgcGlwZSBhcmd1bWVudFxuICAgIGNvbnN0IHB1cmVGdW5jdGlvblNsb3QgPSB0aGlzLmFsbG9jYXRlUHVyZUZ1bmN0aW9uU2xvdHMoMiArIHBpcGUuYXJncy5sZW5ndGgpO1xuICAgIGNvbnN0IHRhcmdldCA9IG5ldyBQcm9wZXJ0eVJlYWQocGlwZS5zcGFuLCBuZXcgSW1wbGljaXRSZWNlaXZlcihwaXBlLnNwYW4pLCBzbG90UHNldWRvTG9jYWwpO1xuICAgIGNvbnN0IHtpZGVudGlmaWVyLCBpc1Zhckxlbmd0aH0gPSBwaXBlQmluZGluZ0NhbGxJbmZvKHBpcGUuYXJncyk7XG4gICAgdGhpcy5kZWZpbmVQaXBlKHBpcGUubmFtZSwgc2xvdFBzZXVkb0xvY2FsLCBzbG90LCBvLmltcG9ydEV4cHIoaWRlbnRpZmllcikpO1xuICAgIGNvbnN0IGFyZ3M6IEFTVFtdID0gW3BpcGUuZXhwLCAuLi5waXBlLmFyZ3NdO1xuICAgIGNvbnN0IGNvbnZlcnRlZEFyZ3M6IEFTVFtdID1cbiAgICAgICAgaXNWYXJMZW5ndGggPyB0aGlzLnZpc2l0QWxsKFtuZXcgTGl0ZXJhbEFycmF5KHBpcGUuc3BhbiwgYXJncyldKSA6IHRoaXMudmlzaXRBbGwoYXJncyk7XG5cbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uQ2FsbChwaXBlLnNwYW4sIHRhcmdldCwgW1xuICAgICAgbmV3IExpdGVyYWxQcmltaXRpdmUocGlwZS5zcGFuLCBzbG90KSxcbiAgICAgIG5ldyBMaXRlcmFsUHJpbWl0aXZlKHBpcGUuc3BhbiwgcHVyZUZ1bmN0aW9uU2xvdCksXG4gICAgICAuLi5jb252ZXJ0ZWRBcmdzLFxuICAgIF0pO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXJyYXk6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJ1aWx0aW5GdW5jdGlvbkNhbGwoYXJyYXkuc3BhbiwgdGhpcy52aXNpdEFsbChhcnJheS5leHByZXNzaW9ucyksIHZhbHVlcyA9PiB7XG4gICAgICAvLyBJZiB0aGUgbGl0ZXJhbCBoYXMgY2FsY3VsYXRlZCAobm9uLWxpdGVyYWwpIGVsZW1lbnRzIHRyYW5zZm9ybSBpdCBpbnRvXG4gICAgICAvLyBjYWxscyB0byBsaXRlcmFsIGZhY3RvcmllcyB0aGF0IGNvbXBvc2UgdGhlIGxpdGVyYWwgYW5kIHdpbGwgY2FjaGUgaW50ZXJtZWRpYXRlXG4gICAgICAvLyB2YWx1ZXMuIE90aGVyd2lzZSwganVzdCByZXR1cm4gYW4gbGl0ZXJhbCBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB2YWx1ZXMuXG4gICAgICBjb25zdCBsaXRlcmFsID0gby5saXRlcmFsQXJyKHZhbHVlcyk7XG4gICAgICByZXR1cm4gdmFsdWVzLmV2ZXJ5KGEgPT4gYS5pc0NvbnN0YW50KCkpID9cbiAgICAgICAgICB0aGlzLmNvbnN0YW50UG9vbC5nZXRDb25zdExpdGVyYWwobGl0ZXJhbCwgdHJ1ZSkgOlxuICAgICAgICAgIGdldExpdGVyYWxGYWN0b3J5KHRoaXMuY29uc3RhbnRQb29sLCBsaXRlcmFsLCB0aGlzLmFsbG9jYXRlUHVyZUZ1bmN0aW9uU2xvdHMpO1xuICAgIH0pO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsTWFwKG1hcDogTGl0ZXJhbE1hcCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJ1aWx0aW5GdW5jdGlvbkNhbGwobWFwLnNwYW4sIHRoaXMudmlzaXRBbGwobWFwLnZhbHVlcyksIHZhbHVlcyA9PiB7XG4gICAgICAvLyBJZiB0aGUgbGl0ZXJhbCBoYXMgY2FsY3VsYXRlZCAobm9uLWxpdGVyYWwpIGVsZW1lbnRzICB0cmFuc2Zvcm0gaXQgaW50b1xuICAgICAgLy8gY2FsbHMgdG8gbGl0ZXJhbCBmYWN0b3JpZXMgdGhhdCBjb21wb3NlIHRoZSBsaXRlcmFsIGFuZCB3aWxsIGNhY2hlIGludGVybWVkaWF0ZVxuICAgICAgLy8gdmFsdWVzLiBPdGhlcndpc2UsIGp1c3QgcmV0dXJuIGFuIGxpdGVyYWwgYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdmFsdWVzLlxuICAgICAgY29uc3QgbGl0ZXJhbCA9IG8ubGl0ZXJhbE1hcCh2YWx1ZXMubWFwKFxuICAgICAgICAgICh2YWx1ZSwgaW5kZXgpID0+ICh7a2V5OiBtYXAua2V5c1tpbmRleF0ua2V5LCB2YWx1ZSwgcXVvdGVkOiBtYXAua2V5c1tpbmRleF0ucXVvdGVkfSkpKTtcbiAgICAgIHJldHVybiB2YWx1ZXMuZXZlcnkoYSA9PiBhLmlzQ29uc3RhbnQoKSkgP1xuICAgICAgICAgIHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChsaXRlcmFsLCB0cnVlKSA6XG4gICAgICAgICAgZ2V0TGl0ZXJhbEZhY3RvcnkodGhpcy5jb25zdGFudFBvb2wsIGxpdGVyYWwsIHRoaXMuYWxsb2NhdGVQdXJlRnVuY3Rpb25TbG90cyk7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gUGlwZXMgYWx3YXlzIGhhdmUgYXQgbGVhc3Qgb25lIHBhcmFtZXRlciwgdGhlIHZhbHVlIHRoZXkgb3BlcmF0ZSBvblxuY29uc3QgcGlwZUJpbmRpbmdJZGVudGlmaWVycyA9IFtSMy5waXBlQmluZDEsIFIzLnBpcGVCaW5kMiwgUjMucGlwZUJpbmQzLCBSMy5waXBlQmluZDRdO1xuXG5mdW5jdGlvbiBwaXBlQmluZGluZ0NhbGxJbmZvKGFyZ3M6IG8uRXhwcmVzc2lvbltdKSB7XG4gIGNvbnN0IGlkZW50aWZpZXIgPSBwaXBlQmluZGluZ0lkZW50aWZpZXJzW2FyZ3MubGVuZ3RoXTtcbiAgcmV0dXJuIHtcbiAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyIHx8IFIzLnBpcGVCaW5kVixcbiAgICBpc1Zhckxlbmd0aDogIWlkZW50aWZpZXIsXG4gIH07XG59XG5cbmNvbnN0IHB1cmVGdW5jdGlvbklkZW50aWZpZXJzID0gW1xuICBSMy5wdXJlRnVuY3Rpb24wLCBSMy5wdXJlRnVuY3Rpb24xLCBSMy5wdXJlRnVuY3Rpb24yLCBSMy5wdXJlRnVuY3Rpb24zLCBSMy5wdXJlRnVuY3Rpb240LFxuICBSMy5wdXJlRnVuY3Rpb241LCBSMy5wdXJlRnVuY3Rpb242LCBSMy5wdXJlRnVuY3Rpb243LCBSMy5wdXJlRnVuY3Rpb244XG5dO1xuXG5mdW5jdGlvbiBwdXJlRnVuY3Rpb25DYWxsSW5mbyhhcmdzOiBvLkV4cHJlc3Npb25bXSkge1xuICBjb25zdCBpZGVudGlmaWVyID0gcHVyZUZ1bmN0aW9uSWRlbnRpZmllcnNbYXJncy5sZW5ndGhdO1xuICByZXR1cm4ge1xuICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIgfHwgUjMucHVyZUZ1bmN0aW9uVixcbiAgICBpc1Zhckxlbmd0aDogIWlkZW50aWZpZXIsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldExpdGVyYWxGYWN0b3J5KFxuICAgIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sLCBsaXRlcmFsOiBvLkxpdGVyYWxBcnJheUV4cHIgfCBvLkxpdGVyYWxNYXBFeHByLFxuICAgIGFsbG9jYXRlU2xvdHM6IChudW1TbG90czogbnVtYmVyKSA9PiBudW1iZXIpOiBvLkV4cHJlc3Npb24ge1xuICBjb25zdCB7bGl0ZXJhbEZhY3RvcnksIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzfSA9IGNvbnN0YW50UG9vbC5nZXRMaXRlcmFsRmFjdG9yeShsaXRlcmFsKTtcbiAgLy8gQWxsb2NhdGUgMSBzbG90IGZvciB0aGUgcmVzdWx0IHBsdXMgMSBwZXIgYXJndW1lbnRcbiAgY29uc3Qgc3RhcnRTbG90ID0gYWxsb2NhdGVTbG90cygxICsgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMubGVuZ3RoKTtcbiAgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMubGVuZ3RoID4gMCB8fCBlcnJvcihgRXhwZWN0ZWQgYXJndW1lbnRzIHRvIGEgbGl0ZXJhbCBmYWN0b3J5IGZ1bmN0aW9uYCk7XG4gIGNvbnN0IHtpZGVudGlmaWVyLCBpc1Zhckxlbmd0aH0gPSBwdXJlRnVuY3Rpb25DYWxsSW5mbyhsaXRlcmFsRmFjdG9yeUFyZ3VtZW50cyk7XG5cbiAgLy8gTGl0ZXJhbCBmYWN0b3JpZXMgYXJlIHB1cmUgZnVuY3Rpb25zIHRoYXQgb25seSBuZWVkIHRvIGJlIHJlLWludm9rZWQgd2hlbiB0aGUgcGFyYW1ldGVyc1xuICAvLyBjaGFuZ2UuXG4gIGNvbnN0IGFyZ3MgPSBbXG4gICAgby5saXRlcmFsKHN0YXJ0U2xvdCksXG4gICAgbGl0ZXJhbEZhY3RvcnksXG4gIF07XG5cbiAgaWYgKGlzVmFyTGVuZ3RoKSB7XG4gICAgYXJncy5wdXNoKG8ubGl0ZXJhbEFycihsaXRlcmFsRmFjdG9yeUFyZ3VtZW50cykpO1xuICB9IGVsc2Uge1xuICAgIGFyZ3MucHVzaCguLi5saXRlcmFsRmFjdG9yeUFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gby5pbXBvcnRFeHByKGlkZW50aWZpZXIpLmNhbGxGbihhcmdzKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB3aGljaCBpcyBleGVjdXRlZCB3aGVuZXZlciBhIHZhcmlhYmxlIGlzIHJlZmVyZW5jZWQgZm9yIHRoZSBmaXJzdCB0aW1lIGluIGEgZ2l2ZW5cbiAqIHNjb3BlLlxuICpcbiAqIEl0IGlzIGV4cGVjdGVkIHRoYXQgdGhlIGZ1bmN0aW9uIGNyZWF0ZXMgdGhlIGBjb25zdCBsb2NhbE5hbWUgPSBleHByZXNzaW9uYDsgc3RhdGVtZW50LlxuICovXG5leHBvcnQgdHlwZSBEZWNsYXJlTG9jYWxWYXJDYWxsYmFjayA9IChsaHNWYXI6IG8uUmVhZFZhckV4cHIsIHJoc0V4cHJlc3Npb246IG8uRXhwcmVzc2lvbikgPT4gdm9pZDtcblxuZXhwb3J0IGNsYXNzIEJpbmRpbmdTY29wZSBpbXBsZW1lbnRzIExvY2FsUmVzb2x2ZXIge1xuICAvKipcbiAgICogS2VlcHMgYSBtYXAgZnJvbSBsb2NhbCB2YXJpYWJsZXMgdG8gdGhlaXIgZXhwcmVzc2lvbnMuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCB3aGVuIG9uZSByZWZlcnMgdG8gdmFyaWFibGUgc3VjaCBhczogJ2xldCBhYmMgPSBhLmIuY2AuXG4gICAqIC0ga2V5IHRvIHRoZSBtYXAgaXMgdGhlIHN0cmluZyBsaXRlcmFsIGBcImFiY1wiYC5cbiAgICogLSB2YWx1ZSBgbGhzYCBpcyB0aGUgbGVmdCBoYW5kIHNpZGUgd2hpY2ggaXMgYW4gQVNUIHJlcHJlc2VudGluZyBgYWJjYC5cbiAgICogLSB2YWx1ZSBgcmhzYCBpcyB0aGUgcmlnaHQgaGFuZCBzaWRlIHdoaWNoIGlzIGFuIEFTVCByZXByZXNlbnRpbmcgYGEuYi5jYC5cbiAgICogLSB2YWx1ZSBgZGVjbGFyZWRgIGlzIHRydWUgaWYgdGhlIGBkZWNsYXJlTG9jYWxWYXJDYWxsYmFja2AgaGFzIGJlZW4gY2FsbGVkIGZvciB0aGlzIHNjb3BlXG4gICAqIGFscmVhZHkuXG4gICAqL1xuICBwcml2YXRlIG1hcCA9IG5ldyBNYXAgPCBzdHJpbmcsIHtcbiAgICBsaHM6IG8uUmVhZFZhckV4cHI7XG4gICAgcmhzOiBvLkV4cHJlc3Npb258dW5kZWZpbmVkO1xuICAgIGRlY2xhcmVkOiBib29sZWFuO1xuICB9XG4gID4gKCk7XG4gIHByaXZhdGUgcmVmZXJlbmNlTmFtZUluZGV4ID0gMDtcblxuICBzdGF0aWMgUk9PVF9TQ09QRSA9IG5ldyBCaW5kaW5nU2NvcGUoKS5zZXQoJyRldmVudCcsIG8udmFyaWFibGUoJyRldmVudCcpKTtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBwYXJlbnQ6IEJpbmRpbmdTY29wZXxudWxsID0gbnVsbCxcbiAgICAgIHByaXZhdGUgZGVjbGFyZUxvY2FsVmFyQ2FsbGJhY2s6IERlY2xhcmVMb2NhbFZhckNhbGxiYWNrID0gbm9vcCkge31cblxuICBnZXQobmFtZTogc3RyaW5nKTogby5FeHByZXNzaW9ufG51bGwge1xuICAgIGxldCBjdXJyZW50OiBCaW5kaW5nU2NvcGV8bnVsbCA9IHRoaXM7XG4gICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgIGxldCB2YWx1ZSA9IGN1cnJlbnQubWFwLmdldChuYW1lKTtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChjdXJyZW50ICE9PSB0aGlzKSB7XG4gICAgICAgICAgLy8gbWFrZSBhIGxvY2FsIGNvcHkgYW5kIHJlc2V0IHRoZSBgZGVjbGFyZWRgIHN0YXRlLlxuICAgICAgICAgIHZhbHVlID0ge2xoczogdmFsdWUubGhzLCByaHM6IHZhbHVlLnJocywgZGVjbGFyZWQ6IGZhbHNlfTtcbiAgICAgICAgICAvLyBDYWNoZSB0aGUgdmFsdWUgbG9jYWxseS5cbiAgICAgICAgICB0aGlzLm1hcC5zZXQobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZS5yaHMgJiYgIXZhbHVlLmRlY2xhcmVkKSB7XG4gICAgICAgICAgLy8gaWYgaXQgaXMgZmlyc3QgdGltZSB3ZSBhcmUgcmVmZXJlbmNpbmcgdGhlIHZhcmlhYmxlIGluIHRoZSBzY29wZVxuICAgICAgICAgIC8vIHRoYW4gaW52b2tlIHRoZSBjYWxsYmFjayB0byBpbnNlcnQgdmFyaWFibGUgZGVjbGFyYXRpb24uXG4gICAgICAgICAgdGhpcy5kZWNsYXJlTG9jYWxWYXJDYWxsYmFjayh2YWx1ZS5saHMsIHZhbHVlLnJocyk7XG4gICAgICAgICAgdmFsdWUuZGVjbGFyZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZS5saHM7XG4gICAgICB9XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxvY2FsIHZhcmlhYmxlIGZvciBsYXRlciByZWZlcmVuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgKiBAcGFyYW0gbGhzIEFTVCByZXByZXNlbnRpbmcgdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHRoZSBgbGV0IGxocyA9IHJocztgLlxuICAgKiBAcGFyYW0gcmhzIEFTVCByZXByZXNlbnRpbmcgdGhlIHJpZ2h0IGhhbmQgc2lkZSBvZiB0aGUgYGxldCBsaHMgPSByaHM7YC4gVGhlIGByaHNgIGNhbiBiZVxuICAgKiBgdW5kZWZpbmVkYCBmb3IgdmFyaWFibGUgdGhhdCBhcmUgYW1iaWVudCBzdWNoIGFzIGAkZXZlbnRgIGFuZCB3aGljaCBkb24ndCBoYXZlIGByaHNgXG4gICAqIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgc2V0KG5hbWU6IHN0cmluZywgbGhzOiBvLlJlYWRWYXJFeHByLCByaHM/OiBvLkV4cHJlc3Npb24pOiBCaW5kaW5nU2NvcGUge1xuICAgICF0aGlzLm1hcC5oYXMobmFtZSkgfHxcbiAgICAgICAgZXJyb3IoYFRoZSBuYW1lICR7bmFtZX0gaXMgYWxyZWFkeSBkZWZpbmVkIGluIHNjb3BlIHRvIGJlICR7dGhpcy5tYXAuZ2V0KG5hbWUpfWApO1xuICAgIHRoaXMubWFwLnNldChuYW1lLCB7bGhzOiBsaHMsIHJoczogcmhzLCBkZWNsYXJlZDogZmFsc2V9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldExvY2FsKG5hbWU6IHN0cmluZyk6IChvLkV4cHJlc3Npb258bnVsbCkgeyByZXR1cm4gdGhpcy5nZXQobmFtZSk7IH1cblxuICBuZXN0ZWRTY29wZShkZWNsYXJlQ2FsbGJhY2s6IERlY2xhcmVMb2NhbFZhckNhbGxiYWNrKTogQmluZGluZ1Njb3BlIHtcbiAgICByZXR1cm4gbmV3IEJpbmRpbmdTY29wZSh0aGlzLCBkZWNsYXJlQ2FsbGJhY2spO1xuICB9XG5cbiAgZnJlc2hSZWZlcmVuY2VOYW1lKCk6IHN0cmluZyB7XG4gICAgbGV0IGN1cnJlbnQ6IEJpbmRpbmdTY29wZSA9IHRoaXM7XG4gICAgLy8gRmluZCB0aGUgdG9wIHNjb3BlIGFzIGl0IG1haW50YWlucyB0aGUgZ2xvYmFsIHJlZmVyZW5jZSBjb3VudFxuICAgIHdoaWxlIChjdXJyZW50LnBhcmVudCkgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgIGNvbnN0IHJlZiA9IGAke1JFRkVSRU5DRV9QUkVGSVh9JHtjdXJyZW50LnJlZmVyZW5jZU5hbWVJbmRleCsrfWA7XG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBgQ3NzU2VsZWN0b3JgIGdpdmVuIGEgdGFnIG5hbWUgYW5kIGEgbWFwIG9mIGF0dHJpYnV0ZXNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ3NzU2VsZWN0b3IodGFnOiBzdHJpbmcsIGF0dHJpYnV0ZXM6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSk6IENzc1NlbGVjdG9yIHtcbiAgY29uc3QgY3NzU2VsZWN0b3IgPSBuZXcgQ3NzU2VsZWN0b3IoKTtcblxuICBjc3NTZWxlY3Rvci5zZXRFbGVtZW50KHRhZyk7XG5cbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYXR0cmlidXRlcykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcblxuICAgIGNzc1NlbGVjdG9yLmFkZEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgaWYgKG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2NsYXNzJykge1xuICAgICAgY29uc3QgY2xhc3NlcyA9IHZhbHVlLnRyaW0oKS5zcGxpdCgvXFxzKy9nKTtcbiAgICAgIGNsYXNzZXMuZm9yRWFjaChjbGFzc05hbWUgPT4gY3NzU2VsZWN0b3IuYWRkQ2xhc3NOYW1lKGNsYXNzTmFtZSkpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNzc1NlbGVjdG9yO1xufVxuXG4vLyBQYXJzZSBpMThuIG1ldGFzIGxpa2U6XG4vLyAtIFwiQEBpZFwiLFxuLy8gLSBcImRlc2NyaXB0aW9uW0BAaWRdXCIsXG4vLyAtIFwibWVhbmluZ3xkZXNjcmlwdGlvbltAQGlkXVwiXG5mdW5jdGlvbiBwYXJzZUkxOG5NZXRhKGkxOG4/OiBzdHJpbmcpOiB7ZGVzY3JpcHRpb24/OiBzdHJpbmcsIGlkPzogc3RyaW5nLCBtZWFuaW5nPzogc3RyaW5nfSB7XG4gIGxldCBtZWFuaW5nOiBzdHJpbmd8dW5kZWZpbmVkO1xuICBsZXQgZGVzY3JpcHRpb246IHN0cmluZ3x1bmRlZmluZWQ7XG4gIGxldCBpZDogc3RyaW5nfHVuZGVmaW5lZDtcblxuICBpZiAoaTE4bikge1xuICAgIC8vIFRPRE8odmljYik6IGZpZ3VyZSBvdXQgaG93IHRvIGZvcmNlIGEgbWVzc2FnZSBJRCB3aXRoIGNsb3N1cmUgP1xuICAgIGNvbnN0IGlkSW5kZXggPSBpMThuLmluZGV4T2YoSURfU0VQQVJBVE9SKTtcblxuICAgIGNvbnN0IGRlc2NJbmRleCA9IGkxOG4uaW5kZXhPZihNRUFOSU5HX1NFUEFSQVRPUik7XG4gICAgbGV0IG1lYW5pbmdBbmREZXNjOiBzdHJpbmc7XG4gICAgW21lYW5pbmdBbmREZXNjLCBpZF0gPVxuICAgICAgICAoaWRJbmRleCA+IC0xKSA/IFtpMThuLnNsaWNlKDAsIGlkSW5kZXgpLCBpMThuLnNsaWNlKGlkSW5kZXggKyAyKV0gOiBbaTE4biwgJyddO1xuICAgIFttZWFuaW5nLCBkZXNjcmlwdGlvbl0gPSAoZGVzY0luZGV4ID4gLTEpID9cbiAgICAgICAgW21lYW5pbmdBbmREZXNjLnNsaWNlKDAsIGRlc2NJbmRleCksIG1lYW5pbmdBbmREZXNjLnNsaWNlKGRlc2NJbmRleCArIDEpXSA6XG4gICAgICAgIFsnJywgbWVhbmluZ0FuZERlc2NdO1xuICB9XG5cbiAgcmV0dXJuIHtkZXNjcmlwdGlvbiwgaWQsIG1lYW5pbmd9O1xufVxuXG5mdW5jdGlvbiBpbnRlcnBvbGF0ZShhcmdzOiBvLkV4cHJlc3Npb25bXSk6IG8uRXhwcmVzc2lvbiB7XG4gIGFyZ3MgPSBhcmdzLnNsaWNlKDEpOyAgLy8gSWdub3JlIHRoZSBsZW5ndGggcHJlZml4IGFkZGVkIGZvciByZW5kZXIyXG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb24xKS5jYWxsRm4oYXJncyk7XG4gICAgY2FzZSA1OlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5pbnRlcnBvbGF0aW9uMikuY2FsbEZuKGFyZ3MpO1xuICAgIGNhc2UgNzpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjMpLmNhbGxGbihhcmdzKTtcbiAgICBjYXNlIDk6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb240KS5jYWxsRm4oYXJncyk7XG4gICAgY2FzZSAxMTpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjUpLmNhbGxGbihhcmdzKTtcbiAgICBjYXNlIDEzOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5pbnRlcnBvbGF0aW9uNikuY2FsbEZuKGFyZ3MpO1xuICAgIGNhc2UgMTU6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb243KS5jYWxsRm4oYXJncyk7XG4gICAgY2FzZSAxNzpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjgpLmNhbGxGbihhcmdzKTtcbiAgfVxuICAoYXJncy5sZW5ndGggPj0gMTkgJiYgYXJncy5sZW5ndGggJSAyID09IDEpIHx8XG4gICAgICBlcnJvcihgSW52YWxpZCBpbnRlcnBvbGF0aW9uIGFyZ3VtZW50IGxlbmd0aCAke2FyZ3MubGVuZ3RofWApO1xuICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb25WKS5jYWxsRm4oW28ubGl0ZXJhbEFycihhcmdzKV0pO1xufVxuXG4vKipcbiAqIFBhcnNlIGEgdGVtcGxhdGUgaW50byByZW5kZXIzIGBOb2RlYHMgYW5kIGFkZGl0aW9uYWwgbWV0YWRhdGEsIHdpdGggbm8gb3RoZXIgZGVwZW5kZW5jaWVzLlxuICpcbiAqIEBwYXJhbSB0ZW1wbGF0ZSB0ZXh0IG9mIHRoZSB0ZW1wbGF0ZSB0byBwYXJzZVxuICogQHBhcmFtIHRlbXBsYXRlVXJsIFVSTCB0byB1c2UgZm9yIHNvdXJjZSBtYXBwaW5nIG9mIHRoZSBwYXJzZWQgdGVtcGxhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGVtcGxhdGUoXG4gICAgdGVtcGxhdGU6IHN0cmluZywgdGVtcGxhdGVVcmw6IHN0cmluZywgb3B0aW9uczoge3ByZXNlcnZlV2hpdGVzcGFjZXM/OiBib29sZWFufSA9IHt9KTpcbiAgICB7ZXJyb3JzPzogUGFyc2VFcnJvcltdLCBub2RlczogdC5Ob2RlW10sIGhhc05nQ29udGVudDogYm9vbGVhbiwgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXX0ge1xuICBjb25zdCBiaW5kaW5nUGFyc2VyID0gbWFrZUJpbmRpbmdQYXJzZXIoKTtcbiAgY29uc3QgaHRtbFBhcnNlciA9IG5ldyBIdG1sUGFyc2VyKCk7XG4gIGNvbnN0IHBhcnNlUmVzdWx0ID0gaHRtbFBhcnNlci5wYXJzZSh0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwpO1xuXG4gIGlmIChwYXJzZVJlc3VsdC5lcnJvcnMgJiYgcGFyc2VSZXN1bHQuZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4ge2Vycm9yczogcGFyc2VSZXN1bHQuZXJyb3JzLCBub2RlczogW10sIGhhc05nQ29udGVudDogZmFsc2UsIG5nQ29udGVudFNlbGVjdG9yczogW119O1xuICB9XG5cbiAgbGV0IHJvb3ROb2RlczogaHRtbC5Ob2RlW10gPSBwYXJzZVJlc3VsdC5yb290Tm9kZXM7XG4gIGlmICghb3B0aW9ucy5wcmVzZXJ2ZVdoaXRlc3BhY2VzKSB7XG4gICAgcm9vdE5vZGVzID0gaHRtbC52aXNpdEFsbChuZXcgV2hpdGVzcGFjZVZpc2l0b3IoKSwgcm9vdE5vZGVzKTtcbiAgfVxuXG4gIGNvbnN0IHtub2RlcywgaGFzTmdDb250ZW50LCBuZ0NvbnRlbnRTZWxlY3RvcnMsIGVycm9yc30gPVxuICAgICAgaHRtbEFzdFRvUmVuZGVyM0FzdChyb290Tm9kZXMsIGJpbmRpbmdQYXJzZXIpO1xuICBpZiAoZXJyb3JzICYmIGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHtlcnJvcnMsIG5vZGVzOiBbXSwgaGFzTmdDb250ZW50OiBmYWxzZSwgbmdDb250ZW50U2VsZWN0b3JzOiBbXX07XG4gIH1cblxuICByZXR1cm4ge25vZGVzLCBoYXNOZ0NvbnRlbnQsIG5nQ29udGVudFNlbGVjdG9yc307XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgYEJpbmRpbmdQYXJzZXJgIHdpdGggYSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQmluZGluZ1BhcnNlcigpOiBCaW5kaW5nUGFyc2VyIHtcbiAgcmV0dXJuIG5ldyBCaW5kaW5nUGFyc2VyKFxuICAgICAgbmV3IFBhcnNlcihuZXcgTGV4ZXIoKSksIERFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcsIG5ldyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkoKSwgbnVsbCxcbiAgICAgIFtdKTtcbn1cblxuZnVuY3Rpb24gaXNDbGFzc0JpbmRpbmcoaW5wdXQ6IHQuQm91bmRBdHRyaWJ1dGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlucHV0Lm5hbWUgPT0gJ2NsYXNzTmFtZScgfHwgaW5wdXQubmFtZSA9PSAnY2xhc3MnO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlU2FuaXRpemF0aW9uRm4oaW5wdXQ6IHQuQm91bmRBdHRyaWJ1dGUsIGNvbnRleHQ6IGNvcmUuU2VjdXJpdHlDb250ZXh0KSB7XG4gIHN3aXRjaCAoY29udGV4dCkge1xuICAgIGNhc2UgY29yZS5TZWN1cml0eUNvbnRleHQuSFRNTDpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuc2FuaXRpemVIdG1sKTtcbiAgICBjYXNlIGNvcmUuU2VjdXJpdHlDb250ZXh0LlNDUklQVDpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuc2FuaXRpemVTY3JpcHQpO1xuICAgIGNhc2UgY29yZS5TZWN1cml0eUNvbnRleHQuU1RZTEU6XG4gICAgICAvLyB0aGUgY29tcGlsZXIgZG9lcyBub3QgZmlsbCBpbiBhbiBpbnN0cnVjdGlvbiBmb3IgW3N0eWxlLnByb3A/XSBiaW5kaW5nXG4gICAgICAvLyB2YWx1ZXMgYmVjYXVzZSB0aGUgc3R5bGUgYWxnb3JpdGhtIGtub3dzIGludGVybmFsbHkgd2hhdCBwcm9wcyBhcmUgc3ViamVjdFxuICAgICAgLy8gdG8gc2FuaXRpemF0aW9uIChvbmx5IFthdHRyLnN0eWxlXSB2YWx1ZXMgYXJlIGV4cGxpY2l0bHkgc2FuaXRpemVkKVxuICAgICAgcmV0dXJuIGlucHV0LnR5cGUgPT09IEJpbmRpbmdUeXBlLkF0dHJpYnV0ZSA/IG8uaW1wb3J0RXhwcihSMy5zYW5pdGl6ZVN0eWxlKSA6IG51bGw7XG4gICAgY2FzZSBjb3JlLlNlY3VyaXR5Q29udGV4dC5VUkw6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLnNhbml0aXplVXJsKTtcbiAgICBjYXNlIGNvcmUuU2VjdXJpdHlDb250ZXh0LlJFU09VUkNFX1VSTDpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuc2FuaXRpemVSZXNvdXJjZVVybCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzU3R5bGVTYW5pdGl6YWJsZShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgc3dpdGNoIChwcm9wKSB7XG4gICAgY2FzZSAnYmFja2dyb3VuZC1pbWFnZSc6XG4gICAgY2FzZSAnYmFja2dyb3VuZCc6XG4gICAgY2FzZSAnYm9yZGVyLWltYWdlJzpcbiAgICBjYXNlICdmaWx0ZXInOlxuICAgIGNhc2UgJ2xpc3Qtc3R5bGUnOlxuICAgIGNhc2UgJ2xpc3Qtc3R5bGUtaW1hZ2UnOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuIl19