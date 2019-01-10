/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionsSubject } from './actions_subject';
import { INITIAL_REDUCERS, INITIAL_STATE, REDUCER_FACTORY } from './tokens';
import { createFeatureReducerFactory, createReducerFactory, omit, } from './utils';
/**
 * @abstract
 */
export class ReducerObservable extends Observable {
}
/**
 * @abstract
 */
export class ReducerManagerDispatcher extends ActionsSubject {
}
export const /** @type {?} */ UPDATE = /** @type {?} */ ('@ngrx/store/update-reducers');
export class ReducerManager extends BehaviorSubject {
    /**
     * @param {?} dispatcher
     * @param {?} initialState
     * @param {?} reducers
     * @param {?} reducerFactory
     */
    constructor(dispatcher, initialState, reducers, reducerFactory) {
        super(reducerFactory(reducers, initialState));
        this.dispatcher = dispatcher;
        this.initialState = initialState;
        this.reducers = reducers;
        this.reducerFactory = reducerFactory;
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    addFeature({ reducers, reducerFactory, metaReducers, initialState, key, }) {
        const /** @type {?} */ reducer = typeof reducers === 'function'
            ? createFeatureReducerFactory(metaReducers)(reducers, initialState)
            : createReducerFactory(reducerFactory, metaReducers)(reducers, initialState);
        this.addReducer(key, reducer);
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    removeFeature({ key }) {
        this.removeReducer(key);
    }
    /**
     * @param {?} key
     * @param {?} reducer
     * @return {?}
     */
    addReducer(key, reducer) {
        this.reducers = Object.assign({}, this.reducers, { [key]: reducer });
        this.updateReducers(key);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    removeReducer(key) {
        this.reducers = /** @type {?} */ (omit(this.reducers, key) /*TODO(#823)*/);
        this.updateReducers(key);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    updateReducers(key) {
        this.next(this.reducerFactory(this.reducers, this.initialState));
        this.dispatcher.next(/** @type {?} */ ({
            type: UPDATE,
            feature: key,
        }));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.complete();
    }
}
ReducerManager.decorators = [
    { type: Injectable }
];
/** @nocollapse */
ReducerManager.ctorParameters = () => [
    { type: ReducerManagerDispatcher, },
    { type: undefined, decorators: [{ type: Inject, args: [INITIAL_STATE,] },] },
    { type: undefined, decorators: [{ type: Inject, args: [INITIAL_REDUCERS,] },] },
    { type: undefined, decorators: [{ type: Inject, args: [REDUCER_FACTORY,] },] },
];
function ReducerManager_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    ReducerManager.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    ReducerManager.ctorParameters;
    /** @type {?} */
    ReducerManager.prototype.dispatcher;
    /** @type {?} */
    ReducerManager.prototype.initialState;
    /** @type {?} */
    ReducerManager.prototype.reducers;
    /** @type {?} */
    ReducerManager.prototype.reducerFactory;
}
export const /** @type {?} */ REDUCER_MANAGER_PROVIDERS = [
    ReducerManager,
    { provide: ReducerObservable, useExisting: ReducerManager },
    { provide: ReducerManagerDispatcher, useExisting: ActionsSubject },
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkdWNlcl9tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbW9kdWxlcy9zdG9yZS9zcmMvcmVkdWNlcl9tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBdUIsTUFBTSxlQUFlLENBQUM7QUFDeEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFbkQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBUW5ELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQzVFLE9BQU8sRUFDTCwyQkFBMkIsRUFDM0Isb0JBQW9CLEVBQ3BCLElBQUksR0FDTCxNQUFNLFNBQVMsQ0FBQzs7OztBQUVqQixNQUFNLHdCQUFrQyxTQUFRLFVBRS9DO0NBQUc7Ozs7QUFDSixNQUFNLCtCQUF5QyxTQUFRLGNBQWM7Q0FBRztBQUN4RSxNQUFNLENBQUMsdUJBQU0sTUFBTSxxQkFBRyw2QkFBOEQsQ0FBQSxDQUFDO0FBR3JGLE1BQU0scUJBQXNCLFNBQVEsZUFBd0M7Ozs7Ozs7SUFFMUUsWUFDVSxZQUN1QixjQUNHLFVBRTFCO1FBRVIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztRQU50QyxlQUFVLEdBQVYsVUFBVTtRQUNhLGlCQUFZLEdBQVosWUFBWTtRQUNULGFBQVEsR0FBUixRQUFRO1FBRWxDLG1CQUFjLEdBQWQsY0FBYztLQUd2Qjs7Ozs7SUFFRCxVQUFVLENBQUMsRUFDVCxRQUFRLEVBQ1IsY0FBYyxFQUNkLFlBQVksRUFDWixZQUFZLEVBQ1osR0FBRyxHQUNvQjtRQUN2Qix1QkFBTSxPQUFPLEdBQ1gsT0FBTyxRQUFRLEtBQUssVUFBVTtZQUM1QixDQUFDLENBQUMsMkJBQTJCLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQztZQUNuRSxDQUFDLENBQUMsb0JBQW9CLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUNoRCxRQUFRLEVBQ1IsWUFBWSxDQUNiLENBQUM7UUFFUixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUMvQjs7Ozs7SUFFRCxhQUFhLENBQUMsRUFBRSxHQUFHLEVBQTBCO1FBQzNDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDekI7Ozs7OztJQUVELFVBQVUsQ0FBQyxHQUFXLEVBQUUsT0FBZ0M7UUFDdEQsSUFBSSxDQUFDLFFBQVEscUJBQVEsSUFBSSxDQUFDLFFBQVEsSUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRSxDQUFDO1FBRXJELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDMUI7Ozs7O0lBRUQsYUFBYSxDQUFDLEdBQVc7UUFDdkIsSUFBSSxDQUFDLFFBQVEscUJBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLGVBQXNCLENBQUEsQ0FBQztRQUUvRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzFCOzs7OztJQUVPLGNBQWMsQ0FBQyxHQUFXO1FBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxtQkFBK0I7WUFDakQsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsR0FBRztTQUNiLEVBQUMsQ0FBQzs7Ozs7SUFHTCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ2pCOzs7WUF6REYsVUFBVTs7OztZQUhXLHdCQUF3Qjs0Q0FRekMsTUFBTSxTQUFDLGFBQWE7NENBQ3BCLE1BQU0sU0FBQyxnQkFBZ0I7NENBQ3ZCLE1BQU0sU0FBQyxlQUFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUQzQixNQUFNLENBQUMsdUJBQU0seUJBQXlCLEdBQWU7SUFDbkQsY0FBYztJQUNkLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUU7SUFDM0QsRUFBRSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRTtDQUNuRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlLCBPbkRlc3Ryb3ksIFByb3ZpZGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgQWN0aW9uc1N1YmplY3QgfSBmcm9tICcuL2FjdGlvbnNfc3ViamVjdCc7XG5pbXBvcnQge1xuICBBY3Rpb24sXG4gIEFjdGlvblJlZHVjZXIsXG4gIEFjdGlvblJlZHVjZXJGYWN0b3J5LFxuICBBY3Rpb25SZWR1Y2VyTWFwLFxuICBTdG9yZUZlYXR1cmUsXG59IGZyb20gJy4vbW9kZWxzJztcbmltcG9ydCB7IElOSVRJQUxfUkVEVUNFUlMsIElOSVRJQUxfU1RBVEUsIFJFRFVDRVJfRkFDVE9SWSB9IGZyb20gJy4vdG9rZW5zJztcbmltcG9ydCB7XG4gIGNyZWF0ZUZlYXR1cmVSZWR1Y2VyRmFjdG9yeSxcbiAgY3JlYXRlUmVkdWNlckZhY3RvcnksXG4gIG9taXQsXG59IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVkdWNlck9ic2VydmFibGUgZXh0ZW5kcyBPYnNlcnZhYmxlPFxuICBBY3Rpb25SZWR1Y2VyPGFueSwgYW55PlxuPiB7fVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlZHVjZXJNYW5hZ2VyRGlzcGF0Y2hlciBleHRlbmRzIEFjdGlvbnNTdWJqZWN0IHt9XG5leHBvcnQgY29uc3QgVVBEQVRFID0gJ0BuZ3J4L3N0b3JlL3VwZGF0ZS1yZWR1Y2VycycgYXMgJ0BuZ3J4L3N0b3JlL3VwZGF0ZS1yZWR1Y2Vycyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSZWR1Y2VyTWFuYWdlciBleHRlbmRzIEJlaGF2aW9yU3ViamVjdDxBY3Rpb25SZWR1Y2VyPGFueSwgYW55Pj5cbiAgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGRpc3BhdGNoZXI6IFJlZHVjZXJNYW5hZ2VyRGlzcGF0Y2hlcixcbiAgICBASW5qZWN0KElOSVRJQUxfU1RBVEUpIHByaXZhdGUgaW5pdGlhbFN0YXRlOiBhbnksXG4gICAgQEluamVjdChJTklUSUFMX1JFRFVDRVJTKSBwcml2YXRlIHJlZHVjZXJzOiBBY3Rpb25SZWR1Y2VyTWFwPGFueSwgYW55PixcbiAgICBASW5qZWN0KFJFRFVDRVJfRkFDVE9SWSlcbiAgICBwcml2YXRlIHJlZHVjZXJGYWN0b3J5OiBBY3Rpb25SZWR1Y2VyRmFjdG9yeTxhbnksIGFueT5cbiAgKSB7XG4gICAgc3VwZXIocmVkdWNlckZhY3RvcnkocmVkdWNlcnMsIGluaXRpYWxTdGF0ZSkpO1xuICB9XG5cbiAgYWRkRmVhdHVyZSh7XG4gICAgcmVkdWNlcnMsXG4gICAgcmVkdWNlckZhY3RvcnksXG4gICAgbWV0YVJlZHVjZXJzLFxuICAgIGluaXRpYWxTdGF0ZSxcbiAgICBrZXksXG4gIH06IFN0b3JlRmVhdHVyZTxhbnksIGFueT4pIHtcbiAgICBjb25zdCByZWR1Y2VyID1cbiAgICAgIHR5cGVvZiByZWR1Y2VycyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IGNyZWF0ZUZlYXR1cmVSZWR1Y2VyRmFjdG9yeShtZXRhUmVkdWNlcnMpKHJlZHVjZXJzLCBpbml0aWFsU3RhdGUpXG4gICAgICAgIDogY3JlYXRlUmVkdWNlckZhY3RvcnkocmVkdWNlckZhY3RvcnksIG1ldGFSZWR1Y2VycykoXG4gICAgICAgICAgICByZWR1Y2VycyxcbiAgICAgICAgICAgIGluaXRpYWxTdGF0ZVxuICAgICAgICAgICk7XG5cbiAgICB0aGlzLmFkZFJlZHVjZXIoa2V5LCByZWR1Y2VyKTtcbiAgfVxuXG4gIHJlbW92ZUZlYXR1cmUoeyBrZXkgfTogU3RvcmVGZWF0dXJlPGFueSwgYW55Pikge1xuICAgIHRoaXMucmVtb3ZlUmVkdWNlcihrZXkpO1xuICB9XG5cbiAgYWRkUmVkdWNlcihrZXk6IHN0cmluZywgcmVkdWNlcjogQWN0aW9uUmVkdWNlcjxhbnksIGFueT4pIHtcbiAgICB0aGlzLnJlZHVjZXJzID0geyAuLi50aGlzLnJlZHVjZXJzLCBba2V5XTogcmVkdWNlciB9O1xuXG4gICAgdGhpcy51cGRhdGVSZWR1Y2VycyhrZXkpO1xuICB9XG5cbiAgcmVtb3ZlUmVkdWNlcihrZXk6IHN0cmluZykge1xuICAgIHRoaXMucmVkdWNlcnMgPSBvbWl0KHRoaXMucmVkdWNlcnMsIGtleSkgLypUT0RPKCM4MjMpKi8gYXMgYW55O1xuXG4gICAgdGhpcy51cGRhdGVSZWR1Y2VycyhrZXkpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVSZWR1Y2VycyhrZXk6IHN0cmluZykge1xuICAgIHRoaXMubmV4dCh0aGlzLnJlZHVjZXJGYWN0b3J5KHRoaXMucmVkdWNlcnMsIHRoaXMuaW5pdGlhbFN0YXRlKSk7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm5leHQoPEFjdGlvbiAmIHsgZmVhdHVyZTogc3RyaW5nIH0+e1xuICAgICAgdHlwZTogVVBEQVRFLFxuICAgICAgZmVhdHVyZToga2V5LFxuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBSRURVQ0VSX01BTkFHRVJfUFJPVklERVJTOiBQcm92aWRlcltdID0gW1xuICBSZWR1Y2VyTWFuYWdlcixcbiAgeyBwcm92aWRlOiBSZWR1Y2VyT2JzZXJ2YWJsZSwgdXNlRXhpc3Rpbmc6IFJlZHVjZXJNYW5hZ2VyIH0sXG4gIHsgcHJvdmlkZTogUmVkdWNlck1hbmFnZXJEaXNwYXRjaGVyLCB1c2VFeGlzdGluZzogQWN0aW9uc1N1YmplY3QgfSxcbl07XG4iXX0=