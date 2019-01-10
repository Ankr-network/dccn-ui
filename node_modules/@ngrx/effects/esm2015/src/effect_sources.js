/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { ErrorHandler, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { dematerialize, exhaustMap, filter, groupBy, map, mergeMap, } from 'rxjs/operators';
import { verifyOutput } from './effect_notification';
import { getSourceForInstance } from './effects_metadata';
import { resolveEffectSource } from './effects_resolver';
export class EffectSources extends Subject {
    /**
     * @param {?} errorHandler
     */
    constructor(errorHandler) {
        super();
        this.errorHandler = errorHandler;
    }
    /**
     * @param {?} effectSourceInstance
     * @return {?}
     */
    addEffects(effectSourceInstance) {
        this.next(effectSourceInstance);
    }
    /**
     * \@internal
     * @return {?}
     */
    toActions() {
        return this.pipe(groupBy(getSourceForInstance), mergeMap(source$ => source$.pipe(exhaustMap(resolveEffectSource), map(output => {
            verifyOutput(output, this.errorHandler);
            return output.notification;
        }), filter((notification) => notification.kind === 'N'), dematerialize())));
    }
}
EffectSources.decorators = [
    { type: Injectable }
];
/** @nocollapse */
EffectSources.ctorParameters = () => [
    { type: ErrorHandler, },
];
function EffectSources_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    EffectSources.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    EffectSources.ctorParameters;
    /** @type {?} */
    EffectSources.prototype.errorHandler;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0X3NvdXJjZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc3JjL2VmZmVjdF9zb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV6RCxPQUFPLEVBQTRCLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN6RCxPQUFPLEVBQ0wsYUFBYSxFQUNiLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLEdBQUcsRUFDSCxRQUFRLEdBQ1QsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDMUQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHekQsTUFBTSxvQkFBcUIsU0FBUSxPQUFZOzs7O0lBQzdDLFlBQW9CLFlBQTBCO1FBQzVDLEtBQUssRUFBRSxDQUFDO1FBRFUsaUJBQVksR0FBWixZQUFZLENBQWM7S0FFN0M7Ozs7O0lBRUQsVUFBVSxDQUFDLG9CQUF5QjtRQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDakM7Ozs7O0lBS0QsU0FBUztRQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUNkLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxFQUM3QixRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FDakIsT0FBTyxDQUFDLElBQUksQ0FDVixVQUFVLENBQUMsbUJBQW1CLENBQUMsRUFDL0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ1gsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7U0FDNUIsQ0FBQyxFQUNGLE1BQU0sQ0FDSixDQUFDLFlBQVksRUFBd0MsRUFBRSxDQUNyRCxZQUFZLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FDNUIsRUFDRCxhQUFhLEVBQUUsQ0FDaEIsQ0FDRixDQUNGLENBQUM7S0FDSDs7O1lBaENGLFVBQVU7Ozs7WUFoQkYsWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVycm9ySGFuZGxlciwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnQG5ncngvc3RvcmUnO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9uLCBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBkZW1hdGVyaWFsaXplLFxuICBleGhhdXN0TWFwLFxuICBmaWx0ZXIsXG4gIGdyb3VwQnksXG4gIG1hcCxcbiAgbWVyZ2VNYXAsXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgdmVyaWZ5T3V0cHV0IH0gZnJvbSAnLi9lZmZlY3Rfbm90aWZpY2F0aW9uJztcbmltcG9ydCB7IGdldFNvdXJjZUZvckluc3RhbmNlIH0gZnJvbSAnLi9lZmZlY3RzX21ldGFkYXRhJztcbmltcG9ydCB7IHJlc29sdmVFZmZlY3RTb3VyY2UgfSBmcm9tICcuL2VmZmVjdHNfcmVzb2x2ZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRWZmZWN0U291cmNlcyBleHRlbmRzIFN1YmplY3Q8YW55PiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXIpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgYWRkRWZmZWN0cyhlZmZlY3RTb3VyY2VJbnN0YW5jZTogYW55KSB7XG4gICAgdGhpcy5uZXh0KGVmZmVjdFNvdXJjZUluc3RhbmNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHRvQWN0aW9ucygpOiBPYnNlcnZhYmxlPEFjdGlvbj4ge1xuICAgIHJldHVybiB0aGlzLnBpcGUoXG4gICAgICBncm91cEJ5KGdldFNvdXJjZUZvckluc3RhbmNlKSxcbiAgICAgIG1lcmdlTWFwKHNvdXJjZSQgPT5cbiAgICAgICAgc291cmNlJC5waXBlKFxuICAgICAgICAgIGV4aGF1c3RNYXAocmVzb2x2ZUVmZmVjdFNvdXJjZSksXG4gICAgICAgICAgbWFwKG91dHB1dCA9PiB7XG4gICAgICAgICAgICB2ZXJpZnlPdXRwdXQob3V0cHV0LCB0aGlzLmVycm9ySGFuZGxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQubm90aWZpY2F0aW9uO1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIGZpbHRlcihcbiAgICAgICAgICAgIChub3RpZmljYXRpb24pOiBub3RpZmljYXRpb24gaXMgTm90aWZpY2F0aW9uPEFjdGlvbj4gPT5cbiAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLmtpbmQgPT09ICdOJ1xuICAgICAgICAgICksXG4gICAgICAgICAgZGVtYXRlcmlhbGl6ZSgpXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59XG4iXX0=