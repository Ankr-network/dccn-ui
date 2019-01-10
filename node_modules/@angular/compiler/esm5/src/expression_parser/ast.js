/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
var ParserError = /** @class */ (function () {
    function ParserError(message, input, errLocation, ctxLocation) {
        this.input = input;
        this.errLocation = errLocation;
        this.ctxLocation = ctxLocation;
        this.message = "Parser Error: " + message + " " + errLocation + " [" + input + "] in " + ctxLocation;
    }
    return ParserError;
}());
export { ParserError };
var ParseSpan = /** @class */ (function () {
    function ParseSpan(start, end) {
        this.start = start;
        this.end = end;
    }
    return ParseSpan;
}());
export { ParseSpan };
var AST = /** @class */ (function () {
    function AST(span) {
        this.span = span;
    }
    AST.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return null;
    };
    AST.prototype.toString = function () { return 'AST'; };
    return AST;
}());
export { AST };
/**
 * Represents a quoted expression of the form:
 *
 * quote = prefix `:` uninterpretedExpression
 * prefix = identifier
 * uninterpretedExpression = arbitrary string
 *
 * A quoted expression is meant to be pre-processed by an AST transformer that
 * converts it into another AST that no longer contains quoted expressions.
 * It is meant to allow third-party developers to extend Angular template
 * expression language. The `uninterpretedExpression` part of the quote is
 * therefore not interpreted by the Angular's own expression parser.
 */
var Quote = /** @class */ (function (_super) {
    tslib_1.__extends(Quote, _super);
    function Quote(span, prefix, uninterpretedExpression, location) {
        var _this = _super.call(this, span) || this;
        _this.prefix = prefix;
        _this.uninterpretedExpression = uninterpretedExpression;
        _this.location = location;
        return _this;
    }
    Quote.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitQuote(this, context);
    };
    Quote.prototype.toString = function () { return 'Quote'; };
    return Quote;
}(AST));
export { Quote };
var EmptyExpr = /** @class */ (function (_super) {
    tslib_1.__extends(EmptyExpr, _super);
    function EmptyExpr() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EmptyExpr.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        // do nothing
    };
    return EmptyExpr;
}(AST));
export { EmptyExpr };
var ImplicitReceiver = /** @class */ (function (_super) {
    tslib_1.__extends(ImplicitReceiver, _super);
    function ImplicitReceiver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImplicitReceiver.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitImplicitReceiver(this, context);
    };
    return ImplicitReceiver;
}(AST));
export { ImplicitReceiver };
/**
 * Multiple expressions separated by a semicolon.
 */
