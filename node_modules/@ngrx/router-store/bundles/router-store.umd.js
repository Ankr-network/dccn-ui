/**
 * @license NgRx 6.0.1
 * (c) 2015-2018 Brandon Roberts, Mike Ryan, Rob Wormald, Victor Savkin
 * License: MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/router'), require('@ngrx/store'), require('rxjs')) :
	typeof define === 'function' && define.amd ? define('@ngrx/router-store', ['exports', '@angular/core', '@angular/router', '@ngrx/store', 'rxjs'], factory) :
	(factory((global.ngrx = global.ngrx || {}, global.ngrx.routerStore = {}),global.ng.core,global.ng.router,global['@ngrx/store'],global.rxjs));
}(this, (function (exports,core,router,store,rxjs) { 'use strict';

var RouterStateSerializer = /** @class */ (function () {
    function RouterStateSerializer() {
    }
    return RouterStateSerializer;
}());
var DefaultRouterStateSerializer = /** @class */ (function () {
    function DefaultRouterStateSerializer() {
    }
    DefaultRouterStateSerializer.prototype.serialize = function (routerState) {
        return {
            root: this.serializeRoute(routerState.root),
            url: routerState.url,
        };
    };
    DefaultRouterStateSerializer.prototype.serializeRoute = function (route) {
        var _this = this;
        var children = route.children.map(function (c) { return _this.serializeRoute(c); });
        return {
            params: route.params,
            paramMap: route.paramMap,
            data: route.data,
            url: route.url,
            outlet: route.outlet,
            routeConfig: {
                component: route.routeConfig ? route.routeConfig.component : undefined,
            },
            queryParams: route.queryParams,
            queryParamMap: route.queryParamMap,
            fragment: route.fragment,
            component: (route.routeConfig
                ? route.routeConfig.component
                : undefined),
            root: undefined,
            parent: undefined,
            firstChild: children[0],
            pathFromRoot: undefined,
            children: children,
        };
    };
    return DefaultRouterStateSerializer;
}());

var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
/**
 * An action dispatched when the router navigates.
 */
var ROUTER_NAVIGATION = 'ROUTER_NAVIGATION';
/**
 * An action dispatched when the router cancels navigation.
 */
var ROUTER_CANCEL = 'ROUTER_CANCEL';
/**
 * An action dispatched when the router errors.
 */
var ROUTER_ERROR = 'ROUTE_ERROR';
function routerReducer(state, action) {
    switch (action.type) {
        case ROUTER_NAVIGATION:
        case ROUTER_ERROR:
        case ROUTER_CANCEL:
            return {
                state: action.payload.routerState,
                navigationId: action.payload.event.id,
            };
        default:
            return state;
    }
}
var _ROUTER_CONFIG = new core.InjectionToken('@ngrx/router-store Internal Configuration');
var ROUTER_CONFIG = new core.InjectionToken('@ngrx/router-store Configuration');
var DEFAULT_ROUTER_FEATURENAME = 'routerReducer';
function _createDefaultRouterConfig(config) {
    var _config;
    if (typeof config === 'function') {
        _config = config();
    }
    else {
        _config = config || {};
    }
    return __assign({ stateKey: DEFAULT_ROUTER_FEATURENAME }, _config);
}
var ɵ0 = { stateKey: DEFAULT_ROUTER_FEATURENAME };
/**
 * Connects RouterModule with StoreModule.
 *
 * During the navigation, before any guards or resolvers run, the router will dispatch
 * a ROUTER_NAVIGATION action, which has the following signature:
 *
 * ```
 * export type RouterNavigationPayload = {
 *   routerState: SerializedRouterStateSnapshot,
 *   event: RoutesRecognized
 * }
 * ```
 *
 * Either a reducer or an effect can be invoked in response to this action.
 * If the invoked reducer throws, the navigation will be canceled.
 *
 * If navigation gets canceled because of a guard, a ROUTER_CANCEL action will be
 * dispatched. If navigation results in an error, a ROUTER_ERROR action will be dispatched.
 *
 * Both ROUTER_CANCEL and ROUTER_ERROR contain the store state before the navigation
 * which can be used to restore the consistency of the store.
 *
 * Usage:
 *
 * ```typescript
 * @NgModule({
 *   declarations: [AppCmp, SimpleCmp],
 *   imports: [
 *     BrowserModule,
 *     StoreModule.forRoot(mapOfReducers),
 *     RouterModule.forRoot([
 *       { path: '', component: SimpleCmp },
 *       { path: 'next', component: SimpleCmp }
 *     ]),
 *     StoreRouterConnectingModule
 *   ],
 *   bootstrap: [AppCmp]
 * })
 * export class AppModule {
 * }
 * ```
 */
