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
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
var ScannedActionsSubject = /** @class */ (function (_super) {
    __extends(ScannedActionsSubject, _super);
    function ScannedActionsSubject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScannedActionsSubject.prototype.ngOnDestroy = function () {
        this.complete();
    };
    ScannedActionsSubject.decorators = [
        { type: Injectable }
    ];
    return ScannedActionsSubject;
}(Subject));
export { ScannedActionsSubject };
export var SCANNED_ACTIONS_SUBJECT_PROVIDERS = [
    ScannedActionsSubject,
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nhbm5lZF9hY3Rpb25zX3N1YmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3N0b3JlL3NyYy9zY2FubmVkX2FjdGlvbnNfc3ViamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBdUIsTUFBTSxlQUFlLENBQUM7QUFDaEUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7SUFLWSx5Q0FBZTs7OztJQUV4RCwyQ0FBVyxHQUFYO1FBQ0UsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ2pCOztnQkFMRixVQUFVOztnQ0FMWDtFQU0yQyxPQUFPO1NBQXJDLHFCQUFxQjtBQU9sQyxNQUFNLENBQUMsSUFBTSxpQ0FBaUMsR0FBZTtJQUMzRCxxQkFBcUI7Q0FDdEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIE9uRGVzdHJveSwgUHJvdmlkZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnLi9tb2RlbHMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU2Nhbm5lZEFjdGlvbnNTdWJqZWN0IGV4dGVuZHMgU3ViamVjdDxBY3Rpb24+XG4gIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBTQ0FOTkVEX0FDVElPTlNfU1VCSkVDVF9QUk9WSURFUlM6IFByb3ZpZGVyW10gPSBbXG4gIFNjYW5uZWRBY3Rpb25zU3ViamVjdCxcbl07XG4iXX0=