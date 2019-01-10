/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { merge } from 'rxjs';
import { ignoreElements, map, materialize } from 'rxjs/operators';
import { getSourceForInstance, getSourceMetadata } from './effects_metadata';
import { isOnRunEffects } from './on_run_effects';
/**
 * @param {?} sourceInstance
 * @return {?}
 */
export function mergeEffects(sourceInstance) {
    const /** @type {?} */ sourceName = getSourceForInstance(sourceInstance).constructor.name;
    const /** @type {?} */ observables = getSourceMetadata(sourceInstance).map(({ propertyName, dispatch }) => {
        const /** @type {?} */ observable = typeof sourceInstance[propertyName] === 'function'
            ? sourceInstance[propertyName]()
            : sourceInstance[propertyName];
        if (dispatch === false) {
            return observable.pipe(ignoreElements());
        }
        const /** @type {?} */ materialized$ = observable.pipe(materialize());
        return materialized$.pipe(map((notification) => ({
            effect: sourceInstance[propertyName],
            notification,
            propertyName,
            sourceName,
            sourceInstance,
        })));
    });
    return merge(...observables);
}
/**
 * @param {?} sourceInstance
 * @return {?}
 */
export function resolveEffectSource(sourceInstance) {
    const /** @type {?} */ mergedEffects$ = mergeEffects(sourceInstance);
    if (isOnRunEffects(sourceInstance)) {
        return sourceInstance.ngrxOnRunEffects(mergedEffects$);
    }
    return mergedEffects$;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQ0EsT0FBTyxFQUFFLEtBQUssRUFBNEIsTUFBTSxNQUFNLENBQUM7QUFDdkQsT0FBTyxFQUFFLGNBQWMsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHbEUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDOzs7OztBQUVsRCxNQUFNLHVCQUNKLGNBQW1CO0lBRW5CLHVCQUFNLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0lBRXpFLHVCQUFNLFdBQVcsR0FBc0IsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUMxRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxFQUFrQyxFQUFFO1FBQzdELHVCQUFNLFVBQVUsR0FDZCxPQUFPLGNBQWMsQ0FBQyxZQUFZLENBQUMsS0FBSyxVQUFVO1lBQ2hELENBQUMsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDaEMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVuQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1NBQzFDO1FBRUQsdUJBQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUVyRCxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FDdkIsR0FBRyxDQUFDLENBQUMsWUFBa0MsRUFBc0IsRUFBRSxDQUFDLENBQUM7WUFDL0QsTUFBTSxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUM7WUFDcEMsWUFBWTtZQUNaLFlBQVk7WUFDWixVQUFVO1lBQ1YsY0FBYztTQUNmLENBQUMsQ0FBQyxDQUNKLENBQUM7S0FDSCxDQUNGLENBQUM7SUFFRixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUM7Q0FDOUI7Ozs7O0FBRUQsTUFBTSw4QkFBOEIsY0FBbUI7SUFDckQsdUJBQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUVwRCxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDeEQ7SUFFRCxNQUFNLENBQUMsY0FBYyxDQUFDO0NBQ3ZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnQG5ncngvc3RvcmUnO1xuaW1wb3J0IHsgbWVyZ2UsIE5vdGlmaWNhdGlvbiwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgaWdub3JlRWxlbWVudHMsIG1hcCwgbWF0ZXJpYWxpemUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IEVmZmVjdE5vdGlmaWNhdGlvbiB9IGZyb20gJy4vZWZmZWN0X25vdGlmaWNhdGlvbic7XG5pbXBvcnQgeyBnZXRTb3VyY2VGb3JJbnN0YW5jZSwgZ2V0U291cmNlTWV0YWRhdGEgfSBmcm9tICcuL2VmZmVjdHNfbWV0YWRhdGEnO1xuaW1wb3J0IHsgaXNPblJ1bkVmZmVjdHMgfSBmcm9tICcuL29uX3J1bl9lZmZlY3RzJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlRWZmZWN0cyhcbiAgc291cmNlSW5zdGFuY2U6IGFueVxuKTogT2JzZXJ2YWJsZTxFZmZlY3ROb3RpZmljYXRpb24+IHtcbiAgY29uc3Qgc291cmNlTmFtZSA9IGdldFNvdXJjZUZvckluc3RhbmNlKHNvdXJjZUluc3RhbmNlKS5jb25zdHJ1Y3Rvci5uYW1lO1xuXG4gIGNvbnN0IG9ic2VydmFibGVzOiBPYnNlcnZhYmxlPGFueT5bXSA9IGdldFNvdXJjZU1ldGFkYXRhKHNvdXJjZUluc3RhbmNlKS5tYXAoXG4gICAgKHsgcHJvcGVydHlOYW1lLCBkaXNwYXRjaCB9KTogT2JzZXJ2YWJsZTxFZmZlY3ROb3RpZmljYXRpb24+ID0+IHtcbiAgICAgIGNvbnN0IG9ic2VydmFibGU6IE9ic2VydmFibGU8YW55PiA9XG4gICAgICAgIHR5cGVvZiBzb3VyY2VJbnN0YW5jZVtwcm9wZXJ0eU5hbWVdID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgPyBzb3VyY2VJbnN0YW5jZVtwcm9wZXJ0eU5hbWVdKClcbiAgICAgICAgICA6IHNvdXJjZUluc3RhbmNlW3Byb3BlcnR5TmFtZV07XG5cbiAgICAgIGlmIChkaXNwYXRjaCA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGUucGlwZShpZ25vcmVFbGVtZW50cygpKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWF0ZXJpYWxpemVkJCA9IG9ic2VydmFibGUucGlwZShtYXRlcmlhbGl6ZSgpKTtcblxuICAgICAgcmV0dXJuIG1hdGVyaWFsaXplZCQucGlwZShcbiAgICAgICAgbWFwKChub3RpZmljYXRpb246IE5vdGlmaWNhdGlvbjxBY3Rpb24+KTogRWZmZWN0Tm90aWZpY2F0aW9uID0+ICh7XG4gICAgICAgICAgZWZmZWN0OiBzb3VyY2VJbnN0YW5jZVtwcm9wZXJ0eU5hbWVdLFxuICAgICAgICAgIG5vdGlmaWNhdGlvbixcbiAgICAgICAgICBwcm9wZXJ0eU5hbWUsXG4gICAgICAgICAgc291cmNlTmFtZSxcbiAgICAgICAgICBzb3VyY2VJbnN0YW5jZSxcbiAgICAgICAgfSkpXG4gICAgICApO1xuICAgIH1cbiAgKTtcblxuICByZXR1cm4gbWVyZ2UoLi4ub2JzZXJ2YWJsZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUVmZmVjdFNvdXJjZShzb3VyY2VJbnN0YW5jZTogYW55KSB7XG4gIGNvbnN0IG1lcmdlZEVmZmVjdHMkID0gbWVyZ2VFZmZlY3RzKHNvdXJjZUluc3RhbmNlKTtcblxuICBpZiAoaXNPblJ1bkVmZmVjdHMoc291cmNlSW5zdGFuY2UpKSB7XG4gICAgcmV0dXJuIHNvdXJjZUluc3RhbmNlLm5ncnhPblJ1bkVmZmVjdHMobWVyZ2VkRWZmZWN0cyQpO1xuICB9XG5cbiAgcmV0dXJuIG1lcmdlZEVmZmVjdHMkO1xufVxuIl19