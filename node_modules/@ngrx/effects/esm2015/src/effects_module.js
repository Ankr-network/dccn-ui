/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { NgModule } from '@angular/core';
import { EffectSources } from './effect_sources';
import { Actions } from './actions';
import { ROOT_EFFECTS, FEATURE_EFFECTS } from './tokens';
import { EffectsFeatureModule } from './effects_feature_module';
import { EffectsRootModule } from './effects_root_module';
import { EffectsRunner } from './effects_runner';
export class EffectsModule {
    /**
     * @param {?} featureEffects
     * @return {?}
     */
    static forFeature(featureEffects) {
        return {
            ngModule: EffectsFeatureModule,
            providers: [
                featureEffects,
                {
                    provide: FEATURE_EFFECTS,
                    multi: true,
                    deps: featureEffects,
                    useFactory: createSourceInstances,
                },
            ],
        };
    }
    /**
     * @param {?} rootEffects
     * @return {?}
     */
    static forRoot(rootEffects) {
        return {
            ngModule: EffectsRootModule,
            providers: [
                EffectsRunner,
                EffectSources,
                Actions,
                rootEffects,
                {
                    provide: ROOT_EFFECTS,
                    deps: rootEffects,
                    useFactory: createSourceInstances,
                },
            ],
        };
    }
}
EffectsModule.decorators = [
    { type: NgModule, args: [{},] }
];
function EffectsModule_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    EffectsModule.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    EffectsModule.ctorParameters;
}
/**
 * @param {...?} instances
 * @return {?}
 */
export function createSourceInstances(...instances) {
    return instances;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc3JjL2VmZmVjdHNfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUE2QixNQUFNLGVBQWUsQ0FBQztBQUNwRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNwQyxPQUFPLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUN6RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFHakQsTUFBTTs7Ozs7SUFDSixNQUFNLENBQUMsVUFBVSxDQUFDLGNBQTJCO1FBQzNDLE1BQU0sQ0FBQztZQUNMLFFBQVEsRUFBRSxvQkFBb0I7WUFDOUIsU0FBUyxFQUFFO2dCQUNULGNBQWM7Z0JBQ2Q7b0JBQ0UsT0FBTyxFQUFFLGVBQWU7b0JBQ3hCLEtBQUssRUFBRSxJQUFJO29CQUNYLElBQUksRUFBRSxjQUFjO29CQUNwQixVQUFVLEVBQUUscUJBQXFCO2lCQUNsQzthQUNGO1NBQ0YsQ0FBQztLQUNIOzs7OztJQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBd0I7UUFDckMsTUFBTSxDQUFDO1lBQ0wsUUFBUSxFQUFFLGlCQUFpQjtZQUMzQixTQUFTLEVBQUU7Z0JBQ1QsYUFBYTtnQkFDYixhQUFhO2dCQUNiLE9BQU87Z0JBQ1AsV0FBVztnQkFDWDtvQkFDRSxPQUFPLEVBQUUsWUFBWTtvQkFDckIsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLFVBQVUsRUFBRSxxQkFBcUI7aUJBQ2xDO2FBQ0Y7U0FDRixDQUFDO0tBQ0g7OztZQWhDRixRQUFRLFNBQUMsRUFBRTs7Ozs7Ozs7Ozs7Ozs7O0FBbUNaLE1BQU0sZ0NBQWdDLEdBQUcsU0FBZ0I7SUFDdkQsTUFBTSxDQUFDLFNBQVMsQ0FBQztDQUNsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBUeXBlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBFZmZlY3RTb3VyY2VzIH0gZnJvbSAnLi9lZmZlY3Rfc291cmNlcyc7XG5pbXBvcnQgeyBBY3Rpb25zIH0gZnJvbSAnLi9hY3Rpb25zJztcbmltcG9ydCB7IFJPT1RfRUZGRUNUUywgRkVBVFVSRV9FRkZFQ1RTIH0gZnJvbSAnLi90b2tlbnMnO1xuaW1wb3J0IHsgRWZmZWN0c0ZlYXR1cmVNb2R1bGUgfSBmcm9tICcuL2VmZmVjdHNfZmVhdHVyZV9tb2R1bGUnO1xuaW1wb3J0IHsgRWZmZWN0c1Jvb3RNb2R1bGUgfSBmcm9tICcuL2VmZmVjdHNfcm9vdF9tb2R1bGUnO1xuaW1wb3J0IHsgRWZmZWN0c1J1bm5lciB9IGZyb20gJy4vZWZmZWN0c19ydW5uZXInO1xuXG5ATmdNb2R1bGUoe30pXG5leHBvcnQgY2xhc3MgRWZmZWN0c01vZHVsZSB7XG4gIHN0YXRpYyBmb3JGZWF0dXJlKGZlYXR1cmVFZmZlY3RzOiBUeXBlPGFueT5bXSk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogRWZmZWN0c0ZlYXR1cmVNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgZmVhdHVyZUVmZmVjdHMsXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBGRUFUVVJFX0VGRkVDVFMsXG4gICAgICAgICAgbXVsdGk6IHRydWUsXG4gICAgICAgICAgZGVwczogZmVhdHVyZUVmZmVjdHMsXG4gICAgICAgICAgdXNlRmFjdG9yeTogY3JlYXRlU291cmNlSW5zdGFuY2VzLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGZvclJvb3Qocm9vdEVmZmVjdHM6IFR5cGU8YW55PltdKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBFZmZlY3RzUm9vdE1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICBFZmZlY3RzUnVubmVyLFxuICAgICAgICBFZmZlY3RTb3VyY2VzLFxuICAgICAgICBBY3Rpb25zLFxuICAgICAgICByb290RWZmZWN0cyxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IFJPT1RfRUZGRUNUUyxcbiAgICAgICAgICBkZXBzOiByb290RWZmZWN0cyxcbiAgICAgICAgICB1c2VGYWN0b3J5OiBjcmVhdGVTb3VyY2VJbnN0YW5jZXMsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNvdXJjZUluc3RhbmNlcyguLi5pbnN0YW5jZXM6IGFueVtdKSB7XG4gIHJldHVybiBpbnN0YW5jZXM7XG59XG4iXX0=