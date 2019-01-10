/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable } from '@angular/core';
import { DOCUMENT, ɵgetDOM as getDOM } from '@angular/platform-browser';
var ServerEventManagerPlugin = /** @class */ (function () {
    function ServerEventManagerPlugin(doc) {
        this.doc = doc;
    }
    // Handle all events on the server.
    ServerEventManagerPlugin.prototype.supports = function (eventName) { return true; };
    ServerEventManagerPlugin.prototype.addEventListener = function (element, eventName, handler) {
        return getDOM().onAndCancel(element, eventName, handler);
    };
    ServerEventManagerPlugin.prototype.addGlobalEventListener = function (element, eventName, handler) {
        var target = getDOM().getGlobalEventTarget(this.doc, element);
        if (!target) {
            throw new Error("Unsupported event target " + target + " for event " + eventName);
        }
        return this.addEventListener(target, eventName, handler);
    };
    ServerEventManagerPlugin.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    ServerEventManagerPlugin.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
    ]; };
    return ServerEventManagerPlugin;
}());
export { ServerEventManagerPlugin };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyX2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLXNlcnZlci9zcmMvc2VydmVyX2V2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsUUFBUSxFQUFFLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUV0RTtJQUVFLGtDQUFzQyxHQUFRO1FBQVIsUUFBRyxHQUFILEdBQUcsQ0FBSztJQUFHLENBQUM7SUFFbEQsbUNBQW1DO0lBQ25DLDJDQUFRLEdBQVIsVUFBUyxTQUFpQixJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztJQUU1QyxtREFBZ0IsR0FBaEIsVUFBaUIsT0FBb0IsRUFBRSxTQUFpQixFQUFFLE9BQWlCO1FBQ3pFLE9BQU8sTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELHlEQUFzQixHQUF0QixVQUF1QixPQUFlLEVBQUUsU0FBaUIsRUFBRSxPQUFpQjtRQUMxRSxJQUFNLE1BQU0sR0FBZ0IsTUFBTSxFQUFFLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBNEIsTUFBTSxtQkFBYyxTQUFXLENBQUMsQ0FBQztTQUM5RTtRQUNELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0QsQ0FBQzs7Z0JBakJGLFVBQVU7Ozs7Z0RBRUksTUFBTSxTQUFDLFFBQVE7O0lBZ0I5QiwrQkFBQztDQUFBLEFBbEJELElBa0JDO1NBakJZLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVCwgybVnZXRET00gYXMgZ2V0RE9NfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNlcnZlckV2ZW50TWFuYWdlclBsdWdpbiAvKiBleHRlbmRzIEV2ZW50TWFuYWdlclBsdWdpbiB3aGljaCBpcyBwcml2YXRlICovIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2M6IGFueSkge31cblxuICAvLyBIYW5kbGUgYWxsIGV2ZW50cyBvbiB0aGUgc2VydmVyLlxuICBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZykgeyByZXR1cm4gdHJ1ZTsgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gZ2V0RE9NKCkub25BbmRDYW5jZWwoZWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgfVxuXG4gIGFkZEdsb2JhbEV2ZW50TGlzdGVuZXIoZWxlbWVudDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgY29uc3QgdGFyZ2V0OiBIVE1MRWxlbWVudCA9IGdldERPTSgpLmdldEdsb2JhbEV2ZW50VGFyZ2V0KHRoaXMuZG9jLCBlbGVtZW50KTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBldmVudCB0YXJnZXQgJHt0YXJnZXR9IGZvciBldmVudCAke2V2ZW50TmFtZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0YXJnZXQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cbn1cbiJdfQ==