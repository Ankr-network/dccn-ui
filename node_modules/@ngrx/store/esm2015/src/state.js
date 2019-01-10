/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, queueScheduler, } from 'rxjs';
import { observeOn, scan, withLatestFrom } from 'rxjs/operators';
import { ActionsSubject, INIT } from './actions_subject';
import { ReducerObservable } from './reducer_manager';
import { ScannedActionsSubject } from './scanned_actions_subject';
import { INITIAL_STATE } from './tokens';
/**
 * @abstract
 */
export class StateObservable extends Observable {
}
/**
 * @template T
 */
export class State extends BehaviorSubject {
    /**
     * @param {?} actions$
     * @param {?} reducer$
     * @param {?} scannedActions
     * @param {?} initialState
     */
    constructor(actions$, reducer$, scannedActions, initialState) {
        super(initialState);
        const /** @type {?} */ actionsOnQueue$ = actions$.pipe(observeOn(queueScheduler));
        const /** @type {?} */ withLatestReducer$ = actionsOnQueue$.pipe(withLatestFrom(reducer$));
        const /** @type {?} */ seed = { state: initialState };
        const /** @type {?} */ stateAndAction$ = withLatestReducer$.pipe(scan(reduceState, seed));
        this.stateSubscription = stateAndAction$.subscribe(({ state, action }) => {
            this.next(state);
            scannedActions.next(action);
        });
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.stateSubscription.unsubscribe();
        this.complete();
    }
}
State.INIT = INIT;
State.decorators = [
    { type: Injectable }
];
/** @nocollapse */
State.ctorParameters = () => [
    { type: ActionsSubject, },
    { type: ReducerObservable, },
    { type: ScannedActionsSubject, },
    { type: undefined, decorators: [{ type: Inject, args: [INITIAL_STATE,] },] },
];
function State_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    State.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    State.ctorParameters;
    /** @type {?} */
    State.INIT;
    /** @type {?} */
    State.prototype.stateSubscription;
}
/**
 * @template T, V
 * @param {?=} stateActionPair
 * @param {?=} __1
 * @return {?}
 */
