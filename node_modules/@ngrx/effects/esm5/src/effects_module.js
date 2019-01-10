import { NgModule } from '@angular/core';
import { EffectSources } from './effect_sources';
import { Actions } from './actions';
import { ROOT_EFFECTS, FEATURE_EFFECTS } from './tokens';
import { EffectsFeatureModule } from './effects_feature_module';
import { EffectsRootModule } from './effects_root_module';
import { EffectsRunner } from './effects_runner';
var EffectsModule = /** @class */ (function () {
    function EffectsModule() {
    }
    EffectsModule.forFeature = function (featureEffects) {
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
    };
    EffectsModule.forRoot = function (rootEffects) {
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
    };
    EffectsModule.decorators = [
        { type: NgModule, args: [{},] }
    ];
    return EffectsModule;
}());
export { EffectsModule };
export function createSourceInstances() {
    var instances = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        instances[_i] = arguments[_i];
    }
    return instances;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc3JjL2VmZmVjdHNfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQTZCLE1BQU0sZUFBZSxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQzs7OztJQUl4Qyx3QkFBVSxHQUFqQixVQUFrQixjQUEyQjtRQUMzQyxNQUFNLENBQUM7WUFDTCxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFNBQVMsRUFBRTtnQkFDVCxjQUFjO2dCQUNkO29CQUNFLE9BQU8sRUFBRSxlQUFlO29CQUN4QixLQUFLLEVBQUUsSUFBSTtvQkFDWCxJQUFJLEVBQUUsY0FBYztvQkFDcEIsVUFBVSxFQUFFLHFCQUFxQjtpQkFDbEM7YUFDRjtTQUNGLENBQUM7S0FDSDtJQUVNLHFCQUFPLEdBQWQsVUFBZSxXQUF3QjtRQUNyQyxNQUFNLENBQUM7WUFDTCxRQUFRLEVBQUUsaUJBQWlCO1lBQzNCLFNBQVMsRUFBRTtnQkFDVCxhQUFhO2dCQUNiLGFBQWE7Z0JBQ2IsT0FBTztnQkFDUCxXQUFXO2dCQUNYO29CQUNFLE9BQU8sRUFBRSxZQUFZO29CQUNyQixJQUFJLEVBQUUsV0FBVztvQkFDakIsVUFBVSxFQUFFLHFCQUFxQjtpQkFDbEM7YUFDRjtTQUNGLENBQUM7S0FDSDs7Z0JBaENGLFFBQVEsU0FBQyxFQUFFOzt3QkFSWjs7U0FTYSxhQUFhO0FBa0MxQixNQUFNO0lBQWdDLG1CQUFtQjtTQUFuQixVQUFtQixFQUFuQixxQkFBbUIsRUFBbkIsSUFBbUI7UUFBbkIsOEJBQW1COztJQUN2RCxNQUFNLENBQUMsU0FBUyxDQUFDO0NBQ2xCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUsIE1vZHVsZVdpdGhQcm92aWRlcnMsIFR5cGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEVmZmVjdFNvdXJjZXMgfSBmcm9tICcuL2VmZmVjdF9zb3VyY2VzJztcbmltcG9ydCB7IEFjdGlvbnMgfSBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHsgUk9PVF9FRkZFQ1RTLCBGRUFUVVJFX0VGRkVDVFMgfSBmcm9tICcuL3Rva2Vucyc7XG5pbXBvcnQgeyBFZmZlY3RzRmVhdHVyZU1vZHVsZSB9IGZyb20gJy4vZWZmZWN0c19mZWF0dXJlX21vZHVsZSc7XG5pbXBvcnQgeyBFZmZlY3RzUm9vdE1vZHVsZSB9IGZyb20gJy4vZWZmZWN0c19yb290X21vZHVsZSc7XG5pbXBvcnQgeyBFZmZlY3RzUnVubmVyIH0gZnJvbSAnLi9lZmZlY3RzX3J1bm5lcic7XG5cbkBOZ01vZHVsZSh7fSlcbmV4cG9ydCBjbGFzcyBFZmZlY3RzTW9kdWxlIHtcbiAgc3RhdGljIGZvckZlYXR1cmUoZmVhdHVyZUVmZmVjdHM6IFR5cGU8YW55PltdKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBFZmZlY3RzRmVhdHVyZU1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICBmZWF0dXJlRWZmZWN0cyxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEZFQVRVUkVfRUZGRUNUUyxcbiAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgICBkZXBzOiBmZWF0dXJlRWZmZWN0cyxcbiAgICAgICAgICB1c2VGYWN0b3J5OiBjcmVhdGVTb3VyY2VJbnN0YW5jZXMsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZm9yUm9vdChyb290RWZmZWN0czogVHlwZTxhbnk+W10pOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEVmZmVjdHNSb290TW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEVmZmVjdHNSdW5uZXIsXG4gICAgICAgIEVmZmVjdFNvdXJjZXMsXG4gICAgICAgIEFjdGlvbnMsXG4gICAgICAgIHJvb3RFZmZlY3RzLFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogUk9PVF9FRkZFQ1RTLFxuICAgICAgICAgIGRlcHM6IHJvb3RFZmZlY3RzLFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IGNyZWF0ZVNvdXJjZUluc3RhbmNlcyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU291cmNlSW5zdGFuY2VzKC4uLmluc3RhbmNlczogYW55W10pIHtcbiAgcmV0dXJuIGluc3RhbmNlcztcbn1cbiJdfQ==