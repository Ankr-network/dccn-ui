/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';
import { ActionsSubject } from './actions_subject';
import { ReducerManager } from './reducer_manager';
import { StateObservable } from './state';
/**
 * @template T
 */
export class Store extends Observable {
    /**
     * @param {?} state$
     * @param {?} actionsObserver
     * @param {?} reducerManager
     */
    constructor(state$, actionsObserver, reducerManager) {
        super();
        this.actionsObserver = actionsObserver;
        this.reducerManager = reducerManager;
        this.source = state$;
    }
    /**
     * @param {?} pathOrMapFn
     * @param {...?} paths
     * @return {?}
     */
    select(pathOrMapFn, ...paths) {
        return select.call(null, pathOrMapFn, ...paths)(this);
    }
    /**
     * @template R
     * @param {?} operator
     * @return {?}
     */
    lift(operator) {
        const /** @type {?} */ store = new Store(this, this.actionsObserver, this.reducerManager);
        store.operator = operator;
        return store;
    }
    /**
     * @template V
     * @param {?} action
     * @return {?}
     */
    dispatch(action) {
        this.actionsObserver.next(action);
    }
    /**
     * @param {?} action
     * @return {?}
     */
    next(action) {
        this.actionsObserver.next(action);
    }
    /**
     * @param {?} err
     * @return {?}
     */
    error(err) {
        this.actionsObserver.error(err);
    }
    /**
     * @return {?}
     */
    complete() {
        this.actionsObserver.complete();
    }
    /**
     * @template State, Actions
     * @param {?} key
     * @param {?} reducer
     * @return {?}
     */
    addReducer(key, reducer) {
        this.reducerManager.addReducer(key, reducer);
    }
    /**
     * @template Key
     * @param {?} key
     * @return {?}
     */
    removeReducer(key) {
        this.reducerManager.removeReducer(key);
    }
}
Store.decorators = [
    { type: Injectable }
];
/** @nocollapse */
Store.ctorParameters = () => [
    { type: StateObservable, },
    { type: ActionsSubject, },
    { type: ReducerManager, },
];
function Store_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    Store.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    Store.ctorParameters;
    /** @type {?} */
    Store.prototype.actionsObserver;
    /** @type {?} */
    Store.prototype.reducerManager;
}
export const /** @type {?} */ STORE_PROVIDERS = [Store];
/**
 * @template T, K
 * @param {?} pathOrMapFn
 * @param {...?} paths
 * @return {?}
 */