export function reduceState(stateActionPair = { state: undefined }, [action, reducer]) {
    const { state } = stateActionPair;
    return { state: reducer(state, action), action };
}
export const /** @type {?} */ STATE_PROVIDERS = [
    State,
    { provide: StateObservable, useExisting: State },
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3N0b3JlL3NyYy9zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQXVCLE1BQU0sZUFBZSxDQUFDO0FBQ3hFLE9BQU8sRUFDTCxlQUFlLEVBQ2YsVUFBVSxFQUNWLGNBQWMsR0FFZixNQUFNLE1BQU0sQ0FBQztBQUNkLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWpFLE9BQU8sRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFekQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDdEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFVBQVUsQ0FBQzs7OztBQUV6QyxNQUFNLHNCQUFnQyxTQUFRLFVBQWU7Q0FBRzs7OztBQUdoRSxNQUFNLFlBQWdCLFNBQVEsZUFBb0I7Ozs7Ozs7SUFLaEQsWUFDRSxRQUF3QixFQUN4QixRQUEyQixFQUMzQixjQUFxQyxFQUNkO1FBRXZCLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVwQix1QkFBTSxlQUFlLEdBQXVCLFFBQVEsQ0FBQyxJQUFJLENBQ3ZELFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FDMUIsQ0FBQztRQUNGLHVCQUFNLGtCQUFrQixHQUVwQixlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRW5ELHVCQUFNLElBQUksR0FBdUIsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLENBQUM7UUFDekQsdUJBQU0sZUFBZSxHQUdoQixrQkFBa0IsQ0FBQyxJQUFJLENBQzFCLElBQUksQ0FDRixXQUFXLEVBQ1gsSUFBSSxDQUNMLENBQ0YsQ0FBQztRQUVGLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtZQUN2RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pCLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDN0IsQ0FBQyxDQUFDO0tBQ0o7Ozs7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNqQjs7YUF2Q3NCLElBQUk7O1lBRjVCLFVBQVU7Ozs7WUFSRixjQUFjO1lBRWQsaUJBQWlCO1lBQ2pCLHFCQUFxQjs0Q0FlekIsTUFBTSxTQUFDLGFBQWE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNDekIsTUFBTSxzQkFDSixrQkFBeUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQzdELENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBMkI7SUFFM0MsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLGVBQWUsQ0FBQztJQUNsQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQztDQUNsRDtBQUVELE1BQU0sQ0FBQyx1QkFBTSxlQUFlLEdBQWU7SUFDekMsS0FBSztJQUNMLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO0NBQ2pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUsIE9uRGVzdHJveSwgUHJvdmlkZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEJlaGF2aW9yU3ViamVjdCxcbiAgT2JzZXJ2YWJsZSxcbiAgcXVldWVTY2hlZHVsZXIsXG4gIFN1YnNjcmlwdGlvbixcbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBvYnNlcnZlT24sIHNjYW4sIHdpdGhMYXRlc3RGcm9tIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBBY3Rpb25zU3ViamVjdCwgSU5JVCB9IGZyb20gJy4vYWN0aW9uc19zdWJqZWN0JztcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uUmVkdWNlciB9IGZyb20gJy4vbW9kZWxzJztcbmltcG9ydCB7IFJlZHVjZXJPYnNlcnZhYmxlIH0gZnJvbSAnLi9yZWR1Y2VyX21hbmFnZXInO1xuaW1wb3J0IHsgU2Nhbm5lZEFjdGlvbnNTdWJqZWN0IH0gZnJvbSAnLi9zY2FubmVkX2FjdGlvbnNfc3ViamVjdCc7XG5pbXBvcnQgeyBJTklUSUFMX1NUQVRFIH0gZnJvbSAnLi90b2tlbnMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhdGVPYnNlcnZhYmxlIGV4dGVuZHMgT2JzZXJ2YWJsZTxhbnk+IHt9XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTdGF0ZTxUPiBleHRlbmRzIEJlaGF2aW9yU3ViamVjdDxhbnk+IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgc3RhdGljIHJlYWRvbmx5IElOSVQgPSBJTklUO1xuXG4gIHByaXZhdGUgc3RhdGVTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBhY3Rpb25zJDogQWN0aW9uc1N1YmplY3QsXG4gICAgcmVkdWNlciQ6IFJlZHVjZXJPYnNlcnZhYmxlLFxuICAgIHNjYW5uZWRBY3Rpb25zOiBTY2FubmVkQWN0aW9uc1N1YmplY3QsXG4gICAgQEluamVjdChJTklUSUFMX1NUQVRFKSBpbml0aWFsU3RhdGU6IGFueVxuICApIHtcbiAgICBzdXBlcihpbml0aWFsU3RhdGUpO1xuXG4gICAgY29uc3QgYWN0aW9uc09uUXVldWUkOiBPYnNlcnZhYmxlPEFjdGlvbj4gPSBhY3Rpb25zJC5waXBlKFxuICAgICAgb2JzZXJ2ZU9uKHF1ZXVlU2NoZWR1bGVyKVxuICAgICk7XG4gICAgY29uc3Qgd2l0aExhdGVzdFJlZHVjZXIkOiBPYnNlcnZhYmxlPFxuICAgICAgW0FjdGlvbiwgQWN0aW9uUmVkdWNlcjxhbnksIEFjdGlvbj5dXG4gICAgPiA9IGFjdGlvbnNPblF1ZXVlJC5waXBlKHdpdGhMYXRlc3RGcm9tKHJlZHVjZXIkKSk7XG5cbiAgICBjb25zdCBzZWVkOiBTdGF0ZUFjdGlvblBhaXI8VD4gPSB7IHN0YXRlOiBpbml0aWFsU3RhdGUgfTtcbiAgICBjb25zdCBzdGF0ZUFuZEFjdGlvbiQ6IE9ic2VydmFibGU8e1xuICAgICAgc3RhdGU6IGFueTtcbiAgICAgIGFjdGlvbj86IEFjdGlvbjtcbiAgICB9PiA9IHdpdGhMYXRlc3RSZWR1Y2VyJC5waXBlKFxuICAgICAgc2NhbjxbQWN0aW9uLCBBY3Rpb25SZWR1Y2VyPFQsIEFjdGlvbj5dLCBTdGF0ZUFjdGlvblBhaXI8VD4+KFxuICAgICAgICByZWR1Y2VTdGF0ZSxcbiAgICAgICAgc2VlZFxuICAgICAgKVxuICAgICk7XG5cbiAgICB0aGlzLnN0YXRlU3Vic2NyaXB0aW9uID0gc3RhdGVBbmRBY3Rpb24kLnN1YnNjcmliZSgoeyBzdGF0ZSwgYWN0aW9uIH0pID0+IHtcbiAgICAgIHRoaXMubmV4dChzdGF0ZSk7XG4gICAgICBzY2FubmVkQWN0aW9ucy5uZXh0KGFjdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnN0YXRlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFN0YXRlQWN0aW9uUGFpcjxULCBWIGV4dGVuZHMgQWN0aW9uID0gQWN0aW9uPiA9IHtcbiAgc3RhdGU6IFQgfCB1bmRlZmluZWQ7XG4gIGFjdGlvbj86IFY7XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZVN0YXRlPFQsIFYgZXh0ZW5kcyBBY3Rpb24gPSBBY3Rpb24+KFxuICBzdGF0ZUFjdGlvblBhaXI6IFN0YXRlQWN0aW9uUGFpcjxULCBWPiA9IHsgc3RhdGU6IHVuZGVmaW5lZCB9LFxuICBbYWN0aW9uLCByZWR1Y2VyXTogW1YsIEFjdGlvblJlZHVjZXI8VCwgVj5dXG4pOiBTdGF0ZUFjdGlvblBhaXI8VCwgVj4ge1xuICBjb25zdCB7IHN0YXRlIH0gPSBzdGF0ZUFjdGlvblBhaXI7XG4gIHJldHVybiB7IHN0YXRlOiByZWR1Y2VyKHN0YXRlLCBhY3Rpb24pLCBhY3Rpb24gfTtcbn1cblxuZXhwb3J0IGNvbnN0IFNUQVRFX1BST1ZJREVSUzogUHJvdmlkZXJbXSA9IFtcbiAgU3RhdGUsXG4gIHsgcHJvdmlkZTogU3RhdGVPYnNlcnZhYmxlLCB1c2VFeGlzdGluZzogU3RhdGUgfSxcbl07XG4iXX0=