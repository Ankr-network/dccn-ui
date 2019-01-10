/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Inject, InjectionToken, NgModule, } from '@angular/core';
import { NavigationCancel, NavigationError, NavigationEnd, Router, RoutesRecognized, } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { DefaultRouterStateSerializer, RouterStateSerializer, } from './serializer';
/**
 * An action dispatched when the router navigates.
 */
export const /** @type {?} */ ROUTER_NAVIGATION = 'ROUTER_NAVIGATION';
/**
 * An action dispatched when the router cancels navigation.
 */
export const /** @type {?} */ ROUTER_CANCEL = 'ROUTER_CANCEL';
/**
 * An action dispatched when the router errors.
 */
export const /** @type {?} */ ROUTER_ERROR = 'ROUTE_ERROR';
/**
 * @template T
 * @param {?} state
 * @param {?} action
 * @return {?}
 */
export function routerReducer(state, action) {
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
export function StoreRouterConfig() { }
function StoreRouterConfig_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    StoreRouterConfig.prototype.stateKey;
}
export const /** @type {?} */ _ROUTER_CONFIG = new InjectionToken('@ngrx/router-store Internal Configuration');
export const /** @type {?} */ ROUTER_CONFIG = new InjectionToken('@ngrx/router-store Configuration');
export const /** @type {?} */ DEFAULT_ROUTER_FEATURENAME = 'routerReducer';
/**
 * @param {?} config
 * @return {?}
 */
