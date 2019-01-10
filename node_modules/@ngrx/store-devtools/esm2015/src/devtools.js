/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable, Inject, ErrorHandler } from '@angular/core';
import { ActionsSubject, INITIAL_STATE, ReducerObservable, ScannedActionsSubject, } from '@ngrx/store';
import { merge, queueScheduler, ReplaySubject, } from 'rxjs';
import { map, observeOn, scan, skip, withLatestFrom } from 'rxjs/operators';
import * as Actions from './actions';
import { STORE_DEVTOOLS_CONFIG, StoreDevtoolsConfig } from './config';
import { DevtoolsExtension } from './extension';
import { liftInitialState, liftReducerWith } from './reducer';
import { liftAction, unliftState } from './utils';
export class DevtoolsDispatcher extends ActionsSubject {
}
DevtoolsDispatcher.decorators = [
    { type: Injectable }
];
function DevtoolsDispatcher_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    DevtoolsDispatcher.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    DevtoolsDispatcher.ctorParameters;
}
export class StoreDevtools {
    /**
     * @param {?} dispatcher
     * @param {?} actions$
     * @param {?} reducers$
     * @param {?} extension
     * @param {?} scannedActions
     * @param {?} errorHandler
     * @param {?} initialState
     * @param {?} config
     */
    constructor(dispatcher, actions$, reducers$, extension, scannedActions, errorHandler, initialState, config) {
        const /** @type {?} */ liftedInitialState = liftInitialState(initialState, config.monitor);
        const /** @type {?} */ liftReducer = liftReducerWith(initialState, liftedInitialState, errorHandler, config.monitor, config);
        const /** @type {?} */ liftedAction$ = merge(merge(actions$.asObservable().pipe(skip(1)), extension.actions$).pipe(map(liftAction)), dispatcher, extension.liftedActions$).pipe(observeOn(queueScheduler));
        const /** @type {?} */ liftedReducer$ = reducers$.pipe(map(liftReducer));
        const /** @type {?} */ liftedStateSubject = new ReplaySubject(1);
        const /** @type {?} */ liftedStateSubscription = liftedAction$
            .pipe(withLatestFrom(liftedReducer$), scan(({ state: liftedState }, [action, reducer]) => {
            const /** @type {?} */ reducedLiftedState = reducer(liftedState, action);
            // // Extension should be sent the sanitized lifted state
            extension.notify(action, reducedLiftedState);
            return { state: reducedLiftedState, action };
        }, { state: liftedInitialState, action: /** @type {?} */ (null) }))
            .subscribe(({ state, action }) => {
            liftedStateSubject.next(state);
            if (action.type === Actions.PERFORM_ACTION) {
                const /** @type {?} */ unliftedAction = (/** @type {?} */ (action)).action;
                scannedActions.next(unliftedAction);
            }
        });
        const /** @type {?} */ extensionStartSubscription = extension.start$.subscribe(() => {
            this.refresh();
        });
        const /** @type {?} */ liftedState$ = /** @type {?} */ (liftedStateSubject.asObservable());
        const /** @type {?} */ state$ = liftedState$.pipe(map(unliftState));
        this.extensionStartSubscription = extensionStartSubscription;
        this.stateSubscription = liftedStateSubscription;
        this.dispatcher = dispatcher;
        this.liftedState = liftedState$;
        this.state = state$;
    }
    /**
     * @param {?} action
     * @return {?}
     */
    dispatch(action) {
        this.dispatcher.next(action);
    }
    /**
     * @param {?} action
     * @return {?}
     */
    next(action) {
        this.dispatcher.next(action);
    }
    /**
     * @param {?} error
     * @return {?}
     */
    error(error) { }
    /**
     * @return {?}
     */
    complete() { }
    /**
     * @param {?} action
     * @return {?}
     */
    performAction(action) {
        this.dispatch(new Actions.PerformAction(action, +Date.now()));
    }
    /**
     * @return {?}
     */
    refresh() {
        this.dispatch(new Actions.Refresh());
    }
    /**
     * @return {?}
     */
    reset() {
        this.dispatch(new Actions.Reset(+Date.now()));
    }
    /**
     * @return {?}
     */
    rollback() {
        this.dispatch(new Actions.Rollback(+Date.now()));
    }
    /**
     * @return {?}
     */
    commit() {
        this.dispatch(new Actions.Commit(+Date.now()));
    }
    /**
     * @return {?}
     */
    sweep() {
        this.dispatch(new Actions.Sweep());
    }
    /**
     * @param {?} id
     * @return {?}
     */
    toggleAction(id) {
        this.dispatch(new Actions.ToggleAction(id));
    }
    /**
     * @param {?} actionId
     * @return {?}
     */
    jumpToAction(actionId) {
        this.dispatch(new Actions.JumpToAction(actionId));
    }
    /**
     * @param {?} index
     * @return {?}
     */
    jumpToState(index) {
        this.dispatch(new Actions.JumpToState(index));
    }
    /**
     * @param {?} nextLiftedState
     * @return {?}
     */
    importState(nextLiftedState) {
        this.dispatch(new Actions.ImportState(nextLiftedState));
    }
}
StoreDevtools.decorators = [
    { type: Injectable }
];
/** @nocollapse */
StoreDevtools.ctorParameters = () => [
    { type: DevtoolsDispatcher, },
    { type: ActionsSubject, },
    { type: ReducerObservable, },
    { type: DevtoolsExtension, },
    { type: ScannedActionsSubject, },
    { type: ErrorHandler, },
    { type: undefined, decorators: [{ type: Inject, args: [INITIAL_STATE,] },] },
    { type: StoreDevtoolsConfig, decorators: [{ type: Inject, args: [STORE_DEVTOOLS_CONFIG,] },] },
];
function StoreDevtools_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    StoreDevtools.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    StoreDevtools.ctorParameters;
    /** @type {?} */
    StoreDevtools.prototype.stateSubscription;
    /** @type {?} */
    StoreDevtools.prototype.extensionStartSubscription;
    /** @type {?} */
    StoreDevtools.prototype.dispatcher;
    /** @type {?} */
    StoreDevtools.prototype.liftedState;
    /** @type {?} */
    StoreDevtools.prototype.state;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2dG9vbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3N0b3JlLWRldnRvb2xzL3NyYy9kZXZ0b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQWEsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVFLE9BQU8sRUFHTCxjQUFjLEVBQ2QsYUFBYSxFQUNiLGlCQUFpQixFQUNqQixxQkFBcUIsR0FDdEIsTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxFQUNMLEtBQUssRUFHTCxjQUFjLEVBQ2QsYUFBYSxHQUVkLE1BQU0sTUFBTSxDQUFDO0FBQ2QsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1RSxPQUFPLEtBQUssT0FBTyxNQUFNLFdBQVcsQ0FBQztBQUNyQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDdEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ2hELE9BQU8sRUFBZSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDM0UsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFHbEQsTUFBTSx5QkFBMEIsU0FBUSxjQUFjOzs7WUFEckQsVUFBVTs7Ozs7Ozs7Ozs7QUFJWCxNQUFNOzs7Ozs7Ozs7OztJQU9KLFlBQ0UsVUFBOEIsRUFDOUIsUUFBd0IsRUFDeEIsU0FBNEIsRUFDNUIsU0FBNEIsRUFDNUIsY0FBcUMsRUFDckMsWUFBMEIsRUFDSCxjQUNRO1FBRS9CLHVCQUFNLGtCQUFrQixHQUFHLGdCQUFnQixDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUUs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QUMsQ0FBQztLQUMvQzs7Ozs7SUFFRCxXQUFXLENBQUMsZUFBb0I7UUFDOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztLQUN6RDs7O1lBeElGLFVBQVU7Ozs7WUFGRSxrQkFBa0I7WUF0QjdCLGNBQWM7WUFFZCxpQkFBaUI7WUFlVixpQkFBaUI7WUFkeEIscUJBQXFCO1lBUGlCLFlBQVk7NENBMkMvQyxNQUFNLFNBQUMsYUFBYTtZQXZCTyxtQkFBbUIsdUJBd0I5QyxNQUFNLFNBQUMscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgSW5qZWN0LCBPbkRlc3Ryb3ksIEVycm9ySGFuZGxlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgQWN0aW9uLFxuICBBY3Rpb25SZWR1Y2VyLFxuICBBY3Rpb25zU3ViamVjdCxcbiAgSU5JVElBTF9TVEFURSxcbiAgUmVkdWNlck9ic2VydmFibGUsXG4gIFNjYW5uZWRBY3Rpb25zU3ViamVjdCxcbn0gZnJvbSAnQG5ncngvc3RvcmUnO1xuaW1wb3J0IHtcbiAgbWVyZ2UsXG4gIE9ic2VydmFibGUsXG4gIE9ic2VydmVyLFxuICBxdWV1ZVNjaGVkdWxlcixcbiAgUmVwbGF5U3ViamVjdCxcbiAgU3Vic2NyaXB0aW9uLFxufSBmcm9tICdyeGpzJztcbmltcG9ydCB7IG1hcCwgb2JzZXJ2ZU9uLCBzY2FuLCBza2lwLCB3aXRoTGF0ZXN0RnJvbSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0ICogYXMgQWN0aW9ucyBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHsgU1RPUkVfREVWVE9PTFNfQ09ORklHLCBTdG9yZURldnRvb2xzQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgRGV2dG9vbHNFeHRlbnNpb24gfSBmcm9tICcuL2V4dGVuc2lvbic7XG5pbXBvcnQgeyBMaWZ0ZWRTdGF0ZSwgbGlmdEluaXRpYWxTdGF0ZSwgbGlmdFJlZHVjZXJXaXRoIH0gZnJvbSAnLi9yZWR1Y2VyJztcbmltcG9ydCB7IGxpZnRBY3Rpb24sIHVubGlmdFN0YXRlIH0gZnJvbSAnLi91dGlscyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEZXZ0b29sc0Rpc3BhdGNoZXIgZXh0ZW5kcyBBY3Rpb25zU3ViamVjdCB7fVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU3RvcmVEZXZ0b29scyBpbXBsZW1lbnRzIE9ic2VydmVyPGFueT4ge1xuICBwcml2YXRlIHN0YXRlU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG4gIHByaXZhdGUgZXh0ZW5zaW9uU3RhcnRTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcbiAgcHVibGljIGRpc3BhdGNoZXI6IEFjdGlvbnNTdWJqZWN0O1xuICBwdWJsaWMgbGlmdGVkU3RhdGU6IE9ic2VydmFibGU8TGlmdGVkU3RhdGU+O1xuICBwdWJsaWMgc3RhdGU6IE9ic2VydmFibGU8YW55PjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkaXNwYXRjaGVyOiBEZXZ0b29sc0Rpc3BhdGNoZXIsXG4gICAgYWN0aW9ucyQ6IEFjdGlvbnNTdWJqZWN0LFxuICAgIHJlZHVjZXJzJDogUmVkdWNlck9ic2VydmFibGUsXG4gICAgZXh0ZW5zaW9uOiBEZXZ0b29sc0V4dGVuc2lvbixcbiAgICBzY2FubmVkQWN0aW9uczogU2Nhbm5lZEFjdGlvbnNTdWJqZWN0LFxuICAgIGVycm9ySGFuZGxlcjogRXJyb3JIYW5kbGVyLFxuICAgIEBJbmplY3QoSU5JVElBTF9TVEFURSkgaW5pdGlhbFN0YXRlOiBhbnksXG4gICAgQEluamVjdChTVE9SRV9ERVZUT09MU19DT05GSUcpIGNvbmZpZzogU3RvcmVEZXZ0b29sc0NvbmZpZ1xuICApIHtcbiAgICBjb25zdCBsaWZ0ZWRJbml0aWFsU3RhdGUgPSBsaWZ0SW5pdGlhbFN0YXRlKGluaXRpYWxTdGF0ZSwgY29uZmlnLm1vbml0b3IpO1xuICAgIGNvbnN0IGxpZnRSZWR1Y2VyID0gbGlmdFJlZHVjZXJXaXRoKFxuICAgICAgaW5pdGlhbFN0YXRlLFxuICAgICAgbGlmdGVkSW5pdGlhbFN0YXRlLFxuICAgICAgZXJyb3JIYW5kbGVyLFxuICAgICAgY29uZmlnLm1vbml0b3IsXG4gICAgICBjb25maWdcbiAgICApO1xuXG4gICAgY29uc3QgbGlmdGVkQWN0aW9uJCA9IG1lcmdlKFxuICAgICAgbWVyZ2UoYWN0aW9ucyQuYXNPYnNlcnZhYmxlKCkucGlwZShza2lwKDEpKSwgZXh0ZW5zaW9uLmFjdGlvbnMkKS5waXBlKFxuICAgICAgICBtYXAobGlmdEFjdGlvbilcbiAgICAgICksXG4gICAgICBkaXNwYXRjaGVyLFxuICAgICAgZXh0ZW5zaW9uLmxpZnRlZEFjdGlvbnMkXG4gICAgKS5waXBlKG9ic2VydmVPbihxdWV1ZVNjaGVkdWxlcikpO1xuXG4gICAgY29uc3QgbGlmdGVkUmVkdWNlciQgPSByZWR1Y2VycyQucGlwZShtYXAobGlmdFJlZHVjZXIpKTtcblxuICAgIGNvbnN0IGxpZnRlZFN0YXRlU3ViamVjdCA9IG5ldyBSZXBsYXlTdWJqZWN0PExpZnRlZFN0YXRlPigxKTtcblxuICAgIGNvbnN0IGxpZnRlZFN0YXRlU3Vic2NyaXB0aW9uID0gbGlmdGVkQWN0aW9uJFxuICAgICAgLnBpcGUoXG4gICAgICAgIHdpdGhMYXRlc3RGcm9tKGxpZnRlZFJlZHVjZXIkKSxcbiAgICAgICAgc2NhbjxcbiAgICAgICAgICBbYW55LCBBY3Rpb25SZWR1Y2VyPExpZnRlZFN0YXRlLCBBY3Rpb25zLkFsbD5dLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXRlOiBMaWZ0ZWRTdGF0ZTtcbiAgICAgICAgICAgIGFjdGlvbjogYW55O1xuICAgICAgICAgIH1cbiAgICAgICAgPihcbiAgICAgICAgICAoeyBzdGF0ZTogbGlmdGVkU3RhdGUgfSwgW2FjdGlvbiwgcmVkdWNlcl0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlZHVjZWRMaWZ0ZWRTdGF0ZSA9IHJlZHVjZXIobGlmdGVkU3RhdGUsIGFjdGlvbik7XG5cbiAgICAgICAgICAgIC8vIC8vIEV4dGVuc2lvbiBzaG91bGQgYmUgc2VudCB0aGUgc2FuaXRpemVkIGxpZnRlZCBzdGF0ZVxuICAgICAgICAgICAgZXh0ZW5zaW9uLm5vdGlmeShhY3Rpb24sIHJlZHVjZWRMaWZ0ZWRTdGF0ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7IHN0YXRlOiByZWR1Y2VkTGlmdGVkU3RhdGUsIGFjdGlvbiB9O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgeyBzdGF0ZTogbGlmdGVkSW5pdGlhbFN0YXRlLCBhY3Rpb246IG51bGwgYXMgYW55IH1cbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoeyBzdGF0ZSwgYWN0aW9uIH0pID0+IHtcbiAgICAgICAgbGlmdGVkU3RhdGVTdWJqZWN0Lm5leHQoc3RhdGUpO1xuXG4gICAgICAgIGlmIChhY3Rpb24udHlwZSA9PT0gQWN0aW9ucy5QRVJGT1JNX0FDVElPTikge1xuICAgICAgICAgIGNvbnN0IHVubGlmdGVkQWN0aW9uID0gKGFjdGlvbiBhcyBBY3Rpb25zLlBlcmZvcm1BY3Rpb24pLmFjdGlvbjtcblxuICAgICAgICAgIHNjYW5uZWRBY3Rpb25zLm5leHQodW5saWZ0ZWRBY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIGNvbnN0IGV4dGVuc2lvblN0YXJ0U3Vic2NyaXB0aW9uID0gZXh0ZW5zaW9uLnN0YXJ0JC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBsaWZ0ZWRTdGF0ZSQgPSBsaWZ0ZWRTdGF0ZVN1YmplY3QuYXNPYnNlcnZhYmxlKCkgYXMgT2JzZXJ2YWJsZTxcbiAgICAgIExpZnRlZFN0YXRlXG4gICAgPjtcbiAgICBjb25zdCBzdGF0ZSQgPSBsaWZ0ZWRTdGF0ZSQucGlwZShtYXAodW5saWZ0U3RhdGUpKTtcblxuICAgIHRoaXMuZXh0ZW5zaW9uU3RhcnRTdWJzY3JpcHRpb24gPSBleHRlbnNpb25TdGFydFN1YnNjcmlwdGlvbjtcbiAgICB0aGlzLnN0YXRlU3Vic2NyaXB0aW9uID0gbGlmdGVkU3RhdGVTdWJzY3JpcHRpb247XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLmxpZnRlZFN0YXRlID0gbGlmdGVkU3RhdGUkO1xuICAgIHRoaXMuc3RhdGUgPSBzdGF0ZSQ7XG4gIH1cblxuICBkaXNwYXRjaChhY3Rpb246IEFjdGlvbikge1xuICAgIHRoaXMuZGlzcGF0Y2hlci5uZXh0KGFjdGlvbik7XG4gIH1cblxuICBuZXh0KGFjdGlvbjogYW55KSB7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm5leHQoYWN0aW9uKTtcbiAgfVxuXG4gIGVycm9yKGVycm9yOiBhbnkpIHt9XG5cbiAgY29tcGxldGUoKSB7fVxuXG4gIHBlcmZvcm1BY3Rpb24oYWN0aW9uOiBhbnkpIHtcbiAgICB0aGlzLmRpc3BhdGNoKG5ldyBBY3Rpb25zLlBlcmZvcm1BY3Rpb24oYWN0aW9uLCArRGF0ZS5ub3coKSkpO1xuICB9XG5cbiAgcmVmcmVzaCgpIHtcbiAgICB0aGlzLmRpc3BhdGNoKG5ldyBBY3Rpb25zLlJlZnJlc2goKSk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLmRpc3BhdGNoKG5ldyBBY3Rpb25zLlJlc2V0KCtEYXRlLm5vdygpKSk7XG4gIH1cblxuICByb2xsYmFjaygpIHtcbiAgICB0aGlzLmRpc3BhdGNoKG5ldyBBY3Rpb25zLlJvbGxiYWNrKCtEYXRlLm5vdygpKSk7XG4gIH1cblxuICBjb21taXQoKSB7XG4gICAgdGhpcy5kaXNwYXRjaChuZXcgQWN0aW9ucy5Db21taXQoK0RhdGUubm93KCkpKTtcbiAgfVxuXG4gIHN3ZWVwKCkge1xuICAgIHRoaXMuZGlzcGF0Y2gobmV3IEFjdGlvbnMuU3dlZXAoKSk7XG4gIH1cblxuICB0b2dnbGVBY3Rpb24oaWQ6IG51bWJlcikge1xuICAgIHRoaXMuZGlzcGF0Y2gobmV3IEFjdGlvbnMuVG9nZ2xlQWN0aW9uKGlkKSk7XG4gIH1cblxuICBqdW1wVG9BY3Rpb24oYWN0aW9uSWQ6IG51bWJlcikge1xuICAgIHRoaXMuZGlzcGF0Y2gobmV3IEFjdGlvbnMuSnVtcFRvQWN0aW9uKGFjdGlvbklkKSk7XG4gIH1cblxuICBqdW1wVG9TdGF0ZShpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5kaXNwYXRjaChuZXcgQWN0aW9ucy5KdW1wVG9TdGF0ZShpbmRleCkpO1xuICB9XG5cbiAgaW1wb3J0U3RhdGUobmV4dExpZnRlZFN0YXRlOiBhbnkpIHtcbiAgICB0aGlzLmRpc3BhdGNoKG5ldyBBY3Rpb25zLkltcG9ydFN0YXRlKG5leHRMaWZ0ZWRTdGF0ZSkpO1xuICB9XG59XG4iXX0=