export function select(pathOrMapFn, ...paths) {
    return function selectOperator(source$) {
        let /** @type {?} */ mapped$;
        if (typeof pathOrMapFn === 'string') {
            mapped$ = source$.pipe(pluck(pathOrMapFn, ...paths));
        }
        else if (typeof pathOrMapFn === 'function') {
            mapped$ = source$.pipe(map(pathOrMapFn));
        }
        else {
            throw new TypeError(`Unexpected type '${typeof pathOrMapFn}' in select operator,` +
                ` expected 'string' or 'function'`);
        }
        return mapped$.pipe(distinctUntilChanged());
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3N0b3JlL3NyYy9zdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUNyRCxPQUFPLEVBQUUsVUFBVSxFQUFzQixNQUFNLE1BQU0sQ0FBQztBQUN0RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFNBQVMsQ0FBQzs7OztBQUcxQyxNQUFNLFlBQWdCLFNBQVEsVUFBYTs7Ozs7O0lBQ3pDLFlBQ0UsTUFBdUIsRUFDZixpQkFDQTtRQUVSLEtBQUssRUFBRSxDQUFDO1FBSEEsb0JBQWUsR0FBZixlQUFlO1FBQ2YsbUJBQWMsR0FBZCxjQUFjO1FBSXRCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0tBQ3RCOzs7Ozs7SUE4Q0QsTUFBTSxDQUNKLFdBQXlDLEVBQ3pDLEdBQUcsS0FBZTtRQUVsQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkQ7Ozs7OztJQUVELElBQUksQ0FBSSxRQUF3QjtRQUM5Qix1QkFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUksSUFBSSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVFLEtBQUssQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBRTFCLE1BQU0sQ0FBQyxLQUFLLENBQUM7S0FDZDs7Ozs7O0lBRUQsUUFBUSxDQUE0QixNQUFTO1FBQzNDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ25DOzs7OztJQUVELElBQUksQ0FBQyxNQUFjO1FBQ2pCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ25DOzs7OztJQUVELEtBQUssQ0FBQyxHQUFRO1FBQ1osSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakM7Ozs7SUFFRCxRQUFRO1FBQ04sSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNqQzs7Ozs7OztJQUVELFVBQVUsQ0FDUixHQUFXLEVBQ1gsT0FBc0M7UUFFdEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzlDOzs7Ozs7SUFFRCxhQUFhLENBQXNCLEdBQVE7UUFDekMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDeEM7OztZQS9GRixVQUFVOzs7O1lBRkYsZUFBZTtZQUhmLGNBQWM7WUFFZCxjQUFjOzs7Ozs7Ozs7Ozs7Ozs7QUFxR3ZCLE1BQU0sQ0FBQyx1QkFBTSxlQUFlLEdBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7Ozs7OztBQXVFbkQsTUFBTSxpQkFDSixXQUF5QyxFQUN6QyxHQUFHLEtBQWU7SUFFbEIsTUFBTSxDQUFDLHdCQUF3QixPQUFzQjtRQUNuRCxxQkFBSSxPQUF3QixDQUFDO1FBRTdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sV0FBVyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDcEMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDdEQ7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxXQUFXLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM3QyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztTQUMxQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxJQUFJLFNBQVMsQ0FDakIsb0JBQW9CLE9BQU8sV0FBVyx1QkFBdUI7Z0JBQzNELGtDQUFrQyxDQUNyQyxDQUFDO1NBQ0g7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7S0FDN0MsQ0FBQztDQUNIIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgUHJvdmlkZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIE9ic2VydmVyLCBPcGVyYXRvciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZGlzdGluY3RVbnRpbENoYW5nZWQsIG1hcCwgcGx1Y2sgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IEFjdGlvbnNTdWJqZWN0IH0gZnJvbSAnLi9hY3Rpb25zX3N1YmplY3QnO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25SZWR1Y2VyIH0gZnJvbSAnLi9tb2RlbHMnO1xuaW1wb3J0IHsgUmVkdWNlck1hbmFnZXIgfSBmcm9tICcuL3JlZHVjZXJfbWFuYWdlcic7XG5pbXBvcnQgeyBTdGF0ZU9ic2VydmFibGUgfSBmcm9tICcuL3N0YXRlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFN0b3JlPFQ+IGV4dGVuZHMgT2JzZXJ2YWJsZTxUPiBpbXBsZW1lbnRzIE9ic2VydmVyPEFjdGlvbj4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBzdGF0ZSQ6IFN0YXRlT2JzZXJ2YWJsZSxcbiAgICBwcml2YXRlIGFjdGlvbnNPYnNlcnZlcjogQWN0aW9uc1N1YmplY3QsXG4gICAgcHJpdmF0ZSByZWR1Y2VyTWFuYWdlcjogUmVkdWNlck1hbmFnZXJcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuc291cmNlID0gc3RhdGUkO1xuICB9XG5cbiAgc2VsZWN0PEs+KG1hcEZuOiAoc3RhdGU6IFQpID0+IEspOiBPYnNlcnZhYmxlPEs+O1xuICBzZWxlY3Q8YSBleHRlbmRzIGtleW9mIFQ+KGtleTogYSk6IE9ic2VydmFibGU8VFthXT47XG4gIHNlbGVjdDxhIGV4dGVuZHMga2V5b2YgVCwgYiBleHRlbmRzIGtleW9mIFRbYV0+KFxuICAgIGtleTE6IGEsXG4gICAga2V5MjogYlxuICApOiBPYnNlcnZhYmxlPFRbYV1bYl0+O1xuICBzZWxlY3Q8YSBleHRlbmRzIGtleW9mIFQsIGIgZXh0ZW5kcyBrZXlvZiBUW2FdLCBjIGV4dGVuZHMga2V5b2YgVFthXVtiXT4oXG4gICAga2V5MTogYSxcbiAgICBrZXkyOiBiLFxuICAgIGtleTM6IGNcbiAgKTogT2JzZXJ2YWJsZTxUW2FdW2JdW2NdPjtcbiAgc2VsZWN0PFxuICAgIGEgZXh0ZW5kcyBrZXlvZiBULFxuICAgIGIgZXh0ZW5kcyBrZXlvZiBUW2FdLFxuICAgIGMgZXh0ZW5kcyBrZXlvZiBUW2FdW2JdLFxuICAgIGQgZXh0ZW5kcyBrZXlvZiBUW2FdW2JdW2NdXG4gID4oa2V5MTogYSwga2V5MjogYiwga2V5MzogYywga2V5NDogZCk6IE9ic2VydmFibGU8VFthXVtiXVtjXVtkXT47XG4gIHNlbGVjdDxcbiAgICBhIGV4dGVuZHMga2V5b2YgVCxcbiAgICBiIGV4dGVuZHMga2V5b2YgVFthXSxcbiAgICBjIGV4dGVuZHMga2V5b2YgVFthXVtiXSxcbiAgICBkIGV4dGVuZHMga2V5b2YgVFthXVtiXVtjXSxcbiAgICBlIGV4dGVuZHMga2V5b2YgVFthXVtiXVtjXVtkXVxuICA+KGtleTE6IGEsIGtleTI6IGIsIGtleTM6IGMsIGtleTQ6IGQsIGtleTU6IGUpOiBPYnNlcnZhYmxlPFRbYV1bYl1bY11bZF1bZV0+O1xuICBzZWxlY3Q8XG4gICAgYSBleHRlbmRzIGtleW9mIFQsXG4gICAgYiBleHRlbmRzIGtleW9mIFRbYV0sXG4gICAgYyBleHRlbmRzIGtleW9mIFRbYV1bYl0sXG4gICAgZCBleHRlbmRzIGtleW9mIFRbYV1bYl1bY10sXG4gICAgZSBleHRlbmRzIGtleW9mIFRbYV1bYl1bY11bZF0sXG4gICAgZiBleHRlbmRzIGtleW9mIFRbYV1bYl1bY11bZF1bZV1cbiAgPihcbiAgICBrZXkxOiBhLFxuICAgIGtleTI6IGIsXG4gICAga2V5MzogYyxcbiAgICBrZXk0OiBkLFxuICAgIGtleTU6IGUsXG4gICAga2V5NjogZlxuICApOiBPYnNlcnZhYmxlPFRbYV1bYl1bY11bZF1bZV1bZl0+O1xuICAvKipcbiAgICogVGhpcyBvdmVybG9hZCBpcyB1c2VkIHRvIHN1cHBvcnQgc3ByZWFkIG9wZXJhdG9yIHdpdGhcbiAgICogZml4ZWQgbGVuZ3RoIHR1cGxlcyB0eXBlIGluIHR5cGVzY3JpcHQgMi43XG4gICAqL1xuICBzZWxlY3Q8SyA9IGFueT4oLi4ucGF0aHM6IHN0cmluZ1tdKTogT2JzZXJ2YWJsZTxLPjtcbiAgc2VsZWN0KFxuICAgIHBhdGhPck1hcEZuOiAoKHN0YXRlOiBUKSA9PiBhbnkpIHwgc3RyaW5nLFxuICAgIC4uLnBhdGhzOiBzdHJpbmdbXVxuICApOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiBzZWxlY3QuY2FsbChudWxsLCBwYXRoT3JNYXBGbiwgLi4ucGF0aHMpKHRoaXMpO1xuICB9XG5cbiAgbGlmdDxSPihvcGVyYXRvcjogT3BlcmF0b3I8VCwgUj4pOiBTdG9yZTxSPiB7XG4gICAgY29uc3Qgc3RvcmUgPSBuZXcgU3RvcmU8Uj4odGhpcywgdGhpcy5hY3Rpb25zT2JzZXJ2ZXIsIHRoaXMucmVkdWNlck1hbmFnZXIpO1xuICAgIHN0b3JlLm9wZXJhdG9yID0gb3BlcmF0b3I7XG5cbiAgICByZXR1cm4gc3RvcmU7XG4gIH1cblxuICBkaXNwYXRjaDxWIGV4dGVuZHMgQWN0aW9uID0gQWN0aW9uPihhY3Rpb246IFYpIHtcbiAgICB0aGlzLmFjdGlvbnNPYnNlcnZlci5uZXh0KGFjdGlvbik7XG4gIH1cblxuICBuZXh0KGFjdGlvbjogQWN0aW9uKSB7XG4gICAgdGhpcy5hY3Rpb25zT2JzZXJ2ZXIubmV4dChhY3Rpb24pO1xuICB9XG5cbiAgZXJyb3IoZXJyOiBhbnkpIHtcbiAgICB0aGlzLmFjdGlvbnNPYnNlcnZlci5lcnJvcihlcnIpO1xuICB9XG5cbiAgY29tcGxldGUoKSB7XG4gICAgdGhpcy5hY3Rpb25zT2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgfVxuXG4gIGFkZFJlZHVjZXI8U3RhdGUsIEFjdGlvbnMgZXh0ZW5kcyBBY3Rpb24gPSBBY3Rpb24+KFxuICAgIGtleTogc3RyaW5nLFxuICAgIHJlZHVjZXI6IEFjdGlvblJlZHVjZXI8U3RhdGUsIEFjdGlvbnM+XG4gICkge1xuICAgIHRoaXMucmVkdWNlck1hbmFnZXIuYWRkUmVkdWNlcihrZXksIHJlZHVjZXIpO1xuICB9XG5cbiAgcmVtb3ZlUmVkdWNlcjxLZXkgZXh0ZW5kcyBrZXlvZiBUPihrZXk6IEtleSkge1xuICAgIHRoaXMucmVkdWNlck1hbmFnZXIucmVtb3ZlUmVkdWNlcihrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBTVE9SRV9QUk9WSURFUlM6IFByb3ZpZGVyW10gPSBbU3RvcmVdO1xuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0PFQsIEs+KFxuICBtYXBGbjogKHN0YXRlOiBUKSA9PiBLXG4pOiAoc291cmNlJDogT2JzZXJ2YWJsZTxUPikgPT4gT2JzZXJ2YWJsZTxLPjtcbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3Q8VCwgYSBleHRlbmRzIGtleW9mIFQ+KFxuICBrZXk6IGFcbik6IChzb3VyY2UkOiBPYnNlcnZhYmxlPFQ+KSA9PiBPYnNlcnZhYmxlPFRbYV0+O1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdDxULCBhIGV4dGVuZHMga2V5b2YgVCwgYiBleHRlbmRzIGtleW9mIFRbYV0+KFxuICBrZXkxOiBhLFxuICBrZXkyOiBiXG4pOiAoc291cmNlJDogT2JzZXJ2YWJsZTxUPikgPT4gT2JzZXJ2YWJsZTxUW2FdW2JdPjtcbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3Q8XG4gIFQsXG4gIGEgZXh0ZW5kcyBrZXlvZiBULFxuICBiIGV4dGVuZHMga2V5b2YgVFthXSxcbiAgYyBleHRlbmRzIGtleW9mIFRbYV1bYl1cbj4oXG4gIGtleTE6IGEsXG4gIGtleTI6IGIsXG4gIGtleTM6IGNcbik6IChzb3VyY2UkOiBPYnNlcnZhYmxlPFQ+KSA9PiBPYnNlcnZhYmxlPFRbYV1bYl1bY10+O1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdDxcbiAgVCxcbiAgYSBleHRlbmRzIGtleW9mIFQsXG4gIGIgZXh0ZW5kcyBrZXlvZiBUW2FdLFxuICBjIGV4dGVuZHMga2V5b2YgVFthXVtiXSxcbiAgZCBleHRlbmRzIGtleW9mIFRbYV1bYl1bY11cbj4oXG4gIGtleTE6IGEsXG4gIGtleTI6IGIsXG4gIGtleTM6IGMsXG4gIGtleTQ6IGRcbik6IChzb3VyY2UkOiBPYnNlcnZhYmxlPFQ+KSA9PiBPYnNlcnZhYmxlPFRbYV1bYl1bY11bZF0+O1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdDxcbiAgVCxcbiAgYSBleHRlbmRzIGtleW9mIFQsXG4gIGIgZXh0ZW5kcyBrZXlvZiBUW2FdLFxuICBjIGV4dGVuZHMga2V5b2YgVFthXVtiXSxcbiAgZCBleHRlbmRzIGtleW9mIFRbYV1bYl1bY10sXG4gIGUgZXh0ZW5kcyBrZXlvZiBUW2FdW2JdW2NdW2RdXG4+KFxuICBrZXkxOiBhLFxuICBrZXkyOiBiLFxuICBrZXkzOiBjLFxuICBrZXk0OiBkLFxuICBrZXk1OiBlXG4pOiAoc291cmNlJDogT2JzZXJ2YWJsZTxUPikgPT4gT2JzZXJ2YWJsZTxUW2FdW2JdW2NdW2RdW2VdPjtcbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3Q8XG4gIFQsXG4gIGEgZXh0ZW5kcyBrZXlvZiBULFxuICBiIGV4dGVuZHMga2V5b2YgVFthXSxcbiAgYyBleHRlbmRzIGtleW9mIFRbYV1bYl0sXG4gIGQgZXh0ZW5kcyBrZXlvZiBUW2FdW2JdW2NdLFxuICBlIGV4dGVuZHMga2V5b2YgVFthXVtiXVtjXVtkXSxcbiAgZiBleHRlbmRzIGtleW9mIFRbYV1bYl1bY11bZF1bZV1cbj4oXG4gIGtleTE6IGEsXG4gIGtleTI6IGIsXG4gIGtleTM6IGMsXG4gIGtleTQ6IGQsXG4gIGtleTU6IGUsXG4gIGtleTY6IGZcbik6IChzb3VyY2UkOiBPYnNlcnZhYmxlPFQ+KSA9PiBPYnNlcnZhYmxlPFRbYV1bYl1bY11bZF1bZV1bZl0+O1xuLyoqXG4gKiBUaGlzIG92ZXJsb2FkIGlzIHVzZWQgdG8gc3VwcG9ydCBzcHJlYWQgb3BlcmF0b3Igd2l0aFxuICogZml4ZWQgbGVuZ3RoIHR1cGxlcyB0eXBlIGluIHR5cGVzY3JpcHQgMi43XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3Q8VCwgSyA9IGFueT4oXG4gIC4uLnBhdGhzOiBzdHJpbmdbXVxuKTogKHNvdXJjZSQ6IE9ic2VydmFibGU8VD4pID0+IE9ic2VydmFibGU8Sz47XG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0PFQsIEs+KFxuICBwYXRoT3JNYXBGbjogKChzdGF0ZTogVCkgPT4gYW55KSB8IHN0cmluZyxcbiAgLi4ucGF0aHM6IHN0cmluZ1tdXG4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHNlbGVjdE9wZXJhdG9yKHNvdXJjZSQ6IE9ic2VydmFibGU8VD4pOiBPYnNlcnZhYmxlPEs+IHtcbiAgICBsZXQgbWFwcGVkJDogT2JzZXJ2YWJsZTxhbnk+O1xuXG4gICAgaWYgKHR5cGVvZiBwYXRoT3JNYXBGbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG1hcHBlZCQgPSBzb3VyY2UkLnBpcGUocGx1Y2socGF0aE9yTWFwRm4sIC4uLnBhdGhzKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGF0aE9yTWFwRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG1hcHBlZCQgPSBzb3VyY2UkLnBpcGUobWFwKHBhdGhPck1hcEZuKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIGBVbmV4cGVjdGVkIHR5cGUgJyR7dHlwZW9mIHBhdGhPck1hcEZufScgaW4gc2VsZWN0IG9wZXJhdG9yLGAgK1xuICAgICAgICAgIGAgZXhwZWN0ZWQgJ3N0cmluZycgb3IgJ2Z1bmN0aW9uJ2BcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcHBlZCQucGlwZShkaXN0aW5jdFVudGlsQ2hhbmdlZCgpKTtcbiAgfTtcbn1cbiJdfQ==