export function _createDefaultRouterConfig(config) {
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
export class StoreRouterConnectingModule {
    /**
     * @param {?} store
     * @param {?} router
     * @param {?} serializer
     * @param {?} config
     */
    constructor(store, router, serializer, config) {
        this.store = store;
        this.router = router;
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
function StoreRouterConnectingModule_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    StoreRouterConnectingModule.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    StoreRouterConnectingModule.ctorParameters;
    /** @type {?} */
    StoreRouterConnectingModule.prototype.routerState;
    /** @type {?} */
    StoreRouterConnectingModule.prototype.storeState;
    /** @type {?} */
    StoreRouterConnectingModule.prototype.lastRoutesRecognized;
    /** @type {?} */
    StoreRouterConnectingModule.prototype.dispatchTriggeredByRouter;
    /** @type {?} */
    StoreRouterConnectingModule.prototype.navigationTriggeredByDispatch;
    /** @type {?} */
    StoreRouterConnectingModule.prototype.stateKey;
    /** @type {?} */
    StoreRouterConnectingModule.prototype.store;
    /** @type {?} */
    StoreRouterConnectingModule.prototype.router;
    /** @type {?} */
    StoreRouterConnectingModule.prototype.serializer;
    /** @type {?} */
    StoreRouterConnectingModule.prototype.config;
}
export { ɵ0 };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3N0b3JlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvcm91dGVyLXN0b3JlL3NyYy9yb3V0ZXJfc3RvcmVfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQ0wsTUFBTSxFQUNOLGNBQWMsRUFFZCxRQUFRLEdBQ1QsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixlQUFlLEVBQ2YsYUFBYSxFQUNiLE1BQU0sRUFFTixnQkFBZ0IsR0FDakIsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUM1QyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTFCLE9BQU8sRUFDTCw0QkFBNEIsRUFDNUIscUJBQXFCLEdBRXRCLE1BQU0sY0FBYyxDQUFDOzs7O0FBS3RCLE1BQU0sQ0FBQyx1QkFBTSxpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQzs7OztBQXFCckQsTUFBTSxDQUFDLHVCQUFNLGFBQWEsR0FBRyxlQUFlLENBQUM7Ozs7QUFzQjdDLE1BQU0sQ0FBQyx1QkFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDOzs7Ozs7O0FBZ0MxQyxNQUFNLHdCQUNKLEtBQXdDLEVBQ3hDLE1BQTRCO0lBRTVCLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLEtBQUssaUJBQWlCLENBQUM7UUFDdkIsS0FBSyxZQUFZLENBQUM7UUFDbEIsS0FBSyxhQUFhO1lBQ2hCLE1BQU0sQ0FBQztnQkFDTCxLQUFLLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO2dCQUNqQyxZQUFZLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTthQUN0QyxDQUFDO1FBQ0o7WUFDRSxNQUFNLG1CQUFDLEtBQThCLEVBQUM7S0FDekM7Q0FDRjs7Ozs7Ozs7O0FBTUQsTUFBTSxDQUFDLHVCQUFNLGNBQWMsR0FBRyxJQUFJLGNBQWMsQ0FDOUMsMkNBQTJDLENBQzVDLENBQUM7QUFDRixNQUFNLENBQUMsdUJBQU0sYUFBYSxHQUFHLElBQUksY0FBYyxDQUM3QyxrQ0FBa0MsQ0FDbkMsQ0FBQztBQUNGLE1BQU0sQ0FBQyx1QkFBTSwwQkFBMEIsR0FBRyxlQUFlLENBQUM7Ozs7O0FBRTFELE1BQU0scUNBQ0osTUFBcUQ7SUFFckQscUJBQUksT0FBMEIsQ0FBQztJQUUvQixFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQztLQUNwQjtJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sT0FBTyxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUM7S0FDeEI7SUFFRCxNQUFNLGlCQUNKLFFBQVEsRUFBRSwwQkFBMEIsSUFDakMsT0FBTyxFQUNWO0NBQ0g7V0FtRGUsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFTeEQsTUFBTTs7Ozs7OztJQTRCSixZQUNVLE9BQ0EsUUFDQSxZQUN1QjtRQUh2QixVQUFLLEdBQUwsS0FBSztRQUNMLFdBQU0sR0FBTixNQUFNO1FBQ04sZUFBVSxHQUFWLFVBQVU7UUFDYSxXQUFNLEdBQU4sTUFBTTt5Q0FSTSxLQUFLOzZDQUNELEtBQUs7UUFTcEQsSUFBSSxDQUFDLFFBQVEscUJBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFrQixDQUFBLENBQUM7UUFFL0MsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7S0FDakM7Ozs7O0lBbkNELE1BQU0sQ0FBQyxPQUFPLENBQ1osU0FBd0QsRUFBRTtRQUUxRCxNQUFNLENBQUM7WUFDTCxRQUFRLEVBQUUsMkJBQTJCO1lBQ3JDLFNBQVMsRUFBRTtnQkFDVCxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRTtnQkFDN0M7b0JBQ0UsT0FBTyxFQUFFLGFBQWE7b0JBQ3RCLFVBQVUsRUFBRSwwQkFBMEI7b0JBQ3RDLElBQUksRUFBRSxDQUFDLGNBQWMsQ0FBQztpQkFDdkI7YUFDRjtTQUNGLENBQUM7S0FDSDs7OztJQXVCTyw0QkFBNEI7UUFDbEMsbUJBQU0sSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRyxDQUM3QyxXQUFnQyxFQUNoQyxFQUFFO1lBQ0YsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMxRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2FBQ2pDO1lBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNqQixDQUFDOzs7OztJQUdJLHVCQUF1QjtRQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztTQUNyQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNwRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUN6QixDQUFDLENBQUM7Ozs7O0lBR0csOEJBQThCO1FBQ3BDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQzs7Ozs7SUFHckMsZ0JBQWdCO1FBQ3RCLEVBQUUsQ0FBQyxDQUNELENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQy9CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FDbEMsQ0FBQyxDQUFDLENBQUM7WUFDRCxNQUFNLENBQUM7U0FDUjtRQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUUzQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsNkJBQTZCLEdBQUcsSUFBSSxDQUFDO1lBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyRTs7Ozs7SUFHSyx3QkFBd0I7UUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUM7YUFDL0I7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzlCO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxlQUFlLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDN0I7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxLQUFLLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyw2QkFBNkIsR0FBRyxLQUFLLENBQUM7YUFDNUM7U0FDRixDQUFDLENBQUM7Ozs7O0lBR0csd0JBQXdCO1FBQzlCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsRUFBRTtZQUMzQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsS0FBSyxFQUFFLElBQUksZ0JBQWdCLENBQ3pCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEVBQzVCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEVBQzdCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsRUFDM0MsSUFBSSxDQUFDLFdBQVcsQ0FDakI7U0FDRixDQUFDLENBQUM7Ozs7OztJQUdHLG9CQUFvQixDQUFDLEtBQXVCO1FBQ2xELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLEVBQUU7WUFDdkMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtZQUMzQixLQUFLO1NBQ04sQ0FBQyxDQUFDOzs7Ozs7SUFHRyxtQkFBbUIsQ0FBQyxLQUFzQjtRQUNoRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxFQUFFO1lBQ3RDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDM0IsS0FBSyxFQUFFLElBQUksZUFBZSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssRUFBRSxDQUFDO1NBQzVELENBQUMsQ0FBQzs7Ozs7OztJQUdHLG9CQUFvQixDQUFDLElBQVksRUFBRSxPQUFZO1FBQ3JELElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUM7UUFDdEMsSUFBSSxDQUFDO1lBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUN4QztnQkFBUyxDQUFDO1lBQ1QsSUFBSSxDQUFDLHlCQUF5QixHQUFHLEtBQUssQ0FBQztZQUN2QyxJQUFJLENBQUMsNkJBQTZCLEdBQUcsS0FBSyxDQUFDO1NBQzVDOzs7O1lBbEpKLFFBQVEsU0FBQztnQkFDUixTQUFTLEVBQUU7b0JBQ1QsRUFBRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsUUFBUSxFQUFFLDRCQUE0QixFQUFFO29CQUMxRTt3QkFDRSxPQUFPLEVBQUUsY0FBYzt3QkFDdkIsUUFBUSxJQUEwQztxQkFDbkQ7b0JBQ0Q7d0JBQ0UsT0FBTyxFQUFFLGFBQWE7d0JBQ3RCLFVBQVUsRUFBRSwwQkFBMEI7d0JBQ3RDLElBQUksRUFBRSxDQUFDLGNBQWMsQ0FBQztxQkFDdkI7aUJBQ0Y7YUFDRjs7OztZQTlMZ0IsS0FBSztZQUpwQixNQUFNO1lBU04scUJBQXFCOzRDQTBObEIsTUFBTSxTQUFDLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBJbmplY3QsXG4gIEluamVjdGlvblRva2VuLFxuICBNb2R1bGVXaXRoUHJvdmlkZXJzLFxuICBOZ01vZHVsZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBOYXZpZ2F0aW9uQ2FuY2VsLFxuICBOYXZpZ2F0aW9uRXJyb3IsXG4gIE5hdmlnYXRpb25FbmQsXG4gIFJvdXRlcixcbiAgUm91dGVyU3RhdGVTbmFwc2hvdCxcbiAgUm91dGVzUmVjb2duaXplZCxcbn0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IHNlbGVjdCwgU3RvcmUgfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBvZiB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge1xuICBEZWZhdWx0Um91dGVyU3RhdGVTZXJpYWxpemVyLFxuICBSb3V0ZXJTdGF0ZVNlcmlhbGl6ZXIsXG4gIFNlcmlhbGl6ZWRSb3V0ZXJTdGF0ZVNuYXBzaG90LFxufSBmcm9tICcuL3NlcmlhbGl6ZXInO1xuXG4vKipcbiAqIEFuIGFjdGlvbiBkaXNwYXRjaGVkIHdoZW4gdGhlIHJvdXRlciBuYXZpZ2F0ZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfTkFWSUdBVElPTiA9ICdST1VURVJfTkFWSUdBVElPTic7XG5cbi8qKlxuICogUGF5bG9hZCBvZiBST1VURVJfTkFWSUdBVElPTi5cbiAqL1xuZXhwb3J0IHR5cGUgUm91dGVyTmF2aWdhdGlvblBheWxvYWQ8VD4gPSB7XG4gIHJvdXRlclN0YXRlOiBUO1xuICBldmVudDogUm91dGVzUmVjb2duaXplZDtcbn07XG5cbi8qKlxuICogQW4gYWN0aW9uIGRpc3BhdGNoZWQgd2hlbiB0aGUgcm91dGVyIG5hdmlnYXRlcy5cbiAqL1xuZXhwb3J0IHR5cGUgUm91dGVyTmF2aWdhdGlvbkFjdGlvbjxUID0gU2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Q+ID0ge1xuICB0eXBlOiB0eXBlb2YgUk9VVEVSX05BVklHQVRJT047XG4gIHBheWxvYWQ6IFJvdXRlck5hdmlnYXRpb25QYXlsb2FkPFQ+O1xufTtcblxuLyoqXG4gKiBBbiBhY3Rpb24gZGlzcGF0Y2hlZCB3aGVuIHRoZSByb3V0ZXIgY2FuY2VscyBuYXZpZ2F0aW9uLlxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX0NBTkNFTCA9ICdST1VURVJfQ0FOQ0VMJztcblxuLyoqXG4gKiBQYXlsb2FkIG9mIFJPVVRFUl9DQU5DRUwuXG4gKi9cbmV4cG9ydCB0eXBlIFJvdXRlckNhbmNlbFBheWxvYWQ8VCwgVj4gPSB7XG4gIHJvdXRlclN0YXRlOiBWO1xuICBzdG9yZVN0YXRlOiBUO1xuICBldmVudDogTmF2aWdhdGlvbkNhbmNlbDtcbn07XG5cbi8qKlxuICogQW4gYWN0aW9uIGRpc3BhdGNoZWQgd2hlbiB0aGUgcm91dGVyIGNhbmNlbCBuYXZpZ2F0aW9uLlxuICovXG5leHBvcnQgdHlwZSBSb3V0ZXJDYW5jZWxBY3Rpb248VCwgViA9IFNlcmlhbGl6ZWRSb3V0ZXJTdGF0ZVNuYXBzaG90PiA9IHtcbiAgdHlwZTogdHlwZW9mIFJPVVRFUl9DQU5DRUw7XG4gIHBheWxvYWQ6IFJvdXRlckNhbmNlbFBheWxvYWQ8VCwgVj47XG59O1xuXG4vKipcbiAqIEFuIGFjdGlvbiBkaXNwYXRjaGVkIHdoZW4gdGhlIHJvdXRlciBlcnJvcnMuXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfRVJST1IgPSAnUk9VVEVfRVJST1InO1xuXG4vKipcbiAqIFBheWxvYWQgb2YgUk9VVEVSX0VSUk9SLlxuICovXG5leHBvcnQgdHlwZSBSb3V0ZXJFcnJvclBheWxvYWQ8VCwgVj4gPSB7XG4gIHJvdXRlclN0YXRlOiBWO1xuICBzdG9yZVN0YXRlOiBUO1xuICBldmVudDogTmF2aWdhdGlvbkVycm9yO1xufTtcblxuLyoqXG4gKiBBbiBhY3Rpb24gZGlzcGF0Y2hlZCB3aGVuIHRoZSByb3V0ZXIgZXJyb3JzLlxuICovXG5leHBvcnQgdHlwZSBSb3V0ZXJFcnJvckFjdGlvbjxULCBWID0gU2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Q+ID0ge1xuICB0eXBlOiB0eXBlb2YgUk9VVEVSX0VSUk9SO1xuICBwYXlsb2FkOiBSb3V0ZXJFcnJvclBheWxvYWQ8VCwgVj47XG59O1xuXG4vKipcbiAqIEFuIHVuaW9uIHR5cGUgb2Ygcm91dGVyIGFjdGlvbnMuXG4gKi9cbmV4cG9ydCB0eXBlIFJvdXRlckFjdGlvbjxULCBWID0gU2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Q+ID1cbiAgfCBSb3V0ZXJOYXZpZ2F0aW9uQWN0aW9uPFY+XG4gIHwgUm91dGVyQ2FuY2VsQWN0aW9uPFQsIFY+XG4gIHwgUm91dGVyRXJyb3JBY3Rpb248VCwgVj47XG5cbmV4cG9ydCB0eXBlIFJvdXRlclJlZHVjZXJTdGF0ZTxUID0gU2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Q+ID0ge1xuICBzdGF0ZTogVDtcbiAgbmF2aWdhdGlvbklkOiBudW1iZXI7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcm91dGVyUmVkdWNlcjxUID0gU2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Q+KFxuICBzdGF0ZTogUm91dGVyUmVkdWNlclN0YXRlPFQ+IHwgdW5kZWZpbmVkLFxuICBhY3Rpb246IFJvdXRlckFjdGlvbjxhbnksIFQ+XG4pOiBSb3V0ZXJSZWR1Y2VyU3RhdGU8VD4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBST1VURVJfTkFWSUdBVElPTjpcbiAgICBjYXNlIFJPVVRFUl9FUlJPUjpcbiAgICBjYXNlIFJPVVRFUl9DQU5DRUw6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0ZTogYWN0aW9uLnBheWxvYWQucm91dGVyU3RhdGUsXG4gICAgICAgIG5hdmlnYXRpb25JZDogYWN0aW9uLnBheWxvYWQuZXZlbnQuaWQsXG4gICAgICB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGUgYXMgUm91dGVyUmVkdWNlclN0YXRlPFQ+O1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RvcmVSb3V0ZXJDb25maWcge1xuICBzdGF0ZUtleT86IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IF9ST1VURVJfQ09ORklHID0gbmV3IEluamVjdGlvblRva2VuKFxuICAnQG5ncngvcm91dGVyLXN0b3JlIEludGVybmFsIENvbmZpZ3VyYXRpb24nXG4pO1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9DT05GSUcgPSBuZXcgSW5qZWN0aW9uVG9rZW4oXG4gICdAbmdyeC9yb3V0ZXItc3RvcmUgQ29uZmlndXJhdGlvbidcbik7XG5leHBvcnQgY29uc3QgREVGQVVMVF9ST1VURVJfRkVBVFVSRU5BTUUgPSAncm91dGVyUmVkdWNlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBfY3JlYXRlRGVmYXVsdFJvdXRlckNvbmZpZyhcbiAgY29uZmlnOiBTdG9yZVJvdXRlckNvbmZpZyB8IFN0b3JlUm91dGVyQ29uZmlnRnVuY3Rpb25cbik6IFN0b3JlUm91dGVyQ29uZmlnIHtcbiAgbGV0IF9jb25maWc6IFN0b3JlUm91dGVyQ29uZmlnO1xuXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnZnVuY3Rpb24nKSB7XG4gICAgX2NvbmZpZyA9IGNvbmZpZygpO1xuICB9IGVsc2Uge1xuICAgIF9jb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN0YXRlS2V5OiBERUZBVUxUX1JPVVRFUl9GRUFUVVJFTkFNRSxcbiAgICAuLi5fY29uZmlnLFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBTdG9yZVJvdXRlckNvbmZpZ0Z1bmN0aW9uID0gKCkgPT4gU3RvcmVSb3V0ZXJDb25maWc7XG5cbi8qKlxuICogQ29ubmVjdHMgUm91dGVyTW9kdWxlIHdpdGggU3RvcmVNb2R1bGUuXG4gKlxuICogRHVyaW5nIHRoZSBuYXZpZ2F0aW9uLCBiZWZvcmUgYW55IGd1YXJkcyBvciByZXNvbHZlcnMgcnVuLCB0aGUgcm91dGVyIHdpbGwgZGlzcGF0Y2hcbiAqIGEgUk9VVEVSX05BVklHQVRJT04gYWN0aW9uLCB3aGljaCBoYXMgdGhlIGZvbGxvd2luZyBzaWduYXR1cmU6XG4gKlxuICogYGBgXG4gKiBleHBvcnQgdHlwZSBSb3V0ZXJOYXZpZ2F0aW9uUGF5bG9hZCA9IHtcbiAqICAgcm91dGVyU3RhdGU6IFNlcmlhbGl6ZWRSb3V0ZXJTdGF0ZVNuYXBzaG90LFxuICogICBldmVudDogUm91dGVzUmVjb2duaXplZFxuICogfVxuICogYGBgXG4gKlxuICogRWl0aGVyIGEgcmVkdWNlciBvciBhbiBlZmZlY3QgY2FuIGJlIGludm9rZWQgaW4gcmVzcG9uc2UgdG8gdGhpcyBhY3Rpb24uXG4gKiBJZiB0aGUgaW52b2tlZCByZWR1Y2VyIHRocm93cywgdGhlIG5hdmlnYXRpb24gd2lsbCBiZSBjYW5jZWxlZC5cbiAqXG4gKiBJZiBuYXZpZ2F0aW9uIGdldHMgY2FuY2VsZWQgYmVjYXVzZSBvZiBhIGd1YXJkLCBhIFJPVVRFUl9DQU5DRUwgYWN0aW9uIHdpbGwgYmVcbiAqIGRpc3BhdGNoZWQuIElmIG5hdmlnYXRpb24gcmVzdWx0cyBpbiBhbiBlcnJvciwgYSBST1VURVJfRVJST1IgYWN0aW9uIHdpbGwgYmUgZGlzcGF0Y2hlZC5cbiAqXG4gKiBCb3RoIFJPVVRFUl9DQU5DRUwgYW5kIFJPVVRFUl9FUlJPUiBjb250YWluIHRoZSBzdG9yZSBzdGF0ZSBiZWZvcmUgdGhlIG5hdmlnYXRpb25cbiAqIHdoaWNoIGNhbiBiZSB1c2VkIHRvIHJlc3RvcmUgdGhlIGNvbnNpc3RlbmN5IG9mIHRoZSBzdG9yZS5cbiAqXG4gKiBVc2FnZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBATmdNb2R1bGUoe1xuICogICBkZWNsYXJhdGlvbnM6IFtBcHBDbXAsIFNpbXBsZUNtcF0sXG4gKiAgIGltcG9ydHM6IFtcbiAqICAgICBCcm93c2VyTW9kdWxlLFxuICogICAgIFN0b3JlTW9kdWxlLmZvclJvb3QobWFwT2ZSZWR1Y2VycyksXG4gKiAgICAgUm91dGVyTW9kdWxlLmZvclJvb3QoW1xuICogICAgICAgeyBwYXRoOiAnJywgY29tcG9uZW50OiBTaW1wbGVDbXAgfSxcbiAqICAgICAgIHsgcGF0aDogJ25leHQnLCBjb21wb25lbnQ6IFNpbXBsZUNtcCB9XG4gKiAgICAgXSksXG4gKiAgICAgU3RvcmVSb3V0ZXJDb25uZWN0aW5nTW9kdWxlXG4gKiAgIF0sXG4gKiAgIGJvb3RzdHJhcDogW0FwcENtcF1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwTW9kdWxlIHtcbiAqIH1cbiAqIGBgYFxuICovXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICB7IHByb3ZpZGU6IFJvdXRlclN0YXRlU2VyaWFsaXplciwgdXNlQ2xhc3M6IERlZmF1bHRSb3V0ZXJTdGF0ZVNlcmlhbGl6ZXIgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBfUk9VVEVSX0NPTkZJRyxcbiAgICAgIHVzZVZhbHVlOiB7IHN0YXRlS2V5OiBERUZBVUxUX1JPVVRFUl9GRUFUVVJFTkFNRSB9LFxuICAgIH0sXG4gICAge1xuICAgICAgcHJvdmlkZTogUk9VVEVSX0NPTkZJRyxcbiAgICAgIHVzZUZhY3Rvcnk6IF9jcmVhdGVEZWZhdWx0Um91dGVyQ29uZmlnLFxuICAgICAgZGVwczogW19ST1VURVJfQ09ORklHXSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBTdG9yZVJvdXRlckNvbm5lY3RpbmdNb2R1bGUge1xuICBzdGF0aWMgZm9yUm9vdChcbiAgICBjb25maWc/OiBTdG9yZVJvdXRlckNvbmZpZyB8IFN0b3JlUm91dGVyQ29uZmlnRnVuY3Rpb25cbiAgKTogTW9kdWxlV2l0aFByb3ZpZGVycztcbiAgc3RhdGljIGZvclJvb3QoXG4gICAgY29uZmlnOiBTdG9yZVJvdXRlckNvbmZpZyB8IFN0b3JlUm91dGVyQ29uZmlnRnVuY3Rpb24gPSB7fVxuICApOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IFN0b3JlUm91dGVyQ29ubmVjdGluZ01vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7IHByb3ZpZGU6IF9ST1VURVJfQ09ORklHLCB1c2VWYWx1ZTogY29uZmlnIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBST1VURVJfQ09ORklHLFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IF9jcmVhdGVEZWZhdWx0Um91dGVyQ29uZmlnLFxuICAgICAgICAgIGRlcHM6IFtfUk9VVEVSX0NPTkZJR10sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHJvdXRlclN0YXRlOiBTZXJpYWxpemVkUm91dGVyU3RhdGVTbmFwc2hvdDtcbiAgcHJpdmF0ZSBzdG9yZVN0YXRlOiBhbnk7XG4gIHByaXZhdGUgbGFzdFJvdXRlc1JlY29nbml6ZWQ6IFJvdXRlc1JlY29nbml6ZWQ7XG5cbiAgcHJpdmF0ZSBkaXNwYXRjaFRyaWdnZXJlZEJ5Um91dGVyOiBib29sZWFuID0gZmFsc2U7IC8vIHVzZWQgb25seSBpbiBkZXYgbW9kZSBpbiBjb21iaW5hdGlvbiB3aXRoIHJvdXRlclJlZHVjZXJcbiAgcHJpdmF0ZSBuYXZpZ2F0aW9uVHJpZ2dlcmVkQnlEaXNwYXRjaDogYm9vbGVhbiA9IGZhbHNlOyAvLyB1c2VkIG9ubHkgaW4gZGV2IG1vZGUgaW4gY29tYmluYXRpb24gd2l0aCByb3V0ZXJSZWR1Y2VyXG4gIHByaXZhdGUgc3RhdGVLZXk6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHN0b3JlOiBTdG9yZTxhbnk+LFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICAgcHJpdmF0ZSBzZXJpYWxpemVyOiBSb3V0ZXJTdGF0ZVNlcmlhbGl6ZXI8U2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Q+LFxuICAgIEBJbmplY3QoUk9VVEVSX0NPTkZJRykgcHJpdmF0ZSBjb25maWc6IFN0b3JlUm91dGVyQ29uZmlnXG4gICkge1xuICAgIHRoaXMuc3RhdGVLZXkgPSB0aGlzLmNvbmZpZy5zdGF0ZUtleSBhcyBzdHJpbmc7XG5cbiAgICB0aGlzLnNldFVwQmVmb3JlUHJlYWN0aXZhdGlvbkhvb2soKTtcbiAgICB0aGlzLnNldFVwU3RvcmVTdGF0ZUxpc3RlbmVyKCk7XG4gICAgdGhpcy5zZXRVcFN0YXRlUm9sbGJhY2tFdmVudHMoKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0VXBCZWZvcmVQcmVhY3RpdmF0aW9uSG9vaygpOiB2b2lkIHtcbiAgICAoPGFueT50aGlzLnJvdXRlcikuaG9va3MuYmVmb3JlUHJlYWN0aXZhdGlvbiA9IChcbiAgICAgIHJvdXRlclN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90XG4gICAgKSA9PiB7XG4gICAgICB0aGlzLnJvdXRlclN0YXRlID0gdGhpcy5zZXJpYWxpemVyLnNlcmlhbGl6ZShyb3V0ZXJTdGF0ZSk7XG4gICAgICBpZiAodGhpcy5zaG91bGREaXNwYXRjaFJvdXRlck5hdmlnYXRpb24oKSkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoUm91dGVyTmF2aWdhdGlvbigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9mKHRydWUpO1xuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHNldFVwU3RvcmVTdGF0ZUxpc3RlbmVyKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUuc3Vic2NyaWJlKHMgPT4ge1xuICAgICAgdGhpcy5zdG9yZVN0YXRlID0gcztcbiAgICB9KTtcbiAgICB0aGlzLnN0b3JlLnBpcGUoc2VsZWN0KHRoaXMuc3RhdGVLZXkpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5uYXZpZ2F0ZUlmTmVlZGVkKCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHNob3VsZERpc3BhdGNoUm91dGVyTmF2aWdhdGlvbigpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuc3RvcmVTdGF0ZVt0aGlzLnN0YXRlS2V5XSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuICF0aGlzLm5hdmlnYXRpb25UcmlnZ2VyZWRCeURpc3BhdGNoO1xuICB9XG5cbiAgcHJpdmF0ZSBuYXZpZ2F0ZUlmTmVlZGVkKCk6IHZvaWQge1xuICAgIGlmIChcbiAgICAgICF0aGlzLnN0b3JlU3RhdGVbdGhpcy5zdGF0ZUtleV0gfHxcbiAgICAgICF0aGlzLnN0b3JlU3RhdGVbdGhpcy5zdGF0ZUtleV0uc3RhdGVcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hUcmlnZ2VyZWRCeVJvdXRlcikgcmV0dXJuO1xuXG4gICAgaWYgKHRoaXMucm91dGVyLnVybCAhPT0gdGhpcy5zdG9yZVN0YXRlW3RoaXMuc3RhdGVLZXldLnN0YXRlLnVybCkge1xuICAgICAgdGhpcy5uYXZpZ2F0aW9uVHJpZ2dlcmVkQnlEaXNwYXRjaCA9IHRydWU7XG4gICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZUJ5VXJsKHRoaXMuc3RvcmVTdGF0ZVt0aGlzLnN0YXRlS2V5XS5zdGF0ZS51cmwpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0VXBTdGF0ZVJvbGxiYWNrRXZlbnRzKCk6IHZvaWQge1xuICAgIHRoaXMucm91dGVyLmV2ZW50cy5zdWJzY3JpYmUoZSA9PiB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIFJvdXRlc1JlY29nbml6ZWQpIHtcbiAgICAgICAgdGhpcy5sYXN0Um91dGVzUmVjb2duaXplZCA9IGU7XG4gICAgICB9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uQ2FuY2VsKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hSb3V0ZXJDYW5jZWwoZSk7XG4gICAgICB9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uRXJyb3IpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaFJvdXRlckVycm9yKGUpO1xuICAgICAgfSBlbHNlIGlmIChlIGluc3RhbmNlb2YgTmF2aWdhdGlvbkVuZCkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoVHJpZ2dlcmVkQnlSb3V0ZXIgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5uYXZpZ2F0aW9uVHJpZ2dlcmVkQnlEaXNwYXRjaCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBkaXNwYXRjaFJvdXRlck5hdmlnYXRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwYXRjaFJvdXRlckFjdGlvbihST1VURVJfTkFWSUdBVElPTiwge1xuICAgICAgcm91dGVyU3RhdGU6IHRoaXMucm91dGVyU3RhdGUsXG4gICAgICBldmVudDogbmV3IFJvdXRlc1JlY29nbml6ZWQoXG4gICAgICAgIHRoaXMubGFzdFJvdXRlc1JlY29nbml6ZWQuaWQsXG4gICAgICAgIHRoaXMubGFzdFJvdXRlc1JlY29nbml6ZWQudXJsLFxuICAgICAgICB0aGlzLmxhc3RSb3V0ZXNSZWNvZ25pemVkLnVybEFmdGVyUmVkaXJlY3RzLFxuICAgICAgICB0aGlzLnJvdXRlclN0YXRlXG4gICAgICApLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBkaXNwYXRjaFJvdXRlckNhbmNlbChldmVudDogTmF2aWdhdGlvbkNhbmNlbCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcGF0Y2hSb3V0ZXJBY3Rpb24oUk9VVEVSX0NBTkNFTCwge1xuICAgICAgcm91dGVyU3RhdGU6IHRoaXMucm91dGVyU3RhdGUsXG4gICAgICBzdG9yZVN0YXRlOiB0aGlzLnN0b3JlU3RhdGUsXG4gICAgICBldmVudCxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZGlzcGF0Y2hSb3V0ZXJFcnJvcihldmVudDogTmF2aWdhdGlvbkVycm9yKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwYXRjaFJvdXRlckFjdGlvbihST1VURVJfRVJST1IsIHtcbiAgICAgIHJvdXRlclN0YXRlOiB0aGlzLnJvdXRlclN0YXRlLFxuICAgICAgc3RvcmVTdGF0ZTogdGhpcy5zdG9yZVN0YXRlLFxuICAgICAgZXZlbnQ6IG5ldyBOYXZpZ2F0aW9uRXJyb3IoZXZlbnQuaWQsIGV2ZW50LnVybCwgYCR7ZXZlbnR9YCksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGRpc3BhdGNoUm91dGVyQWN0aW9uKHR5cGU6IHN0cmluZywgcGF5bG9hZDogYW55KTogdm9pZCB7XG4gICAgdGhpcy5kaXNwYXRjaFRyaWdnZXJlZEJ5Um91dGVyID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5zdG9yZS5kaXNwYXRjaCh7IHR5cGUsIHBheWxvYWQgfSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hUcmlnZ2VyZWRCeVJvdXRlciA9IGZhbHNlO1xuICAgICAgdGhpcy5uYXZpZ2F0aW9uVHJpZ2dlcmVkQnlEaXNwYXRjaCA9IGZhbHNlO1xuICAgIH1cbiAgfVxufVxuIl19