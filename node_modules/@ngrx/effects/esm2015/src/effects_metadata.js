/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { compose } from '@ngrx/store';
const /** @type {?} */ METADATA_KEY = '__@ngrx/effects__';
const /** @type {?} */ r = Reflect;
/**
 * @record
 */
export function EffectMetadata() { }
function EffectMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    EffectMetadata.prototype.propertyName;
    /** @type {?} */
    EffectMetadata.prototype.dispatch;
}
/**
 * @param {?} sourceProto
 * @return {?}
 */
function getEffectMetadataEntries(sourceProto) {
    return sourceProto.constructor[METADATA_KEY] || [];
}
/**
 * @param {?} sourceProto
 * @param {?} entries
 * @return {?}
 */
function setEffectMetadataEntries(sourceProto, entries) {
    const /** @type {?} */ constructor = sourceProto.constructor;
    const /** @type {?} */ meta = constructor.hasOwnProperty(METADATA_KEY)
        ? (/** @type {?} */ (constructor))[METADATA_KEY]
        : Object.defineProperty(constructor, METADATA_KEY, { value: [] })[METADATA_KEY];
    Array.prototype.push.apply(meta, entries);
}
/**
 * @param {?=} __0
 * @return {?}
 */
export function Effect({ dispatch } = { dispatch: true }) {
    return /** @type {?} */ (function (target, propertyName) {
        const /** @type {?} */ metadata = { propertyName, dispatch };
        setEffectMetadataEntries(target, [metadata]);
    } /*TODO(#823)*/);
}
/**
 * @param {?} instance
 * @return {?}
 */
export function getSourceForInstance(instance) {
    return Object.getPrototypeOf(instance);
}
export const /** @type {?} */ getSourceMetadata = compose(getEffectMetadataEntries, getSourceForInstance);
/**
 * @template T
 * @param {?} instance
 * @return {?}
 */
export function getEffectsMetadata(instance) {
    const /** @type {?} */ metadata = {};
    getSourceMetadata(instance).forEach(({ propertyName, dispatch }) => {
        (/** @type {?} */ (metadata))[propertyName] = { dispatch };
    });
    return metadata;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUV0Qyx1QkFBTSxZQUFZLEdBQUcsbUJBQW1CLENBQUM7QUFDekMsdUJBQU0sQ0FBQyxHQUFRLE9BQU8sQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FBT3ZCLGtDQUFrQyxXQUFnQjtJQUNoRCxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDcEQ7Ozs7OztBQUVELGtDQUFrQyxXQUFnQixFQUFFLE9BQXlCO0lBQzNFLHVCQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO0lBQzVDLHVCQUFNLElBQUksR0FBcUIsV0FBVyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7UUFDckUsQ0FBQyxDQUFDLG1CQUFDLFdBQWtCLEVBQUMsQ0FBQyxZQUFZLENBQUM7UUFDcEMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUM3RCxZQUFZLENBQ2IsQ0FBQztJQUNOLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDM0M7Ozs7O0FBRUQsTUFBTSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7SUFDdEQsTUFBTSxtQkFBQyxVQUFTLE1BQVcsRUFBRSxZQUFvQjtRQUMvQyx1QkFBTSxRQUFRLEdBQW1CLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxDQUFDO1FBQzVELHdCQUF3QixDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7S0FDOUMsZUFBc0IsRUFBQztDQUN6Qjs7Ozs7QUFFRCxNQUFNLCtCQUErQixRQUFnQjtJQUNuRCxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUN4QztBQUVELE1BQU0sQ0FBQyx1QkFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQ3RDLHdCQUF3QixFQUN4QixvQkFBb0IsQ0FDckIsQ0FBQzs7Ozs7O0FBVUYsTUFBTSw2QkFBZ0MsUUFBVztJQUMvQyx1QkFBTSxRQUFRLEdBQXVCLEVBQUUsQ0FBQztJQUV4QyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFO1FBQ2pFLG1CQUFDLFFBQThCLEVBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxDQUFDO0tBQy9ELENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxRQUFRLENBQUM7Q0FDakIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb21wb3NlIH0gZnJvbSAnQG5ncngvc3RvcmUnO1xuXG5jb25zdCBNRVRBREFUQV9LRVkgPSAnX19AbmdyeC9lZmZlY3RzX18nO1xuY29uc3QgcjogYW55ID0gUmVmbGVjdDtcblxuZXhwb3J0IGludGVyZmFjZSBFZmZlY3RNZXRhZGF0YSB7XG4gIHByb3BlcnR5TmFtZTogc3RyaW5nO1xuICBkaXNwYXRjaDogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gZ2V0RWZmZWN0TWV0YWRhdGFFbnRyaWVzKHNvdXJjZVByb3RvOiBhbnkpOiBFZmZlY3RNZXRhZGF0YVtdIHtcbiAgcmV0dXJuIHNvdXJjZVByb3RvLmNvbnN0cnVjdG9yW01FVEFEQVRBX0tFWV0gfHwgW107XG59XG5cbmZ1bmN0aW9uIHNldEVmZmVjdE1ldGFkYXRhRW50cmllcyhzb3VyY2VQcm90bzogYW55LCBlbnRyaWVzOiBFZmZlY3RNZXRhZGF0YVtdKSB7XG4gIGNvbnN0IGNvbnN0cnVjdG9yID0gc291cmNlUHJvdG8uY29uc3RydWN0b3I7XG4gIGNvbnN0IG1ldGE6IEVmZmVjdE1ldGFkYXRhW10gPSBjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShNRVRBREFUQV9LRVkpXG4gICAgPyAoY29uc3RydWN0b3IgYXMgYW55KVtNRVRBREFUQV9LRVldXG4gICAgOiBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IsIE1FVEFEQVRBX0tFWSwgeyB2YWx1ZTogW10gfSlbXG4gICAgICAgIE1FVEFEQVRBX0tFWVxuICAgICAgXTtcbiAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkobWV0YSwgZW50cmllcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBFZmZlY3QoeyBkaXNwYXRjaCB9ID0geyBkaXNwYXRjaDogdHJ1ZSB9KTogUHJvcGVydHlEZWNvcmF0b3Ige1xuICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0OiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgbWV0YWRhdGE6IEVmZmVjdE1ldGFkYXRhID0geyBwcm9wZXJ0eU5hbWUsIGRpc3BhdGNoIH07XG4gICAgc2V0RWZmZWN0TWV0YWRhdGFFbnRyaWVzKHRhcmdldCwgW21ldGFkYXRhXSk7XG4gIH0gLypUT0RPKCM4MjMpKi8gYXMgYW55O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U291cmNlRm9ySW5zdGFuY2UoaW5zdGFuY2U6IE9iamVjdCk6IGFueSB7XG4gIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoaW5zdGFuY2UpO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0U291cmNlTWV0YWRhdGEgPSBjb21wb3NlKFxuICBnZXRFZmZlY3RNZXRhZGF0YUVudHJpZXMsXG4gIGdldFNvdXJjZUZvckluc3RhbmNlXG4pO1xuXG5leHBvcnQgdHlwZSBFZmZlY3RzTWV0YWRhdGE8VD4gPSB7XG4gIFtrZXkgaW4ga2V5b2YgVF0/OlxuICAgIHwgdW5kZWZpbmVkXG4gICAgfCB7XG4gICAgICAgIGRpc3BhdGNoOiBib29sZWFuO1xuICAgICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVmZmVjdHNNZXRhZGF0YTxUPihpbnN0YW5jZTogVCk6IEVmZmVjdHNNZXRhZGF0YTxUPiB7XG4gIGNvbnN0IG1ldGFkYXRhOiBFZmZlY3RzTWV0YWRhdGE8VD4gPSB7fTtcblxuICBnZXRTb3VyY2VNZXRhZGF0YShpbnN0YW5jZSkuZm9yRWFjaCgoeyBwcm9wZXJ0eU5hbWUsIGRpc3BhdGNoIH0pID0+IHtcbiAgICAobWV0YWRhdGEgLypUT0RPKCM4MjMpKi8gYXMgYW55KVtwcm9wZXJ0eU5hbWVdID0geyBkaXNwYXRjaCB9O1xuICB9KTtcblxuICByZXR1cm4gbWV0YWRhdGE7XG59XG4iXX0=