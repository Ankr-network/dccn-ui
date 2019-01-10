import { NgModule, Inject, Optional } from '@angular/core';
import { StoreRootModule, StoreFeatureModule } from '@ngrx/store';
import { EffectsRootModule } from './effects_root_module';
import { FEATURE_EFFECTS } from './tokens';
var EffectsFeatureModule = /** @class */ (function () {
    function EffectsFeatureModule(root, effectSourceGroups, storeRootModule, storeFeatureModule) {
        this.root = root;
        effectSourceGroups.forEach(function (group) {
            return group.forEach(function (effectSourceInstance) {
                return root.addEffects(effectSourceInstance);
            });
        });
    }
    EffectsFeatureModule.decorators = [
        { type: NgModule, args: [{},] }
    ];
    /** @nocollapse */
    EffectsFeatureModule.ctorParameters = function () { return [
        { type: EffectsRootModule, },
        { type: Array, decorators: [{ type: Inject, args: [FEATURE_EFFECTS,] },] },
        { type: StoreRootModule, decorators: [{ type: Optional },] },
        { type: StoreFeatureModule, decorators: [{ type: Optional },] },
    ]; };
    return EffectsFeatureModule;
}());
export { EffectsFeatureModule };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19mZWF0dXJlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19mZWF0dXJlX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNsRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sVUFBVSxDQUFDOztJQUl6Qyw4QkFDVSxJQUF1QixFQUNOLG9CQUNiLGlCQUNBO1FBSEosU0FBSSxHQUFKLElBQUksQ0FBbUI7UUFLL0Isa0JBQWtCLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSztZQUM5QixPQUFBLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxvQkFBb0I7Z0JBQ2hDLE9BQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQztZQUFyQyxDQUFxQyxDQUN0QztRQUZELENBRUMsQ0FDRixDQUFDO0tBQ0g7O2dCQWJGLFFBQVEsU0FBQyxFQUFFOzs7O2dCQUhILGlCQUFpQjs0Q0FPckIsTUFBTSxTQUFDLGVBQWU7Z0JBUmxCLGVBQWUsdUJBU25CLFFBQVE7Z0JBVGEsa0JBQWtCLHVCQVV2QyxRQUFROzsrQkFYYjs7U0FNYSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgSW5qZWN0LCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3RvcmVSb290TW9kdWxlLCBTdG9yZUZlYXR1cmVNb2R1bGUgfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBFZmZlY3RzUm9vdE1vZHVsZSB9IGZyb20gJy4vZWZmZWN0c19yb290X21vZHVsZSc7XG5pbXBvcnQgeyBGRUFUVVJFX0VGRkVDVFMgfSBmcm9tICcuL3Rva2Vucyc7XG5cbkBOZ01vZHVsZSh7fSlcbmV4cG9ydCBjbGFzcyBFZmZlY3RzRmVhdHVyZU1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcm9vdDogRWZmZWN0c1Jvb3RNb2R1bGUsXG4gICAgQEluamVjdChGRUFUVVJFX0VGRkVDVFMpIGVmZmVjdFNvdXJjZUdyb3VwczogYW55W11bXSxcbiAgICBAT3B0aW9uYWwoKSBzdG9yZVJvb3RNb2R1bGU6IFN0b3JlUm9vdE1vZHVsZSxcbiAgICBAT3B0aW9uYWwoKSBzdG9yZUZlYXR1cmVNb2R1bGU6IFN0b3JlRmVhdHVyZU1vZHVsZVxuICApIHtcbiAgICBlZmZlY3RTb3VyY2VHcm91cHMuZm9yRWFjaChncm91cCA9PlxuICAgICAgZ3JvdXAuZm9yRWFjaChlZmZlY3RTb3VyY2VJbnN0YW5jZSA9PlxuICAgICAgICByb290LmFkZEVmZmVjdHMoZWZmZWN0U291cmNlSW5zdGFuY2UpXG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuIl19