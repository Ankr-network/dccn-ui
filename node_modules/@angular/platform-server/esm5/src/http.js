/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
var xhr2 = require('xhr2');
import { Injectable, Injector } from '@angular/core';
import { BrowserXhr, Http, ReadyState, RequestOptions, XHRBackend, XSRFStrategy } from '@angular/http';
import { HttpHandler, HttpBackend, XhrFactory, ɵHttpInterceptingHandler as HttpInterceptingHandler } from '@angular/common/http';
import { Observable } from 'rxjs';
var isAbsoluteUrl = /^[a-zA-Z\-\+.]+:\/\//;
function validateRequestUrl(url) {
    if (!isAbsoluteUrl.test(url)) {
        throw new Error("URLs requested via Http on the server must be absolute. URL: " + url);
    }
}
var ServerXhr = /** @class */ (function () {
    function ServerXhr() {
    }
    ServerXhr.prototype.build = function () { return new xhr2.XMLHttpRequest(); };
    ServerXhr.decorators = [
        { type: Injectable }
    ];
    return ServerXhr;
}());
export { ServerXhr };
var ServerXsrfStrategy = /** @class */ (function () {
    function ServerXsrfStrategy() {
    }
    ServerXsrfStrategy.prototype.configureRequest = function (req) { };
    ServerXsrfStrategy.decorators = [
        { type: Injectable }
    ];
    return ServerXsrfStrategy;
}());
export { ServerXsrfStrategy };
var ZoneMacroTaskWrapper = /** @class */ (function () {
    function ZoneMacroTaskWrapper() {
    }
    ZoneMacroTaskWrapper.prototype.wrap = function (request) {
        var _this = this;
        return new Observable(function (observer) {
            var task = null;
            var scheduled = false;
            var sub = null;
            var savedResult = null;
            var savedError = null;
            var scheduleTask = function (_task) {
                task = _task;
                scheduled = true;
                var delegate = _this.delegate(request);
                sub = delegate.subscribe(function (res) { return savedResult = res; }, function (err) {
                    if (!scheduled) {
                        throw new Error('An http observable was completed twice. This shouldn\'t happen, please file a bug.');
                    }
                    savedError = err;
                    scheduled = false;
                    task.invoke();
                }, function () {
                    if (!scheduled) {
                        throw new Error('An http observable was completed twice. This shouldn\'t happen, please file a bug.');
                    }
                    scheduled = false;
                    task.invoke();
                });
            };
            var cancelTask = function (_task) {
                if (!scheduled) {
                    return;
                }
                scheduled = false;
                if (sub) {
                    sub.unsubscribe();
                    sub = null;
                }
            };
            var onComplete = function () {
                if (savedError !== null) {
                    observer.error(savedError);
                }
                else {
                    observer.next(savedResult);
                    observer.complete();
                }
            };
            // MockBackend for Http is synchronous, which means that if scheduleTask is by
            // scheduleMacroTask, the request will hit MockBackend and the response will be
            // sent, causing task.invoke() to be called.
            var _task = Zone.current.scheduleMacroTask('ZoneMacroTaskWrapper.subscribe', onComplete, {}, function () { return null; }, cancelTask);
            scheduleTask(_task);
            return function () {
                if (scheduled && task) {
                    task.zone.cancelTask(task);
                    scheduled = false;
                }
                if (sub) {
                    sub.unsubscribe();
                    sub = null;
                }
            };
        });
    };
    return ZoneMacroTaskWrapper;
}());
export { ZoneMacroTaskWrapper };
var ZoneMacroTaskConnection = /** @class */ (function (_super) {
    tslib_1.__extends(ZoneMacroTaskConnection, _super);
    function ZoneMacroTaskConnection(request, backend) {
        var _this = _super.call(this) || this;
        _this.request = request;
        _this.backend = backend;
        validateRequestUrl(request.url);
        _this.response = _this.wrap(request);
        return _this;
    }
    ZoneMacroTaskConnection.prototype.delegate = function (request) {
        this.lastConnection = this.backend.createConnection(request);
        return this.lastConnection.response;
    };
    Object.defineProperty(ZoneMacroTaskConnection.prototype, "readyState", {
        get: function () {
            return !!this.lastConnection ? this.lastConnection.readyState : ReadyState.Unsent;
        },
        enumerable: true,
        configurable: true
    });
    return ZoneMacroTaskConnection;
}(ZoneMacroTaskWrapper));
export { ZoneMacroTaskConnection };
var ZoneMacroTaskBackend = /** @class */ (function () {
    function ZoneMacroTaskBackend(backend) {
        this.backend = backend;
    }
    ZoneMacroTaskBackend.prototype.createConnection = function (request) {
        return new ZoneMacroTaskConnection(request, this.backend);
    };
    return ZoneMacroTaskBackend;
}());
export { ZoneMacroTaskBackend };
var ZoneClientBackend = /** @class */ (function (_super) {
    tslib_1.__extends(ZoneClientBackend, _super);
    function ZoneClientBackend(backend) {
        var _this = _super.call(this) || this;
        _this.backend = backend;
        return _this;
    }
    ZoneClientBackend.prototype.handle = function (request) { return this.wrap(request); };
    ZoneClientBackend.prototype.delegate = function (request) {
        return this.backend.handle(request);
    };
    return ZoneClientBackend;
}(ZoneMacroTaskWrapper));
export { ZoneClientBackend };
export function httpFactory(xhrBackend, options) {
    var macroBackend = new ZoneMacroTaskBackend(xhrBackend);
    return new Http(macroBackend, options);
}
export function zoneWrappedInterceptingHandler(backend, injector) {
    var realBackend = new HttpInterceptingHandler(backend, injector);
    return new ZoneClientBackend(realBackend);
}
export var SERVER_HTTP_PROVIDERS = [
    { provide: Http, useFactory: httpFactory, deps: [XHRBackend, RequestOptions] },
    { provide: BrowserXhr, useClass: ServerXhr }, { provide: XSRFStrategy, useClass: ServerXsrfStrategy },
    { provide: XhrFactory, useClass: ServerXhr }, {
        provide: HttpHandler,
        useFactory: zoneWrappedInterceptingHandler,
        deps: [HttpBackend, Injector]
    }
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLXNlcnZlci9zcmMvaHR0cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsSUFBTSxJQUFJLEdBQVEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRWxDLE9BQU8sRUFBQyxVQUFVLEVBQUUsUUFBUSxFQUFrQyxNQUFNLGVBQWUsQ0FBQztBQUNwRixPQUFPLEVBQUMsVUFBVSxFQUFpQyxJQUFJLEVBQUUsVUFBVSxFQUFXLGNBQWMsRUFBWSxVQUFVLEVBQUUsWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXZKLE9BQU8sRUFBeUIsV0FBVyxFQUFzQyxXQUFXLEVBQUUsVUFBVSxFQUFFLHdCQUF3QixJQUFJLHVCQUF1QixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFM0wsT0FBTyxFQUFDLFVBQVUsRUFBeUIsTUFBTSxNQUFNLENBQUM7QUFFeEQsSUFBTSxhQUFhLEdBQUcsc0JBQXNCLENBQUM7QUFFN0MsNEJBQTRCLEdBQVc7SUFDckMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrRUFBZ0UsR0FBSyxDQUFDLENBQUM7S0FDeEY7QUFDSCxDQUFDO0FBRUQ7SUFBQTtJQUdBLENBQUM7SUFEQyx5QkFBSyxHQUFMLGNBQTBCLE9BQU8sSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDOztnQkFGOUQsVUFBVTs7SUFHWCxnQkFBQztDQUFBLEFBSEQsSUFHQztTQUZZLFNBQVM7QUFJdEI7SUFBQTtJQUdBLENBQUM7SUFEQyw2Q0FBZ0IsR0FBaEIsVUFBaUIsR0FBWSxJQUFTLENBQUM7O2dCQUZ4QyxVQUFVOztJQUdYLHlCQUFDO0NBQUEsQUFIRCxJQUdDO1NBRlksa0JBQWtCO0FB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O0lBRWxGLG9DQUFRLEdBQWxCLFVBQW1CLE9BQXlCO1FBQzFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUNILHdCQUFDO0FBQUQsQ0FBQyxBQVRELENBQ0ksb0JBQW9CLEdBUXZCOztBQUVELE1BQU0sc0JBQXNCLFVBQXNCLEVBQUUsT0FBdUI7SUFDekUsSUFBTSxZQUFZLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMxRCxPQUFPLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBRUQsTUFBTSx5Q0FBeUMsT0FBb0IsRUFBRSxRQUFrQjtJQUNyRixJQUFNLFdBQVcsR0FBZ0IsSUFBSSx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDaEYsT0FBTyxJQUFJLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFFRCxNQUFNLENBQUMsSUFBTSxxQkFBcUIsR0FBZTtJQUMvQyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLEVBQUM7SUFDNUUsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsRUFBRSxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFDO0lBQ2pHLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLEVBQUU7UUFDMUMsT0FBTyxFQUFFLFdBQVc7UUFDcEIsVUFBVSxFQUFFLDhCQUE4QjtRQUMxQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDO0tBQzlCO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuY29uc3QgeGhyMjogYW55ID0gcmVxdWlyZSgneGhyMicpO1xuXG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdG9yLCBPcHRpb25hbCwgUHJvdmlkZXIsIEluamVjdEZsYWdzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QnJvd3NlclhociwgQ29ubmVjdGlvbiwgQ29ubmVjdGlvbkJhY2tlbmQsIEh0dHAsIFJlYWR5U3RhdGUsIFJlcXVlc3QsIFJlcXVlc3RPcHRpb25zLCBSZXNwb25zZSwgWEhSQmFja2VuZCwgWFNSRlN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9odHRwJztcblxuaW1wb3J0IHtIdHRwRXZlbnQsIEh0dHBSZXF1ZXN0LCBIdHRwSGFuZGxlciwgSHR0cEludGVyY2VwdG9yLCBIVFRQX0lOVEVSQ0VQVE9SUywgSHR0cEJhY2tlbmQsIFhockZhY3RvcnksIMm1SHR0cEludGVyY2VwdGluZ0hhbmRsZXIgYXMgSHR0cEludGVyY2VwdGluZ0hhbmRsZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlciwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcblxuY29uc3QgaXNBYnNvbHV0ZVVybCA9IC9eW2EtekEtWlxcLVxcKy5dKzpcXC9cXC8vO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZVJlcXVlc3RVcmwodXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKCFpc0Fic29sdXRlVXJsLnRlc3QodXJsKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVVJMcyByZXF1ZXN0ZWQgdmlhIEh0dHAgb24gdGhlIHNlcnZlciBtdXN0IGJlIGFic29sdXRlLiBVUkw6ICR7dXJsfWApO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTZXJ2ZXJYaHIgaW1wbGVtZW50cyBCcm93c2VyWGhyIHtcbiAgYnVpbGQoKTogWE1MSHR0cFJlcXVlc3QgeyByZXR1cm4gbmV3IHhocjIuWE1MSHR0cFJlcXVlc3QoKTsgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU2VydmVyWHNyZlN0cmF0ZWd5IGltcGxlbWVudHMgWFNSRlN0cmF0ZWd5IHtcbiAgY29uZmlndXJlUmVxdWVzdChyZXE6IFJlcXVlc3QpOiB2b2lkIHt9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBab25lTWFjcm9UYXNrV3JhcHBlcjxTLCBSPiB7XG4gIHdyYXAocmVxdWVzdDogUyk6IE9ic2VydmFibGU8Uj4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPFI+KSA9PiB7XG4gICAgICBsZXQgdGFzazogVGFzayA9IG51bGwgITtcbiAgICAgIGxldCBzY2hlZHVsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgIGxldCBzdWI6IFN1YnNjcmlwdGlvbnxudWxsID0gbnVsbDtcbiAgICAgIGxldCBzYXZlZFJlc3VsdDogYW55ID0gbnVsbDtcbiAgICAgIGxldCBzYXZlZEVycm9yOiBhbnkgPSBudWxsO1xuXG4gICAgICBjb25zdCBzY2hlZHVsZVRhc2sgPSAoX3Rhc2s6IFRhc2spID0+IHtcbiAgICAgICAgdGFzayA9IF90YXNrO1xuICAgICAgICBzY2hlZHVsZWQgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IGRlbGVnYXRlID0gdGhpcy5kZWxlZ2F0ZShyZXF1ZXN0KTtcbiAgICAgICAgc3ViID0gZGVsZWdhdGUuc3Vic2NyaWJlKFxuICAgICAgICAgICAgcmVzID0+IHNhdmVkUmVzdWx0ID0gcmVzLFxuICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFzY2hlZHVsZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdBbiBodHRwIG9ic2VydmFibGUgd2FzIGNvbXBsZXRlZCB0d2ljZS4gVGhpcyBzaG91bGRuXFwndCBoYXBwZW4sIHBsZWFzZSBmaWxlIGEgYnVnLicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNhdmVkRXJyb3IgPSBlcnI7XG4gICAgICAgICAgICAgIHNjaGVkdWxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICB0YXNrLmludm9rZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFzY2hlZHVsZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdBbiBodHRwIG9ic2VydmFibGUgd2FzIGNvbXBsZXRlZCB0d2ljZS4gVGhpcyBzaG91bGRuXFwndCBoYXBwZW4sIHBsZWFzZSBmaWxlIGEgYnVnLicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNjaGVkdWxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICB0YXNrLmludm9rZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBjYW5jZWxUYXNrID0gKF90YXNrOiBUYXNrKSA9PiB7XG4gICAgICAgIGlmICghc2NoZWR1bGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNjaGVkdWxlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgc3ViID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY29uc3Qgb25Db21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHNhdmVkRXJyb3IgIT09IG51bGwpIHtcbiAgICAgICAgICBvYnNlcnZlci5lcnJvcihzYXZlZEVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHNhdmVkUmVzdWx0KTtcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBNb2NrQmFja2VuZCBmb3IgSHR0cCBpcyBzeW5jaHJvbm91cywgd2hpY2ggbWVhbnMgdGhhdCBpZiBzY2hlZHVsZVRhc2sgaXMgYnlcbiAgICAgIC8vIHNjaGVkdWxlTWFjcm9UYXNrLCB0aGUgcmVxdWVzdCB3aWxsIGhpdCBNb2NrQmFja2VuZCBhbmQgdGhlIHJlc3BvbnNlIHdpbGwgYmVcbiAgICAgIC8vIHNlbnQsIGNhdXNpbmcgdGFzay5pbnZva2UoKSB0byBiZSBjYWxsZWQuXG4gICAgICBjb25zdCBfdGFzayA9IFpvbmUuY3VycmVudC5zY2hlZHVsZU1hY3JvVGFzayhcbiAgICAgICAgICAnWm9uZU1hY3JvVGFza1dyYXBwZXIuc3Vic2NyaWJlJywgb25Db21wbGV0ZSwge30sICgpID0+IG51bGwsIGNhbmNlbFRhc2spO1xuICAgICAgc2NoZWR1bGVUYXNrKF90YXNrKTtcblxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgaWYgKHNjaGVkdWxlZCAmJiB0YXNrKSB7XG4gICAgICAgICAgdGFzay56b25lLmNhbmNlbFRhc2sodGFzayk7XG4gICAgICAgICAgc2NoZWR1bGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgIHN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgIHN1YiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZGVsZWdhdGUocmVxdWVzdDogUyk6IE9ic2VydmFibGU8Uj47XG59XG5cbmV4cG9ydCBjbGFzcyBab25lTWFjcm9UYXNrQ29ubmVjdGlvbiBleHRlbmRzIFpvbmVNYWNyb1Rhc2tXcmFwcGVyPFJlcXVlc3QsIFJlc3BvbnNlPiBpbXBsZW1lbnRzXG4gICAgQ29ubmVjdGlvbiB7XG4gIHJlc3BvbnNlOiBPYnNlcnZhYmxlPFJlc3BvbnNlPjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIGxhc3RDb25uZWN0aW9uICE6IENvbm5lY3Rpb247XG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlcXVlc3Q6IFJlcXVlc3QsIHByaXZhdGUgYmFja2VuZDogWEhSQmFja2VuZCkge1xuICAgIHN1cGVyKCk7XG4gICAgdmFsaWRhdGVSZXF1ZXN0VXJsKHJlcXVlc3QudXJsKTtcbiAgICB0aGlzLnJlc3BvbnNlID0gdGhpcy53cmFwKHJlcXVlc3QpO1xuICB9XG5cbiAgZGVsZWdhdGUocmVxdWVzdDogUmVxdWVzdCk6IE9ic2VydmFibGU8UmVzcG9uc2U+IHtcbiAgICB0aGlzLmxhc3RDb25uZWN0aW9uID0gdGhpcy5iYWNrZW5kLmNyZWF0ZUNvbm5lY3Rpb24ocmVxdWVzdCk7XG4gICAgcmV0dXJuIHRoaXMubGFzdENvbm5lY3Rpb24ucmVzcG9uc2UgYXMgT2JzZXJ2YWJsZTxSZXNwb25zZT47XG4gIH1cblxuICBnZXQgcmVhZHlTdGF0ZSgpOiBSZWFkeVN0YXRlIHtcbiAgICByZXR1cm4gISF0aGlzLmxhc3RDb25uZWN0aW9uID8gdGhpcy5sYXN0Q29ubmVjdGlvbi5yZWFkeVN0YXRlIDogUmVhZHlTdGF0ZS5VbnNlbnQ7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFpvbmVNYWNyb1Rhc2tCYWNrZW5kIGltcGxlbWVudHMgQ29ubmVjdGlvbkJhY2tlbmQge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJhY2tlbmQ6IFhIUkJhY2tlbmQpIHt9XG5cbiAgY3JlYXRlQ29ubmVjdGlvbihyZXF1ZXN0OiBhbnkpOiBab25lTWFjcm9UYXNrQ29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBab25lTWFjcm9UYXNrQ29ubmVjdGlvbihyZXF1ZXN0LCB0aGlzLmJhY2tlbmQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBab25lQ2xpZW50QmFja2VuZCBleHRlbmRzXG4gICAgWm9uZU1hY3JvVGFza1dyYXBwZXI8SHR0cFJlcXVlc3Q8YW55PiwgSHR0cEV2ZW50PGFueT4+IGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJhY2tlbmQ6IEh0dHBCYWNrZW5kKSB7IHN1cGVyKCk7IH1cblxuICBoYW5kbGUocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHsgcmV0dXJuIHRoaXMud3JhcChyZXF1ZXN0KTsgfVxuXG4gIHByb3RlY3RlZCBkZWxlZ2F0ZShyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIHJldHVybiB0aGlzLmJhY2tlbmQuaGFuZGxlKHJlcXVlc3QpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodHRwRmFjdG9yeSh4aHJCYWNrZW5kOiBYSFJCYWNrZW5kLCBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucykge1xuICBjb25zdCBtYWNyb0JhY2tlbmQgPSBuZXcgWm9uZU1hY3JvVGFza0JhY2tlbmQoeGhyQmFja2VuZCk7XG4gIHJldHVybiBuZXcgSHR0cChtYWNyb0JhY2tlbmQsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gem9uZVdyYXBwZWRJbnRlcmNlcHRpbmdIYW5kbGVyKGJhY2tlbmQ6IEh0dHBCYWNrZW5kLCBpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgY29uc3QgcmVhbEJhY2tlbmQ6IEh0dHBCYWNrZW5kID0gbmV3IEh0dHBJbnRlcmNlcHRpbmdIYW5kbGVyKGJhY2tlbmQsIGluamVjdG9yKTtcbiAgcmV0dXJuIG5ldyBab25lQ2xpZW50QmFja2VuZChyZWFsQmFja2VuZCk7XG59XG5cbmV4cG9ydCBjb25zdCBTRVJWRVJfSFRUUF9QUk9WSURFUlM6IFByb3ZpZGVyW10gPSBbXG4gIHtwcm92aWRlOiBIdHRwLCB1c2VGYWN0b3J5OiBodHRwRmFjdG9yeSwgZGVwczogW1hIUkJhY2tlbmQsIFJlcXVlc3RPcHRpb25zXX0sXG4gIHtwcm92aWRlOiBCcm93c2VyWGhyLCB1c2VDbGFzczogU2VydmVyWGhyfSwge3Byb3ZpZGU6IFhTUkZTdHJhdGVneSwgdXNlQ2xhc3M6IFNlcnZlclhzcmZTdHJhdGVneX0sXG4gIHtwcm92aWRlOiBYaHJGYWN0b3J5LCB1c2VDbGFzczogU2VydmVyWGhyfSwge1xuICAgIHByb3ZpZGU6IEh0dHBIYW5kbGVyLFxuICAgIHVzZUZhY3Rvcnk6IHpvbmVXcmFwcGVkSW50ZXJjZXB0aW5nSGFuZGxlcixcbiAgICBkZXBzOiBbSHR0cEJhY2tlbmQsIEluamVjdG9yXVxuICB9XG5dO1xuIl19