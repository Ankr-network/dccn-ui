var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionsSubject } from './actions_subject';
import { INITIAL_REDUCERS, INITIAL_STATE, REDUCER_FACTORY } from './tokens';
import { createFeatureReducerFactory, createReducerFactory, omit, } from './utils';
var ReducerObservable = /** @class */ (function (_super) {
    __extends(ReducerObservable, _super);
    function ReducerObservable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ReducerObservable;
}(Observable));
export { ReducerObservable };
var ReducerManagerDispatcher = /** @class */ (function (_super) {
    __extends(ReducerManagerDispatcher, _super);
    function ReducerManagerDispatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ReducerManagerDispatcher;
}(ActionsSubject));
export { ReducerManagerDispatcher };
export var UPDATE = '@ngrx/store/update-reducers';
var ReducerManager = /** @class */ (function (_super) {
    __extends(ReducerManager, _super);
    function ReducerManager(dispatcher, initialState, reducers, reducerFactory) {
        var _this = _super.call(this, reducerFactory(reducers, initialState)) || this;
        _this.dispatcher = dispatcher;
        _this.initialState = initialState;
        _this.reducers = reducers;
        _this.reducerFactory = reducerFactory;
        return _this;
    }
    ReducerManager.prototype.addFeature = function (_a) {
        var reducers = _a.reducers, reducerFactory = _a.reducerFactory, metaReducers = _a.metaReducers, initialState = _a.initialState, key = _a.key;
        var reducer = typeof reducers === 'function'
            ? createFeatureReducerFactory(metaReducers)(reducers, initialState)
            : createReducerFactory(reducerFactory, metaReducers)(reducers, initialState);
        this.addReducer(key, reducer);
    };
    ReducerManager.prototype.removeFeature = function (_a) {
        var key = _a.key;
        this.removeReducer(key);
    };
    ReducerManager.prototype.addReducer = function (key, reducer) {
        this.reducers = __assign({}, this.reducers, (_a = {}, _a[key] = reducer, _a));
        this.updateReducers(key);
        var _a;
    };
    ReducerManager.prototype.removeReducer = function (key) {
        this.reducers = omit(this.reducers, key) /*TODO(#823)*/;
        this.updateReducers(key);
    };
    ReducerManager.prototype.updateReducers = function (key) {
        this.next(this.reducerFactory(this.reducers, this.initialState));
        this.dispatcher.next({
            type: UPDATE,
            feature: key,
        });
    };
    ReducerManager.prototype.ngOnDestroy = function () {
        this.complete();
    };
    ReducerManager.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    ReducerManager.ctorParameters = function () { return [
        { type: ReducerManagerDispatcher, },
        { type: undefined, decorators: [{ type: Inject, args: [INITIAL_STATE,] },] },
        { type: undefined, decorators: [{ type: Inject, args: [INITIAL_REDUCERS,] },] },
        { type: undefined, decorators: [{ type: Inject, args: [REDUCER_FACTORY,] },] },
    ]; };
    return ReducerManager;
}(BehaviorSubject));
export { ReducerManager };
export var REDUCER_MANAGER_PROVIDERS = [
    ReducerManager,
    { provide: ReducerObservable, useExisting: ReducerManager },
    { provide: ReducerManagerDispatcher, useExisting: ActionsSubject },
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkdWNlcl9tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbW9kdWxlcy9zdG9yZS9zcmMvcmVkdWNlcl9tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUF1QixNQUFNLGVBQWUsQ0FBQztBQUN4RSxPQUFPLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVuRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFRbkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDNUUsT0FBTyxFQUNMLDJCQUEyQixFQUMzQixvQkFBb0IsRUFDcEIsSUFBSSxHQUNMLE1BQU0sU0FBUyxDQUFDO0FBRWpCLElBQUE7SUFBZ0QscUNBRS9DOzs7OzRCQXBCRDtFQWtCZ0QsVUFBVSxFQUV0RCxDQUFBO0FBRkosNkJBRUk7QUFDSixJQUFBO0lBQXVELDRDQUFjOzs7O21DQXJCckU7RUFxQnVELGNBQWMsRUFBRyxDQUFBO0FBQXhFLG9DQUF3RTtBQUN4RSxNQUFNLENBQUMsSUFBTSxNQUFNLEdBQUcsNkJBQThELENBQUM7O0lBR2pELGtDQUF3QztJQUUxRSx3QkFDVSxVQUFvQyxFQUNiLGNBQ0csVUFFMUI7UUFMVixZQU9FLGtCQUFNLGNBQWMsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUMsU0FDOUM7UUFQUyxnQkFBVSxHQUFWLFVBQVUsQ0FBMEI7UUFDYixrQkFBWSxHQUFaLFlBQVk7UUFDVCxjQUFRLEdBQVIsUUFBUTtRQUVsQyxvQkFBYyxHQUFkLGNBQWM7O0tBR3ZCO0lBRUQsbUNBQVUsR0FBVixVQUFXLEVBTWM7WUFMdkIsc0JBQVEsRUFDUixrQ0FBYyxFQUNkLDhCQUFZLEVBQ1osOEJBQVksRUFDWixZQUFHO1FBRUgsSUFBTSxPQUFPLEdBQ1gsT0FBTyxRQUFRLEtBQUssVUFBVTtZQUM1QixDQUFDLENBQUMsMkJBQTJCLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQztZQUNuRSxDQUFDLENBQUMsb0JBQW9CLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUNoRCxRQUFRLEVBQ1IsWUFBWSxDQUNiLENBQUM7UUFFUixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUMvQjtJQUVELHNDQUFhLEdBQWIsVUFBYyxFQUErQjtZQUE3QixZQUFHO1FBQ2pCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDekI7SUFFRCxtQ0FBVSxHQUFWLFVBQVcsR0FBVyxFQUFFLE9BQWdDO1FBQ3RELElBQUksQ0FBQyxRQUFRLGdCQUFRLElBQUksQ0FBQyxRQUFRLGVBQUcsR0FBRyxJQUFHLE9BQU8sTUFBRSxDQUFDO1FBRXJELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7O0tBQzFCO0lBRUQsc0NBQWEsR0FBYixVQUFjLEdBQVc7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsZUFBc0IsQ0FBQztRQUUvRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzFCO0lBRU8sdUNBQWMsR0FBdEIsVUFBdUIsR0FBVztRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBK0I7WUFDakQsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsR0FBRztTQUNiLENBQUMsQ0FBQztLQUNKO0lBRUQsb0NBQVcsR0FBWDtRQUNFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNqQjs7Z0JBekRGLFVBQVU7Ozs7Z0JBSFcsd0JBQXdCO2dEQVF6QyxNQUFNLFNBQUMsYUFBYTtnREFDcEIsTUFBTSxTQUFDLGdCQUFnQjtnREFDdkIsTUFBTSxTQUFDLGVBQWU7O3lCQS9CM0I7RUF5Qm9DLGVBQWU7U0FBdEMsY0FBYztBQTJEM0IsTUFBTSxDQUFDLElBQU0seUJBQXlCLEdBQWU7SUFDbkQsY0FBYztJQUNkLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUU7SUFDM0QsRUFBRSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRTtDQUNuRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlLCBPbkRlc3Ryb3ksIFByb3ZpZGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgQWN0aW9uc1N1YmplY3QgfSBmcm9tICcuL2FjdGlvbnNfc3ViamVjdCc7XG5pbXBvcnQge1xuICBBY3Rpb24sXG4gIEFjdGlvblJlZHVjZXIsXG4gIEFjdGlvblJlZHVjZXJGYWN0b3J5LFxuICBBY3Rpb25SZWR1Y2VyTWFwLFxuICBTdG9yZUZlYXR1cmUsXG59IGZyb20gJy4vbW9kZWxzJztcbmltcG9ydCB7IElOSVRJQUxfUkVEVUNFUlMsIElOSVRJQUxfU1RBVEUsIFJFRFVDRVJfRkFDVE9SWSB9IGZyb20gJy4vdG9rZW5zJztcbmltcG9ydCB7XG4gIGNyZWF0ZUZlYXR1cmVSZWR1Y2VyRmFjdG9yeSxcbiAgY3JlYXRlUmVkdWNlckZhY3RvcnksXG4gIG9taXQsXG59IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVkdWNlck9ic2VydmFibGUgZXh0ZW5kcyBPYnNlcnZhYmxlPFxuICBBY3Rpb25SZWR1Y2VyPGFueSwgYW55PlxuPiB7fVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlZHVjZXJNYW5hZ2VyRGlzcGF0Y2hlciBleHRlbmRzIEFjdGlvbnNTdWJqZWN0IHt9XG5leHBvcnQgY29uc3QgVVBEQVRFID0gJ0BuZ3J4L3N0b3JlL3VwZGF0ZS1yZWR1Y2VycycgYXMgJ0BuZ3J4L3N0b3JlL3VwZGF0ZS1yZWR1Y2Vycyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSZWR1Y2VyTWFuYWdlciBleHRlbmRzIEJlaGF2aW9yU3ViamVjdDxBY3Rpb25SZWR1Y2VyPGFueSwgYW55Pj5cbiAgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGRpc3BhdGNoZXI6IFJlZHVjZXJNYW5hZ2VyRGlzcGF0Y2hlcixcbiAgICBASW5qZWN0KElOSVRJQUxfU1RBVEUpIHByaXZhdGUgaW5pdGlhbFN0YXRlOiBhbnksXG4gICAgQEluamVjdChJTklUSUFMX1JFRFVDRVJTKSBwcml2YXRlIHJlZHVjZXJzOiBBY3Rpb25SZWR1Y2VyTWFwPGFueSwgYW55PixcbiAgICBASW5qZWN0KFJFRFVDRVJfRkFDVE9SWSlcbiAgICBwcml2YXRlIHJlZHVjZXJGYWN0b3J5OiBBY3Rpb25SZWR1Y2VyRmFjdG9yeTxhbnksIGFueT5cbiAgKSB7XG4gICAgc3VwZXIocmVkdWNlckZhY3RvcnkocmVkdWNlcnMsIGluaXRpYWxTdGF0ZSkpO1xuICB9XG5cbiAgYWRkRmVhdHVyZSh7XG4gICAgcmVkdWNlcnMsXG4gICAgcmVkdWNlckZhY3RvcnksXG4gICAgbWV0YVJlZHVjZXJzLFxuICAgIGluaXRpYWxTdGF0ZSxcbiAgICBrZXksXG4gIH06IFN0b3JlRmVhdHVyZTxhbnksIGFueT4pIHtcbiAgICBjb25zdCByZWR1Y2VyID1cbiAgICAgIHR5cGVvZiByZWR1Y2VycyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IGNyZWF0ZUZlYXR1cmVSZWR1Y2VyRmFjdG9yeShtZXRhUmVkdWNlcnMpKHJlZHVjZXJzLCBpbml0aWFsU3RhdGUpXG4gICAgICAgIDogY3JlYXRlUmVkdWNlckZhY3RvcnkocmVkdWNlckZhY3RvcnksIG1ldGFSZWR1Y2VycykoXG4gICAgICAgICAgICByZWR1Y2VycyxcbiAgICAgICAgICAgIGluaXRpYWxTdGF0ZVxuICAgICAgICAgICk7XG5cbiAgICB0aGlzLmFkZFJlZHVjZXIoa2V5LCByZWR1Y2VyKTtcbiAgfVxuXG4gIHJlbW92ZUZlYXR1cmUoeyBrZXkgfTogU3RvcmVGZWF0dXJlPGFueSwgYW55Pikge1xuICAgIHRoaXMucmVtb3ZlUmVkdWNlcihrZXkpO1xuICB9XG5cbiAgYWRkUmVkdWNlcihrZXk6IHN0cmluZywgcmVkdWNlcjogQWN0aW9uUmVkdWNlcjxhbnksIGFueT4pIHtcbiAgICB0aGlzLnJlZHVjZXJzID0geyAuLi50aGlzLnJlZHVjZXJzLCBba2V5XTogcmVkdWNlciB9O1xuXG4gICAgdGhpcy51cGRhdGVSZWR1Y2VycyhrZXkpO1xuICB9XG5cbiAgcmVtb3ZlUmVkdWNlcihrZXk6IHN0cmluZykge1xuICAgIHRoaXMucmVkdWNlcnMgPSBvbWl0KHRoaXMucmVkdWNlcnMsIGtleSkgLypUT0RPKCM4MjMpKi8gYXMgYW55O1xuXG4gICAgdGhpcy51cGRhdGVSZWR1Y2VycyhrZXkpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVSZWR1Y2VycyhrZXk6IHN0cmluZykge1xuICAgIHRoaXMubmV4dCh0aGlzLnJlZHVjZXJGYWN0b3J5KHRoaXMucmVkdWNlcnMsIHRoaXMuaW5pdGlhbFN0YXRlKSk7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm5leHQoPEFjdGlvbiAmIHsgZmVhdHVyZTogc3RyaW5nIH0+e1xuICAgICAgdHlwZTogVVBEQVRFLFxuICAgICAgZmVhdHVyZToga2V5LFxuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBSRURVQ0VSX01BTkFHRVJfUFJPVklERVJTOiBQcm92aWRlcltdID0gW1xuICBSZWR1Y2VyTWFuYWdlcixcbiAgeyBwcm92aWRlOiBSZWR1Y2VyT2JzZXJ2YWJsZSwgdXNlRXhpc3Rpbmc6IFJlZHVjZXJNYW5hZ2VyIH0sXG4gIHsgcHJvdmlkZTogUmVkdWNlck1hbmFnZXJEaXNwYXRjaGVyLCB1c2VFeGlzdGluZzogQWN0aW9uc1N1YmplY3QgfSxcbl07XG4iXX0=