/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { UPDATE, INIT, } from '@ngrx/store';
import { difference, liftAction } from './utils';
import * as Actions from './actions';
import { PerformAction } from './actions';
export const /** @type {?} */ INIT_ACTION = { type: INIT };
/**
 * @record
 */
export function ComputedState() { }
function ComputedState_tsickle_Closure_declarations() {
    /** @type {?} */
    ComputedState.prototype.state;
    /** @type {?} */
    ComputedState.prototype.error;
}
/**
 * @record
 */
export function LiftedAction() { }
function LiftedAction_tsickle_Closure_declarations() {
    /** @type {?} */
    LiftedAction.prototype.type;
    /** @type {?} */
    LiftedAction.prototype.action;
}
/**
 * @record
 */
export function LiftedActions() { }
function LiftedActions_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    [id: number]: LiftedAction;
    */
}
/**
 * @record
 */
export function LiftedState() { }
function LiftedState_tsickle_Closure_declarations() {
    /** @type {?} */
    LiftedState.prototype.monitorState;
    /** @type {?} */
    LiftedState.prototype.nextActionId;
    /** @type {?} */
    LiftedState.prototype.actionsById;
    /** @type {?} */
    LiftedState.prototype.stagedActionIds;
    /** @type {?} */
    LiftedState.prototype.skippedActionIds;
    /** @type {?} */
    LiftedState.prototype.committedState;
    /** @type {?} */
    LiftedState.prototype.currentStateIndex;
    /** @type {?} */
    LiftedState.prototype.computedStates;
}
/**
 * Computes the next entry in the log by applying an action.
 * @param {?} reducer
 * @param {?} action
 * @param {?} state
 * @param {?} error
 * @param {?} errorHandler
 * @return {?}
 */
function computeNextEntry(reducer, action, state, error, errorHandler) {
    if (error) {
        return {
            state,
            error: 'Interrupted by an error up the chain',
        };
    }
    let /** @type {?} */ nextState = state;
    let /** @type {?} */ nextError;
    try {
        nextState = reducer(state, action);
    }
    catch (/** @type {?} */ err) {
        nextError = err.toString();
        errorHandler.handleError(err.stack || err);
    }
    return {
        state: nextState,
        error: nextError,
    };
}
/**
 * Runs the reducer on invalidated actions to get a fresh computation log.
 * @param {?} computedStates
 * @param {?} minInvalidatedStateIndex
 * @param {?} reducer
 * @param {?} committedState
 * @param {?} actionsById
 * @param {?} stagedActionIds
 * @param {?} skippedActionIds
 * @param {?} errorHandler
 * @return {?}
 */
function recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler) {
    // Optimization: exit early and return the same reference
    // if we know nothing could have changed.
    if (minInvalidatedStateIndex >= computedStates.length &&
        computedStates.length === stagedActionIds.length) {
        return computedStates;
    }
    const /** @type {?} */ nextComputedStates = computedStates.slice(0, minInvalidatedStateIndex);
    for (let /** @type {?} */ i = minInvalidatedStateIndex; i < stagedActionIds.length; i++) {
        const /** @type {?} */ actionId = stagedActionIds[i];
        const /** @type {?} */ action = actionsById[actionId].action;
        const /** @type {?} */ previousEntry = nextComputedStates[i - 1];
        const /** @type {?} */ previousState = previousEntry ? previousEntry.state : committedState;
        const /** @type {?} */ previousError = previousEntry ? previousEntry.error : undefined;
        const /** @type {?} */ shouldSkip = skippedActionIds.indexOf(actionId) > -1;
        const /** @type {?} */ entry = shouldSkip
            ? previousEntry
            : computeNextEntry(reducer, action, previousState, previousError, errorHandler);
        nextComputedStates.push(entry);
    }
    return nextComputedStates;
}
/**
 * @param {?=} initialCommittedState
 * @param {?=} monitorReducer
 * @return {?}
 */
export function liftInitialState(initialCommittedState, monitorReducer) {
    return {
        monitorState: monitorReducer(undefined, {}),
        nextActionId: 1,
        actionsById: { 0: liftAction(INIT_ACTION) },
        stagedActionIds: [0],
        skippedActionIds: [],
        committedState: initialCommittedState,
        currentStateIndex: 0,
        computedStates: [],
    };
}
/**
 * Creates a history state reducer from an app's reducer.
 * @param {?} initialCommittedState
 * @param {?} initialLiftedState
 * @param {?} errorHandler
 * @param {?=} monitorReducer
 * @param {?=} options
 * @return {?}
 */
