/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from './output_ast';
import { SourceMapGenerator } from './source_map';
var _SINGLE_QUOTE_ESCAPE_STRING_RE = /'|\\|\n|\r|\$/g;
var _LEGAL_IDENTIFIER_RE = /^[$A-Z_][0-9A-Z_$]*$/i;
var _INDENT_WITH = '  ';
export var CATCH_ERROR_VAR = o.variable('error', null, null);
export var CATCH_STACK_VAR = o.variable('stack', null, null);
var _EmittedLine = /** @class */ (function () {
    function _EmittedLine(indent) {
        this.indent = indent;
        this.partsLength = 0;
        this.parts = [];
        this.srcSpans = [];
    }
    return _EmittedLine;
}());
var EmitterVisitorContext = /** @class */ (function () {
    function EmitterVisitorContext(_indent) {
        this._indent = _indent;
        this._classes = [];
        this._preambleLineCount = 0;
        this._lines = [new _EmittedLine(_indent)];
    }
    EmitterVisitorContext.createRoot = function () { return new EmitterVisitorContext(0); };
    Object.defineProperty(EmitterVisitorContext.prototype, "_currentLine", {
        get: function () { return this._lines[this._lines.length - 1]; },
        enumerable: true,
        configurable: true
    });
    EmitterVisitorContext.prototype.println = function (from, lastPart) {
        if (lastPart === void 0) { lastPart = ''; }
        this.print(from || null, lastPart, true);
    };
    EmitterVisitorContext.prototype.lineIsEmpty = function () { return this._currentLine.parts.length === 0; };
    EmitterVisitorContext.prototype.lineLength = function () {
        return this._currentLine.indent * _INDENT_WITH.length + this._currentLine.partsLength;
    };
    EmitterVisitorContext.prototype.print = function (from, part, newLine) {
        if (newLine === void 0) { newLine = false; }
        if (part.length > 0) {
            this._currentLine.parts.push(part);
            this._currentLine.partsLength += part.length;
            this._currentLine.srcSpans.push(from && from.sourceSpan || null);
        }
        if (newLine) {
            this._lines.push(new _EmittedLine(this._indent));
        }
    };
    EmitterVisitorContext.prototype.removeEmptyLastLine = function () {
        if (this.lineIsEmpty()) {
            this._lines.pop();
        }
    };
    EmitterVisitorContext.prototype.incIndent = function () {
        this._indent++;
        if (this.lineIsEmpty()) {
            this._currentLine.indent = this._indent;
        }
    };
    EmitterVisitorContext.prototype.decIndent = function () {
        this._indent--;
        if (this.lineIsEmpty()) {
            this._currentLine.indent = this._indent;
        }
    };
    EmitterVisitorContext.prototype.pushClass = function (clazz) { this._classes.push(clazz); };
    EmitterVisitorContext.prototype.popClass = function () { return this._classes.pop(); };
    Object.defineProperty(EmitterVisitorContext.prototype, "currentClass", {
        get: function () {
            return this._classes.length > 0 ? this._classes[this._classes.length - 1] : null;
        },
        enumerable: true,
        configurable: true
    });
    EmitterVisitorContext.prototype.toSource = function () {
        return this.sourceLines
            .map(function (l) { return l.parts.length > 0 ? _createIndent(l.indent) + l.parts.join('') : ''; })
            .join('\n');
    };
    EmitterVisitorContext.prototype.toSourceMapGenerator = function (genFilePath, startsAtLine) {
        if (startsAtLine === void 0) { startsAtLine = 0; }
        var map = new SourceMapGenerator(genFilePath);
        var firstOffsetMapped = false;
        var mapFirstOffsetIfNeeded = function () {
            if (!firstOffsetMapped) {
                // Add a single space so that tools won't try to load the file from disk.
                // Note: We are using virtual urls like `ng:///`, so we have to
                // provide a content here.
                map.addSource(genFilePath, ' ').addMapping(0, genFilePath, 0, 0);
                firstOffsetMapped = true;
            }
        };
        for (var i = 0; i < startsAtLine; i++) {
            map.addLine();
            mapFirstOffsetIfNeeded();
        }
        this.sourceLines.forEach(function (line, lineIdx) {
            map.addLine();
            var spans = line.srcSpans;
            var parts = line.parts;
            var col0 = line.indent * _INDENT_WITH.length;
            var spanIdx = 0;
            // skip leading parts without source spans
            while (spanIdx < spans.length && !spans[spanIdx]) {
                col0 += parts[spanIdx].length;
                spanIdx++;
            }
            if (spanIdx < spans.length && lineIdx === 0 && col0 === 0) {
                firstOffsetMapped = true;
            }
            else {
                mapFirstOffsetIfNeeded();
            }
            while (spanIdx < spans.length) {
                var span = spans[spanIdx];
                var source = span.start.file;
                var sourceLine = span.start.line;
                var sourceCol = span.start.col;
                map.addSource(source.url, source.content)
                    .addMapping(col0, source.url, sourceLine, sourceCol);
                col0 += parts[spanIdx].length;
                spanIdx++;
                // assign parts without span or the same span to the previous segment
                while (spanIdx < spans.length && (span === spans[spanIdx] || !spans[spanIdx])) {
                    col0 += parts[spanIdx].length;
                    spanIdx++;
                }
            }
        });
        return map;
    };
    EmitterVisitorContext.prototype.setPreambleLineCount = function (count) { return this._preambleLineCount = count; };
    EmitterVisitorContext.prototype.spanOf = function (line, column) {
        var emittedLine = this._lines[line - this._preambleLineCount];
        if (emittedLine) {
            var columnsLeft = column - _createIndent(emittedLine.indent).length;
            for (var partIndex = 0; partIndex < emittedLine.parts.length; partIndex++) {
                var part = emittedLine.parts[partIndex];
                if (part.length > columnsLeft) {
                    return emittedLine.srcSpans[partIndex];
                }
                columnsLeft -= part.length;
            }
        }
        return null;
    };
    Object.defineProperty(EmitterVisitorContext.prototype, "sourceLines", {
        get: function () {
            if (this._lines.length && this._lines[this._lines.length - 1].parts.length === 0) {
                return this._lines.slice(0, -1);
            }
            return this._lines;
        },
        enumerable: true,
        configurable: true
    });
    return EmitterVisitorContext;
}());
export { EmitterVisitorContext };
var AbstractEmitterVisitor = /** @class */ (function () {
    function AbstractEmitterVisitor(_escapeDollarInStrings) {
        this._escapeDollarInStrings = _escapeDollarInStrings;
    }
    AbstractEmitterVisitor.prototype.visitExpressionStmt = function (stmt, ctx) {
        stmt.expr.visitExpression(this, ctx);
        ctx.println(stmt, ';');
        return null;
    };
    AbstractEmitterVisitor.prototype.visitReturnStmt = function (stmt, ctx) {
        ctx.print(stmt, "return ");
        stmt.value.visitExpression(this, ctx);
        ctx.println(stmt, ';');
        return null;
    };
    AbstractEmitterVisitor.prototype.visitIfStmt = function (stmt, ctx) {
        ctx.print(stmt, "if (");
        stmt.condition.visitExpression(this, ctx);
        ctx.print(stmt, ") {");
        var hasElseCase = stmt.falseCase != null && stmt.falseCase.length > 0;
        if (stmt.trueCase.length <= 1 && !hasElseCase) {
            ctx.print(stmt, " ");
            this.visitAllStatements(stmt.trueCase, ctx);
            ctx.removeEmptyLastLine();
            ctx.print(stmt, " ");
        }
        else {
            ctx.println();
            ctx.incIndent();
            this.visitAllStatements(stmt.trueCase, ctx);
            ctx.decIndent();
            if (hasElseCase) {
                ctx.println(stmt, "} else {");
                ctx.incIndent();
                this.visitAllStatements(stmt.falseCase, ctx);
                ctx.decIndent();
            }
        }
        ctx.println(stmt, "}");
        return null;
    };
    AbstractEmitterVisitor.prototype.visitThrowStmt = function (stmt, ctx) {
        ctx.print(stmt, "throw ");
        stmt.error.visitExpression(this, ctx);
        ctx.println(stmt, ";");
        return null;
    };
    AbstractEmitterVisitor.prototype.visitCommentStmt = function (stmt, ctx) {
        if (stmt.multiline) {
            ctx.println(stmt, "/* " + stmt.comment + " */");
        }
        else {
            stmt.comment.split('\n').forEach(function (line) { ctx.println(stmt, "// " + line); });
        }
        return null;
    };
    AbstractEmitterVisitor.prototype.visitJSDocCommentStmt = function (stmt, ctx) {
        ctx.println(stmt, "/*" + stmt.toString() + "*/");
        return null;
    };
    AbstractEmitterVisitor.prototype.visitWriteVarExpr = function (expr, ctx) {
        var lineWasEmpty = ctx.lineIsEmpty();
        if (!lineWasEmpty) {
            ctx.print(expr, '(');
        }
        ctx.print(expr, expr.name + " = ");
        expr.value.visitExpression(this, ctx);
        if (!lineWasEmpty) {
            ctx.print(expr, ')');
        }
        return null;
    };
    AbstractEmitterVisitor.prototype.visitWriteKeyExpr = function (expr, ctx) {
        var lineWasEmpty = ctx.lineIsEmpty();
        if (!lineWasEmpty) {
            ctx.print(expr, '(');
        }
        expr.receiver.visitExpression(this, ctx);
        ctx.print(expr, "[");
        expr.index.visitExpression(this, ctx);
        ctx.print(expr, "] = ");
        expr.value.visitExpression(this, ctx);
        if (!lineWasEmpty) {
            ctx.print(expr, ')');
        }
        return null;
    };
    AbstractEmitterVisitor.prototype.visitWritePropExpr = function (expr, ctx) {
        var lineWasEmpty = ctx.lineIsEmpty();
        if (!lineWasEmpty) {
            ctx.print(expr, '(');
        }
        expr.receiver.visitExpression(this, ctx);
        ctx.print(expr, "." + expr.name + " = ");
        expr.value.visitExpression(this, ctx);
        if (!lineWasEmpty) {
            ctx.print(expr, ')');
        }
        return null;
    };
    AbstractEmitterVisitor.prototype.visitInvokeMethodExpr = function (expr, ctx) {
        expr.receiver.visitExpression(this, ctx);
        var name = expr.name;
        if (expr.builtin != null) {
            name = this.getBuiltinMethodName(expr.builtin);
            if (name == null) {
                // some builtins just mean to skip the call.
                return null;
            }
        }
        ctx.print(expr, "." + name + "(");
        this.visitAllExpressions(expr.args, ctx, ",");
        ctx.print(expr, ")");
        return null;
    };
    AbstractEmitterVisitor.prototype.visitInvokeFunctionExpr = function (expr, ctx) {
        expr.fn.visitExpression(this, ctx);
        ctx.print(expr, "(");
        this.visitAllExpressions(expr.args, ctx, ',');
        ctx.print(expr, ")");
        return null;
    };
    AbstractEmitterVisitor.prototype.visitWrappedNodeExpr = function (ast, ctx) {
        throw new Error('Abstract emitter cannot visit WrappedNodeExpr.');
    };
    AbstractEmitterVisitor.prototype.visitTypeofExpr = function (expr, ctx) {
        ctx.print(expr, 'typeof ');
        expr.expr.visitExpression(this, ctx);
    };
    AbstractEmitterVisitor.prototype.visitReadVarExpr = function (ast, ctx) {
        var varName = ast.name;
        if (ast.builtin != null) {
            switch (ast.builtin) {
                case o.BuiltinVar.Super:
                    varName = 'super';
                    break;
                case o.BuiltinVar.This:
                    varName = 'this';
                    break;
                case o.BuiltinVar.CatchError:
                    varName = CATCH_ERROR_VAR.name;
                    break;
                case o.BuiltinVar.CatchStack:
                    varName = CATCH_STACK_VAR.name;
                    break;
                default:
                    throw new Error("Unknown builtin variable " + ast.builtin);
            }
        }
        ctx.print(ast, varName);
        return null;
    };
    AbstractEmitterVisitor.prototype.visitInstantiateExpr = function (ast, ctx) {
        ctx.print(ast, "new ");
        ast.classExpr.visitExpression(this, ctx);
        ctx.print(ast, "(");
        this.visitAllExpressions(ast.args, ctx, ',');
        ctx.print(ast, ")");
        return null;
    };
    AbstractEmitterVisitor.prototype.visitLiteralExpr = function (ast, ctx) {
        var value = ast.value;
        if (typeof value === 'string') {
            ctx.print(ast, escapeIdentifier(value, this._escapeDollarInStrings));
        }
        else {
            ctx.print(ast, "" + value);
        }
        return null;
    };
    AbstractEmitterVisitor.prototype.visitConditionalExpr = function (ast, ctx) {
        ctx.print(ast, "(");
        ast.condition.visitExpression(this, ctx);
        ctx.print(ast, '? ');
        ast.trueCase.visitExpression(this, ctx);
        ctx.print(ast, ': ');
        ast.falseCase.visitExpression(this, ctx);
        ctx.print(ast, ")");
        return null;
    };
    AbstractEmitterVisitor.prototype.visitNotExpr = function (ast, ctx) {
        ctx.print(ast, '!');
        ast.condition.visitExpression(this, ctx);
        return null;
    };
    AbstractEmitterVisitor.prototype.visitAssertNotNullExpr = function (ast, ctx) {
        ast.condition.visitExpression(this, ctx);
        return null;
    };
    AbstractEmitterVisitor.prototype.visitBinaryOperatorExpr = function (ast, ctx) {
        var opStr;
        switch (ast.operator) {
            case o.BinaryOperator.Equals:
                opStr = '==';
                break;
            case o.BinaryOperator.Identical:
                opStr = '===';
                break;
            case o.BinaryOperator.NotEquals:
                opStr = '!=';
                break;
            case o.BinaryOperator.NotIdentical:
                opStr = '!==';
                break;
            case o.BinaryOperator.And:
                opStr = '&&';
                break;
            case o.BinaryOperator.BitwiseAnd:
                opStr = '&';
                break;
            case o.BinaryOperator.Or:
                opStr = '||';
                break;
            case o.BinaryOperator.Plus:
                opStr = '+';
                break;
            case o.BinaryOperator.Minus:
                opStr = '-';
                break;
            case o.BinaryOperator.Divide:
                opStr = '/';
                break;
            case o.BinaryOperator.Multiply:
                opStr = '*';
                break;
            case o.BinaryOperator.Modulo:
                opStr = '%';
                break;
            case o.BinaryOperator.Lower:
                opStr = '<';
                break;
            case o.BinaryOperator.LowerEquals:
                opStr = '<=';
                break;
            case o.BinaryOperator.Bigger:
                opStr = '>';
                break;
            case o.BinaryOperator.BiggerEquals:
                opStr = '>=';
                break;
            default:
                throw new Error("Unknown operator " + ast.operator);
        }
        if (ast.parens)
            ctx.print(ast, "(");
        ast.lhs.visitExpression(this, ctx);
        ctx.print(ast, " " + opStr + " ");
        ast.rhs.visitExpression(this, ctx);
        if (ast.parens)
            ctx.print(ast, ")");
        return null;
    };
    AbstractEmitterVisitor.prototype.visitReadPropExpr = function (ast, ctx) {
        ast.receiver.visitExpression(this, ctx);
        ctx.print(ast, ".");
        ctx.print(ast, ast.name);
        return null;
    };
    AbstractEmitterVisitor.prototype.visitReadKeyExpr = function (ast, ctx) {
        ast.receiver.visitExpression(this, ctx);
        ctx.print(ast, "[");
        ast.index.visitExpression(this, ctx);
        ctx.print(ast, "]");
        return null;
    };
    AbstractEmitterVisitor.prototype.visitLiteralArrayExpr = function (ast, ctx) {
        ctx.print(ast, "[");
        this.visitAllExpressions(ast.entries, ctx, ',');
        ctx.print(ast, "]");
        return null;
    };
    AbstractEmitterVisitor.prototype.visitLiteralMapExpr = function (ast, ctx) {
        var _this = this;
        ctx.print(ast, "{");
        this.visitAllObjects(function (entry) {
            ctx.print(ast, escapeIdentifier(entry.key, _this._escapeDollarInStrings, entry.quoted) + ":");
            entry.value.visitExpression(_this, ctx);
        }, ast.entries, ctx, ',');
        ctx.print(ast, "}");
        return null;
    };
    AbstractEmitterVisitor.prototype.visitCommaExpr = function (ast, ctx) {
        ctx.print(ast, '(');
        this.visitAllExpressions(ast.parts, ctx, ',');
        ctx.print(ast, ')');
        return null;
    };
    AbstractEmitterVisitor.prototype.visitAllExpressions = function (expressions, ctx, separator) {
        var _this = this;
        this.visitAllObjects(function (expr) { return expr.visitExpression(_this, ctx); }, expressions, ctx, separator);
    };
    AbstractEmitterVisitor.prototype.visitAllObjects = function (handler, expressions, ctx, separator) {
        var incrementedIndent = false;
        for (var i = 0; i < expressions.length; i++) {
            if (i > 0) {
                if (ctx.lineLength() > 80) {
                    ctx.print(null, separator, true);
                    if (!incrementedIndent) {
                        // continuation are marked with double indent.
                        ctx.incIndent();
                        ctx.incIndent();
                        incrementedIndent = true;
                    }
                }
                else {
                    ctx.print(null, separator, false);
                }
            }
            handler(expressions[i]);
        }
        if (incrementedIndent) {
            // continuation are marked with double indent.
            ctx.decIndent();
            ctx.decIndent();
        }
    };
    AbstractEmitterVisitor.prototype.visitAllStatements = function (statements, ctx) {
        var _this = this;
        statements.forEach(function (stmt) { return stmt.visitStatement(_this, ctx); });
    };
    return AbstractEmitterVisitor;
}());
export { AbstractEmitterVisitor };
export function escapeIdentifier(input, escapeDollar, alwaysQuote) {
    if (alwaysQuote === void 0) { alwaysQuote = true; }
    if (input == null) {
        return null;
    }
    var body = input.replace(_SINGLE_QUOTE_ESCAPE_STRING_RE, function () {
        var match = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            match[_i] = arguments[_i];
        }
        if (match[0] == '$') {
            return escapeDollar ? '\\$' : '$';
        }
        else if (match[0] == '\n') {
            return '\\n';
        }
        else if (match[0] == '\r') {
            return '\\r';
        }
        else {
            return "\\" + match[0];
        }
    });
    var requiresQuotes = alwaysQuote || !_LEGAL_IDENTIFIER_RE.test(body);
    return requiresQuotes ? "'" + body + "'" : body;
}
function _createIndent(count) {
    var res = '';
    for (var i = 0; i < count; i++) {
        res += _INDENT_WITH;
    }
    return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9vdXRwdXQvYWJzdHJhY3RfZW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEtBQUssQ0FBQyxNQUFNLGNBQWMsQ0FBQztBQUNsQyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFaEQsSUFBTSw4QkFBOEIsR0FBRyxnQkFBZ0IsQ0FBQztBQUN4RCxJQUFNLG9CQUFvQixHQUFHLHVCQUF1QixDQUFDO0FBQ3JELElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQztBQUMxQixNQUFNLENBQUMsSUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxJQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFNL0Q7SUFJRSxzQkFBbUIsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFIakMsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFDaEIsVUFBSyxHQUFhLEVBQUUsQ0FBQztRQUNyQixhQUFRLEdBQTZCLEVBQUUsQ0FBQztJQUNKLENBQUM7SUFDdkMsbUJBQUM7QUFBRCxDQUFDLEFBTEQsSUFLQztBQUVEO0lBT0UsK0JBQW9CLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBSDNCLGFBQVEsR0FBa0IsRUFBRSxDQUFDO1FBQzdCLHVCQUFrQixHQUFHLENBQUMsQ0FBQztRQUVRLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQU41RSxnQ0FBVSxH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Q0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNO2dCQUMxQixLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNiLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxTQUFTO2dCQUM3QixLQUFLLEdBQUcsS0FBSyxDQUFDO2dCQUNkLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxTQUFTO2dCQUM3QixLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNiLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxZQUFZO2dCQUNoQyxLQUFLLEdBQUcsS0FBSyxDQUFDO2dCQUNkLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHO2dCQUN2QixLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNiLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxVQUFVO2dCQUM5QixLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUNaLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUN0QixLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNiLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJO2dCQUN4QixLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUNaLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLO2dCQUN6QixLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUNaLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNO2dCQUMxQixLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUNaLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxRQUFRO2dCQUM1QixLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUNaLEtBQUssQ0FBQztZ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QUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzdDLENBQUM7QUFFRCx1QkFBdUIsS0FBYTtJQUNsQyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDYixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQy9CLEdBQUcsSUFBSSxZQUFZLENBQUM7SUFDdEIsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXRfYXN0JztcbmltcG9ydCB7U291cmNlTWFwR2VuZXJhdG9yfSBmcm9tICcuL3NvdXJjZV9tYXAnO1xuXG5jb25zdCBfU0lOR0xFX1FVT1RFX0VTQ0FQRV9TVFJJTkdfUkUgPSAvJ3xcXFxcfFxcbnxcXHJ8XFwkL2c7XG5jb25zdCBfTEVHQUxfSURFTlRJRklFUl9SRSA9IC9eWyRBLVpfXVswLTlBLVpfJF0qJC9pO1xuY29uc3QgX0lOREVOVF9XSVRIID0gJyAgJztcbmV4cG9ydCBjb25zdCBDQVRDSF9FUlJPUl9WQVIgPSBvLnZhcmlhYmxlKCdlcnJvcicsIG51bGwsIG51bGwpO1xuZXhwb3J0IGNvbnN0IENBVENIX1NUQUNLX1ZBUiA9IG8udmFyaWFibGUoJ3N0YWNrJywgbnVsbCwgbnVsbCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3V0cHV0RW1pdHRlciB7XG4gIGVtaXRTdGF0ZW1lbnRzKGdlbkZpbGVQYXRoOiBzdHJpbmcsIHN0bXRzOiBvLlN0YXRlbWVudFtdLCBwcmVhbWJsZT86IHN0cmluZ3xudWxsKTogc3RyaW5nO1xufVxuXG5jbGFzcyBfRW1pdHRlZExpbmUge1xuICBwYXJ0c0xlbmd0aCA9IDA7XG4gIHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICBzcmNTcGFuczogKFBhcnNlU291cmNlU3BhbnxudWxsKVtdID0gW107XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRlbnQ6IG51bWJlcikge31cbn1cblxuZXhwb3J0IGNsYXNzIEVtaXR0ZXJWaXNpdG9yQ29udGV4dCB7XG4gIHN0YXRpYyBjcmVhdGVSb290KCk6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCB7IHJldHVybiBuZXcgRW1pdHRlclZpc2l0b3JDb250ZXh0KDApOyB9XG5cbiAgcHJpdmF0ZSBfbGluZXM6IF9FbWl0dGVkTGluZVtdO1xuICBwcml2YXRlIF9jbGFzc2VzOiBvLkNsYXNzU3RtdFtdID0gW107XG4gIHByaXZhdGUgX3ByZWFtYmxlTGluZUNvdW50ID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pbmRlbnQ6IG51bWJlcikgeyB0aGlzLl9saW5lcyA9IFtuZXcgX0VtaXR0ZWRMaW5lKF9pbmRlbnQpXTsgfVxuXG4gIHByaXZhdGUgZ2V0IF9jdXJyZW50TGluZSgpOiBfRW1pdHRlZExpbmUgeyByZXR1cm4gdGhpcy5fbGluZXNbdGhpcy5fbGluZXMubGVuZ3RoIC0gMV07IH1cblxuICBwcmludGxuKGZyb20/OiB7c291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbH18bnVsbCwgbGFzdFBhcnQ6IHN0cmluZyA9ICcnKTogdm9pZCB7XG4gICAgdGhpcy5wcmludChmcm9tIHx8IG51bGwsIGxhc3RQYXJ0LCB0cnVlKTtcbiAgfVxuXG4gIGxpbmVJc0VtcHR5KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fY3VycmVudExpbmUucGFydHMubGVuZ3RoID09PSAwOyB9XG5cbiAgbGluZUxlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50TGluZS5pbmRlbnQgKiBfSU5ERU5UX1dJVEgubGVuZ3RoICsgdGhpcy5fY3VycmVudExpbmUucGFydHNMZW5ndGg7XG4gIH1cblxuICBwcmludChmcm9tOiB7c291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbH18bnVsbCwgcGFydDogc3RyaW5nLCBuZXdMaW5lOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBpZiAocGFydC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9jdXJyZW50TGluZS5wYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgdGhpcy5fY3VycmVudExpbmUucGFydHNMZW5ndGggKz0gcGFydC5sZW5ndGg7XG4gICAgICB0aGlzLl9jdXJyZW50TGluZS5zcmNTcGFucy5wdXNoKGZyb20gJiYgZnJvbS5zb3VyY2VTcGFuIHx8IG51bGwpO1xuICAgIH1cbiAgICBpZiAobmV3TGluZSkge1xuICAgICAgdGhpcy5fbGluZXMucHVzaChuZXcgX0VtaXR0ZWRMaW5lKHRoaXMuX2luZGVudCkpO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUVtcHR5TGFzdExpbmUoKSB7XG4gICAgaWYgKHRoaXMubGluZUlzRW1wdHkoKSkge1xuICAgICAgdGhpcy5fbGluZXMucG9wKCk7XG4gICAgfVxuICB9XG5cbiAgaW5jSW5kZW50KCkge1xuICAgIHRoaXMuX2luZGVudCsrO1xuICAgIGlmICh0aGlzLmxpbmVJc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRMaW5lLmluZGVudCA9IHRoaXMuX2luZGVudDtcbiAgICB9XG4gIH1cblxuICBkZWNJbmRlbnQoKSB7XG4gICAgdGhpcy5faW5kZW50LS07XG4gICAgaWYgKHRoaXMubGluZUlzRW1wdHkoKSkge1xuICAgICAgdGhpcy5fY3VycmVudExpbmUuaW5kZW50ID0gdGhpcy5faW5kZW50O1xuICAgIH1cbiAgfVxuXG4gIHB1c2hDbGFzcyhjbGF6ejogby5DbGFzc1N0bXQpIHsgdGhpcy5fY2xhc3Nlcy5wdXNoKGNsYXp6KTsgfVxuXG4gIHBvcENsYXNzKCk6IG8uQ2xhc3NTdG10IHsgcmV0dXJuIHRoaXMuX2NsYXNzZXMucG9wKCkgITsgfVxuXG4gIGdldCBjdXJyZW50Q2xhc3MoKTogby5DbGFzc1N0bXR8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2NsYXNzZXMubGVuZ3RoID4gMCA/IHRoaXMuX2NsYXNzZXNbdGhpcy5fY2xhc3Nlcy5sZW5ndGggLSAxXSA6IG51bGw7XG4gIH1cblxuICB0b1NvdXJjZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZUxpbmVzXG4gICAgICAgIC5tYXAobCA9PiBsLnBhcnRzLmxlbmd0aCA+IDAgPyBfY3JlYXRlSW5kZW50KGwuaW5kZW50KSArIGwucGFydHMuam9pbignJykgOiAnJylcbiAgICAgICAgLmpvaW4oJ1xcbicpO1xuICB9XG5cbiAgdG9Tb3VyY2VNYXBHZW5lcmF0b3IoZ2VuRmlsZVBhdGg6IHN0cmluZywgc3RhcnRzQXRMaW5lOiBudW1iZXIgPSAwKTogU291cmNlTWFwR2VuZXJhdG9yIHtcbiAgICBjb25zdCBtYXAgPSBuZXcgU291cmNlTWFwR2VuZXJhdG9yKGdlbkZpbGVQYXRoKTtcblxuICAgIGxldCBmaXJzdE9mZnNldE1hcHBlZCA9IGZhbHNlO1xuICAgIGNvbnN0IG1hcEZpcnN0T2Zmc2V0SWZOZWVkZWQgPSAoKSA9PiB7XG4gICAgICBpZiAoIWZpcnN0T2Zmc2V0TWFwcGVkKSB7XG4gICAgICAgIC8vIEFkZCBhIHNpbmdsZSBzcGFjZSBzbyB0aGF0IHRvb2xzIHdvbid0IHRyeSB0byBsb2FkIHRoZSBmaWxlIGZyb20gZGlzay5cbiAgICAgICAgLy8gTm90ZTogV2UgYXJlIHVzaW5nIHZpcnR1YWwgdXJscyBsaWtlIGBuZzovLy9gLCBzbyB3ZSBoYXZlIHRvXG4gICAgICAgIC8vIHByb3ZpZGUgYSBjb250ZW50IGhlcmUuXG4gICAgICAgIG1hcC5hZGRTb3VyY2UoZ2VuRmlsZVBhdGgsICcgJykuYWRkTWFwcGluZygwLCBnZW5GaWxlUGF0aCwgMCwgMCk7XG4gICAgICAgIGZpcnN0T2Zmc2V0TWFwcGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGFydHNBdExpbmU7IGkrKykge1xuICAgICAgbWFwLmFkZExpbmUoKTtcbiAgICAgIG1hcEZpcnN0T2Zmc2V0SWZOZWVkZWQoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNvdXJjZUxpbmVzLmZvckVhY2goKGxpbmUsIGxpbmVJZHgpID0+IHtcbiAgICAgIG1hcC5hZGRMaW5lKCk7XG5cbiAgICAgIGNvbnN0IHNwYW5zID0gbGluZS5zcmNTcGFucztcbiAgICAgIGNvbnN0IHBhcnRzID0gbGluZS5wYXJ0cztcbiAgICAgIGxldCBjb2wwID0gbGluZS5pbmRlbnQgKiBfSU5ERU5UX1dJVEgubGVuZ3RoO1xuICAgICAgbGV0IHNwYW5JZHggPSAwO1xuICAgICAgLy8gc2tpcCBsZWFkaW5nIHBhcnRzIHdpdGhvdXQgc291cmNlIHNwYW5zXG4gICAgICB3aGlsZSAoc3BhbklkeCA8IHNwYW5zLmxlbmd0aCAmJiAhc3BhbnNbc3BhbklkeF0pIHtcbiAgICAgICAgY29sMCArPSBwYXJ0c1tzcGFuSWR4XS5sZW5ndGg7XG4gICAgICAgIHNwYW5JZHgrKztcbiAgICAgIH1cbiAgICAgIGlmIChzcGFuSWR4IDwgc3BhbnMubGVuZ3RoICYmIGxpbmVJZHggPT09IDAgJiYgY29sMCA9PT0gMCkge1xuICAgICAgICBmaXJzdE9mZnNldE1hcHBlZCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXBGaXJzdE9mZnNldElmTmVlZGVkKCk7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChzcGFuSWR4IDwgc3BhbnMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHNwYW4gPSBzcGFuc1tzcGFuSWR4XSAhO1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBzcGFuLnN0YXJ0LmZpbGU7XG4gICAgICAgIGNvbnN0IHNvdXJjZUxpbmUgPSBzcGFuLnN0YXJ0LmxpbmU7XG4gICAgICAgIGNvbnN0IHNvdXJjZUNvbCA9IHNwYW4uc3RhcnQuY29sO1xuICAgICAgICBtYXAuYWRkU291cmNlKHNvdXJjZS51cmwsIHNvdXJjZS5jb250ZW50KVxuICAgICAgICAgICAgLmFkZE1hcHBpbmcoY29sMCwgc291cmNlLnVybCwgc291cmNlTGluZSwgc291cmNlQ29sKTtcblxuICAgICAgICBjb2wwICs9IHBhcnRzW3NwYW5JZHhdLmxlbmd0aDtcbiAgICAgICAgc3BhbklkeCsrO1xuXG4gICAgICAgIC8vIGFzc2lnbiBwYXJ0cyB3aXRob3V0IHNwYW4gb3IgdGhlIHNhbWUgc3BhbiB0byB0aGUgcHJldmlvdXMgc2VnbWVudFxuICAgICAgICB3aGlsZSAoc3BhbklkeCA8IHNwYW5zLmxlbmd0aCAmJiAoc3BhbiA9PT0gc3BhbnNbc3BhbklkeF0gfHwgIXNwYW5zW3NwYW5JZHhdKSkge1xuICAgICAgICAgIGNvbDAgKz0gcGFydHNbc3BhbklkeF0ubGVuZ3RoO1xuICAgICAgICAgIHNwYW5JZHgrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1hcDtcbiAgfVxuXG4gIHNldFByZWFtYmxlTGluZUNvdW50KGNvdW50OiBudW1iZXIpIHsgcmV0dXJuIHRoaXMuX3ByZWFtYmxlTGluZUNvdW50ID0gY291bnQ7IH1cblxuICBzcGFuT2YobGluZTogbnVtYmVyLCBjb2x1bW46IG51bWJlcik6IFBhcnNlU291cmNlU3BhbnxudWxsIHtcbiAgICBjb25zdCBlbWl0dGVkTGluZSA9IHRoaXMuX2xpbmVzW2xpbmUgLSB0aGlzLl9wcmVhbWJsZUxpbmVDb3VudF07XG4gICAgaWYgKGVtaXR0ZWRMaW5lKSB7XG4gICAgICBsZXQgY29sdW1uc0xlZnQgPSBjb2x1bW4gLSBfY3JlYXRlSW5kZW50KGVtaXR0ZWRMaW5lLmluZGVudCkubGVuZ3RoO1xuICAgICAgZm9yIChsZXQgcGFydEluZGV4ID0gMDsgcGFydEluZGV4IDwgZW1pdHRlZExpbmUucGFydHMubGVuZ3RoOyBwYXJ0SW5kZXgrKykge1xuICAgICAgICBjb25zdCBwYXJ0ID0gZW1pdHRlZExpbmUucGFydHNbcGFydEluZGV4XTtcbiAgICAgICAgaWYgKHBhcnQubGVuZ3RoID4gY29sdW1uc0xlZnQpIHtcbiAgICAgICAgICByZXR1cm4gZW1pdHRlZExpbmUuc3JjU3BhbnNbcGFydEluZGV4XTtcbiAgICAgICAgfVxuICAgICAgICBjb2x1bW5zTGVmdCAtPSBwYXJ0Lmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldCBzb3VyY2VMaW5lcygpOiBfRW1pdHRlZExpbmVbXSB7XG4gICAgaWYgKHRoaXMuX2xpbmVzLmxlbmd0aCAmJiB0aGlzLl9saW5lc1t0aGlzLl9saW5lcy5sZW5ndGggLSAxXS5wYXJ0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLl9saW5lcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9saW5lcztcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RFbWl0dGVyVmlzaXRvciBpbXBsZW1lbnRzIG8uU3RhdGVtZW50VmlzaXRvciwgby5FeHByZXNzaW9uVmlzaXRvciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VzY2FwZURvbGxhckluU3RyaW5nczogYm9vbGVhbikge31cblxuICB2aXNpdEV4cHJlc3Npb25TdG10KHN0bXQ6IG8uRXhwcmVzc2lvblN0YXRlbWVudCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIHN0bXQuZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnRsbihzdG10LCAnOycpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRSZXR1cm5TdG10KHN0bXQ6IG8uUmV0dXJuU3RhdGVtZW50LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KHN0bXQsIGByZXR1cm4gYCk7XG4gICAgc3RtdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnRsbihzdG10LCAnOycpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYWJzdHJhY3QgdmlzaXRDYXN0RXhwcihhc3Q6IG8uQ2FzdEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcblxuICBhYnN0cmFjdCB2aXNpdERlY2xhcmVDbGFzc1N0bXQoc3RtdDogby5DbGFzc1N0bXQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55O1xuXG4gIHZpc2l0SWZTdG10KHN0bXQ6IG8uSWZTdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KHN0bXQsIGBpZiAoYCk7XG4gICAgc3RtdC5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KHN0bXQsIGApIHtgKTtcbiAgICBjb25zdCBoYXNFbHNlQ2FzZSA9IHN0bXQuZmFsc2VDYXNlICE9IG51bGwgJiYgc3RtdC5mYWxzZUNhc2UubGVuZ3RoID4gMDtcbiAgICBpZiAoc3RtdC50cnVlQ2FzZS5sZW5ndGggPD0gMSAmJiAhaGFzRWxzZUNhc2UpIHtcbiAgICAgIGN0eC5wcmludChzdG10LCBgIGApO1xuICAgICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoc3RtdC50cnVlQ2FzZSwgY3R4KTtcbiAgICAgIGN0eC5yZW1vdmVFbXB0eUxhc3RMaW5lKCk7XG4gICAgICBjdHgucHJpbnQoc3RtdCwgYCBgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnByaW50bG4oKTtcbiAgICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQudHJ1ZUNhc2UsIGN0eCk7XG4gICAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgICBpZiAoaGFzRWxzZUNhc2UpIHtcbiAgICAgICAgY3R4LnByaW50bG4oc3RtdCwgYH0gZWxzZSB7YCk7XG4gICAgICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICAgICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoc3RtdC5mYWxzZUNhc2UsIGN0eCk7XG4gICAgICAgIGN0eC5kZWNJbmRlbnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY3R4LnByaW50bG4oc3RtdCwgYH1gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGFic3RyYWN0IHZpc2l0VHJ5Q2F0Y2hTdG10KHN0bXQ6IG8uVHJ5Q2F0Y2hTdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueTtcblxuICB2aXNpdFRocm93U3RtdChzdG10OiBvLlRocm93U3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGN0eC5wcmludChzdG10LCBgdGhyb3cgYCk7XG4gICAgc3RtdC5lcnJvci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnRsbihzdG10LCBgO2ApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0Q29tbWVudFN0bXQoc3RtdDogby5Db21tZW50U3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGlmIChzdG10Lm11bHRpbGluZSkge1xuICAgICAgY3R4LnByaW50bG4oc3RtdCwgYC8qICR7c3RtdC5jb21tZW50fSAqL2ApO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdG10LmNvbW1lbnQuc3BsaXQoJ1xcbicpLmZvckVhY2goKGxpbmUpID0+IHsgY3R4LnByaW50bG4oc3RtdCwgYC8vICR7bGluZX1gKTsgfSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0SlNEb2NDb21tZW50U3RtdChzdG10OiBvLkpTRG9jQ29tbWVudFN0bXQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KSB7XG4gICAgY3R4LnByaW50bG4oc3RtdCwgYC8qJHtzdG10LnRvU3RyaW5nKCl9Ki9gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGFic3RyYWN0IHZpc2l0RGVjbGFyZVZhclN0bXQoc3RtdDogby5EZWNsYXJlVmFyU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnk7XG5cbiAgdmlzaXRXcml0ZVZhckV4cHIoZXhwcjogby5Xcml0ZVZhckV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjb25zdCBsaW5lV2FzRW1wdHkgPSBjdHgubGluZUlzRW1wdHkoKTtcbiAgICBpZiAoIWxpbmVXYXNFbXB0eSkge1xuICAgICAgY3R4LnByaW50KGV4cHIsICcoJyk7XG4gICAgfVxuICAgIGN0eC5wcmludChleHByLCBgJHtleHByLm5hbWV9ID0gYCk7XG4gICAgZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBpZiAoIWxpbmVXYXNFbXB0eSkge1xuICAgICAgY3R4LnByaW50KGV4cHIsICcpJyk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0V3JpdGVLZXlFeHByKGV4cHI6IG8uV3JpdGVLZXlFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY29uc3QgbGluZVdhc0VtcHR5ID0gY3R4LmxpbmVJc0VtcHR5KCk7XG4gICAgaWYgKCFsaW5lV2FzRW1wdHkpIHtcbiAgICAgIGN0eC5wcmludChleHByLCAnKCcpO1xuICAgIH1cbiAgICBleHByLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludChleHByLCBgW2ApO1xuICAgIGV4cHIuaW5kZXgudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGV4cHIsIGBdID0gYCk7XG4gICAgZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBpZiAoIWxpbmVXYXNFbXB0eSkge1xuICAgICAgY3R4LnByaW50KGV4cHIsICcpJyk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0V3JpdGVQcm9wRXhwcihleHByOiBvLldyaXRlUHJvcEV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjb25zdCBsaW5lV2FzRW1wdHkgPSBjdHgubGluZUlzRW1wdHkoKTtcbiAgICBpZiAoIWxpbmVXYXNFbXB0eSkge1xuICAgICAgY3R4LnByaW50KGV4cHIsICcoJyk7XG4gICAgfVxuICAgIGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGV4cHIsIGAuJHtleHByLm5hbWV9ID0gYCk7XG4gICAgZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBpZiAoIWxpbmVXYXNFbXB0eSkge1xuICAgICAgY3R4LnByaW50KGV4cHIsICcpJyk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0SW52b2tlTWV0aG9kRXhwcihleHByOiBvLkludm9rZU1ldGhvZEV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBleHByLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGxldCBuYW1lID0gZXhwci5uYW1lO1xuICAgIGlmIChleHByLmJ1aWx0aW4gIT0gbnVsbCkge1xuICAgICAgbmFtZSA9IHRoaXMuZ2V0QnVpbHRpbk1ldGhvZE5hbWUoZXhwci5idWlsdGluKTtcbiAgICAgIGlmIChuYW1lID09IG51bGwpIHtcbiAgICAgICAgLy8gc29tZSBidWlsdGlucyBqdXN0IG1lYW4gdG8gc2tpcCB0aGUgY2FsbC5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGN0eC5wcmludChleHByLCBgLiR7bmFtZX0oYCk7XG4gICAgdGhpcy52aXNpdEFsbEV4cHJlc3Npb25zKGV4cHIuYXJncywgY3R4LCBgLGApO1xuICAgIGN0eC5wcmludChleHByLCBgKWApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYWJzdHJhY3QgZ2V0QnVpbHRpbk1ldGhvZE5hbWUobWV0aG9kOiBvLkJ1aWx0aW5NZXRob2QpOiBzdHJpbmc7XG5cbiAgdmlzaXRJbnZva2VGdW5jdGlvbkV4cHIoZXhwcjogby5JbnZva2VGdW5jdGlvbkV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBleHByLmZuLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludChleHByLCBgKGApO1xuICAgIHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhleHByLmFyZ3MsIGN0eCwgJywnKTtcbiAgICBjdHgucHJpbnQoZXhwciwgYClgKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdFdyYXBwZWROb2RlRXhwcihhc3Q6IG8uV3JhcHBlZE5vZGVFeHByPGFueT4sIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Fic3RyYWN0IGVtaXR0ZXIgY2Fubm90IHZpc2l0IFdyYXBwZWROb2RlRXhwci4nKTtcbiAgfVxuICB2aXNpdFR5cGVvZkV4cHIoZXhwcjogby5UeXBlb2ZFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KGV4cHIsICd0eXBlb2YgJyk7XG4gICAgZXhwci5leHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICB9XG4gIHZpc2l0UmVhZFZhckV4cHIoYXN0OiBvLlJlYWRWYXJFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgbGV0IHZhck5hbWUgPSBhc3QubmFtZSAhO1xuICAgIGlmIChhc3QuYnVpbHRpbiAhPSBudWxsKSB7XG4gICAgICBzd2l0Y2ggKGFzdC5idWlsdGluKSB7XG4gICAgICAgIGNhc2Ugby5CdWlsdGluVmFyLlN1cGVyOlxuICAgICAgICAgIHZhck5hbWUgPSAnc3VwZXInO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIG8uQnVpbHRpblZhci5UaGlzOlxuICAgICAgICAgIHZhck5hbWUgPSAndGhpcyc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugby5CdWlsdGluVmFyLkNhdGNoRXJyb3I6XG4gICAgICAgICAgdmFyTmFtZSA9IENBVENIX0VSUk9SX1ZBUi5uYW1lICE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugby5CdWlsdGluVmFyLkNhdGNoU3RhY2s6XG4gICAgICAgICAgdmFyTmFtZSA9IENBVENIX1NUQUNLX1ZBUi5uYW1lICE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGJ1aWx0aW4gdmFyaWFibGUgJHthc3QuYnVpbHRpbn1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY3R4LnByaW50KGFzdCwgdmFyTmFtZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRJbnN0YW50aWF0ZUV4cHIoYXN0OiBvLkluc3RhbnRpYXRlRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGN0eC5wcmludChhc3QsIGBuZXcgYCk7XG4gICAgYXN0LmNsYXNzRXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnQoYXN0LCBgKGApO1xuICAgIHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhhc3QuYXJncywgY3R4LCAnLCcpO1xuICAgIGN0eC5wcmludChhc3QsIGApYCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdExpdGVyYWxFeHByKGFzdDogby5MaXRlcmFsRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IHZhbHVlID0gYXN0LnZhbHVlO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjdHgucHJpbnQoYXN0LCBlc2NhcGVJZGVudGlmaWVyKHZhbHVlLCB0aGlzLl9lc2NhcGVEb2xsYXJJblN0cmluZ3MpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnByaW50KGFzdCwgYCR7dmFsdWV9YCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYWJzdHJhY3QgdmlzaXRFeHRlcm5hbEV4cHIoYXN0OiBvLkV4dGVybmFsRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnk7XG5cbiAgdmlzaXRDb25kaXRpb25hbEV4cHIoYXN0OiBvLkNvbmRpdGlvbmFsRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGN0eC5wcmludChhc3QsIGAoYCk7XG4gICAgYXN0LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnQoYXN0LCAnPyAnKTtcbiAgICBhc3QudHJ1ZUNhc2UudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGFzdCwgJzogJyk7XG4gICAgYXN0LmZhbHNlQ2FzZSAhLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludChhc3QsIGApYCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXROb3RFeHByKGFzdDogby5Ob3RFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KGFzdCwgJyEnKTtcbiAgICBhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0QXNzZXJ0Tm90TnVsbEV4cHIoYXN0OiBvLkFzc2VydE5vdE51bGwsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGFic3RyYWN0IHZpc2l0RnVuY3Rpb25FeHByKGFzdDogby5GdW5jdGlvbkV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55O1xuICBhYnN0cmFjdCB2aXNpdERlY2xhcmVGdW5jdGlvblN0bXQoc3RtdDogby5EZWNsYXJlRnVuY3Rpb25TdG10LCBjb250ZXh0OiBhbnkpOiBhbnk7XG5cbiAgdmlzaXRCaW5hcnlPcGVyYXRvckV4cHIoYXN0OiBvLkJpbmFyeU9wZXJhdG9yRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGxldCBvcFN0cjogc3RyaW5nO1xuICAgIHN3aXRjaCAoYXN0Lm9wZXJhdG9yKSB7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuRXF1YWxzOlxuICAgICAgICBvcFN0ciA9ICc9PSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLklkZW50aWNhbDpcbiAgICAgICAgb3BTdHIgPSAnPT09JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuTm90RXF1YWxzOlxuICAgICAgICBvcFN0ciA9ICchPSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLk5vdElkZW50aWNhbDpcbiAgICAgICAgb3BTdHIgPSAnIT09JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuQW5kOlxuICAgICAgICBvcFN0ciA9ICcmJic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLkJpdHdpc2VBbmQ6XG4gICAgICAgIG9wU3RyID0gJyYnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5PcjpcbiAgICAgICAgb3BTdHIgPSAnfHwnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5QbHVzOlxuICAgICAgICBvcFN0ciA9ICcrJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuTWludXM6XG4gICAgICAgIG9wU3RyID0gJy0nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5EaXZpZGU6XG4gICAgICAgIG9wU3RyID0gJy8nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5NdWx0aXBseTpcbiAgICAgICAgb3BTdHIgPSAnKic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLk1vZHVsbzpcbiAgICAgICAgb3BTdHIgPSAnJSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLkxvd2VyOlxuICAgICAgICBvcFN0ciA9ICc8JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuTG93ZXJFcXVhbHM6XG4gICAgICAgIG9wU3RyID0gJzw9JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuQmlnZ2VyOlxuICAgICAgICBvcFN0ciA9ICc+JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuQmlnZ2VyRXF1YWxzOlxuICAgICAgICBvcFN0ciA9ICc+PSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG9wZXJhdG9yICR7YXN0Lm9wZXJhdG9yfWApO1xuICAgIH1cbiAgICBpZiAoYXN0LnBhcmVucykgY3R4LnByaW50KGFzdCwgYChgKTtcbiAgICBhc3QubGhzLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludChhc3QsIGAgJHtvcFN0cn0gYCk7XG4gICAgYXN0LnJocy52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBpZiAoYXN0LnBhcmVucykgY3R4LnByaW50KGFzdCwgYClgKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0UmVhZFByb3BFeHByKGFzdDogby5SZWFkUHJvcEV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGFzdCwgYC5gKTtcbiAgICBjdHgucHJpbnQoYXN0LCBhc3QubmFtZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRSZWFkS2V5RXhwcihhc3Q6IG8uUmVhZEtleUV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGFzdCwgYFtgKTtcbiAgICBhc3QuaW5kZXgudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGFzdCwgYF1gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdExpdGVyYWxBcnJheUV4cHIoYXN0OiBvLkxpdGVyYWxBcnJheUV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnQoYXN0LCBgW2ApO1xuICAgIHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhhc3QuZW50cmllcywgY3R4LCAnLCcpO1xuICAgIGN0eC5wcmludChhc3QsIGBdYCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRMaXRlcmFsTWFwRXhwcihhc3Q6IG8uTGl0ZXJhbE1hcEV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnQoYXN0LCBge2ApO1xuICAgIHRoaXMudmlzaXRBbGxPYmplY3RzKGVudHJ5ID0+IHtcbiAgICAgIGN0eC5wcmludChhc3QsIGAke2VzY2FwZUlkZW50aWZpZXIoZW50cnkua2V5LCB0aGlzLl9lc2NhcGVEb2xsYXJJblN0cmluZ3MsIGVudHJ5LnF1b3RlZCl9OmApO1xuICAgICAgZW50cnkudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgfSwgYXN0LmVudHJpZXMsIGN0eCwgJywnKTtcbiAgICBjdHgucHJpbnQoYXN0LCBgfWApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0Q29tbWFFeHByKGFzdDogby5Db21tYUV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnQoYXN0LCAnKCcpO1xuICAgIHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhhc3QucGFydHMsIGN0eCwgJywnKTtcbiAgICBjdHgucHJpbnQoYXN0LCAnKScpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0QWxsRXhwcmVzc2lvbnMoZXhwcmVzc2lvbnM6IG8uRXhwcmVzc2lvbltdLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCwgc2VwYXJhdG9yOiBzdHJpbmcpOlxuICAgICAgdm9pZCB7XG4gICAgdGhpcy52aXNpdEFsbE9iamVjdHMoZXhwciA9PiBleHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpLCBleHByZXNzaW9ucywgY3R4LCBzZXBhcmF0b3IpO1xuICB9XG5cbiAgdmlzaXRBbGxPYmplY3RzPFQ+KFxuICAgICAgaGFuZGxlcjogKHQ6IFQpID0+IHZvaWQsIGV4cHJlc3Npb25zOiBUW10sIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0LFxuICAgICAgc2VwYXJhdG9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgaW5jcmVtZW50ZWRJbmRlbnQgPSBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cHJlc3Npb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgaWYgKGN0eC5saW5lTGVuZ3RoKCkgPiA4MCkge1xuICAgICAgICAgIGN0eC5wcmludChudWxsLCBzZXBhcmF0b3IsIHRydWUpO1xuICAgICAgICAgIGlmICghaW5jcmVtZW50ZWRJbmRlbnQpIHtcbiAgICAgICAgICAgIC8vIGNvbnRpbnVhdGlvbiBhcmUgbWFya2VkIHdpdGggZG91YmxlIGluZGVudC5cbiAgICAgICAgICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICAgICAgICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICAgICAgICAgIGluY3JlbWVudGVkSW5kZW50ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3R4LnByaW50KG51bGwsIHNlcGFyYXRvciwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBoYW5kbGVyKGV4cHJlc3Npb25zW2ldKTtcbiAgICB9XG4gICAgaWYgKGluY3JlbWVudGVkSW5kZW50KSB7XG4gICAgICAvLyBjb250aW51YXRpb24gYXJlIG1hcmtlZCB3aXRoIGRvdWJsZSBpbmRlbnQuXG4gICAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRBbGxTdGF0ZW1lbnRzKHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogdm9pZCB7XG4gICAgc3RhdGVtZW50cy5mb3JFYWNoKChzdG10KSA9PiBzdG10LnZpc2l0U3RhdGVtZW50KHRoaXMsIGN0eCkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVJZGVudGlmaWVyKFxuICAgIGlucHV0OiBzdHJpbmcsIGVzY2FwZURvbGxhcjogYm9vbGVhbiwgYWx3YXlzUXVvdGU6IGJvb2xlYW4gPSB0cnVlKTogYW55IHtcbiAgaWYgKGlucHV0ID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBib2R5ID0gaW5wdXQucmVwbGFjZShfU0lOR0xFX1FVT1RFX0VTQ0FQRV9TVFJJTkdfUkUsICguLi5tYXRjaDogc3RyaW5nW10pID0+IHtcbiAgICBpZiAobWF0Y2hbMF0gPT0gJyQnKSB7XG4gICAgICByZXR1cm4gZXNjYXBlRG9sbGFyID8gJ1xcXFwkJyA6ICckJztcbiAgICB9IGVsc2UgaWYgKG1hdGNoWzBdID09ICdcXG4nKSB7XG4gICAgICByZXR1cm4gJ1xcXFxuJztcbiAgICB9IGVsc2UgaWYgKG1hdGNoWzBdID09ICdcXHInKSB7XG4gICAgICByZXR1cm4gJ1xcXFxyJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBcXFxcJHttYXRjaFswXX1gO1xuICAgIH1cbiAgfSk7XG4gIGNvbnN0IHJlcXVpcmVzUXVvdGVzID0gYWx3YXlzUXVvdGUgfHwgIV9MRUdBTF9JREVOVElGSUVSX1JFLnRlc3QoYm9keSk7XG4gIHJldHVybiByZXF1aXJlc1F1b3RlcyA/IGAnJHtib2R5fSdgIDogYm9keTtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUluZGVudChjb3VudDogbnVtYmVyKTogc3RyaW5nIHtcbiAgbGV0IHJlcyA9ICcnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICByZXMgKz0gX0lOREVOVF9XSVRIO1xuICB9XG4gIHJldHVybiByZXM7XG59XG4iXX0=