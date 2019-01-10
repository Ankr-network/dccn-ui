/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { componentFactoryName, flatten, identifierName, templateSourceUrl } from '../compile_metadata';
import { ConstantPool } from '../constant_pool';
import { ViewEncapsulation } from '../core';
import { MessageBundle } from '../i18n/message_bundle';
import { Identifiers, createTokenForExternalReference } from '../identifiers';
import { HtmlParser } from '../ml_parser/html_parser';
import { removeWhitespaces } from '../ml_parser/html_whitespaces';
import { DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig } from '../ml_parser/interpolation_config';
import * as o from '../output/output_ast';
import { compileNgModuleFromRender2 as compileR3Module } from '../render3/r3_module_compiler';
import { compilePipeFromRender2 as compileR3Pipe } from '../render3/r3_pipe_compiler';
import { htmlAstToRender3Ast } from '../render3/r3_template_transform';
import { compileComponentFromRender2 as compileR3Component, compileDirectiveFromRender2 as compileR3Directive } from '../render3/view/compiler';
import { DomElementSchemaRegistry } from '../schema/dom_element_schema_registry';
import { BindingParser } from '../template_parser/binding_parser';
import { error, syntaxError, visitValue } from '../util';
import { GeneratedFile } from './generated_file';
import { listLazyRoutes, parseLazyRoute } from './lazy_routes';
import { StaticSymbol } from './static_symbol';
import { createForJitStub, serializeSummaries } from './summary_serializer';
import { ngfactoryFilePath, normalizeGenFileSuffix, splitTypescriptSuffix, summaryFileName, summaryForJitFileName } from './util';
var AotCompiler = /** @class */ (function () {
    function AotCompiler(_config, _options, _host, reflector, _metadataResolver, _templateParser, _styleCompiler, _viewCompiler, _typeCheckCompiler, _ngModuleCompiler, _injectableCompiler, _outputEmitter, _summaryResolver, _symbolResolver) {
        this._config = _config;
        this._options = _options;
        this._host = _host;
        this.reflector = reflector;
        this._metadataResolver = _metadataResolver;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._typeCheckCompiler = _typeCheckCompiler;
        this._ngModuleCompiler = _ngModuleCompiler;
        this._injectableCompiler = _injectableCompiler;
        this._outputEmitter = _outputEmitter;
        this._summaryResolver = _summaryResolver;
        this._symbolResolver = _symbolResolver;
        this._templateAstCache = new Map();
        this._analyzedFiles = new Map();
        this._analyzedFilesForInjectables = new Map();
    }
    AotCompiler.prototype.clearCache = function () { this._metadataResolver.clearCache(); };
    AotCompiler.prototype.analyzeModulesSync = function (rootFiles) {
        var _this = this;
        var analyzeResult = analyzeAndValidateNgModules(rootFiles, this._host, this._symbolResolver, this._metadataResolver);
        analyzeResult.ngModules.forEach(function (ngModule) { return _this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, true); });
        return analyzeResult;
    };
    AotCompiler.prototype.analyzeModulesAsync = function (rootFiles) {
        var _this = this;
        var analyzeResult = analyzeAndValidateNgModules(rootFiles, this._host, this._symbolResolver, this._metadataResolver);
        return Promise
            .all(analyzeResult.ngModules.map(function (ngModule) { return _this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, false); }))
            .then(function () { return analyzeResult; });
    };
    AotCompiler.prototype._analyzeFile = function (fileName) {
        var analyzedFile = this._analyzedFiles.get(fileName);
        if (!analyzedFile) {
            analyzedFile =
                analyzeFile(this._host, this._symbolResolver, this._metadataResolver, fileName);
            this._analyzedFiles.set(fileName, analyzedFile);
        }
        return analyzedFile;
    };
    AotCompiler.prototype._analyzeFileForInjectables = function (fileName) {
        var analyzedFile = this._analyzedFilesForInjectables.get(fileName);
        if (!analyzedFile) {
            analyzedFile = analyzeFileForInjectables(this._host, this._symbolResolver, this._metadataResolver, fileName);
            this._analyzedFilesForInjectables.set(fileName, analyzedFile);
        }
        return analyzedFile;
    };
    AotCompiler.prototype.findGeneratedFileNames = function (fileName) {
        var _this = this;
        var genFileNames = [];
        var file = this._analyzeFile(fileName);
        // Make sure we create a .ngfactory if we have a injectable/directive/pipe/NgModule
        // or a reference to a non source file.
        // Note: This is overestimating the required .ngfactory files as the real calculation is harder.
        // Only do this for StubEmitFlags.Basic, as adding a type check block
        // does not change this file (as we generate type check blocks based on NgModules).
        if (this._options.allowEmptyCodegenFiles || file.directives.length || file.pipes.length ||
            file.injectables.length || file.ngModules.length || file.exportsNonSourceFiles) {
            genFileNames.push(ngfactoryFilePath(file.fileName, true));
            if (this._options.enableSummariesForJit) {
                genFileNames.push(summaryForJitFileName(file.fileName, true));
            }
        }
        var fileSuffix = normalizeGenFileSuffix(splitTypescriptSuffix(file.fileName, true)[1]);
        file.directives.forEach(function (dirSymbol) {
            var compMeta = _this._metadataResolver.getNonNormalizedDirectiveMetadata(dirSymbol).metadata;
            if (!compMeta.isComponent) {
                return;
            }
            // Note: compMeta is a component and therefore template is non null.
            compMeta.template.styleUrls.forEach(function (styleUrl) {
                var normalizedUrl = _this._host.resourceNameToFileName(styleUrl, file.fileName);
                if (!normalizedUrl) {
                    throw syntaxError("Couldn't resolve resource " + styleUrl + " relative to " + file.fileName);
                }
                var needsShim = (compMeta.template.encapsulation ||
                    _this._config.defaultEncapsulation) === ViewEncapsulation.Emulated;
                genFileNames.push(_stylesModuleUrl(normalizedUrl, needsShim, fileSuffix));
                if (_this._options.allowEmptyCodegenFiles) {
                    genFileNames.push(_stylesModuleUrl(normalizedUrl, !needsShim, fileSuffix));
                }
            });
        });
        return genFileNames;
    };
    AotCompiler.prototype.emitBasicStub = function (genFileName, originalFileName) {
        var outputCtx = this._createOutputContext(genFileName);
        if (genFileName.endsWith('.ngfactory.ts')) {
            if (!originalFileName) {
                throw new Error("Assertion error: require the original file for .ngfactory.ts stubs. File: " + genFileName);
            }
            var originalFile = this._analyzeFile(originalFileName);
            this._createNgFactoryStub(outputCtx, originalFile, 1 /* Basic */);
        }
        else if (genFileName.endsWith('.ngsummary.ts')) {
            if (this._options.enableSummariesForJit) {
                if (!originalFileName) {
                    throw new Error("Assertion error: require the original file for .ngsummary.ts stubs. File: " + genFileName);
                }
                var originalFile = this._analyzeFile(originalFileName);
                _createEmptyStub(outputCtx);
                originalFile.ngModules.forEach(function (ngModule) {
                    // create exports that user code can reference
                    createForJitStub(outputCtx, ngModule.type.reference);
                });
            }
        }
        else if (genFileName.endsWith('.ngstyle.ts')) {
            _createEmptyStub(outputCtx);
        }
        // Note: for the stubs, we don't need a property srcFileUrl,
        // as later on in emitAllImpls we will create the proper GeneratedFiles with the
        // correct srcFileUrl.
        // This is good as e.g. for .ngstyle.ts files we can't derive
        // the url of components based on the genFileUrl.
        return this._codegenSourceModule('unknown', outputCtx);
    };
    AotCompiler.prototype.emitTypeCheckStub = function (genFileName, originalFileName) {
        var originalFile = this._analyzeFile(originalFileName);
        var outputCtx = this._createOutputContext(genFileName);
        if (genFileName.endsWith('.ngfactory.ts')) {
            this._createNgFactoryStub(outputCtx, originalFile, 2 /* TypeCheck */);
        }
        return outputCtx.statements.length > 0 ?
            this._codegenSourceModule(originalFile.fileName, outputCtx) :
            null;
    };
    AotCompiler.prototype.loadFilesAsync = function (fileNames, tsFiles) {
        var _this = this;
        var files = fileNames.map(function (fileName) { return _this._analyzeFile(fileName); });
        var loadingPromises = [];
        files.forEach(function (file) { return file.ngModules.forEach(function (ngModule) {
            return loadingPromises.push(_this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, false));
        }); });
        var analyzedInjectables = tsFiles.map(function (tsFile) { return _this._analyzeFileForInjectables(tsFile); });
        return Promise.all(loadingPromises).then(function (_) { return ({
            analyzedModules: mergeAndValidateNgFiles(files),
            analyzedInjectables: analyzedInjectables,
        }); });
    };
    AotCompiler.prototype.loadFilesSync = function (fileNames, tsFiles) {
        var _this = this;
        var files = fileNames.map(function (fileName) { return _this._analyzeFile(fileName); });
        files.forEach(function (file) { return file.ngModules.forEach(function (ngModule) { return _this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, true); }); });
        var analyzedInjectables = tsFiles.map(function (tsFile) { return _this._analyzeFileForInjectables(tsFile); });
        return {
            analyzedModules: mergeAndValidateNgFiles(files),
            analyzedInjectables: analyzedInjectables,
        };
    };
    AotCompiler.prototype._createNgFactoryStub = function (outputCtx, file, emitFlags) {
        var _this = this;
        var componentId = 0;
        file.ngModules.forEach(function (ngModuleMeta, ngModuleIndex) {
            // Note: the code below needs to executed for StubEmitFlags.Basic and StubEmitFlags.TypeCheck,
            // so we don't change the .ngfactory file too much when adding the type-check block.
            // create exports that user code can reference
            _this._ngModuleCompiler.createStub(outputCtx, ngModuleMeta.type.reference);
            // add references to the symbols from the metadata.
            // These can be used by the type check block for components,
            // and they also cause TypeScript to include these files into the program too,
            // which will make them part of the analyzedFiles.
            var externalReferences = tslib_1.__spread(ngModuleMeta.transitiveModule.directives.map(function (d) { return d.reference; }), ngModuleMeta.transitiveModule.pipes.map(function (d) { return d.reference; }), ngModuleMeta.importedModules.map(function (m) { return m.type.reference; }), ngModuleMeta.exportedModules.map(function (m) { return m.type.reference; }), _this._externalIdentifierReferences([Identifiers.TemplateRef, Identifiers.ElementRef]));
            var externalReferenceVars = new Map();
            externalReferences.forEach(function (ref, typeIndex) {
                externalReferenceVars.set(ref, "_decl" + ngModuleIndex + "_" + typeIndex);
            });
            externalReferenceVars.forEach(function (varName, reference) {
                outputCtx.statements.push(o.variable(varName)
                    .set(o.NULL_EXPR.cast(o.DYNAMIC_TYPE))
                    .toDeclStmt(o.expressionType(outputCtx.importExpr(reference, /* typeParams */ null, /* useSummaries */ false))));
            });
            if (emitFlags & 2 /* TypeCheck */) {
                // add the type-check block for all components of the NgModule
                ngModuleMeta.declaredDirectives.forEach(function (dirId) {
                    var compMeta = _this._metadataResolver.getDirectiveMetadata(dirId.reference);
                    if (!compMeta.isComponent) {
                        return;
                    }
                    componentId++;
                    _this._createTypeCheckBlock(outputCtx, compMeta.type.reference.name + "_Host_" + componentId, ngModuleMeta, _this._metadataResolver.getHostComponentMetadata(compMeta), [compMeta.type], externalReferenceVars);
                    _this._createTypeCheckBlock(outputCtx, compMeta.type.reference.name + "_" + componentId, ngModuleMeta, compMeta, ngModuleMeta.transitiveModule.directives, externalReferenceVars);
                });
            }
        });
        if (outputCtx.statements.length === 0) {
            _createEmptyStub(outputCtx);
        }
    };
    AotCompiler.prototype._externalIdentifierReferences = function (references) {
        var result = [];
        try {
            for (var references_1 = tslib_1.__values(references), references_1_1 = references_1.next(); !references_1_1.done; references_1_1 = references_1.next()) {
                var reference = references_1_1.value;
                var token = createTokenForExternalReference(this.reflector, reference);
                if (token.identifier) {
                    result.push(token.identifier.reference);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (references_1_1 && !references_1_1.done && (_a = references_1.return)) _a.call(references_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
        var e_1, _a;
    };
    AotCompiler.prototype._createTypeCheckBlock = function (ctx, componentId, moduleMeta, compMeta, directives, externalReferenceVars) {
        var _a = this._parseTemplate(compMeta, moduleMeta, directives), parsedTemplate = _a.template, usedPipes = _a.pipes;
        (_b = ctx.statements).push.apply(_b, tslib_1.__spread(this._typeCheckCompiler.compileComponent(componentId, compMeta, parsedTemplate, usedPipes, externalReferenceVars, ctx)));
        var _b;
    };
    AotCompiler.prototype.emitMessageBundle = function (analyzeResult, locale) {
        var _this = this;
        var errors = [];
        var htmlParser = new HtmlParser();
        // TODO(vicb): implicit tags & attributes
        var messageBundle = new MessageBundle(htmlParser, [], {}, locale);
        analyzeResult.files.forEach(function (file) {
            var compMetas = [];
            file.directives.forEach(function (directiveType) {
                var dirMeta = _this._metadataResolver.getDirectiveMetadata(directiveType);
                if (dirMeta && dirMeta.isComponent) {
                    compMetas.push(dirMeta);
                }
            });
            compMetas.forEach(function (compMeta) {
                var html = compMeta.template.template;
                // Template URL points to either an HTML or TS file depending on whether
                // the file is used with `templateUrl:` or `template:`, respectively.
                var templateUrl = compMeta.template.templateUrl;
                var interpolationConfig = InterpolationConfig.fromArray(compMeta.template.interpolation);
                errors.push.apply(errors, tslib_1.__spread(messageBundle.updateFromTemplate(html, templateUrl, interpolationConfig)));
            });
        });
        if (errors.length) {
            throw new Error(errors.map(function (e) { return e.toString(); }).join('\n'));
        }
        return messageBundle;
    };
    AotCompiler.prototype.emitAllPartialModules = function (_a, r3Files) {
        var _this = this;
        var ngModuleByPipeOrDirective = _a.ngModuleByPipeOrDirective, files = _a.files;
        var contextMap = new Map();
        var getContext = function (fileName) {
            if (!contextMap.has(fileName)) {
                contextMap.set(fileName, _this._createOutputContext(fileName));
            }
            return contextMap.get(fileName);
        };
        files.forEach(function (file) { return _this._compilePartialModule(file.fileName, ngModuleByPipeOrDirective, file.directives, file.pipes, file.ngModules, file.injectables, getContext(file.fileName)); });
        r3Files.forEach(function (file) { return _this._compileShallowModules(file.fileName, file.shallowModules, getContext(file.fileName)); });
        return Array.from(contextMap.values())
            .map(function (context) { return ({
            fileName: context.genFilePath,
            statements: tslib_1.__spread(context.constantPool.statements, context.statements),
        }); });
    };
    AotCompiler.prototype._compileShallowModules = function (fileName, shallowModules, context) {
        var _this = this;
        shallowModules.forEach(function (module) { return compileR3Module(context, module, _this._injectableCompiler); });
    };
    AotCompiler.prototype._compilePartialModule = function (fileName, ngModuleByPipeOrDirective, directives, pipes, ngModules, injectables, context) {
        var _this = this;
        var errors = [];
        var schemaRegistry = new DomElementSchemaRegistry();
        var hostBindingParser = new BindingParser(this._templateParser.expressionParser, DEFAULT_INTERPOLATION_CONFIG, schemaRegistry, [], errors);
        // Process all components and directives
        directives.forEach(function (directiveType) {
            var directiveMetadata = _this._metadataResolver.getDirectiveMetadata(directiveType);
            if (directiveMetadata.isComponent) {
                var module = ngModuleByPipeOrDirective.get(directiveType);
                module ||
                    error("Cannot determine the module for component '" + identifierName(directiveMetadata.type) + "'");
                var htmlAst = directiveMetadata.template.htmlAst;
                var preserveWhitespaces = directiveMetadata.template.preserveWhitespaces;
                if (!preserveWhitespaces) {
                    htmlAst = removeWhitespaces(htmlAst);
                }
                var render3Ast = htmlAstToRender3Ast(htmlAst.rootNodes, hostBindingParser);
                // Map of StaticType by directive selectors
                var directiveTypeBySel_1 = new Map();
                var directives_1 = module.transitiveModule.directives.map(function (dir) { return _this._metadataResolver.getDirectiveSummary(dir.reference); });
                directives_1.forEach(function (directive) {
                    if (directive.selector) {
                        directiveTypeBySel_1.set(directive.selector, directive.type.reference);
                    }
                });
                // Map of StaticType by pipe names
                var pipeTypeByName_1 = new Map();
                var pipes_1 = module.transitiveModule.pipes.map(function (pipe) { return _this._metadataResolver.getPipeSummary(pipe.reference); });
                pipes_1.forEach(function (pipe) { pipeTypeByName_1.set(pipe.name, pipe.type.reference); });
                compileR3Component(context, directiveMetadata, render3Ast, _this.reflector, hostBindingParser, directiveTypeBySel_1, pipeTypeByName_1);
            }
            else {
                compileR3Directive(context, directiveMetadata, _this.reflector, hostBindingParser);
            }
        });
        pipes.forEach(function (pipeType) {
            var pipeMetadata = _this._metadataResolver.getPipeMetadata(pipeType);
            if (pipeMetadata) {
                compileR3Pipe(context, pipeMetadata, _this.reflector);
            }
        });
        injectables.forEach(function (injectable) { return _this._injectableCompiler.compile(injectable, context); });
    };
    AotCompiler.prototype.emitAllPartialModules2 = function (files) {
        var _this = this;
        // Using reduce like this is a select many pattern (where map is a select pattern)
        return files.reduce(function (r, file) {
            r.push.apply(r, tslib_1.__spread(_this._emitPartialModule2(file.fileName, file.injectables)));
            return r;
        }, []);
    };
    AotCompiler.prototype._emitPartialModule2 = function (fileName, injectables) {
        var _this = this;
        var context = this._createOutputContext(fileName);
        injectables.forEach(function (injectable) { return _this._injectableCompiler.compile(injectable, context); });
        if (context.statements && context.statements.length > 0) {
            return [{ fileName: fileName, statements: tslib_1.__spread(context.constantPool.statements, context.statements) }];
        }
        return [];
    };
    AotCompiler.prototype.emitAllImpls = function (analyzeResult) {
        var _this = this;
        var ngModuleByPipeOrDirective = analyzeResult.ngModuleByPipeOrDirective, files = analyzeResult.files;
        var sourceModules = files.map(function (file) { return _this._compileImplFile(file.fileName, ngModuleByPipeOrDirective, file.directives, file.pipes, file.ngModules, file.injectables); });
        return flatten(sourceModules);
    };
    AotCompiler.prototype._compileImplFile = function (srcFileUrl, ngModuleByPipeOrDirective, directives, pipes, ngModules, injectables) {
        var _this = this;
        var fileSuffix = normalizeGenFileSuffix(splitTypescriptSuffix(srcFileUrl, true)[1]);
        var generatedFiles = [];
        var outputCtx = this._createOutputContext(ngfactoryFilePath(srcFileUrl, true));
        generatedFiles.push.apply(generatedFiles, tslib_1.__spread(this._createSummary(srcFileUrl, directives, pipes, ngModules, injectables, outputCtx)));
        // compile all ng modules
        ngModules.forEach(function (ngModuleMeta) { return _this._compileModule(outputCtx, ngModuleMeta); });
        // compile components
        directives.forEach(function (dirType) {
            var compMeta = _this._metadataResolver.getDirectiveMetadata(dirType);
            if (!compMeta.isComponent) {
                return;
            }
            var ngModule = ngModuleByPipeOrDirective.get(dirType);
            if (!ngModule) {
                throw new Error("Internal Error: cannot determine the module for component " + identifierName(compMeta.type) + "!");
            }
            // compile styles
            var componentStylesheet = _this._styleCompiler.compileComponent(outputCtx, compMeta);
            // Note: compMeta is a component and therefore template is non null.
            compMeta.template.externalStylesheets.forEach(function (stylesheetMeta) {
                // Note: fill non shim and shim style files as they might
                // be shared by component with and without ViewEncapsulation.
                var shim = _this._styleCompiler.needsStyleShim(compMeta);
                generatedFiles.push(_this._codegenStyles(srcFileUrl, compMeta, stylesheetMeta, shim, fileSuffix));
                if (_this._options.allowEmptyCodegenFiles) {
                    generatedFiles.push(_this._codegenStyles(srcFileUrl, compMeta, stylesheetMeta, !shim, fileSuffix));
                }
            });
            // compile components
            var compViewVars = _this._compileComponent(outputCtx, compMeta, ngModule, ngModule.transitiveModule.directives, componentStylesheet, fileSuffix);
            _this._compileComponentFactory(outputCtx, compMeta, ngModule, fileSuffix);
        });
        if (outputCtx.statements.length > 0 || this._options.allowEmptyCodegenFiles) {
            var srcModule = this._codegenSourceModule(srcFileUrl, outputCtx);
            generatedFiles.unshift(srcModule);
        }
        return generatedFiles;
    };
    AotCompiler.prototype._createSummary = function (srcFileName, directives, pipes, ngModules, injectables, ngFactoryCtx) {
        var _this = this;
        var symbolSummaries = this._symbolResolver.getSymbolsOf(srcFileName)
            .map(function (symbol) { return _this._symbolResolver.resolveSymbol(symbol); });
        var typeData = tslib_1.__spread(ngModules.map(function (meta) { return ({
            summary: _this._metadataResolver.getNgModuleSummary(meta.type.reference),
            metadata: _this._metadataResolver.getNgModuleMetadata(meta.type.reference)
        }); }), directives.map(function (ref) { return ({
            summary: _this._metadataResolver.getDirectiveSummary(ref),
            metadata: _this._metadataResolver.getDirectiveMetadata(ref)
        }); }), pipes.map(function (ref) { return ({
            summary: _this._metadataResolver.getPipeSummary(ref),
            metadata: _this._metadataResolver.getPipeMetadata(ref)
        }); }), injectables.map(function (ref) { return ({
            summary: _this._metadataResolver.getInjectableSummary(ref.symbol),
            metadata: _this._metadataResolver.getInjectableSummary(ref.symbol).type
        }); }));
        var forJitOutputCtx = this._options.enableSummariesForJit ?
            this._createOutputContext(summaryForJitFileName(srcFileName, true)) :
            null;
        var _a = serializeSummaries(srcFileName, forJitOutputCtx, this._summaryResolver, this._symbolResolver, symbolSummaries, typeData), json = _a.json, exportAs = _a.exportAs;
        exportAs.forEach(function (entry) {
            ngFactoryCtx.statements.push(o.variable(entry.exportAs).set(ngFactoryCtx.importExpr(entry.symbol)).toDeclStmt(null, [
                o.StmtModifier.Exported
            ]));
        });
        var summaryJson = new GeneratedFile(srcFileName, summaryFileName(srcFileName), json);
        var result = [summaryJson];
        if (forJitOutputCtx) {
            result.push(this._codegenSourceModule(srcFileName, forJitOutputCtx));
        }
        return result;
    };
    AotCompiler.prototype._compileModule = function (outputCtx, ngModule) {
        var providers = [];
        if (this._options.locale) {
            var normalizedLocale = this._options.locale.replace(/_/g, '-');
            providers.push({
                token: createTokenForExternalReference(this.reflector, Identifiers.LOCALE_ID),
                useValue: normalizedLocale,
            });
        }
        if (this._options.i18nFormat) {
            providers.push({
                token: createTokenForExternalReference(this.reflector, Identifiers.TRANSLATIONS_FORMAT),
                useValue: this._options.i18nFormat
            });
        }
        this._ngModuleCompiler.compile(outputCtx, ngModule, providers);
    };
    AotCompiler.prototype._compileComponentFactory = function (outputCtx, compMeta, ngModule, fileSuffix) {
        var hostMeta = this._metadataResolver.getHostComponentMetadata(compMeta);
        var hostViewFactoryVar = this._compileComponent(outputCtx, hostMeta, ngModule, [compMeta.type], null, fileSuffix)
            .viewClassVar;
        var compFactoryVar = componentFactoryName(compMeta.type.reference);
        var inputsExprs = [];
        for (var propName in compMeta.inputs) {
            var templateName = compMeta.inputs[propName];
            // Don't quote so that the key gets minified...
            inputsExprs.push(new o.LiteralMapEntry(propName, o.literal(templateName), false));
        }
        var outputsExprs = [];
        for (var propName in compMeta.outputs) {
            var templateName = compMeta.outputs[propName];
            // Don't quote so that the key gets minified...
            outputsExprs.push(new o.LiteralMapEntry(propName, o.literal(templateName), false));
        }
        outputCtx.statements.push(o.variable(compFactoryVar)
            .set(o.importExpr(Identifiers.createComponentFactory).callFn([
            o.literal(compMeta.selector), outputCtx.importExpr(compMeta.type.reference),
            o.variable(hostViewFactoryVar), new o.LiteralMapExpr(inputsExprs),
            new o.LiteralMapExpr(outputsExprs),
            o.literalArr(compMeta.template.ngContentSelectors.map(function (selector) { return o.literal(selector); }))
        ]))
            .toDeclStmt(o.importType(Identifiers.ComponentFactory, [o.expressionType(outputCtx.importExpr(compMeta.type.reference))], [o.TypeModifier.Const]), [o.StmtModifier.Final, o.StmtModifier.Exported]));
    };
    AotCompiler.prototype._compileComponent = function (outputCtx, compMeta, ngModule, directiveIdentifiers, componentStyles, fileSuffix) {
        var _a = this._parseTemplate(compMeta, ngModule, directiveIdentifiers), parsedTemplate = _a.template, usedPipes = _a.pipes;
        var stylesExpr = componentStyles ? o.variable(componentStyles.stylesVar) : o.literalArr([]);
        var viewResult = this._viewCompiler.compileComponent(outputCtx, compMeta, parsedTemplate, stylesExpr, usedPipes);
        if (componentStyles) {
            _resolveStyleStatements(this._symbolResolver, componentStyles, this._styleCompiler.needsStyleShim(compMeta), fileSuffix);
        }
        return viewResult;
    };
    AotCompiler.prototype._parseTemplate = function (compMeta, ngModule, directiveIdentifiers) {
        var _this = this;
        if (this._templateAstCache.has(compMeta.type.reference)) {
            return this._templateAstCache.get(compMeta.type.reference);
        }
        var preserveWhitespaces = compMeta.template.preserveWhitespaces;
        var directives = directiveIdentifiers.map(function (dir) { return _this._metadataResolver.getDirectiveSummary(dir.reference); });
        var pipes = ngModule.transitiveModule.pipes.map(function (pipe) { return _this._metadataResolver.getPipeSummary(pipe.reference); });
        var result = this._templateParser.parse(compMeta, compMeta.template.htmlAst, directives, pipes, ngModule.schemas, templateSourceUrl(ngModule.type, compMeta, compMeta.template), preserveWhitespaces);
        this._templateAstCache.set(compMeta.type.reference, result);
        return result;
    };
    AotCompiler.prototype._createOutputContext = function (genFilePath) {
        var _this = this;
        var importExpr = function (symbol, typeParams, useSummaries) {
            if (typeParams === void 0) { typeParams = null; }
            if (useSummaries === void 0) { useSummaries = true; }
            if (!(symbol instanceof StaticSymbol)) {
                throw new Error("Internal error: unknown identifier " + JSON.stringify(symbol));
            }
            var arity = _this._symbolResolver.getTypeArity(symbol) || 0;
            var _a = _this._symbolResolver.getImportAs(symbol, useSummaries) || symbol, filePath = _a.filePath, name = _a.name, members = _a.members;
            var importModule = _this._fileNameToModuleName(filePath, genFilePath);
            // It should be good enough to compare filePath to genFilePath and if they are equal
            // there is a self reference. However, ngfactory files generate to .ts but their
            // symbols have .d.ts so a simple compare is insufficient. They should be canonical
            // and is tracked by #17705.
            var selfReference = _this._fileNameToModuleName(genFilePath, genFilePath);
            var moduleName = importModule === selfReference ? null : importModule;
            // If we are in a type expression that refers to a generic type then supply
            // the required type parameters. If there were not enough type parameters
            // supplied, supply any as the type. Outside a type expression the reference
            // should not supply type parameters and be treated as a simple value reference
            // to the constructor function itself.
            var suppliedTypeParams = typeParams || [];
            var missingTypeParamsCount = arity - suppliedTypeParams.length;
            var allTypeParams = suppliedTypeParams.concat(new Array(missingTypeParamsCount).fill(o.DYNAMIC_TYPE));
            return members.reduce(function (expr, memberName) { return expr.prop(memberName); }, o.importExpr(new o.ExternalReference(moduleName, name, null), allTypeParams));
        };
        return { statements: [], genFilePath: genFilePath, importExpr: importExpr, constantPool: new ConstantPool() };
    };
    AotCompiler.prototype._fileNameToModuleName = function (importedFilePath, containingFilePath) {
        return this._summaryResolver.getKnownModuleName(importedFilePath) ||
            this._symbolResolver.getKnownModuleName(importedFilePath) ||
            this._host.fileNameToModuleName(importedFilePath, containingFilePath);
    };
    AotCompiler.prototype._codegenStyles = function (srcFileUrl, compMeta, stylesheetMetadata, isShimmed, fileSuffix) {
        var outputCtx = this._createOutputContext(_stylesModuleUrl(stylesheetMetadata.moduleUrl, isShimmed, fileSuffix));
        var compiledStylesheet = this._styleCompiler.compileStyles(outputCtx, compMeta, stylesheetMetadata, isShimmed);
        _resolveStyleStatements(this._symbolResolver, compiledStylesheet, isShimmed, fileSuffix);
        return this._codegenSourceModule(srcFileUrl, outputCtx);
    };
    AotCompiler.prototype._codegenSourceModule = function (srcFileUrl, ctx) {
        return new GeneratedFile(srcFileUrl, ctx.genFilePath, ctx.statements);
    };
    AotCompiler.prototype.listLazyRoutes = function (entryRoute, analyzedModules) {
        var self = this;
        if (entryRoute) {
            var symbol = parseLazyRoute(entryRoute, this.reflector).referencedModule;
            return visitLazyRoute(symbol);
        }
        else if (analyzedModules) {
            var allLazyRoutes = [];
            try {
                for (var _a = tslib_1.__values(analyzedModules.ngModules), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var ngModule = _b.value;
                    var lazyRoutes = listLazyRoutes(ngModule, this.reflector);
                    try {
                        for (var lazyRoutes_1 = tslib_1.__values(lazyRoutes), lazyRoutes_1_1 = lazyRoutes_1.next(); !lazyRoutes_1_1.done; lazyRoutes_1_1 = lazyRoutes_1.next()) {
                            var lazyRoute = lazyRoutes_1_1.value;
                            allLazyRoutes.push(lazyRoute);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (lazyRoutes_1_1 && !lazyRoutes_1_1.done && (_c = lazyRoutes_1.return)) _c.call(lazyRoutes_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return allLazyRoutes;
        }
        else {
            throw new Error("Either route or analyzedModules has to be specified!");
        }
        function visitLazyRoute(symbol, seenRoutes, allLazyRoutes) {
            if (seenRoutes === void 0) { seenRoutes = new Set(); }
            if (allLazyRoutes === void 0) { allLazyRoutes = []; }
            // Support pointing to default exports, but stop recursing there,
            // as the StaticReflector does not yet support default exports.
            if (seenRoutes.has(symbol) || !symbol.name) {
                return allLazyRoutes;
            }
            seenRoutes.add(symbol);
            var lazyRoutes = listLazyRoutes(self._metadataResolver.getNgModuleMetadata(symbol, true), self.reflector);
            try {
                for (var lazyRoutes_2 = tslib_1.__values(lazyRoutes), lazyRoutes_2_1 = lazyRoutes_2.next(); !lazyRoutes_2_1.done; lazyRoutes_2_1 = lazyRoutes_2.next()) {
                    var lazyRoute = lazyRoutes_2_1.value;
                    allLazyRoutes.push(lazyRoute);
                    visitLazyRoute(lazyRoute.referencedModule, seenRoutes, allLazyRoutes);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (lazyRoutes_2_1 && !lazyRoutes_2_1.done && (_a = lazyRoutes_2.return)) _a.call(lazyRoutes_2);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return allLazyRoutes;
            var e_4, _a;
        }
        var e_3, _d, e_2, _c;
    };
    return AotCompiler;
}());
export { AotCompiler };
function _createEmptyStub(outputCtx) {
    // Note: We need to produce at least one import statement so that
    // TypeScript knows that the file is an es6 module. Otherwise our generated
    // exports / imports won't be emitted properly by TypeScript.
    outputCtx.statements.push(o.importExpr(Identifiers.ComponentFactory).toStmt());
}
function _resolveStyleStatements(symbolResolver, compileResult, needsShim, fileSuffix) {
    compileResult.dependencies.forEach(function (dep) {
        dep.setValue(symbolResolver.getStaticSymbol(_stylesModuleUrl(dep.moduleUrl, needsShim, fileSuffix), dep.name));
    });
}
function _stylesModuleUrl(stylesheetUrl, shim, suffix) {
    return "" + stylesheetUrl + (shim ? '.shim' : '') + ".ngstyle" + suffix;
}
export function analyzeNgModules(fileNames, host, staticSymbolResolver, metadataResolver) {
    var files = _analyzeFilesIncludingNonProgramFiles(fileNames, host, staticSymbolResolver, metadataResolver);
    return mergeAnalyzedFiles(files);
}
export function analyzeAndValidateNgModules(fileNames, host, staticSymbolResolver, metadataResolver) {
    return validateAnalyzedModules(analyzeNgModules(fileNames, host, staticSymbolResolver, metadataResolver));
}
function validateAnalyzedModules(analyzedModules) {
    if (analyzedModules.symbolsMissingModule && analyzedModules.symbolsMissingModule.length) {
        var messages = analyzedModules.symbolsMissingModule.map(function (s) {
            return "Cannot determine the module for class " + s.name + " in " + s.filePath + "! Add " + s.name + " to the NgModule to fix it.";
        });
        throw syntaxError(messages.join('\n'));
    }
    return analyzedModules;
}
// Analyzes all of the program files,
// including files that are not part of the program
// but are referenced by an NgModule.
function _analyzeFilesIncludingNonProgramFiles(fileNames, host, staticSymbolResolver, metadataResolver) {
    var seenFiles = new Set();
    var files = [];
    var visitFile = function (fileName) {
        if (seenFiles.has(fileName) || !host.isSourceFile(fileName)) {
            return false;
        }
        seenFiles.add(fileName);
        var analyzedFile = analyzeFile(host, staticSymbolResolver, metadataResolver, fileName);
        files.push(analyzedFile);
        analyzedFile.ngModules.forEach(function (ngModule) {
            ngModule.transitiveModule.modules.forEach(function (modMeta) { return visitFile(modMeta.reference.filePath); });
        });
    };
    fileNames.forEach(function (fileName) { return visitFile(fileName); });
    return files;
}
export function analyzeFile(host, staticSymbolResolver, metadataResolver, fileName) {
    var directives = [];
    var pipes = [];
    var injectables = [];
    var ngModules = [];
    var hasDecorators = staticSymbolResolver.hasDecorators(fileName);
    var exportsNonSourceFiles = false;
    // Don't analyze .d.ts files that have no decorators as a shortcut
    // to speed up the analysis. This prevents us from
    // resolving the references in these files.
    // Note: exportsNonSourceFiles is only needed when compiling with summaries,
    // which is not the case when .d.ts files are treated as input files.
    if (!fileName.endsWith('.d.ts') || hasDecorators) {
        staticSymbolResolver.getSymbolsOf(fileName).forEach(function (symbol) {
            var resolvedSymbol = staticSymbolResolver.resolveSymbol(symbol);
            var symbolMeta = resolvedSymbol.metadata;
            if (!symbolMeta || symbolMeta.__symbolic === 'error') {
                return;
            }
            var isNgSymbol = false;
            if (symbolMeta.__symbolic === 'class') {
                if (metadataResolver.isDirective(symbol)) {
                    isNgSymbol = true;
                    directives.push(symbol);
                }
                else if (metadataResolver.isPipe(symbol)) {
                    isNgSymbol = true;
                    pipes.push(symbol);
                }
                else if (metadataResolver.isNgModule(symbol)) {
                    var ngModule = metadataResolver.getNgModuleMetadata(symbol, false);
                    if (ngModule) {
                        isNgSymbol = true;
                        ngModules.push(ngModule);
                    }
                }
                else if (metadataResolver.isInjectable(symbol)) {
                    isNgSymbol = true;
                    var injectable = metadataResolver.getInjectableMetadata(symbol, null, false);
                    if (injectable) {
                        injectables.push(injectable);
                    }
                }
            }
            if (!isNgSymbol) {
                exportsNonSourceFiles =
                    exportsNonSourceFiles || isValueExportingNonSourceFile(host, symbolMeta);
            }
        });
    }
    return {
        fileName: fileName, directives: directives, pipes: pipes, ngModules: ngModules, injectables: injectables, exportsNonSourceFiles: exportsNonSourceFiles,
    };
}
export function analyzeFileForInjectables(host, staticSymbolResolver, metadataResolver, fileName) {
    var injectables = [];
    var shallowModules = [];
    if (staticSymbolResolver.hasDecorators(fileName)) {
        staticSymbolResolver.getSymbolsOf(fileName).forEach(function (symbol) {
            var resolvedSymbol = staticSymbolResolver.resolveSymbol(symbol);
            var symbolMeta = resolvedSymbol.metadata;
            if (!symbolMeta || symbolMeta.__symbolic === 'error') {
                return;
            }
            if (symbolMeta.__symbolic === 'class') {
                if (metadataResolver.isInjectable(symbol)) {
                    var injectable = metadataResolver.getInjectableMetadata(symbol, null, false);
                    if (injectable) {
                        injectables.push(injectable);
                    }
                }
                else if (metadataResolver.isNgModule(symbol)) {
                    var module = metadataResolver.getShallowModuleMetadata(symbol);
                    if (module) {
                        shallowModules.push(module);
                    }
                }
            }
        });
    }
    return { fileName: fileName, injectables: injectables, shallowModules: shallowModules };
}
function isValueExportingNonSourceFile(host, metadata) {
    var exportsNonSourceFiles = false;
    var Visitor = /** @class */ (function () {
        function Visitor() {
        }
        Visitor.prototype.visitArray = function (arr, context) {
            var _this = this;
            arr.forEach(function (v) { return visitValue(v, _this, context); });
        };
        Visitor.prototype.visitStringMap = function (map, context) {
            var _this = this;
            Object.keys(map).forEach(function (key) { return visitValue(map[key], _this, context); });
        };
        Visitor.prototype.visitPrimitive = function (value, context) { };
        Visitor.prototype.visitOther = function (value, context) {
            if (value instanceof StaticSymbol && !host.isSourceFile(value.filePath)) {
                exportsNonSourceFiles = true;
            }
        };
        return Visitor;
    }());
    visitValue(metadata, new Visitor(), null);
    return exportsNonSourceFiles;
}
export function mergeAnalyzedFiles(analyzedFiles) {
    var allNgModules = [];
    var ngModuleByPipeOrDirective = new Map();
    var allPipesAndDirectives = new Set();
    analyzedFiles.forEach(function (af) {
        af.ngModules.forEach(function (ngModule) {
            allNgModules.push(ngModule);
            ngModule.declaredDirectives.forEach(function (d) { return ngModuleByPipeOrDirective.set(d.reference, ngModule); });
            ngModule.declaredPipes.forEach(function (p) { return ngModuleByPipeOrDirective.set(p.reference, ngModule); });
        });
        af.directives.forEach(function (d) { return allPipesAndDirectives.add(d); });
        af.pipes.forEach(function (p) { return allPipesAndDirectives.add(p); });
    });
    var symbolsMissingModule = [];
    allPipesAndDirectives.forEach(function (ref) {
        if (!ngModuleByPipeOrDirective.has(ref)) {
            symbolsMissingModule.push(ref);
        }
    });
    return {
        ngModules: allNgModules,
        ngModuleByPipeOrDirective: ngModuleByPipeOrDirective,
        symbolsMissingModule: symbolsMissingModule,
        files: analyzedFiles
    };
}
function mergeAndValidateNgFiles(files) {
    return validateAnalyzedModules(mergeAnalyzedFiles(files));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvYW90L2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQThRLG9CQUFvQixFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUVsWCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsV0FBVyxFQUFFLCtCQUErQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFJNUUsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyw0QkFBNEIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBR3BHLE9BQU8sS0FBSyxDQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFMUMsT0FBTyxFQUFDLDBCQUEwQixJQUFJLGVBQWUsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQzVGLE9BQU8sRUFBQyxzQkFBc0IsSUFBSSxhQUFhLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNwRixPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUNyRSxPQUFPLEVBQUMsMkJBQTJCLElBQUksa0JBQWtCLEVBQUUsMkJBQTJCLElBQUksa0JBQWtCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUM5SSxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUcv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R0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDO1FBQ0wsU0FBUyxFQUFFLFlBQVk7UUFDdkIseUJBQXlCLDJCQUFBO1FBQ3pCLG9CQUFvQixzQkFBQTtRQUNwQixLQUFLLEVBQUUsYUFBYTtLQUNyQixDQUFDO0FBQ0osQ0FBQztBQUVELGlDQUFpQyxLQUF1QjtJQUN0RCxNQUFNLENBQUMsdUJBQXVCLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUM1RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSwgQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YSwgQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEsIENvbXBpbGVQaXBlTWV0YWRhdGEsIENvbXBpbGVQaXBlU3VtbWFyeSwgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEsIENvbXBpbGVTaGFsbG93TW9kdWxlTWV0YWRhdGEsIENvbXBpbGVTdHlsZXNoZWV0TWV0YWRhdGEsIENvbXBpbGVUeXBlTWV0YWRhdGEsIENvbXBpbGVUeXBlU3VtbWFyeSwgY29tcG9uZW50RmFjdG9yeU5hbWUsIGZsYXR0ZW4sIGlkZW50aWZpZXJOYW1lLCB0ZW1wbGF0ZVNvdXJjZVVybH0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0NvbXBpbGVyQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQge01lc3NhZ2VCdW5kbGV9IGZyb20gJy4uL2kxOG4vbWVzc2FnZV9idW5kbGUnO1xuaW1wb3J0IHtJZGVudGlmaWVycywgY3JlYXRlVG9rZW5Gb3JFeHRlcm5hbFJlZmVyZW5jZX0gZnJvbSAnLi4vaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlQ29tcGlsZXJ9IGZyb20gJy4uL2luamVjdGFibGVfY29tcGlsZXInO1xuaW1wb3J0IHtDb21waWxlTWV0YWRhdGFSZXNvbHZlcn0gZnJvbSAnLi4vbWV0YWRhdGFfcmVzb2x2ZXInO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7SHRtbFBhcnNlcn0gZnJvbSAnLi4vbWxfcGFyc2VyL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7cmVtb3ZlV2hpdGVzcGFjZXN9IGZyb20gJy4uL21sX3BhcnNlci9odG1sX3doaXRlc3BhY2VzJztcbmltcG9ydCB7REVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRywgSW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi4vbWxfcGFyc2VyL2ludGVycG9sYXRpb25fY29uZmlnJztcbmltcG9ydCB7TmdNb2R1bGVDb21waWxlcn0gZnJvbSAnLi4vbmdfbW9kdWxlX2NvbXBpbGVyJztcbmltcG9ydCB7T3V0cHV0RW1pdHRlcn0gZnJvbSAnLi4vb3V0cHV0L2Fic3RyYWN0X2VtaXR0ZXInO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1BhcnNlRXJyb3J9IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtjb21waWxlTmdNb2R1bGVGcm9tUmVuZGVyMiBhcyBjb21waWxlUjNNb2R1bGV9IGZyb20gJy4uL3JlbmRlcjMvcjNfbW9kdWxlX2NvbXBpbGVyJztcbmltcG9ydCB7Y29tcGlsZVBpcGVGcm9tUmVuZGVyMiBhcyBjb21waWxlUjNQaXBlfSBmcm9tICcuLi9yZW5kZXIzL3IzX3BpcGVfY29tcGlsZXInO1xuaW1wb3J0IHtodG1sQXN0VG9SZW5kZXIzQXN0fSBmcm9tICcuLi9yZW5kZXIzL3IzX3RlbXBsYXRlX3RyYW5zZm9ybSc7XG5pbXBvcnQge2NvbXBpbGVDb21wb25lbnRGcm9tUmVuZGVyMiBhcyBjb21waWxlUjNDb21wb25lbnQsIGNvbXBpbGVEaXJlY3RpdmVGcm9tUmVuZGVyMiBhcyBjb21waWxlUjNEaXJlY3RpdmV9IGZyb20gJy4uL3JlbmRlcjMvdmlldy9jb21waWxlcic7XG5pbXBvcnQge0RvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi4vc2NoZW1hL2RvbV9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5pbXBvcnQge0NvbXBpbGVkU3R5bGVzaGVldCwgU3R5bGVDb21waWxlcn0gZnJvbSAnLi4vc3R5bGVfY29tcGlsZXInO1xuaW1wb3J0IHtTdW1tYXJ5UmVzb2x2ZXJ9IGZyb20gJy4uL3N1bW1hcnlfcmVzb2x2ZXInO1xuaW1wb3J0IHtCaW5kaW5nUGFyc2VyfSBmcm9tICcuLi90ZW1wbGF0ZV9wYXJzZXIvYmluZGluZ19wYXJzZXInO1xuaW1wb3J0IHtUZW1wbGF0ZUFzdH0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge1RlbXBsYXRlUGFyc2VyfSBmcm9tICcuLi90ZW1wbGF0ZV9wYXJzZXIvdGVtcGxhdGVfcGFyc2VyJztcbmltcG9ydCB7T3V0cHV0Q29udGV4dCwgVmFsdWVWaXNpdG9yLCBlcnJvciwgc3ludGF4RXJyb3IsIHZpc2l0VmFsdWV9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHtUeXBlQ2hlY2tDb21waWxlcn0gZnJvbSAnLi4vdmlld19jb21waWxlci90eXBlX2NoZWNrX2NvbXBpbGVyJztcbmltcG9ydCB7Vmlld0NvbXBpbGVSZXN1bHQsIFZpZXdDb21waWxlcn0gZnJvbSAnLi4vdmlld19jb21waWxlci92aWV3X2NvbXBpbGVyJztcblxuaW1wb3J0IHtBb3RDb21waWxlckhvc3R9IGZyb20gJy4vY29tcGlsZXJfaG9zdCc7XG5pbXBvcnQge0FvdENvbXBpbGVyT3B0aW9uc30gZnJvbSAnLi9jb21waWxlcl9vcHRpb25zJztcbmltcG9ydCB7R2VuZXJhdGVkRmlsZX0gZnJvbSAnLi9nZW5lcmF0ZWRfZmlsZSc7XG5pbXBvcnQge0xhenlSb3V0ZSwgbGlzdExhenlSb3V0ZXMsIHBhcnNlTGF6eVJvdXRlfSBmcm9tICcuL2xhenlfcm91dGVzJztcbmltcG9ydCB7UGFydGlhbE1vZHVsZX0gZnJvbSAnLi9wYXJ0aWFsX21vZHVsZSc7XG5pbXBvcnQge1N0YXRpY1JlZmxlY3Rvcn0gZnJvbSAnLi9zdGF0aWNfcmVmbGVjdG9yJztcbmltcG9ydCB7U3RhdGljU3ltYm9sfSBmcm9tICcuL3N0YXRpY19zeW1ib2wnO1xuaW1wb3J0IHtTdGF0aWNTeW1ib2xSZXNvbHZlcn0gZnJvbSAnLi9zdGF0aWNfc3ltYm9sX3Jlc29sdmVyJztcbmltcG9ydCB7Y3JlYXRlRm9ySml0U3R1Yiwgc2VyaWFsaXplU3VtbWFyaWVzfSBmcm9tICcuL3N1bW1hcnlfc2VyaWFsaXplcic7XG5pbXBvcnQge25nZmFjdG9yeUZpbGVQYXRoLCBub3JtYWxpemVHZW5GaWxlU3VmZml4LCBzcGxpdFR5cGVzY3JpcHRTdWZmaXgsIHN1bW1hcnlGaWxlTmFtZSwgc3VtbWFyeUZvckppdEZpbGVOYW1lfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBlbnVtIFN0dWJFbWl0RmxhZ3MgeyBCYXNpYyA9IDEgPDwgMCwgVHlwZUNoZWNrID0gMSA8PCAxLCBBbGwgPSBUeXBlQ2hlY2sgfCBCYXNpYyB9XG5cbmV4cG9ydCBjbGFzcyBBb3RDb21waWxlciB7XG4gIHByaXZhdGUgX3RlbXBsYXRlQXN0Q2FjaGUgPVxuICAgICAgbmV3IE1hcDxTdGF0aWNTeW1ib2wsIHt0ZW1wbGF0ZTogVGVtcGxhdGVBc3RbXSwgcGlwZXM6IENvbXBpbGVQaXBlU3VtbWFyeVtdfT4oKTtcbiAgcHJpdmF0ZSBfYW5hbHl6ZWRGaWxlcyA9IG5ldyBNYXA8c3RyaW5nLCBOZ0FuYWx5emVkRmlsZT4oKTtcbiAgcHJpdmF0ZSBfYW5hbHl6ZWRGaWxlc0ZvckluamVjdGFibGVzID0gbmV3IE1hcDxzdHJpbmcsIE5nQW5hbHl6ZWRGaWxlV2l0aEluamVjdGFibGVzPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfY29uZmlnOiBDb21waWxlckNvbmZpZywgcHJpdmF0ZSBfb3B0aW9uczogQW90Q29tcGlsZXJPcHRpb25zLFxuICAgICAgcHJpdmF0ZSBfaG9zdDogQW90Q29tcGlsZXJIb3N0LCByZWFkb25seSByZWZsZWN0b3I6IFN0YXRpY1JlZmxlY3RvcixcbiAgICAgIHByaXZhdGUgX21ldGFkYXRhUmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLCBwcml2YXRlIF90ZW1wbGF0ZVBhcnNlcjogVGVtcGxhdGVQYXJzZXIsXG4gICAgICBwcml2YXRlIF9zdHlsZUNvbXBpbGVyOiBTdHlsZUNvbXBpbGVyLCBwcml2YXRlIF92aWV3Q29tcGlsZXI6IFZpZXdDb21waWxlcixcbiAgICAgIHByaXZhdGUgX3R5cGVDaGVja0NvbXBpbGVyOiBUeXBlQ2hlY2tDb21waWxlciwgcHJpdmF0ZSBfbmdNb2R1bGVDb21waWxlcjogTmdNb2R1bGVDb21waWxlcixcbiAgICAgIHByaXZhdGUgX2luamVjdGFibGVDb21waWxlcjogSW5qZWN0YWJsZUNvbXBpbGVyLCBwcml2YXRlIF9vdXRwdXRFbWl0dGVyOiBPdXRwdXRFbWl0dGVyLFxuICAgICAgcHJpdmF0ZSBfc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8U3RhdGljU3ltYm9sPixcbiAgICAgIHByaXZhdGUgX3N5bWJvbFJlc29sdmVyOiBTdGF0aWNTeW1ib2xSZXNvbHZlcikge31cblxuICBjbGVhckNhY2hlKCkgeyB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmNsZWFyQ2FjaGUoKTsgfVxuXG4gIGFuYWx5emVNb2R1bGVzU3luYyhyb290RmlsZXM6IHN0cmluZ1tdKTogTmdBbmFseXplZE1vZHVsZXMge1xuICAgIGNvbnN0IGFuYWx5emVSZXN1bHQgPSBhbmFseXplQW5kVmFsaWRhdGVOZ01vZHVsZXMoXG4gICAgICAgIHJvb3RGaWxlcywgdGhpcy5faG9zdCwgdGhpcy5fc3ltYm9sUmVzb2x2ZXIsIHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIpO1xuICAgIGFuYWx5emVSZXN1bHQubmdNb2R1bGVzLmZvckVhY2goXG4gICAgICAgIG5nTW9kdWxlID0+IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIubG9hZE5nTW9kdWxlRGlyZWN0aXZlQW5kUGlwZU1ldGFkYXRhKFxuICAgICAgICAgICAgbmdNb2R1bGUudHlwZS5yZWZlcmVuY2UsIHRydWUpKTtcbiAgICByZXR1cm4gYW5hbHl6ZVJlc3VsdDtcbiAgfVxuXG4gIGFuYWx5emVNb2R1bGVzQXN5bmMocm9vdEZpbGVzOiBzdHJpbmdbXSk6IFByb21pc2U8TmdBbmFseXplZE1vZHVsZXM+IHtcbiAgICBjb25zdCBhbmFseXplUmVzdWx0ID0gYW5hbHl6ZUFuZFZhbGlkYXRlTmdNb2R1bGVzKFxuICAgICAgICByb290RmlsZXMsIHRoaXMuX2hvc3QsIHRoaXMuX3N5bWJvbFJlc29sdmVyLCB0aGlzLl9tZXRhZGF0YVJlc29sdmVyKTtcbiAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAuYWxsKGFuYWx5emVSZXN1bHQubmdNb2R1bGVzLm1hcChcbiAgICAgICAgICAgIG5nTW9kdWxlID0+IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIubG9hZE5nTW9kdWxlRGlyZWN0aXZlQW5kUGlwZU1ldGFkYXRhKFxuICAgICAgICAgICAgICAgIG5nTW9kdWxlLnR5cGUucmVmZXJlbmNlLCBmYWxzZSkpKVxuICAgICAgICAudGhlbigoKSA9PiBhbmFseXplUmVzdWx0KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FuYWx5emVGaWxlKGZpbGVOYW1lOiBzdHJpbmcpOiBOZ0FuYWx5emVkRmlsZSB7XG4gICAgbGV0IGFuYWx5emVkRmlsZSA9IHRoaXMuX2FuYWx5emVkRmlsZXMuZ2V0KGZpbGVOYW1lKTtcbiAgICBpZiAoIWFuYWx5emVkRmlsZSkge1xuICAgICAgYW5hbHl6ZWRGaWxlID1cbiAgICAgICAgICBhbmFseXplRmlsZSh0aGlzLl9ob3N0LCB0aGlzLl9zeW1ib2xSZXNvbHZlciwgdGhpcy5fbWV0YWRhdGFSZXNvbHZlciwgZmlsZU5hbWUpO1xuICAgICAgdGhpcy5fYW5hbHl6ZWRGaWxlcy5zZXQoZmlsZU5hbWUsIGFuYWx5emVkRmlsZSk7XG4gICAgfVxuICAgIHJldHVybiBhbmFseXplZEZpbGU7XG4gIH1cblxuICBwcml2YXRlIF9hbmFseXplRmlsZUZvckluamVjdGFibGVzKGZpbGVOYW1lOiBzdHJpbmcpOiBOZ0FuYWx5emVkRmlsZVdpdGhJbmplY3RhYmxlcyB7XG4gICAgbGV0IGFuYWx5emVkRmlsZSA9IHRoaXMuX2FuYWx5emVkRmlsZXNGb3JJbmplY3RhYmxlcy5nZXQoZmlsZU5hbWUpO1xuICAgIGlmICghYW5hbHl6ZWRGaWxlKSB7XG4gICAgICBhbmFseXplZEZpbGUgPSBhbmFseXplRmlsZUZvckluamVjdGFibGVzKFxuICAgICAgICAgIHRoaXMuX2hvc3QsIHRoaXMuX3N5bWJvbFJlc29sdmVyLCB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLCBmaWxlTmFtZSk7XG4gICAgICB0aGlzLl9hbmFseXplZEZpbGVzRm9ySW5qZWN0YWJsZXMuc2V0KGZpbGVOYW1lLCBhbmFseXplZEZpbGUpO1xuICAgIH1cbiAgICByZXR1cm4gYW5hbHl6ZWRGaWxlO1xuICB9XG5cbiAgZmluZEdlbmVyYXRlZEZpbGVOYW1lcyhmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGdlbkZpbGVOYW1lczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBmaWxlID0gdGhpcy5fYW5hbHl6ZUZpbGUoZmlsZU5hbWUpO1xuICAgIC8vIE1ha2Ugc3VyZSB3ZSBjcmVhdGUgYSAubmdmYWN0b3J5IGlmIHdlIGhhdmUgYSBpbmplY3RhYmxlL2RpcmVjdGl2ZS9waXBlL05nTW9kdWxlXG4gICAgLy8gb3IgYSByZWZlcmVuY2UgdG8gYSBub24gc291cmNlIGZpbGUuXG4gICAgLy8gTm90ZTogVGhpcyBpcyBvdmVyZXN0aW1hdGluZyB0aGUgcmVxdWlyZWQgLm5nZmFjdG9yeSBmaWxlcyBhcyB0aGUgcmVhbCBjYWxjdWxhdGlvbiBpcyBoYXJkZXIuXG4gICAgLy8gT25seSBkbyB0aGlzIGZvciBTdHViRW1pdEZsYWdzLkJhc2ljLCBhcyBhZGRpbmcgYSB0eXBlIGNoZWNrIGJsb2NrXG4gICAgLy8gZG9lcyBub3QgY2hhbmdlIHRoaXMgZmlsZSAoYXMgd2UgZ2VuZXJhdGUgdHlwZSBjaGVjayBibG9ja3MgYmFzZWQgb24gTmdNb2R1bGVzKS5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5hbGxvd0VtcHR5Q29kZWdlbkZpbGVzIHx8IGZpbGUuZGlyZWN0aXZlcy5sZW5ndGggfHwgZmlsZS5waXBlcy5sZW5ndGggfHxcbiAgICAgICAgZmlsZS5pbmplY3RhYmxlcy5sZW5ndGggfHwgZmlsZS5uZ01vZHVsZXMubGVuZ3RoIHx8IGZpbGUuZXhwb3J0c05vblNvdXJjZUZpbGVzKSB7XG4gICAgICBnZW5GaWxlTmFtZXMucHVzaChuZ2ZhY3RvcnlGaWxlUGF0aChmaWxlLmZpbGVOYW1lLCB0cnVlKSk7XG4gICAgICBpZiAodGhpcy5fb3B0aW9ucy5lbmFibGVTdW1tYXJpZXNGb3JKaXQpIHtcbiAgICAgICAgZ2VuRmlsZU5hbWVzLnB1c2goc3VtbWFyeUZvckppdEZpbGVOYW1lKGZpbGUuZmlsZU5hbWUsIHRydWUpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZmlsZVN1ZmZpeCA9IG5vcm1hbGl6ZUdlbkZpbGVTdWZmaXgoc3BsaXRUeXBlc2NyaXB0U3VmZml4KGZpbGUuZmlsZU5hbWUsIHRydWUpWzFdKTtcbiAgICBmaWxlLmRpcmVjdGl2ZXMuZm9yRWFjaCgoZGlyU3ltYm9sKSA9PiB7XG4gICAgICBjb25zdCBjb21wTWV0YSA9XG4gICAgICAgICAgdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXROb25Ob3JtYWxpemVkRGlyZWN0aXZlTWV0YWRhdGEoZGlyU3ltYm9sKSAhLm1ldGFkYXRhO1xuICAgICAgaWYgKCFjb21wTWV0YS5pc0NvbXBvbmVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBOb3RlOiBjb21wTWV0YSBpcyBhIGNvbXBvbmVudCBhbmQgdGhlcmVmb3JlIHRlbXBsYXRlIGlzIG5vbiBudWxsLlxuICAgICAgY29tcE1ldGEudGVtcGxhdGUgIS5zdHlsZVVybHMuZm9yRWFjaCgoc3R5bGVVcmwpID0+IHtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZFVybCA9IHRoaXMuX2hvc3QucmVzb3VyY2VOYW1lVG9GaWxlTmFtZShzdHlsZVVybCwgZmlsZS5maWxlTmFtZSk7XG4gICAgICAgIGlmICghbm9ybWFsaXplZFVybCkge1xuICAgICAgICAgIHRocm93IHN5bnRheEVycm9yKGBDb3VsZG4ndCByZXNvbHZlIHJlc291cmNlICR7c3R5bGVVcmx9IHJlbGF0aXZlIHRvICR7ZmlsZS5maWxlTmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZWVkc1NoaW0gPSAoY29tcE1ldGEudGVtcGxhdGUgIS5lbmNhcHN1bGF0aW9uIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jb25maWcuZGVmYXVsdEVuY2Fwc3VsYXRpb24pID09PSBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZDtcbiAgICAgICAgZ2VuRmlsZU5hbWVzLnB1c2goX3N0eWxlc01vZHVsZVVybChub3JtYWxpemVkVXJsLCBuZWVkc1NoaW0sIGZpbGVTdWZmaXgpKTtcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuYWxsb3dFbXB0eUNvZGVnZW5GaWxlcykge1xuICAgICAgICAgIGdlbkZpbGVOYW1lcy5wdXNoKF9zdHlsZXNNb2R1bGVVcmwobm9ybWFsaXplZFVybCwgIW5lZWRzU2hpbSwgZmlsZVN1ZmZpeCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZ2VuRmlsZU5hbWVzO1xuICB9XG5cbiAgZW1pdEJhc2ljU3R1YihnZW5GaWxlTmFtZTogc3RyaW5nLCBvcmlnaW5hbEZpbGVOYW1lPzogc3RyaW5nKTogR2VuZXJhdGVkRmlsZSB7XG4gICAgY29uc3Qgb3V0cHV0Q3R4ID0gdGhpcy5fY3JlYXRlT3V0cHV0Q29udGV4dChnZW5GaWxlTmFtZSk7XG4gICAgaWYgKGdlbkZpbGVOYW1lLmVuZHNXaXRoKCcubmdmYWN0b3J5LnRzJykpIHtcbiAgICAgIGlmICghb3JpZ2luYWxGaWxlTmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQXNzZXJ0aW9uIGVycm9yOiByZXF1aXJlIHRoZSBvcmlnaW5hbCBmaWxlIGZvciAubmdmYWN0b3J5LnRzIHN0dWJzLiBGaWxlOiAke2dlbkZpbGVOYW1lfWApO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3JpZ2luYWxGaWxlID0gdGhpcy5fYW5hbHl6ZUZpbGUob3JpZ2luYWxGaWxlTmFtZSk7XG4gICAgICB0aGlzLl9jcmVhdGVOZ0ZhY3RvcnlTdHViKG91dHB1dEN0eCwgb3JpZ2luYWxGaWxlLCBTdHViRW1pdEZsYWdzLkJhc2ljKTtcbiAgICB9IGVsc2UgaWYgKGdlbkZpbGVOYW1lLmVuZHNXaXRoKCcubmdzdW1tYXJ5LnRzJykpIHtcbiAgICAgIGlmICh0aGlzLl9vcHRpb25zLmVuYWJsZVN1bW1hcmllc0ZvckppdCkge1xuICAgICAgICBpZiAoIW9yaWdpbmFsRmlsZU5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBBc3NlcnRpb24gZXJyb3I6IHJlcXVpcmUgdGhlIG9yaWdpbmFsIGZpbGUgZm9yIC5uZ3N1bW1hcnkudHMgc3R1YnMuIEZpbGU6ICR7Z2VuRmlsZU5hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3JpZ2luYWxGaWxlID0gdGhpcy5fYW5hbHl6ZUZpbGUob3JpZ2luYWxGaWxlTmFtZSk7XG4gICAgICAgIF9jcmVhdGVFbXB0eVN0dWIob3V0cHV0Q3R4KTtcbiAgICAgICAgb3JpZ2luYWxGaWxlLm5nTW9kdWxlcy5mb3JFYWNoKG5nTW9kdWxlID0+IHtcbiAgICAgICAgICAvLyBjcmVhdGUgZXhwb3J0cyB0aGF0IHVzZXIgY29kZSBjYW4gcmVmZXJlbmNlXG4gICAgICAgICAgY3JlYXRlRm9ySml0U3R1YihvdXRwdXRDdHgsIG5nTW9kdWxlLnR5cGUucmVmZXJlbmNlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChnZW5GaWxlTmFtZS5lbmRzV2l0aCgnLm5nc3R5bGUudHMnKSkge1xuICAgICAgX2NyZWF0ZUVtcHR5U3R1YihvdXRwdXRDdHgpO1xuICAgIH1cbiAgICAvLyBOb3RlOiBmb3IgdGhlIHN0dWJzLCB3ZSBkb24ndCBuZWVkIGEgcHJvcGVydHkgc3JjRmlsZVVybCxcbiAgICAvLyBhcyBsYXRlciBvbiBpbiBlbWl0QWxsSW1wbHMgd2Ugd2lsbCBjcmVhdGUgdGhlIHByb3BlciBHZW5lcmF0ZWRGaWxlcyB3aXRoIHRoZVxuICAgIC8vIGNvcnJlY3Qgc3JjRmlsZVVybC5cbiAgICAvLyBUaGlzIGlzIGdvb2QgYXMgZS5nLiBmb3IgLm5nc3R5bGUudHMgZmlsZXMgd2UgY2FuJ3QgZGVyaXZlXG4gICAgLy8gdGhlIHVybCBvZiBjb21wb25lbnRzIGJhc2VkIG9uIHRoZSBnZW5GaWxlVXJsLlxuICAgIHJldHVybiB0aGlzLl9jb2RlZ2VuU291cmNlTW9kdWxlKCd1bmtub3duJywgb3V0cHV0Q3R4KTtcbiAgfVxuXG4gIGVtaXRUeXBlQ2hlY2tTdHViKGdlbkZpbGVOYW1lOiBzdHJpbmcsIG9yaWdpbmFsRmlsZU5hbWU6IHN0cmluZyk6IEdlbmVyYXRlZEZpbGV8bnVsbCB7XG4gICAgY29uc3Qgb3JpZ2luYWxGaWxlID0gdGhpcy5fYW5hbHl6ZUZpbGUob3JpZ2luYWxGaWxlTmFtZSk7XG4gICAgY29uc3Qgb3V0cHV0Q3R4ID0gdGhpcy5fY3JlYXRlT3V0cHV0Q29udGV4dChnZW5GaWxlTmFtZSk7XG4gICAgaWYgKGdlbkZpbGVOYW1lLmVuZHNXaXRoKCcubmdmYWN0b3J5LnRzJykpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZU5nRmFjdG9yeVN0dWIob3V0cHV0Q3R4LCBvcmlnaW5hbEZpbGUsIFN0dWJFbWl0RmxhZ3MuVHlwZUNoZWNrKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dEN0eC5zdGF0ZW1lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgICB0aGlzLl9jb2RlZ2VuU291cmNlTW9kdWxlKG9yaWdpbmFsRmlsZS5maWxlTmFtZSwgb3V0cHV0Q3R4KSA6XG4gICAgICAgIG51bGw7XG4gIH1cblxuICBsb2FkRmlsZXNBc3luYyhmaWxlTmFtZXM6IHN0cmluZ1tdLCB0c0ZpbGVzOiBzdHJpbmdbXSk6IFByb21pc2U8XG4gICAgICB7YW5hbHl6ZWRNb2R1bGVzOiBOZ0FuYWx5emVkTW9kdWxlcywgYW5hbHl6ZWRJbmplY3RhYmxlczogTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXNbXX0+IHtcbiAgICBjb25zdCBmaWxlcyA9IGZpbGVOYW1lcy5tYXAoZmlsZU5hbWUgPT4gdGhpcy5fYW5hbHl6ZUZpbGUoZmlsZU5hbWUpKTtcbiAgICBjb25zdCBsb2FkaW5nUHJvbWlzZXM6IFByb21pc2U8TmdBbmFseXplZE1vZHVsZXM+W10gPSBbXTtcbiAgICBmaWxlcy5mb3JFYWNoKFxuICAgICAgICBmaWxlID0+IGZpbGUubmdNb2R1bGVzLmZvckVhY2goXG4gICAgICAgICAgICBuZ01vZHVsZSA9PlxuICAgICAgICAgICAgICAgIGxvYWRpbmdQcm9taXNlcy5wdXNoKHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIubG9hZE5nTW9kdWxlRGlyZWN0aXZlQW5kUGlwZU1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICBuZ01vZHVsZS50eXBlLnJlZmVyZW5jZSwgZmFsc2UpKSkpO1xuICAgIGNvbnN0IGFuYWx5emVkSW5qZWN0YWJsZXMgPSB0c0ZpbGVzLm1hcCh0c0ZpbGUgPT4gdGhpcy5fYW5hbHl6ZUZpbGVGb3JJbmplY3RhYmxlcyh0c0ZpbGUpKTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwobG9hZGluZ1Byb21pc2VzKS50aGVuKF8gPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5hbHl6ZWRNb2R1bGVzOiBtZXJnZUFuZFZhbGlkYXRlTmdGaWxlcyhmaWxlcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuYWx5emVkSW5qZWN0YWJsZXM6IGFuYWx5emVkSW5qZWN0YWJsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBsb2FkRmlsZXNTeW5jKGZpbGVOYW1lczogc3RyaW5nW10sIHRzRmlsZXM6IHN0cmluZ1tdKTpcbiAgICAgIHthbmFseXplZE1vZHVsZXM6IE5nQW5hbHl6ZWRNb2R1bGVzLCBhbmFseXplZEluamVjdGFibGVzOiBOZ0FuYWx5emVkRmlsZVdpdGhJbmplY3RhYmxlc1tdfSB7XG4gICAgY29uc3QgZmlsZXMgPSBmaWxlTmFtZXMubWFwKGZpbGVOYW1lID0+IHRoaXMuX2FuYWx5emVGaWxlKGZpbGVOYW1lKSk7XG4gICAgZmlsZXMuZm9yRWFjaChcbiAgICAgICAgZmlsZSA9PiBmaWxlLm5nTW9kdWxlcy5mb3JFYWNoKFxuICAgICAgICAgICAgbmdNb2R1bGUgPT4gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5sb2FkTmdNb2R1bGVEaXJlY3RpdmVBbmRQaXBlTWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgbmdNb2R1bGUudHlwZS5yZWZlcmVuY2UsIHRydWUpKSk7XG4gICAgY29uc3QgYW5hbHl6ZWRJbmplY3RhYmxlcyA9IHRzRmlsZXMubWFwKHRzRmlsZSA9PiB0aGlzLl9hbmFseXplRmlsZUZvckluamVjdGFibGVzKHRzRmlsZSkpO1xuICAgIHJldHVybiB7XG4gICAgICBhbmFseXplZE1vZHVsZXM6IG1lcmdlQW5kVmFsaWRhdGVOZ0ZpbGVzKGZpbGVzKSxcbiAgICAgIGFuYWx5emVkSW5qZWN0YWJsZXM6IGFuYWx5emVkSW5qZWN0YWJsZXMsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZU5nRmFjdG9yeVN0dWIoXG4gICAgICBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQsIGZpbGU6IE5nQW5hbHl6ZWRGaWxlLCBlbWl0RmxhZ3M6IFN0dWJFbWl0RmxhZ3MpIHtcbiAgICBsZXQgY29tcG9uZW50SWQgPSAwO1xuICAgIGZpbGUubmdNb2R1bGVzLmZvckVhY2goKG5nTW9kdWxlTWV0YSwgbmdNb2R1bGVJbmRleCkgPT4ge1xuICAgICAgLy8gTm90ZTogdGhlIGNvZGUgYmVsb3cgbmVlZHMgdG8gZXhlY3V0ZWQgZm9yIFN0dWJFbWl0RmxhZ3MuQmFzaWMgYW5kIFN0dWJFbWl0RmxhZ3MuVHlwZUNoZWNrLFxuICAgICAgLy8gc28gd2UgZG9uJ3QgY2hhbmdlIHRoZSAubmdmYWN0b3J5IGZpbGUgdG9vIG11Y2ggd2hlbiBhZGRpbmcgdGhlIHR5cGUtY2hlY2sgYmxvY2suXG5cbiAgICAgIC8vIGNyZWF0ZSBleHBvcnRzIHRoYXQgdXNlciBjb2RlIGNhbiByZWZlcmVuY2VcbiAgICAgIHRoaXMuX25nTW9kdWxlQ29tcGlsZXIuY3JlYXRlU3R1YihvdXRwdXRDdHgsIG5nTW9kdWxlTWV0YS50eXBlLnJlZmVyZW5jZSk7XG5cbiAgICAgIC8vIGFkZCByZWZlcmVuY2VzIHRvIHRoZSBzeW1ib2xzIGZyb20gdGhlIG1ldGFkYXRhLlxuICAgICAgLy8gVGhlc2UgY2FuIGJlIHVzZWQgYnkgdGhlIHR5cGUgY2hlY2sgYmxvY2sgZm9yIGNvbXBvbmVudHMsXG4gICAgICAvLyBhbmQgdGhleSBhbHNvIGNhdXNlIFR5cGVTY3JpcHQgdG8gaW5jbHVkZSB0aGVzZSBmaWxlcyBpbnRvIHRoZSBwcm9ncmFtIHRvbyxcbiAgICAgIC8vIHdoaWNoIHdpbGwgbWFrZSB0aGVtIHBhcnQgb2YgdGhlIGFuYWx5emVkRmlsZXMuXG4gICAgICBjb25zdCBleHRlcm5hbFJlZmVyZW5jZXM6IFN0YXRpY1N5bWJvbFtdID0gW1xuICAgICAgICAvLyBBZGQgcmVmZXJlbmNlcyB0aGF0IGFyZSBhdmFpbGFibGUgZnJvbSBhbGwgdGhlIG1vZHVsZXMgYW5kIGltcG9ydHMuXG4gICAgICAgIC4uLm5nTW9kdWxlTWV0YS50cmFuc2l0aXZlTW9kdWxlLmRpcmVjdGl2ZXMubWFwKGQgPT4gZC5yZWZlcmVuY2UpLFxuICAgICAgICAuLi5uZ01vZHVsZU1ldGEudHJhbnNpdGl2ZU1vZHVsZS5waXBlcy5tYXAoZCA9PiBkLnJlZmVyZW5jZSksXG4gICAgICAgIC4uLm5nTW9kdWxlTWV0YS5pbXBvcnRlZE1vZHVsZXMubWFwKG0gPT4gbS50eXBlLnJlZmVyZW5jZSksXG4gICAgICAgIC4uLm5nTW9kdWxlTWV0YS5leHBvcnRlZE1vZHVsZXMubWFwKG0gPT4gbS50eXBlLnJlZmVyZW5jZSksXG5cbiAgICAgICAgLy8gQWRkIHJlZmVyZW5jZXMgdGhhdCBtaWdodCBiZSBpbnNlcnRlZCBieSB0aGUgdGVtcGxhdGUgY29tcGlsZXIuXG4gICAgICAgIC4uLnRoaXMuX2V4dGVybmFsSWRlbnRpZmllclJlZmVyZW5jZXMoW0lkZW50aWZpZXJzLlRlbXBsYXRlUmVmLCBJZGVudGlmaWVycy5FbGVtZW50UmVmXSksXG4gICAgICBdO1xuXG4gICAgICBjb25zdCBleHRlcm5hbFJlZmVyZW5jZVZhcnMgPSBuZXcgTWFwPGFueSwgc3RyaW5nPigpO1xuICAgICAgZXh0ZXJuYWxSZWZlcmVuY2VzLmZvckVhY2goKHJlZiwgdHlwZUluZGV4KSA9PiB7XG4gICAgICAgIGV4dGVybmFsUmVmZXJlbmNlVmFycy5zZXQocmVmLCBgX2RlY2wke25nTW9kdWxlSW5kZXh9XyR7dHlwZUluZGV4fWApO1xuICAgICAgfSk7XG4gICAgICBleHRlcm5hbFJlZmVyZW5jZVZhcnMuZm9yRWFjaCgodmFyTmFtZSwgcmVmZXJlbmNlKSA9PiB7XG4gICAgICAgIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgICAgICBvLnZhcmlhYmxlKHZhck5hbWUpXG4gICAgICAgICAgICAgICAgLnNldChvLk5VTExfRVhQUi5jYXN0KG8uRFlOQU1JQ19UWVBFKSlcbiAgICAgICAgICAgICAgICAudG9EZWNsU3RtdChvLmV4cHJlc3Npb25UeXBlKG91dHB1dEN0eC5pbXBvcnRFeHByKFxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UsIC8qIHR5cGVQYXJhbXMgKi8gbnVsbCwgLyogdXNlU3VtbWFyaWVzICovIGZhbHNlKSkpKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZW1pdEZsYWdzICYgU3R1YkVtaXRGbGFncy5UeXBlQ2hlY2spIHtcbiAgICAgICAgLy8gYWRkIHRoZSB0eXBlLWNoZWNrIGJsb2NrIGZvciBhbGwgY29tcG9uZW50cyBvZiB0aGUgTmdNb2R1bGVcbiAgICAgICAgbmdNb2R1bGVNZXRhLmRlY2xhcmVkRGlyZWN0aXZlcy5mb3JFYWNoKChkaXJJZCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbXBNZXRhID0gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXREaXJlY3RpdmVNZXRhZGF0YShkaXJJZC5yZWZlcmVuY2UpO1xuICAgICAgICAgIGlmICghY29tcE1ldGEuaXNDb21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29tcG9uZW50SWQrKztcbiAgICAgICAgICB0aGlzLl9jcmVhdGVUeXBlQ2hlY2tCbG9jayhcbiAgICAgICAgICAgICAgb3V0cHV0Q3R4LCBgJHtjb21wTWV0YS50eXBlLnJlZmVyZW5jZS5uYW1lfV9Ib3N0XyR7Y29tcG9uZW50SWR9YCwgbmdNb2R1bGVNZXRhLFxuICAgICAgICAgICAgICB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldEhvc3RDb21wb25lbnRNZXRhZGF0YShjb21wTWV0YSksIFtjb21wTWV0YS50eXBlXSxcbiAgICAgICAgICAgICAgZXh0ZXJuYWxSZWZlcmVuY2VWYXJzKTtcbiAgICAgICAgICB0aGlzLl9jcmVhdGVUeXBlQ2hlY2tCbG9jayhcbiAgICAgICAgICAgICAgb3V0cHV0Q3R4LCBgJHtjb21wTWV0YS50eXBlLnJlZmVyZW5jZS5uYW1lfV8ke2NvbXBvbmVudElkfWAsIG5nTW9kdWxlTWV0YSwgY29tcE1ldGEsXG4gICAgICAgICAgICAgIG5nTW9kdWxlTWV0YS50cmFuc2l0aXZlTW9kdWxlLmRpcmVjdGl2ZXMsIGV4dGVybmFsUmVmZXJlbmNlVmFycyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKG91dHB1dEN0eC5zdGF0ZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgX2NyZWF0ZUVtcHR5U3R1YihvdXRwdXRDdHgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2V4dGVybmFsSWRlbnRpZmllclJlZmVyZW5jZXMocmVmZXJlbmNlczogby5FeHRlcm5hbFJlZmVyZW5jZVtdKTogU3RhdGljU3ltYm9sW10ge1xuICAgIGNvbnN0IHJlc3VsdDogU3RhdGljU3ltYm9sW10gPSBbXTtcbiAgICBmb3IgKGxldCByZWZlcmVuY2Ugb2YgcmVmZXJlbmNlcykge1xuICAgICAgY29uc3QgdG9rZW4gPSBjcmVhdGVUb2tlbkZvckV4dGVybmFsUmVmZXJlbmNlKHRoaXMucmVmbGVjdG9yLCByZWZlcmVuY2UpO1xuICAgICAgaWYgKHRva2VuLmlkZW50aWZpZXIpIHtcbiAgICAgICAgcmVzdWx0LnB1c2godG9rZW4uaWRlbnRpZmllci5yZWZlcmVuY2UpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlVHlwZUNoZWNrQmxvY2soXG4gICAgICBjdHg6IE91dHB1dENvbnRleHQsIGNvbXBvbmVudElkOiBzdHJpbmcsIG1vZHVsZU1ldGE6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLFxuICAgICAgY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgZGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdLFxuICAgICAgZXh0ZXJuYWxSZWZlcmVuY2VWYXJzOiBNYXA8YW55LCBzdHJpbmc+KSB7XG4gICAgY29uc3Qge3RlbXBsYXRlOiBwYXJzZWRUZW1wbGF0ZSwgcGlwZXM6IHVzZWRQaXBlc30gPVxuICAgICAgICB0aGlzLl9wYXJzZVRlbXBsYXRlKGNvbXBNZXRhLCBtb2R1bGVNZXRhLCBkaXJlY3RpdmVzKTtcbiAgICBjdHguc3RhdGVtZW50cy5wdXNoKC4uLnRoaXMuX3R5cGVDaGVja0NvbXBpbGVyLmNvbXBpbGVDb21wb25lbnQoXG4gICAgICAgIGNvbXBvbmVudElkLCBjb21wTWV0YSwgcGFyc2VkVGVtcGxhdGUsIHVzZWRQaXBlcywgZXh0ZXJuYWxSZWZlcmVuY2VWYXJzLCBjdHgpKTtcbiAgfVxuXG4gIGVtaXRNZXNzYWdlQnVuZGxlKGFuYWx5emVSZXN1bHQ6IE5nQW5hbHl6ZWRNb2R1bGVzLCBsb2NhbGU6IHN0cmluZ3xudWxsKTogTWVzc2FnZUJ1bmRsZSB7XG4gICAgY29uc3QgZXJyb3JzOiBQYXJzZUVycm9yW10gPSBbXTtcbiAgICBjb25zdCBodG1sUGFyc2VyID0gbmV3IEh0bWxQYXJzZXIoKTtcblxuICAgIC8vIFRPRE8odmljYik6IGltcGxpY2l0IHRhZ3MgJiBhdHRyaWJ1dGVzXG4gICAgY29uc3QgbWVzc2FnZUJ1bmRsZSA9IG5ldyBNZXNzYWdlQnVuZGxlKGh0bWxQYXJzZXIsIFtdLCB7fSwgbG9jYWxlKTtcblxuICAgIGFuYWx5emVSZXN1bHQuZmlsZXMuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgIGNvbnN0IGNvbXBNZXRhczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10gPSBbXTtcbiAgICAgIGZpbGUuZGlyZWN0aXZlcy5mb3JFYWNoKGRpcmVjdGl2ZVR5cGUgPT4ge1xuICAgICAgICBjb25zdCBkaXJNZXRhID0gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXREaXJlY3RpdmVNZXRhZGF0YShkaXJlY3RpdmVUeXBlKTtcbiAgICAgICAgaWYgKGRpck1ldGEgJiYgZGlyTWV0YS5pc0NvbXBvbmVudCkge1xuICAgICAgICAgIGNvbXBNZXRhcy5wdXNoKGRpck1ldGEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbXBNZXRhcy5mb3JFYWNoKGNvbXBNZXRhID0+IHtcbiAgICAgICAgY29uc3QgaHRtbCA9IGNvbXBNZXRhLnRlbXBsYXRlICEudGVtcGxhdGUgITtcbiAgICAgICAgLy8gVGVtcGxhdGUgVVJMIHBvaW50cyB0byBlaXRoZXIgYW4gSFRNTCBvciBUUyBmaWxlIGRlcGVuZGluZyBvbiB3aGV0aGVyXG4gICAgICAgIC8vIHRoZSBmaWxlIGlzIHVzZWQgd2l0aCBgdGVtcGxhdGVVcmw6YCBvciBgdGVtcGxhdGU6YCwgcmVzcGVjdGl2ZWx5LlxuICAgICAgICBjb25zdCB0ZW1wbGF0ZVVybCA9IGNvbXBNZXRhLnRlbXBsYXRlICEudGVtcGxhdGVVcmwgITtcbiAgICAgICAgY29uc3QgaW50ZXJwb2xhdGlvbkNvbmZpZyA9XG4gICAgICAgICAgICBJbnRlcnBvbGF0aW9uQ29uZmlnLmZyb21BcnJheShjb21wTWV0YS50ZW1wbGF0ZSAhLmludGVycG9sYXRpb24pO1xuICAgICAgICBlcnJvcnMucHVzaCguLi5tZXNzYWdlQnVuZGxlLnVwZGF0ZUZyb21UZW1wbGF0ZShodG1sLCB0ZW1wbGF0ZVVybCwgaW50ZXJwb2xhdGlvbkNvbmZpZykgISk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JzLm1hcChlID0+IGUudG9TdHJpbmcoKSkuam9pbignXFxuJykpO1xuICAgIH1cblxuICAgIHJldHVybiBtZXNzYWdlQnVuZGxlO1xuICB9XG5cbiAgZW1pdEFsbFBhcnRpYWxNb2R1bGVzKFxuICAgICAge25nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUsIGZpbGVzfTogTmdBbmFseXplZE1vZHVsZXMsXG4gICAgICByM0ZpbGVzOiBOZ0FuYWx5emVkRmlsZVdpdGhJbmplY3RhYmxlc1tdKTogUGFydGlhbE1vZHVsZVtdIHtcbiAgICBjb25zdCBjb250ZXh0TWFwID0gbmV3IE1hcDxzdHJpbmcsIE91dHB1dENvbnRleHQ+KCk7XG5cbiAgICBjb25zdCBnZXRDb250ZXh0ID0gKGZpbGVOYW1lOiBzdHJpbmcpOiBPdXRwdXRDb250ZXh0ID0+IHtcbiAgICAgIGlmICghY29udGV4dE1hcC5oYXMoZmlsZU5hbWUpKSB7XG4gICAgICAgIGNvbnRleHRNYXAuc2V0KGZpbGVOYW1lLCB0aGlzLl9jcmVhdGVPdXRwdXRDb250ZXh0KGZpbGVOYW1lKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGV4dE1hcC5nZXQoZmlsZU5hbWUpICE7XG4gICAgfTtcblxuICAgIGZpbGVzLmZvckVhY2goXG4gICAgICAgIGZpbGUgPT4gdGhpcy5fY29tcGlsZVBhcnRpYWxNb2R1bGUoXG4gICAgICAgICAgICBmaWxlLmZpbGVOYW1lLCBuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlLCBmaWxlLmRpcmVjdGl2ZXMsIGZpbGUucGlwZXMsIGZpbGUubmdNb2R1bGVzLFxuICAgICAgICAgICAgZmlsZS5pbmplY3RhYmxlcywgZ2V0Q29udGV4dChmaWxlLmZpbGVOYW1lKSkpO1xuICAgIHIzRmlsZXMuZm9yRWFjaChcbiAgICAgICAgZmlsZSA9PiB0aGlzLl9jb21waWxlU2hhbGxvd01vZHVsZXMoXG4gICAgICAgICAgICBmaWxlLmZpbGVOYW1lLCBmaWxlLnNoYWxsb3dNb2R1bGVzLCBnZXRDb250ZXh0KGZpbGUuZmlsZU5hbWUpKSk7XG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbShjb250ZXh0TWFwLnZhbHVlcygpKVxuICAgICAgICAubWFwKGNvbnRleHQgPT4gKHtcbiAgICAgICAgICAgICAgIGZpbGVOYW1lOiBjb250ZXh0LmdlbkZpbGVQYXRoLFxuICAgICAgICAgICAgICAgc3RhdGVtZW50czogWy4uLmNvbnRleHQuY29uc3RhbnRQb29sLnN0YXRlbWVudHMsIC4uLmNvbnRleHQuc3RhdGVtZW50c10sXG4gICAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGlsZVNoYWxsb3dNb2R1bGVzKFxuICAgICAgZmlsZU5hbWU6IHN0cmluZywgc2hhbGxvd01vZHVsZXM6IENvbXBpbGVTaGFsbG93TW9kdWxlTWV0YWRhdGFbXSxcbiAgICAgIGNvbnRleHQ6IE91dHB1dENvbnRleHQpOiB2b2lkIHtcbiAgICBzaGFsbG93TW9kdWxlcy5mb3JFYWNoKG1vZHVsZSA9PiBjb21waWxlUjNNb2R1bGUoY29udGV4dCwgbW9kdWxlLCB0aGlzLl9pbmplY3RhYmxlQ29tcGlsZXIpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBpbGVQYXJ0aWFsTW9kdWxlKFxuICAgICAgZmlsZU5hbWU6IHN0cmluZywgbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZTogTWFwPFN0YXRpY1N5bWJvbCwgQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGE+LFxuICAgICAgZGlyZWN0aXZlczogU3RhdGljU3ltYm9sW10sIHBpcGVzOiBTdGF0aWNTeW1ib2xbXSwgbmdNb2R1bGVzOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YVtdLFxuICAgICAgaW5qZWN0YWJsZXM6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGFbXSwgY29udGV4dDogT3V0cHV0Q29udGV4dCk6IHZvaWQge1xuICAgIGNvbnN0IGVycm9yczogUGFyc2VFcnJvcltdID0gW107XG5cbiAgICBjb25zdCBzY2hlbWFSZWdpc3RyeSA9IG5ldyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkoKTtcbiAgICBjb25zdCBob3N0QmluZGluZ1BhcnNlciA9IG5ldyBCaW5kaW5nUGFyc2VyKFxuICAgICAgICB0aGlzLl90ZW1wbGF0ZVBhcnNlci5leHByZXNzaW9uUGFyc2VyLCBERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHLCBzY2hlbWFSZWdpc3RyeSwgW10sXG4gICAgICAgIGVycm9ycyk7XG5cbiAgICAvLyBQcm9jZXNzIGFsbCBjb21wb25lbnRzIGFuZCBkaXJlY3RpdmVzXG4gICAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpcmVjdGl2ZVR5cGUgPT4ge1xuICAgICAgY29uc3QgZGlyZWN0aXZlTWV0YWRhdGEgPSB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgaWYgKGRpcmVjdGl2ZU1ldGFkYXRhLmlzQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbnN0IG1vZHVsZSA9IG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUuZ2V0KGRpcmVjdGl2ZVR5cGUpICE7XG4gICAgICAgIG1vZHVsZSB8fFxuICAgICAgICAgICAgZXJyb3IoXG4gICAgICAgICAgICAgICAgYENhbm5vdCBkZXRlcm1pbmUgdGhlIG1vZHVsZSBmb3IgY29tcG9uZW50ICcke2lkZW50aWZpZXJOYW1lKGRpcmVjdGl2ZU1ldGFkYXRhLnR5cGUpfSdgKTtcblxuICAgICAgICBsZXQgaHRtbEFzdCA9IGRpcmVjdGl2ZU1ldGFkYXRhLnRlbXBsYXRlICEuaHRtbEFzdCAhO1xuICAgICAgICBjb25zdCBwcmVzZXJ2ZVdoaXRlc3BhY2VzID0gZGlyZWN0aXZlTWV0YWRhdGEgIS50ZW1wbGF0ZSAhLnByZXNlcnZlV2hpdGVzcGFjZXM7XG5cbiAgICAgICAgaWYgKCFwcmVzZXJ2ZVdoaXRlc3BhY2VzKSB7XG4gICAgICAgICAgaHRtbEFzdCA9IHJlbW92ZVdoaXRlc3BhY2VzKGh0bWxBc3QpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlbmRlcjNBc3QgPSBodG1sQXN0VG9SZW5kZXIzQXN0KGh0bWxBc3Qucm9vdE5vZGVzLCBob3N0QmluZGluZ1BhcnNlcik7XG5cbiAgICAgICAgLy8gTWFwIG9mIFN0YXRpY1R5cGUgYnkgZGlyZWN0aXZlIHNlbGVjdG9yc1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVUeXBlQnlTZWwgPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xuXG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZXMgPSBtb2R1bGUudHJhbnNpdGl2ZU1vZHVsZS5kaXJlY3RpdmVzLm1hcChcbiAgICAgICAgICAgIGRpciA9PiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldERpcmVjdGl2ZVN1bW1hcnkoZGlyLnJlZmVyZW5jZSkpO1xuXG4gICAgICAgIGRpcmVjdGl2ZXMuZm9yRWFjaChkaXJlY3RpdmUgPT4ge1xuICAgICAgICAgIGlmIChkaXJlY3RpdmUuc2VsZWN0b3IpIHtcbiAgICAgICAgICAgIGRpcmVjdGl2ZVR5cGVCeVNlbC5zZXQoZGlyZWN0aXZlLnNlbGVjdG9yLCBkaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTWFwIG9mIFN0YXRpY1R5cGUgYnkgcGlwZSBuYW1lc1xuICAgICAgICBjb25zdCBwaXBlVHlwZUJ5TmFtZSA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG5cbiAgICAgICAgY29uc3QgcGlwZXMgPSBtb2R1bGUudHJhbnNpdGl2ZU1vZHVsZS5waXBlcy5tYXAoXG4gICAgICAgICAgICBwaXBlID0+IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0UGlwZVN1bW1hcnkocGlwZS5yZWZlcmVuY2UpKTtcblxuICAgICAgICBwaXBlcy5mb3JFYWNoKHBpcGUgPT4geyBwaXBlVHlwZUJ5TmFtZS5zZXQocGlwZS5uYW1lLCBwaXBlLnR5cGUucmVmZXJlbmNlKTsgfSk7XG5cbiAgICAgICAgY29tcGlsZVIzQ29tcG9uZW50KFxuICAgICAgICAgICAgY29udGV4dCwgZGlyZWN0aXZlTWV0YWRhdGEsIHJlbmRlcjNBc3QsIHRoaXMucmVmbGVjdG9yLCBob3N0QmluZGluZ1BhcnNlcixcbiAgICAgICAgICAgIGRpcmVjdGl2ZVR5cGVCeVNlbCwgcGlwZVR5cGVCeU5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tcGlsZVIzRGlyZWN0aXZlKGNvbnRleHQsIGRpcmVjdGl2ZU1ldGFkYXRhLCB0aGlzLnJlZmxlY3RvciwgaG9zdEJpbmRpbmdQYXJzZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcGlwZXMuZm9yRWFjaChwaXBlVHlwZSA9PiB7XG4gICAgICBjb25zdCBwaXBlTWV0YWRhdGEgPSB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldFBpcGVNZXRhZGF0YShwaXBlVHlwZSk7XG4gICAgICBpZiAocGlwZU1ldGFkYXRhKSB7XG4gICAgICAgIGNvbXBpbGVSM1BpcGUoY29udGV4dCwgcGlwZU1ldGFkYXRhLCB0aGlzLnJlZmxlY3Rvcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpbmplY3RhYmxlcy5mb3JFYWNoKGluamVjdGFibGUgPT4gdGhpcy5faW5qZWN0YWJsZUNvbXBpbGVyLmNvbXBpbGUoaW5qZWN0YWJsZSwgY29udGV4dCkpO1xuICB9XG5cbiAgZW1pdEFsbFBhcnRpYWxNb2R1bGVzMihmaWxlczogTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXNbXSk6IFBhcnRpYWxNb2R1bGVbXSB7XG4gICAgLy8gVXNpbmcgcmVkdWNlIGxpa2UgdGhpcyBpcyBhIHNlbGVjdCBtYW55IHBhdHRlcm4gKHdoZXJlIG1hcCBpcyBhIHNlbGVjdCBwYXR0ZXJuKVxuICAgIHJldHVybiBmaWxlcy5yZWR1Y2U8UGFydGlhbE1vZHVsZVtdPigociwgZmlsZSkgPT4ge1xuICAgICAgci5wdXNoKC4uLnRoaXMuX2VtaXRQYXJ0aWFsTW9kdWxlMihmaWxlLmZpbGVOYW1lLCBmaWxlLmluamVjdGFibGVzKSk7XG4gICAgICByZXR1cm4gcjtcbiAgICB9LCBbXSk7XG4gIH1cblxuICBwcml2YXRlIF9lbWl0UGFydGlhbE1vZHVsZTIoZmlsZU5hbWU6IHN0cmluZywgaW5qZWN0YWJsZXM6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGFbXSk6XG4gICAgICBQYXJ0aWFsTW9kdWxlW10ge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLl9jcmVhdGVPdXRwdXRDb250ZXh0KGZpbGVOYW1lKTtcblxuICAgIGluamVjdGFibGVzLmZvckVhY2goaW5qZWN0YWJsZSA9PiB0aGlzLl9pbmplY3RhYmxlQ29tcGlsZXIuY29tcGlsZShpbmplY3RhYmxlLCBjb250ZXh0KSk7XG5cbiAgICBpZiAoY29udGV4dC5zdGF0ZW1lbnRzICYmIGNvbnRleHQuc3RhdGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gW3tmaWxlTmFtZSwgc3RhdGVtZW50czogWy4uLmNvbnRleHQuY29uc3RhbnRQb29sLnN0YXRlbWVudHMsIC4uLmNvbnRleHQuc3RhdGVtZW50c119XTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZW1pdEFsbEltcGxzKGFuYWx5emVSZXN1bHQ6IE5nQW5hbHl6ZWRNb2R1bGVzKTogR2VuZXJhdGVkRmlsZVtdIHtcbiAgICBjb25zdCB7bmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZSwgZmlsZXN9ID0gYW5hbHl6ZVJlc3VsdDtcbiAgICBjb25zdCBzb3VyY2VNb2R1bGVzID0gZmlsZXMubWFwKFxuICAgICAgICBmaWxlID0+IHRoaXMuX2NvbXBpbGVJbXBsRmlsZShcbiAgICAgICAgICAgIGZpbGUuZmlsZU5hbWUsIG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUsIGZpbGUuZGlyZWN0aXZlcywgZmlsZS5waXBlcywgZmlsZS5uZ01vZHVsZXMsXG4gICAgICAgICAgICBmaWxlLmluamVjdGFibGVzKSk7XG4gICAgcmV0dXJuIGZsYXR0ZW4oc291cmNlTW9kdWxlcyk7XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlSW1wbEZpbGUoXG4gICAgICBzcmNGaWxlVXJsOiBzdHJpbmcsIG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmU6IE1hcDxTdGF0aWNTeW1ib2wsIENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhPixcbiAgICAgIGRpcmVjdGl2ZXM6IFN0YXRpY1N5bWJvbFtdLCBwaXBlczogU3RhdGljU3ltYm9sW10sIG5nTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGFbXSxcbiAgICAgIGluamVjdGFibGVzOiBDb21waWxlSW5qZWN0YWJsZU1ldGFkYXRhW10pOiBHZW5lcmF0ZWRGaWxlW10ge1xuICAgIGNvbnN0IGZpbGVTdWZmaXggPSBub3JtYWxpemVHZW5GaWxlU3VmZml4KHNwbGl0VHlwZXNjcmlwdFN1ZmZpeChzcmNGaWxlVXJsLCB0cnVlKVsxXSk7XG4gICAgY29uc3QgZ2VuZXJhdGVkRmlsZXM6IEdlbmVyYXRlZEZpbGVbXSA9IFtdO1xuXG4gICAgY29uc3Qgb3V0cHV0Q3R4ID0gdGhpcy5fY3JlYXRlT3V0cHV0Q29udGV4dChuZ2ZhY3RvcnlGaWxlUGF0aChzcmNGaWxlVXJsLCB0cnVlKSk7XG5cbiAgICBnZW5lcmF0ZWRGaWxlcy5wdXNoKFxuICAgICAgICAuLi50aGlzLl9jcmVhdGVTdW1tYXJ5KHNyY0ZpbGVVcmwsIGRpcmVjdGl2ZXMsIHBpcGVzLCBuZ01vZHVsZXMsIGluamVjdGFibGVzLCBvdXRwdXRDdHgpKTtcblxuICAgIC8vIGNvbXBpbGUgYWxsIG5nIG1vZHVsZXNcbiAgICBuZ01vZHVsZXMuZm9yRWFjaCgobmdNb2R1bGVNZXRhKSA9PiB0aGlzLl9jb21waWxlTW9kdWxlKG91dHB1dEN0eCwgbmdNb2R1bGVNZXRhKSk7XG5cbiAgICAvLyBjb21waWxlIGNvbXBvbmVudHNcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goKGRpclR5cGUpID0+IHtcbiAgICAgIGNvbnN0IGNvbXBNZXRhID0gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXREaXJlY3RpdmVNZXRhZGF0YSg8YW55PmRpclR5cGUpO1xuICAgICAgaWYgKCFjb21wTWV0YS5pc0NvbXBvbmVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBuZ01vZHVsZSA9IG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUuZ2V0KGRpclR5cGUpO1xuICAgICAgaWYgKCFuZ01vZHVsZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgSW50ZXJuYWwgRXJyb3I6IGNhbm5vdCBkZXRlcm1pbmUgdGhlIG1vZHVsZSBmb3IgY29tcG9uZW50ICR7aWRlbnRpZmllck5hbWUoY29tcE1ldGEudHlwZSl9IWApO1xuICAgICAgfVxuXG4gICAgICAvLyBjb21waWxlIHN0eWxlc1xuICAgICAgY29uc3QgY29tcG9uZW50U3R5bGVzaGVldCA9IHRoaXMuX3N0eWxlQ29tcGlsZXIuY29tcGlsZUNvbXBvbmVudChvdXRwdXRDdHgsIGNvbXBNZXRhKTtcbiAgICAgIC8vIE5vdGU6IGNvbXBNZXRhIGlzIGEgY29tcG9uZW50IGFuZCB0aGVyZWZvcmUgdGVtcGxhdGUgaXMgbm9uIG51bGwuXG4gICAgICBjb21wTWV0YS50ZW1wbGF0ZSAhLmV4dGVybmFsU3R5bGVzaGVldHMuZm9yRWFjaCgoc3R5bGVzaGVldE1ldGEpID0+IHtcbiAgICAgICAgLy8gTm90ZTogZmlsbCBub24gc2hpbSBhbmQgc2hpbSBzdHlsZSBmaWxlcyBhcyB0aGV5IG1pZ2h0XG4gICAgICAgIC8vIGJlIHNoYXJlZCBieSBjb21wb25lbnQgd2l0aCBhbmQgd2l0aG91dCBWaWV3RW5jYXBzdWxhdGlvbi5cbiAgICAgICAgY29uc3Qgc2hpbSA9IHRoaXMuX3N0eWxlQ29tcGlsZXIubmVlZHNTdHlsZVNoaW0oY29tcE1ldGEpO1xuICAgICAgICBnZW5lcmF0ZWRGaWxlcy5wdXNoKFxuICAgICAgICAgICAgdGhpcy5fY29kZWdlblN0eWxlcyhzcmNGaWxlVXJsLCBjb21wTWV0YSwgc3R5bGVzaGVldE1ldGEsIHNoaW0sIGZpbGVTdWZmaXgpKTtcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuYWxsb3dFbXB0eUNvZGVnZW5GaWxlcykge1xuICAgICAgICAgIGdlbmVyYXRlZEZpbGVzLnB1c2goXG4gICAgICAgICAgICAgIHRoaXMuX2NvZGVnZW5TdHlsZXMoc3JjRmlsZVVybCwgY29tcE1ldGEsIHN0eWxlc2hlZXRNZXRhLCAhc2hpbSwgZmlsZVN1ZmZpeCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gY29tcGlsZSBjb21wb25lbnRzXG4gICAgICBjb25zdCBjb21wVmlld1ZhcnMgPSB0aGlzLl9jb21waWxlQ29tcG9uZW50KFxuICAgICAgICAgIG91dHB1dEN0eCwgY29tcE1ldGEsIG5nTW9kdWxlLCBuZ01vZHVsZS50cmFuc2l0aXZlTW9kdWxlLmRpcmVjdGl2ZXMsIGNvbXBvbmVudFN0eWxlc2hlZXQsXG4gICAgICAgICAgZmlsZVN1ZmZpeCk7XG4gICAgICB0aGlzLl9jb21waWxlQ29tcG9uZW50RmFjdG9yeShvdXRwdXRDdHgsIGNvbXBNZXRhLCBuZ01vZHVsZSwgZmlsZVN1ZmZpeCk7XG4gICAgfSk7XG4gICAgaWYgKG91dHB1dEN0eC5zdGF0ZW1lbnRzLmxlbmd0aCA+IDAgfHwgdGhpcy5fb3B0aW9ucy5hbGxvd0VtcHR5Q29kZWdlbkZpbGVzKSB7XG4gICAgICBjb25zdCBzcmNNb2R1bGUgPSB0aGlzLl9jb2RlZ2VuU291cmNlTW9kdWxlKHNyY0ZpbGVVcmwsIG91dHB1dEN0eCk7XG4gICAgICBnZW5lcmF0ZWRGaWxlcy51bnNoaWZ0KHNyY01vZHVsZSk7XG4gICAgfVxuICAgIHJldHVybiBnZW5lcmF0ZWRGaWxlcztcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZVN1bW1hcnkoXG4gICAgICBzcmNGaWxlTmFtZTogc3RyaW5nLCBkaXJlY3RpdmVzOiBTdGF0aWNTeW1ib2xbXSwgcGlwZXM6IFN0YXRpY1N5bWJvbFtdLFxuICAgICAgbmdNb2R1bGVzOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YVtdLCBpbmplY3RhYmxlczogQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YVtdLFxuICAgICAgbmdGYWN0b3J5Q3R4OiBPdXRwdXRDb250ZXh0KTogR2VuZXJhdGVkRmlsZVtdIHtcbiAgICBjb25zdCBzeW1ib2xTdW1tYXJpZXMgPSB0aGlzLl9zeW1ib2xSZXNvbHZlci5nZXRTeW1ib2xzT2Yoc3JjRmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoc3ltYm9sID0+IHRoaXMuX3N5bWJvbFJlc29sdmVyLnJlc29sdmVTeW1ib2woc3ltYm9sKSk7XG4gICAgY29uc3QgdHlwZURhdGE6IHtcbiAgICAgIHN1bW1hcnk6IENvbXBpbGVUeXBlU3VtbWFyeSxcbiAgICAgIG1ldGFkYXRhOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSB8IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB8IENvbXBpbGVQaXBlTWV0YWRhdGEgfFxuICAgICAgICAgIENvbXBpbGVUeXBlTWV0YWRhdGFcbiAgICB9W10gPVxuICAgICAgICBbXG4gICAgICAgICAgLi4ubmdNb2R1bGVzLm1hcChcbiAgICAgICAgICAgICAgbWV0YSA9PiAoe1xuICAgICAgICAgICAgICAgIHN1bW1hcnk6IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0TmdNb2R1bGVTdW1tYXJ5KG1ldGEudHlwZS5yZWZlcmVuY2UpICEsXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0TmdNb2R1bGVNZXRhZGF0YShtZXRhLnR5cGUucmVmZXJlbmNlKSAhXG4gICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAuLi5kaXJlY3RpdmVzLm1hcChyZWYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1bW1hcnk6IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0RGlyZWN0aXZlU3VtbWFyeShyZWYpICEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YTogdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXREaXJlY3RpdmVNZXRhZGF0YShyZWYpICFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgLi4ucGlwZXMubWFwKHJlZiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgIHN1bW1hcnk6IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0UGlwZVN1bW1hcnkocmVmKSAhLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldFBpcGVNZXRhZGF0YShyZWYpICFcbiAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgIC4uLmluamVjdGFibGVzLm1hcChcbiAgICAgICAgICAgICAgcmVmID0+ICh7XG4gICAgICAgICAgICAgICAgc3VtbWFyeTogdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRJbmplY3RhYmxlU3VtbWFyeShyZWYuc3ltYm9sKSAhLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldEluamVjdGFibGVTdW1tYXJ5KHJlZi5zeW1ib2wpICEudHlwZVxuICAgICAgICAgICAgICB9KSlcbiAgICAgICAgXTtcbiAgICBjb25zdCBmb3JKaXRPdXRwdXRDdHggPSB0aGlzLl9vcHRpb25zLmVuYWJsZVN1bW1hcmllc0ZvckppdCA/XG4gICAgICAgIHRoaXMuX2NyZWF0ZU91dHB1dENvbnRleHQoc3VtbWFyeUZvckppdEZpbGVOYW1lKHNyY0ZpbGVOYW1lLCB0cnVlKSkgOlxuICAgICAgICBudWxsO1xuICAgIGNvbnN0IHtqc29uLCBleHBvcnRBc30gPSBzZXJpYWxpemVTdW1tYXJpZXMoXG4gICAgICAgIHNyY0ZpbGVOYW1lLCBmb3JKaXRPdXRwdXRDdHgsIHRoaXMuX3N1bW1hcnlSZXNvbHZlciwgdGhpcy5fc3ltYm9sUmVzb2x2ZXIsIHN5bWJvbFN1bW1hcmllcyxcbiAgICAgICAgdHlwZURhdGEpO1xuICAgIGV4cG9ydEFzLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICBuZ0ZhY3RvcnlDdHguc3RhdGVtZW50cy5wdXNoKFxuICAgICAgICAgIG8udmFyaWFibGUoZW50cnkuZXhwb3J0QXMpLnNldChuZ0ZhY3RvcnlDdHguaW1wb3J0RXhwcihlbnRyeS5zeW1ib2wpKS50b0RlY2xTdG10KG51bGwsIFtcbiAgICAgICAgICAgIG8uU3RtdE1vZGlmaWVyLkV4cG9ydGVkXG4gICAgICAgICAgXSkpO1xuICAgIH0pO1xuICAgIGNvbnN0IHN1bW1hcnlKc29uID0gbmV3IEdlbmVyYXRlZEZpbGUoc3JjRmlsZU5hbWUsIHN1bW1hcnlGaWxlTmFtZShzcmNGaWxlTmFtZSksIGpzb24pO1xuICAgIGNvbnN0IHJlc3VsdCA9IFtzdW1tYXJ5SnNvbl07XG4gICAgaWYgKGZvckppdE91dHB1dEN0eCkge1xuICAgICAgcmVzdWx0LnB1c2godGhpcy5fY29kZWdlblNvdXJjZU1vZHVsZShzcmNGaWxlTmFtZSwgZm9ySml0T3V0cHV0Q3R4KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlTW9kdWxlKG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgbmdNb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhKTogdm9pZCB7XG4gICAgY29uc3QgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdID0gW107XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5sb2NhbGUpIHtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRMb2NhbGUgPSB0aGlzLl9vcHRpb25zLmxvY2FsZS5yZXBsYWNlKC9fL2csICctJyk7XG4gICAgICBwcm92aWRlcnMucHVzaCh7XG4gICAgICAgIHRva2VuOiBjcmVhdGVUb2tlbkZvckV4dGVybmFsUmVmZXJlbmNlKHRoaXMucmVmbGVjdG9yLCBJZGVudGlmaWVycy5MT0NBTEVfSUQpLFxuICAgICAgICB1c2VWYWx1ZTogbm9ybWFsaXplZExvY2FsZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9vcHRpb25zLmkxOG5Gb3JtYXQpIHtcbiAgICAgIHByb3ZpZGVycy5wdXNoKHtcbiAgICAgICAgdG9rZW46IGNyZWF0ZVRva2VuRm9yRXh0ZXJuYWxSZWZlcmVuY2UodGhpcy5yZWZsZWN0b3IsIElkZW50aWZpZXJzLlRSQU5TTEFUSU9OU19GT1JNQVQpLFxuICAgICAgICB1c2VWYWx1ZTogdGhpcy5fb3B0aW9ucy5pMThuRm9ybWF0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9uZ01vZHVsZUNvbXBpbGVyLmNvbXBpbGUob3V0cHV0Q3R4LCBuZ01vZHVsZSwgcHJvdmlkZXJzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBpbGVDb21wb25lbnRGYWN0b3J5KFxuICAgICAgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCBjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgbmdNb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLCBmaWxlU3VmZml4OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBob3N0TWV0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0SG9zdENvbXBvbmVudE1ldGFkYXRhKGNvbXBNZXRhKTtcbiAgICBjb25zdCBob3N0Vmlld0ZhY3RvcnlWYXIgPVxuICAgICAgICB0aGlzLl9jb21waWxlQ29tcG9uZW50KG91dHB1dEN0eCwgaG9zdE1ldGEsIG5nTW9kdWxlLCBbY29tcE1ldGEudHlwZV0sIG51bGwsIGZpbGVTdWZmaXgpXG4gICAgICAgICAgICAudmlld0NsYXNzVmFyO1xuICAgIGNvbnN0IGNvbXBGYWN0b3J5VmFyID0gY29tcG9uZW50RmFjdG9yeU5hbWUoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UpO1xuICAgIGNvbnN0IGlucHV0c0V4cHJzOiBvLkxpdGVyYWxNYXBFbnRyeVtdID0gW107XG4gICAgZm9yIChsZXQgcHJvcE5hbWUgaW4gY29tcE1ldGEuaW5wdXRzKSB7XG4gICAgICBjb25zdCB0ZW1wbGF0ZU5hbWUgPSBjb21wTWV0YS5pbnB1dHNbcHJvcE5hbWVdO1xuICAgICAgLy8gRG9uJ3QgcXVvdGUgc28gdGhhdCB0aGUga2V5IGdldHMgbWluaWZpZWQuLi5cbiAgICAgIGlucHV0c0V4cHJzLnB1c2gobmV3IG8uTGl0ZXJhbE1hcEVudHJ5KHByb3BOYW1lLCBvLmxpdGVyYWwodGVtcGxhdGVOYW1lKSwgZmFsc2UpKTtcbiAgICB9XG4gICAgY29uc3Qgb3V0cHV0c0V4cHJzOiBvLkxpdGVyYWxNYXBFbnRyeVtdID0gW107XG4gICAgZm9yIChsZXQgcHJvcE5hbWUgaW4gY29tcE1ldGEub3V0cHV0cykge1xuICAgICAgY29uc3QgdGVtcGxhdGVOYW1lID0gY29tcE1ldGEub3V0cHV0c1twcm9wTmFtZV07XG4gICAgICAvLyBEb24ndCBxdW90ZSBzbyB0aGF0IHRoZSBrZXkgZ2V0cyBtaW5pZmllZC4uLlxuICAgICAgb3V0cHV0c0V4cHJzLnB1c2gobmV3IG8uTGl0ZXJhbE1hcEVudHJ5KHByb3BOYW1lLCBvLmxpdGVyYWwodGVtcGxhdGVOYW1lKSwgZmFsc2UpKTtcbiAgICB9XG5cbiAgICBvdXRwdXRDdHguc3RhdGVtZW50cy5wdXNoKFxuICAgICAgICBvLnZhcmlhYmxlKGNvbXBGYWN0b3J5VmFyKVxuICAgICAgICAgICAgLnNldChvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuY3JlYXRlQ29tcG9uZW50RmFjdG9yeSkuY2FsbEZuKFtcbiAgICAgICAgICAgICAgby5saXRlcmFsKGNvbXBNZXRhLnNlbGVjdG9yKSwgb3V0cHV0Q3R4LmltcG9ydEV4cHIoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UpLFxuICAgICAgICAgICAgICBvLnZhcmlhYmxlKGhvc3RWaWV3RmFjdG9yeVZhciksIG5ldyBvLkxpdGVyYWxNYXBFeHByKGlucHV0c0V4cHJzKSxcbiAgICAgICAgICAgICAgbmV3IG8uTGl0ZXJhbE1hcEV4cHIob3V0cHV0c0V4cHJzKSxcbiAgICAgICAgICAgICAgby5saXRlcmFsQXJyKFxuICAgICAgICAgICAgICAgICAgY29tcE1ldGEudGVtcGxhdGUgIS5uZ0NvbnRlbnRTZWxlY3RvcnMubWFwKHNlbGVjdG9yID0+IG8ubGl0ZXJhbChzZWxlY3RvcikpKVxuICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAudG9EZWNsU3RtdChcbiAgICAgICAgICAgICAgICBvLmltcG9ydFR5cGUoXG4gICAgICAgICAgICAgICAgICAgIElkZW50aWZpZXJzLkNvbXBvbmVudEZhY3RvcnksXG4gICAgICAgICAgICAgICAgICAgIFtvLmV4cHJlc3Npb25UeXBlKG91dHB1dEN0eC5pbXBvcnRFeHByKGNvbXBNZXRhLnR5cGUucmVmZXJlbmNlKSkgIV0sXG4gICAgICAgICAgICAgICAgICAgIFtvLlR5cGVNb2RpZmllci5Db25zdF0pLFxuICAgICAgICAgICAgICAgIFtvLlN0bXRNb2RpZmllci5GaW5hbCwgby5TdG10TW9kaWZpZXIuRXhwb3J0ZWRdKSk7XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlQ29tcG9uZW50KFxuICAgICAgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCBjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgbmdNb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLCBkaXJlY3RpdmVJZGVudGlmaWVyczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdLFxuICAgICAgY29tcG9uZW50U3R5bGVzOiBDb21waWxlZFN0eWxlc2hlZXR8bnVsbCwgZmlsZVN1ZmZpeDogc3RyaW5nKTogVmlld0NvbXBpbGVSZXN1bHQge1xuICAgIGNvbnN0IHt0ZW1wbGF0ZTogcGFyc2VkVGVtcGxhdGUsIHBpcGVzOiB1c2VkUGlwZXN9ID1cbiAgICAgICAgdGhpcy5fcGFyc2VUZW1wbGF0ZShjb21wTWV0YSwgbmdNb2R1bGUsIGRpcmVjdGl2ZUlkZW50aWZpZXJzKTtcbiAgICBjb25zdCBzdHlsZXNFeHByID0gY29tcG9uZW50U3R5bGVzID8gby52YXJpYWJsZShjb21wb25lbnRTdHlsZXMuc3R5bGVzVmFyKSA6IG8ubGl0ZXJhbEFycihbXSk7XG4gICAgY29uc3Qgdmlld1Jlc3VsdCA9IHRoaXMuX3ZpZXdDb21waWxlci5jb21waWxlQ29tcG9uZW50KFxuICAgICAgICBvdXRwdXRDdHgsIGNvbXBNZXRhLCBwYXJzZWRUZW1wbGF0ZSwgc3R5bGVzRXhwciwgdXNlZFBpcGVzKTtcbiAgICBpZiAoY29tcG9uZW50U3R5bGVzKSB7XG4gICAgICBfcmVzb2x2ZVN0eWxlU3RhdGVtZW50cyhcbiAgICAgICAgICB0aGlzLl9zeW1ib2xSZXNvbHZlciwgY29tcG9uZW50U3R5bGVzLCB0aGlzLl9zdHlsZUNvbXBpbGVyLm5lZWRzU3R5bGVTaGltKGNvbXBNZXRhKSxcbiAgICAgICAgICBmaWxlU3VmZml4KTtcbiAgICB9XG4gICAgcmV0dXJuIHZpZXdSZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVRlbXBsYXRlKFxuICAgICAgY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgbmdNb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLFxuICAgICAgZGlyZWN0aXZlSWRlbnRpZmllcnM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSk6XG4gICAgICB7dGVtcGxhdGU6IFRlbXBsYXRlQXN0W10sIHBpcGVzOiBDb21waWxlUGlwZVN1bW1hcnlbXX0ge1xuICAgIGlmICh0aGlzLl90ZW1wbGF0ZUFzdENhY2hlLmhhcyhjb21wTWV0YS50eXBlLnJlZmVyZW5jZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl90ZW1wbGF0ZUFzdENhY2hlLmdldChjb21wTWV0YS50eXBlLnJlZmVyZW5jZSkgITtcbiAgICB9XG4gICAgY29uc3QgcHJlc2VydmVXaGl0ZXNwYWNlcyA9IGNvbXBNZXRhICEudGVtcGxhdGUgIS5wcmVzZXJ2ZVdoaXRlc3BhY2VzO1xuICAgIGNvbnN0IGRpcmVjdGl2ZXMgPVxuICAgICAgICBkaXJlY3RpdmVJZGVudGlmaWVycy5tYXAoZGlyID0+IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0RGlyZWN0aXZlU3VtbWFyeShkaXIucmVmZXJlbmNlKSk7XG4gICAgY29uc3QgcGlwZXMgPSBuZ01vZHVsZS50cmFuc2l0aXZlTW9kdWxlLnBpcGVzLm1hcChcbiAgICAgICAgcGlwZSA9PiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldFBpcGVTdW1tYXJ5KHBpcGUucmVmZXJlbmNlKSk7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fdGVtcGxhdGVQYXJzZXIucGFyc2UoXG4gICAgICAgIGNvbXBNZXRhLCBjb21wTWV0YS50ZW1wbGF0ZSAhLmh0bWxBc3QgISwgZGlyZWN0aXZlcywgcGlwZXMsIG5nTW9kdWxlLnNjaGVtYXMsXG4gICAgICAgIHRlbXBsYXRlU291cmNlVXJsKG5nTW9kdWxlLnR5cGUsIGNvbXBNZXRhLCBjb21wTWV0YS50ZW1wbGF0ZSAhKSwgcHJlc2VydmVXaGl0ZXNwYWNlcyk7XG4gICAgdGhpcy5fdGVtcGxhdGVBc3RDYWNoZS5zZXQoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UsIHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZU91dHB1dENvbnRleHQoZ2VuRmlsZVBhdGg6IHN0cmluZyk6IE91dHB1dENvbnRleHQge1xuICAgIGNvbnN0IGltcG9ydEV4cHIgPVxuICAgICAgICAoc3ltYm9sOiBTdGF0aWNTeW1ib2wsIHR5cGVQYXJhbXM6IG8uVHlwZVtdIHwgbnVsbCA9IG51bGwsXG4gICAgICAgICB1c2VTdW1tYXJpZXM6IGJvb2xlYW4gPSB0cnVlKSA9PiB7XG4gICAgICAgICAgaWYgKCEoc3ltYm9sIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnRlcm5hbCBlcnJvcjogdW5rbm93biBpZGVudGlmaWVyICR7SlNPTi5zdHJpbmdpZnkoc3ltYm9sKX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgYXJpdHkgPSB0aGlzLl9zeW1ib2xSZXNvbHZlci5nZXRUeXBlQXJpdHkoc3ltYm9sKSB8fCAwO1xuICAgICAgICAgIGNvbnN0IHtmaWxlUGF0aCwgbmFtZSwgbWVtYmVyc30gPVxuICAgICAgICAgICAgICB0aGlzLl9zeW1ib2xSZXNvbHZlci5nZXRJbXBvcnRBcyhzeW1ib2wsIHVzZVN1bW1hcmllcykgfHwgc3ltYm9sO1xuICAgICAgICAgIGNvbnN0IGltcG9ydE1vZHVsZSA9IHRoaXMuX2ZpbGVOYW1lVG9Nb2R1bGVOYW1lKGZpbGVQYXRoLCBnZW5GaWxlUGF0aCk7XG5cbiAgICAgICAgICAvLyBJdCBzaG91bGQgYmUgZ29vZCBlbm91Z2ggdG8gY29tcGFyZSBmaWxlUGF0aCB0byBnZW5GaWxlUGF0aCBhbmQgaWYgdGhleSBhcmUgZXF1YWxcbiAgICAgICAgICAvLyB0aGVyZSBpcyBhIHNlbGYgcmVmZXJlbmNlLiBIb3dldmVyLCBuZ2ZhY3RvcnkgZmlsZXMgZ2VuZXJhdGUgdG8gLnRzIGJ1dCB0aGVpclxuICAgICAgICAgIC8vIHN5bWJvbHMgaGF2ZSAuZC50cyBzbyBhIHNpbXBsZSBjb21wYXJlIGlzIGluc3VmZmljaWVudC4gVGhleSBzaG91bGQgYmUgY2Fub25pY2FsXG4gICAgICAgICAgLy8gYW5kIGlzIHRyYWNrZWQgYnkgIzE3NzA1LlxuICAgICAgICAgIGNvbnN0IHNlbGZSZWZlcmVuY2UgPSB0aGlzLl9maWxlTmFtZVRvTW9kdWxlTmFtZShnZW5GaWxlUGF0aCwgZ2VuRmlsZVBhdGgpO1xuICAgICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSBpbXBvcnRNb2R1bGUgPT09IHNlbGZSZWZlcmVuY2UgPyBudWxsIDogaW1wb3J0TW9kdWxlO1xuXG4gICAgICAgICAgLy8gSWYgd2UgYXJlIGluIGEgdHlwZSBleHByZXNzaW9uIHRoYXQgcmVmZXJzIHRvIGEgZ2VuZXJpYyB0eXBlIHRoZW4gc3VwcGx5XG4gICAgICAgICAgLy8gdGhlIHJlcXVpcmVkIHR5cGUgcGFyYW1ldGVycy4gSWYgdGhlcmUgd2VyZSBub3QgZW5vdWdoIHR5cGUgcGFyYW1ldGVyc1xuICAgICAgICAgIC8vIHN1cHBsaWVkLCBzdXBwbHkgYW55IGFzIHRoZSB0eXBlLiBPdXRzaWRlIGEgdHlwZSBleHByZXNzaW9uIHRoZSByZWZlcmVuY2VcbiAgICAgICAgICAvLyBzaG91bGQgbm90IHN1cHBseSB0eXBlIHBhcmFtZXRlcnMgYW5kIGJlIHRyZWF0ZWQgYXMgYSBzaW1wbGUgdmFsdWUgcmVmZXJlbmNlXG4gICAgICAgICAgLy8gdG8gdGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGl0c2VsZi5cbiAgICAgICAgICBjb25zdCBzdXBwbGllZFR5cGVQYXJhbXMgPSB0eXBlUGFyYW1zIHx8IFtdO1xuICAgICAgICAgIGNvbnN0IG1pc3NpbmdUeXBlUGFyYW1zQ291bnQgPSBhcml0eSAtIHN1cHBsaWVkVHlwZVBhcmFtcy5sZW5ndGg7XG4gICAgICAgICAgY29uc3QgYWxsVHlwZVBhcmFtcyA9XG4gICAgICAgICAgICAgIHN1cHBsaWVkVHlwZVBhcmFtcy5jb25jYXQobmV3IEFycmF5KG1pc3NpbmdUeXBlUGFyYW1zQ291bnQpLmZpbGwoby5EWU5BTUlDX1RZUEUpKTtcbiAgICAgICAgICByZXR1cm4gbWVtYmVycy5yZWR1Y2UoXG4gICAgICAgICAgICAgIChleHByLCBtZW1iZXJOYW1lKSA9PiBleHByLnByb3AobWVtYmVyTmFtZSksXG4gICAgICAgICAgICAgIDxvLkV4cHJlc3Npb24+by5pbXBvcnRFeHByKFxuICAgICAgICAgICAgICAgICAgbmV3IG8uRXh0ZXJuYWxSZWZlcmVuY2UobW9kdWxlTmFtZSwgbmFtZSwgbnVsbCksIGFsbFR5cGVQYXJhbXMpKTtcbiAgICAgICAgfTtcblxuICAgIHJldHVybiB7c3RhdGVtZW50czogW10sIGdlbkZpbGVQYXRoLCBpbXBvcnRFeHByLCBjb25zdGFudFBvb2w6IG5ldyBDb25zdGFudFBvb2woKX07XG4gIH1cblxuICBwcml2YXRlIF9maWxlTmFtZVRvTW9kdWxlTmFtZShpbXBvcnRlZEZpbGVQYXRoOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc3VtbWFyeVJlc29sdmVyLmdldEtub3duTW9kdWxlTmFtZShpbXBvcnRlZEZpbGVQYXRoKSB8fFxuICAgICAgICB0aGlzLl9zeW1ib2xSZXNvbHZlci5nZXRLbm93bk1vZHVsZU5hbWUoaW1wb3J0ZWRGaWxlUGF0aCkgfHxcbiAgICAgICAgdGhpcy5faG9zdC5maWxlTmFtZVRvTW9kdWxlTmFtZShpbXBvcnRlZEZpbGVQYXRoLCBjb250YWluaW5nRmlsZVBhdGgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29kZWdlblN0eWxlcyhcbiAgICAgIHNyY0ZpbGVVcmw6IHN0cmluZywgY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgIHN0eWxlc2hlZXRNZXRhZGF0YTogQ29tcGlsZVN0eWxlc2hlZXRNZXRhZGF0YSwgaXNTaGltbWVkOiBib29sZWFuLFxuICAgICAgZmlsZVN1ZmZpeDogc3RyaW5nKTogR2VuZXJhdGVkRmlsZSB7XG4gICAgY29uc3Qgb3V0cHV0Q3R4ID0gdGhpcy5fY3JlYXRlT3V0cHV0Q29udGV4dChcbiAgICAgICAgX3N0eWxlc01vZHVsZVVybChzdHlsZXNoZWV0TWV0YWRhdGEubW9kdWxlVXJsICEsIGlzU2hpbW1lZCwgZmlsZVN1ZmZpeCkpO1xuICAgIGNvbnN0IGNvbXBpbGVkU3R5bGVzaGVldCA9XG4gICAgICAgIHRoaXMuX3N0eWxlQ29tcGlsZXIuY29tcGlsZVN0eWxlcyhvdXRwdXRDdHgsIGNvbXBNZXRhLCBzdHlsZXNoZWV0TWV0YWRhdGEsIGlzU2hpbW1lZCk7XG4gICAgX3Jlc29sdmVTdHlsZVN0YXRlbWVudHModGhpcy5fc3ltYm9sUmVzb2x2ZXIsIGNvbXBpbGVkU3R5bGVzaGVldCwgaXNTaGltbWVkLCBmaWxlU3VmZml4KTtcbiAgICByZXR1cm4gdGhpcy5fY29kZWdlblNvdXJjZU1vZHVsZShzcmNGaWxlVXJsLCBvdXRwdXRDdHgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29kZWdlblNvdXJjZU1vZHVsZShzcmNGaWxlVXJsOiBzdHJpbmcsIGN0eDogT3V0cHV0Q29udGV4dCk6IEdlbmVyYXRlZEZpbGUge1xuICAgIHJldHVybiBuZXcgR2VuZXJhdGVkRmlsZShzcmNGaWxlVXJsLCBjdHguZ2VuRmlsZVBhdGgsIGN0eC5zdGF0ZW1lbnRzKTtcbiAgfVxuXG4gIGxpc3RMYXp5Um91dGVzKGVudHJ5Um91dGU/OiBzdHJpbmcsIGFuYWx5emVkTW9kdWxlcz86IE5nQW5hbHl6ZWRNb2R1bGVzKTogTGF6eVJvdXRlW10ge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGlmIChlbnRyeVJvdXRlKSB7XG4gICAgICBjb25zdCBzeW1ib2wgPSBwYXJzZUxhenlSb3V0ZShlbnRyeVJvdXRlLCB0aGlzLnJlZmxlY3RvcikucmVmZXJlbmNlZE1vZHVsZTtcbiAgICAgIHJldHVybiB2aXNpdExhenlSb3V0ZShzeW1ib2wpO1xuICAgIH0gZWxzZSBpZiAoYW5hbHl6ZWRNb2R1bGVzKSB7XG4gICAgICBjb25zdCBhbGxMYXp5Um91dGVzOiBMYXp5Um91dGVbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBuZ01vZHVsZSBvZiBhbmFseXplZE1vZHVsZXMubmdNb2R1bGVzKSB7XG4gICAgICAgIGNvbnN0IGxhenlSb3V0ZXMgPSBsaXN0TGF6eVJvdXRlcyhuZ01vZHVsZSwgdGhpcy5yZWZsZWN0b3IpO1xuICAgICAgICBmb3IgKGNvbnN0IGxhenlSb3V0ZSBvZiBsYXp5Um91dGVzKSB7XG4gICAgICAgICAgYWxsTGF6eVJvdXRlcy5wdXNoKGxhenlSb3V0ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBhbGxMYXp5Um91dGVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVpdGhlciByb3V0ZSBvciBhbmFseXplZE1vZHVsZXMgaGFzIHRvIGJlIHNwZWNpZmllZCFgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2aXNpdExhenlSb3V0ZShcbiAgICAgICAgc3ltYm9sOiBTdGF0aWNTeW1ib2wsIHNlZW5Sb3V0ZXMgPSBuZXcgU2V0PFN0YXRpY1N5bWJvbD4oKSxcbiAgICAgICAgYWxsTGF6eVJvdXRlczogTGF6eVJvdXRlW10gPSBbXSk6IExhenlSb3V0ZVtdIHtcbiAgICAgIC8vIFN1cHBvcnQgcG9pbnRpbmcgdG8gZGVmYXVsdCBleHBvcnRzLCBidXQgc3RvcCByZWN1cnNpbmcgdGhlcmUsXG4gICAgICAvLyBhcyB0aGUgU3RhdGljUmVmbGVjdG9yIGRvZXMgbm90IHlldCBzdXBwb3J0IGRlZmF1bHQgZXhwb3J0cy5cbiAgICAgIGlmIChzZWVuUm91dGVzLmhhcyhzeW1ib2wpIHx8ICFzeW1ib2wubmFtZSkge1xuICAgICAgICByZXR1cm4gYWxsTGF6eVJvdXRlcztcbiAgICAgIH1cbiAgICAgIHNlZW5Sb3V0ZXMuYWRkKHN5bWJvbCk7XG4gICAgICBjb25zdCBsYXp5Um91dGVzID0gbGlzdExhenlSb3V0ZXMoXG4gICAgICAgICAgc2VsZi5fbWV0YWRhdGFSZXNvbHZlci5nZXROZ01vZHVsZU1ldGFkYXRhKHN5bWJvbCwgdHJ1ZSkgISwgc2VsZi5yZWZsZWN0b3IpO1xuICAgICAgZm9yIChjb25zdCBsYXp5Um91dGUgb2YgbGF6eVJvdXRlcykge1xuICAgICAgICBhbGxMYXp5Um91dGVzLnB1c2gobGF6eVJvdXRlKTtcbiAgICAgICAgdmlzaXRMYXp5Um91dGUobGF6eVJvdXRlLnJlZmVyZW5jZWRNb2R1bGUsIHNlZW5Sb3V0ZXMsIGFsbExhenlSb3V0ZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFsbExhenlSb3V0ZXM7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVFbXB0eVN0dWIob3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0KSB7XG4gIC8vIE5vdGU6IFdlIG5lZWQgdG8gcHJvZHVjZSBhdCBsZWFzdCBvbmUgaW1wb3J0IHN0YXRlbWVudCBzbyB0aGF0XG4gIC8vIFR5cGVTY3JpcHQga25vd3MgdGhhdCB0aGUgZmlsZSBpcyBhbiBlczYgbW9kdWxlLiBPdGhlcndpc2Ugb3VyIGdlbmVyYXRlZFxuICAvLyBleHBvcnRzIC8gaW1wb3J0cyB3b24ndCBiZSBlbWl0dGVkIHByb3Blcmx5IGJ5IFR5cGVTY3JpcHQuXG4gIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2goby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkNvbXBvbmVudEZhY3RvcnkpLnRvU3RtdCgpKTtcbn1cblxuXG5mdW5jdGlvbiBfcmVzb2x2ZVN0eWxlU3RhdGVtZW50cyhcbiAgICBzeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIsIGNvbXBpbGVSZXN1bHQ6IENvbXBpbGVkU3R5bGVzaGVldCwgbmVlZHNTaGltOiBib29sZWFuLFxuICAgIGZpbGVTdWZmaXg6IHN0cmluZyk6IHZvaWQge1xuICBjb21waWxlUmVzdWx0LmRlcGVuZGVuY2llcy5mb3JFYWNoKChkZXApID0+IHtcbiAgICBkZXAuc2V0VmFsdWUoc3ltYm9sUmVzb2x2ZXIuZ2V0U3RhdGljU3ltYm9sKFxuICAgICAgICBfc3R5bGVzTW9kdWxlVXJsKGRlcC5tb2R1bGVVcmwsIG5lZWRzU2hpbSwgZmlsZVN1ZmZpeCksIGRlcC5uYW1lKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBfc3R5bGVzTW9kdWxlVXJsKHN0eWxlc2hlZXRVcmw6IHN0cmluZywgc2hpbTogYm9vbGVhbiwgc3VmZml4OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7c3R5bGVzaGVldFVybH0ke3NoaW0gPyAnLnNoaW0nIDogJyd9Lm5nc3R5bGUke3N1ZmZpeH1gO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5nQW5hbHl6ZWRNb2R1bGVzIHtcbiAgbmdNb2R1bGVzOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YVtdO1xuICBuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlOiBNYXA8U3RhdGljU3ltYm9sLCBDb21waWxlTmdNb2R1bGVNZXRhZGF0YT47XG4gIGZpbGVzOiBOZ0FuYWx5emVkRmlsZVtdO1xuICBzeW1ib2xzTWlzc2luZ01vZHVsZT86IFN0YXRpY1N5bWJvbFtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5nQW5hbHl6ZWRGaWxlV2l0aEluamVjdGFibGVzIHtcbiAgZmlsZU5hbWU6IHN0cmluZztcbiAgaW5qZWN0YWJsZXM6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGFbXTtcbiAgc2hhbGxvd01vZHVsZXM6IENvbXBpbGVTaGFsbG93TW9kdWxlTWV0YWRhdGFbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOZ0FuYWx5emVkRmlsZSB7XG4gIGZpbGVOYW1lOiBzdHJpbmc7XG4gIGRpcmVjdGl2ZXM6IFN0YXRpY1N5bWJvbFtdO1xuICBwaXBlczogU3RhdGljU3ltYm9sW107XG4gIG5nTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGFbXTtcbiAgaW5qZWN0YWJsZXM6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGFbXTtcbiAgZXhwb3J0c05vblNvdXJjZUZpbGVzOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5nQW5hbHl6ZU1vZHVsZXNIb3N0IHsgaXNTb3VyY2VGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuOyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmFseXplTmdNb2R1bGVzKFxuICAgIGZpbGVOYW1lczogc3RyaW5nW10sIGhvc3Q6IE5nQW5hbHl6ZU1vZHVsZXNIb3N0LCBzdGF0aWNTeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIsXG4gICAgbWV0YWRhdGFSZXNvbHZlcjogQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIpOiBOZ0FuYWx5emVkTW9kdWxlcyB7XG4gIGNvbnN0IGZpbGVzID0gX2FuYWx5emVGaWxlc0luY2x1ZGluZ05vblByb2dyYW1GaWxlcyhcbiAgICAgIGZpbGVOYW1lcywgaG9zdCwgc3RhdGljU3ltYm9sUmVzb2x2ZXIsIG1ldGFkYXRhUmVzb2x2ZXIpO1xuICByZXR1cm4gbWVyZ2VBbmFseXplZEZpbGVzKGZpbGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuYWx5emVBbmRWYWxpZGF0ZU5nTW9kdWxlcyhcbiAgICBmaWxlTmFtZXM6IHN0cmluZ1tdLCBob3N0OiBOZ0FuYWx5emVNb2R1bGVzSG9zdCwgc3RhdGljU3ltYm9sUmVzb2x2ZXI6IFN0YXRpY1N5bWJvbFJlc29sdmVyLFxuICAgIG1ldGFkYXRhUmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyKTogTmdBbmFseXplZE1vZHVsZXMge1xuICByZXR1cm4gdmFsaWRhdGVBbmFseXplZE1vZHVsZXMoXG4gICAgICBhbmFseXplTmdNb2R1bGVzKGZpbGVOYW1lcywgaG9zdCwgc3RhdGljU3ltYm9sUmVzb2x2ZXIsIG1ldGFkYXRhUmVzb2x2ZXIpKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVBbmFseXplZE1vZHVsZXMoYW5hbHl6ZWRNb2R1bGVzOiBOZ0FuYWx5emVkTW9kdWxlcyk6IE5nQW5hbHl6ZWRNb2R1bGVzIHtcbiAgaWYgKGFuYWx5emVkTW9kdWxlcy5zeW1ib2xzTWlzc2luZ01vZHVsZSAmJiBhbmFseXplZE1vZHVsZXMuc3ltYm9sc01pc3NpbmdNb2R1bGUubGVuZ3RoKSB7XG4gICAgY29uc3QgbWVzc2FnZXMgPSBhbmFseXplZE1vZHVsZXMuc3ltYm9sc01pc3NpbmdNb2R1bGUubWFwKFxuICAgICAgICBzID0+XG4gICAgICAgICAgICBgQ2Fubm90IGRldGVybWluZSB0aGUgbW9kdWxlIGZvciBjbGFzcyAke3MubmFtZX0gaW4gJHtzLmZpbGVQYXRofSEgQWRkICR7cy5uYW1lfSB0byB0aGUgTmdNb2R1bGUgdG8gZml4IGl0LmApO1xuICAgIHRocm93IHN5bnRheEVycm9yKG1lc3NhZ2VzLmpvaW4oJ1xcbicpKTtcbiAgfVxuICByZXR1cm4gYW5hbHl6ZWRNb2R1bGVzO1xufVxuXG4vLyBBbmFseXplcyBhbGwgb2YgdGhlIHByb2dyYW0gZmlsZXMsXG4vLyBpbmNsdWRpbmcgZmlsZXMgdGhhdCBhcmUgbm90IHBhcnQgb2YgdGhlIHByb2dyYW1cbi8vIGJ1dCBhcmUgcmVmZXJlbmNlZCBieSBhbiBOZ01vZHVsZS5cbmZ1bmN0aW9uIF9hbmFseXplRmlsZXNJbmNsdWRpbmdOb25Qcm9ncmFtRmlsZXMoXG4gICAgZmlsZU5hbWVzOiBzdHJpbmdbXSwgaG9zdDogTmdBbmFseXplTW9kdWxlc0hvc3QsIHN0YXRpY1N5bWJvbFJlc29sdmVyOiBTdGF0aWNTeW1ib2xSZXNvbHZlcixcbiAgICBtZXRhZGF0YVJlc29sdmVyOiBDb21waWxlTWV0YWRhdGFSZXNvbHZlcik6IE5nQW5hbHl6ZWRGaWxlW10ge1xuICBjb25zdCBzZWVuRmlsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgZmlsZXM6IE5nQW5hbHl6ZWRGaWxlW10gPSBbXTtcblxuICBjb25zdCB2aXNpdEZpbGUgPSAoZmlsZU5hbWU6IHN0cmluZykgPT4ge1xuICAgIGlmIChzZWVuRmlsZXMuaGFzKGZpbGVOYW1lKSB8fCAhaG9zdC5pc1NvdXJjZUZpbGUoZmlsZU5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHNlZW5GaWxlcy5hZGQoZmlsZU5hbWUpO1xuICAgIGNvbnN0IGFuYWx5emVkRmlsZSA9IGFuYWx5emVGaWxlKGhvc3QsIHN0YXRpY1N5bWJvbFJlc29sdmVyLCBtZXRhZGF0YVJlc29sdmVyLCBmaWxlTmFtZSk7XG4gICAgZmlsZXMucHVzaChhbmFseXplZEZpbGUpO1xuICAgIGFuYWx5emVkRmlsZS5uZ01vZHVsZXMuZm9yRWFjaChuZ01vZHVsZSA9PiB7XG4gICAgICBuZ01vZHVsZS50cmFuc2l0aXZlTW9kdWxlLm1vZHVsZXMuZm9yRWFjaChtb2RNZXRhID0+IHZpc2l0RmlsZShtb2RNZXRhLnJlZmVyZW5jZS5maWxlUGF0aCkpO1xuICAgIH0pO1xuICB9O1xuICBmaWxlTmFtZXMuZm9yRWFjaCgoZmlsZU5hbWUpID0+IHZpc2l0RmlsZShmaWxlTmFtZSkpO1xuICByZXR1cm4gZmlsZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmFseXplRmlsZShcbiAgICBob3N0OiBOZ0FuYWx5emVNb2R1bGVzSG9zdCwgc3RhdGljU3ltYm9sUmVzb2x2ZXI6IFN0YXRpY1N5bWJvbFJlc29sdmVyLFxuICAgIG1ldGFkYXRhUmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLCBmaWxlTmFtZTogc3RyaW5nKTogTmdBbmFseXplZEZpbGUge1xuICBjb25zdCBkaXJlY3RpdmVzOiBTdGF0aWNTeW1ib2xbXSA9IFtdO1xuICBjb25zdCBwaXBlczogU3RhdGljU3ltYm9sW10gPSBbXTtcbiAgY29uc3QgaW5qZWN0YWJsZXM6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGFbXSA9IFtdO1xuICBjb25zdCBuZ01vZHVsZXM6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhW10gPSBbXTtcbiAgY29uc3QgaGFzRGVjb3JhdG9ycyA9IHN0YXRpY1N5bWJvbFJlc29sdmVyLmhhc0RlY29yYXRvcnMoZmlsZU5hbWUpO1xuICBsZXQgZXhwb3J0c05vblNvdXJjZUZpbGVzID0gZmFsc2U7XG4gIC8vIERvbid0IGFuYWx5emUgLmQudHMgZmlsZXMgdGhhdCBoYXZlIG5vIGRlY29yYXRvcnMgYXMgYSBzaG9ydGN1dFxuICAvLyB0byBzcGVlZCB1cCB0aGUgYW5hbHlzaXMuIFRoaXMgcHJldmVudHMgdXMgZnJvbVxuICAvLyByZXNvbHZpbmcgdGhlIHJlZmVyZW5jZXMgaW4gdGhlc2UgZmlsZXMuXG4gIC8vIE5vdGU6IGV4cG9ydHNOb25Tb3VyY2VGaWxlcyBpcyBvbmx5IG5lZWRlZCB3aGVuIGNvbXBpbGluZyB3aXRoIHN1bW1hcmllcyxcbiAgLy8gd2hpY2ggaXMgbm90IHRoZSBjYXNlIHdoZW4gLmQudHMgZmlsZXMgYXJlIHRyZWF0ZWQgYXMgaW5wdXQgZmlsZXMuXG4gIGlmICghZmlsZU5hbWUuZW5kc1dpdGgoJy5kLnRzJykgfHwgaGFzRGVjb3JhdG9ycykge1xuICAgIHN0YXRpY1N5bWJvbFJlc29sdmVyLmdldFN5bWJvbHNPZihmaWxlTmFtZSkuZm9yRWFjaCgoc3ltYm9sKSA9PiB7XG4gICAgICBjb25zdCByZXNvbHZlZFN5bWJvbCA9IHN0YXRpY1N5bWJvbFJlc29sdmVyLnJlc29sdmVTeW1ib2woc3ltYm9sKTtcbiAgICAgIGNvbnN0IHN5bWJvbE1ldGEgPSByZXNvbHZlZFN5bWJvbC5tZXRhZGF0YTtcbiAgICAgIGlmICghc3ltYm9sTWV0YSB8fCBzeW1ib2xNZXRhLl9fc3ltYm9saWMgPT09ICdlcnJvcicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbGV0IGlzTmdTeW1ib2wgPSBmYWxzZTtcbiAgICAgIGlmIChzeW1ib2xNZXRhLl9fc3ltYm9saWMgPT09ICdjbGFzcycpIHtcbiAgICAgICAgaWYgKG1ldGFkYXRhUmVzb2x2ZXIuaXNEaXJlY3RpdmUoc3ltYm9sKSkge1xuICAgICAgICAgIGlzTmdTeW1ib2wgPSB0cnVlO1xuICAgICAgICAgIGRpcmVjdGl2ZXMucHVzaChzeW1ib2wpO1xuICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhUmVzb2x2ZXIuaXNQaXBlKHN5bWJvbCkpIHtcbiAgICAgICAgICBpc05nU3ltYm9sID0gdHJ1ZTtcbiAgICAgICAgICBwaXBlcy5wdXNoKHN5bWJvbCk7XG4gICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGFSZXNvbHZlci5pc05nTW9kdWxlKHN5bWJvbCkpIHtcbiAgICAgICAgICBjb25zdCBuZ01vZHVsZSA9IG1ldGFkYXRhUmVzb2x2ZXIuZ2V0TmdNb2R1bGVNZXRhZGF0YShzeW1ib2wsIGZhbHNlKTtcbiAgICAgICAgICBpZiAobmdNb2R1bGUpIHtcbiAgICAgICAgICAgIGlzTmdTeW1ib2wgPSB0cnVlO1xuICAgICAgICAgICAgbmdNb2R1bGVzLnB1c2gobmdNb2R1bGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YVJlc29sdmVyLmlzSW5qZWN0YWJsZShzeW1ib2wpKSB7XG4gICAgICAgICAgaXNOZ1N5bWJvbCA9IHRydWU7XG4gICAgICAgICAgY29uc3QgaW5qZWN0YWJsZSA9IG1ldGFkYXRhUmVzb2x2ZXIuZ2V0SW5qZWN0YWJsZU1ldGFkYXRhKHN5bWJvbCwgbnVsbCwgZmFsc2UpO1xuICAgICAgICAgIGlmIChpbmplY3RhYmxlKSB7XG4gICAgICAgICAgICBpbmplY3RhYmxlcy5wdXNoKGluamVjdGFibGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFpc05nU3ltYm9sKSB7XG4gICAgICAgIGV4cG9ydHNOb25Tb3VyY2VGaWxlcyA9XG4gICAgICAgICAgICBleHBvcnRzTm9uU291cmNlRmlsZXMgfHwgaXNWYWx1ZUV4cG9ydGluZ05vblNvdXJjZUZpbGUoaG9zdCwgc3ltYm9sTWV0YSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICAgIGZpbGVOYW1lLCBkaXJlY3RpdmVzLCBwaXBlcywgbmdNb2R1bGVzLCBpbmplY3RhYmxlcywgZXhwb3J0c05vblNvdXJjZUZpbGVzLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZUZpbGVGb3JJbmplY3RhYmxlcyhcbiAgICBob3N0OiBOZ0FuYWx5emVNb2R1bGVzSG9zdCwgc3RhdGljU3ltYm9sUmVzb2x2ZXI6IFN0YXRpY1N5bWJvbFJlc29sdmVyLFxuICAgIG1ldGFkYXRhUmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLCBmaWxlTmFtZTogc3RyaW5nKTogTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXMge1xuICBjb25zdCBpbmplY3RhYmxlczogQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YVtdID0gW107XG4gIGNvbnN0IHNoYWxsb3dNb2R1bGVzOiBDb21waWxlU2hhbGxvd01vZHVsZU1ldGFkYXRhW10gPSBbXTtcbiAgaWYgKHN0YXRpY1N5bWJvbFJlc29sdmVyLmhhc0RlY29yYXRvcnMoZmlsZU5hbWUpKSB7XG4gICAgc3RhdGljU3ltYm9sUmVzb2x2ZXIuZ2V0U3ltYm9sc09mKGZpbGVOYW1lKS5mb3JFYWNoKChzeW1ib2wpID0+IHtcbiAgICAgIGNvbnN0IHJlc29sdmVkU3ltYm9sID0gc3RhdGljU3ltYm9sUmVzb2x2ZXIucmVzb2x2ZVN5bWJvbChzeW1ib2wpO1xuICAgICAgY29uc3Qgc3ltYm9sTWV0YSA9IHJlc29sdmVkU3ltYm9sLm1ldGFkYXRhO1xuICAgICAgaWYgKCFzeW1ib2xNZXRhIHx8IHN5bWJvbE1ldGEuX19zeW1ib2xpYyA9PT0gJ2Vycm9yJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoc3ltYm9sTWV0YS5fX3N5bWJvbGljID09PSAnY2xhc3MnKSB7XG4gICAgICAgIGlmIChtZXRhZGF0YVJlc29sdmVyLmlzSW5qZWN0YWJsZShzeW1ib2wpKSB7XG4gICAgICAgICAgY29uc3QgaW5qZWN0YWJsZSA9IG1ldGFkYXRhUmVzb2x2ZXIuZ2V0SW5qZWN0YWJsZU1ldGFkYXRhKHN5bWJvbCwgbnVsbCwgZmFsc2UpO1xuICAgICAgICAgIGlmIChpbmplY3RhYmxlKSB7XG4gICAgICAgICAgICBpbmplY3RhYmxlcy5wdXNoKGluamVjdGFibGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YVJlc29sdmVyLmlzTmdNb2R1bGUoc3ltYm9sKSkge1xuICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IG1ldGFkYXRhUmVzb2x2ZXIuZ2V0U2hhbGxvd01vZHVsZU1ldGFkYXRhKHN5bWJvbCk7XG4gICAgICAgICAgaWYgKG1vZHVsZSkge1xuICAgICAgICAgICAgc2hhbGxvd01vZHVsZXMucHVzaChtb2R1bGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiB7ZmlsZU5hbWUsIGluamVjdGFibGVzLCBzaGFsbG93TW9kdWxlc307XG59XG5cbmZ1bmN0aW9uIGlzVmFsdWVFeHBvcnRpbmdOb25Tb3VyY2VGaWxlKGhvc3Q6IE5nQW5hbHl6ZU1vZHVsZXNIb3N0LCBtZXRhZGF0YTogYW55KTogYm9vbGVhbiB7XG4gIGxldCBleHBvcnRzTm9uU291cmNlRmlsZXMgPSBmYWxzZTtcblxuICBjbGFzcyBWaXNpdG9yIGltcGxlbWVudHMgVmFsdWVWaXNpdG9yIHtcbiAgICB2aXNpdEFycmF5KGFycjogYW55W10sIGNvbnRleHQ6IGFueSk6IGFueSB7IGFyci5mb3JFYWNoKHYgPT4gdmlzaXRWYWx1ZSh2LCB0aGlzLCBjb250ZXh0KSk7IH1cbiAgICB2aXNpdFN0cmluZ01hcChtYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgT2JqZWN0LmtleXMobWFwKS5mb3JFYWNoKChrZXkpID0+IHZpc2l0VmFsdWUobWFwW2tleV0sIHRoaXMsIGNvbnRleHQpKTtcbiAgICB9XG4gICAgdmlzaXRQcmltaXRpdmUodmFsdWU6IGFueSwgY29udGV4dDogYW55KTogYW55IHt9XG4gICAgdmlzaXRPdGhlcih2YWx1ZTogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sICYmICFob3N0LmlzU291cmNlRmlsZSh2YWx1ZS5maWxlUGF0aCkpIHtcbiAgICAgICAgZXhwb3J0c05vblNvdXJjZUZpbGVzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2aXNpdFZhbHVlKG1ldGFkYXRhLCBuZXcgVmlzaXRvcigpLCBudWxsKTtcbiAgcmV0dXJuIGV4cG9ydHNOb25Tb3VyY2VGaWxlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlQW5hbHl6ZWRGaWxlcyhhbmFseXplZEZpbGVzOiBOZ0FuYWx5emVkRmlsZVtdKTogTmdBbmFseXplZE1vZHVsZXMge1xuICBjb25zdCBhbGxOZ01vZHVsZXM6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhW10gPSBbXTtcbiAgY29uc3QgbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZSA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCBDb21waWxlTmdNb2R1bGVNZXRhZGF0YT4oKTtcbiAgY29uc3QgYWxsUGlwZXNBbmREaXJlY3RpdmVzID0gbmV3IFNldDxTdGF0aWNTeW1ib2w+KCk7XG5cbiAgYW5hbHl6ZWRGaWxlcy5mb3JFYWNoKGFmID0+IHtcbiAgICBhZi5uZ01vZHVsZXMuZm9yRWFjaChuZ01vZHVsZSA9PiB7XG4gICAgICBhbGxOZ01vZHVsZXMucHVzaChuZ01vZHVsZSk7XG4gICAgICBuZ01vZHVsZS5kZWNsYXJlZERpcmVjdGl2ZXMuZm9yRWFjaChcbiAgICAgICAgICBkID0+IG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUuc2V0KGQucmVmZXJlbmNlLCBuZ01vZHVsZSkpO1xuICAgICAgbmdNb2R1bGUuZGVjbGFyZWRQaXBlcy5mb3JFYWNoKHAgPT4gbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZS5zZXQocC5yZWZlcmVuY2UsIG5nTW9kdWxlKSk7XG4gICAgfSk7XG4gICAgYWYuZGlyZWN0aXZlcy5mb3JFYWNoKGQgPT4gYWxsUGlwZXNBbmREaXJlY3RpdmVzLmFkZChkKSk7XG4gICAgYWYucGlwZXMuZm9yRWFjaChwID0+IGFsbFBpcGVzQW5kRGlyZWN0aXZlcy5hZGQocCkpO1xuICB9KTtcblxuICBjb25zdCBzeW1ib2xzTWlzc2luZ01vZHVsZTogU3RhdGljU3ltYm9sW10gPSBbXTtcbiAgYWxsUGlwZXNBbmREaXJlY3RpdmVzLmZvckVhY2gocmVmID0+IHtcbiAgICBpZiAoIW5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUuaGFzKHJlZikpIHtcbiAgICAgIHN5bWJvbHNNaXNzaW5nTW9kdWxlLnB1c2gocmVmKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIG5nTW9kdWxlczogYWxsTmdNb2R1bGVzLFxuICAgIG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUsXG4gICAgc3ltYm9sc01pc3NpbmdNb2R1bGUsXG4gICAgZmlsZXM6IGFuYWx5emVkRmlsZXNcbiAgfTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VBbmRWYWxpZGF0ZU5nRmlsZXMoZmlsZXM6IE5nQW5hbHl6ZWRGaWxlW10pOiBOZ0FuYWx5emVkTW9kdWxlcyB7XG4gIHJldHVybiB2YWxpZGF0ZUFuYWx5emVkTW9kdWxlcyhtZXJnZUFuYWx5emVkRmlsZXMoZmlsZXMpKTtcbn1cbiJdfQ==