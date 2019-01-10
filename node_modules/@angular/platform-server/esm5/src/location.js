/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, Optional } from '@angular/core';
import { DOCUMENT, ɵgetDOM as getDOM } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import * as url from 'url';
import { INITIAL_CONFIG } from './tokens';
function parseUrl(urlStr) {
    var parsedUrl = url.parse(urlStr);
    return {
        pathname: parsedUrl.pathname || '',
        search: parsedUrl.search || '',
        hash: parsedUrl.hash || '',
    };
}
/**
 * Server-side implementation of URL state. Implements `pathname`, `search`, and `hash`
 * but not the state stack.
 */
var ServerPlatformLocation = /** @class */ (function () {
    function ServerPlatformLocation(_doc, _config) {
        this._doc = _doc;
        this.pathname = '/';
        this.search = '';
        this.hash = '';
        this._hashUpdate = new Subject();
        var config = _config;
        if (!!config && !!config.url) {
            var parsedUrl = parseUrl(config.url);
            this.pathname = parsedUrl.pathname;
            this.search = parsedUrl.search;
            this.hash = parsedUrl.hash;
        }
    }
    ServerPlatformLocation.prototype.getBaseHrefFromDOM = function () { return getDOM().getBaseHref(this._doc); };
    ServerPlatformLocation.prototype.onPopState = function (fn) {
        // No-op: a state stack is not implemented, so
        // no events will ever come.
    };
    ServerPlatformLocation.prototype.onHashChange = function (fn) { this._hashUpdate.subscribe(fn); };
    Object.defineProperty(ServerPlatformLocation.prototype, "url", {
        get: function () { return "" + this.pathname + this.search + this.hash; },
        enumerable: true,
        configurable: true
    });
    ServerPlatformLocation.prototype.setHash = function (value, oldUrl) {
        var _this = this;
        if (this.hash === value) {
            // Don't fire events if the hash has not changed.
            return;
        }
        this.hash = value;
        var newUrl = this.url;
        scheduleMicroTask(function () { return _this._hashUpdate.next({
            type: 'hashchange', state: null, oldUrl: oldUrl, newUrl: newUrl
        }); });
    };
    ServerPlatformLocation.prototype.replaceState = function (state, title, newUrl) {
        var oldUrl = this.url;
        var parsedUrl = parseUrl(newUrl);
        this.pathname = parsedUrl.pathname;
        this.search = parsedUrl.search;
        this.setHash(parsedUrl.hash, oldUrl);
    };
    ServerPlatformLocation.prototype.pushState = function (state, title, newUrl) {
        this.replaceState(state, title, newUrl);
    };
    ServerPlatformLocation.prototype.forward = function () { throw new Error('Not implemented'); };
    ServerPlatformLocation.prototype.back = function () { throw new Error('Not implemented'); };
    ServerPlatformLocation.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    ServerPlatformLocation.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
        { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [INITIAL_CONFIG,] }] }
    ]; };
    return ServerPlatformLocation;
}());
export { ServerPlatformLocation };
export function scheduleMicroTask(fn) {
    Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1zZXJ2ZXIvc3JjL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMzRCxPQUFPLEVBQUMsUUFBUSxFQUFFLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUN0RSxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sS0FBSyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBQzNCLE9BQU8sRUFBQyxjQUFjLEVBQWlCLE1BQU0sVUFBVSxDQUFDO0FBR3hELGtCQUFrQixNQUFjO0lBQzlCLElBQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsT0FBTztRQUNMLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUSxJQUFJLEVBQUU7UUFDbEMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLElBQUksRUFBRTtRQUM5QixJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksSUFBSSxFQUFFO0tBQzNCLENBQUM7QUFDSixDQUFDO0FBRUQ7OztHQUdHO0FBQ0g7SUFPRSxnQ0FDOEIsSUFBUyxFQUFzQyxPQUFZO1FBQTNELFNBQUksR0FBSixJQUFJLENBQUs7UUFOdkIsYUFBUSxHQUFXLEdBQUcsQ0FBQztRQUN2QixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLFNBQUksR0FBVyxFQUFFLENBQUM7UUFDMUIsZ0JBQVcsR0FBRyxJQUFJLE9BQU8sRUFBdUIsQ0FBQztRQUl2RCxJQUFNLE1BQU0sR0FBRyxPQUFnQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtZQUM1QixJQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFDL0IsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO1NBQzVCO0lBQ0gsQ0FBQztJQUVELG1EQUFrQixHQUFsQixjQUErQixPQUFPLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTFFLDJDQUFVLEdBQVYsVUFBVyxFQUEwQjtRQUNuQyw4Q0FBOEM7UUFDOUMsNEJBQTRCO0lBQzlCLENBQUM7SUFFRCw2Q0FBWSxHQUFaLFVBQWEsRUFBMEIsSUFBVSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbEYsc0JBQUksdUNBQUc7YUFBUCxjQUFvQixPQUFPLEtBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFNLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUVsRSx3Q0FBTyxHQUFmLFVBQWdCLEtBQWEsRUFBRSxNQUFjO1FBQTdDLGlCQVVDO1FBVEMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTtZQUN2QixpREFBaUQ7WUFDakQsT0FBTztTQUNSO1FBQ0EsSUFBc0IsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ3JDLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDeEIsaUJBQWlCLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQzVDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLFFBQUEsRUFBRSxNQUFNLFFBQUE7U0FDekIsQ0FBQyxFQUZELENBRUMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCw2Q0FBWSxHQUFaLFVBQWEsS0FBVSxFQUFFLEtBQWEsRUFBRSxNQUFjO1FBQ3BELElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDeEIsSUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLElBQTBCLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFDekQsSUFBd0IsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNwRCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELDBDQUFTLEdBQVQsVUFBVSxLQUFVLEVBQUUsS0FBYSxFQUFFLE1BQWM7UUFDakQsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCx3Q0FBTyxHQUFQLGNBQWtCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFdkQscUNBQUksR0FBSixjQUFlLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7O2dCQXZEckQsVUFBVTs7OztnREFRSixNQUFNLFNBQUMsUUFBUTtnREFBc0IsUUFBUSxZQUFJLE1BQU0sU0FBQyxjQUFjOztJQWdEN0UsNkJBQUM7Q0FBQSxBQXhERCxJQXdEQztTQXZEWSxzQkFBc0I7QUF5RG5DLE1BQU0sNEJBQTRCLEVBQVk7SUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xvY2F0aW9uQ2hhbmdlRXZlbnQsIExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIsIFBsYXRmb3JtTG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVCwgybVnZXRET00gYXMgZ2V0RE9NfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgKiBhcyB1cmwgZnJvbSAndXJsJztcbmltcG9ydCB7SU5JVElBTF9DT05GSUcsIFBsYXRmb3JtQ29uZmlnfSBmcm9tICcuL3Rva2Vucyc7XG5cblxuZnVuY3Rpb24gcGFyc2VVcmwodXJsU3RyOiBzdHJpbmcpOiB7cGF0aG5hbWU6IHN0cmluZywgc2VhcmNoOiBzdHJpbmcsIGhhc2g6IHN0cmluZ30ge1xuICBjb25zdCBwYXJzZWRVcmwgPSB1cmwucGFyc2UodXJsU3RyKTtcbiAgcmV0dXJuIHtcbiAgICBwYXRobmFtZTogcGFyc2VkVXJsLnBhdGhuYW1lIHx8ICcnLFxuICAgIHNlYXJjaDogcGFyc2VkVXJsLnNlYXJjaCB8fCAnJyxcbiAgICBoYXNoOiBwYXJzZWRVcmwuaGFzaCB8fCAnJyxcbiAgfTtcbn1cblxuLyoqXG4gKiBTZXJ2ZXItc2lkZSBpbXBsZW1lbnRhdGlvbiBvZiBVUkwgc3RhdGUuIEltcGxlbWVudHMgYHBhdGhuYW1lYCwgYHNlYXJjaGAsIGFuZCBgaGFzaGBcbiAqIGJ1dCBub3QgdGhlIHN0YXRlIHN0YWNrLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU2VydmVyUGxhdGZvcm1Mb2NhdGlvbiBpbXBsZW1lbnRzIFBsYXRmb3JtTG9jYXRpb24ge1xuICBwdWJsaWMgcmVhZG9ubHkgcGF0aG5hbWU6IHN0cmluZyA9ICcvJztcbiAgcHVibGljIHJlYWRvbmx5IHNlYXJjaDogc3RyaW5nID0gJyc7XG4gIHB1YmxpYyByZWFkb25seSBoYXNoOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBfaGFzaFVwZGF0ZSA9IG5ldyBTdWJqZWN0PExvY2F0aW9uQ2hhbmdlRXZlbnQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIF9kb2M6IGFueSwgQE9wdGlvbmFsKCkgQEluamVjdChJTklUSUFMX0NPTkZJRykgX2NvbmZpZzogYW55KSB7XG4gICAgY29uc3QgY29uZmlnID0gX2NvbmZpZyBhcyBQbGF0Zm9ybUNvbmZpZyB8IG51bGw7XG4gICAgaWYgKCEhY29uZmlnICYmICEhY29uZmlnLnVybCkge1xuICAgICAgY29uc3QgcGFyc2VkVXJsID0gcGFyc2VVcmwoY29uZmlnLnVybCk7XG4gICAgICB0aGlzLnBhdGhuYW1lID0gcGFyc2VkVXJsLnBhdGhuYW1lO1xuICAgICAgdGhpcy5zZWFyY2ggPSBwYXJzZWRVcmwuc2VhcmNoO1xuICAgICAgdGhpcy5oYXNoID0gcGFyc2VkVXJsLmhhc2g7XG4gICAgfVxuICB9XG5cbiAgZ2V0QmFzZUhyZWZGcm9tRE9NKCk6IHN0cmluZyB7IHJldHVybiBnZXRET00oKS5nZXRCYXNlSHJlZih0aGlzLl9kb2MpICE7IH1cblxuICBvblBvcFN0YXRlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogdm9pZCB7XG4gICAgLy8gTm8tb3A6IGEgc3RhdGUgc3RhY2sgaXMgbm90IGltcGxlbWVudGVkLCBzb1xuICAgIC8vIG5vIGV2ZW50cyB3aWxsIGV2ZXIgY29tZS5cbiAgfVxuXG4gIG9uSGFzaENoYW5nZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQgeyB0aGlzLl9oYXNoVXBkYXRlLnN1YnNjcmliZShmbik7IH1cblxuICBnZXQgdXJsKCk6IHN0cmluZyB7IHJldHVybiBgJHt0aGlzLnBhdGhuYW1lfSR7dGhpcy5zZWFyY2h9JHt0aGlzLmhhc2h9YDsgfVxuXG4gIHByaXZhdGUgc2V0SGFzaCh2YWx1ZTogc3RyaW5nLCBvbGRVcmw6IHN0cmluZykge1xuICAgIGlmICh0aGlzLmhhc2ggPT09IHZhbHVlKSB7XG4gICAgICAvLyBEb24ndCBmaXJlIGV2ZW50cyBpZiB0aGUgaGFzaCBoYXMgbm90IGNoYW5nZWQuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICh0aGlzIGFze2hhc2g6IHN0cmluZ30pLmhhc2ggPSB2YWx1ZTtcbiAgICBjb25zdCBuZXdVcmwgPSB0aGlzLnVybDtcbiAgICBzY2hlZHVsZU1pY3JvVGFzaygoKSA9PiB0aGlzLl9oYXNoVXBkYXRlLm5leHQoe1xuICAgICAgdHlwZTogJ2hhc2hjaGFuZ2UnLCBzdGF0ZTogbnVsbCwgb2xkVXJsLCBuZXdVcmxcbiAgICB9IGFzIExvY2F0aW9uQ2hhbmdlRXZlbnQpKTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBuZXdVcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFVybCA9IHRoaXMudXJsO1xuICAgIGNvbnN0IHBhcnNlZFVybCA9IHBhcnNlVXJsKG5ld1VybCk7XG4gICAgKHRoaXMgYXN7cGF0aG5hbWU6IHN0cmluZ30pLnBhdGhuYW1lID0gcGFyc2VkVXJsLnBhdGhuYW1lO1xuICAgICh0aGlzIGFze3NlYXJjaDogc3RyaW5nfSkuc2VhcmNoID0gcGFyc2VkVXJsLnNlYXJjaDtcbiAgICB0aGlzLnNldEhhc2gocGFyc2VkVXJsLmhhc2gsIG9sZFVybCk7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgbmV3VXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnJlcGxhY2VTdGF0ZShzdGF0ZSwgdGl0bGUsIG5ld1VybCk7XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQgeyB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpOyB9XG5cbiAgYmFjaygpOiB2b2lkIHsgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVNaWNyb1Rhc2soZm46IEZ1bmN0aW9uKSB7XG4gIFpvbmUuY3VycmVudC5zY2hlZHVsZU1pY3JvVGFzaygnc2NoZWR1bGVNaWNyb3Rhc2snLCBmbik7XG59XG4iXX0=