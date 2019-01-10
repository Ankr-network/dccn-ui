/**
 * @license NgRx 6.0.1
 * (c) 2015-2018 Brandon Roberts, Mike Ryan, Rob Wormald, Victor Savkin
 * License: MIT
 */
import { Inject, InjectionToken, NgModule } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router, RoutesRecognized } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { of } from 'rxjs';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @abstract
 * @template T
 */
class RouterStateSerializer {
}
/**
 * @record
 */

class DefaultRouterStateSerializer {
    /**
     * @param {?} routerState
     * @return {?}
     */
    serialize(routerState) {
        return {
            root: this.serializeRoute(routerState.root),
            url: routerState.url,
        };
    }
    /**
     * @param {?} route
     * @return {?}
     */
    serializeRoute(route) {
        const /** @type {?} */ children = route.children.map(c => this.serializeRoute(c));
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
            component: /** @type {?} */ ((route.routeConfig
                ? route.routeConfig.component
                : undefined)),
            root: /** @type {?} */ (undefined),
            parent: /** @type {?} */ (undefined),
            firstChild: children[0],
            pathFromRoot: /** @type {?} */ (undefined),
            children,
        };
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * An action dispatched when the router navigates.
 */
const ROUTER_NAVIGATION = 'ROUTER_NAVIGATION';
/**
 * An action dispatched when the router cancels navigation.
 */
const ROUTER_CANCEL = 'ROUTER_CANCEL';
/**
 * An action dispatched when the router errors.
 */
const ROUTER_ERROR = 'ROUTE_ERROR';
/**
 * @template T
 * @param {?} state
 * @param {?} action
 * @return {?}
 */
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
            return /** @type {?} */ (state);
    }
}
/**
 * @record
 */

const _ROUTER_CONFIG = new InjectionToken('@ngrx/router-store Internal Configuration');
const ROUTER_CONFIG = new InjectionToken('@ngrx/router-store Configuration');
const DEFAULT_ROUTER_FEATURENAME = 'routerReducer';
/**
 * @param {?} config
 * @return {?}
 */
function _createDefaultRouterConfig(config) {
    let /** @type {?} */ _config;
    if (typeof config === 'function') {
        _config = config();
    }
    else {
        _config = config || {};
    }
    return Object.assign({ stateKey: DEFAULT_ROUTER_FEATURENAME }, _config);
}
const ɵ0 = { stateKey: DEFAULT_ROUTER_FEATURENAME };
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
 * \@NgModule({
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
class StoreRouterConnectingModule {
    /**
     * @param {?} store
     * @param {?} router
     * @param {?} serializer
     * @param {?} config
     */
    constructor(store$$1, router$$1, serializer, config) {
        this.store = store$$1;
        this.router = router$$1;
        this.serializer = serializer;
        this.config = config;
        this.dispatchTriggeredByRouter = false;
        this.navigationTriggeredByDispatch = false;
        this.stateKey = /** @type {?} */ (this.config.stateKey);
        this.setUpBeforePreactivationHook();
        this.setUpStoreStateListener();
        this.setUpStateRollbackEvents();
    }
    /**
     * @param {?=} config
     * @return {?}
     */
    static forRoot(config = {}) {
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
    }
    /**
     * @return {?}
     */
    setUpBeforePreactivationHook() {
        (/** @type {?} */ (this.router)).hooks.beforePreactivation = (routerState) => {
            this.routerState = this.serializer.serialize(routerState);
            if (this.shouldDispatchRouterNavigation()) {
                this.dispatchRouterNavigation();
            }
            return of(true);
        };
    }
    /**
     * @return {?}
     */
    setUpStoreStateListener() {
        this.store.subscribe(s => {
            this.storeState = s;
        });
        this.store.pipe(select(this.stateKey)).subscribe(() => {
            this.navigateIfNeeded();
        });
    }
    /**
     * @return {?}
     */
    shouldDispatchRouterNavigation() {
        if (!this.storeState[this.stateKey])
            return true;
        return !this.navigationTriggeredByDispatch;
    }
    /**
     * @return {?}
     */
    navigateIfNeeded() {
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
    }
    /**
     * @return {?}
     */
    setUpStateRollbackEvents() {
        this.router.events.subscribe(e => {
            if (e instanceof RoutesRecognized) {
                this.lastRoutesRecognized = e;
            }
            else if (e instanceof NavigationCancel) {
                this.dispatchRouterCancel(e);
            }
            else if (e instanceof NavigationError) {
                this.dispatchRouterError(e);
            }
            else if (e instanceof NavigationEnd) {
                this.dispatchTriggeredByRouter = false;
                this.navigationTriggeredByDispatch = false;
            }
        });
    }
    /**
     * @return {?}
     */
    dispatchRouterNavigation() {
        this.dispatchRouterAction(ROUTER_NAVIGATION, {
            routerState: this.routerState,
            event: new RoutesRecognized(this.lastRoutesRecognized.id, this.lastRoutesRecognized.url, this.lastRoutesRecognized.urlAfterRedirects, this.routerState),
        });
    }
    /**
     * @param {?} event
     * @return {?}
     */
    dispatchRouterCancel(event) {
        this.dispatchRouterAction(ROUTER_CANCEL, {
            routerState: this.routerState,
            storeState: this.storeState,
            event,
        });
    }
    /**
     * @param {?} event
     * @return {?}
     */
    dispatchRouterError(event) {
        this.dispatchRouterAction(ROUTER_ERROR, {
            routerState: this.routerState,
            storeState: this.storeState,
            event: new NavigationError(event.id, event.url, `${event}`),
        });
    }
    /**
     * @param {?} type
     * @param {?} payload
     * @return {?}
     */
    dispatchRouterAction(type, payload) {
        this.dispatchTriggeredByRouter = true;
        try {
            this.store.dispatch({ type, payload });
        }
        finally {
            this.dispatchTriggeredByRouter = false;
            this.navigationTriggeredByDispatch = false;
        }
    }
}
StoreRouterConnectingModule.decorators = [
    { type: NgModule, args: [{
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
StoreRouterConnectingModule.ctorParameters = () => [
    { type: Store, },
    { type: Router, },
    { type: RouterStateSerializer, },
    { type: undefined, decorators: [{ type: Inject, args: [ROUTER_CONFIG,] },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * DO NOT EDIT
 *
 * This file is automatically generated at build
 */

/**
 * Generated bundle index. Do not edit.
 */

export { _ROUTER_CONFIG as ɵngrx_modules_router_store_router_store_a, _createDefaultRouterConfig as ɵngrx_modules_router_store_router_store_b, ROUTER_ERROR, ROUTER_CANCEL, ROUTER_NAVIGATION, routerReducer, StoreRouterConnectingModule, ROUTER_CONFIG, DEFAULT_ROUTER_FEATURENAME, RouterStateSerializer, DefaultRouterStateSerializer };
//# sourceMappingURL=router-store.js.map
