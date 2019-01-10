(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/store-devtools/schematics-core/utility/route-utils", ["require", "exports", "typescript", "@ngrx/store-devtools/schematics-core/utility/ast-utils", "@ngrx/store-devtools/schematics-core/utility/change"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var ast_utils_1 = require("@ngrx/store-devtools/schematics-core/utility/ast-utils");
    var change_1 = require("@ngrx/store-devtools/schematics-core/utility/change");
    /**
     * Add Import `import { symbolName } from fileName` if the import doesn't exit
     * already. Assumes fileToEdit can be resolved and accessed.
     * @param fileToEdit (file we want to add import to)
     * @param symbolName (item to import)
     * @param fileName (path to the file)
     * @param isDefault (if true, import follows style for importing default exports)
     * @return Change
     */
    function insertImport(source, fileToEdit, symbolName, fileName, isDefault) {
        if (isDefault === void 0) { isDefault = false; }
        var rootNode = source;
        var allImports = ast_utils_1.findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);
        // get nodes that map to import statements from the file fileName
        var relevantImports = allImports.filter(function (node) {
            // StringLiteral of the ImportDeclaration is the import file (fileName in this case).
            var importFiles = node
                .getChildren()
                .filter(function (child) { return child.kind === ts.SyntaxKind.StringLiteral; })
                .map(function (n) { return n.text; });
            return importFiles.filter(function (file) { return file === fileName; }).length === 1;
        });
        if (relevantImports.length > 0) {
            var importsAsterisk_1 = false;
            // imports from import file
            var imports_1 = [];
            relevantImports.forEach(function (n) {
                Array.prototype.push.apply(imports_1, ast_utils_1.findNodes(n, ts.SyntaxKind.Identifier));
                if (ast_utils_1.findNodes(n, ts.SyntaxKind.AsteriskToken).length > 0) {
                    importsAsterisk_1 = true;
                }
            });
            // if imports * from fileName, don't add symbolName
            if (importsAsterisk_1) {
                return new change_1.NoopChange();
            }
            var importTextNodes = imports_1.filter(function (n) { return n.text === symbolName; });
            // insert import if it's not there
            if (importTextNodes.length === 0) {
                var fallbackPos_1 = ast_utils_1.findNodes(relevantImports[0], ts.SyntaxKind.CloseBraceToken)[0].getStart() ||
                    ast_utils_1.findNodes(relevantImports[0], ts.SyntaxKind.FromKeyword)[0].getStart();
                return ast_utils_1.insertAfterLastOccurrence(imports_1, ", " + symbolName, fileToEdit, fallbackPos_1);
            }
            return new change_1.NoopChange();
        }
        // no such import declaration exists
        var useStrict = ast_utils_1.findNodes(rootNode, ts.SyntaxKind.StringLiteral).filter(function (n) { return n.getText() === 'use strict'; });
        var fallbackPos = 0;
        if (useStrict.length > 0) {
            fallbackPos = useStrict[0].end;
        }
        var open = isDefault ? '' : '{ ';
        var close = isDefault ? '' : ' }';
        // if there are no imports or 'use strict' statement, insert import at beginning of file
        var insertAtBeginning = allImports.length === 0 && useStrict.length === 0;
        var separator = insertAtBeginning ? '' : ';\n';
        var toInsert = separator + "import " + open + symbolName + close +
            (" from '" + fileName + "'" + (insertAtBeginning ? ';\n' : ''));
        return ast_utils_1.insertAfterLastOccurrence(allImports, toInsert, fileToEdit, fallbackPos, ts.SyntaxKind.StringLiteral);
    }
    exports.insertImport = insertImport;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3N0b3JlLWRldnRvb2xzL3NjaGVtYXRpY3MtY29yZS91dGlsaXR5L3JvdXRlLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBQ2pDLG9GQUFtRTtJQUNuRSw4RUFBOEM7SUFFOUM7Ozs7Ozs7O09BUUc7SUFFSCxzQkFDRSxNQUFxQixFQUNyQixVQUFrQixFQUNsQixVQUFrQixFQUNsQixRQUFnQixFQUNoQixTQUFpQjtRQUFqQiwwQkFBQSxFQUFBLGlCQUFpQjtRQUVqQixJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDeEIsSUFBTSxVQUFVLEdBQUcscUJBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRXhFLGlFQUFpRTtRQUNqRSxJQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtZQUM1QyxxRkFBcUY7WUFDckYsSUFBTSxXQUFXLEdBQUcsSUFBSTtpQkFDckIsV0FBVyxFQUFFO2lCQUNiLE1BQU0sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQTFDLENBQTBDLENBQUM7aUJBQzNELEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFDLENBQXNCLENBQUMsSUFBSSxFQUE1QixDQUE0QixDQUFDLENBQUM7WUFFMUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLEtBQUssUUFBUSxFQUFqQixDQUFpQixDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztRQUNwRSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLGlCQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzVCLDJCQUEyQjtZQUMzQixJQUFNLFNBQU8sR0FBYyxFQUFFLENBQUM7WUFDOUIsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7Z0JBQ3ZCLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FDeEIsU0FBTyxFQUNQLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQ3ZDLENBQUM7Z0JBQ0YsRUFBRSxDQUFDLENBQUMscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekQsaUJBQWUsR0FBRyxJQUFJLENBQUM7Z0JBQ3pCLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILG1EQUFtRDtZQUNuRCxFQUFFLENBQUMsQ0FBQyxpQkFBZSxDQUFDLENBQUMsQ0FBQztnQkFDcEIsTUFBTSxDQUFDLElBQUksbUJBQVUsRUFBRSxDQUFDO1lBQzFCLENBQUM7WUFFRCxJQUFNLGVBQWUsR0FBRyxTQUFPLENBQUMsTUFBTSxDQUNwQyxVQUFBLENBQUMsSUFBSSxPQUFDLENBQW1CLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBeEMsQ0FBd0MsQ0FDOUMsQ0FBQztZQUVGLGtDQUFrQztZQUNsQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLElBQU0sYUFBVyxHQUNmLHFCQUFTLENBQ1AsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUNsQixFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FDOUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7b0JBQ2YscUJBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFFekUsTUFBTSxDQUFDLHFDQUF5QixDQUM5QixTQUFPLEVBQ1AsT0FBSyxVQUFZLEVBQ2pCLFVBQVUsRUFDVixhQUFXLENBQ1osQ0FBQztZQUNKLENBQUM7WUFFRCxNQUFNLENBQUMsSUFBSSxtQkFBVSxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVELG9DQUFvQztRQUNwQyxJQUFNLFNBQVMsR0FBRyxxQkFBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FDdkUsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssWUFBWSxFQUE1QixDQUE0QixDQUNsQyxDQUFDO1FBQ0YsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixXQUFXLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNqQyxDQUFDO1FBQ0QsSUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNuQyxJQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3BDLHdGQUF3RjtRQUN4RixJQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQzVFLElBQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNqRCxJQUFNLFFBQVEsR0FDVCxTQUFTLGVBQVUsSUFBSSxHQUFHLFVBQVUsR0FBRyxLQUFPO2FBQ2pELFlBQVUsUUFBUSxVQUFJLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFBLENBQUM7UUFFekQsTUFBTSxDQUFDLHFDQUF5QixDQUM5QixVQUFVLEVBQ1YsUUFBUSxFQUNSLFVBQVUsRUFDVixXQUFXLEVBQ1gsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQzVCLENBQUM7SUFDSixDQUFDO0lBeEZELG9DQXdGQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHsgZmluZE5vZGVzLCBpbnNlcnRBZnRlckxhc3RPY2N1cnJlbmNlIH0gZnJvbSAnLi9hc3QtdXRpbHMnO1xuaW1wb3J0IHsgQ2hhbmdlLCBOb29wQ2hhbmdlIH0gZnJvbSAnLi9jaGFuZ2UnO1xuXG4vKipcbiAqIEFkZCBJbXBvcnQgYGltcG9ydCB7IHN5bWJvbE5hbWUgfSBmcm9tIGZpbGVOYW1lYCBpZiB0aGUgaW1wb3J0IGRvZXNuJ3QgZXhpdFxuICogYWxyZWFkeS4gQXNzdW1lcyBmaWxlVG9FZGl0IGNhbiBiZSByZXNvbHZlZCBhbmQgYWNjZXNzZWQuXG4gKiBAcGFyYW0gZmlsZVRvRWRpdCAoZmlsZSB3ZSB3YW50IHRvIGFkZCBpbXBvcnQgdG8pXG4gKiBAcGFyYW0gc3ltYm9sTmFtZSAoaXRlbSB0byBpbXBvcnQpXG4gKiBAcGFyYW0gZmlsZU5hbWUgKHBhdGggdG8gdGhlIGZpbGUpXG4gKiBAcGFyYW0gaXNEZWZhdWx0IChpZiB0cnVlLCBpbXBvcnQgZm9sbG93cyBzdHlsZSBmb3IgaW1wb3J0aW5nIGRlZmF1bHQgZXhwb3J0cylcbiAqIEByZXR1cm4gQ2hhbmdlXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGluc2VydEltcG9ydChcbiAgc291cmNlOiB0cy5Tb3VyY2VGaWxlLFxuICBmaWxlVG9FZGl0OiBzdHJpbmcsXG4gIHN5bWJvbE5hbWU6IHN0cmluZyxcbiAgZmlsZU5hbWU6IHN0cmluZyxcbiAgaXNEZWZhdWx0ID0gZmFsc2Vcbik6IENoYW5nZSB7XG4gIGNvbnN0IHJvb3ROb2RlID0gc291cmNlO1xuICBjb25zdCBhbGxJbXBvcnRzID0gZmluZE5vZGVzKHJvb3ROb2RlLCB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uKTtcblxuICAvLyBnZXQgbm9kZXMgdGhhdCBtYXAgdG8gaW1wb3J0IHN0YXRlbWVudHMgZnJvbSB0aGUgZmlsZSBmaWxlTmFtZVxuICBjb25zdCByZWxldmFudEltcG9ydHMgPSBhbGxJbXBvcnRzLmZpbHRlcihub2RlID0+IHtcbiAgICAvLyBTdHJpbmdMaXRlcmFsIG9mIHRoZSBJbXBvcnREZWNsYXJhdGlvbiBpcyB0aGUgaW1wb3J0IGZpbGUgKGZpbGVOYW1lIGluIHRoaXMgY2FzZSkuXG4gICAgY29uc3QgaW1wb3J0RmlsZXMgPSBub2RlXG4gICAgICAuZ2V0Q2hpbGRyZW4oKVxuICAgICAgLmZpbHRlcihjaGlsZCA9PiBjaGlsZC5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpXG4gICAgICAubWFwKG4gPT4gKG4gYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dCk7XG5cbiAgICByZXR1cm4gaW1wb3J0RmlsZXMuZmlsdGVyKGZpbGUgPT4gZmlsZSA9PT0gZmlsZU5hbWUpLmxlbmd0aCA9PT0gMTtcbiAgfSk7XG5cbiAgaWYgKHJlbGV2YW50SW1wb3J0cy5sZW5ndGggPiAwKSB7XG4gICAgbGV0IGltcG9ydHNBc3RlcmlzayA9IGZhbHNlO1xuICAgIC8vIGltcG9ydHMgZnJvbSBpbXBvcnQgZmlsZVxuICAgIGNvbnN0IGltcG9ydHM6IHRzLk5vZGVbXSA9IFtdO1xuICAgIHJlbGV2YW50SW1wb3J0cy5mb3JFYWNoKG4gPT4ge1xuICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoXG4gICAgICAgIGltcG9ydHMsXG4gICAgICAgIGZpbmROb2RlcyhuLCB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpXG4gICAgICApO1xuICAgICAgaWYgKGZpbmROb2RlcyhuLCB0cy5TeW50YXhLaW5kLkFzdGVyaXNrVG9rZW4pLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaW1wb3J0c0FzdGVyaXNrID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGlmIGltcG9ydHMgKiBmcm9tIGZpbGVOYW1lLCBkb24ndCBhZGQgc3ltYm9sTmFtZVxuICAgIGlmIChpbXBvcnRzQXN0ZXJpc2spIHtcbiAgICAgIHJldHVybiBuZXcgTm9vcENoYW5nZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGltcG9ydFRleHROb2RlcyA9IGltcG9ydHMuZmlsdGVyKFxuICAgICAgbiA9PiAobiBhcyB0cy5JZGVudGlmaWVyKS50ZXh0ID09PSBzeW1ib2xOYW1lXG4gICAgKTtcblxuICAgIC8vIGluc2VydCBpbXBvcnQgaWYgaXQncyBub3QgdGhlcmVcbiAgICBpZiAoaW1wb3J0VGV4dE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgZmFsbGJhY2tQb3MgPVxuICAgICAgICBmaW5kTm9kZXMoXG4gICAgICAgICAgcmVsZXZhbnRJbXBvcnRzWzBdLFxuICAgICAgICAgIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFjZVRva2VuXG4gICAgICAgIClbMF0uZ2V0U3RhcnQoKSB8fFxuICAgICAgICBmaW5kTm9kZXMocmVsZXZhbnRJbXBvcnRzWzBdLCB0cy5TeW50YXhLaW5kLkZyb21LZXl3b3JkKVswXS5nZXRTdGFydCgpO1xuXG4gICAgICByZXR1cm4gaW5zZXJ0QWZ0ZXJMYXN0T2NjdXJyZW5jZShcbiAgICAgICAgaW1wb3J0cyxcbiAgICAgICAgYCwgJHtzeW1ib2xOYW1lfWAsXG4gICAgICAgIGZpbGVUb0VkaXQsXG4gICAgICAgIGZhbGxiYWNrUG9zXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTm9vcENoYW5nZSgpO1xuICB9XG5cbiAgLy8gbm8gc3VjaCBpbXBvcnQgZGVjbGFyYXRpb24gZXhpc3RzXG4gIGNvbnN0IHVzZVN0cmljdCA9IGZpbmROb2Rlcyhyb290Tm9kZSwgdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKS5maWx0ZXIoXG4gICAgbiA9PiBuLmdldFRleHQoKSA9PT0gJ3VzZSBzdHJpY3QnXG4gICk7XG4gIGxldCBmYWxsYmFja1BvcyA9IDA7XG4gIGlmICh1c2VTdHJpY3QubGVuZ3RoID4gMCkge1xuICAgIGZhbGxiYWNrUG9zID0gdXNlU3RyaWN0WzBdLmVuZDtcbiAgfVxuICBjb25zdCBvcGVuID0gaXNEZWZhdWx0ID8gJycgOiAneyAnO1xuICBjb25zdCBjbG9zZSA9IGlzRGVmYXVsdCA/ICcnIDogJyB9JztcbiAgLy8gaWYgdGhlcmUgYXJlIG5vIGltcG9ydHMgb3IgJ3VzZSBzdHJpY3QnIHN0YXRlbWVudCwgaW5zZXJ0IGltcG9ydCBhdCBiZWdpbm5pbmcgb2YgZmlsZVxuICBjb25zdCBpbnNlcnRBdEJlZ2lubmluZyA9IGFsbEltcG9ydHMubGVuZ3RoID09PSAwICYmIHVzZVN0cmljdC5sZW5ndGggPT09IDA7XG4gIGNvbnN0IHNlcGFyYXRvciA9IGluc2VydEF0QmVnaW5uaW5nID8gJycgOiAnO1xcbic7XG4gIGNvbnN0IHRvSW5zZXJ0ID1cbiAgICBgJHtzZXBhcmF0b3J9aW1wb3J0ICR7b3Blbn0ke3N5bWJvbE5hbWV9JHtjbG9zZX1gICtcbiAgICBgIGZyb20gJyR7ZmlsZU5hbWV9JyR7aW5zZXJ0QXRCZWdpbm5pbmcgPyAnO1xcbicgOiAnJ31gO1xuXG4gIHJldHVybiBpbnNlcnRBZnRlckxhc3RPY2N1cnJlbmNlKFxuICAgIGFsbEltcG9ydHMsXG4gICAgdG9JbnNlcnQsXG4gICAgZmlsZVRvRWRpdCxcbiAgICBmYWxsYmFja1BvcyxcbiAgICB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWxcbiAgKTtcbn1cbiJdfQ==