import { Directive, Self, Input } from '@angular/core';
import { FitBoundsService, FitBoundsAccessor } from '../services/fit-bounds';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
/**
 * Adds the given directive to the auto fit bounds feature when the value is true.
 * To make it work with you custom AGM component, you also have to implement the {@link FitBoundsAccessor} abstract class.
 * @example
 * <agm-marker [agmFitBounds]="true"></agm-marker>
 */
var AgmFitBounds = /** @class */ (function () {
    function AgmFitBounds(_fitBoundsAccessor, _fitBoundsService) {
        this._fitBoundsAccessor = _fitBoundsAccessor;
        this._fitBoundsService = _fitBoundsService;
        /**
           * If the value is true, the element gets added to the bounds of the map.
           * Default: true.
           */
        this.agmFitBounds = true;
        this._destroyed$ = new Subject();
        this._latestFitBoundsDetails = null;
    }
    /**
     * @internal
     */
    /**
       * @internal
       */
    AgmFitBounds.prototype.ngOnChanges = /**
       * @internal
       */
    function (changes) {
        this._updateBounds();
    };
    /**
     * @internal
     */
    /**
       * @internal
       */
    AgmFitBounds.prototype.ngOnInit = /**
       * @internal
       */
    function () {
        var _this = this;
        this._fitBoundsAccessor
            .getFitBoundsDetails$()
            .pipe(distinctUntilChanged(function (x, y) {
            return x.latLng.lat === y.latLng.lng;
        }), takeUntil(this._destroyed$))
            .subscribe(function (details) { return _this._updateBounds(details); });
    };
    AgmFitBounds.prototype._updateBounds = function (newFitBoundsDetails) {
        if (newFitBoundsDetails) {
            this._latestFitBoundsDetails = newFitBoundsDetails;
        }
        if (!this._latestFitBoundsDetails) {
            return;
        }
        if (this.agmFitBounds) {
            this._fitBoundsService.addToBounds(this._latestFitBoundsDetails.latLng);
        }
        else {
            this._fitBoundsService.removeFromBounds(this._latestFitBoundsDetails.latLng);
        }
    };
    /**
     * @internal
     */
    /**
       * @internal
       */
    AgmFitBounds.prototype.ngOnDestroy = /**
       * @internal
       */
    function () {
        this._destroyed$.next();
        this._destroyed$.complete();
        if (this._latestFitBoundsDetails !== null) {
            this._fitBoundsService.removeFromBounds(this._latestFitBoundsDetails.latLng);
        }
    };
    AgmFitBounds.decorators = [
        { type: Directive, args: [{
                    selector: '[agmFitBounds]'
                },] },
    ];
    /** @nocollapse */
    AgmFitBounds.ctorParameters = function () { return [
        { type: FitBoundsAccessor, decorators: [{ type: Self },] },
        { type: FitBoundsService, },
    ]; };
    AgmFitBounds.propDecorators = {
        "agmFitBounds": [{ type: Input },],
    };
    return AgmFitBounds;
}());
export { AgmFitBounds };
//# sourceMappingURL=fit-bounds.js.map