export function liftReducerWith(initialCommittedState, initialLiftedState, errorHandler, monitorReducer, options = {}) {
    /**
       * Manages how the history actions modify the history state.
       */
    return (reducer) => (liftedState, liftedAction) => {
        let { monitorState, actionsById, nextActionId, stagedActionIds, skippedActionIds, committedState, currentStateIndex, computedStates, } = liftedState || initialLiftedState;
        if (!liftedState) {
            // Prevent mutating initialLiftedState
            actionsById = Object.create(actionsById);
        }
        /**
         * @param {?} n
         * @return {?}
         */
        function commitExcessActions(n) {
            // Auto-commits n-number of excess actions.
            let /** @type {?} */ excess = n;
            let /** @type {?} */ idsToDelete = stagedActionIds.slice(1, excess + 1);
            for (let /** @type {?} */ i = 0; i < idsToDelete.length; i++) {
                if (computedStates[i + 1].error) {
                    // Stop if error is found. Commit actions up to error.
                    excess = i;
                    idsToDelete = stagedActionIds.slice(1, excess + 1);
                    break;
                }
                else {
                    delete actionsById[idsToDelete[i]];
                }
            }
            skippedActionIds = skippedActionIds.filter(id => idsToDelete.indexOf(id) === -1);
            stagedActionIds = [0, ...stagedActionIds.slice(excess + 1)];
            committedState = computedStates[excess].state;
            computedStates = computedStates.slice(excess);
            currentStateIndex =
                currentStateIndex > excess ? currentStateIndex - excess : 0;
        }
        // By default, aggressively recompute every state whatever happens.
        // This has O(n) performance, so we'll override this to a sensible
        // value whenever we feel like we don't have to recompute the states.
        let /** @type {?} */ minInvalidatedStateIndex = 0;
        switch (liftedAction.type) {
            case Actions.RESET: {
                // Get back to the state the store was created with.
                actionsById = { 0: liftAction(INIT_ACTION) };
                nextActionId = 1;
                stagedActionIds = [0];
                skippedActionIds = [];
                committedState = initialCommittedState;
                currentStateIndex = 0;
                computedStates = [];
                break;
            }
            case Actions.COMMIT: {
                // Consider the last committed state the new starting point.
                // Squash any staged actions into a single committed state.
                actionsById = { 0: liftAction(INIT_ACTION) };
                nextActionId = 1;
                stagedActionIds = [0];
                skippedActionIds = [];
                committedState = computedStates[currentStateIndex].state;
                currentStateIndex = 0;
                computedStates = [];
                break;
            }
            case Actions.ROLLBACK: {
                // Forget about any staged actions.
                // Start again from the last committed state.
                actionsById = { 0: liftAction(INIT_ACTION) };
                nextActionId = 1;
                stagedActionIds = [0];
                skippedActionIds = [];
                currentStateIndex = 0;
                computedStates = [];
                break;
            }
            case Actions.TOGGLE_ACTION: {
                // Toggle whether an action with given ID is skipped.
                // Being skipped means it is a no-op during the computation.
                const { id: actionId } = liftedAction;
                const /** @type {?} */ index = skippedActionIds.indexOf(actionId);
                if (index === -1) {
                    skippedActionIds = [actionId, ...skippedActionIds];
                }
                else {
                    skippedActionIds = skippedActionIds.filter(id => id !== actionId);
                }
                // Optimization: we know history before this action hasn't changed
                minInvalidatedStateIndex = stagedActionIds.indexOf(actionId);
                break;
            }
            case Actions.SET_ACTIONS_ACTIVE: {
                // Toggle whether an action with given ID is skipped.
                // Being skipped means it is a no-op during the computation.
                const { start, end, active } = liftedAction;
                const /** @type {?} */ actionIds = [];
                for (let /** @type {?} */ i = start; i < end; i++)
                    actionIds.push(i);
                if (active) {
                    skippedActionIds = difference(skippedActionIds, actionIds);
                }
                else {
                    skippedActionIds = [...skippedActionIds, ...actionIds];
                }
                // Optimization: we know history before this action hasn't changed
                minInvalidatedStateIndex = stagedActionIds.indexOf(start);
                break;
            }
            case Actions.JUMP_TO_STATE: {
                // Without recomputing anything, move the pointer that tell us
                // which state is considered the current one. Useful for sliders.
                currentStateIndex = liftedAction.index;
                // Optimization: we know the history has not changed.
                minInvalidatedStateIndex = Infinity;
                break;
            }
            case Actions.JUMP_TO_ACTION: {
                // Jumps to a corresponding state to a specific action.
                // Useful when filtering actions.
                const /** @type {?} */ index = stagedActionIds.indexOf(liftedAction.actionId);
                if (index !== -1)
                    currentStateIndex = index;
                minInvalidatedStateIndex = Infinity;
                break;
            }
            case Actions.SWEEP: {
                // Forget any actions that are currently being skipped.
                stagedActionIds = difference(stagedActionIds, skippedActionIds);
                skippedActionIds = [];
                currentStateIndex = Math.min(currentStateIndex, stagedActionIds.length - 1);
                break;
            }
            case Actions.PERFORM_ACTION: {
                // Auto-commit as new actions come in.
                if (options.maxAge && stagedActionIds.length === options.maxAge) {
                    commitExcessActions(1);
                }
                if (currentStateIndex === stagedActionIds.length - 1) {
                    currentStateIndex++;
                }
                const /** @type {?} */ actionId = nextActionId++;
                // Mutation! This is the hottest path, and we optimize on purpose.
                // It is safe because we set a new key in a cache dictionary.
                actionsById[actionId] = liftedAction;
                stagedActionIds = [...stagedActionIds, actionId];
                // Optimization: we know that only the new action needs computing.
                minInvalidatedStateIndex = stagedActionIds.length - 1;
                break;
            }
            case Actions.IMPORT_STATE: {
                // Completely replace everything.
                ({
                    monitorState,
                    actionsById,
                    nextActionId,
                    stagedActionIds,
                    skippedActionIds,
                    committedState,
                    currentStateIndex,
                    computedStates,
                } = liftedAction.nextLiftedState);
                break;
            }
            case INIT: {
                // Always recompute states on hot reload and init.
                minInvalidatedStateIndex = 0;
                if (options.maxAge && stagedActionIds.length > options.maxAge) {
                    // States must be recomputed before committing excess.
                    computedStates = recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler);
                    commitExcessActions(stagedActionIds.length - options.maxAge);
                    // Avoid double computation.
                    minInvalidatedStateIndex = Infinity;
                }
                break;
            }
            case UPDATE: {
                const /** @type {?} */ stateHasErrors = computedStates.filter(state => state.error).length > 0;
                if (stateHasErrors) {
                    // Recompute all states
                    minInvalidatedStateIndex = 0;
                    if (options.maxAge && stagedActionIds.length > options.maxAge) {
                        // States must be recomputed before committing excess.
                        computedStates = recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler);
                        commitExcessActions(stagedActionIds.length - options.maxAge);
                        // Avoid double computation.
                        minInvalidatedStateIndex = Infinity;
                    }
                }
                else {
                    if (currentStateIndex === stagedActionIds.length - 1) {
                        currentStateIndex++;
                    }
                    // Add a new action to only recompute state
                    const /** @type {?} */ actionId = nextActionId++;
                    actionsById[actionId] = new PerformAction(liftedAction, +Date.now());
                    stagedActionIds = [...stagedActionIds, actionId];
                    minInvalidatedStateIndex = stagedActionIds.length - 1;
                    // States must be recomputed before committing excess.
                    computedStates = recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler);
                    // Recompute state history with latest reducer and update action
                    computedStates = computedStates.map(cmp => (Object.assign({}, cmp, { state: reducer(cmp.state, liftedAction) })));
                    currentStateIndex = minInvalidatedStateIndex;
                    if (options.maxAge && stagedActionIds.length > options.maxAge) {
                        commitExcessActions(stagedActionIds.length - options.maxAge);
                    }
                    // Avoid double computation.
                    minInvalidatedStateIndex = Infinity;
                }
                break;
            }
            default: {
                // If the action is not recognized, it's a monitor action.
                // Optimization: a monitor action can't change history.
                minInvalidatedStateIndex = Infinity;
                break;
            }
        }
        computedStates = recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler);
        monitorState = monitorReducer(monitorState, liftedAction);
        return {
            monitorState,
            actionsById,
            nextActionId,
            stagedActionIds,
            skippedActionIds,
            committedState,
            currentStateIndex,
            computedStates,
        };
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkdWNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvc3RvcmUtZGV2dG9vbHMvc3JjL3JlZHVjZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUNBLE9BQU8sRUFLTCxNQUFNLEVBQ04sSUFBSSxHQUNMLE1BQU0sYUFBYSxDQUFDO0FBQ3JCLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2pELE9BQU8sS0FBSyxPQUFPLE1BQU0sV0FBVyxDQUFDO0FBRXJDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFhMUMsTUFBTSxDQUFDLHVCQUFNLFdBQVcsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQThCMUMsMEJBQ0UsT0FBZ0MsRUFDaEMsTUFBYyxFQUNkLEtBQVUsRUFDVixLQUFVLEVBQ1YsWUFBMEI7SUFFMUIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNWLE1BQU0sQ0FBQztZQUNMLEtBQUs7WUFDTCxLQUFLLEVBQUUsc0NBQXNDO1NBQzlDLENBQUM7S0FDSDtJQUVELHFCQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDdEIscUJBQUksU0FBUyxDQUFDO0lBQ2QsSUFBSSxDQUFDO1FBQ0gsU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDcEM7SUFBQyxLQUFLLENBQUMsQ0FBQyxpQkFBQSxHQUFHLEVBQUUsQ0FBQztRQUNiLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0IsWUFBWSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0tBQzVDO0lBRUQsTUFBTSxDQUFDO1FB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b3J0IHsgRXJyb3JIYW5kbGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBBY3Rpb24sXG4gIEFjdGlvblJlZHVjZXIsXG4gIEFjdGlvbnNTdWJqZWN0LFxuICBSZWR1Y2VyTWFuYWdlcixcbiAgVVBEQVRFLFxuICBJTklULFxufSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBkaWZmZXJlbmNlLCBsaWZ0QWN0aW9uIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgKiBhcyBBY3Rpb25zIGZyb20gJy4vYWN0aW9ucyc7XG5pbXBvcnQgeyBTdG9yZURldnRvb2xzQ29uZmlnLCBTdGF0ZVNhbml0aXplciB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IFBlcmZvcm1BY3Rpb24gfSBmcm9tICcuL2FjdGlvbnMnO1xuXG5leHBvcnQgdHlwZSBJbml0QWN0aW9uID0ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgSU5JVDtcbn07XG5cbmV4cG9ydCB0eXBlIFVwZGF0ZVJlZHVjZXJBY3Rpb24gPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBVUERBVEU7XG59O1xuXG5leHBvcnQgdHlwZSBDb3JlQWN0aW9ucyA9IEluaXRBY3Rpb24gfCBVcGRhdGVSZWR1Y2VyQWN0aW9uO1xuZXhwb3J0IHR5cGUgQWN0aW9ucyA9IEFjdGlvbnMuQWxsIHwgQ29yZUFjdGlvbnM7XG5cbmV4cG9ydCBjb25zdCBJTklUX0FDVElPTiA9IHsgdHlwZTogSU5JVCB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbXB1dGVkU3RhdGUge1xuICBzdGF0ZTogYW55O1xuICBlcnJvcjogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExpZnRlZEFjdGlvbiB7XG4gIHR5cGU6IHN0cmluZztcbiAgYWN0aW9uOiBBY3Rpb247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlmdGVkQWN0aW9ucyB7XG4gIFtpZDogbnVtYmVyXTogTGlmdGVkQWN0aW9uO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExpZnRlZFN0YXRlIHtcbiAgbW9uaXRvclN0YXRlOiBhbnk7XG4gIG5leHRBY3Rpb25JZDogbnVtYmVyO1xuICBhY3Rpb25zQnlJZDogTGlmdGVkQWN0aW9ucztcbiAgc3RhZ2VkQWN0aW9uSWRzOiBudW1iZXJbXTtcbiAgc2tpcHBlZEFjdGlvbklkczogbnVtYmVyW107XG4gIGNvbW1pdHRlZFN0YXRlOiBhbnk7XG4gIGN1cnJlbnRTdGF0ZUluZGV4OiBudW1iZXI7XG4gIGNvbXB1dGVkU3RhdGVzOiBDb21wdXRlZFN0YXRlW107XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIG5leHQgZW50cnkgaW4gdGhlIGxvZyBieSBhcHBseWluZyBhbiBhY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVOZXh0RW50cnkoXG4gIHJlZHVjZXI6IEFjdGlvblJlZHVjZXI8YW55LCBhbnk+LFxuICBhY3Rpb246IEFjdGlvbixcbiAgc3RhdGU6IGFueSxcbiAgZXJyb3I6IGFueSxcbiAgZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXJcbikge1xuICBpZiAoZXJyb3IpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdGUsXG4gICAgICBlcnJvcjogJ0ludGVycnVwdGVkIGJ5IGFuIGVycm9yIHVwIHRoZSBjaGFpbicsXG4gICAgfTtcbiAgfVxuXG4gIGxldCBuZXh0U3RhdGUgPSBzdGF0ZTtcbiAgbGV0IG5leHRFcnJvcjtcbiAgdHJ5IHtcbiAgICBuZXh0U3RhdGUgPSByZWR1Y2VyKHN0YXRlLCBhY3Rpb24pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBuZXh0RXJyb3IgPSBlcnIudG9TdHJpbmcoKTtcbiAgICBlcnJvckhhbmRsZXIuaGFuZGxlRXJyb3IoZXJyLnN0YWNrIHx8IGVycik7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN0YXRlOiBuZXh0U3RhdGUsXG4gICAgZXJyb3I6IG5leHRFcnJvcixcbiAgfTtcbn1cblxuLyoqXG4gKiBSdW5zIHRoZSByZWR1Y2VyIG9uIGludmFsaWRhdGVkIGFjdGlvbnMgdG8gZ2V0IGEgZnJlc2ggY29tcHV0YXRpb24gbG9nLlxuICovXG5mdW5jdGlvbiByZWNvbXB1dGVTdGF0ZXMoXG4gIGNvbXB1dGVkU3RhdGVzOiBDb21wdXRlZFN0YXRlW10sXG4gIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleDogbnVtYmVyLFxuICByZWR1Y2VyOiBBY3Rpb25SZWR1Y2VyPGFueSwgYW55PixcbiAgY29tbWl0dGVkU3RhdGU6IGFueSxcbiAgYWN0aW9uc0J5SWQ6IExpZnRlZEFjdGlvbnMsXG4gIHN0YWdlZEFjdGlvbklkczogbnVtYmVyW10sXG4gIHNraXBwZWRBY3Rpb25JZHM6IG51bWJlcltdLFxuICBlcnJvckhhbmRsZXI6IEVycm9ySGFuZGxlclxuKSB7XG4gIC8vIE9wdGltaXphdGlvbjogZXhpdCBlYXJseSBhbmQgcmV0dXJuIHRoZSBzYW1lIHJlZmVyZW5jZVxuICAvLyBpZiB3ZSBrbm93IG5vdGhpbmcgY291bGQgaGF2ZSBjaGFuZ2VkLlxuICBpZiAoXG4gICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4ID49IGNvbXB1dGVkU3RhdGVzLmxlbmd0aCAmJlxuICAgIGNvbXB1dGVkU3RhdGVzLmxlbmd0aCA9PT0gc3RhZ2VkQWN0aW9uSWRzLmxlbmd0aFxuICApIHtcbiAgICByZXR1cm4gY29tcHV0ZWRTdGF0ZXM7XG4gIH1cblxuICBjb25zdCBuZXh0Q29tcHV0ZWRTdGF0ZXMgPSBjb21wdXRlZFN0YXRlcy5zbGljZSgwLCBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXgpO1xuICBmb3IgKGxldCBpID0gbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4OyBpIDwgc3RhZ2VkQWN0aW9uSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYWN0aW9uSWQgPSBzdGFnZWRBY3Rpb25JZHNbaV07XG4gICAgY29uc3QgYWN0aW9uID0gYWN0aW9uc0J5SWRbYWN0aW9uSWRdLmFjdGlvbjtcblxuICAgIGNvbnN0IHByZXZpb3VzRW50cnkgPSBuZXh0Q29tcHV0ZWRTdGF0ZXNbaSAtIDFdO1xuICAgIGNvbnN0IHByZXZpb3VzU3RhdGUgPSBwcmV2aW91c0VudHJ5ID8gcHJldmlvdXNFbnRyeS5zdGF0ZSA6IGNvbW1pdHRlZFN0YXRlO1xuICAgIGNvbnN0IHByZXZpb3VzRXJyb3IgPSBwcmV2aW91c0VudHJ5ID8gcHJldmlvdXNFbnRyeS5lcnJvciA6IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0IHNob3VsZFNraXAgPSBza2lwcGVkQWN0aW9uSWRzLmluZGV4T2YoYWN0aW9uSWQpID4gLTE7XG4gICAgY29uc3QgZW50cnk6IENvbXB1dGVkU3RhdGUgPSBzaG91bGRTa2lwXG4gICAgICA/IHByZXZpb3VzRW50cnlcbiAgICAgIDogY29tcHV0ZU5leHRFbnRyeShcbiAgICAgICAgICByZWR1Y2VyLFxuICAgICAgICAgIGFjdGlvbixcbiAgICAgICAgICBwcmV2aW91c1N0YXRlLFxuICAgICAgICAgIHByZXZpb3VzRXJyb3IsXG4gICAgICAgICAgZXJyb3JIYW5kbGVyXG4gICAgICAgICk7XG5cbiAgICBuZXh0Q29tcHV0ZWRTdGF0ZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICByZXR1cm4gbmV4dENvbXB1dGVkU3RhdGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdEluaXRpYWxTdGF0ZShcbiAgaW5pdGlhbENvbW1pdHRlZFN0YXRlPzogYW55LFxuICBtb25pdG9yUmVkdWNlcj86IGFueVxuKTogTGlmdGVkU3RhdGUge1xuICByZXR1cm4ge1xuICAgIG1vbml0b3JTdGF0ZTogbW9uaXRvclJlZHVjZXIodW5kZWZpbmVkLCB7fSksXG4gICAgbmV4dEFjdGlvbklkOiAxLFxuICAgIGFjdGlvbnNCeUlkOiB7IDA6IGxpZnRBY3Rpb24oSU5JVF9BQ1RJT04pIH0sXG4gICAgc3RhZ2VkQWN0aW9uSWRzOiBbMF0sXG4gICAgc2tpcHBlZEFjdGlvbklkczogW10sXG4gICAgY29tbWl0dGVkU3RhdGU6IGluaXRpYWxDb21taXR0ZWRTdGF0ZSxcbiAgICBjdXJyZW50U3RhdGVJbmRleDogMCxcbiAgICBjb21wdXRlZFN0YXRlczogW10sXG4gIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGhpc3Rvcnkgc3RhdGUgcmVkdWNlciBmcm9tIGFuIGFwcCdzIHJlZHVjZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0UmVkdWNlcldpdGgoXG4gIGluaXRpYWxDb21taXR0ZWRTdGF0ZTogYW55LFxuICBpbml0aWFsTGlmdGVkU3RhdGU6IExpZnRlZFN0YXRlLFxuICBlcnJvckhhbmRsZXI6IEVycm9ySGFuZGxlcixcbiAgbW9uaXRvclJlZHVjZXI/OiBhbnksXG4gIG9wdGlvbnM6IFBhcnRpYWw8U3RvcmVEZXZ0b29sc0NvbmZpZz4gPSB7fVxuKSB7XG4gIC8qKlxuICAgKiBNYW5hZ2VzIGhvdyB0aGUgaGlzdG9yeSBhY3Rpb25zIG1vZGlmeSB0aGUgaGlzdG9yeSBzdGF0ZS5cbiAgICovXG4gIHJldHVybiAoXG4gICAgcmVkdWNlcjogQWN0aW9uUmVkdWNlcjxhbnksIGFueT5cbiAgKTogQWN0aW9uUmVkdWNlcjxMaWZ0ZWRTdGF0ZSwgQWN0aW9ucz4gPT4gKGxpZnRlZFN0YXRlLCBsaWZ0ZWRBY3Rpb24pID0+IHtcbiAgICBsZXQge1xuICAgICAgbW9uaXRvclN0YXRlLFxuICAgICAgYWN0aW9uc0J5SWQsXG4gICAgICBuZXh0QWN0aW9uSWQsXG4gICAgICBzdGFnZWRBY3Rpb25JZHMsXG4gICAgICBza2lwcGVkQWN0aW9uSWRzLFxuICAgICAgY29tbWl0dGVkU3RhdGUsXG4gICAgICBjdXJyZW50U3RhdGVJbmRleCxcbiAgICAgIGNvbXB1dGVkU3RhdGVzLFxuICAgIH0gPVxuICAgICAgbGlmdGVkU3RhdGUgfHwgaW5pdGlhbExpZnRlZFN0YXRlO1xuXG4gICAgaWYgKCFsaWZ0ZWRTdGF0ZSkge1xuICAgICAgLy8gUHJldmVudCBtdXRhdGluZyBpbml0aWFsTGlmdGVkU3RhdGVcbiAgICAgIGFjdGlvbnNCeUlkID0gT2JqZWN0LmNyZWF0ZShhY3Rpb25zQnlJZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tbWl0RXhjZXNzQWN0aW9ucyhuOiBudW1iZXIpIHtcbiAgICAgIC8vIEF1dG8tY29tbWl0cyBuLW51bWJlciBvZiBleGNlc3MgYWN0aW9ucy5cbiAgICAgIGxldCBleGNlc3MgPSBuO1xuICAgICAgbGV0IGlkc1RvRGVsZXRlID0gc3RhZ2VkQWN0aW9uSWRzLnNsaWNlKDEsIGV4Y2VzcyArIDEpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlkc1RvRGVsZXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjb21wdXRlZFN0YXRlc1tpICsgMV0uZXJyb3IpIHtcbiAgICAgICAgICAvLyBTdG9wIGlmIGVycm9yIGlzIGZvdW5kLiBDb21taXQgYWN0aW9ucyB1cCB0byBlcnJvci5cbiAgICAgICAgICBleGNlc3MgPSBpO1xuICAgICAgICAgIGlkc1RvRGVsZXRlID0gc3RhZ2VkQWN0aW9uSWRzLnNsaWNlKDEsIGV4Y2VzcyArIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBhY3Rpb25zQnlJZFtpZHNUb0RlbGV0ZVtpXV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2tpcHBlZEFjdGlvbklkcyA9IHNraXBwZWRBY3Rpb25JZHMuZmlsdGVyKFxuICAgICAgICBpZCA9PiBpZHNUb0RlbGV0ZS5pbmRleE9mKGlkKSA9PT0gLTFcbiAgICAgICk7XG4gICAgICBzdGFnZWRBY3Rpb25JZHMgPSBbMCwgLi4uc3RhZ2VkQWN0aW9uSWRzLnNsaWNlKGV4Y2VzcyArIDEpXTtcbiAgICAgIGNvbW1pdHRlZFN0YXRlID0gY29tcHV0ZWRTdGF0ZXNbZXhjZXNzXS5zdGF0ZTtcbiAgICAgIGNvbXB1dGVkU3RhdGVzID0gY29tcHV0ZWRTdGF0ZXMuc2xpY2UoZXhjZXNzKTtcbiAgICAgIGN1cnJlbnRTdGF0ZUluZGV4ID1cbiAgICAgICAgY3VycmVudFN0YXRlSW5kZXggPiBleGNlc3MgPyBjdXJyZW50U3RhdGVJbmRleCAtIGV4Y2VzcyA6IDA7XG4gICAgfVxuXG4gICAgLy8gQnkgZGVmYXVsdCwgYWdncmVzc2l2ZWx5IHJlY29tcHV0ZSBldmVyeSBzdGF0ZSB3aGF0ZXZlciBoYXBwZW5zLlxuICAgIC8vIFRoaXMgaGFzIE8obikgcGVyZm9ybWFuY2UsIHNvIHdlJ2xsIG92ZXJyaWRlIHRoaXMgdG8gYSBzZW5zaWJsZVxuICAgIC8vIHZhbHVlIHdoZW5ldmVyIHdlIGZlZWwgbGlrZSB3ZSBkb24ndCBoYXZlIHRvIHJlY29tcHV0ZSB0aGUgc3RhdGVzLlxuICAgIGxldCBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXggPSAwO1xuXG4gICAgc3dpdGNoIChsaWZ0ZWRBY3Rpb24udHlwZSkge1xuICAgICAgY2FzZSBBY3Rpb25zLlJFU0VUOiB7XG4gICAgICAgIC8vIEdldCBiYWNrIHRvIHRoZSBzdGF0ZSB0aGUgc3RvcmUgd2FzIGNyZWF0ZWQgd2l0aC5cbiAgICAgICAgYWN0aW9uc0J5SWQgPSB7IDA6IGxpZnRBY3Rpb24oSU5JVF9BQ1RJT04pIH07XG4gICAgICAgIG5leHRBY3Rpb25JZCA9IDE7XG4gICAgICAgIHN0YWdlZEFjdGlvbklkcyA9IFswXTtcbiAgICAgICAgc2tpcHBlZEFjdGlvbklkcyA9IFtdO1xuICAgICAgICBjb21taXR0ZWRTdGF0ZSA9IGluaXRpYWxDb21taXR0ZWRTdGF0ZTtcbiAgICAgICAgY3VycmVudFN0YXRlSW5kZXggPSAwO1xuICAgICAgICBjb21wdXRlZFN0YXRlcyA9IFtdO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgQWN0aW9ucy5DT01NSVQ6IHtcbiAgICAgICAgLy8gQ29uc2lkZXIgdGhlIGxhc3QgY29tbWl0dGVkIHN0YXRlIHRoZSBuZXcgc3RhcnRpbmcgcG9pbnQuXG4gICAgICAgIC8vIFNxdWFzaCBhbnkgc3RhZ2VkIGFjdGlvbnMgaW50byBhIHNpbmdsZSBjb21taXR0ZWQgc3RhdGUuXG4gICAgICAgIGFjdGlvbnNCeUlkID0geyAwOiBsaWZ0QWN0aW9uKElOSVRfQUNUSU9OKSB9O1xuICAgICAgICBuZXh0QWN0aW9uSWQgPSAxO1xuICAgICAgICBzdGFnZWRBY3Rpb25JZHMgPSBbMF07XG4gICAgICAgIHNraXBwZWRBY3Rpb25JZHMgPSBbXTtcbiAgICAgICAgY29tbWl0dGVkU3RhdGUgPSBjb21wdXRlZFN0YXRlc1tjdXJyZW50U3RhdGVJbmRleF0uc3RhdGU7XG4gICAgICAgIGN1cnJlbnRTdGF0ZUluZGV4ID0gMDtcbiAgICAgICAgY29tcHV0ZWRTdGF0ZXMgPSBbXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIEFjdGlvbnMuUk9MTEJBQ0s6IHtcbiAgICAgICAgLy8gRm9yZ2V0IGFib3V0IGFueSBzdGFnZWQgYWN0aW9ucy5cbiAgICAgICAgLy8gU3RhcnQgYWdhaW4gZnJvbSB0aGUgbGFzdCBjb21taXR0ZWQgc3RhdGUuXG4gICAgICAgIGFjdGlvbnNCeUlkID0geyAwOiBsaWZ0QWN0aW9uKElOSVRfQUNUSU9OKSB9O1xuICAgICAgICBuZXh0QWN0aW9uSWQgPSAxO1xuICAgICAgICBzdGFnZWRBY3Rpb25JZHMgPSBbMF07XG4gICAgICAgIHNraXBwZWRBY3Rpb25JZHMgPSBbXTtcbiAgICAgICAgY3VycmVudFN0YXRlSW5kZXggPSAwO1xuICAgICAgICBjb21wdXRlZFN0YXRlcyA9IFtdO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgQWN0aW9ucy5UT0dHTEVfQUNUSU9OOiB7XG4gICAgICAgIC8vIFRvZ2dsZSB3aGV0aGVyIGFuIGFjdGlvbiB3aXRoIGdpdmVuIElEIGlzIHNraXBwZWQuXG4gICAgICAgIC8vIEJlaW5nIHNraXBwZWQgbWVhbnMgaXQgaXMgYSBuby1vcCBkdXJpbmcgdGhlIGNvbXB1dGF0aW9uLlxuICAgICAgICBjb25zdCB7IGlkOiBhY3Rpb25JZCB9ID0gbGlmdGVkQWN0aW9uO1xuICAgICAgICBjb25zdCBpbmRleCA9IHNraXBwZWRBY3Rpb25JZHMuaW5kZXhPZihhY3Rpb25JZCk7XG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICBza2lwcGVkQWN0aW9uSWRzID0gW2FjdGlvbklkLCAuLi5za2lwcGVkQWN0aW9uSWRzXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBza2lwcGVkQWN0aW9uSWRzID0gc2tpcHBlZEFjdGlvbklkcy5maWx0ZXIoaWQgPT4gaWQgIT09IGFjdGlvbklkKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPcHRpbWl6YXRpb246IHdlIGtub3cgaGlzdG9yeSBiZWZvcmUgdGhpcyBhY3Rpb24gaGFzbid0IGNoYW5nZWRcbiAgICAgICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4ID0gc3RhZ2VkQWN0aW9uSWRzLmluZGV4T2YoYWN0aW9uSWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgQWN0aW9ucy5TRVRfQUNUSU9OU19BQ1RJVkU6IHtcbiAgICAgICAgLy8gVG9nZ2xlIHdoZXRoZXIgYW4gYWN0aW9uIHdpdGggZ2l2ZW4gSUQgaXMgc2tpcHBlZC5cbiAgICAgICAgLy8gQmVpbmcgc2tpcHBlZCBtZWFucyBpdCBpcyBhIG5vLW9wIGR1cmluZyB0aGUgY29tcHV0YXRpb24uXG4gICAgICAgIGNvbnN0IHsgc3RhcnQsIGVuZCwgYWN0aXZlIH0gPSBsaWZ0ZWRBY3Rpb247XG4gICAgICAgIGNvbnN0IGFjdGlvbklkcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykgYWN0aW9uSWRzLnB1c2goaSk7XG4gICAgICAgIGlmIChhY3RpdmUpIHtcbiAgICAgICAgICBza2lwcGVkQWN0aW9uSWRzID0gZGlmZmVyZW5jZShza2lwcGVkQWN0aW9uSWRzLCBhY3Rpb25JZHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNraXBwZWRBY3Rpb25JZHMgPSBbLi4uc2tpcHBlZEFjdGlvbklkcywgLi4uYWN0aW9uSWRzXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9wdGltaXphdGlvbjogd2Uga25vdyBoaXN0b3J5IGJlZm9yZSB0aGlzIGFjdGlvbiBoYXNuJ3QgY2hhbmdlZFxuICAgICAgICBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXggPSBzdGFnZWRBY3Rpb25JZHMuaW5kZXhPZihzdGFydCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBBY3Rpb25zLkpVTVBfVE9fU1RBVEU6IHtcbiAgICAgICAgLy8gV2l0aG91dCByZWNvbXB1dGluZyBhbnl0aGluZywgbW92ZSB0aGUgcG9pbnRlciB0aGF0IHRlbGwgdXNcbiAgICAgICAgLy8gd2hpY2ggc3RhdGUgaXMgY29uc2lkZXJlZCB0aGUgY3VycmVudCBvbmUuIFVzZWZ1bCBmb3Igc2xpZGVycy5cbiAgICAgICAgY3VycmVudFN0YXRlSW5kZXggPSBsaWZ0ZWRBY3Rpb24uaW5kZXg7XG4gICAgICAgIC8vIE9wdGltaXphdGlvbjogd2Uga25vdyB0aGUgaGlzdG9yeSBoYXMgbm90IGNoYW5nZWQuXG4gICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA9IEluZmluaXR5O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgQWN0aW9ucy5KVU1QX1RPX0FDVElPTjoge1xuICAgICAgICAvLyBKdW1wcyB0byBhIGNvcnJlc3BvbmRpbmcgc3RhdGUgdG8gYSBzcGVjaWZpYyBhY3Rpb24uXG4gICAgICAgIC8vIFVzZWZ1bCB3aGVuIGZpbHRlcmluZyBhY3Rpb25zLlxuICAgICAgICBjb25zdCBpbmRleCA9IHN0YWdlZEFjdGlvbklkcy5pbmRleE9mKGxpZnRlZEFjdGlvbi5hY3Rpb25JZCk7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIGN1cnJlbnRTdGF0ZUluZGV4ID0gaW5kZXg7XG4gICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA9IEluZmluaXR5O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgQWN0aW9ucy5TV0VFUDoge1xuICAgICAgICAvLyBGb3JnZXQgYW55IGFjdGlvbnMgdGhhdCBhcmUgY3VycmVudGx5IGJlaW5nIHNraXBwZWQuXG4gICAgICAgIHN0YWdlZEFjdGlvbklkcyA9IGRpZmZlcmVuY2Uoc3RhZ2VkQWN0aW9uSWRzLCBza2lwcGVkQWN0aW9uSWRzKTtcbiAgICAgICAgc2tpcHBlZEFjdGlvbklkcyA9IFtdO1xuICAgICAgICBjdXJyZW50U3RhdGVJbmRleCA9IE1hdGgubWluKFxuICAgICAgICAgIGN1cnJlbnRTdGF0ZUluZGV4LFxuICAgICAgICAgIHN0YWdlZEFjdGlvbklkcy5sZW5ndGggLSAxXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBBY3Rpb25zLlBFUkZPUk1fQUNUSU9OOiB7XG4gICAgICAgIC8vIEF1dG8tY29tbWl0IGFzIG5ldyBhY3Rpb25zIGNvbWUgaW4uXG4gICAgICAgIGlmIChvcHRpb25zLm1heEFnZSAmJiBzdGFnZWRBY3Rpb25JZHMubGVuZ3RoID09PSBvcHRpb25zLm1heEFnZSkge1xuICAgICAgICAgIGNvbW1pdEV4Y2Vzc0FjdGlvbnMoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3VycmVudFN0YXRlSW5kZXggPT09IHN0YWdlZEFjdGlvbklkcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgY3VycmVudFN0YXRlSW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhY3Rpb25JZCA9IG5leHRBY3Rpb25JZCsrO1xuICAgICAgICAvLyBNdXRhdGlvbiEgVGhpcyBpcyB0aGUgaG90dGVzdCBwYXRoLCBhbmQgd2Ugb3B0aW1pemUgb24gcHVycG9zZS5cbiAgICAgICAgLy8gSXQgaXMgc2FmZSBiZWNhdXNlIHdlIHNldCBhIG5ldyBrZXkgaW4gYSBjYWNoZSBkaWN0aW9uYXJ5LlxuICAgICAgICBhY3Rpb25zQnlJZFthY3Rpb25JZF0gPSBsaWZ0ZWRBY3Rpb247XG5cbiAgICAgICAgc3RhZ2VkQWN0aW9uSWRzID0gWy4uLnN0YWdlZEFjdGlvbklkcywgYWN0aW9uSWRdO1xuICAgICAgICAvLyBPcHRpbWl6YXRpb246IHdlIGtub3cgdGhhdCBvbmx5IHRoZSBuZXcgYWN0aW9uIG5lZWRzIGNvbXB1dGluZy5cbiAgICAgICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4ID0gc3RhZ2VkQWN0aW9uSWRzLmxlbmd0aCAtIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBBY3Rpb25zLklNUE9SVF9TVEFURToge1xuICAgICAgICAvLyBDb21wbGV0ZWx5IHJlcGxhY2UgZXZlcnl0aGluZy5cbiAgICAgICAgKHtcbiAgICAgICAgICBtb25pdG9yU3RhdGUsXG4gICAgICAgICAgYWN0aW9uc0J5SWQsXG4gICAgICAgICAgbmV4dEFjdGlvbklkLFxuICAgICAgICAgIHN0YWdlZEFjdGlvbklkcyxcbiAgICAgICAgICBza2lwcGVkQWN0aW9uSWRzLFxuICAgICAgICAgIGNvbW1pdHRlZFN0YXRlLFxuICAgICAgICAgIGN1cnJlbnRTdGF0ZUluZGV4LFxuICAgICAgICAgIGNvbXB1dGVkU3RhdGVzLFxuICAgICAgICB9ID0gbGlmdGVkQWN0aW9uLm5leHRMaWZ0ZWRTdGF0ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBJTklUOiB7XG4gICAgICAgIC8vIEFsd2F5cyByZWNvbXB1dGUgc3RhdGVzIG9uIGhvdCByZWxvYWQgYW5kIGluaXQuXG4gICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA9IDA7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubWF4QWdlICYmIHN0YWdlZEFjdGlvbklkcy5sZW5ndGggPiBvcHRpb25zLm1heEFnZSkge1xuICAgICAgICAgIC8vIFN0YXRlcyBtdXN0IGJlIHJlY29tcHV0ZWQgYmVmb3JlIGNvbW1pdHRpbmcgZXhjZXNzLlxuICAgICAgICAgIGNvbXB1dGVkU3RhdGVzID0gcmVjb21wdXRlU3RhdGVzKFxuICAgICAgICAgICAgY29tcHV0ZWRTdGF0ZXMsXG4gICAgICAgICAgICBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXgsXG4gICAgICAgICAgICByZWR1Y2VyLFxuICAgICAgICAgICAgY29tbWl0dGVkU3RhdGUsXG4gICAgICAgICAgICBhY3Rpb25zQnlJZCxcbiAgICAgICAgICAgIHN0YWdlZEFjdGlvbklkcyxcbiAgICAgICAgICAgIHNraXBwZWRBY3Rpb25JZHMsXG4gICAgICAgICAgICBlcnJvckhhbmRsZXJcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgY29tbWl0RXhjZXNzQWN0aW9ucyhzdGFnZWRBY3Rpb25JZHMubGVuZ3RoIC0gb3B0aW9ucy5tYXhBZ2UpO1xuXG4gICAgICAgICAgLy8gQXZvaWQgZG91YmxlIGNvbXB1dGF0aW9uLlxuICAgICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA9IEluZmluaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFVQREFURToge1xuICAgICAgICBjb25zdCBzdGF0ZUhhc0Vycm9ycyA9XG4gICAgICAgICAgY29tcHV0ZWRTdGF0ZXMuZmlsdGVyKHN0YXRlID0+IHN0YXRlLmVycm9yKS5sZW5ndGggPiAwO1xuXG4gICAgICAgIGlmIChzdGF0ZUhhc0Vycm9ycykge1xuICAgICAgICAgIC8vIFJlY29tcHV0ZSBhbGwgc3RhdGVzXG4gICAgICAgICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4ID0gMDtcblxuICAgICAgICAgIGlmIChvcHRpb25zLm1heEFnZSAmJiBzdGFnZWRBY3Rpb25JZHMubGVuZ3RoID4gb3B0aW9ucy5tYXhBZ2UpIHtcbiAgICAgICAgICAgIC8vIFN0YXRlcyBtdXN0IGJlIHJlY29tcHV0ZWQgYmVmb3JlIGNvbW1pdHRpbmcgZXhjZXNzLlxuICAgICAgICAgICAgY29tcHV0ZWRTdGF0ZXMgPSByZWNvbXB1dGVTdGF0ZXMoXG4gICAgICAgICAgICAgIGNvbXB1dGVkU3RhdGVzLFxuICAgICAgICAgICAgICBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXgsXG4gICAgICAgICAgICAgIHJlZHVjZXIsXG4gICAgICAgICAgICAgIGNvbW1pdHRlZFN0YXRlLFxuICAgICAgICAgICAgICBhY3Rpb25zQnlJZCxcbiAgICAgICAgICAgICAgc3RhZ2VkQWN0aW9uSWRzLFxuICAgICAgICAgICAgICBza2lwcGVkQWN0aW9uSWRzLFxuICAgICAgICAgICAgICBlcnJvckhhbmRsZXJcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbW1pdEV4Y2Vzc0FjdGlvbnMoc3RhZ2VkQWN0aW9uSWRzLmxlbmd0aCAtIG9wdGlvbnMubWF4QWdlKTtcblxuICAgICAgICAgICAgLy8gQXZvaWQgZG91YmxlIGNvbXB1dGF0aW9uLlxuICAgICAgICAgICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4ID0gSW5maW5pdHk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjdXJyZW50U3RhdGVJbmRleCA9PT0gc3RhZ2VkQWN0aW9uSWRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZUluZGV4Kys7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQWRkIGEgbmV3IGFjdGlvbiB0byBvbmx5IHJlY29tcHV0ZSBzdGF0ZVxuICAgICAgICAgIGNvbnN0IGFjdGlvbklkID0gbmV4dEFjdGlvbklkKys7XG4gICAgICAgICAgYWN0aW9uc0J5SWRbYWN0aW9uSWRdID0gbmV3IFBlcmZvcm1BY3Rpb24obGlmdGVkQWN0aW9uLCArRGF0ZS5ub3coKSk7XG4gICAgICAgICAgc3RhZ2VkQWN0aW9uSWRzID0gWy4uLnN0YWdlZEFjdGlvbklkcywgYWN0aW9uSWRdO1xuXG4gICAgICAgICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4ID0gc3RhZ2VkQWN0aW9uSWRzLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgICAvLyBTdGF0ZXMgbXVzdCBiZSByZWNvbXB1dGVkIGJlZm9yZSBjb21taXR0aW5nIGV4Y2Vzcy5cbiAgICAgICAgICBjb21wdXRlZFN0YXRlcyA9IHJlY29tcHV0ZVN0YXRlcyhcbiAgICAgICAgICAgIGNvbXB1dGVkU3RhdGVzLFxuICAgICAgICAgICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4LFxuICAgICAgICAgICAgcmVkdWNlcixcbiAgICAgICAgICAgIGNvbW1pdHRlZFN0YXRlLFxuICAgICAgICAgICAgYWN0aW9uc0J5SWQsXG4gICAgICAgICAgICBzdGFnZWRBY3Rpb25JZHMsXG4gICAgICAgICAgICBza2lwcGVkQWN0aW9uSWRzLFxuICAgICAgICAgICAgZXJyb3JIYW5kbGVyXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIC8vIFJlY29tcHV0ZSBzdGF0ZSBoaXN0b3J5IHdpdGggbGF0ZXN0IHJlZHVjZXIgYW5kIHVwZGF0ZSBhY3Rpb25cbiAgICAgICAgICBjb21wdXRlZFN0YXRlcyA9IGNvbXB1dGVkU3RhdGVzLm1hcChjbXAgPT4gKHtcbiAgICAgICAgICAgIC4uLmNtcCxcbiAgICAgICAgICAgIHN0YXRlOiByZWR1Y2VyKGNtcC5zdGF0ZSwgbGlmdGVkQWN0aW9uKSxcbiAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICBjdXJyZW50U3RhdGVJbmRleCA9IG1pbkludmFsaWRhdGVkU3RhdGVJbmRleDtcblxuICAgICAgICAgIGlmIChvcHRpb25zLm1heEFnZSAmJiBzdGFnZWRBY3Rpb25JZHMubGVuZ3RoID4gb3B0aW9ucy5tYXhBZ2UpIHtcbiAgICAgICAgICAgIGNvbW1pdEV4Y2Vzc0FjdGlvbnMoc3RhZ2VkQWN0aW9uSWRzLmxlbmd0aCAtIG9wdGlvbnMubWF4QWdlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBBdm9pZCBkb3VibGUgY29tcHV0YXRpb24uXG4gICAgICAgICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4ID0gSW5maW5pdHk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgLy8gSWYgdGhlIGFjdGlvbiBpcyBub3QgcmVjb2duaXplZCwgaXQncyBhIG1vbml0b3IgYWN0aW9uLlxuICAgICAgICAvLyBPcHRpbWl6YXRpb246IGEgbW9uaXRvciBhY3Rpb24gY2FuJ3QgY2hhbmdlIGhpc3RvcnkuXG4gICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA9IEluZmluaXR5O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wdXRlZFN0YXRlcyA9IHJlY29tcHV0ZVN0YXRlcyhcbiAgICAgIGNvbXB1dGVkU3RhdGVzLFxuICAgICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4LFxuICAgICAgcmVkdWNlcixcbiAgICAgIGNvbW1pdHRlZFN0YXRlLFxuICAgICAgYWN0aW9uc0J5SWQsXG4gICAgICBzdGFnZWRBY3Rpb25JZHMsXG4gICAgICBza2lwcGVkQWN0aW9uSWRzLFxuICAgICAgZXJyb3JIYW5kbGVyXG4gICAgKTtcbiAgICBtb25pdG9yU3RhdGUgPSBtb25pdG9yUmVkdWNlcihtb25pdG9yU3RhdGUsIGxpZnRlZEFjdGlvbik7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbW9uaXRvclN0YXRlLFxuICAgICAgYWN0aW9uc0J5SWQsXG4gICAgICBuZXh0QWN0aW9uSWQsXG4gICAgICBzdGFnZWRBY3Rpb25JZHMsXG4gICAgICBza2lwcGVkQWN0aW9uSWRzLFxuICAgICAgY29tbWl0dGVkU3RhdGUsXG4gICAgICBjdXJyZW50U3RhdGVJbmRleCxcbiAgICAgIGNvbXB1dGVkU3RhdGVzLFxuICAgIH07XG4gIH07XG59XG4iXX0=