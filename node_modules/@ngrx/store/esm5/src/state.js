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
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, queueScheduler, } from 'rxjs';
import { observeOn, scan, withLatestFrom } from 'rxjs/operators';
import { ActionsSubject, INIT } from './actions_subject';
import { ReducerObservable } from './reducer_manager';
import { ScannedActionsSubject } from './scanned_actions_subject';
import { INITIAL_STATE } from './tokens';
var StateObservable = /** @class */ (function (_super) {
    __extends(StateObservable, _super);
    function StateObservable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return StateObservable;
}(Observable));
export { StateObservable };
var State = /** @class */ (function (_super) {
    __extends(State, _super);
    function State(actions$, reducer$, scannedActions, initialState) {
        var _this = _super.call(this, initialState) || this;
        var actionsOnQueue$ = actions$.pipe(observeOn(queueScheduler));
        var withLatestReducer$ = actionsOnQueue$.pipe(withLatestFrom(reducer$));
        var seed = { state: initialState };
        var stateAndAction$ = withLatestReducer$.pipe(scan(reduceState, seed));
        _this.stateSubscription = stateAndAction$.subscribe(function (_a) {
            var state = _a.state, action = _a.action;
            _this.next(state);
            scannedActions.next(action);
        });
        return _this;
    }
    State.prototype.ngOnDestroy = function () {
        this.stateSubscription.unsubscribe();
        this.complete();
    };
    State.INIT = INIT;
    State.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    State.ctorParameters = function () { return [
        { type: ActionsSubject, },
        { type: ReducerObservable, },
        { type: ScannedActionsSubject, },
        { type: undefined, decorators: [{ type: Inject, args: [INITIAL_STATE,] },] },
    ]; };
    return State;
}(BehaviorSubject));
export { State };
export function reduceState(stateActionPair, _a) {
    if (stateActionPair === void 0) { stateActionPair = { state: undefined }; }
    var _b = __read(_a, 2), action = _b[0], reducer = _b[1];
    var state = stateActionPair.state;
    return { state: reducer(state, action), action: action };
}
export var STATE_PROVIDERS = [
    State,
    { provide: StateObservable, useExisting: State },
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3N0b3JlL3NyYy9zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUF1QixNQUFNLGVBQWUsQ0FBQztBQUN4RSxPQUFPLEVBQ0wsZUFBZSxFQUNmLFVBQVUsRUFDVixjQUFjLEdBRWYsTUFBTSxNQUFNLENBQUM7QUFDZCxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRSxPQUFPLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXpELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFekMsSUFBQTtJQUE4QyxtQ0FBZTs7OzswQkFmN0Q7RUFlOEMsVUFBVSxFQUFRLENBQUE7QUFBaEUsMkJBQWdFOztJQUdsQyx5QkFBb0I7SUFLaEQsZUFDRSxRQUF3QixFQUN4QixRQUEyQixFQUMzQixjQUFxQyxFQUNkO1FBSnpCLFlBTUUsa0JBQU0sWUFBWSxDQUFDLFNBd0JwQjtRQXRCQyxJQUFNLGVBQWUsR0FBdUIsUUFBUSxDQUFDLElBQUksQ0FDdkQsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUMxQixDQUFDO1FBQ0YsSUFBTSxrQkFBa0IsR0FFcEIsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVuRCxJQUFNLElBQUksR0FBdUIsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLENBQUM7UUFDekQsSUFBTSxlQUFlLEdBR2hCLGtCQUFrQixDQUFDLElBQUksQ0FDMUIsSUFBSSxDQUNGLFdBQVcsRUFDWCxJQUFJLENBQ0wsQ0FDRixDQUFDO1FBRUYsS0FBSSxDQUFDLGlCQUFpQixHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsVUFBQyxFQUFpQjtnQkFBZixnQkFBSyxFQUFFLGtCQUFNO1lBQ2pFLEtBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakIsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM3QixDQUFDLENBQUM7O0tBQ0o7SUFFRCwyQkFBVyxHQUFYO1FBQ0UsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNqQjtpQkF2Q3NCLElBQUk7O2dCQUY1QixVQUFVOzs7O2dCQVJGLGNBQWM7Z0JBRWQsaUJBQWlCO2dCQUNqQixxQkFBcUI7Z0RBZXpCLE1BQU0sU0FBQyxhQUFhOztnQkEzQnpCO0VBa0I4QixlQUFlO1NBQWhDLEtBQUs7QUErQ2xCLE1BQU0sc0JBQ0osZUFBNkQsRUFDN0QsRUFBMkM7SUFEM0MsZ0NBQUEsRUFBQSxvQkFBMkMsS0FBSyxFQUFFLFNBQVMsRUFBRTtRQUM3RCxrQkFBMkMsRUFBMUMsY0FBTSxFQUFFLGVBQU87SUFFUixJQUFBLDZCQUFLLENBQXFCO0lBQ2xDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLE1BQU0sUUFBQSxFQUFFLENBQUM7Q0FDbEQ7QUFFRCxNQUFNLENBQUMsSUFBTSxlQUFlLEdBQWU7SUFDekMsS0FBSztJQUNMLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO0NBQ2pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUsIE9uRGVzdHJveSwgUHJvdmlkZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEJlaGF2aW9yU3ViamVjdCxcbiAgT2JzZXJ2YWJsZSxcbiAgcXVldWVTY2hlZHVsZXIsXG4gIFN1YnNjcmlwdGlvbixcbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBvYnNlcnZlT24sIHNjYW4sIHdpdGhMYXRlc3RGcm9tIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBBY3Rpb25zU3ViamVjdCwgSU5JVCB9IGZyb20gJy4vYWN0aW9uc19zdWJqZWN0JztcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uUmVkdWNlciB9IGZyb20gJy4vbW9kZWxzJztcbmltcG9ydCB7IFJlZHVjZXJPYnNlcnZhYmxlIH0gZnJvbSAnLi9yZWR1Y2VyX21hbmFnZXInO1xuaW1wb3J0IHsgU2Nhbm5lZEFjdGlvbnNTdWJqZWN0IH0gZnJvbSAnLi9zY2FubmVkX2FjdGlvbnNfc3ViamVjdCc7XG5pbXBvcnQgeyBJTklUSUFMX1NUQVRFIH0gZnJvbSAnLi90b2tlbnMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhdGVPYnNlcnZhYmxlIGV4dGVuZHMgT2JzZXJ2YWJsZTxhbnk+IHt9XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTdGF0ZTxUPiBleHRlbmRzIEJlaGF2aW9yU3ViamVjdDxhbnk+IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgc3RhdGljIHJlYWRvbmx5IElOSVQgPSBJTklUO1xuXG4gIHByaXZhdGUgc3RhdGVTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBhY3Rpb25zJDogQWN0aW9uc1N1YmplY3QsXG4gICAgcmVkdWNlciQ6IFJlZHVjZXJPYnNlcnZhYmxlLFxuICAgIHNjYW5uZWRBY3Rpb25zOiBTY2FubmVkQWN0aW9uc1N1YmplY3QsXG4gICAgQEluamVjdChJTklUSUFMX1NUQVRFKSBpbml0aWFsU3RhdGU6IGFueVxuICApIHtcbiAgICBzdXBlcihpbml0aWFsU3RhdGUpO1xuXG4gICAgY29uc3QgYWN0aW9uc09uUXVldWUkOiBPYnNlcnZhYmxlPEFjdGlvbj4gPSBhY3Rpb25zJC5waXBlKFxuICAgICAgb2JzZXJ2ZU9uKHF1ZXVlU2NoZWR1bGVyKVxuICAgICk7XG4gICAgY29uc3Qgd2l0aExhdGVzdFJlZHVjZXIkOiBPYnNlcnZhYmxlPFxuICAgICAgW0FjdGlvbiwgQWN0aW9uUmVkdWNlcjxhbnksIEFjdGlvbj5dXG4gICAgPiA9IGFjdGlvbnNPblF1ZXVlJC5waXBlKHdpdGhMYXRlc3RGcm9tKHJlZHVjZXIkKSk7XG5cbiAgICBjb25zdCBzZWVkOiBTdGF0ZUFjdGlvblBhaXI8VD4gPSB7IHN0YXRlOiBpbml0aWFsU3RhdGUgfTtcbiAgICBjb25zdCBzdGF0ZUFuZEFjdGlvbiQ6IE9ic2VydmFibGU8e1xuICAgICAgc3RhdGU6IGFueTtcbiAgICAgIGFjdGlvbj86IEFjdGlvbjtcbiAgICB9PiA9IHdpdGhMYXRlc3RSZWR1Y2VyJC5waXBlKFxuICAgICAgc2NhbjxbQWN0aW9uLCBBY3Rpb25SZWR1Y2VyPFQsIEFjdGlvbj5dLCBTdGF0ZUFjdGlvblBhaXI8VD4+KFxuICAgICAgICByZWR1Y2VTdGF0ZSxcbiAgICAgICAgc2VlZFxuICAgICAgKVxuICAgICk7XG5cbiAgICB0aGlzLnN0YXRlU3Vic2NyaXB0aW9uID0gc3RhdGVBbmRBY3Rpb24kLnN1YnNjcmliZSgoeyBzdGF0ZSwgYWN0aW9uIH0pID0+IHtcbiAgICAgIHRoaXMubmV4dChzdGF0ZSk7XG4gICAgICBzY2FubmVkQWN0aW9ucy5uZXh0KGFjdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnN0YXRlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFN0YXRlQWN0aW9uUGFpcjxULCBWIGV4dGVuZHMgQWN0aW9uID0gQWN0aW9uPiA9IHtcbiAgc3RhdGU6IFQgfCB1bmRlZmluZWQ7XG4gIGFjdGlvbj86IFY7XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZVN0YXRlPFQsIFYgZXh0ZW5kcyBBY3Rpb24gPSBBY3Rpb24+KFxuICBzdGF0ZUFjdGlvblBhaXI6IFN0YXRlQWN0aW9uUGFpcjxULCBWPiA9IHsgc3RhdGU6IHVuZGVmaW5lZCB9LFxuICBbYWN0aW9uLCByZWR1Y2VyXTogW1YsIEFjdGlvblJlZHVjZXI8VCwgVj5dXG4pOiBTdGF0ZUFjdGlvblBhaXI8VCwgVj4ge1xuICBjb25zdCB7IHN0YXRlIH0gPSBzdGF0ZUFjdGlvblBhaXI7XG4gIHJldHVybiB7IHN0YXRlOiByZWR1Y2VyKHN0YXRlLCBhY3Rpb24pLCBhY3Rpb24gfTtcbn1cblxuZXhwb3J0IGNvbnN0IFNUQVRFX1BST1ZJREVSUzogUHJvdmlkZXJbXSA9IFtcbiAgU3RhdGUsXG4gIHsgcHJvdmlkZTogU3RhdGVPYnNlcnZhYmxlLCB1c2VFeGlzdGluZzogU3RhdGUgfSxcbl07XG4iXX0=