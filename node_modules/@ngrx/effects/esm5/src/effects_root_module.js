import { NgModule, Inject, Optional } from '@angular/core';
import { Store, StoreRootModule, StoreFeatureModule, } from '@ngrx/store';
import { EffectsRunner } from './effects_runner';
import { EffectSources } from './effect_sources';
import { ROOT_EFFECTS } from './tokens';
export var ROOT_EFFECTS_INIT = '@ngrx/effects/init';
var EffectsRootModule = /** @class */ (function () {
    function EffectsRootModule(sources, runner, store, rootEffects, storeRootModule, storeFeatureModule) {
        this.sources = sources;
        runner.start();
        rootEffects.forEach(function (effectSourceInstance) {
            return sources.addEffects(effectSourceInstance);
        });
        store.dispatch({ type: ROOT_EFFECTS_INIT });
    }
    EffectsRootModule.prototype.addEffects = function (effectSourceInstance) {
        this.sources.addEffects(effectSourceInstance);
    };
    EffectsRootModule.decorators = [
        { type: NgModule, args: [{},] }
    ];
    /** @nocollapse */
    EffectsRootModule.ctorParameters = function () { return [
        { type: EffectSources, },
        { type: EffectsRunner, },
        { type: Store, },
        { type: Array, decorators: [{ type: Inject, args: [ROOT_EFFECTS,] },] },
        { type: StoreRootModule, decorators: [{ type: Optional },] },
        { type: StoreFeatureModule, decorators: [{ type: Optional },] },
    ]; };
    return EffectsRootModule;
}());
export { EffectsRootModule };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19yb290X21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19yb290X21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0QsT0FBTyxFQUVMLEtBQUssRUFDTCxlQUFlLEVBQ2Ysa0JBQWtCLEdBQ25CLE1BQU0sYUFBYSxDQUFDO0FBQ3JCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV4QyxNQUFNLENBQUMsSUFBTSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQzs7SUFJcEQsMkJBQ1UsT0FBc0IsRUFDOUIsTUFBcUIsRUFDckIsS0FBaUIsRUFDSyxhQUNWLGlCQUNBO1FBTEosWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQU85QixNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFZixXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUEsb0JBQW9CO1lBQ3RDLE9BQUEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQztRQUF4QyxDQUF3QyxDQUN6QyxDQUFDO1FBRUYsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7S0FDN0M7SUFFRCxzQ0FBVSxHQUFWLFVBQVcsb0JBQXlCO1FBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDL0M7O2dCQXJCRixRQUFRLFNBQUMsRUFBRTs7OztnQkFMSCxhQUFhO2dCQURiLGFBQWE7Z0JBSnBCLEtBQUs7NENBZ0JGLE1BQU0sU0FBQyxZQUFZO2dCQWZ0QixlQUFlLHVCQWdCWixRQUFRO2dCQWZYLGtCQUFrQix1QkFnQmYsUUFBUTs7NEJBckJiOztTQWNhLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBJbmplY3QsIE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBTdG9yZU1vZHVsZSxcbiAgU3RvcmUsXG4gIFN0b3JlUm9vdE1vZHVsZSxcbiAgU3RvcmVGZWF0dXJlTW9kdWxlLFxufSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBFZmZlY3RzUnVubmVyIH0gZnJvbSAnLi9lZmZlY3RzX3J1bm5lcic7XG5pbXBvcnQgeyBFZmZlY3RTb3VyY2VzIH0gZnJvbSAnLi9lZmZlY3Rfc291cmNlcyc7XG5pbXBvcnQgeyBST09UX0VGRkVDVFMgfSBmcm9tICcuL3Rva2Vucyc7XG5cbmV4cG9ydCBjb25zdCBST09UX0VGRkVDVFNfSU5JVCA9ICdAbmdyeC9lZmZlY3RzL2luaXQnO1xuXG5ATmdNb2R1bGUoe30pXG5leHBvcnQgY2xhc3MgRWZmZWN0c1Jvb3RNb2R1bGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHNvdXJjZXM6IEVmZmVjdFNvdXJjZXMsXG4gICAgcnVubmVyOiBFZmZlY3RzUnVubmVyLFxuICAgIHN0b3JlOiBTdG9yZTxhbnk+LFxuICAgIEBJbmplY3QoUk9PVF9FRkZFQ1RTKSByb290RWZmZWN0czogYW55W10sXG4gICAgQE9wdGlvbmFsKCkgc3RvcmVSb290TW9kdWxlOiBTdG9yZVJvb3RNb2R1bGUsXG4gICAgQE9wdGlvbmFsKCkgc3RvcmVGZWF0dXJlTW9kdWxlOiBTdG9yZUZlYXR1cmVNb2R1bGVcbiAgKSB7XG4gICAgcnVubmVyLnN0YXJ0KCk7XG5cbiAgICByb290RWZmZWN0cy5mb3JFYWNoKGVmZmVjdFNvdXJjZUluc3RhbmNlID0+XG4gICAgICBzb3VyY2VzLmFkZEVmZmVjdHMoZWZmZWN0U291cmNlSW5zdGFuY2UpXG4gICAgKTtcblxuICAgIHN0b3JlLmRpc3BhdGNoKHsgdHlwZTogUk9PVF9FRkZFQ1RTX0lOSVQgfSk7XG4gIH1cblxuICBhZGRFZmZlY3RzKGVmZmVjdFNvdXJjZUluc3RhbmNlOiBhbnkpIHtcbiAgICB0aGlzLnNvdXJjZXMuYWRkRWZmZWN0cyhlZmZlY3RTb3VyY2VJbnN0YW5jZSk7XG4gIH1cbn1cbiJdfQ==