import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var domino = require('domino');
import { ɵBrowserDomAdapter as BrowserDomAdapter, ɵsetRootDomAdapter as setRootDomAdapter } from '@angular/platform-browser';
function _notImplemented(methodName) {
    return new Error('This method is not implemented in DominoAdapter: ' + methodName);
}
function setDomTypes() {
    // Make all Domino types available as types in the global env.
    Object.assign(global, domino.impl);
    global['KeyboardEvent'] = domino.impl.Event;
}
/**
 * Parses a document string to a Document object.
 */
export function parseDocument(html, url) {
    if (url === void 0) { url = '/'; }
    var window = domino.createWindow(html, url);
    var doc = window.document;
    return doc;
}
/**
 * Serializes a document to string.
 */
export function serializeDocument(doc) {
    return doc.serialize();
}
/**
 * DOM Adapter for the server platform based on https://github.com/fgnass/domino.
 */
var DominoAdapter = /** @class */ (function (_super) {
    tslib_1.__extends(DominoAdapter, _super);
    function DominoAdapter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DominoAdapter.makeCurrent = function () {
        setDomTypes();
        setRootDomAdapter(new DominoAdapter());
    };
    DominoAdapter.prototype.logError = function (error) { console.error(error); };
    DominoAdapter.prototype.log = function (error) {
        // tslint:disable-next-line:no-console
        console.log(error);
    };
    DominoAdapter.prototype.logGroup = function (error) { console.error(error); };
    DominoAdapter.prototype.logGroupEnd = function () { };
    DominoAdapter.prototype.supportsDOMEvents = function () { return false; };
    DominoAdapter.prototype.supportsNativeShadowDOM = function () { return false; };
    DominoAdapter.prototype.contains = function (nodeA, nodeB) {
        var inner = nodeB;
        while (inner) {
            if (inner === nodeA)
                return true;
            inner = inner.parent;
        }
        return false;
    };
    DominoAdapter.prototype.createHtmlDocument = function () {
        return parseDocument('<html><head><title>fakeTitle</title></head><body></body></html>');
    };
    DominoAdapter.prototype.getDefaultDocument = function () {
        if (!DominoAdapter.defaultDoc) {
            DominoAdapter.defaultDoc = domino.createDocument();
        }
        return DominoAdapter.defaultDoc;
    };
    DominoAdapter.prototype.createShadowRoot = function (el, doc) {
        if (doc === void 0) { doc = document; }
        el.shadowRoot = doc.createDocumentFragment();
        el.shadowRoot.parent = el;
        return el.shadowRoot;
    };
    DominoAdapter.prototype.getShadowRoot = function (el) { return el.shadowRoot; };
    DominoAdapter.prototype.isTextNode = function (node) { return node.nodeType === DominoAdapter.defaultDoc.TEXT_NODE; };
    DominoAdapter.prototype.isCommentNode = function (node) {
        return node.nodeType === DominoAdapter.defaultDoc.COMMENT_NODE;
    };
    DominoAdapter.prototype.isElementNode = function (node) {
        return node ? node.nodeType === DominoAdapter.defaultDoc.ELEMENT_NODE : false;
    };
    DominoAdapter.prototype.hasShadowRoot = function (node) { return node.shadowRoot != null; };
    DominoAdapter.prototype.isShadowRoot = function (node) { return this.getShadowRoot(node) == node; };
    DominoAdapter.prototype.getProperty = function (el, name) {
        if (name === 'href') {
            // Domino tries tp resolve href-s which we do not want. Just return the
            // attribute value.
            return this.getAttribute(el, 'href');
        }
        else if (name === 'innerText') {
            // Domino does not support innerText. Just map it to textContent.
            return el.textContent;
        }
        return el[name];
    };
    DominoAdapter.prototype.setProperty = function (el, name, value) {
        if (name === 'href') {
            // Even though the server renderer reflects any properties to attributes
            // map 'href' to attribute just to handle when setProperty is directly called.
            this.setAttribute(el, 'href', value);
        }
        else if (name === 'innerText') {
            // Domino does not support innerText. Just map it to textContent.
            el.textContent = value;
        }
        el[name] = value;
    };
    DominoAdapter.prototype.getGlobalEventTarget = function (doc, target) {
        if (target === 'window') {
            return doc.defaultView;
        }
        if (target === 'document') {
            return doc;
        }
        if (target === 'body') {
            return doc.body;
        }
        return null;
    };
    DominoAdapter.prototype.getBaseHref = function (doc) {
        var base = this.querySelector(doc.documentElement, 'base');
        var href = '';
        if (base) {
            href = this.getHref(base);
        }
        // TODO(alxhub): Need relative path logic from BrowserDomAdapter here?
        return href;
    };
    /** @internal */
    DominoAdapter.prototype._readStyleAttribute = function (element) {
        var styleMap = {};
        var styleAttribute = element.getAttribute('style');
        if (styleAttribute) {
            var styleList = styleAttribute.split(/;+/g);
            for (var i = 0; i < styleList.length; i++) {
                var style = styleList[i].trim();
                if (style.length > 0) {
                    var colonIndex = style.indexOf(':');
                    if (colonIndex === -1) {
                        throw new Error("Invalid CSS style: " + style);
                    }
                    var name_1 = style.substr(0, colonIndex).trim();
                    styleMap[name_1] = style.substr(colonIndex + 1).trim();
                }
            }
        }
        return styleMap;
    };
    /** @internal */
    DominoAdapter.prototype._writeStyleAttribute = function (element, styleMap) {
        var styleAttrValue = '';
        for (var key in styleMap) {
            var newValue = styleMap[key];
            if (newValue) {
                styleAttrValue += key + ':' + styleMap[key] + ';';
            }
        }
        element.setAttribute('style', styleAttrValue);
    };
    DominoAdapter.prototype.setStyle = function (element, styleName, styleValue) {
        styleName = styleName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        var styleMap = this._readStyleAttribute(element);
        styleMap[styleName] = styleValue || '';
        this._writeStyleAttribute(element, styleMap);
    };
    DominoAdapter.prototype.removeStyle = function (element, styleName) {
        // IE requires '' instead of null
        // see https://github.com/angular/angular/issues/7916
        this.setStyle(element, styleName, '');
    };
    DominoAdapter.prototype.getStyle = function (element, styleName) {
        var styleMap = this._readStyleAttribute(element);
        return styleMap[styleName] || '';
    };
    DominoAdapter.prototype.hasStyle = function (element, styleName, styleValue) {
        var value = this.getStyle(element, styleName);
        return styleValue ? value == styleValue : value.length > 0;
    };
    DominoAdapter.prototype.dispatchEvent = function (el, evt) {
        el.dispatchEvent(evt);
        // Dispatch the event to the window also.
        var doc = el.ownerDocument || el;
        var win = doc.defaultView;
        if (win) {
            win.dispatchEvent(evt);
        }
    };
    DominoAdapter.prototype.getHistory = function () { throw _notImplemented('getHistory'); };
    DominoAdapter.prototype.getLocation = function () { throw _notImplemented('getLocation'); };
    DominoAdapter.prototype.getUserAgent = function () { return 'Fake user agent'; };
    DominoAdapter.prototype.supportsWebAnimation = function () { return false; };
    DominoAdapter.prototype.performanceNow = function () { return Date.now(); };
    DominoAdapter.prototype.getAnimationPrefix = function () { return ''; };
    DominoAdapter.prototype.getTransitionEnd = function () { return 'transitionend'; };
    DominoAdapter.prototype.supportsAnimation = function () { return true; };
    DominoAdapter.prototype.getDistributedNodes = function (el) { throw _notImplemented('getDistributedNodes'); };
    DominoAdapter.prototype.supportsCookies = function () { return false; };
    DominoAdapter.prototype.getCookie = function (name) { throw _notImplemented('getCookie'); };
    DominoAdapter.prototype.setCookie = function (name, value) { throw _notImplemented('setCookie'); };
    return DominoAdapter;
}(BrowserDomAdapter));
export { DominoAdapter };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9taW5vX2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1zZXJ2ZXIvc3JjL2RvbWlub19hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFPQSxBQVBBOzs7Ozs7R0FNRztBQUNILElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxPQUFPLEVBQUMsa0JBQWtCLElBQUksaUJBQWlCLEVBQUUsa0JBQWtCLElBQUksaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUUzSCx5QkFBeUIsVUFBa0I7SUFDekMsT0FBTyxJQUFJLEtBQUssQ0FBQyxtREFBbUQsR0FBRyxVQUFVLENBQUMsQ0FBQztBQUNyRixDQUFDO0FBRUQ7SUFDRSw4REFBOEQ7SUFDOUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLE1BQWMsQ0FBQyxlQUFlLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN2RCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLHdCQUF3QixJQUFZLEVBQUUsR0FBUztJQUFULG9CQUFBLEVBQUEsU0FBUztJQUNuRCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM1QyxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQzFCLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSw0QkFBNEIsR0FBYTtJQUM3QyxPQUFRLEdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNsQyxDQUFDO0FBRUQ7O0dBRUc7QUFDSDtJQUFtQyx5Q0FBaUI7SUFBcEQ7O0lBdUxBLENBQUM7SUF0TFEseUJBQVcsR0FBbEI7UUFDRSxX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QUM7SUFFdEYsdUNBQWUsR0FBZixjQUE2QixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDNUMsaUNBQVMsR0FBVCxVQUFVLElBQVksSUFBWSxNQUFNLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkUsaUNBQVMsR0FBVCxVQUFVLElBQVksRUFBRSxLQUFhLElBQUksTUFBTSxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLG9CQUFDO0FBQUQsQ0FBQyxBQXZMRCxDQUFtQyxpQkFBaUIsR0F1TG5EIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuY29uc3QgZG9taW5vID0gcmVxdWlyZSgnZG9taW5vJyk7XG5cbmltcG9ydCB7ybVCcm93c2VyRG9tQWRhcHRlciBhcyBCcm93c2VyRG9tQWRhcHRlciwgybVzZXRSb290RG9tQWRhcHRlciBhcyBzZXRSb290RG9tQWRhcHRlcn0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmZ1bmN0aW9uIF9ub3RJbXBsZW1lbnRlZChtZXRob2ROYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5ldyBFcnJvcignVGhpcyBtZXRob2QgaXMgbm90IGltcGxlbWVudGVkIGluIERvbWlub0FkYXB0ZXI6ICcgKyBtZXRob2ROYW1lKTtcbn1cblxuZnVuY3Rpb24gc2V0RG9tVHlwZXMoKSB7XG4gIC8vIE1ha2UgYWxsIERvbWlubyB0eXBlcyBhdmFpbGFibGUgYXMgdHlwZXMgaW4gdGhlIGdsb2JhbCBlbnYuXG4gIE9iamVjdC5hc3NpZ24oZ2xvYmFsLCBkb21pbm8uaW1wbCk7XG4gIChnbG9iYWwgYXMgYW55KVsnS2V5Ym9hcmRFdmVudCddID0gZG9taW5vLmltcGwuRXZlbnQ7XG59XG5cbi8qKlxuICogUGFyc2VzIGEgZG9jdW1lbnQgc3RyaW5nIHRvIGEgRG9jdW1lbnQgb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VEb2N1bWVudChodG1sOiBzdHJpbmcsIHVybCA9ICcvJykge1xuICBsZXQgd2luZG93ID0gZG9taW5vLmNyZWF0ZVdpbmRvdyhodG1sLCB1cmwpO1xuICBsZXQgZG9jID0gd2luZG93LmRvY3VtZW50O1xuICByZXR1cm4gZG9jO1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZXMgYSBkb2N1bWVudCB0byBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVEb2N1bWVudChkb2M6IERvY3VtZW50KTogc3RyaW5nIHtcbiAgcmV0dXJuIChkb2MgYXMgYW55KS5zZXJpYWxpemUoKTtcbn1cblxuLyoqXG4gKiBET00gQWRhcHRlciBmb3IgdGhlIHNlcnZlciBwbGF0Zm9ybSBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vZmduYXNzL2RvbWluby5cbiAqL1xuZXhwb3J0IGNsYXNzIERvbWlub0FkYXB0ZXIgZXh0ZW5kcyBCcm93c2VyRG9tQWRhcHRlciB7XG4gIHN0YXRpYyBtYWtlQ3VycmVudCgpIHtcbiAgICBzZXREb21UeXBlcygpO1xuICAgIHNldFJvb3REb21BZGFwdGVyKG5ldyBEb21pbm9BZGFwdGVyKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdERvYzogRG9jdW1lbnQ7XG5cbiAgbG9nRXJyb3IoZXJyb3I6IHN0cmluZykgeyBjb25zb2xlLmVycm9yKGVycm9yKTsgfVxuXG4gIGxvZyhlcnJvcjogc3RyaW5nKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cblxuICBsb2dHcm91cChlcnJvcjogc3RyaW5nKSB7IGNvbnNvbGUuZXJyb3IoZXJyb3IpOyB9XG5cbiAgbG9nR3JvdXBFbmQoKSB7fVxuXG4gIHN1cHBvcnRzRE9NRXZlbnRzKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgc3VwcG9ydHNOYXRpdmVTaGFkb3dET00oKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGNvbnRhaW5zKG5vZGVBOiBhbnksIG5vZGVCOiBhbnkpOiBib29sZWFuIHtcbiAgICBsZXQgaW5uZXIgPSBub2RlQjtcbiAgICB3aGlsZSAoaW5uZXIpIHtcbiAgICAgIGlmIChpbm5lciA9PT0gbm9kZUEpIHJldHVybiB0cnVlO1xuICAgICAgaW5uZXIgPSBpbm5lci5wYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNyZWF0ZUh0bWxEb2N1bWVudCgpOiBIVE1MRG9jdW1lbnQge1xuICAgIHJldHVybiBwYXJzZURvY3VtZW50KCc8aHRtbD48aGVhZD48dGl0bGU+ZmFrZVRpdGxlPC90aXRsZT48L2hlYWQ+PGJvZHk+PC9ib2R5PjwvaHRtbD4nKTtcbiAgfVxuXG4gIGdldERlZmF1bHREb2N1bWVudCgpOiBEb2N1bWVudCB7XG4gICAgaWYgKCFEb21pbm9BZGFwdGVyLmRlZmF1bHREb2MpIHtcbiAgICAgIERvbWlub0FkYXB0ZXIuZGVmYXVsdERvYyA9IGRvbWluby5jcmVhdGVEb2N1bWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gRG9taW5vQWRhcHRlci5kZWZhdWx0RG9jO1xuICB9XG5cbiAgY3JlYXRlU2hhZG93Um9vdChlbDogYW55LCBkb2M6IERvY3VtZW50ID0gZG9jdW1lbnQpOiBEb2N1bWVudEZyYWdtZW50IHtcbiAgICBlbC5zaGFkb3dSb290ID0gZG9jLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBlbC5zaGFkb3dSb290LnBhcmVudCA9IGVsO1xuICAgIHJldHVybiBlbC5zaGFkb3dSb290O1xuICB9XG4gIGdldFNoYWRvd1Jvb3QoZWw6IGFueSk6IERvY3VtZW50RnJhZ21lbnQgeyByZXR1cm4gZWwuc2hhZG93Um9vdDsgfVxuXG4gIGlzVGV4dE5vZGUobm9kZTogYW55KTogYm9vbGVhbiB7IHJldHVybiBub2RlLm5vZGVUeXBlID09PSBEb21pbm9BZGFwdGVyLmRlZmF1bHREb2MuVEVYVF9OT0RFOyB9XG4gIGlzQ29tbWVudE5vZGUobm9kZTogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IERvbWlub0FkYXB0ZXIuZGVmYXVsdERvYy5DT01NRU5UX05PREU7XG4gIH1cbiAgaXNFbGVtZW50Tm9kZShub2RlOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbm9kZSA/IG5vZGUubm9kZVR5cGUgPT09IERvbWlub0FkYXB0ZXIuZGVmYXVsdERvYy5FTEVNRU5UX05PREUgOiBmYWxzZTtcbiAgfVxuICBoYXNTaGFkb3dSb290KG5vZGU6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gbm9kZS5zaGFkb3dSb290ICE9IG51bGw7IH1cbiAgaXNTaGFkb3dSb290KG5vZGU6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRTaGFkb3dSb290KG5vZGUpID09IG5vZGU7IH1cblxuICBnZXRQcm9wZXJ0eShlbDogRWxlbWVudCwgbmFtZTogc3RyaW5nKTogYW55IHtcbiAgICBpZiAobmFtZSA9PT0gJ2hyZWYnKSB7XG4gICAgICAvLyBEb21pbm8gdHJpZXMgdHAgcmVzb2x2ZSBocmVmLXMgd2hpY2ggd2UgZG8gbm90IHdhbnQuIEp1c3QgcmV0dXJuIHRoZVxuICAgICAgLy8gYXR0cmlidXRlIHZhbHVlLlxuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKGVsLCAnaHJlZicpO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ2lubmVyVGV4dCcpIHtcbiAgICAgIC8vIERvbWlubyBkb2VzIG5vdCBzdXBwb3J0IGlubmVyVGV4dC4gSnVzdCBtYXAgaXQgdG8gdGV4dENvbnRlbnQuXG4gICAgICByZXR1cm4gZWwudGV4dENvbnRlbnQ7XG4gICAgfVxuICAgIHJldHVybiAoPGFueT5lbClbbmFtZV07XG4gIH1cblxuICBzZXRQcm9wZXJ0eShlbDogRWxlbWVudCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgaWYgKG5hbWUgPT09ICdocmVmJykge1xuICAgICAgLy8gRXZlbiB0aG91Z2ggdGhlIHNlcnZlciByZW5kZXJlciByZWZsZWN0cyBhbnkgcHJvcGVydGllcyB0byBhdHRyaWJ1dGVzXG4gICAgICAvLyBtYXAgJ2hyZWYnIHRvIGF0dHJpYnV0ZSBqdXN0IHRvIGhhbmRsZSB3aGVuIHNldFByb3BlcnR5IGlzIGRpcmVjdGx5IGNhbGxlZC5cbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGVsLCAnaHJlZicsIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdpbm5lclRleHQnKSB7XG4gICAgICAvLyBEb21pbm8gZG9lcyBub3Qgc3VwcG9ydCBpbm5lclRleHQuIEp1c3QgbWFwIGl0IHRvIHRleHRDb250ZW50LlxuICAgICAgZWwudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgICB9XG4gICAgKDxhbnk+ZWwpW25hbWVdID0gdmFsdWU7XG4gIH1cblxuICBnZXRHbG9iYWxFdmVudFRhcmdldChkb2M6IERvY3VtZW50LCB0YXJnZXQ6IHN0cmluZyk6IEV2ZW50VGFyZ2V0fG51bGwge1xuICAgIGlmICh0YXJnZXQgPT09ICd3aW5kb3cnKSB7XG4gICAgICByZXR1cm4gZG9jLmRlZmF1bHRWaWV3O1xuICAgIH1cbiAgICBpZiAodGFyZ2V0ID09PSAnZG9jdW1lbnQnKSB7XG4gICAgICByZXR1cm4gZG9jO1xuICAgIH1cbiAgICBpZiAodGFyZ2V0ID09PSAnYm9keScpIHtcbiAgICAgIHJldHVybiBkb2MuYm9keTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRCYXNlSHJlZihkb2M6IERvY3VtZW50KTogc3RyaW5nIHtcbiAgICBjb25zdCBiYXNlID0gdGhpcy5xdWVyeVNlbGVjdG9yKGRvYy5kb2N1bWVudEVsZW1lbnQsICdiYXNlJyk7XG4gICAgbGV0IGhyZWYgPSAnJztcbiAgICBpZiAoYmFzZSkge1xuICAgICAgaHJlZiA9IHRoaXMuZ2V0SHJlZihiYXNlKTtcbiAgICB9XG4gICAgLy8gVE9ETyhhbHhodWIpOiBOZWVkIHJlbGF0aXZlIHBhdGggbG9naWMgZnJvbSBCcm93c2VyRG9tQWRhcHRlciBoZXJlP1xuICAgIHJldHVybiBocmVmO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVhZFN0eWxlQXR0cmlidXRlKGVsZW1lbnQ6IGFueSk6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSB7XG4gICAgY29uc3Qgc3R5bGVNYXA6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGNvbnN0IHN0eWxlQXR0cmlidXRlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3N0eWxlJyk7XG4gICAgaWYgKHN0eWxlQXR0cmlidXRlKSB7XG4gICAgICBjb25zdCBzdHlsZUxpc3QgPSBzdHlsZUF0dHJpYnV0ZS5zcGxpdCgvOysvZyk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0eWxlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBzdHlsZSA9IHN0eWxlTGlzdFtpXS50cmltKCk7XG4gICAgICAgIGlmIChzdHlsZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgY29sb25JbmRleCA9IHN0eWxlLmluZGV4T2YoJzonKTtcbiAgICAgICAgICBpZiAoY29sb25JbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBDU1Mgc3R5bGU6ICR7c3R5bGV9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5hbWUgPSBzdHlsZS5zdWJzdHIoMCwgY29sb25JbmRleCkudHJpbSgpO1xuICAgICAgICAgIHN0eWxlTWFwW25hbWVdID0gc3R5bGUuc3Vic3RyKGNvbG9uSW5kZXggKyAxKS50cmltKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0eWxlTWFwO1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3dyaXRlU3R5bGVBdHRyaWJ1dGUoZWxlbWVudDogYW55LCBzdHlsZU1hcDoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgbGV0IHN0eWxlQXR0clZhbHVlID0gJyc7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gc3R5bGVNYXApIHtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gc3R5bGVNYXBba2V5XTtcbiAgICAgIGlmIChuZXdWYWx1ZSkge1xuICAgICAgICBzdHlsZUF0dHJWYWx1ZSArPSBrZXkgKyAnOicgKyBzdHlsZU1hcFtrZXldICsgJzsnO1xuICAgICAgfVxuICAgIH1cbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBzdHlsZUF0dHJWYWx1ZSk7XG4gIH1cbiAgc2V0U3R5bGUoZWxlbWVudDogYW55LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZT86IHN0cmluZ3xudWxsKSB7XG4gICAgc3R5bGVOYW1lID0gc3R5bGVOYW1lLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3Qgc3R5bGVNYXAgPSB0aGlzLl9yZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCk7XG4gICAgc3R5bGVNYXBbc3R5bGVOYW1lXSA9IHN0eWxlVmFsdWUgfHwgJyc7XG4gICAgdGhpcy5fd3JpdGVTdHlsZUF0dHJpYnV0ZShlbGVtZW50LCBzdHlsZU1hcCk7XG4gIH1cbiAgcmVtb3ZlU3R5bGUoZWxlbWVudDogYW55LCBzdHlsZU5hbWU6IHN0cmluZykge1xuICAgIC8vIElFIHJlcXVpcmVzICcnIGluc3RlYWQgb2YgbnVsbFxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy83OTE2XG4gICAgdGhpcy5zZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWUsICcnKTtcbiAgfVxuICBnZXRTdHlsZShlbGVtZW50OiBhbnksIHN0eWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBzdHlsZU1hcCA9IHRoaXMuX3JlYWRTdHlsZUF0dHJpYnV0ZShlbGVtZW50KTtcbiAgICByZXR1cm4gc3R5bGVNYXBbc3R5bGVOYW1lXSB8fCAnJztcbiAgfVxuICBoYXNTdHlsZShlbGVtZW50OiBhbnksIHN0eWxlTmFtZTogc3RyaW5nLCBzdHlsZVZhbHVlPzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmdldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZSk7XG4gICAgcmV0dXJuIHN0eWxlVmFsdWUgPyB2YWx1ZSA9PSBzdHlsZVZhbHVlIDogdmFsdWUubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGRpc3BhdGNoRXZlbnQoZWw6IE5vZGUsIGV2dDogYW55KSB7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChldnQpO1xuXG4gICAgLy8gRGlzcGF0Y2ggdGhlIGV2ZW50IHRvIHRoZSB3aW5kb3cgYWxzby5cbiAgICBjb25zdCBkb2MgPSBlbC5vd25lckRvY3VtZW50IHx8IGVsO1xuICAgIGNvbnN0IHdpbiA9IChkb2MgYXMgYW55KS5kZWZhdWx0VmlldztcbiAgICBpZiAod2luKSB7XG4gICAgICB3aW4uZGlzcGF0Y2hFdmVudChldnQpO1xuICAgIH1cbiAgfVxuXG4gIGdldEhpc3RvcnkoKTogSGlzdG9yeSB7IHRocm93IF9ub3RJbXBsZW1lbnRlZCgnZ2V0SGlzdG9yeScpOyB9XG4gIGdldExvY2F0aW9uKCk6IExvY2F0aW9uIHsgdGhyb3cgX25vdEltcGxlbWVudGVkKCdnZXRMb2NhdGlvbicpOyB9XG4gIGdldFVzZXJBZ2VudCgpOiBzdHJpbmcgeyByZXR1cm4gJ0Zha2UgdXNlciBhZ2VudCc7IH1cblxuICBzdXBwb3J0c1dlYkFuaW1hdGlvbigpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHBlcmZvcm1hbmNlTm93KCk6IG51bWJlciB7IHJldHVybiBEYXRlLm5vdygpOyB9XG4gIGdldEFuaW1hdGlvblByZWZpeCgpOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cbiAgZ2V0VHJhbnNpdGlvbkVuZCgpOiBzdHJpbmcgeyByZXR1cm4gJ3RyYW5zaXRpb25lbmQnOyB9XG4gIHN1cHBvcnRzQW5pbWF0aW9uKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuXG4gIGdldERpc3RyaWJ1dGVkTm9kZXMoZWw6IGFueSk6IE5vZGVbXSB7IHRocm93IF9ub3RJbXBsZW1lbnRlZCgnZ2V0RGlzdHJpYnV0ZWROb2RlcycpOyB9XG5cbiAgc3VwcG9ydHNDb29raWVzKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgZ2V0Q29va2llKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7IHRocm93IF9ub3RJbXBsZW1lbnRlZCgnZ2V0Q29va2llJyk7IH1cbiAgc2V0Q29va2llKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykgeyB0aHJvdyBfbm90SW1wbGVtZW50ZWQoJ3NldENvb2tpZScpOyB9XG59XG4iXX0=