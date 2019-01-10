/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { InjectionToken, NgModule } from '@angular/core';
import { ReducerManagerDispatcher, StateObservable } from '@ngrx/store';
import { INITIAL_OPTIONS, STORE_DEVTOOLS_CONFIG, } from './config';
import { DevtoolsDispatcher, StoreDevtools } from './devtools';
import { DevtoolsExtension, REDUX_DEVTOOLS_EXTENSION, } from './extension';
export const /** @type {?} */ IS_EXTENSION_OR_MONITOR_PRESENT = new InjectionToken('Is Devtools Extension or Monitor Present');
/**
 * @param {?} extension
 * @param {?} config
 * @return {?}
 */
export function createIsExtensionOrMonitorPresent(extension, config) {
    return Boolean(extension) || config.monitor !== noMonitor;
}
/**
 * @return {?}
 */
export function createReduxDevtoolsExtension() {
    const /** @type {?} */ extensionKey = '__REDUX_DEVTOOLS_EXTENSION__';
    if (typeof window === 'object' &&
        typeof (/** @type {?} */ (window))[extensionKey] !== 'undefined') {
        return (/** @type {?} */ (window))[extensionKey];
    }
    else {
        return null;
    }
}
/**
 * @param {?} devtools
 * @return {?}
 */
export function createStateObservable(devtools) {
    return devtools.state;
}
/**
 * @return {?}
 */
export function noMonitor() {
    return null;
}
export const /** @type {?} */ DEFAULT_NAME = 'NgRx Store DevTools';
/**
 * @param {?} _options
 * @return {?}
 */
export function createConfig(_options) {
    const /** @type {?} */ DEFAULT_OPTIONS = {
        maxAge: false,
        monitor: noMonitor,
        actionSanitizer: undefined,
        stateSanitizer: undefined,
        name: DEFAULT_NAME,
        serialize: false,
        logOnly: false,
        features: false,
    };
    let /** @type {?} */ options = typeof _options === 'function' ? _options() : _options;
    const /** @type {?} */ logOnly = options.logOnly
        ? { pause: true, export: true, test: true }
        : false;
    const /** @type {?} */ features = options.features || logOnly;
    const /** @type {?} */ config = Object.assign({}, DEFAULT_OPTIONS, { features }, options);
    if (config.maxAge && config.maxAge < 2) {
        throw new Error(`Devtools 'maxAge' cannot be less than 2, got ${config.maxAge}`);
    }
    return config;
}
export class StoreDevtoolsModule {
    /**
     * @param {?=} options
     * @return {?}
     */
    static instrument(options = {}) {
        return {
            ngModule: StoreDevtoolsModule,
            providers: [
                DevtoolsExtension,
                DevtoolsDispatcher,
                StoreDevtools,
                {
                    provide: INITIAL_OPTIONS,
                    useValue: options,
                },
                {
                    provide: IS_EXTENSION_OR_MONITOR_PRESENT,
                    deps: [REDUX_DEVTOOLS_EXTENSION, STORE_DEVTOOLS_CONFIG],
                    useFactory: createIsExtensionOrMonitorPresent,
                },
                {
                    provide: REDUX_DEVTOOLS_EXTENSION,
                    useFactory: createReduxDevtoolsExtension,
                },
                {
                    provide: STORE_DEVTOOLS_CONFIG,
                    deps: [INITIAL_OPTIONS],
                    useFactory: createConfig,
                },
                {
                    provide: StateObservable,
                    deps: [StoreDevtools],
                    useFactory: createStateObservable,
                },
                {
                    provide: ReducerManagerDispatcher,
                    useExisting: DevtoolsDispatcher,
                },
            ],
        };
    }
}
StoreDevtoolsModule.decorators = [
    { type: NgModule, args: [{},] }
];
function StoreDevtoolsModule_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    StoreDevtoolsModule.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    StoreDevtoolsModule.ctorParameters;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1bWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvc3RvcmUtZGV2dG9vbHMvc3JjL2luc3RydW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQXVCLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5RSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsZUFBZSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBR3hFLE9BQU8sRUFDTCxlQUFlLEVBQ2YscUJBQXFCLEdBR3RCLE1BQU0sVUFBVSxDQUFDO0FBQ2xCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDL0QsT0FBTyxFQUNMLGlCQUFpQixFQUNqQix3QkFBd0IsR0FFekIsTUFBTSxhQUFhLENBQUM7QUFFckIsTUFBTSxDQUFDLHVCQUFNLCtCQUErQixHQUFHLElBQUksY0FBYyxDQUMvRCwwQ0FBMEMsQ0FDM0MsQ0FBQzs7Ozs7O0FBRUYsTUFBTSw0Q0FDSixTQUF3QyxFQUN4QyxNQUEyQjtJQUUzQixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDO0NBQzNEOzs7O0FBRUQsTUFBTTtJQUNKLHVCQUFNLFlBQVksR0FBRyw4QkFBOEIsQ0FBQztJQUVwRCxFQUFFLENBQUMsQ0FDRCxPQUFPLE1BQU0sS0FBSyxRQUFRO1FBQzFCLE9BQU8sbUJBQUMsTUFBYSxFQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssV0FDM0MsQ0FBQyxDQUFDLENBQUM7UUFDRCxNQUFNLENBQUMsbUJBQUMsTUFBYSxFQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDdEM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUM7S0FDYjtDQUNGOzs7OztBQUVELE1BQU0sZ0NBQ0osUUFBdUI7SUFFdkIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7Q0FDdkI7Ozs7QUFFRCxNQUFNO0lBQ0osTUFBTSxDQUFDLElBQUksQ0FBQztDQUNiO0FBRUQsTUFBTSxDQUFDLHVCQUFNLFlBQVksR0FBRyxxQkFBcUIsQ0FBQzs7Ozs7QUFFbEQsTUFBTSx1QkFDSixRQUE4QjtJQUU5Qix1QkFBTSxlQUFlLEdBQXdCO1FBQzNDLE1BQU0sRUFBRSxLQUFLO1FBQ2IsT0FBTyxFQUFFLFNBQVM7UUFDbEIsZUFBZSxFQUFFLFNBQVM7UUFDMUIsY0FBYyxFQUFFLFNBQVM7UUFDekIsSUFBSSxFQUFFLFlBQVk7UUFDbEIsU0FBUyxFQUFFLEtBQUs7UUFDaEIsT0FBTyxFQUFFLEtBQUs7UUFDZCxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDO0lBRUYscUJBQUksT0FBTyxHQUFHLE9BQU8sUUFBUSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUNyRSx1QkFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU87UUFDN0IsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7UUFDM0MsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNWLHVCQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQztJQUM3Qyx1QkFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFekUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FDYixnREFBZ0QsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUNoRSxDQUFDO0tBQ0g7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDO0NBQ2Y7QUFHRCxNQUFNOzs7OztJQUNKLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBZ0MsRUFBRTtRQUNsRCxNQUFNLENBQUM7WUFDTCxRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLFNBQVMsRUFBRTtnQkFDVCxpQkFBaUI7Z0JBQ2pCLGtCQUFrQjtnQkFDbEIsYUFBYTtnQkFDYjtvQkFDRSxPQUFPLEVBQUUsZUFBZTtvQkFDeEIsUUFBUSxFQUFFLE9BQU87aUJBQ2xCO2dCQUNEO29CQUNFLE9BQU8sRUFBRSwrQkFBK0I7b0JBQ3hDLElBQUksRUFBRSxDQUFDLHdCQUF3QixFQUFFLHFCQUFxQixDQUFDO29CQUN2RCxVQUFVLEVBQUUsaUNBQWlDO2lCQUM5QztnQkFDRDtvQkFDRSxPQUFPLEVBQUUsd0JBQXdCO29CQUNqQyxVQUFVLEVBQUUsNEJBQTRCO2lCQUN6QztnQkFDRDtvQkFDRSxPQUFPLEVBQUUscUJBQXFCO29CQUM5QixJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUM7b0JBQ3ZCLFVBQVUsRUFBRSxZQUFZO2lCQUN6QjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsZUFBZTtvQkFDeEIsSUFBSSxFQUFFLENBQUMsYUFBYSxDQUFDO29CQUNyQixVQUFVLEVBQUUscUJBQXFCO2lCQUNsQztnQkFDRDtvQkFDRSxPQUFPLEVBQUUsd0JBQXdCO29CQUNqQyxXQUFXLEVBQUUsa0JBQWtCO2lCQUNoQzthQUNGO1NBQ0YsQ0FBQztLQUNIOzs7WUF0Q0YsUUFBUSxTQUFDLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3Rpb25Ub2tlbiwgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJlZHVjZXJNYW5hZ2VyRGlzcGF0Y2hlciwgU3RhdGVPYnNlcnZhYmxlIH0gZnJvbSAnQG5ncngvc3RvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge1xuICBJTklUSUFMX09QVElPTlMsXG4gIFNUT1JFX0RFVlRPT0xTX0NPTkZJRyxcbiAgU3RvcmVEZXZ0b29sc0NvbmZpZyxcbiAgU3RvcmVEZXZ0b29sc09wdGlvbnMsXG59IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERldnRvb2xzRGlzcGF0Y2hlciwgU3RvcmVEZXZ0b29scyB9IGZyb20gJy4vZGV2dG9vbHMnO1xuaW1wb3J0IHtcbiAgRGV2dG9vbHNFeHRlbnNpb24sXG4gIFJFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTixcbiAgUmVkdXhEZXZ0b29sc0V4dGVuc2lvbixcbn0gZnJvbSAnLi9leHRlbnNpb24nO1xuXG5leHBvcnQgY29uc3QgSVNfRVhURU5TSU9OX09SX01PTklUT1JfUFJFU0VOVCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxib29sZWFuPihcbiAgJ0lzIERldnRvb2xzIEV4dGVuc2lvbiBvciBNb25pdG9yIFByZXNlbnQnXG4pO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSXNFeHRlbnNpb25Pck1vbml0b3JQcmVzZW50KFxuICBleHRlbnNpb246IFJlZHV4RGV2dG9vbHNFeHRlbnNpb24gfCBudWxsLFxuICBjb25maWc6IFN0b3JlRGV2dG9vbHNDb25maWdcbikge1xuICByZXR1cm4gQm9vbGVhbihleHRlbnNpb24pIHx8IGNvbmZpZy5tb25pdG9yICE9PSBub01vbml0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZWR1eERldnRvb2xzRXh0ZW5zaW9uKCkge1xuICBjb25zdCBleHRlbnNpb25LZXkgPSAnX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXyc7XG5cbiAgaWYgKFxuICAgIHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mICh3aW5kb3cgYXMgYW55KVtleHRlbnNpb25LZXldICE9PSAndW5kZWZpbmVkJ1xuICApIHtcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpW2V4dGVuc2lvbktleV07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0YXRlT2JzZXJ2YWJsZShcbiAgZGV2dG9vbHM6IFN0b3JlRGV2dG9vbHNcbik6IE9ic2VydmFibGU8YW55PiB7XG4gIHJldHVybiBkZXZ0b29scy5zdGF0ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vTW9uaXRvcigpOiBudWxsIHtcbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX05BTUUgPSAnTmdSeCBTdG9yZSBEZXZUb29scyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb25maWcoXG4gIF9vcHRpb25zOiBTdG9yZURldnRvb2xzT3B0aW9uc1xuKTogU3RvcmVEZXZ0b29sc0NvbmZpZyB7XG4gIGNvbnN0IERFRkFVTFRfT1BUSU9OUzogU3RvcmVEZXZ0b29sc0NvbmZpZyA9IHtcbiAgICBtYXhBZ2U6IGZhbHNlLFxuICAgIG1vbml0b3I6IG5vTW9uaXRvcixcbiAgICBhY3Rpb25TYW5pdGl6ZXI6IHVuZGVmaW5lZCxcbiAgICBzdGF0ZVNhbml0aXplcjogdW5kZWZpbmVkLFxuICAgIG5hbWU6IERFRkFVTFRfTkFNRSxcbiAgICBzZXJpYWxpemU6IGZhbHNlLFxuICAgIGxvZ09ubHk6IGZhbHNlLFxuICAgIGZlYXR1cmVzOiBmYWxzZSxcbiAgfTtcblxuICBsZXQgb3B0aW9ucyA9IHR5cGVvZiBfb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJyA/IF9vcHRpb25zKCkgOiBfb3B0aW9ucztcbiAgY29uc3QgbG9nT25seSA9IG9wdGlvbnMubG9nT25seVxuICAgID8geyBwYXVzZTogdHJ1ZSwgZXhwb3J0OiB0cnVlLCB0ZXN0OiB0cnVlIH1cbiAgICA6IGZhbHNlO1xuICBjb25zdCBmZWF0dXJlcyA9IG9wdGlvbnMuZmVhdHVyZXMgfHwgbG9nT25seTtcbiAgY29uc3QgY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9PUFRJT05TLCB7IGZlYXR1cmVzIH0sIG9wdGlvbnMpO1xuXG4gIGlmIChjb25maWcubWF4QWdlICYmIGNvbmZpZy5tYXhBZ2UgPCAyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYERldnRvb2xzICdtYXhBZ2UnIGNhbm5vdCBiZSBsZXNzIHRoYW4gMiwgZ290ICR7Y29uZmlnLm1heEFnZX1gXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBjb25maWc7XG59XG5cbkBOZ01vZHVsZSh7fSlcbmV4cG9ydCBjbGFzcyBTdG9yZURldnRvb2xzTW9kdWxlIHtcbiAgc3RhdGljIGluc3RydW1lbnQob3B0aW9uczogU3RvcmVEZXZ0b29sc09wdGlvbnMgPSB7fSk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogU3RvcmVEZXZ0b29sc01vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICBEZXZ0b29sc0V4dGVuc2lvbixcbiAgICAgICAgRGV2dG9vbHNEaXNwYXRjaGVyLFxuICAgICAgICBTdG9yZURldnRvb2xzLFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogSU5JVElBTF9PUFRJT05TLFxuICAgICAgICAgIHVzZVZhbHVlOiBvcHRpb25zLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogSVNfRVhURU5TSU9OX09SX01PTklUT1JfUFJFU0VOVCxcbiAgICAgICAgICBkZXBzOiBbUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OLCBTVE9SRV9ERVZUT09MU19DT05GSUddLFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IGNyZWF0ZUlzRXh0ZW5zaW9uT3JNb25pdG9yUHJlc2VudCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IFJFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTixcbiAgICAgICAgICB1c2VGYWN0b3J5OiBjcmVhdGVSZWR1eERldnRvb2xzRXh0ZW5zaW9uLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogU1RPUkVfREVWVE9PTFNfQ09ORklHLFxuICAgICAgICAgIGRlcHM6IFtJTklUSUFMX09QVElPTlNdLFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IGNyZWF0ZUNvbmZpZyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IFN0YXRlT2JzZXJ2YWJsZSxcbiAgICAgICAgICBkZXBzOiBbU3RvcmVEZXZ0b29sc10sXG4gICAgICAgICAgdXNlRmFjdG9yeTogY3JlYXRlU3RhdGVPYnNlcnZhYmxlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogUmVkdWNlck1hbmFnZXJEaXNwYXRjaGVyLFxuICAgICAgICAgIHVzZUV4aXN0aW5nOiBEZXZ0b29sc0Rpc3BhdGNoZXIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cbn1cbiJdfQ==