var StoreRouterConnectingModule = /** @class */ (function () {
    function StoreRouterConnectingModule(store$$1, router$$1, serializer, config) {
        this.store = store$$1;
        this.router = router$$1;
        this.serializer = serializer;
        this.config = config;
        this.dispatchTriggeredByRouter = false;
        this.navigationTriggeredByDispatch = false;
        this.stateKey = this.config.stateKey;
        this.setUpBeforePreactivationHook();
        this.setUpStoreStateListener();
        this.setUpStateRollbackEvents();
    }
    StoreRouterConnectingModule.forRoot = function (config) {
        if (config === void 0) { config = {}; }
        return {
            ngModule: StoreRouterConnectingModule,
            providers: [
                { provide: _ROUTER_CONFIG, useValue: config },
                {
                    provide: ROUTER_CONFIG,
                    useFactory: _createDefaultRouterConfig,
                    deps: [_ROUTER_CONFIG],
                },
            ],
        };
    };
    StoreRouterConnectingModule.prototype.setUpBeforePreactivationHook = function () {
        var _this = this;
        this.router.hooks.beforePreactivation = function (routerState) {
            _this.routerState = _this.serializer.serialize(routerState);
            if (_this.shouldDispatchRouterNavigation()) {
                _this.dispatchRouterNavigation();
            }
            return rxjs.of(true);
        };
    };
    StoreRouterConnectingModule.prototype.setUpStoreStateListener = function () {
        var _this = this;
        this.store.subscribe(function (s) {
            _this.storeState = s;
        });
        this.store.pipe(store.select(this.stateKey)).subscribe(function () {
            _this.navigateIfNeeded();
        });
    };
    StoreRouterConnectingModule.prototype.shouldDispatchRouterNavigation = function () {
        if (!this.storeState[this.stateKey])
            return true;
        return !this.navigationTriggeredByDispatch;
    };
    StoreRouterConnectingModule.prototype.navigateIfNeeded = function () {
        if (!this.storeState[this.stateKey] ||
            !this.storeState[this.stateKey].state) {
            return;
        }
        if (this.dispatchTriggeredByRouter)
            return;
        if (this.router.url !== this.storeState[this.stateKey].state.url) {
            this.navigationTriggeredByDispatch = true;
            this.router.navigateByUrl(this.storeState[this.stateKey].state.url);
        }
    };
    StoreRouterConnectingModule.prototype.setUpStateRollbackEvents = function () {
        var _this = this;
        this.router.events.subscribe(function (e) {
            if (e instanceof router.RoutesRecognized) {
                _this.lastRoutesRecognized = e;
            }
            else if (e instanceof router.NavigationCancel) {
                _this.dispatchRouterCancel(e);
            }
            else if (e instanceof router.NavigationError) {
                _this.dispatchRouterError(e);
            }
            else if (e instanceof router.NavigationEnd) {
                _this.dispatchTriggeredByRouter = false;
                _this.navigationTriggeredByDispatch = false;
            }
        });
    };
    StoreRouterConnectingModule.prototype.dispatchRouterNavigation = function () {
        this.dispatchRouterAction(ROUTER_NAVIGATION, {
            routerState: this.routerState,
            event: new router.RoutesRecognized(this.lastRoutesRecognized.id, this.lastRoutesRecognized.url, this.lastRoutesRecognized.urlAfterRedirects, this.routerState),
        });
    };
    StoreRouterConnectingModule.prototype.dispatchRouterCancel = function (event) {
        this.dispatchRouterAction(ROUTER_CANCEL, {
            routerState: this.routerState,
            storeState: this.storeState,
            event: event,
        });
    };
    StoreRouterConnectingModule.prototype.dispatchRouterError = function (event) {
        this.dispatchRouterAction(ROUTER_ERROR, {
            routerState: this.routerState,
            storeState: this.storeState,
            event: new router.NavigationError(event.id, event.url, "" + event),
        });
    };
    StoreRouterConnectingModule.prototype.dispatchRouterAction = function (type, payload) {
        this.dispatchTriggeredByRouter = true;
        try {
            this.store.dispatch({ type: type, payload: payload });
        }
        finally {
            this.dispatchTriggeredByRouter = false;
            this.navigationTriggeredByDispatch = false;
        }
    };
    StoreRouterConnectingModule.decorators = [
        { type: core.NgModule, args: [{
                    providers: [
                        { provide: RouterStateSerializer, useClass: DefaultRouterStateSerializer },
                        {
                            provide: _ROUTER_CONFIG,
                            useValue: ɵ0,
                        },
                        {
                            provide: ROUTER_CONFIG,
                            useFactory: _createDefaultRouterConfig,
                            deps: [_ROUTER_CONFIG],
                        },
                    ],
                },] }
    ];
    /** @nocollapse */
    StoreRouterConnectingModule.ctorParameters = function () { return [
        { type: store.Store, },
        { type: router.Router, },
        { type: RouterStateSerializer, },
        { type: undefined, decorators: [{ type: core.Inject, args: [ROUTER_CONFIG,] },] },
    ]; };
    return StoreRouterConnectingModule;
}());

/**
 * DO NOT EDIT
 *
 * This file is automatically generated at build
 */

/**
 * Generated bundle index. Do not edit.
 */

exports.ɵngrx_modules_router_store_router_store_a = _ROUTER_CONFIG;
exports.ɵngrx_modules_router_store_router_store_b = _createDefaultRouterConfig;
exports.ROUTER_ERROR = ROUTER_ERROR;
exports.ROUTER_CANCEL = ROUTER_CANCEL;
exports.ROUTER_NAVIGATION = ROUTER_NAVIGATION;
exports.routerReducer = routerReducer;
exports.StoreRouterConnectingModule = StoreRouterConnectingModule;
exports.ROUTER_CONFIG = ROUTER_CONFIG;
exports.DEFAULT_ROUTER_FEATURENAME = DEFAULT_ROUTER_FEATURENAME;
exports.RouterStateSerializer = RouterStateSerializer;
exports.DefaultRouterStateSerializer = DefaultRouterStateSerializer;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=router-store.umd.js.map
