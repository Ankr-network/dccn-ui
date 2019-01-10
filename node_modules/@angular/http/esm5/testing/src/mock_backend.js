/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { ReadyState, Request } from '@angular/http';
import { ReplaySubject, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
/**
 *
 * Mock Connection to represent a {@link Connection} for tests.
 *
 * @deprecated see https://angular.io/guide/http
 */
var MockConnection = /** @class */ (function () {
    function MockConnection(req) {
        this.response = new ReplaySubject(1).pipe(take(1));
        this.readyState = ReadyState.Open;
        this.request = req;
    }
    /**
     * Sends a mock response to the connection. This response is the value that is emitted to the
     * {@link EventEmitter} returned by {@link Http}.
     *
     * ### Example
     *
     * ```
     * var connection;
     * backend.connections.subscribe(c => connection = c);
     * http.request('data.json').subscribe(res => console.log(res.text()));
     * connection.mockRespond(new Response(new ResponseOptions({ body: 'fake response' }))); //logs
     * 'fake response'
     * ```
     *
     */
    MockConnection.prototype.mockRespond = function (res) {
        if (this.readyState === ReadyState.Done || this.readyState === ReadyState.Cancelled) {
            throw new Error('Connection has already been resolved');
        }
        this.readyState = ReadyState.Done;
        this.response.next(res);
        this.response.complete();
    };
    /**
     * Not yet implemented!
     *
     * Sends the provided {@link Response} to the `downloadObserver` of the `Request`
     * associated with this connection.
     */
    MockConnection.prototype.mockDownload = function (res) {
        // this.request.downloadObserver.onNext(res);
        // if (res.bytesLoaded === res.totalBytes) {
        //   this.request.downloadObserver.onCompleted();
        // }
    };
    // TODO(jeffbcross): consider using Response type
    /**
     * Emits the provided error object as an error to the {@link Response} {@link EventEmitter}
     * returned
     * from {@link Http}.
     *
     * ### Example
     *
     * ```
     * var connection;
     * backend.connections.subscribe(c => connection = c);
     * http.request('data.json').subscribe(res => res, err => console.log(err)));
     * connection.mockError(new Error('error'));
     * ```
     *
     */
    MockConnection.prototype.mockError = function (err) {
        // Matches ResourceLoader semantics
        this.readyState = ReadyState.Done;
        this.response.error(err);
    };
    return MockConnection;
}());
export { MockConnection };
/**
 * A mock backend for testing the {@link Http} service.
 *
 * This class can be injected in tests, and should be used to override providers
 * to other backends, such as {@link XHRBackend}.
 *
 * ### Example
 *
 * ```
 * import {Injectable, Injector} from '@angular/core';
 * import {async, fakeAsync, tick} from '@angular/core/testing';
 * import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';
 * import {Response, ResponseOptions} from '@angular/http';
 * import {MockBackend, MockConnection} from '@angular/http/testing';
 *
 * const HERO_ONE = 'HeroNrOne';
 * const HERO_TWO = 'WillBeAlwaysTheSecond';
 *
 * @Injectable()
 * class HeroService {
 *   constructor(private http: Http) {}
 *
 *   getHeroes(): Promise<String[]> {
 *     return this.http.get('myservices.de/api/heroes')
 *         .toPromise()
 *         .then(response => response.json().data)
 *         .catch(e => this.handleError(e));
 *   }
 *
 *   private handleError(error: any): Promise<any> {
 *     console.error('An error occurred', error);
 *     return Promise.reject(error.message || error);
 *   }
 * }
 *
 * describe('MockBackend HeroService Example', () => {
 *   beforeEach(() => {
 *     this.injector = Injector.create([
 *       {provide: ConnectionBackend, useClass: MockBackend},
 *       {provide: RequestOptions, useClass: BaseRequestOptions},
 *       Http,
 *       HeroService,
 *     ]);
 *     this.heroService = this.injector.get(HeroService);
 *     this.backend = this.injector.get(ConnectionBackend) as MockBackend;
 *     this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
 *   });
 *
 *   it('getHeroes() should query current service url', () => {
 *     this.heroService.getHeroes();
 *     expect(this.lastConnection).toBeDefined('no http service connection at all?');
 *     expect(this.lastConnection.request.url).toMatch(/api\/heroes$/, 'url invalid');
 *   });
 *
 *   it('getHeroes() should return some heroes', fakeAsync(() => {
 *        let result: String[];
 *        this.heroService.getHeroes().then((heroes: String[]) => result = heroes);
 *        this.lastConnection.mockRespond(new Response(new ResponseOptions({
 *          body: JSON.stringify({data: [HERO_ONE, HERO_TWO]}),
 *        })));
 *        tick();
 *        expect(result.length).toEqual(2, 'should contain given amount of heroes');
 *        expect(result[0]).toEqual(HERO_ONE, ' HERO_ONE should be the first hero');
 *        expect(result[1]).toEqual(HERO_TWO, ' HERO_TWO should be the second hero');
 *      }));
 *
 *   it('getHeroes() while server is down', fakeAsync(() => {
 *        let result: String[];
 *        let catchedError: any;
 *        this.heroService.getHeroes()
 *            .then((heroes: String[]) => result = heroes)
 *            .catch((error: any) => catchedError = error);
 *        this.lastConnection.mockRespond(new Response(new ResponseOptions({
 *          status: 404,
 *          statusText: 'URL not Found',
 *        })));
 *        tick();
 *        expect(result).toBeUndefined();
 *        expect(catchedError).toBeDefined();
 *      }));
 * });
 * ```
 *
 * This method only exists in the mock implementation, not in real Backends.
 *
 * @deprecated see https://angular.io/guide/http
 */
var MockBackend = /** @class */ (function () {
    function MockBackend() {
        var _this = this;
        this.connectionsArray = [];
        this.connections = new Subject();
        this.connections.subscribe(function (connection) { return _this.connectionsArray.push(connection); });
        this.pendingConnections = new Subject();
    }
    /**
     * Checks all connections, and raises an exception if any connection has not received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    MockBackend.prototype.verifyNoPendingRequests = function () {
        var pending = 0;
        this.pendingConnections.subscribe(function (c) { return pending++; });
        if (pending > 0)
            throw new Error(pending + " pending connections to be resolved");
    };
    /**
     * Can be used in conjunction with `verifyNoPendingRequests` to resolve any not-yet-resolve
     * connections, if it's expected that there are connections that have not yet received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    MockBackend.prototype.resolveAllConnections = function () { this.connections.subscribe(function (c) { return c.readyState = 4; }); };
    /**
     * Creates a new {@link MockConnection}. This is equivalent to calling `new
     * MockConnection()`, except that it also will emit the new `Connection` to the `connections`
     * emitter of this `MockBackend` instance. This method will usually only be used by tests
     * against the framework itself, not by end-users.
     */
    MockBackend.prototype.createConnection = function (req) {
        if (!req || !(req instanceof Request)) {
            throw new Error("createConnection requires an instance of Request, got " + req);
        }
        var connection = new MockConnection(req);
        this.connections.next(connection);
        return connection;
    };
    MockBackend.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    MockBackend.ctorParameters = function () { return []; };
    return MockBackend;
}());
export { MockBackend };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19iYWNrZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvaHR0cC90ZXN0aW5nL3NyYy9tb2NrX2JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQWdDLFVBQVUsRUFBRSxPQUFPLEVBQVcsTUFBTSxlQUFlLENBQUM7QUFDM0YsT0FBTyxFQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDNUMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR3BDOzs7OztHQUtHO0FBQ0g7SUFvQkUsd0JBQVksR0FBWTtRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFRLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBQ0gsb0NBQVcsR0FBWCxVQUFZLEdBQWE7UUFDdkIsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLFVBQVUsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsU0FBUyxFQUFFO1lBQ25GLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztTQUN6RDtRQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILHFDQUFZLEdBQVosVUFBYSxHQUFhO1FBQ3hCLDZDQUE2QztRQUM3Qyw0Q0FBNEM7UUFDNUMsaURBQWlEO1FBQ2pELElBQUk7SUFDTixDQUFDO0lBRUQsaURBQWlEO0lBQ2pEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBQ0gsa0NBQVMsR0FBVCxVQUFVLEdBQVc7UUFDbkIsbUNBQW1DO1FBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBQ0gscUJBQUM7QUFBRCxDQUFDLEFBcEZELElBb0ZDOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNGRztBQUNIO0lBd0RFO1FBQUEsaUJBTUM7UUFMQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FDdEIsVUFBQyxVQUEwQixJQUFLLE9BQUEsS0FBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBdEMsQ0FBc0MsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsNkNBQXVCLEdBQXZCO1FBQ0UsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsVUFBQyxDQUFpQixJQUFLLE9BQUEsT0FBTyxFQUFFLEVBQVQsQ0FBUyxDQUFDLENBQUM7UUFDcEUsSUFBSSxPQUFPLEdBQUcsQ0FBQztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUksT0FBTyx3Q0FBcUMsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILDJDQUFxQixHQUFyQixjQUEwQixJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFDLENBQWlCLElBQUssT0FBQSxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVoRzs7Ozs7T0FLRztJQUNILHNDQUFnQixHQUFoQixVQUFpQixHQUFZO1FBQzNCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsWUFBWSxPQUFPLENBQUMsRUFBRTtZQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLDJEQUF5RCxHQUFLLENBQUMsQ0FBQztTQUNqRjtRQUNELElBQU0sVUFBVSxHQUFHLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7O2dCQWhHRixVQUFVOzs7O0lBaUdYLGtCQUFDO0NBQUEsQUFqR0QsSUFpR0M7U0FoR1ksV0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29ubmVjdGlvbiwgQ29ubmVjdGlvbkJhY2tlbmQsIFJlYWR5U3RhdGUsIFJlcXVlc3QsIFJlc3BvbnNlfSBmcm9tICdAYW5ndWxhci9odHRwJztcbmltcG9ydCB7UmVwbGF5U3ViamVjdCwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2V9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuXG4vKipcbiAqXG4gKiBNb2NrIENvbm5lY3Rpb24gdG8gcmVwcmVzZW50IGEge0BsaW5rIENvbm5lY3Rpb259IGZvciB0ZXN0cy5cbiAqXG4gKiBAZGVwcmVjYXRlZCBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2h0dHBcbiAqL1xuZXhwb3J0IGNsYXNzIE1vY2tDb25uZWN0aW9uIGltcGxlbWVudHMgQ29ubmVjdGlvbiB7XG4gIC8vIFRPRE86IE5hbWUgYHJlYWR5U3RhdGVgIHNob3VsZCBjaGFuZ2UgdG8gYmUgbW9yZSBnZW5lcmljLCBhbmQgc3RhdGVzIGNvdWxkIGJlIG1hZGUgdG8gYmUgbW9yZVxuICAvLyBkZXNjcmlwdGl2ZSB0aGFuIFJlc291cmNlTG9hZGVyIHN0YXRlcy5cbiAgLyoqXG4gICAqIERlc2NyaWJlcyB0aGUgc3RhdGUgb2YgdGhlIGNvbm5lY3Rpb24sIGJhc2VkIG9uIGBYTUxIdHRwUmVxdWVzdC5yZWFkeVN0YXRlYCwgYnV0IHdpdGhcbiAgICogYWRkaXRpb25hbCBzdGF0ZXMuIEZvciBleGFtcGxlLCBzdGF0ZSA1IGluZGljYXRlcyBhbiBhYm9ydGVkIGNvbm5lY3Rpb24uXG4gICAqL1xuICByZWFkeVN0YXRlOiBSZWFkeVN0YXRlO1xuXG4gIC8qKlxuICAgKiB7QGxpbmsgUmVxdWVzdH0gaW5zdGFuY2UgdXNlZCB0byBjcmVhdGUgdGhlIGNvbm5lY3Rpb24uXG4gICAqL1xuICByZXF1ZXN0OiBSZXF1ZXN0O1xuXG4gIC8qKlxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfSBvZiB7QGxpbmsgUmVzcG9uc2V9LiBDYW4gYmUgc3Vic2NyaWJlZCB0byBpbiBvcmRlciB0byBiZSBub3RpZmllZCB3aGVuIGFcbiAgICogcmVzcG9uc2UgaXMgYXZhaWxhYmxlLlxuICAgKi9cbiAgcmVzcG9uc2U6IFJlcGxheVN1YmplY3Q8UmVzcG9uc2U+O1xuXG4gIGNvbnN0cnVjdG9yKHJlcTogUmVxdWVzdCkge1xuICAgIHRoaXMucmVzcG9uc2UgPSA8YW55Pm5ldyBSZXBsYXlTdWJqZWN0KDEpLnBpcGUodGFrZSgxKSk7XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gUmVhZHlTdGF0ZS5PcGVuO1xuICAgIHRoaXMucmVxdWVzdCA9IHJlcTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIG1vY2sgcmVzcG9uc2UgdG8gdGhlIGNvbm5lY3Rpb24uIFRoaXMgcmVzcG9uc2UgaXMgdGhlIHZhbHVlIHRoYXQgaXMgZW1pdHRlZCB0byB0aGVcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn0gcmV0dXJuZWQgYnkge0BsaW5rIEh0dHB9LlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogdmFyIGNvbm5lY3Rpb247XG4gICAqIGJhY2tlbmQuY29ubmVjdGlvbnMuc3Vic2NyaWJlKGMgPT4gY29ubmVjdGlvbiA9IGMpO1xuICAgKiBodHRwLnJlcXVlc3QoJ2RhdGEuanNvbicpLnN1YnNjcmliZShyZXMgPT4gY29uc29sZS5sb2cocmVzLnRleHQoKSkpO1xuICAgKiBjb25uZWN0aW9uLm1vY2tSZXNwb25kKG5ldyBSZXNwb25zZShuZXcgUmVzcG9uc2VPcHRpb25zKHsgYm9keTogJ2Zha2UgcmVzcG9uc2UnIH0pKSk7IC8vbG9nc1xuICAgKiAnZmFrZSByZXNwb25zZSdcbiAgICogYGBgXG4gICAqXG4gICAqL1xuICBtb2NrUmVzcG9uZChyZXM6IFJlc3BvbnNlKSB7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gUmVhZHlTdGF0ZS5Eb25lIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gUmVhZHlTdGF0ZS5DYW5jZWxsZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ29ubmVjdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlc29sdmVkJyk7XG4gICAgfVxuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGUuRG9uZTtcbiAgICB0aGlzLnJlc3BvbnNlLm5leHQocmVzKTtcbiAgICB0aGlzLnJlc3BvbnNlLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogTm90IHlldCBpbXBsZW1lbnRlZCFcbiAgICpcbiAgICogU2VuZHMgdGhlIHByb3ZpZGVkIHtAbGluayBSZXNwb25zZX0gdG8gdGhlIGBkb3dubG9hZE9ic2VydmVyYCBvZiB0aGUgYFJlcXVlc3RgXG4gICAqIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbm5lY3Rpb24uXG4gICAqL1xuICBtb2NrRG93bmxvYWQocmVzOiBSZXNwb25zZSkge1xuICAgIC8vIHRoaXMucmVxdWVzdC5kb3dubG9hZE9ic2VydmVyLm9uTmV4dChyZXMpO1xuICAgIC8vIGlmIChyZXMuYnl0ZXNMb2FkZWQgPT09IHJlcy50b3RhbEJ5dGVzKSB7XG4gICAgLy8gICB0aGlzLnJlcXVlc3QuZG93bmxvYWRPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vIFRPRE8oamVmZmJjcm9zcyk6IGNvbnNpZGVyIHVzaW5nIFJlc3BvbnNlIHR5cGVcbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBwcm92aWRlZCBlcnJvciBvYmplY3QgYXMgYW4gZXJyb3IgdG8gdGhlIHtAbGluayBSZXNwb25zZX0ge0BsaW5rIEV2ZW50RW1pdHRlcn1cbiAgICogcmV0dXJuZWRcbiAgICogZnJvbSB7QGxpbmsgSHR0cH0uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiB2YXIgY29ubmVjdGlvbjtcbiAgICogYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoYyA9PiBjb25uZWN0aW9uID0gYyk7XG4gICAqIGh0dHAucmVxdWVzdCgnZGF0YS5qc29uJykuc3Vic2NyaWJlKHJlcyA9PiByZXMsIGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKSk7XG4gICAqIGNvbm5lY3Rpb24ubW9ja0Vycm9yKG5ldyBFcnJvcignZXJyb3InKSk7XG4gICAqIGBgYFxuICAgKlxuICAgKi9cbiAgbW9ja0Vycm9yKGVycj86IEVycm9yKSB7XG4gICAgLy8gTWF0Y2hlcyBSZXNvdXJjZUxvYWRlciBzZW1hbnRpY3NcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlLkRvbmU7XG4gICAgdGhpcy5yZXNwb25zZS5lcnJvcihlcnIpO1xuICB9XG59XG5cbi8qKlxuICogQSBtb2NrIGJhY2tlbmQgZm9yIHRlc3RpbmcgdGhlIHtAbGluayBIdHRwfSBzZXJ2aWNlLlxuICpcbiAqIFRoaXMgY2xhc3MgY2FuIGJlIGluamVjdGVkIGluIHRlc3RzLCBhbmQgc2hvdWxkIGJlIHVzZWQgdG8gb3ZlcnJpZGUgcHJvdmlkZXJzXG4gKiB0byBvdGhlciBiYWNrZW5kcywgc3VjaCBhcyB7QGxpbmsgWEhSQmFja2VuZH0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICogaW1wb3J0IHthc3luYywgZmFrZUFzeW5jLCB0aWNrfSBmcm9tICdAYW5ndWxhci9jb3JlL3Rlc3RpbmcnO1xuICogaW1wb3J0IHtCYXNlUmVxdWVzdE9wdGlvbnMsIENvbm5lY3Rpb25CYWNrZW5kLCBIdHRwLCBSZXF1ZXN0T3B0aW9uc30gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gKiBpbXBvcnQge1Jlc3BvbnNlLCBSZXNwb25zZU9wdGlvbnN9IGZyb20gJ0Bhbmd1bGFyL2h0dHAnO1xuICogaW1wb3J0IHtNb2NrQmFja2VuZCwgTW9ja0Nvbm5lY3Rpb259IGZyb20gJ0Bhbmd1bGFyL2h0dHAvdGVzdGluZyc7XG4gKlxuICogY29uc3QgSEVST19PTkUgPSAnSGVyb05yT25lJztcbiAqIGNvbnN0IEhFUk9fVFdPID0gJ1dpbGxCZUFsd2F5c1RoZVNlY29uZCc7XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgSGVyb1NlcnZpY2Uge1xuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHApIHt9XG4gKlxuICogICBnZXRIZXJvZXMoKTogUHJvbWlzZTxTdHJpbmdbXT4ge1xuICogICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KCdteXNlcnZpY2VzLmRlL2FwaS9oZXJvZXMnKVxuICogICAgICAgICAudG9Qcm9taXNlKClcbiAqICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpLmRhdGEpXG4gKiAgICAgICAgIC5jYXRjaChlID0+IHRoaXMuaGFuZGxlRXJyb3IoZSkpO1xuICogICB9XG4gKlxuICogICBwcml2YXRlIGhhbmRsZUVycm9yKGVycm9yOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICogICAgIGNvbnNvbGUuZXJyb3IoJ0FuIGVycm9yIG9jY3VycmVkJywgZXJyb3IpO1xuICogICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvci5tZXNzYWdlIHx8IGVycm9yKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGRlc2NyaWJlKCdNb2NrQmFja2VuZCBIZXJvU2VydmljZSBFeGFtcGxlJywgKCkgPT4ge1xuICogICBiZWZvcmVFYWNoKCgpID0+IHtcbiAqICAgICB0aGlzLmluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKFtcbiAqICAgICAgIHtwcm92aWRlOiBDb25uZWN0aW9uQmFja2VuZCwgdXNlQ2xhc3M6IE1vY2tCYWNrZW5kfSxcbiAqICAgICAgIHtwcm92aWRlOiBSZXF1ZXN0T3B0aW9ucywgdXNlQ2xhc3M6IEJhc2VSZXF1ZXN0T3B0aW9uc30sXG4gKiAgICAgICBIdHRwLFxuICogICAgICAgSGVyb1NlcnZpY2UsXG4gKiAgICAgXSk7XG4gKiAgICAgdGhpcy5oZXJvU2VydmljZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KEhlcm9TZXJ2aWNlKTtcbiAqICAgICB0aGlzLmJhY2tlbmQgPSB0aGlzLmluamVjdG9yLmdldChDb25uZWN0aW9uQmFja2VuZCkgYXMgTW9ja0JhY2tlbmQ7XG4gKiAgICAgdGhpcy5iYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZSgoY29ubmVjdGlvbjogYW55KSA9PiB0aGlzLmxhc3RDb25uZWN0aW9uID0gY29ubmVjdGlvbik7XG4gKiAgIH0pO1xuICpcbiAqICAgaXQoJ2dldEhlcm9lcygpIHNob3VsZCBxdWVyeSBjdXJyZW50IHNlcnZpY2UgdXJsJywgKCkgPT4ge1xuICogICAgIHRoaXMuaGVyb1NlcnZpY2UuZ2V0SGVyb2VzKCk7XG4gKiAgICAgZXhwZWN0KHRoaXMubGFzdENvbm5lY3Rpb24pLnRvQmVEZWZpbmVkKCdubyBodHRwIHNlcnZpY2UgY29ubmVjdGlvbiBhdCBhbGw/Jyk7XG4gKiAgICAgZXhwZWN0KHRoaXMubGFzdENvbm5lY3Rpb24ucmVxdWVzdC51cmwpLnRvTWF0Y2goL2FwaVxcL2hlcm9lcyQvLCAndXJsIGludmFsaWQnKTtcbiAqICAgfSk7XG4gKlxuICogICBpdCgnZ2V0SGVyb2VzKCkgc2hvdWxkIHJldHVybiBzb21lIGhlcm9lcycsIGZha2VBc3luYygoKSA9PiB7XG4gKiAgICAgICAgbGV0IHJlc3VsdDogU3RyaW5nW107XG4gKiAgICAgICAgdGhpcy5oZXJvU2VydmljZS5nZXRIZXJvZXMoKS50aGVuKChoZXJvZXM6IFN0cmluZ1tdKSA9PiByZXN1bHQgPSBoZXJvZXMpO1xuICogICAgICAgIHRoaXMubGFzdENvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKG5ldyBSZXNwb25zZU9wdGlvbnMoe1xuICogICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe2RhdGE6IFtIRVJPX09ORSwgSEVST19UV09dfSksXG4gKiAgICAgICAgfSkpKTtcbiAqICAgICAgICB0aWNrKCk7XG4gKiAgICAgICAgZXhwZWN0KHJlc3VsdC5sZW5ndGgpLnRvRXF1YWwoMiwgJ3Nob3VsZCBjb250YWluIGdpdmVuIGFtb3VudCBvZiBoZXJvZXMnKTtcbiAqICAgICAgICBleHBlY3QocmVzdWx0WzBdKS50b0VxdWFsKEhFUk9fT05FLCAnIEhFUk9fT05FIHNob3VsZCBiZSB0aGUgZmlyc3QgaGVybycpO1xuICogICAgICAgIGV4cGVjdChyZXN1bHRbMV0pLnRvRXF1YWwoSEVST19UV08sICcgSEVST19UV08gc2hvdWxkIGJlIHRoZSBzZWNvbmQgaGVybycpO1xuICogICAgICB9KSk7XG4gKlxuICogICBpdCgnZ2V0SGVyb2VzKCkgd2hpbGUgc2VydmVyIGlzIGRvd24nLCBmYWtlQXN5bmMoKCkgPT4ge1xuICogICAgICAgIGxldCByZXN1bHQ6IFN0cmluZ1tdO1xuICogICAgICAgIGxldCBjYXRjaGVkRXJyb3I6IGFueTtcbiAqICAgICAgICB0aGlzLmhlcm9TZXJ2aWNlLmdldEhlcm9lcygpXG4gKiAgICAgICAgICAgIC50aGVuKChoZXJvZXM6IFN0cmluZ1tdKSA9PiByZXN1bHQgPSBoZXJvZXMpXG4gKiAgICAgICAgICAgIC5jYXRjaCgoZXJyb3I6IGFueSkgPT4gY2F0Y2hlZEVycm9yID0gZXJyb3IpO1xuICogICAgICAgIHRoaXMubGFzdENvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKG5ldyBSZXNwb25zZU9wdGlvbnMoe1xuICogICAgICAgICAgc3RhdHVzOiA0MDQsXG4gKiAgICAgICAgICBzdGF0dXNUZXh0OiAnVVJMIG5vdCBGb3VuZCcsXG4gKiAgICAgICAgfSkpKTtcbiAqICAgICAgICB0aWNrKCk7XG4gKiAgICAgICAgZXhwZWN0KHJlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICogICAgICAgIGV4cGVjdChjYXRjaGVkRXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gKiAgICAgIH0pKTtcbiAqIH0pO1xuICogYGBgXG4gKlxuICogVGhpcyBtZXRob2Qgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICpcbiAqIEBkZXByZWNhdGVkIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaHR0cFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja0JhY2tlbmQgaW1wbGVtZW50cyBDb25uZWN0aW9uQmFja2VuZCB7XG4gIC8qKlxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfVxuICAgKiBvZiB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259IGluc3RhbmNlcyB0aGF0IGhhdmUgYmVlbiBjcmVhdGVkIGJ5IHRoaXMgYmFja2VuZC4gQ2FuIGJlIHN1YnNjcmliZWRcbiAgICogdG8gaW4gb3JkZXIgdG8gcmVzcG9uZCB0byBjb25uZWN0aW9ucy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICAgKiBpbXBvcnQge2Zha2VBc3luYywgdGlja30gZnJvbSAnQGFuZ3VsYXIvY29yZS90ZXN0aW5nJztcbiAgICogaW1wb3J0IHtCYXNlUmVxdWVzdE9wdGlvbnMsIENvbm5lY3Rpb25CYWNrZW5kLCBIdHRwLCBSZXF1ZXN0T3B0aW9uc30gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gICAqIGltcG9ydCB7UmVzcG9uc2UsIFJlc3BvbnNlT3B0aW9uc30gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gICAqIGltcG9ydCB7TW9ja0JhY2tlbmQsIE1vY2tDb25uZWN0aW9ufSBmcm9tICdAYW5ndWxhci9odHRwL3Rlc3RpbmcnO1xuICAgKlxuICAgKiBpdCgnc2hvdWxkIGdldCBhIHJlc3BvbnNlJywgZmFrZUFzeW5jKCgpID0+IHtcbiAgICogICAgICBsZXQgY29ubmVjdGlvbjpcbiAgICogICAgICAgICAgTW9ja0Nvbm5lY3Rpb247ICAvLyB0aGlzIHdpbGwgYmUgc2V0IHdoZW4gYSBuZXcgY29ubmVjdGlvbiBpcyBlbWl0dGVkIGZyb20gdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYmFja2VuZC5cbiAgICogICAgICBsZXQgdGV4dDogc3RyaW5nOyAgICAvLyB0aGlzIHdpbGwgYmUgc2V0IGZyb20gbW9jayByZXNwb25zZVxuICAgKiAgICAgIGxldCBpbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZShbXG4gICAqICAgICAgICB7cHJvdmlkZTogQ29ubmVjdGlvbkJhY2tlbmQsIHVzZUNsYXNzOiBNb2NrQmFja2VuZH0sXG4gICAqICAgICAgICB7cHJvdmlkZTogUmVxdWVzdE9wdGlvbnMsIHVzZUNsYXNzOiBCYXNlUmVxdWVzdE9wdGlvbnN9LFxuICAgKiAgICAgICAgSHR0cCxcbiAgICogICAgICBdKTtcbiAgICogICAgICBsZXQgYmFja2VuZCA9IGluamVjdG9yLmdldChDb25uZWN0aW9uQmFja2VuZCk7XG4gICAqICAgICAgbGV0IGh0dHAgPSBpbmplY3Rvci5nZXQoSHR0cCk7XG4gICAqICAgICAgYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoKGM6IE1vY2tDb25uZWN0aW9uKSA9PiBjb25uZWN0aW9uID0gYyk7XG4gICAqICAgICAgaHR0cC5yZXF1ZXN0KCdzb21ldGhpbmcuanNvbicpLnRvUHJvbWlzZSgpLnRoZW4oKHJlczogYW55KSA9PiB0ZXh0ID0gcmVzLnRleHQoKSk7XG4gICAqICAgICAgY29ubmVjdGlvbi5tb2NrUmVzcG9uZChuZXcgUmVzcG9uc2UobmV3IFJlc3BvbnNlT3B0aW9ucyh7Ym9keTogJ1NvbWV0aGluZyd9KSkpO1xuICAgKiAgICAgIHRpY2soKTtcbiAgICogICAgICBleHBlY3QodGV4dCkudG9CZSgnU29tZXRoaW5nJyk7XG4gICAqICAgIH0pKTtcbiAgICogYGBgXG4gICAqXG4gICAqIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgY29ubmVjdGlvbnM6IGFueTsgIC8vPE1vY2tDb25uZWN0aW9uPlxuXG4gIC8qKlxuICAgKiBBbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiBgY29ubmVjdGlvbnNgLiBUaGlzIGFycmF5IHdpbGwgYmUgdXBkYXRlZCB3aXRoIGVhY2ggY29ubmVjdGlvbiB0aGF0XG4gICAqIGlzIGNyZWF0ZWQgYnkgdGhpcyBiYWNrZW5kLlxuICAgKlxuICAgKiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIGNvbm5lY3Rpb25zQXJyYXk6IE1vY2tDb25uZWN0aW9uW107XG4gIC8qKlxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfSBvZiB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259IGluc3RhbmNlcyB0aGF0IGhhdmVuJ3QgeWV0IGJlZW4gcmVzb2x2ZWQgKGkuZS5cbiAgICogd2l0aCBhIGByZWFkeVN0YXRlYFxuICAgKiBsZXNzIHRoYW4gNCkuIFVzZWQgaW50ZXJuYWxseSB0byB2ZXJpZnkgdGhhdCBubyBjb25uZWN0aW9ucyBhcmUgcGVuZGluZyB2aWEgdGhlXG4gICAqIGB2ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0c2AgbWV0aG9kLlxuICAgKlxuICAgKiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIHBlbmRpbmdDb25uZWN0aW9uczogYW55OyAgLy8gU3ViamVjdDxNb2NrQ29ubmVjdGlvbj5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uc0FycmF5ID0gW107XG4gICAgdGhpcy5jb25uZWN0aW9ucyA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5jb25uZWN0aW9ucy5zdWJzY3JpYmUoXG4gICAgICAgIChjb25uZWN0aW9uOiBNb2NrQ29ubmVjdGlvbikgPT4gdGhpcy5jb25uZWN0aW9uc0FycmF5LnB1c2goY29ubmVjdGlvbikpO1xuICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IFN1YmplY3QoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgYWxsIGNvbm5lY3Rpb25zLCBhbmQgcmFpc2VzIGFuIGV4Y2VwdGlvbiBpZiBhbnkgY29ubmVjdGlvbiBoYXMgbm90IHJlY2VpdmVkIGEgcmVzcG9uc2UuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIHZlcmlmeU5vUGVuZGluZ1JlcXVlc3RzKCkge1xuICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICB0aGlzLnBlbmRpbmdDb25uZWN0aW9ucy5zdWJzY3JpYmUoKGM6IE1vY2tDb25uZWN0aW9uKSA9PiBwZW5kaW5nKyspO1xuICAgIGlmIChwZW5kaW5nID4gMCkgdGhyb3cgbmV3IEVycm9yKGAke3BlbmRpbmd9IHBlbmRpbmcgY29ubmVjdGlvbnMgdG8gYmUgcmVzb2x2ZWRgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYW4gYmUgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGB2ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0c2AgdG8gcmVzb2x2ZSBhbnkgbm90LXlldC1yZXNvbHZlXG4gICAqIGNvbm5lY3Rpb25zLCBpZiBpdCdzIGV4cGVjdGVkIHRoYXQgdGhlcmUgYXJlIGNvbm5lY3Rpb25zIHRoYXQgaGF2ZSBub3QgeWV0IHJlY2VpdmVkIGEgcmVzcG9uc2UuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIHJlc29sdmVBbGxDb25uZWN0aW9ucygpIHsgdGhpcy5jb25uZWN0aW9ucy5zdWJzY3JpYmUoKGM6IE1vY2tDb25uZWN0aW9uKSA9PiBjLnJlYWR5U3RhdGUgPSA0KTsgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHtAbGluayBNb2NrQ29ubmVjdGlvbn0uIFRoaXMgaXMgZXF1aXZhbGVudCB0byBjYWxsaW5nIGBuZXdcbiAgICogTW9ja0Nvbm5lY3Rpb24oKWAsIGV4Y2VwdCB0aGF0IGl0IGFsc28gd2lsbCBlbWl0IHRoZSBuZXcgYENvbm5lY3Rpb25gIHRvIHRoZSBgY29ubmVjdGlvbnNgXG4gICAqIGVtaXR0ZXIgb2YgdGhpcyBgTW9ja0JhY2tlbmRgIGluc3RhbmNlLiBUaGlzIG1ldGhvZCB3aWxsIHVzdWFsbHkgb25seSBiZSB1c2VkIGJ5IHRlc3RzXG4gICAqIGFnYWluc3QgdGhlIGZyYW1ld29yayBpdHNlbGYsIG5vdCBieSBlbmQtdXNlcnMuXG4gICAqL1xuICBjcmVhdGVDb25uZWN0aW9uKHJlcTogUmVxdWVzdCk6IE1vY2tDb25uZWN0aW9uIHtcbiAgICBpZiAoIXJlcSB8fCAhKHJlcSBpbnN0YW5jZW9mIFJlcXVlc3QpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGNyZWF0ZUNvbm5lY3Rpb24gcmVxdWlyZXMgYW4gaW5zdGFuY2Ugb2YgUmVxdWVzdCwgZ290ICR7cmVxfWApO1xuICAgIH1cbiAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IE1vY2tDb25uZWN0aW9uKHJlcSk7XG4gICAgdGhpcy5jb25uZWN0aW9ucy5uZXh0KGNvbm5lY3Rpb24pO1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG59XG4iXX0=