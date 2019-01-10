/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Actions } from '@ngrx/effects';
import { defer } from 'rxjs';
/**
 * @param {?} factoryOrSource
 * @return {?}
 */
export function provideMockActions(factoryOrSource) {
    return {
        provide: Actions,
        useFactory: () => {
            if (typeof factoryOrSource === 'function') {
                return new Actions(defer(factoryOrSource));
            }
            return new Actions(factoryOrSource);
        },
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy90ZXN0aW5nL3NyYy90ZXN0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxLQUFLLEVBQWMsTUFBTSxNQUFNLENBQUM7Ozs7O0FBSXpDLE1BQU0sNkJBQ0osZUFBMEQ7SUFFMUQsTUFBTSxDQUFDO1FBQ0wsT0FBTyxFQUFFLE9BQU87UUFDaEIsVUFBVSxFQUFFLEdBQW9CLEVBQUU7WUFDaEMsRUFBRSxDQUFDLENBQUMsT0FBTyxlQUFlLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO2FBQzVDO1lBRUQsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ3JDO0tBQ0YsQ0FBQztDQUNIIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvdmlkZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGlvbnMgfSBmcm9tICdAbmdyeC9lZmZlY3RzJztcbmltcG9ydCB7IGRlZmVyLCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlTW9ja0FjdGlvbnMoc291cmNlOiBPYnNlcnZhYmxlPGFueT4pOiBQcm92aWRlcjtcbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlTW9ja0FjdGlvbnMoZmFjdG9yeTogKCkgPT4gT2JzZXJ2YWJsZTxhbnk+KTogUHJvdmlkZXI7XG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZU1vY2tBY3Rpb25zKFxuICBmYWN0b3J5T3JTb3VyY2U6ICgoKSA9PiBPYnNlcnZhYmxlPGFueT4pIHwgT2JzZXJ2YWJsZTxhbnk+XG4pOiBQcm92aWRlciB7XG4gIHJldHVybiB7XG4gICAgcHJvdmlkZTogQWN0aW9ucyxcbiAgICB1c2VGYWN0b3J5OiAoKTogT2JzZXJ2YWJsZTxhbnk+ID0+IHtcbiAgICAgIGlmICh0eXBlb2YgZmFjdG9yeU9yU291cmNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBuZXcgQWN0aW9ucyhkZWZlcihmYWN0b3J5T3JTb3VyY2UpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBBY3Rpb25zKGZhY3RvcnlPclNvdXJjZSk7XG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==