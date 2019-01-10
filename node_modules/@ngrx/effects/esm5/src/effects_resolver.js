var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { merge } from 'rxjs';
import { ignoreElements, map, materialize } from 'rxjs/operators';
import { getSourceForInstance, getSourceMetadata } from './effects_metadata';
import { isOnRunEffects } from './on_run_effects';
export function mergeEffects(sourceInstance) {
    var sourceName = getSourceForInstance(sourceInstance).constructor.name;
    var observables = getSourceMetadata(sourceInstance).map(function (_a) {
        var propertyName = _a.propertyName, dispatch = _a.dispatch;
        var observable = typeof sourceInstance[propertyName] === 'function'
            ? sourceInstance[propertyName]()
            : sourceInstance[propertyName];
        if (dispatch === false) {
            return observable.pipe(ignoreElements());
        }
        var materialized$ = observable.pipe(materialize());
        return materialized$.pipe(map(function (notification) {
            return ({
                effect: sourceInstance[propertyName],
                notification: notification,
                propertyName: propertyName,
                sourceName: sourceName,
                sourceInstance: sourceInstance,
            });
        }));
    });
    return merge.apply(void 0, __spread(observables));
}
export function resolveEffectSource(sourceInstance) {
    var mergedEffects$ = mergeEffects(sourceInstance);
    if (isOnRunEffects(sourceInstance)) {
        return sourceInstance.ngrxOnRunEffects(mergedEffects$);
    }
    return mergedEffects$;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE9BQU8sRUFBRSxLQUFLLEVBQTRCLE1BQU0sTUFBTSxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxjQUFjLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR2xFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzdFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUVsRCxNQUFNLHVCQUNKLGNBQW1CO0lBRW5CLElBQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7SUFFekUsSUFBTSxXQUFXLEdBQXNCLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FDMUUsVUFBQyxFQUEwQjtZQUF4Qiw4QkFBWSxFQUFFLHNCQUFRO1FBQ3ZCLElBQU0sVUFBVSxHQUNkLE9BQU8sY0FBYyxDQUFDLFlBQVksQ0FBQyxLQUFLLFVBQVU7WUFDaEQsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNoQyxDQUFDLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRW5DLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7U0FDMUM7UUFFRCxJQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFckQsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQ3ZCLEdBQUcsQ0FBQyxVQUFDLFlBQWtDO1lBQXlCLE9BQUEsQ0FBQztnQkFDL0QsTUFBTSxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUM7Z0JBQ3BDLFlBQVksY0FBQTtnQkFDWixZQUFZLGNBQUE7Z0JBQ1osVUFBVSxZQUFBO2dCQUNWLGNBQWMsZ0JBQUE7YUFDZixDQUFDO1FBTjhELENBTTlELENBQUMsQ0FDSixDQUFDO0tBQ0gsQ0FDRixDQUFDO0lBRUYsTUFBTSxDQUFDLEtBQUssd0JBQUksV0FBVyxHQUFFO0NBQzlCO0FBRUQsTUFBTSw4QkFBOEIsY0FBbUI7SUFDckQsSUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRXBELEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN4RDtJQUVELE1BQU0sQ0FBQyxjQUFjLENBQUM7Q0FDdkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBY3Rpb24gfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBtZXJnZSwgTm90aWZpY2F0aW9uLCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBpZ25vcmVFbGVtZW50cywgbWFwLCBtYXRlcmlhbGl6ZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgRWZmZWN0Tm90aWZpY2F0aW9uIH0gZnJvbSAnLi9lZmZlY3Rfbm90aWZpY2F0aW9uJztcbmltcG9ydCB7IGdldFNvdXJjZUZvckluc3RhbmNlLCBnZXRTb3VyY2VNZXRhZGF0YSB9IGZyb20gJy4vZWZmZWN0c19tZXRhZGF0YSc7XG5pbXBvcnQgeyBpc09uUnVuRWZmZWN0cyB9IGZyb20gJy4vb25fcnVuX2VmZmVjdHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VFZmZlY3RzKFxuICBzb3VyY2VJbnN0YW5jZTogYW55XG4pOiBPYnNlcnZhYmxlPEVmZmVjdE5vdGlmaWNhdGlvbj4ge1xuICBjb25zdCBzb3VyY2VOYW1lID0gZ2V0U291cmNlRm9ySW5zdGFuY2Uoc291cmNlSW5zdGFuY2UpLmNvbnN0cnVjdG9yLm5hbWU7XG5cbiAgY29uc3Qgb2JzZXJ2YWJsZXM6IE9ic2VydmFibGU8YW55PltdID0gZ2V0U291cmNlTWV0YWRhdGEoc291cmNlSW5zdGFuY2UpLm1hcChcbiAgICAoeyBwcm9wZXJ0eU5hbWUsIGRpc3BhdGNoIH0pOiBPYnNlcnZhYmxlPEVmZmVjdE5vdGlmaWNhdGlvbj4gPT4ge1xuICAgICAgY29uc3Qgb2JzZXJ2YWJsZTogT2JzZXJ2YWJsZTxhbnk+ID1cbiAgICAgICAgdHlwZW9mIHNvdXJjZUluc3RhbmNlW3Byb3BlcnR5TmFtZV0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICA/IHNvdXJjZUluc3RhbmNlW3Byb3BlcnR5TmFtZV0oKVxuICAgICAgICAgIDogc291cmNlSW5zdGFuY2VbcHJvcGVydHlOYW1lXTtcblxuICAgICAgaWYgKGRpc3BhdGNoID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZS5waXBlKGlnbm9yZUVsZW1lbnRzKCkpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtYXRlcmlhbGl6ZWQkID0gb2JzZXJ2YWJsZS5waXBlKG1hdGVyaWFsaXplKCkpO1xuXG4gICAgICByZXR1cm4gbWF0ZXJpYWxpemVkJC5waXBlKFxuICAgICAgICBtYXAoKG5vdGlmaWNhdGlvbjogTm90aWZpY2F0aW9uPEFjdGlvbj4pOiBFZmZlY3ROb3RpZmljYXRpb24gPT4gKHtcbiAgICAgICAgICBlZmZlY3Q6IHNvdXJjZUluc3RhbmNlW3Byb3BlcnR5TmFtZV0sXG4gICAgICAgICAgbm90aWZpY2F0aW9uLFxuICAgICAgICAgIHByb3BlcnR5TmFtZSxcbiAgICAgICAgICBzb3VyY2VOYW1lLFxuICAgICAgICAgIHNvdXJjZUluc3RhbmNlLFxuICAgICAgICB9KSlcbiAgICAgICk7XG4gICAgfVxuICApO1xuXG4gIHJldHVybiBtZXJnZSguLi5vYnNlcnZhYmxlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRWZmZWN0U291cmNlKHNvdXJjZUluc3RhbmNlOiBhbnkpIHtcbiAgY29uc3QgbWVyZ2VkRWZmZWN0cyQgPSBtZXJnZUVmZmVjdHMoc291cmNlSW5zdGFuY2UpO1xuXG4gIGlmIChpc09uUnVuRWZmZWN0cyhzb3VyY2VJbnN0YW5jZSkpIHtcbiAgICByZXR1cm4gc291cmNlSW5zdGFuY2UubmdyeE9uUnVuRWZmZWN0cyhtZXJnZWRFZmZlY3RzJCk7XG4gIH1cblxuICByZXR1cm4gbWVyZ2VkRWZmZWN0cyQ7XG59XG4iXX0=