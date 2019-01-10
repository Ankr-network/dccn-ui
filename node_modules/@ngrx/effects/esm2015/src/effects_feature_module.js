/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { NgModule, Inject, Optional } from '@angular/core';
import { StoreRootModule, StoreFeatureModule } from '@ngrx/store';
import { EffectsRootModule } from './effects_root_module';
import { FEATURE_EFFECTS } from './tokens';
export class EffectsFeatureModule {
    /**
     * @param {?} root
     * @param {?} effectSourceGroups
     * @param {?} storeRootModule
     * @param {?} storeFeatureModule
     */
    constructor(root, effectSourceGroups, storeRootModule, storeFeatureModule) {
        this.root = root;
        effectSourceGroups.forEach(group => group.forEach(effectSourceInstance => root.addEffects(effectSourceInstance)));
    }
}
EffectsFeatureModule.decorators = [
    { type: NgModule, args: [{},] }
];
/** @nocollapse */
EffectsFeatureModule.ctorParameters = () => [
    { type: EffectsRootModule, },
    { type: Array, decorators: [{ type: Inject, args: [FEATURE_EFFECTS,] },] },
    { type: StoreRootModule, decorators: [{ type: Optional },] },
    { type: StoreFeatureModule, decorators: [{ type: Optional },] },
];
function EffectsFeatureModule_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    EffectsFeatureModule.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    EffectsFeatureModule.ctorParameters;
    /** @type {?} */
    EffectsFeatureModule.prototype.root;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19mZWF0dXJlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19mZWF0dXJlX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNELE9BQU8sRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDbEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUczQyxNQUFNOzs7Ozs7O0lBQ0osWUFDVSxNQUNpQixvQkFDYixpQkFDQTtRQUhKLFNBQUksR0FBSixJQUFJO1FBS1osa0JBQWtCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQ2pDLEtBQUssQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQ3RDLENBQ0YsQ0FBQztLQUNIOzs7WUFiRixRQUFRLFNBQUMsRUFBRTs7OztZQUhILGlCQUFpQjt3Q0FPckIsTUFBTSxTQUFDLGVBQWU7WUFSbEIsZUFBZSx1QkFTbkIsUUFBUTtZQVRhLGtCQUFrQix1QkFVdkMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBJbmplY3QsIE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdG9yZVJvb3RNb2R1bGUsIFN0b3JlRmVhdHVyZU1vZHVsZSB9IGZyb20gJ0BuZ3J4L3N0b3JlJztcbmltcG9ydCB7IEVmZmVjdHNSb290TW9kdWxlIH0gZnJvbSAnLi9lZmZlY3RzX3Jvb3RfbW9kdWxlJztcbmltcG9ydCB7IEZFQVRVUkVfRUZGRUNUUyB9IGZyb20gJy4vdG9rZW5zJztcblxuQE5nTW9kdWxlKHt9KVxuZXhwb3J0IGNsYXNzIEVmZmVjdHNGZWF0dXJlTW9kdWxlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByb290OiBFZmZlY3RzUm9vdE1vZHVsZSxcbiAgICBASW5qZWN0KEZFQVRVUkVfRUZGRUNUUykgZWZmZWN0U291cmNlR3JvdXBzOiBhbnlbXVtdLFxuICAgIEBPcHRpb25hbCgpIHN0b3JlUm9vdE1vZHVsZTogU3RvcmVSb290TW9kdWxlLFxuICAgIEBPcHRpb25hbCgpIHN0b3JlRmVhdHVyZU1vZHVsZTogU3RvcmVGZWF0dXJlTW9kdWxlXG4gICkge1xuICAgIGVmZmVjdFNvdXJjZUdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+XG4gICAgICBncm91cC5mb3JFYWNoKGVmZmVjdFNvdXJjZUluc3RhbmNlID0+XG4gICAgICAgIHJvb3QuYWRkRWZmZWN0cyhlZmZlY3RTb3VyY2VJbnN0YW5jZSlcbiAgICAgIClcbiAgICApO1xuICB9XG59XG4iXX0=