/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 */
export function EffectNotification() { }
function EffectNotification_tsickle_Closure_declarations() {
    /** @type {?} */
    EffectNotification.prototype.effect;
    /** @type {?} */
    EffectNotification.prototype.propertyName;
    /** @type {?} */
    EffectNotification.prototype.sourceName;
    /** @type {?} */
    EffectNotification.prototype.sourceInstance;
    /** @type {?} */
    EffectNotification.prototype.notification;
}
/**
 * @param {?} output
 * @param {?} reporter
 * @return {?}
 */
export function verifyOutput(output, reporter) {
    reportErrorThrown(output, reporter);
    reportInvalidActions(output, reporter);
}
/**
 * @param {?} output
 * @param {?} reporter
 * @return {?}
 */
function reportErrorThrown(output, reporter) {
    if (output.notification.kind === 'E') {
        reporter.handleError(output.notification.error);
    }
}
/**
 * @param {?} output
 * @param {?} reporter
 * @return {?}
 */
function reportInvalidActions(output, reporter) {
    if (output.notification.kind === 'N') {
        const /** @type {?} */ action = output.notification.value;
        const /** @type {?} */ isInvalidAction = !isAction(action);
        if (isInvalidAction) {
            reporter.handleError(new Error(`Effect ${getEffectName(output)} dispatched an invalid action: ${action}`));
        }
    }
}
/**
 * @param {?} action
 * @return {?}
 */
function isAction(action) {
    return action && action.type && typeof action.type === 'string';
}
/**
 * @param {?} __0
 * @return {?}
 */
function getEffectName({ propertyName, sourceInstance, sourceName, }) {
    const /** @type {?} */ isMethod = typeof sourceInstance[propertyName] === 'function';
    return `"${sourceName}.${propertyName}${isMethod ? '()' : ''}"`;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0X25vdGlmaWNhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0X25vdGlmaWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBWUEsTUFBTSx1QkFDSixNQUEwQixFQUMxQixRQUFzQjtJQUV0QixpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQ3hDOzs7Ozs7QUFFRCwyQkFBMkIsTUFBMEIsRUFBRSxRQUFzQjtJQUMzRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNqRDtDQUNGOzs7Ozs7QUFFRCw4QkFDRSxNQUEwQixFQUMxQixRQUFzQjtJQUV0QixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLHVCQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUN6Qyx1QkFBTSxlQUFlLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFMUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNwQixRQUFRLENBQUMsV0FBVyxDQUNsQixJQUFJLEtBQUssQ0FDUCxVQUFVLGFBQWEsQ0FDckIsTUFBTSxDQUNQLGtDQUFrQyxNQUFNLEVBQUUsQ0FDNUMsQ0FDRixDQUFDO1NBQ0g7S0FDRjtDQUNGOzs7OztBQUVELGtCQUFrQixNQUFXO0lBQzNCLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO0NBQ2pFOzs7OztBQUVELHVCQUF1QixFQUNyQixZQUFZLEVBQ1osY0FBYyxFQUNkLFVBQVUsR0FDUztJQUNuQix1QkFBTSxRQUFRLEdBQUcsT0FBTyxjQUFjLENBQUMsWUFBWSxDQUFDLEtBQUssVUFBVSxDQUFDO0lBRXBFLE1BQU0sQ0FBQyxJQUFJLFVBQVUsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO0NBQ2pFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXJyb3JIYW5kbGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBOb3RpZmljYXRpb24sIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcblxuZXhwb3J0IGludGVyZmFjZSBFZmZlY3ROb3RpZmljYXRpb24ge1xuICBlZmZlY3Q6IE9ic2VydmFibGU8YW55PiB8ICgoKSA9PiBPYnNlcnZhYmxlPGFueT4pO1xuICBwcm9wZXJ0eU5hbWU6IHN0cmluZztcbiAgc291cmNlTmFtZTogc3RyaW5nO1xuICBzb3VyY2VJbnN0YW5jZTogYW55O1xuICBub3RpZmljYXRpb246IE5vdGlmaWNhdGlvbjxBY3Rpb24gfCBudWxsIHwgdW5kZWZpbmVkPjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeU91dHB1dChcbiAgb3V0cHV0OiBFZmZlY3ROb3RpZmljYXRpb24sXG4gIHJlcG9ydGVyOiBFcnJvckhhbmRsZXJcbikge1xuICByZXBvcnRFcnJvclRocm93bihvdXRwdXQsIHJlcG9ydGVyKTtcbiAgcmVwb3J0SW52YWxpZEFjdGlvbnMob3V0cHV0LCByZXBvcnRlcik7XG59XG5cbmZ1bmN0aW9uIHJlcG9ydEVycm9yVGhyb3duKG91dHB1dDogRWZmZWN0Tm90aWZpY2F0aW9uLCByZXBvcnRlcjogRXJyb3JIYW5kbGVyKSB7XG4gIGlmIChvdXRwdXQubm90aWZpY2F0aW9uLmtpbmQgPT09ICdFJykge1xuICAgIHJlcG9ydGVyLmhhbmRsZUVycm9yKG91dHB1dC5ub3RpZmljYXRpb24uZXJyb3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlcG9ydEludmFsaWRBY3Rpb25zKFxuICBvdXRwdXQ6IEVmZmVjdE5vdGlmaWNhdGlvbixcbiAgcmVwb3J0ZXI6IEVycm9ySGFuZGxlclxuKSB7XG4gIGlmIChvdXRwdXQubm90aWZpY2F0aW9uLmtpbmQgPT09ICdOJykge1xuICAgIGNvbnN0IGFjdGlvbiA9IG91dHB1dC5ub3RpZmljYXRpb24udmFsdWU7XG4gICAgY29uc3QgaXNJbnZhbGlkQWN0aW9uID0gIWlzQWN0aW9uKGFjdGlvbik7XG5cbiAgICBpZiAoaXNJbnZhbGlkQWN0aW9uKSB7XG4gICAgICByZXBvcnRlci5oYW5kbGVFcnJvcihcbiAgICAgICAgbmV3IEVycm9yKFxuICAgICAgICAgIGBFZmZlY3QgJHtnZXRFZmZlY3ROYW1lKFxuICAgICAgICAgICAgb3V0cHV0XG4gICAgICAgICAgKX0gZGlzcGF0Y2hlZCBhbiBpbnZhbGlkIGFjdGlvbjogJHthY3Rpb259YFxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0FjdGlvbihhY3Rpb246IGFueSk6IGFjdGlvbiBpcyBBY3Rpb24ge1xuICByZXR1cm4gYWN0aW9uICYmIGFjdGlvbi50eXBlICYmIHR5cGVvZiBhY3Rpb24udHlwZSA9PT0gJ3N0cmluZyc7XG59XG5cbmZ1bmN0aW9uIGdldEVmZmVjdE5hbWUoe1xuICBwcm9wZXJ0eU5hbWUsXG4gIHNvdXJjZUluc3RhbmNlLFxuICBzb3VyY2VOYW1lLFxufTogRWZmZWN0Tm90aWZpY2F0aW9uKSB7XG4gIGNvbnN0IGlzTWV0aG9kID0gdHlwZW9mIHNvdXJjZUluc3RhbmNlW3Byb3BlcnR5TmFtZV0gPT09ICdmdW5jdGlvbic7XG5cbiAgcmV0dXJuIGBcIiR7c291cmNlTmFtZX0uJHtwcm9wZXJ0eU5hbWV9JHtpc01ldGhvZCA/ICcoKScgOiAnJ31cImA7XG59XG4iXX0=