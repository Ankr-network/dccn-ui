import { Injectable } from '@angular/core';
import { BehaviorSubject, from, timer } from 'rxjs';
import { flatMap, map, sample, switchMap, shareReplay } from 'rxjs/operators';
import { MapsAPILoader } from './maps-api-loader/maps-api-loader';
/**
 * Class to implement when you what to be able to make it work with the auto fit bounds feature
 * of AGM.
 */
var /**
 * Class to implement when you what to be able to make it work with the auto fit bounds feature
 * of AGM.
 */
FitBoundsAccessor = /** @class */ (function () {
    function FitBoundsAccessor() {
    }
    return FitBoundsAccessor;
}());
/**
 * Class to implement when you what to be able to make it work with the auto fit bounds feature
 * of AGM.
 */
export { FitBoundsAccessor };
/**
 * The FitBoundsService is responsible for computing the bounds of the a single map.
 */
var FitBoundsService = /** @class */ (function () {
    function FitBoundsService(loader) {
        var _this = this;
        this._boundsChangeSampleTime$ = new BehaviorSubject(200);
        this._includeInBounds$ = new BehaviorSubject(new Map());
        this.bounds$ = from(loader.load()).pipe(flatMap(function () { return _this._includeInBounds$; }), sample(this._boundsChangeSampleTime$.pipe(switchMap(function (time) { return timer(0, time); }))), map(function (includeInBounds) { return _this._generateBounds(includeInBounds); }), shareReplay(1));
    }
    FitBoundsService.prototype._generateBounds = function (includeInBounds) {
        var bounds = new google.maps.LatLngBounds();
        includeInBounds.forEach(function (b) { return bounds.extend(b); });
        return bounds;
    };
    FitBoundsService.prototype.addToBounds = function (latLng) {
        var id = this._createIdentifier(latLng);
        if (this._includeInBounds$.value.has(id)) {
            return;
        }
        var map = this._includeInBounds$.value;
        map.set(id, latLng);
        this._includeInBounds$.next(map);
    };
    FitBoundsService.prototype.removeFromBounds = function (latLng) {
        var map = this._includeInBounds$.value;
        map.delete(this._createIdentifier(latLng));
        this._includeInBounds$.next(map);
    };
    FitBoundsService.prototype.changeFitBoundsChangeSampleTime = function (timeMs) {
        this._boundsChangeSampleTime$.next(timeMs);
    };
    FitBoundsService.prototype.getBounds$ = function () {
        return this.bounds$;
    };
    FitBoundsService.prototype._createIdentifier = function (latLng) {
        return latLng.lat + "+" + latLng.lng;
    };
    FitBoundsService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    FitBoundsService.ctorParameters = function () { return [
        { type: MapsAPILoader, },
    ]; };
    return FitBoundsService;
}());
export { FitBoundsService };
//# sourceMappingURL=fit-bounds.js.map