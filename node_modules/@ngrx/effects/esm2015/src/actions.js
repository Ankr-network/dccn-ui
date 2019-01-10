/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Inject, Injectable } from '@angular/core';
import { ScannedActionsSubject } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
/**
 * @template V
 */
export class Actions extends Observable {
    /**
     * @param {?=} source
     */
    constructor(source) {
        super();
        if (source) {
            this.source = source;
        }
    }
    /**
     * @template R
     * @param {?} operator
     * @return {?}
     */
    lift(operator) {
        const /** @type {?} */ observable = new Actions();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }
    /**
     * @template V2
     * @param {...?} allowedTypes
     * @return {?}
     */
    ofType(...allowedTypes) {
        return /** @type {?} */ (ofType(...allowedTypes)(/** @type {?} */ (this)));
    }
}
Actions.decorators = [
    { type: Injectable }
];
/** @nocollapse */
Actions.ctorParameters = () => [
    { type: Observable, decorators: [{ type: Inject, args: [ScannedActionsSubject,] },] },
];
function Actions_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    Actions.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    Actions.ctorParameters;
}
/**
 * @template T
 * @param {...?} allowedTypes
 * @return {?}
 */
export function ofType(...allowedTypes) {
    return filter((action) => allowedTypes.some(type => type === action.type));
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFVLHFCQUFxQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQzVELE9BQU8sRUFBRSxVQUFVLEVBQThCLE1BQU0sTUFBTSxDQUFDO0FBQzlELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7OztBQUd4QyxNQUFNLGNBQTJCLFNBQVEsVUFBYTs7OztJQUNwRCxZQUEyQztRQUN6QyxLQUFLLEVBQUUsQ0FBQztRQUVSLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztTQUN0QjtLQUNGOzs7Ozs7SUFFRCxJQUFJLENBQUksUUFBd0I7UUFDOUIsdUJBQU0sVUFBVSxHQUFHLElBQUksT0FBTyxFQUFLLENBQUM7UUFDcEMsVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDekIsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDL0IsTUFBTSxDQUFDLFVBQVUsQ0FBQztLQUNuQjs7Ozs7O0lBRUQsTUFBTSxDQUFtQixHQUFHLFlBQXNCO1FBQ2hELE1BQU0sbUJBQUMsTUFBTSxDQUFNLEdBQUcsWUFBWSxDQUFDLG1CQUFDLElBQW9CLEVBQWdCLEVBQUM7S0FDMUU7OztZQW5CRixVQUFVOzs7O1lBSEYsVUFBVSx1QkFLSixNQUFNLFNBQUMscUJBQXFCOzs7Ozs7Ozs7Ozs7Ozs7O0FBb0IzQyxNQUFNLGlCQUNKLEdBQUcsWUFBc0I7SUFFekIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQWMsRUFBZSxFQUFFLENBQzVDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxDQUNoRCxDQUFDO0NBQ0giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGlvbiwgU2Nhbm5lZEFjdGlvbnNTdWJqZWN0IH0gZnJvbSAnQG5ncngvc3RvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgT3BlcmF0b3IsIE9wZXJhdG9yRnVuY3Rpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZpbHRlciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFjdGlvbnM8ViA9IEFjdGlvbj4gZXh0ZW5kcyBPYnNlcnZhYmxlPFY+IHtcbiAgY29uc3RydWN0b3IoQEluamVjdChTY2FubmVkQWN0aW9uc1N1YmplY3QpIHNvdXJjZT86IE9ic2VydmFibGU8Vj4pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKHNvdXJjZSkge1xuICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgfVxuICB9XG5cbiAgbGlmdDxSPihvcGVyYXRvcjogT3BlcmF0b3I8ViwgUj4pOiBPYnNlcnZhYmxlPFI+IHtcbiAgICBjb25zdCBvYnNlcnZhYmxlID0gbmV3IEFjdGlvbnM8Uj4oKTtcbiAgICBvYnNlcnZhYmxlLnNvdXJjZSA9IHRoaXM7XG4gICAgb2JzZXJ2YWJsZS5vcGVyYXRvciA9IG9wZXJhdG9yO1xuICAgIHJldHVybiBvYnNlcnZhYmxlO1xuICB9XG5cbiAgb2ZUeXBlPFYyIGV4dGVuZHMgViA9IFY+KC4uLmFsbG93ZWRUeXBlczogc3RyaW5nW10pOiBBY3Rpb25zPFYyPiB7XG4gICAgcmV0dXJuIG9mVHlwZTxhbnk+KC4uLmFsbG93ZWRUeXBlcykodGhpcyBhcyBBY3Rpb25zPGFueT4pIGFzIEFjdGlvbnM8VjI+O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvZlR5cGU8VCBleHRlbmRzIEFjdGlvbj4oXG4gIC4uLmFsbG93ZWRUeXBlczogc3RyaW5nW11cbik6IE9wZXJhdG9yRnVuY3Rpb248QWN0aW9uLCBUPiB7XG4gIHJldHVybiBmaWx0ZXIoKGFjdGlvbjogQWN0aW9uKTogYWN0aW9uIGlzIFQgPT5cbiAgICBhbGxvd2VkVHlwZXMuc29tZSh0eXBlID0+IHR5cGUgPT09IGFjdGlvbi50eXBlKVxuICApO1xufVxuIl19