var Chain = /** @class */ (function (_super) {
    tslib_1.__extends(Chain, _super);
    function Chain(span, expressions) {
        var _this = _super.call(this, span) || this;
        _this.expressions = expressions;
        return _this;
    }
    Chain.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitChain(this, context);
    };
    return Chain;
}(AST));
export { Chain };
var Conditional = /** @class */ (function (_super) {
    tslib_1.__extends(Conditional, _super);
    function Conditional(span, condition, trueExp, falseExp) {
        var _this = _super.call(this, span) || this;
        _this.condition = condition;
        _this.trueExp = trueExp;
        _this.falseExp = falseExp;
        return _this;
    }
    Conditional.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitConditional(this, context);
    };
    return Conditional;
}(AST));
export { Conditional };
var PropertyRead = /** @class */ (function (_super) {
    tslib_1.__extends(PropertyRead, _super);
    function PropertyRead(span, receiver, name) {
        var _this = _super.call(this, span) || this;
        _this.receiver = receiver;
        _this.name = name;
        return _this;
    }
    PropertyRead.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitPropertyRead(this, context);
    };
    return PropertyRead;
}(AST));
export { PropertyRead };
var PropertyWrite = /** @class */ (function (_super) {
    tslib_1.__extends(PropertyWrite, _super);
    function PropertyWrite(span, receiver, name, value) {
        var _this = _super.call(this, span) || this;
        _this.receiver = receiver;
        _this.name = name;
        _this.value = value;
        return _this;
    }
    PropertyWrite.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitPropertyWrite(this, context);
    };
    return PropertyWrite;
}(AST));
export { PropertyWrite };
var SafePropertyRead = /** @class */ (function (_super) {
    tslib_1.__extends(SafePropertyRead, _super);
    function SafePropertyRead(span, receiver, name) {
        var _this = _super.call(this, span) || this;
        _this.receiver = receiver;
        _this.name = name;
        return _this;
    }
    SafePropertyRead.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitSafePropertyRead(this, context);
    };
    return SafePropertyRead;
}(AST));
export { SafePropertyRead };
var KeyedRead = /** @class */ (function (_super) {
    tslib_1.__extends(KeyedRead, _super);
    function KeyedRead(span, obj, key) {
        var _this = _super.call(this, span) || this;
        _this.obj = obj;
        _this.key = key;
        return _this;
    }
    KeyedRead.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitKeyedRead(this, context);
    };
    return KeyedRead;
}(AST));
export { KeyedRead };
var KeyedWrite = /** @class */ (function (_super) {
    tslib_1.__extends(KeyedWrite, _super);
    function KeyedWrite(span, obj, key, value) {
        var _this = _super.call(this, span) || this;
        _this.obj = obj;
        _this.key = key;
        _this.value = value;
        return _this;
    }
    KeyedWrite.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitKeyedWrite(this, context);
    };
    return KeyedWrite;
}(AST));
export { KeyedWrite };
var BindingPipe = /** @class */ (function (_super) {
    tslib_1.__extends(BindingPipe, _super);
    function BindingPipe(span, exp, name, args) {
        var _this = _super.call(this, span) || this;
        _this.exp = exp;
        _this.name = name;
        _this.args = args;
        return _this;
    }
    BindingPipe.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitPipe(this, context);
    };
    return BindingPipe;
}(AST));
export { BindingPipe };
var LiteralPrimitive = /** @class */ (function (_super) {
    tslib_1.__extends(LiteralPrimitive, _super);
    function LiteralPrimitive(span, value) {
        var _this = _super.call(this, span) || this;
        _this.value = value;
        return _this;
    }
    LiteralPrimitive.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitLiteralPrimitive(this, context);
    };
    return LiteralPrimitive;
}(AST));
export { LiteralPrimitive };
var LiteralArray = /** @class */ (function (_super) {
    tslib_1.__extends(LiteralArray, _super);
    function LiteralArray(span, expressions) {
        var _this = _super.call(this, span) || this;
        _this.expressions = expressions;
        return _this;
    }
    LiteralArray.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitLiteralArray(this, context);
    };
    return LiteralArray;
}(AST));
export { LiteralArray };
var LiteralMap = /** @class */ (function (_super) {
    tslib_1.__extends(LiteralMap, _super);
    function LiteralMap(span, keys, values) {
        var _this = _super.call(this, span) || this;
        _this.keys = keys;
        _this.values = values;
        return _this;
    }
    LiteralMap.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitLiteralMap(this, context);
    };
    return LiteralMap;
}(AST));
export { LiteralMap };
var Interpolation = /** @class */ (function (_super) {
    tslib_1.__extends(Interpolation, _super);
    function Interpolation(span, strings, expressions) {
        var _this = _super.call(this, span) || this;
        _this.strings = strings;
        _this.expressions = expressions;
        return _this;
    }
    Interpolation.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitInterpolation(this, context);
    };
    return Interpolation;
}(AST));
export { Interpolation };
var Binary = /** @class */ (function (_super) {
    tslib_1.__extends(Binary, _super);
    function Binary(span, operation, left, right) {
        var _this = _super.call(this, span) || this;
        _this.operation = operation;
        _this.left = left;
        _this.right = right;
        return _this;
    }
    Binary.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitBinary(this, context);
    };
    return Binary;
}(AST));
export { Binary };
var PrefixNot = /** @class */ (function (_super) {
    tslib_1.__extends(PrefixNot, _super);
    function PrefixNot(span, expression) {
        var _this = _super.call(this, span) || this;
        _this.expression = expression;
        return _this;
    }
    PrefixNot.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitPrefixNot(this, context);
    };
    return PrefixNot;
}(AST));
export { PrefixNot };
var NonNullAssert = /** @class */ (function (_super) {
    tslib_1.__extends(NonNullAssert, _super);
    function NonNullAssert(span, expression) {
        var _this = _super.call(this, span) || this;
        _this.expression = expression;
        return _this;
    }
    NonNullAssert.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitNonNullAssert(this, context);
    };
    return NonNullAssert;
}(AST));
export { NonNullAssert };
var MethodCall = /** @class */ (function (_super) {
    tslib_1.__extends(MethodCall, _super);
    function MethodCall(span, receiver, name, args) {
        var _this = _super.call(this, span) || this;
        _this.receiver = receiver;
        _this.name = name;
        _this.args = args;
        return _this;
    }
    MethodCall.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitMethodCall(this, context);
    };
    return MethodCall;
}(AST));
export { MethodCall };
var SafeMethodCall = /** @class */ (function (_super) {
    tslib_1.__extends(SafeMethodCall, _super);
    function SafeMethodCall(span, receiver, name, args) {
        var _this = _super.call(this, span) || this;
        _this.receiver = receiver;
        _this.name = name;
        _this.args = args;
        return _this;
    }
    SafeMethodCall.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitSafeMethodCall(this, context);
    };
    return SafeMethodCall;
}(AST));
export { SafeMethodCall };
var FunctionCall = /** @class */ (function (_super) {
    tslib_1.__extends(FunctionCall, _super);
    function FunctionCall(span, target, args) {
        var _this = _super.call(this, span) || this;
        _this.target = target;
        _this.args = args;
        return _this;
    }
    FunctionCall.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return visitor.visitFunctionCall(this, context);
    };
    return FunctionCall;
}(AST));
export { FunctionCall };
var ASTWithSource = /** @class */ (function (_super) {
    tslib_1.__extends(ASTWithSource, _super);
    function ASTWithSource(ast, source, location, errors) {
        var _this = _super.call(this, new ParseSpan(0, source == null ? 0 : source.length)) || this;
        _this.ast = ast;
        _this.source = source;
        _this.location = location;
        _this.errors = errors;
        return _this;
    }
    ASTWithSource.prototype.visit = function (visitor, context) {
        if (context === void 0) { context = null; }
        return this.ast.visit(visitor, context);
    };
    ASTWithSource.prototype.toString = function () { return this.source + " in " + this.location; };
    return ASTWithSource;
}(AST));
export { ASTWithSource };
var TemplateBinding = /** @class */ (function () {
    function TemplateBinding(span, key, keyIsVar, name, expression) {
        this.span = span;
        this.key = key;
        this.keyIsVar = keyIsVar;
        this.name = name;
        this.expression = expression;
    }
    return TemplateBinding;
}());
export { TemplateBinding };
var NullAstVisitor = /** @class */ (function () {
    function NullAstVisitor() {
    }
    NullAstVisitor.prototype.visitBinary = function (ast, context) { };
    NullAstVisitor.prototype.visitChain = function (ast, context) { };
    NullAstVisitor.prototype.visitConditional = function (ast, context) { };
    NullAstVisitor.prototype.visitFunctionCall = function (ast, context) { };
    NullAstVisitor.prototype.visitImplicitReceiver = function (ast, context) { };
    NullAstVisitor.prototype.visitInterpolation = function (ast, context) { };
    NullAstVisitor.prototype.visitKeyedRead = function (ast, context) { };
    NullAstVisitor.prototype.visitKeyedWrite = function (ast, context) { };
    NullAstVisitor.prototype.visitLiteralArray = function (ast, context) { };
    NullAstVisitor.prototype.visitLiteralMap = function (ast, context) { };
    NullAstVisitor.prototype.visitLiteralPrimitive = function (ast, context) { };
    NullAstVisitor.prototype.visitMethodCall = function (ast, context) { };
    NullAstVisitor.prototype.visitPipe = function (ast, context) { };
    NullAstVisitor.prototype.visitPrefixNot = function (ast, context) { };
    NullAstVisitor.prototype.visitNonNullAssert = function (ast, context) { };
    NullAstVisitor.prototype.visitPropertyRead = function (ast, context) { };
    NullAstVisitor.prototype.visitPropertyWrite = function (ast, context) { };
    NullAstVisitor.prototype.visitQuote = function (ast, context) { };
    NullAstVisitor.prototype.visitSafeMethodCall = function (ast, context) { };
    NullAstVisitor.prototype.visitSafePropertyRead = function (ast, context) { };
    return NullAstVisitor;
}());
export { NullAstVisitor };
var RecursiveAstVisitor = /** @class */ (function () {
    function RecursiveAstVisitor() {
    }
    RecursiveAstVisitor.prototype.visitBinary = function (ast, context) {
        ast.left.visit(this);
        ast.right.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitChain = function (ast, context) { return this.visitAll(ast.expressions, context); };
    RecursiveAstVisitor.prototype.visitConditional = function (ast, context) {
        ast.condition.visit(this);
        ast.trueExp.visit(this);
        ast.falseExp.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitPipe = function (ast, context) {
        ast.exp.visit(this);
        this.visitAll(ast.args, context);
        return null;
    };
    RecursiveAstVisitor.prototype.visitFunctionCall = function (ast, context) {
        ast.target.visit(this);
        this.visitAll(ast.args, context);
        return null;
    };
    RecursiveAstVisitor.prototype.visitImplicitReceiver = function (ast, context) { return null; };
    RecursiveAstVisitor.prototype.visitInterpolation = function (ast, context) {
        return this.visitAll(ast.expressions, context);
    };
    RecursiveAstVisitor.prototype.visitKeyedRead = function (ast, context) {
        ast.obj.visit(this);
        ast.key.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitKeyedWrite = function (ast, context) {
        ast.obj.visit(this);
        ast.key.visit(this);
        ast.value.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitLiteralArray = function (ast, context) {
        return this.visitAll(ast.expressions, context);
    };
    RecursiveAstVisitor.prototype.visitLiteralMap = function (ast, context) { return this.visitAll(ast.values, context); };
    RecursiveAstVisitor.prototype.visitLiteralPrimitive = function (ast, context) { return null; };
    RecursiveAstVisitor.prototype.visitMethodCall = function (ast, context) {
        ast.receiver.visit(this);
        return this.visitAll(ast.args, context);
    };
    RecursiveAstVisitor.prototype.visitPrefixNot = function (ast, context) {
        ast.expression.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitNonNullAssert = function (ast, context) {
        ast.expression.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitPropertyRead = function (ast, context) {
        ast.receiver.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitPropertyWrite = function (ast, context) {
        ast.receiver.visit(this);
        ast.value.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitSafePropertyRead = function (ast, context) {
        ast.receiver.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitSafeMethodCall = function (ast, context) {
        ast.receiver.visit(this);
        return this.visitAll(ast.args, context);
    };
    RecursiveAstVisitor.prototype.visitAll = function (asts, context) {
        var _this = this;
        asts.forEach(function (ast) { return ast.visit(_this, context); });
        return null;
    };
    RecursiveAstVisitor.prototype.visitQuote = function (ast, context) { return null; };
    return RecursiveAstVisitor;
}());
export { RecursiveAstVisitor };
var AstTransformer = /** @class */ (function () {
    function AstTransformer() {
    }
    AstTransformer.prototype.visitImplicitReceiver = function (ast, context) { return ast; };
    AstTransformer.prototype.visitInterpolation = function (ast, context) {
        return new Interpolation(ast.span, ast.strings, this.visitAll(ast.expressions));
    };
    AstTransformer.prototype.visitLiteralPrimitive = function (ast, context) {
        return new LiteralPrimitive(ast.span, ast.value);
    };
    AstTransformer.prototype.visitPropertyRead = function (ast, context) {
        return new PropertyRead(ast.span, ast.receiver.visit(this), ast.name);
    };
    AstTransformer.prototype.visitPropertyWrite = function (ast, context) {
        return new PropertyWrite(ast.span, ast.receiver.visit(this), ast.name, ast.value.visit(this));
    };
    AstTransformer.prototype.visitSafePropertyRead = function (ast, context) {
        return new SafePropertyRead(ast.span, ast.receiver.visit(this), ast.name);
    };
    AstTransformer.prototype.visitMethodCall = function (ast, context) {
        return new MethodCall(ast.span, ast.receiver.visit(this), ast.name, this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitSafeMethodCall = function (ast, context) {
        return new SafeMethodCall(ast.span, ast.receiver.visit(this), ast.name, this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitFunctionCall = function (ast, context) {
        return new FunctionCall(ast.span, ast.target.visit(this), this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitLiteralArray = function (ast, context) {
        return new LiteralArray(ast.span, this.visitAll(ast.expressions));
    };
    AstTransformer.prototype.visitLiteralMap = function (ast, context) {
        return new LiteralMap(ast.span, ast.keys, this.visitAll(ast.values));
    };
    AstTransformer.prototype.visitBinary = function (ast, context) {
        return new Binary(ast.span, ast.operation, ast.left.visit(this), ast.right.visit(this));
    };
    AstTransformer.prototype.visitPrefixNot = function (ast, context) {
        return new PrefixNot(ast.span, ast.expression.visit(this));
    };
    AstTransformer.prototype.visitNonNullAssert = function (ast, context) {
        return new NonNullAssert(ast.span, ast.expression.visit(this));
    };
    AstTransformer.prototype.visitConditional = function (ast, context) {
        return new Conditional(ast.span, ast.condition.visit(this), ast.trueExp.visit(this), ast.falseExp.visit(this));
    };
    AstTransformer.prototype.visitPipe = function (ast, context) {
        return new BindingPipe(ast.span, ast.exp.visit(this), ast.name, this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitKeyedRead = function (ast, context) {
        return new KeyedRead(ast.span, ast.obj.visit(this), ast.key.visit(this));
    };
    AstTransformer.prototype.visitKeyedWrite = function (ast, context) {
        return new KeyedWrite(ast.span, ast.obj.visit(this), ast.key.visit(this), ast.value.visit(this));
    };
    AstTransformer.prototype.visitAll = function (asts) {
        var res = new Array(asts.length);
        for (var i = 0; i < asts.length; ++i) {
            res[i] = asts[i].visit(this);
        }
        return res;
    };
    AstTransformer.prototype.visitChain = function (ast, context) {
        return new Chain(ast.span, this.visitAll(ast.expressions));
    };
    AstTransformer.prototype.visitQuote = function (ast, context) {
        return new Quote(ast.span, ast.prefix, ast.uninterpretedExpression, ast.location);
    };
    return AstTransformer;
}());
export { AstTransformer };
// A transformer that only creates new nodes if the transformer makes a change or
// a change is made a child node.
var AstMemoryEfficientTransformer = /** @class */ (function () {
    function AstMemoryEfficientTransformer() {
    }
    AstMemoryEfficientTransformer.prototype.visitImplicitReceiver = function (ast, context) { return ast; };
    AstMemoryEfficientTransformer.prototype.visitInterpolation = function (ast, context) {
        var expressions = this.visitAll(ast.expressions);
        if (expressions !== ast.expressions)
            return new Interpolation(ast.span, ast.strings, expressions);
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitLiteralPrimitive = function (ast, context) { return ast; };
    AstMemoryEfficientTransformer.prototype.visitPropertyRead = function (ast, context) {
        var receiver = ast.receiver.visit(this);
        if (receiver !== ast.receiver) {
            return new PropertyRead(ast.span, receiver, ast.name);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitPropertyWrite = function (ast, context) {
        var receiver = ast.receiver.visit(this);
        var value = ast.value.visit(this);
        if (receiver !== ast.receiver || value !== ast.value) {
            return new PropertyWrite(ast.span, receiver, ast.name, value);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitSafePropertyRead = function (ast, context) {
        var receiver = ast.receiver.visit(this);
        if (receiver !== ast.receiver) {
            return new SafePropertyRead(ast.span, receiver, ast.name);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitMethodCall = function (ast, context) {
        var receiver = ast.receiver.visit(this);
        if (receiver !== ast.receiver) {
            return new MethodCall(ast.span, receiver, ast.name, this.visitAll(ast.args));
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitSafeMethodCall = function (ast, context) {
        var receiver = ast.receiver.visit(this);
        var args = this.visitAll(ast.args);
        if (receiver !== ast.receiver || args !== ast.args) {
            return new SafeMethodCall(ast.span, receiver, ast.name, args);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitFunctionCall = function (ast, context) {
        var target = ast.target && ast.target.visit(this);
        var args = this.visitAll(ast.args);
        if (target !== ast.target || args !== ast.args) {
            return new FunctionCall(ast.span, target, args);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitLiteralArray = function (ast, context) {
        var expressions = this.visitAll(ast.expressions);
        if (expressions !== ast.expressions) {
            return new LiteralArray(ast.span, expressions);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitLiteralMap = function (ast, context) {
        var values = this.visitAll(ast.values);
        if (values !== ast.values) {
            return new LiteralMap(ast.span, ast.keys, values);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitBinary = function (ast, context) {
        var left = ast.left.visit(this);
        var right = ast.right.visit(this);
        if (left !== ast.left || right !== ast.right) {
            return new Binary(ast.span, ast.operation, left, right);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitPrefixNot = function (ast, context) {
        var expression = ast.expression.visit(this);
        if (expression !== ast.expression) {
            return new PrefixNot(ast.span, expression);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitNonNullAssert = function (ast, context) {
        var expression = ast.expression.visit(this);
        if (expression !== ast.expression) {
            return new NonNullAssert(ast.span, expression);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitConditional = function (ast, context) {
        var condition = ast.condition.visit(this);
        var trueExp = ast.trueExp.visit(this);
        var falseExp = ast.falseExp.visit(this);
        if (condition !== ast.condition || trueExp !== ast.trueExp || falseExp !== falseExp) {
            return new Conditional(ast.span, condition, trueExp, falseExp);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitPipe = function (ast, context) {
        var exp = ast.exp.visit(this);
        var args = this.visitAll(ast.args);
        if (exp !== ast.exp || args !== ast.args) {
            return new BindingPipe(ast.span, exp, ast.name, args);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitKeyedRead = function (ast, context) {
        var obj = ast.obj.visit(this);
        var key = ast.key.visit(this);
        if (obj !== ast.obj || key !== ast.key) {
            return new KeyedRead(ast.span, obj, key);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitKeyedWrite = function (ast, context) {
        var obj = ast.obj.visit(this);
        var key = ast.key.visit(this);
        var value = ast.value.visit(this);
        if (obj !== ast.obj || key !== ast.key || value !== ast.value) {
            return new KeyedWrite(ast.span, obj, key, value);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitAll = function (asts) {
        var res = new Array(asts.length);
        var modified = false;
        for (var i = 0; i < asts.length; ++i) {
            var original = asts[i];
            var value = original.visit(this);
            res[i] = value;
            modified = modified || value !== original;
        }
        return modified ? res : asts;
    };
    AstMemoryEfficientTransformer.prototype.visitChain = function (ast, context) {
        var expressions = this.visitAll(ast.expressions);
        if (expressions !== ast.expressions) {
            return new Chain(ast.span, expressions);
        }
        return ast;
    };
    AstMemoryEfficientTransformer.prototype.visitQuote = function (ast, context) { return ast; };
    return AstMemoryEfficientTransformer;
}());
export { AstMemoryEfficientTransformer };
export function visitAstChildren(ast, visitor, context) {
    function visit(ast) {
        visitor.visit && visitor.visit(ast, context) || ast.visit(visitor, context);
    }
    function visitAll(asts) { asts.forEach(visit); }
    ast.visit({
        visitBinary: function (ast) {
            visit(ast.left);
            visit(ast.right);
        },
        visitChain: function (ast) { visitAll(ast.expressions); },
        visitConditional: function (ast) {
            visit(ast.condition);
            visit(ast.trueExp);
            visit(ast.falseExp);
        },
        visitFunctionCall: function (ast) {
            if (ast.target) {
                visit(ast.target);
            }
            visitAll(ast.args);
        },
        visitImplicitReceiver: function (ast) { },
        visitInterpolation: function (ast) { visitAll(ast.expressions); },
        visitKeyedRead: function (ast) {
            visit(ast.obj);
            visit(ast.key);
        },
        visitKeyedWrite: function (ast) {
            visit(ast.obj);
            visit(ast.key);
            visit(ast.obj);
        },
        visitLiteralArray: function (ast) { visitAll(ast.expressions); },
        visitLiteralMap: function (ast) { },
        visitLiteralPrimitive: function (ast) { },
        visitMethodCall: function (ast) {
            visit(ast.receiver);
            visitAll(ast.args);
        },
        visitPipe: function (ast) {
            visit(ast.exp);
            visitAll(ast.args);
        },
        visitPrefixNot: function (ast) { visit(ast.expression); },
        visitNonNullAssert: function (ast) { visit(ast.expression); },
        visitPropertyRead: function (ast) { visit(ast.receiver); },
        visitPropertyWrite: function (ast) {
            visit(ast.receiver);
            visit(ast.value);
        },
        visitQuote: function (ast) { },
        visitSafeMethodCall: function (ast) {
            visit(ast.receiver);
            visitAll(ast.args);
        },
        visitSafePropertyRead: function (ast) { visit(ast.receiver); },
    });
}
// Bindings
var ParsedProperty = /** @class */ (function () {
    function ParsedProperty(name, expression, type, sourceSpan) {
        this.name = name;
        this.expression = expression;
        this.type = type;
        this.sourceSpan = sourceSpan;
        this.isLiteral = this.type === ParsedPropertyType.LITERAL_ATTR;
        this.isAnimation = this.type === ParsedPropertyType.ANIMATION;
    }
    return ParsedProperty;
}());
export { ParsedProperty };
export var ParsedPropertyType;
(function (ParsedPropertyType) {
    ParsedPropertyType[ParsedPropertyType["DEFAULT"] = 0] = "DEFAULT";
    ParsedPropertyType[ParsedPropertyType["LITERAL_ATTR"] = 1] = "LITERAL_ATTR";
    ParsedPropertyType[ParsedPropertyType["ANIMATION"] = 2] = "ANIMATION";
})(ParsedPropertyType || (ParsedPropertyType = {}));
var ParsedEvent = /** @class */ (function () {
    // Regular events have a target
    // Animation events have a phase
    function ParsedEvent(name, targetOrPhase, type, handler, sourceSpan) {
        this.name = name;
        this.targetOrPhase = targetOrPhase;
        this.type = type;
        this.handler = handler;
        this.sourceSpan = sourceSpan;
    }
    return ParsedEvent;
}());
export { ParsedEvent };
var ParsedVariable = /** @class */ (function () {
    function ParsedVariable(name, value, sourceSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    return ParsedVariable;
}());
export { ParsedVariable };
var BoundElementProperty = /** @class */ (function () {
    function BoundElementProperty(name, type, securityContext, value, unit, sourceSpan) {
        this.name = name;
        this.type = type;
        this.securityContext = securityContext;
        this.value = value;
        this.unit = unit;
        this.sourceSpan = sourceSpan;
    }
    return BoundElementProperty;
}());
export { BoundElementProperty };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2V4cHJlc3Npb25fcGFyc2VyL2FzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBS0g7SUFFRSxxQkFDSSxPQUFlLEVBQVMsS0FBYSxFQUFTLFdBQW1CLEVBQVMsV0FBaUI7UUFBbkUsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFTLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQVMsZ0JBQVcsR0FBWCxXQUFXLENBQU07UUFDN0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBaUIsT0FBTyxTQUFJLFdBQVcsVUFBSyxLQUFLLGFBQVEsV0FBYSxDQUFDO0lBQ3hGLENBQUM7SUFDSCxrQkFBQztBQUFELENBQUMsQUFORCxJQU1DOztBQUVEO0lBQ0UsbUJBQW1CLEtBQWEsRUFBUyxHQUFXO1FBQWpDLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFRO0lBQUcsQ0FBQztJQUMxRCxnQkFBQztBQUFELENBQUMsQUFGRCxJQUVDOztBQUVEO0lBQ0UsYUFBbUIsSUFBZTtRQUFmLFNBQUksR0FBSixJQUFJLENBQVc7SUFBRyxDQUFDO0lBQ3RDLG1CQUFLLEdBQUwsVUFBTSxPQUFtQixFQUFFLE9BQW1CO1FBQW5CLHdCQUFBLEVBQUEsY0FBbUI7UUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQUMsQ0FBQztJQUNyRSxzQkFBUSxHQUFSLGNBQXFCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RDLFVBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQzs7QUFFRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSDtJQUEyQixpQ0FBRztJQUM1QixlQUNJLElBQWUsRUFBUyxNQUFjLEVBQVMsdUJBQStCLEVBQ3ZFLFFBQWE7UUFGeEIsWUFHRSxrQkFBTSxJQUFJLENBQUMs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QUosSUFBSSxDQUFpQjtRQUN4RSxZQUFPLEdBQVAsT0FBTyxDQUFLO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7SUFBRyxDQUFDO0lBQ2pFLGtCQUFDO0FBQUQsQ0FBQyxBQU5ELElBTUM7O0FBRUQ7SUFDRSx3QkFBbUIsSUFBWSxFQUFTLEtBQWEsRUFBUyxVQUEyQjtRQUF0RSxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFTLGVBQVUsR0FBVixVQUFVLENBQWlCO0lBQUcsQ0FBQztJQUMvRixxQkFBQztBQUFELENBQUMsQUFGRCxJQUVDOztBQWVEO0lBQ0UsOEJBQ1csSUFBWSxFQUFTLElBQWlCLEVBQVMsZUFBZ0MsRUFDL0UsS0FBVSxFQUFTLElBQWlCLEVBQVMsVUFBMkI7UUFEeEUsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQWE7UUFBUyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDL0UsVUFBSyxHQUFMLEtBQUssQ0FBSztRQUFTLFNBQUksR0FBSixJQUFJLENBQWE7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFpQjtJQUFHLENBQUM7SUFDekYsMkJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTZWN1cml0eUNvbnRleHR9IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5leHBvcnQgY2xhc3MgUGFyc2VyRXJyb3Ige1xuICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIG1lc3NhZ2U6IHN0cmluZywgcHVibGljIGlucHV0OiBzdHJpbmcsIHB1YmxpYyBlcnJMb2NhdGlvbjogc3RyaW5nLCBwdWJsaWMgY3R4TG9jYXRpb24/OiBhbnkpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBgUGFyc2VyIEVycm9yOiAke21lc3NhZ2V9ICR7ZXJyTG9jYXRpb259IFske2lucHV0fV0gaW4gJHtjdHhMb2NhdGlvbn1gO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZVNwYW4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RhcnQ6IG51bWJlciwgcHVibGljIGVuZDogbnVtYmVyKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHNwYW46IFBhcnNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiAnQVNUJzsgfVxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBxdW90ZWQgZXhwcmVzc2lvbiBvZiB0aGUgZm9ybTpcbiAqXG4gKiBxdW90ZSA9IHByZWZpeCBgOmAgdW5pbnRlcnByZXRlZEV4cHJlc3Npb25cbiAqIHByZWZpeCA9IGlkZW50aWZpZXJcbiAqIHVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uID0gYXJiaXRyYXJ5IHN0cmluZ1xuICpcbiAqIEEgcXVvdGVkIGV4cHJlc3Npb24gaXMgbWVhbnQgdG8gYmUgcHJlLXByb2Nlc3NlZCBieSBhbiBBU1QgdHJhbnNmb3JtZXIgdGhhdFxuICogY29udmVydHMgaXQgaW50byBhbm90aGVyIEFTVCB0aGF0IG5vIGxvbmdlciBjb250YWlucyBxdW90ZWQgZXhwcmVzc2lvbnMuXG4gKiBJdCBpcyBtZWFudCB0byBhbGxvdyB0aGlyZC1wYXJ0eSBkZXZlbG9wZXJzIHRvIGV4dGVuZCBBbmd1bGFyIHRlbXBsYXRlXG4gKiBleHByZXNzaW9uIGxhbmd1YWdlLiBUaGUgYHVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uYCBwYXJ0IG9mIHRoZSBxdW90ZSBpc1xuICogdGhlcmVmb3JlIG5vdCBpbnRlcnByZXRlZCBieSB0aGUgQW5ndWxhcidzIG93biBleHByZXNzaW9uIHBhcnNlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFF1b3RlIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBzcGFuOiBQYXJzZVNwYW4sIHB1YmxpYyBwcmVmaXg6IHN0cmluZywgcHVibGljIHVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uOiBzdHJpbmcsXG4gICAgICBwdWJsaWMgbG9jYXRpb246IGFueSkge1xuICAgIHN1cGVyKHNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdFF1b3RlKHRoaXMsIGNvbnRleHQpOyB9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiAnUXVvdGUnOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbXB0eUV4cHIgZXh0ZW5kcyBBU1Qge1xuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKSB7XG4gICAgLy8gZG8gbm90aGluZ1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbXBsaWNpdFJlY2VpdmVyIGV4dGVuZHMgQVNUIHtcbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRJbXBsaWNpdFJlY2VpdmVyKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogTXVsdGlwbGUgZXhwcmVzc2lvbnMgc2VwYXJhdGVkIGJ5IGEgc2VtaWNvbG9uLlxuICovXG5leHBvcnQgY2xhc3MgQ2hhaW4gZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihzcGFuOiBQYXJzZVNwYW4sIHB1YmxpYyBleHByZXNzaW9uczogYW55W10pIHsgc3VwZXIoc3Bhbik7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0Q2hhaW4odGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBwdWJsaWMgY29uZGl0aW9uOiBBU1QsIHB1YmxpYyB0cnVlRXhwOiBBU1QsIHB1YmxpYyBmYWxzZUV4cDogQVNUKSB7XG4gICAgc3VwZXIoc3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRDb25kaXRpb25hbCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvcGVydHlSZWFkIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBwdWJsaWMgcmVjZWl2ZXI6IEFTVCwgcHVibGljIG5hbWU6IHN0cmluZykgeyBzdXBlcihzcGFuKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFByb3BlcnR5UmVhZCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvcGVydHlXcml0ZSBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHNwYW46IFBhcnNlU3BhbiwgcHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogQVNUKSB7XG4gICAgc3VwZXIoc3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRQcm9wZXJ0eVdyaXRlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTYWZlUHJvcGVydHlSZWFkIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBwdWJsaWMgcmVjZWl2ZXI6IEFTVCwgcHVibGljIG5hbWU6IHN0cmluZykgeyBzdXBlcihzcGFuKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFNhZmVQcm9wZXJ0eVJlYWQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEtleWVkUmVhZCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHNwYW46IFBhcnNlU3BhbiwgcHVibGljIG9iajogQVNULCBwdWJsaWMga2V5OiBBU1QpIHsgc3VwZXIoc3Bhbik7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRLZXllZFJlYWQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEtleWVkV3JpdGUgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihzcGFuOiBQYXJzZVNwYW4sIHB1YmxpYyBvYmo6IEFTVCwgcHVibGljIGtleTogQVNULCBwdWJsaWMgdmFsdWU6IEFTVCkgeyBzdXBlcihzcGFuKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEtleWVkV3JpdGUodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJpbmRpbmdQaXBlIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBwdWJsaWMgZXhwOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhcmdzOiBhbnlbXSkge1xuICAgIHN1cGVyKHNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdFBpcGUodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIExpdGVyYWxQcmltaXRpdmUgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihzcGFuOiBQYXJzZVNwYW4sIHB1YmxpYyB2YWx1ZTogYW55KSB7IHN1cGVyKHNwYW4pOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0TGl0ZXJhbFByaW1pdGl2ZSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTGl0ZXJhbEFycmF5IGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBwdWJsaWMgZXhwcmVzc2lvbnM6IGFueVtdKSB7IHN1cGVyKHNwYW4pOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0TGl0ZXJhbEFycmF5KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIExpdGVyYWxNYXBLZXkgPSB7XG4gIGtleTogc3RyaW5nOyBxdW90ZWQ6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgY2xhc3MgTGl0ZXJhbE1hcCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHNwYW46IFBhcnNlU3BhbiwgcHVibGljIGtleXM6IExpdGVyYWxNYXBLZXlbXSwgcHVibGljIHZhbHVlczogYW55W10pIHsgc3VwZXIoc3Bhbik7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRMaXRlcmFsTWFwKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbnRlcnBvbGF0aW9uIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBwdWJsaWMgc3RyaW5nczogYW55W10sIHB1YmxpYyBleHByZXNzaW9uczogYW55W10pIHsgc3VwZXIoc3Bhbik7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRJbnRlcnBvbGF0aW9uKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCaW5hcnkgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihzcGFuOiBQYXJzZVNwYW4sIHB1YmxpYyBvcGVyYXRpb246IHN0cmluZywgcHVibGljIGxlZnQ6IEFTVCwgcHVibGljIHJpZ2h0OiBBU1QpIHtcbiAgICBzdXBlcihzcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJpbmFyeSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJlZml4Tm90IGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBwdWJsaWMgZXhwcmVzc2lvbjogQVNUKSB7IHN1cGVyKHNwYW4pOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UHJlZml4Tm90KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOb25OdWxsQXNzZXJ0IGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBwdWJsaWMgZXhwcmVzc2lvbjogQVNUKSB7IHN1cGVyKHNwYW4pOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0Tm9uTnVsbEFzc2VydCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWV0aG9kQ2FsbCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHNwYW46IFBhcnNlU3BhbiwgcHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhcmdzOiBhbnlbXSkge1xuICAgIHN1cGVyKHNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0TWV0aG9kQ2FsbCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2FmZU1ldGhvZENhbGwgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihzcGFuOiBQYXJzZVNwYW4sIHB1YmxpYyByZWNlaXZlcjogQVNULCBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgYXJnczogYW55W10pIHtcbiAgICBzdXBlcihzcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFNhZmVNZXRob2RDYWxsKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGdW5jdGlvbkNhbGwgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihzcGFuOiBQYXJzZVNwYW4sIHB1YmxpYyB0YXJnZXQ6IEFTVHxudWxsLCBwdWJsaWMgYXJnczogYW55W10pIHsgc3VwZXIoc3Bhbik7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRGdW5jdGlvbkNhbGwodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFTVFdpdGhTb3VyY2UgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBhc3Q6IEFTVCwgcHVibGljIHNvdXJjZTogc3RyaW5nfG51bGwsIHB1YmxpYyBsb2NhdGlvbjogc3RyaW5nLFxuICAgICAgcHVibGljIGVycm9yczogUGFyc2VyRXJyb3JbXSkge1xuICAgIHN1cGVyKG5ldyBQYXJzZVNwYW4oMCwgc291cmNlID09IG51bGwgPyAwIDogc291cmNlLmxlbmd0aCkpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkgeyByZXR1cm4gdGhpcy5hc3QudmlzaXQodmlzaXRvciwgY29udGV4dCk7IH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGAke3RoaXMuc291cmNlfSBpbiAke3RoaXMubG9jYXRpb259YDsgfVxufVxuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVCaW5kaW5nIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgc3BhbjogUGFyc2VTcGFuLCBwdWJsaWMga2V5OiBzdHJpbmcsIHB1YmxpYyBrZXlJc1ZhcjogYm9vbGVhbiwgcHVibGljIG5hbWU6IHN0cmluZyxcbiAgICAgIHB1YmxpYyBleHByZXNzaW9uOiBBU1RXaXRoU291cmNlfG51bGwpIHt9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXN0VmlzaXRvciB7XG4gIHZpc2l0QmluYXJ5KGFzdDogQmluYXJ5LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbiwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdENvbmRpdGlvbmFsKGFzdDogQ29uZGl0aW9uYWwsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEludGVycG9sYXRpb24oYXN0OiBJbnRlcnBvbGF0aW9uLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0S2V5ZWRSZWFkKGFzdDogS2V5ZWRSZWFkLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXN0OiBMaXRlcmFsQXJyYXksIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogTGl0ZXJhbE1hcCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0TWV0aG9kQ2FsbChhc3Q6IE1ldGhvZENhbGwsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRQaXBlKGFzdDogQmluZGluZ1BpcGUsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRQcmVmaXhOb3QoYXN0OiBQcmVmaXhOb3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXROb25OdWxsQXNzZXJ0KGFzdDogTm9uTnVsbEFzc2VydCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UXVvdGUoYXN0OiBRdW90ZSwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFNhZmVNZXRob2RDYWxsKGFzdDogU2FmZU1ldGhvZENhbGwsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdD8oYXN0OiBBU1QsIGNvbnRleHQ/OiBhbnkpOiBhbnk7XG59XG5cbmV4cG9ydCBjbGFzcyBOdWxsQXN0VmlzaXRvciBpbXBsZW1lbnRzIEFzdFZpc2l0b3Ige1xuICB2aXNpdEJpbmFyeShhc3Q6IEJpbmFyeSwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbiwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogRnVuY3Rpb25DYWxsLCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlciwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24sIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdEtleWVkUmVhZChhc3Q6IEtleWVkUmVhZCwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXAsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlLCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlLCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRQcmVmaXhOb3QoYXN0OiBQcmVmaXhOb3QsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBOb25OdWxsQXNzZXJ0LCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlLCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRRdW90ZShhc3Q6IFF1b3RlLCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCwgY29udGV4dDogYW55KTogYW55IHt9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN1cnNpdmVBc3RWaXNpdG9yIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIHZpc2l0QmluYXJ5KGFzdDogQmluYXJ5LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5sZWZ0LnZpc2l0KHRoaXMpO1xuICAgIGFzdC5yaWdodC52aXNpdCh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdENoYWluKGFzdDogQ2hhaW4sIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucywgY29udGV4dCk7IH1cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5jb25kaXRpb24udmlzaXQodGhpcyk7XG4gICAgYXN0LnRydWVFeHAudmlzaXQodGhpcyk7XG4gICAgYXN0LmZhbHNlRXhwLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5leHAudmlzaXQodGhpcyk7XG4gICAgdGhpcy52aXNpdEFsbChhc3QuYXJncywgY29udGV4dCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LnRhcmdldCAhLnZpc2l0KHRoaXMpO1xuICAgIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MsIGNvbnRleHQpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IEltcGxpY2l0UmVjZWl2ZXIsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdEtleWVkUmVhZChhc3Q6IEtleWVkUmVhZCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3Qub2JqLnZpc2l0KHRoaXMpO1xuICAgIGFzdC5rZXkudmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRLZXllZFdyaXRlKGFzdDogS2V5ZWRXcml0ZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3Qub2JqLnZpc2l0KHRoaXMpO1xuICAgIGFzdC5rZXkudmlzaXQodGhpcyk7XG4gICAgYXN0LnZhbHVlLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogTGl0ZXJhbEFycmF5LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucywgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogTGl0ZXJhbE1hcCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIHRoaXMudmlzaXRBbGwoYXN0LnZhbHVlcywgY29udGV4dCk7IH1cbiAgdmlzaXRMaXRlcmFsUHJpbWl0aXZlKGFzdDogTGl0ZXJhbFByaW1pdGl2ZSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QucmVjZWl2ZXIudmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0UHJlZml4Tm90KGFzdDogUHJlZml4Tm90LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0Tm9uTnVsbEFzc2VydChhc3Q6IE5vbk51bGxBc3NlcnQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LmV4cHJlc3Npb24udmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0UHJvcGVydHlXcml0ZShhc3Q6IFByb3BlcnR5V3JpdGUsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIGFzdC52YWx1ZS52aXNpdCh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdFNhZmVQcm9wZXJ0eVJlYWQoYXN0OiBTYWZlUHJvcGVydHlSZWFkLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdFNhZmVNZXRob2RDYWxsKGFzdDogU2FmZU1ldGhvZENhbGwsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdEFsbChhc3RzOiBBU1RbXSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3RzLmZvckVhY2goYXN0ID0+IGFzdC52aXNpdCh0aGlzLCBjb250ZXh0KSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRRdW90ZShhc3Q6IFF1b3RlLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxufVxuXG5leHBvcnQgY2xhc3MgQXN0VHJhbnNmb3JtZXIgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlciwgY29udGV4dDogYW55KTogQVNUIHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24sIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBJbnRlcnBvbGF0aW9uKGFzdC5zcGFuLCBhc3Quc3RyaW5ncywgdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpKTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbFByaW1pdGl2ZShhc3Q6IExpdGVyYWxQcmltaXRpdmUsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBMaXRlcmFsUHJpbWl0aXZlKGFzdC5zcGFuLCBhc3QudmFsdWUpO1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVJlYWQoYXN0LnNwYW4sIGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKSwgYXN0Lm5hbWUpO1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IFByb3BlcnR5V3JpdGUoYXN0LnNwYW4sIGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKSwgYXN0Lm5hbWUsIGFzdC52YWx1ZS52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdFNhZmVQcm9wZXJ0eVJlYWQoYXN0OiBTYWZlUHJvcGVydHlSZWFkLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgU2FmZVByb3BlcnR5UmVhZChhc3Quc3BhbiwgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpLCBhc3QubmFtZSk7XG4gIH1cblxuICB2aXNpdE1ldGhvZENhbGwoYXN0OiBNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgTWV0aG9kQ2FsbChhc3Quc3BhbiwgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpLCBhc3QubmFtZSwgdGhpcy52aXNpdEFsbChhc3QuYXJncykpO1xuICB9XG5cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgU2FmZU1ldGhvZENhbGwoXG4gICAgICAgIGFzdC5zcGFuLCBhc3QucmVjZWl2ZXIudmlzaXQodGhpcyksIGFzdC5uYW1lLCB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKSk7XG4gIH1cblxuICB2aXNpdEZ1bmN0aW9uQ2FsbChhc3Q6IEZ1bmN0aW9uQ2FsbCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uQ2FsbChhc3Quc3BhbiwgYXN0LnRhcmdldCAhLnZpc2l0KHRoaXMpLCB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IExpdGVyYWxBcnJheShhc3Quc3BhbiwgdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpKTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXAsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBMaXRlcmFsTWFwKGFzdC5zcGFuLCBhc3Qua2V5cywgdGhpcy52aXNpdEFsbChhc3QudmFsdWVzKSk7XG4gIH1cblxuICB2aXNpdEJpbmFyeShhc3Q6IEJpbmFyeSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeShhc3Quc3BhbiwgYXN0Lm9wZXJhdGlvbiwgYXN0LmxlZnQudmlzaXQodGhpcyksIGFzdC5yaWdodC52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IFByZWZpeE5vdChhc3Quc3BhbiwgYXN0LmV4cHJlc3Npb24udmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXROb25OdWxsQXNzZXJ0KGFzdDogTm9uTnVsbEFzc2VydCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IE5vbk51bGxBc3NlcnQoYXN0LnNwYW4sIGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IENvbmRpdGlvbmFsKFxuICAgICAgICBhc3Quc3BhbiwgYXN0LmNvbmRpdGlvbi52aXNpdCh0aGlzKSwgYXN0LnRydWVFeHAudmlzaXQodGhpcyksIGFzdC5mYWxzZUV4cC52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJpbmRpbmdQaXBlKGFzdC5zcGFuLCBhc3QuZXhwLnZpc2l0KHRoaXMpLCBhc3QubmFtZSwgdGhpcy52aXNpdEFsbChhc3QuYXJncykpO1xuICB9XG5cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBLZXllZFJlYWQoYXN0LnNwYW4sIGFzdC5vYmoudmlzaXQodGhpcyksIGFzdC5rZXkudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRLZXllZFdyaXRlKGFzdDogS2V5ZWRXcml0ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEtleWVkV3JpdGUoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Qub2JqLnZpc2l0KHRoaXMpLCBhc3Qua2V5LnZpc2l0KHRoaXMpLCBhc3QudmFsdWUudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRBbGwoYXN0czogYW55W10pOiBhbnlbXSB7XG4gICAgY29uc3QgcmVzID0gbmV3IEFycmF5KGFzdHMubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFzdHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHJlc1tpXSA9IGFzdHNbaV0udmlzaXQodGhpcyk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICB2aXNpdENoYWluKGFzdDogQ2hhaW4sIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBDaGFpbihhc3Quc3BhbiwgdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpKTtcbiAgfVxuXG4gIHZpc2l0UXVvdGUoYXN0OiBRdW90ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IFF1b3RlKGFzdC5zcGFuLCBhc3QucHJlZml4LCBhc3QudW5pbnRlcnByZXRlZEV4cHJlc3Npb24sIGFzdC5sb2NhdGlvbik7XG4gIH1cbn1cblxuLy8gQSB0cmFuc2Zvcm1lciB0aGF0IG9ubHkgY3JlYXRlcyBuZXcgbm9kZXMgaWYgdGhlIHRyYW5zZm9ybWVyIG1ha2VzIGEgY2hhbmdlIG9yXG4vLyBhIGNoYW5nZSBpcyBtYWRlIGEgY2hpbGQgbm9kZS5cbmV4cG9ydCBjbGFzcyBBc3RNZW1vcnlFZmZpY2llbnRUcmFuc2Zvcm1lciBpbXBsZW1lbnRzIEFzdFZpc2l0b3Ige1xuICB2aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0OiBJbXBsaWNpdFJlY2VpdmVyLCBjb250ZXh0OiBhbnkpOiBBU1QgeyByZXR1cm4gYXN0OyB9XG5cbiAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogSW50ZXJwb2xhdGlvbiwgY29udGV4dDogYW55KTogSW50ZXJwb2xhdGlvbiB7XG4gICAgY29uc3QgZXhwcmVzc2lvbnMgPSB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucyk7XG4gICAgaWYgKGV4cHJlc3Npb25zICE9PSBhc3QuZXhwcmVzc2lvbnMpXG4gICAgICByZXR1cm4gbmV3IEludGVycG9sYXRpb24oYXN0LnNwYW4sIGFzdC5zdHJpbmdzLCBleHByZXNzaW9ucyk7XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbFByaW1pdGl2ZShhc3Q6IExpdGVyYWxQcmltaXRpdmUsIGNvbnRleHQ6IGFueSk6IEFTVCB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICBpZiAocmVjZWl2ZXIgIT09IGFzdC5yZWNlaXZlcikge1xuICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVJlYWQoYXN0LnNwYW4sIHJlY2VpdmVyLCBhc3QubmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IHJlY2VpdmVyID0gYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIGNvbnN0IHZhbHVlID0gYXN0LnZhbHVlLnZpc2l0KHRoaXMpO1xuICAgIGlmIChyZWNlaXZlciAhPT0gYXN0LnJlY2VpdmVyIHx8IHZhbHVlICE9PSBhc3QudmFsdWUpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvcGVydHlXcml0ZShhc3Quc3BhbiwgcmVjZWl2ZXIsIGFzdC5uYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdFNhZmVQcm9wZXJ0eVJlYWQoYXN0OiBTYWZlUHJvcGVydHlSZWFkLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IHJlY2VpdmVyID0gYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIGlmIChyZWNlaXZlciAhPT0gYXN0LnJlY2VpdmVyKSB7XG4gICAgICByZXR1cm4gbmV3IFNhZmVQcm9wZXJ0eVJlYWQoYXN0LnNwYW4sIHJlY2VpdmVyLCBhc3QubmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdE1ldGhvZENhbGwoYXN0OiBNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IHJlY2VpdmVyID0gYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIGlmIChyZWNlaXZlciAhPT0gYXN0LnJlY2VpdmVyKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldGhvZENhbGwoYXN0LnNwYW4sIHJlY2VpdmVyLCBhc3QubmFtZSwgdGhpcy52aXNpdEFsbChhc3QuYXJncykpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IHJlY2VpdmVyID0gYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKTtcbiAgICBpZiAocmVjZWl2ZXIgIT09IGFzdC5yZWNlaXZlciB8fCBhcmdzICE9PSBhc3QuYXJncykge1xuICAgICAgcmV0dXJuIG5ldyBTYWZlTWV0aG9kQ2FsbChhc3Quc3BhbiwgcmVjZWl2ZXIsIGFzdC5uYW1lLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogRnVuY3Rpb25DYWxsLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IHRhcmdldCA9IGFzdC50YXJnZXQgJiYgYXN0LnRhcmdldC52aXNpdCh0aGlzKTtcbiAgICBjb25zdCBhcmdzID0gdGhpcy52aXNpdEFsbChhc3QuYXJncyk7XG4gICAgaWYgKHRhcmdldCAhPT0gYXN0LnRhcmdldCB8fCBhcmdzICE9PSBhc3QuYXJncykge1xuICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbkNhbGwoYXN0LnNwYW4sIHRhcmdldCwgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCBleHByZXNzaW9ucyA9IHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTtcbiAgICBpZiAoZXhwcmVzc2lvbnMgIT09IGFzdC5leHByZXNzaW9ucykge1xuICAgICAgcmV0dXJuIG5ldyBMaXRlcmFsQXJyYXkoYXN0LnNwYW4sIGV4cHJlc3Npb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXAsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgdmFsdWVzID0gdGhpcy52aXNpdEFsbChhc3QudmFsdWVzKTtcbiAgICBpZiAodmFsdWVzICE9PSBhc3QudmFsdWVzKSB7XG4gICAgICByZXR1cm4gbmV3IExpdGVyYWxNYXAoYXN0LnNwYW4sIGFzdC5rZXlzLCB2YWx1ZXMpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnksIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgbGVmdCA9IGFzdC5sZWZ0LnZpc2l0KHRoaXMpO1xuICAgIGNvbnN0IHJpZ2h0ID0gYXN0LnJpZ2h0LnZpc2l0KHRoaXMpO1xuICAgIGlmIChsZWZ0ICE9PSBhc3QubGVmdCB8fCByaWdodCAhPT0gYXN0LnJpZ2h0KSB7XG4gICAgICByZXR1cm4gbmV3IEJpbmFyeShhc3Quc3BhbiwgYXN0Lm9wZXJhdGlvbiwgbGVmdCwgcmlnaHQpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRQcmVmaXhOb3QoYXN0OiBQcmVmaXhOb3QsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgZXhwcmVzc2lvbiA9IGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpO1xuICAgIGlmIChleHByZXNzaW9uICE9PSBhc3QuZXhwcmVzc2lvbikge1xuICAgICAgcmV0dXJuIG5ldyBQcmVmaXhOb3QoYXN0LnNwYW4sIGV4cHJlc3Npb24pO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXROb25OdWxsQXNzZXJ0KGFzdDogTm9uTnVsbEFzc2VydCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCBleHByZXNzaW9uID0gYXN0LmV4cHJlc3Npb24udmlzaXQodGhpcyk7XG4gICAgaWYgKGV4cHJlc3Npb24gIT09IGFzdC5leHByZXNzaW9uKSB7XG4gICAgICByZXR1cm4gbmV3IE5vbk51bGxBc3NlcnQoYXN0LnNwYW4sIGV4cHJlc3Npb24pO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IGNvbmRpdGlvbiA9IGFzdC5jb25kaXRpb24udmlzaXQodGhpcyk7XG4gICAgY29uc3QgdHJ1ZUV4cCA9IGFzdC50cnVlRXhwLnZpc2l0KHRoaXMpO1xuICAgIGNvbnN0IGZhbHNlRXhwID0gYXN0LmZhbHNlRXhwLnZpc2l0KHRoaXMpO1xuICAgIGlmIChjb25kaXRpb24gIT09IGFzdC5jb25kaXRpb24gfHwgdHJ1ZUV4cCAhPT0gYXN0LnRydWVFeHAgfHwgZmFsc2VFeHAgIT09IGZhbHNlRXhwKSB7XG4gICAgICByZXR1cm4gbmV3IENvbmRpdGlvbmFsKGFzdC5zcGFuLCBjb25kaXRpb24sIHRydWVFeHAsIGZhbHNlRXhwKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IGV4cCA9IGFzdC5leHAudmlzaXQodGhpcyk7XG4gICAgY29uc3QgYXJncyA9IHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MpO1xuICAgIGlmIChleHAgIT09IGFzdC5leHAgfHwgYXJncyAhPT0gYXN0LmFyZ3MpIHtcbiAgICAgIHJldHVybiBuZXcgQmluZGluZ1BpcGUoYXN0LnNwYW4sIGV4cCwgYXN0Lm5hbWUsIGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3Qgb2JqID0gYXN0Lm9iai52aXNpdCh0aGlzKTtcbiAgICBjb25zdCBrZXkgPSBhc3Qua2V5LnZpc2l0KHRoaXMpO1xuICAgIGlmIChvYmogIT09IGFzdC5vYmogfHwga2V5ICE9PSBhc3Qua2V5KSB7XG4gICAgICByZXR1cm4gbmV3IEtleWVkUmVhZChhc3Quc3Bhbiwgb2JqLCBrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRLZXllZFdyaXRlKGFzdDogS2V5ZWRXcml0ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCBvYmogPSBhc3Qub2JqLnZpc2l0KHRoaXMpO1xuICAgIGNvbnN0IGtleSA9IGFzdC5rZXkudmlzaXQodGhpcyk7XG4gICAgY29uc3QgdmFsdWUgPSBhc3QudmFsdWUudmlzaXQodGhpcyk7XG4gICAgaWYgKG9iaiAhPT0gYXN0Lm9iaiB8fCBrZXkgIT09IGFzdC5rZXkgfHwgdmFsdWUgIT09IGFzdC52YWx1ZSkge1xuICAgICAgcmV0dXJuIG5ldyBLZXllZFdyaXRlKGFzdC5zcGFuLCBvYmosIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRBbGwoYXN0czogYW55W10pOiBhbnlbXSB7XG4gICAgY29uc3QgcmVzID0gbmV3IEFycmF5KGFzdHMubGVuZ3RoKTtcbiAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFzdHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsID0gYXN0c1tpXTtcbiAgICAgIGNvbnN0IHZhbHVlID0gb3JpZ2luYWwudmlzaXQodGhpcyk7XG4gICAgICByZXNbaV0gPSB2YWx1ZTtcbiAgICAgIG1vZGlmaWVkID0gbW9kaWZpZWQgfHwgdmFsdWUgIT09IG9yaWdpbmFsO1xuICAgIH1cbiAgICByZXR1cm4gbW9kaWZpZWQgPyByZXMgOiBhc3RzO1xuICB9XG5cbiAgdmlzaXRDaGFpbihhc3Q6IENoYWluLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IGV4cHJlc3Npb25zID0gdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpO1xuICAgIGlmIChleHByZXNzaW9ucyAhPT0gYXN0LmV4cHJlc3Npb25zKSB7XG4gICAgICByZXR1cm4gbmV3IENoYWluKGFzdC5zcGFuLCBleHByZXNzaW9ucyk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUsIGNvbnRleHQ6IGFueSk6IEFTVCB7IHJldHVybiBhc3Q7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0QXN0Q2hpbGRyZW4oYXN0OiBBU1QsIHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHtcbiAgZnVuY3Rpb24gdmlzaXQoYXN0OiBBU1QpIHtcbiAgICB2aXNpdG9yLnZpc2l0ICYmIHZpc2l0b3IudmlzaXQoYXN0LCBjb250ZXh0KSB8fCBhc3QudmlzaXQodmlzaXRvciwgY29udGV4dCk7XG4gIH1cblxuICBmdW5jdGlvbiB2aXNpdEFsbDxUIGV4dGVuZHMgQVNUPihhc3RzOiBUW10pIHsgYXN0cy5mb3JFYWNoKHZpc2l0KTsgfVxuXG4gIGFzdC52aXNpdCh7XG4gICAgdmlzaXRCaW5hcnkoYXN0KSB7XG4gICAgICB2aXNpdChhc3QubGVmdCk7XG4gICAgICB2aXNpdChhc3QucmlnaHQpO1xuICAgIH0sXG4gICAgdmlzaXRDaGFpbihhc3QpIHsgdmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTsgfSxcbiAgICB2aXNpdENvbmRpdGlvbmFsKGFzdCkge1xuICAgICAgdmlzaXQoYXN0LmNvbmRpdGlvbik7XG4gICAgICB2aXNpdChhc3QudHJ1ZUV4cCk7XG4gICAgICB2aXNpdChhc3QuZmFsc2VFeHApO1xuICAgIH0sXG4gICAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0KSB7XG4gICAgICBpZiAoYXN0LnRhcmdldCkge1xuICAgICAgICB2aXNpdChhc3QudGFyZ2V0KTtcbiAgICAgIH1cbiAgICAgIHZpc2l0QWxsKGFzdC5hcmdzKTtcbiAgICB9LFxuICAgIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3QpIHt9LFxuICAgIHZpc2l0SW50ZXJwb2xhdGlvbihhc3QpIHsgdmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTsgfSxcbiAgICB2aXNpdEtleWVkUmVhZChhc3QpIHtcbiAgICAgIHZpc2l0KGFzdC5vYmopO1xuICAgICAgdmlzaXQoYXN0LmtleSk7XG4gICAgfSxcbiAgICB2aXNpdEtleWVkV3JpdGUoYXN0KSB7XG4gICAgICB2aXNpdChhc3Qub2JqKTtcbiAgICAgIHZpc2l0KGFzdC5rZXkpO1xuICAgICAgdmlzaXQoYXN0Lm9iaik7XG4gICAgfSxcbiAgICB2aXNpdExpdGVyYWxBcnJheShhc3QpIHsgdmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTsgfSxcbiAgICB2aXNpdExpdGVyYWxNYXAoYXN0KSB7fSxcbiAgICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0KSB7fSxcbiAgICB2aXNpdE1ldGhvZENhbGwoYXN0KSB7XG4gICAgICB2aXNpdChhc3QucmVjZWl2ZXIpO1xuICAgICAgdmlzaXRBbGwoYXN0LmFyZ3MpO1xuICAgIH0sXG4gICAgdmlzaXRQaXBlKGFzdCkge1xuICAgICAgdmlzaXQoYXN0LmV4cCk7XG4gICAgICB2aXNpdEFsbChhc3QuYXJncyk7XG4gICAgfSxcbiAgICB2aXNpdFByZWZpeE5vdChhc3QpIHsgdmlzaXQoYXN0LmV4cHJlc3Npb24pOyB9LFxuICAgIHZpc2l0Tm9uTnVsbEFzc2VydChhc3QpIHsgdmlzaXQoYXN0LmV4cHJlc3Npb24pOyB9LFxuICAgIHZpc2l0UHJvcGVydHlSZWFkKGFzdCkgeyB2aXNpdChhc3QucmVjZWl2ZXIpOyB9LFxuICAgIHZpc2l0UHJvcGVydHlXcml0ZShhc3QpIHtcbiAgICAgIHZpc2l0KGFzdC5yZWNlaXZlcik7XG4gICAgICB2aXNpdChhc3QudmFsdWUpO1xuICAgIH0sXG4gICAgdmlzaXRRdW90ZShhc3QpIHt9LFxuICAgIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0KSB7XG4gICAgICB2aXNpdChhc3QucmVjZWl2ZXIpO1xuICAgICAgdmlzaXRBbGwoYXN0LmFyZ3MpO1xuICAgIH0sXG4gICAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdCkgeyB2aXNpdChhc3QucmVjZWl2ZXIpOyB9LFxuICB9KTtcbn1cblxuXG4vLyBCaW5kaW5nc1xuXG5leHBvcnQgY2xhc3MgUGFyc2VkUHJvcGVydHkge1xuICBwdWJsaWMgcmVhZG9ubHkgaXNMaXRlcmFsOiBib29sZWFuO1xuICBwdWJsaWMgcmVhZG9ubHkgaXNBbmltYXRpb246IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgZXhwcmVzc2lvbjogQVNUV2l0aFNvdXJjZSwgcHVibGljIHR5cGU6IFBhcnNlZFByb3BlcnR5VHlwZSxcbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICB0aGlzLmlzTGl0ZXJhbCA9IHRoaXMudHlwZSA9PT0gUGFyc2VkUHJvcGVydHlUeXBlLkxJVEVSQUxfQVRUUjtcbiAgICB0aGlzLmlzQW5pbWF0aW9uID0gdGhpcy50eXBlID09PSBQYXJzZWRQcm9wZXJ0eVR5cGUuQU5JTUFUSU9OO1xuICB9XG59XG5cbmV4cG9ydCBlbnVtIFBhcnNlZFByb3BlcnR5VHlwZSB7XG4gIERFRkFVTFQsXG4gIExJVEVSQUxfQVRUUixcbiAgQU5JTUFUSU9OXG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFBhcnNlZEV2ZW50VHlwZSB7XG4gIC8vIERPTSBvciBEaXJlY3RpdmUgZXZlbnRcbiAgUmVndWxhcixcbiAgLy8gQW5pbWF0aW9uIHNwZWNpZmljIGV2ZW50XG4gIEFuaW1hdGlvbixcbn1cblxuZXhwb3J0IGNsYXNzIFBhcnNlZEV2ZW50IHtcbiAgLy8gUmVndWxhciBldmVudHMgaGF2ZSBhIHRhcmdldFxuICAvLyBBbmltYXRpb24gZXZlbnRzIGhhdmUgYSBwaGFzZVxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB0YXJnZXRPclBoYXNlOiBzdHJpbmcsIHB1YmxpYyB0eXBlOiBQYXJzZWRFdmVudFR5cGUsXG4gICAgICBwdWJsaWMgaGFuZGxlcjogQVNULCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VkVmFyaWFibGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gQmluZGluZ1R5cGUge1xuICAvLyBBIHJlZ3VsYXIgYmluZGluZyB0byBhIHByb3BlcnR5IChlLmcuIGBbcHJvcGVydHldPVwiZXhwcmVzc2lvblwiYCkuXG4gIFByb3BlcnR5LFxuICAvLyBBIGJpbmRpbmcgdG8gYW4gZWxlbWVudCBhdHRyaWJ1dGUgKGUuZy4gYFthdHRyLm5hbWVdPVwiZXhwcmVzc2lvblwiYCkuXG4gIEF0dHJpYnV0ZSxcbiAgLy8gQSBiaW5kaW5nIHRvIGEgQ1NTIGNsYXNzIChlLmcuIGBbY2xhc3MubmFtZV09XCJjb25kaXRpb25cImApLlxuICBDbGFzcyxcbiAgLy8gQSBiaW5kaW5nIHRvIGEgc3R5bGUgcnVsZSAoZS5nLiBgW3N0eWxlLnJ1bGVdPVwiZXhwcmVzc2lvblwiYCkuXG4gIFN0eWxlLFxuICAvLyBBIGJpbmRpbmcgdG8gYW4gYW5pbWF0aW9uIHJlZmVyZW5jZSAoZS5nLiBgW2FuaW1hdGUua2V5XT1cImV4cHJlc3Npb25cImApLlxuICBBbmltYXRpb24sXG59XG5cbmV4cG9ydCBjbGFzcyBCb3VuZEVsZW1lbnRQcm9wZXJ0eSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHR5cGU6IEJpbmRpbmdUeXBlLCBwdWJsaWMgc2VjdXJpdHlDb250ZXh0OiBTZWN1cml0eUNvbnRleHQsXG4gICAgICBwdWJsaWMgdmFsdWU6IEFTVCwgcHVibGljIHVuaXQ6IHN0cmluZ3xudWxsLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxufVxuIl19