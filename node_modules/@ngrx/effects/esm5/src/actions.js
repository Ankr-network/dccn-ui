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
import { Inject, Injectable } from '@angular/core';
import { ScannedActionsSubject } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
var Actions = /** @class */ (function (_super) {
    __extends(Actions, _super);
    function Actions(source) {
        var _this = _super.call(this) || this;
        if (source) {
            _this.source = source;
        }
        return _this;
    }
    Actions.prototype.lift = function (operator) {
        var observable = new Actions();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Actions.prototype.ofType = function () {
        var allowedTypes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            allowedTypes[_i] = arguments[_i];
        }
        return ofType.apply(void 0, __spread(allowedTypes))(this);
    };
    Actions.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    Actions.ctorParameters = function () { return [
        { type: Observable, decorators: [{ type: Inject, args: [ScannedActionsSubject,] },] },
    ]; };
    return Actions;
}(Observable));
export { Actions };
export function ofType() {
    var allowedTypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        allowedTypes[_i] = arguments[_i];
    }
    return filter(function (action) {
        return allowedTypes.some(function (type) { return type === action.type; });
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQVUscUJBQXFCLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDNUQsT0FBTyxFQUFFLFVBQVUsRUFBOEIsTUFBTSxNQUFNLENBQUM7QUFDOUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDOztJQUdDLDJCQUFhO0lBQ3BELGlCQUEyQztRQUEzQyxZQUNFLGlCQUFPLFNBS1I7UUFIQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1gsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDdEI7O0tBQ0Y7SUFFRCxzQkFBSSxHQUFKLFVBQVEsUUFBd0I7UUFDOUIsSUFBTSxVQUFVLEdBQUcsSUFBSSxPQUFPLEVBQUssQ0FBQztRQUNwQyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUN6QixVQUFVLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUMvQixNQUFNLENBQUMsVUFBVSxDQUFDO0tBQ25CO0lBRUQsd0JBQU0sR0FBTjtRQUF5QixzQkFBeUI7YUFBekIsVUFBeUIsRUFBekIscUJBQXlCLEVBQXpCLElBQXlCO1lBQXpCLGlDQUF5Qjs7UUFDaEQsTUFBTSxDQUFDLE1BQU0sd0JBQVMsWUFBWSxHQUFFLElBQW9CLENBQWdCLENBQUM7S0FDMUU7O2dCQW5CRixVQUFVOzs7O2dCQUhGLFVBQVUsdUJBS0osTUFBTSxTQUFDLHFCQUFxQjs7a0JBUDNDO0VBTXlDLFVBQVU7U0FBdEMsT0FBTztBQXFCcEIsTUFBTTtJQUNKLHNCQUF5QjtTQUF6QixVQUF5QixFQUF6QixxQkFBeUIsRUFBekIsSUFBeUI7UUFBekIsaUNBQXlCOztJQUV6QixNQUFNLENBQUMsTUFBTSxDQUFDLFVBQUMsTUFBYztRQUMzQixPQUFBLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksRUFBcEIsQ0FBb0IsQ0FBQztJQUEvQyxDQUErQyxDQUNoRCxDQUFDO0NBQ0giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGlvbiwgU2Nhbm5lZEFjdGlvbnNTdWJqZWN0IH0gZnJvbSAnQG5ncngvc3RvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgT3BlcmF0b3IsIE9wZXJhdG9yRnVuY3Rpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZpbHRlciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFjdGlvbnM8ViA9IEFjdGlvbj4gZXh0ZW5kcyBPYnNlcnZhYmxlPFY+IHtcbiAgY29uc3RydWN0b3IoQEluamVjdChTY2FubmVkQWN0aW9uc1N1YmplY3QpIHNvdXJjZT86IE9ic2VydmFibGU8Vj4pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKHNvdXJjZSkge1xuICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgfVxuICB9XG5cbiAgbGlmdDxSPihvcGVyYXRvcjogT3BlcmF0b3I8ViwgUj4pOiBPYnNlcnZhYmxlPFI+IHtcbiAgICBjb25zdCBvYnNlcnZhYmxlID0gbmV3IEFjdGlvbnM8Uj4oKTtcbiAgICBvYnNlcnZhYmxlLnNvdXJjZSA9IHRoaXM7XG4gICAgb2JzZXJ2YWJsZS5vcGVyYXRvciA9IG9wZXJhdG9yO1xuICAgIHJldHVybiBvYnNlcnZhYmxlO1xuICB9XG5cbiAgb2ZUeXBlPFYyIGV4dGVuZHMgViA9IFY+KC4uLmFsbG93ZWRUeXBlczogc3RyaW5nW10pOiBBY3Rpb25zPFYyPiB7XG4gICAgcmV0dXJuIG9mVHlwZTxhbnk+KC4uLmFsbG93ZWRUeXBlcykodGhpcyBhcyBBY3Rpb25zPGFueT4pIGFzIEFjdGlvbnM8VjI+O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvZlR5cGU8VCBleHRlbmRzIEFjdGlvbj4oXG4gIC4uLmFsbG93ZWRUeXBlczogc3RyaW5nW11cbik6IE9wZXJhdG9yRnVuY3Rpb248QWN0aW9uLCBUPiB7XG4gIHJldHVybiBmaWx0ZXIoKGFjdGlvbjogQWN0aW9uKTogYWN0aW9uIGlzIFQgPT5cbiAgICBhbGxvd2VkVHlwZXMuc29tZSh0eXBlID0+IHR5cGUgPT09IGFjdGlvbi50eXBlKVxuICApO1xufVxuIl19