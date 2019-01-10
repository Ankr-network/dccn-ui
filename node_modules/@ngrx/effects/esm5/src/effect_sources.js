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
import { ErrorHandler, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { dematerialize, exhaustMap, filter, groupBy, map, mergeMap, } from 'rxjs/operators';
import { verifyOutput } from './effect_notification';
import { getSourceForInstance } from './effects_metadata';
import { resolveEffectSource } from './effects_resolver';
var EffectSources = /** @class */ (function (_super) {
    __extends(EffectSources, _super);
    function EffectSources(errorHandler) {
        var _this = _super.call(this) || this;
        _this.errorHandler = errorHandler;
        return _this;
    }
    EffectSources.prototype.addEffects = function (effectSourceInstance) {
        this.next(effectSourceInstance);
    };
    /**
     * @internal
     */
    /**
       * @internal
       */
    EffectSources.prototype.toActions = /**
       * @internal
       */
    function () {
        var _this = this;
        return this.pipe(groupBy(getSourceForInstance), mergeMap(function (source$) {
            return source$.pipe(exhaustMap(resolveEffectSource), map(function (output) {
                verifyOutput(output, _this.errorHandler);
                return output.notification;
            }), filter(function (notification) {
                return notification.kind === 'N';
            }), dematerialize());
        }));
    };
    EffectSources.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    EffectSources.ctorParameters = function () { return [
        { type: ErrorHandler, },
    ]; };
    return EffectSources;
}(Subject));
export { EffectSources };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0X3NvdXJjZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc3JjL2VmZmVjdF9zb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV6RCxPQUFPLEVBQTRCLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN6RCxPQUFPLEVBQ0wsYUFBYSxFQUNiLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLEdBQUcsRUFDSCxRQUFRLEdBQ1QsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDMUQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7O0lBR3RCLGlDQUFZO0lBQzdDLHVCQUFvQixZQUEwQjtRQUE5QyxZQUNFLGlCQUFPLFNBQ1I7UUFGbUIsa0JBQVksR0FBWixZQUFZLENBQWM7O0tBRTdDO0lBRUQsa0NBQVUsR0FBVixVQUFXLG9CQUF5QjtRQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDakM7SUFFRDs7T0FFRzs7OztJQUNILGlDQUFTOzs7SUFBVDtRQUFBLGlCQW1CQztRQWxCQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDZCxPQUFPLENBQUMsb0JBQW9CLENBQUMsRUFDN0IsUUFBUSxDQUFDLFVBQUEsT0FBTztZQUNkLE9BQUEsT0FBTyxDQUFDLElBQUksQ0FDVixVQUFVLENBQUMsbUJBQW1CLENBQUMsRUFDL0IsR0FBRyxDQUFDLFVBQUEsTUFBTTtnQkFDUixZQUFZLENBQUMsTUFBTSxFQUFFLEtBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7YUFDNUIsQ0FBQyxFQUNGLE1BQU0sQ0FDSixVQUFDLFlBQVk7Z0JBQ1gsT0FBQSxZQUFZLENBQUMsSUFBSSxLQUFLLEdBQUc7WUFBekIsQ0FBeUIsQ0FDNUIsRUFDRCxhQUFhLEVBQUUsQ0FDaEI7UUFaRCxDQVlDLENBQ0YsQ0FDRixDQUFDO0tBQ0g7O2dCQWhDRixVQUFVOzs7O2dCQWhCRixZQUFZOzt3QkFBckI7RUFpQm1DLE9BQU87U0FBN0IsYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVycm9ySGFuZGxlciwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnQG5ncngvc3RvcmUnO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9uLCBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBkZW1hdGVyaWFsaXplLFxuICBleGhhdXN0TWFwLFxuICBmaWx0ZXIsXG4gIGdyb3VwQnksXG4gIG1hcCxcbiAgbWVyZ2VNYXAsXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgdmVyaWZ5T3V0cHV0IH0gZnJvbSAnLi9lZmZlY3Rfbm90aWZpY2F0aW9uJztcbmltcG9ydCB7IGdldFNvdXJjZUZvckluc3RhbmNlIH0gZnJvbSAnLi9lZmZlY3RzX21ldGFkYXRhJztcbmltcG9ydCB7IHJlc29sdmVFZmZlY3RTb3VyY2UgfSBmcm9tICcuL2VmZmVjdHNfcmVzb2x2ZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRWZmZWN0U291cmNlcyBleHRlbmRzIFN1YmplY3Q8YW55PiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXIpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgYWRkRWZmZWN0cyhlZmZlY3RTb3VyY2VJbnN0YW5jZTogYW55KSB7XG4gICAgdGhpcy5uZXh0KGVmZmVjdFNvdXJjZUluc3RhbmNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHRvQWN0aW9ucygpOiBPYnNlcnZhYmxlPEFjdGlvbj4ge1xuICAgIHJldHVybiB0aGlzLnBpcGUoXG4gICAgICBncm91cEJ5KGdldFNvdXJjZUZvckluc3RhbmNlKSxcbiAgICAgIG1lcmdlTWFwKHNvdXJjZSQgPT5cbiAgICAgICAgc291cmNlJC5waXBlKFxuICAgICAgICAgIGV4aGF1c3RNYXAocmVzb2x2ZUVmZmVjdFNvdXJjZSksXG4gICAgICAgICAgbWFwKG91dHB1dCA9PiB7XG4gICAgICAgICAgICB2ZXJpZnlPdXRwdXQob3V0cHV0LCB0aGlzLmVycm9ySGFuZGxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQubm90aWZpY2F0aW9uO1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIGZpbHRlcihcbiAgICAgICAgICAgIChub3RpZmljYXRpb24pOiBub3RpZmljYXRpb24gaXMgTm90aWZpY2F0aW9uPEFjdGlvbj4gPT5cbiAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLmtpbmQgPT09ICdOJ1xuICAgICAgICAgICksXG4gICAgICAgICAgZGVtYXRlcmlhbGl6ZSgpXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59XG4iXX0=