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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';
import { ActionsSubject } from './actions_subject';
import { ReducerManager } from './reducer_manager';
import { StateObservable } from './state';
var Store = /** @class */ (function (_super) {
    __extends(Store, _super);
    function Store(state$, actionsObserver, reducerManager) {
        var _this = _super.call(this) || this;
        _this.actionsObserver = actionsObserver;
        _this.reducerManager = reducerManager;
        _this.source = state$;
        return _this;
    }
    Store.prototype.select = function (pathOrMapFn) {
        var paths = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            paths[_i - 1] = arguments[_i];
        }
        return select.call.apply(select, __spread([null, pathOrMapFn], paths))(this);
    };
    Store.prototype.lift = function (operator) {
        var store = new Store(this, this.actionsObserver, this.reducerManager);
        store.operator = operator;
        return store;
    };
    Store.prototype.dispatch = function (action) {
        this.actionsObserver.next(action);
    };
    Store.prototype.next = function (action) {
        this.actionsObserver.next(action);
    };
    Store.prototype.error = function (err) {
        this.actionsObserver.error(err);
    };
    Store.prototype.complete = function () {
        this.actionsObserver.complete();
    };
    Store.prototype.addReducer = function (key, reducer) {
        this.reducerManager.addReducer(key, reducer);
    };
    Store.prototype.removeReducer = function (key) {
        this.reducerManager.removeReducer(key);
    };
    Store.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    Store.ctorParameters = function () { return [
        { type: StateObservable, },
        { type: ActionsSubject, },
        { type: ReducerManager, },
    ]; };
    return Store;
}(Observable));
export { Store };
export var STORE_PROVIDERS = [Store];
export function select(pathOrMapFn) {
    var paths = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        paths[_i - 1] = arguments[_i];
    }
    return function selectOperator(source$) {
        var mapped$;
        if (typeof pathOrMapFn === 'string') {
            mapped$ = source$.pipe(pluck.apply(void 0, __spread([pathOrMapFn], paths)));
        }
        else if (typeof pathOrMapFn === 'function') {
            mapped$ = source$.pipe(map(pathOrMapFn));
        }
        else {
            throw new TypeError("Unexpected type '" + typeof pathOrMapFn + "' in select operator," +
                " expected 'string' or 'function'");
        }
        return mapped$.pipe(distinctUntilChanged());
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3N0b3JlL3NyYy9zdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sRUFBRSxVQUFVLEVBQXNCLE1BQU0sTUFBTSxDQUFDO0FBQ3RELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFbEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRW5ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sU0FBUyxDQUFDOztJQUdaLHlCQUFhO0lBQ3pDLGVBQ0UsTUFBdUIsRUFDZixlQUErQixFQUMvQixjQUE4QjtRQUh4QyxZQUtFLGlCQUFPLFNBR1I7UUFOUyxxQkFBZSxHQUFmLGVBQWUsQ0FBZ0I7UUFDL0Isb0JBQWMsR0FBZCxjQUFjLENBQWdCO1FBSXRDLEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztLQUN0QjtJQThDRCxzQkFBTSxHQUFOLFVBQ0UsV0FBeUM7UUFDekMsZUFBa0I7YUFBbEIsVUFBa0IsRUFBbEIscUJBQWtCLEVBQWxCLElBQWtCO1lBQWxCLDhCQUFrQjs7UUFFbEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQVgsTUFBTSxZQUFNLElBQUksRUFBRSxXQUFXLEdBQUssS0FBSyxHQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3ZEO0lBRUQsb0JBQUksR0FBSixVQUFRLFFBQXdCO1FBQzlCLElBQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFJLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM1RSxLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUUxQixNQUFNLENBQUMsS0FBSyxDQUFDO0tBQ2Q7SUFFRCx3QkFBUSxHQUFSLFVBQW9DLE1BQVM7UUFDM0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDbkM7SUFFRCxvQkFBSSxHQUFKLFVBQUssTUFBYztRQUNqQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNuQztJQUVELHFCQUFLLEdBQUwsVUFBTSxHQUFRO1FBQ1osSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakM7SUFFRCx3QkFBUSxHQUFSO1FBQ0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNqQztJQUVELDBCQUFVLEdBQVYsVUFDRSxHQUFXLEVBQ1gsT0FBc0M7UUFFdEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzlDO0lBRUQsNkJBQWEsR0FBYixVQUFtQyxHQUFRO1FBQ3pDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3hDOztnQkEvRkYsVUFBVTs7OztnQkFGRixlQUFlO2dCQUhmLGNBQWM7Z0JBRWQsY0FBYzs7Z0JBTnZCO0VBVThCLFVBQVU7U0FBM0IsS0FBSztBQWlHbEIsTUFBTSxDQUFDLElBQU0sZUFBZSxHQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7QUF1RW5ELE1BQU0saUJBQ0osV0FBeUM7SUFDekMsZUFBa0I7U0FBbEIsVUFBa0IsRUFBbEIscUJBQWtCLEVBQWxCLElBQWtCO1FBQWxCLDhCQUFrQjs7SUFFbEIsTUFBTSxDQUFDLHdCQUF3QixPQUFzQjtRQUNuRCxJQUFJLE9BQXdCLENBQUM7UUFFN0IsRUFBRSxDQUFDLENBQUMsT0FBTyxXQUFXLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNwQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLHlCQUFDLFdBQVcsR0FBSyxLQUFLLEdBQUUsQ0FBQztTQUN0RDtRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLFdBQVcsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1NBQzFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLElBQUksU0FBUyxDQUNqQixzQkFBb0IsT0FBTyxXQUFXLDBCQUF1QjtnQkFDM0Qsa0NBQWtDLENBQ3JDLENBQUM7U0FDSDtRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztLQUM3QyxDQUFDO0NBQ0giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBQcm92aWRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgT2JzZXJ2ZXIsIE9wZXJhdG9yIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgbWFwLCBwbHVjayB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgQWN0aW9uc1N1YmplY3QgfSBmcm9tICcuL2FjdGlvbnNfc3ViamVjdCc7XG5pbXBvcnQgeyBBY3Rpb24sIEFjdGlvblJlZHVjZXIgfSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQgeyBSZWR1Y2VyTWFuYWdlciB9IGZyb20gJy4vcmVkdWNlcl9tYW5hZ2VyJztcbmltcG9ydCB7IFN0YXRlT2JzZXJ2YWJsZSB9IGZyb20gJy4vc3RhdGUnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU3RvcmU8VD4gZXh0ZW5kcyBPYnNlcnZhYmxlPFQ+IGltcGxlbWVudHMgT2JzZXJ2ZXI8QWN0aW9uPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHN0YXRlJDogU3RhdGVPYnNlcnZhYmxlLFxuICAgIHByaXZhdGUgYWN0aW9uc09ic2VydmVyOiBBY3Rpb25zU3ViamVjdCxcbiAgICBwcml2YXRlIHJlZHVjZXJNYW5hZ2VyOiBSZWR1Y2VyTWFuYWdlclxuICApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5zb3VyY2UgPSBzdGF0ZSQ7XG4gIH1cblxuICBzZWxlY3Q8Sz4obWFwRm46IChzdGF0ZTogVCkgPT4gSyk6IE9ic2VydmFibGU8Sz47XG4gIHNlbGVjdDxhIGV4dGVuZHMga2V5b2YgVD4oa2V5OiBhKTogT2JzZXJ2YWJsZTxUW2FdPjtcbiAgc2VsZWN0PGEgZXh0ZW5kcyBrZXlvZiBULCBiIGV4dGVuZHMga2V5b2YgVFthXT4oXG4gICAga2V5MTogYSxcbiAgICBrZXkyOiBiXG4gICk6IE9ic2VydmFibGU8VFthXVtiXT47XG4gIHNlbGVjdDxhIGV4dGVuZHMga2V5b2YgVCwgYiBleHRlbmRzIGtleW9mIFRbYV0sIGMgZXh0ZW5kcyBrZXlvZiBUW2FdW2JdPihcbiAgICBrZXkxOiBhLFxuICAgIGtleTI6IGIsXG4gICAga2V5MzogY1xuICApOiBPYnNlcnZhYmxlPFRbYV1bYl1bY10+O1xuICBzZWxlY3Q8XG4gICAgYSBleHRlbmRzIGtleW9mIFQsXG4gICAgYiBleHRlbmRzIGtleW9mIFRbYV0sXG4gICAgYyBleHRlbmRzIGtleW9mIFRbYV1bYl0sXG4gICAgZCBleHRlbmRzIGtleW9mIFRbYV1bYl1bY11cbiAgPihrZXkxOiBhLCBrZXkyOiBiLCBrZXkzOiBjLCBrZXk0OiBkKTogT2JzZXJ2YWJsZTxUW2FdW2JdW2NdW2RdPjtcbiAgc2VsZWN0PFxuICAgIGEgZXh0ZW5kcyBrZXlvZiBULFxuICAgIGIgZXh0ZW5kcyBrZXlvZiBUW2FdLFxuICAgIGMgZXh0ZW5kcyBrZXlvZiBUW2FdW2JdLFxuICAgIGQgZXh0ZW5kcyBrZXlvZiBUW2FdW2JdW2NdLFxuICAgIGUgZXh0ZW5kcyBrZXlvZiBUW2FdW2JdW2NdW2RdXG4gID4oa2V5MTogYSwga2V5MjogYiwga2V5MzogYywga2V5NDogZCwga2V5NTogZSk6IE9ic2VydmFibGU8VFthXVtiXVtjXVtkXVtlXT47XG4gIHNlbGVjdDxcbiAgICBhIGV4dGVuZHMga2V5b2YgVCxcbiAgICBiIGV4dGVuZHMga2V5b2YgVFthXSxcbiAgICBjIGV4dGVuZHMga2V5b2YgVFthXVtiXSxcbiAgICBkIGV4dGVuZHMga2V5b2YgVFthXVtiXVtjXSxcbiAgICBlIGV4dGVuZHMga2V5b2YgVFthXVtiXVtjXVtkXSxcbiAgICBmIGV4dGVuZHMga2V5b2YgVFthXVtiXVtjXVtkXVtlXVxuICA+KFxuICAgIGtleTE6IGEsXG4gICAga2V5MjogYixcbiAgICBrZXkzOiBjLFxuICAgIGtleTQ6IGQsXG4gICAga2V5NTogZSxcbiAgICBrZXk2OiBmXG4gICk6IE9ic2VydmFibGU8VFthXVtiXVtjXVtkXVtlXVtmXT47XG4gIC8qKlxuICAgKiBUaGlzIG92ZXJsb2FkIGlzIHVzZWQgdG8gc3VwcG9ydCBzcHJlYWQgb3BlcmF0b3Igd2l0aFxuICAgKiBmaXhlZCBsZW5ndGggdHVwbGVzIHR5cGUgaW4gdHlwZXNjcmlwdCAyLjdcbiAgICovXG4gIHNlbGVjdDxLID0gYW55PiguLi5wYXRoczogc3RyaW5nW10pOiBPYnNlcnZhYmxlPEs+O1xuICBzZWxlY3QoXG4gICAgcGF0aE9yTWFwRm46ICgoc3RhdGU6IFQpID0+IGFueSkgfCBzdHJpbmcsXG4gICAgLi4ucGF0aHM6IHN0cmluZ1tdXG4gICk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIHNlbGVjdC5jYWxsKG51bGwsIHBhdGhPck1hcEZuLCAuLi5wYXRocykodGhpcyk7XG4gIH1cblxuICBsaWZ0PFI+KG9wZXJhdG9yOiBPcGVyYXRvcjxULCBSPik6IFN0b3JlPFI+IHtcbiAgICBjb25zdCBzdG9yZSA9IG5ldyBTdG9yZTxSPih0aGlzLCB0aGlzLmFjdGlvbnNPYnNlcnZlciwgdGhpcy5yZWR1Y2VyTWFuYWdlcik7XG4gICAgc3RvcmUub3BlcmF0b3IgPSBvcGVyYXRvcjtcblxuICAgIHJldHVybiBzdG9yZTtcbiAgfVxuXG4gIGRpc3BhdGNoPFYgZXh0ZW5kcyBBY3Rpb24gPSBBY3Rpb24+KGFjdGlvbjogVikge1xuICAgIHRoaXMuYWN0aW9uc09ic2VydmVyLm5leHQoYWN0aW9uKTtcbiAgfVxuXG4gIG5leHQoYWN0aW9uOiBBY3Rpb24pIHtcbiAgICB0aGlzLmFjdGlvbnNPYnNlcnZlci5uZXh0KGFjdGlvbik7XG4gIH1cblxuICBlcnJvcihlcnI6IGFueSkge1xuICAgIHRoaXMuYWN0aW9uc09ic2VydmVyLmVycm9yKGVycik7XG4gIH1cblxuICBjb21wbGV0ZSgpIHtcbiAgICB0aGlzLmFjdGlvbnNPYnNlcnZlci5jb21wbGV0ZSgpO1xuICB9XG5cbiAgYWRkUmVkdWNlcjxTdGF0ZSwgQWN0aW9ucyBleHRlbmRzIEFjdGlvbiA9IEFjdGlvbj4oXG4gICAga2V5OiBzdHJpbmcsXG4gICAgcmVkdWNlcjogQWN0aW9uUmVkdWNlcjxTdGF0ZSwgQWN0aW9ucz5cbiAgKSB7XG4gICAgdGhpcy5yZWR1Y2VyTWFuYWdlci5hZGRSZWR1Y2VyKGtleSwgcmVkdWNlcik7XG4gIH1cblxuICByZW1vdmVSZWR1Y2VyPEtleSBleHRlbmRzIGtleW9mIFQ+KGtleTogS2V5KSB7XG4gICAgdGhpcy5yZWR1Y2VyTWFuYWdlci5yZW1vdmVSZWR1Y2VyKGtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFNUT1JFX1BST1ZJREVSUzogUHJvdmlkZXJbXSA9IFtTdG9yZV07XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3Q8VCwgSz4oXG4gIG1hcEZuOiAoc3RhdGU6IFQpID0+IEtcbik6IChzb3VyY2UkOiBPYnNlcnZhYmxlPFQ+KSA9PiBPYnNlcnZhYmxlPEs+O1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdDxULCBhIGV4dGVuZHMga2V5b2YgVD4oXG4gIGtleTogYVxuKTogKHNvdXJjZSQ6IE9ic2VydmFibGU8VD4pID0+IE9ic2VydmFibGU8VFthXT47XG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0PFQsIGEgZXh0ZW5kcyBrZXlvZiBULCBiIGV4dGVuZHMga2V5b2YgVFthXT4oXG4gIGtleTE6IGEsXG4gIGtleTI6IGJcbik6IChzb3VyY2UkOiBPYnNlcnZhYmxlPFQ+KSA9PiBPYnNlcnZhYmxlPFRbYV1bYl0+O1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdDxcbiAgVCxcbiAgYSBleHRlbmRzIGtleW9mIFQsXG4gIGIgZXh0ZW5kcyBrZXlvZiBUW2FdLFxuICBjIGV4dGVuZHMga2V5b2YgVFthXVtiXVxuPihcbiAga2V5MTogYSxcbiAga2V5MjogYixcbiAga2V5MzogY1xuKTogKHNvdXJjZSQ6IE9ic2VydmFibGU8VD4pID0+IE9ic2VydmFibGU8VFthXVtiXVtjXT47XG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0PFxuICBULFxuICBhIGV4dGVuZHMga2V5b2YgVCxcbiAgYiBleHRlbmRzIGtleW9mIFRbYV0sXG4gIGMgZXh0ZW5kcyBrZXlvZiBUW2FdW2JdLFxuICBkIGV4dGVuZHMga2V5b2YgVFthXVtiXVtjXVxuPihcbiAga2V5MTogYSxcbiAga2V5MjogYixcbiAga2V5MzogYyxcbiAga2V5NDogZFxuKTogKHNvdXJjZSQ6IE9ic2VydmFibGU8VD4pID0+IE9ic2VydmFibGU8VFthXVtiXVtjXVtkXT47XG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0PFxuICBULFxuICBhIGV4dGVuZHMga2V5b2YgVCxcbiAgYiBleHRlbmRzIGtleW9mIFRbYV0sXG4gIGMgZXh0ZW5kcyBrZXlvZiBUW2FdW2JdLFxuICBkIGV4dGVuZHMga2V5b2YgVFthXVtiXVtjXSxcbiAgZSBleHRlbmRzIGtleW9mIFRbYV1bYl1bY11bZF1cbj4oXG4gIGtleTE6IGEsXG4gIGtleTI6IGIsXG4gIGtleTM6IGMsXG4gIGtleTQ6IGQsXG4gIGtleTU6IGVcbik6IChzb3VyY2UkOiBPYnNlcnZhYmxlPFQ+KSA9PiBPYnNlcnZhYmxlPFRbYV1bYl1bY11bZF1bZV0+O1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdDxcbiAgVCxcbiAgYSBleHRlbmRzIGtleW9mIFQsXG4gIGIgZXh0ZW5kcyBrZXlvZiBUW2FdLFxuICBjIGV4dGVuZHMga2V5b2YgVFthXVtiXSxcbiAgZCBleHRlbmRzIGtleW9mIFRbYV1bYl1bY10sXG4gIGUgZXh0ZW5kcyBrZXlvZiBUW2FdW2JdW2NdW2RdLFxuICBmIGV4dGVuZHMga2V5b2YgVFthXVtiXVtjXVtkXVtlXVxuPihcbiAga2V5MTogYSxcbiAga2V5MjogYixcbiAga2V5MzogYyxcbiAga2V5NDogZCxcbiAga2V5NTogZSxcbiAga2V5NjogZlxuKTogKHNvdXJjZSQ6IE9ic2VydmFibGU8VD4pID0+IE9ic2VydmFibGU8VFthXVtiXVtjXVtkXVtlXVtmXT47XG4vKipcbiAqIFRoaXMgb3ZlcmxvYWQgaXMgdXNlZCB0byBzdXBwb3J0IHNwcmVhZCBvcGVyYXRvciB3aXRoXG4gKiBmaXhlZCBsZW5ndGggdHVwbGVzIHR5cGUgaW4gdHlwZXNjcmlwdCAyLjdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdDxULCBLID0gYW55PihcbiAgLi4ucGF0aHM6IHN0cmluZ1tdXG4pOiAoc291cmNlJDogT2JzZXJ2YWJsZTxUPikgPT4gT2JzZXJ2YWJsZTxLPjtcbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3Q8VCwgSz4oXG4gIHBhdGhPck1hcEZuOiAoKHN0YXRlOiBUKSA9PiBhbnkpIHwgc3RyaW5nLFxuICAuLi5wYXRoczogc3RyaW5nW11cbikge1xuICByZXR1cm4gZnVuY3Rpb24gc2VsZWN0T3BlcmF0b3Ioc291cmNlJDogT2JzZXJ2YWJsZTxUPik6IE9ic2VydmFibGU8Sz4ge1xuICAgIGxldCBtYXBwZWQkOiBPYnNlcnZhYmxlPGFueT47XG5cbiAgICBpZiAodHlwZW9mIHBhdGhPck1hcEZuID09PSAnc3RyaW5nJykge1xuICAgICAgbWFwcGVkJCA9IHNvdXJjZSQucGlwZShwbHVjayhwYXRoT3JNYXBGbiwgLi4ucGF0aHMpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXRoT3JNYXBGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbWFwcGVkJCA9IHNvdXJjZSQucGlwZShtYXAocGF0aE9yTWFwRm4pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgYFVuZXhwZWN0ZWQgdHlwZSAnJHt0eXBlb2YgcGF0aE9yTWFwRm59JyBpbiBzZWxlY3Qgb3BlcmF0b3IsYCArXG4gICAgICAgICAgYCBleHBlY3RlZCAnc3RyaW5nJyBvciAnZnVuY3Rpb24nYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFwcGVkJC5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpO1xuICB9O1xufVxuIl19