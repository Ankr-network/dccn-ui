/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export const /** @type {?} */ INIT = /** @type {?} */ ('@ngrx/store/init');
export class ActionsSubject extends BehaviorSubject {
    constructor() {
        super({ type: INIT });
    }
    /**
     * @param {?} action
     * @return {?}
     */
    next(action) {
        if (typeof action === 'undefined') {
            throw new TypeError(`Actions must be objects`);
        }
        else if (typeof action.type === 'undefined') {
            throw new TypeError(`Actions must have a type property`);
        }
        super.next(action);
    }
    /**
     * @return {?}
     */
    complete() {
        /* noop */
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        super.complete();
    }
}
ActionsSubject.decorators = [
    { type: Injectable }
];
/** @nocollapse */
ActionsSubject.ctorParameters = () => [];
function ActionsSubject_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    ActionsSubject.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    ActionsSubject.ctorParameters;
}
export const /** @type {?} */ ACTIONS_SUBJECT_PROVIDERS = [ActionsSubject];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uc19zdWJqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbW9kdWxlcy9zdG9yZS9zcmMvYWN0aW9uc19zdWJqZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUF1QixNQUFNLGVBQWUsQ0FBQztBQUNoRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBSXZDLE1BQU0sQ0FBQyx1QkFBTSxJQUFJLHFCQUFHLGtCQUF3QyxDQUFBLENBQUM7QUFHN0QsTUFBTSxxQkFBc0IsU0FBUSxlQUF1QjtJQUV6RDtRQUNFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZCOzs7OztJQUVELElBQUksQ0FBQyxNQUFjO1FBQ2pCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbEMsTUFBTSxJQUFJLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1NBQ2hEO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sSUFBSSxTQUFTLENBQUMsbUNBQW1DLENBQUMsQ0FBQztTQUMxRDtRQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDcEI7Ozs7SUFFRCxRQUFROztLQUVQOzs7O0lBRUQsV0FBVztRQUNULEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNsQjs7O1lBdkJGLFVBQVU7Ozs7Ozs7Ozs7Ozs7QUEwQlgsTUFBTSxDQUFDLHVCQUFNLHlCQUF5QixHQUFlLENBQUMsY0FBYyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBPbkRlc3Ryb3ksIFByb3ZpZGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnLi9tb2RlbHMnO1xuXG5leHBvcnQgY29uc3QgSU5JVCA9ICdAbmdyeC9zdG9yZS9pbml0JyBhcyAnQG5ncngvc3RvcmUvaW5pdCc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBY3Rpb25zU3ViamVjdCBleHRlbmRzIEJlaGF2aW9yU3ViamVjdDxBY3Rpb24+XG4gIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoeyB0eXBlOiBJTklUIH0pO1xuICB9XG5cbiAgbmV4dChhY3Rpb246IEFjdGlvbik6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQWN0aW9ucyBtdXN0IGJlIG9iamVjdHNgKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhY3Rpb24udHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEFjdGlvbnMgbXVzdCBoYXZlIGEgdHlwZSBwcm9wZXJ0eWApO1xuICAgIH1cblxuICAgIHN1cGVyLm5leHQoYWN0aW9uKTtcbiAgfVxuXG4gIGNvbXBsZXRlKCkge1xuICAgIC8qIG5vb3AgKi9cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHN1cGVyLmNvbXBsZXRlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEFDVElPTlNfU1VCSkVDVF9QUk9WSURFUlM6IFByb3ZpZGVyW10gPSBbQWN0aW9uc1N1YmplY3RdO1xuIl19