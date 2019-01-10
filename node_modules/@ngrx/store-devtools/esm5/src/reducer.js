var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
import { UPDATE, INIT, } from '@ngrx/store';
import { difference, liftAction } from './utils';
import * as Actions from './actions';
import { PerformAction } from './actions';
export var INIT_ACTION = { type: INIT };
/**
 * Computes the next entry in the log by applying an action.
 */
function computeNextEntry(reducer, action, state, error, errorHandler) {
    if (error) {
        return {
            state: state,
            error: 'Interrupted by an error up the chain',
        };
    }
    var nextState = state;
    var nextError;
    try {
        nextState = reducer(state, action);
    }
    catch (err) {
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
 */
function recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler) {
    // Optimization: exit early and return the same reference
    // if we know nothing could have changed.
    if (minInvalidatedStateIndex >= computedStates.length &&
        computedStates.length === stagedActionIds.length) {
        return computedStates;
    }
    var nextComputedStates = computedStates.slice(0, minInvalidatedStateIndex);
    for (var i = minInvalidatedStateIndex; i < stagedActionIds.length; i++) {
        var actionId = stagedActionIds[i];
        var action = actionsById[actionId].action;
        var previousEntry = nextComputedStates[i - 1];
        var previousState = previousEntry ? previousEntry.state : committedState;
        var previousError = previousEntry ? previousEntry.error : undefined;
        var shouldSkip = skippedActionIds.indexOf(actionId) > -1;
        var entry = shouldSkip
            ? previousEntry
            : computeNextEntry(reducer, action, previousState, previousError, errorHandler);
        nextComputedStates.push(entry);
    }
    return nextComputedStates;
}
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
 */
export function liftReducerWith(initialCommittedState, initialLiftedState, errorHandler, monitorReducer, options) {
    if (options === void 0) { options = {}; }
    /**
       * Manages how the history actions modify the history state.
       */
    return function (reducer) {
        return function (liftedState, liftedAction) {
            var _a = liftedState || initialLiftedState, monitorState = _a.monitorState, actionsById = _a.actionsById, nextActionId = _a.nextActionId, stagedActionIds = _a.stagedActionIds, skippedActionIds = _a.skippedActionIds, committedState = _a.committedState, currentStateIndex = _a.currentStateIndex, computedStates = _a.computedStates;
            if (!liftedState) {
                // Prevent mutating initialLiftedState
                actionsById = Object.create(actionsById);
            }
            function commitExcessActions(n) {
                // Auto-commits n-number of excess actions.
                var excess = n;
                var idsToDelete = stagedActionIds.slice(1, excess + 1);
                for (var i = 0; i < idsToDelete.length; i++) {
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
                skippedActionIds = skippedActionIds.filter(function (id) { return idsToDelete.indexOf(id) === -1; });
                stagedActionIds = __spread([0], stagedActionIds.slice(excess + 1));
                committedState = computedStates[excess].state;
                computedStates = computedStates.slice(excess);
                currentStateIndex =
                    currentStateIndex > excess ? currentStateIndex - excess : 0;
            }
            // By default, aggressively recompute every state whatever happens.
            // This has O(n) performance, so we'll override this to a sensible
            // value whenever we feel like we don't have to recompute the states.
            var minInvalidatedStateIndex = 0;
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
                    var actionId_1 = liftedAction.id;
                    var index = skippedActionIds.indexOf(actionId_1);
                    if (index === -1) {
                        skippedActionIds = __spread([actionId_1], skippedActionIds);
                    }
                    else {
                        skippedActionIds = skippedActionIds.filter(function (id) { return id !== actionId_1; });
                    }
                    // Optimization: we know history before this action hasn't changed
                    minInvalidatedStateIndex = stagedActionIds.indexOf(actionId_1);
                    break;
                }
                case Actions.SET_ACTIONS_ACTIVE: {
                    // Toggle whether an action with given ID is skipped.
                    // Being skipped means it is a no-op during the computation.
                    var start = liftedAction.start, end = liftedAction.end, active = liftedAction.active;
                    var actionIds = [];
                    for (var i = start; i < end; i++)
                        actionIds.push(i);
                    if (active) {
                        skippedActionIds = difference(skippedActionIds, actionIds);
                    }
                    else {
                        skippedActionIds = __spread(skippedActionIds, actionIds);
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
                    var index = stagedActionIds.indexOf(liftedAction.actionId);
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
                    var actionId = nextActionId++;
                    // Mutation! This is the hottest path, and we optimize on purpose.
                    // It is safe because we set a new key in a cache dictionary.
                    actionsById[actionId] = liftedAction;
                    stagedActionIds = __spread(stagedActionIds, [actionId]);
                    // Optimization: we know that only the new action needs computing.
                    minInvalidatedStateIndex = stagedActionIds.length - 1;
                    break;
                }
                case Actions.IMPORT_STATE: {
                    // Completely replace everything.
                    (_b = liftedAction.nextLiftedState, monitorState = _b.monitorState, actionsById = _b.actionsById, nextActionId = _b.nextActionId, stagedActionIds = _b.stagedActionIds, skippedActionIds = _b.skippedActionIds, committedState = _b.committedState, currentStateIndex = _b.currentStateIndex, computedStates = _b.computedStates);
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
                    var stateHasErrors = computedStates.filter(function (state) { return state.error; }).length > 0;
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
                        var actionId = nextActionId++;
                        actionsById[actionId] = new PerformAction(liftedAction, +Date.now());
                        stagedActionIds = __spread(stagedActionIds, [actionId]);
                        minInvalidatedStateIndex = stagedActionIds.length - 1;
                        // States must be recomputed before committing excess.
                        computedStates = recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler);
                        // Recompute state history with latest reducer and update action
                        computedStates = computedStates.map(function (cmp) {
                            return (__assign({}, cmp, { state: reducer(cmp.state, liftedAction) }));
                        });
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
                monitorState: monitorState,
                actionsById: actionsById,
                nextActionId: nextActionId,
                stagedActionIds: stagedActionIds,
                skippedActionIds: skippedActionIds,
                committedState: committedState,
                currentStateIndex: currentStateIndex,
                computedStates: computedStates,
            };
            var _b;
        };
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkdWNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvc3RvcmUtZGV2dG9vbHMvc3JjL3JlZHVjZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE9BQU8sRUFLTCxNQUFNLEVBQ04sSUFBSSxHQUNMLE1BQU0sYUFBYSxDQUFDO0FBQ3JCLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2pELE9BQU8sS0FBSyxPQUFPLE1BQU0sV0FBVyxDQUFDO0FBRXJDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFhMUMsTUFBTSxDQUFDLElBQU0sV0FBVyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDOzs7O0FBOEIxQywwQkFDRSxPQUFnQyxFQUNoQyxNQUFjLEVBQ2QsS0FBVSxFQUNWLEtBQVUsRUFDVixZQUEwQjtJQUUxQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ1YsTUFBTSxDQUFDO1lBQ0wsS0FBSyxPQUFBO1lBQ0wsS0FBSyxFQUFFLHNDQUFzQztTQUM5QyxDQUFDO0tBQ0g7SUFFRCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDdEIsSUFBSSxTQUFTLENBQUM7SUFDZCxJQUFJLENBQUM7UUFDSCxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNwQztJQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2IsU0FBUyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQixZQUFZLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLENBQUM7S0FDNUM7SUFFRCxNQUFNLENBQUM7UUFDTCxLQUFLLEVBQUUsU0FBUztRQUNoQixLQUFL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QyxHQUFHLENBQUMsVUFBQSxHQUFHOzRCQUFJLE9BQUEsY0FDdEMsR0FBRyxJQUNOLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsSUFDdkM7d0JBSHlDLENBR3pDLENBQUMsQ0FBQzt3QkFFSixpQkFBaUIsR0FBRyx3QkFBd0IsQ0FBQzt3QkFFN0MsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDOzRCQUM5RCxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzt5QkFDOUQ7O3dCQUdELHdCQUF3QixHQUFHLFFBQVEsQ0FBQztxQkFDckM7b0JBRUQsS0FBSyxDQUFDO2lCQUNQO2dCQUNELFNBQVMsQ0FBQzs7O29CQUdSLHdCQUF3QixHQUFHLFFBQVEsQ0FBQztvQkFDcEMsS0FBSyxDQUFDO2lCQUNQO2FBQ0Y7WUFFRCxjQUFjLEdBQUcsZUFBZSxDQUM5QixjQUFjLEVBQ2Qsd0JBQXdCLEVBQ3hCLE9BQU8sRUFDUCxjQUFjLEVBQ2QsV0FBVyxFQUNYLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsWUFBWSxDQUNiLENBQUM7WUFDRixZQUFZLEdBQUcsY0FBYyxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztZQUUxRCxNQUFNLENBQUM7Z0JBQ0wsWUFBWSxjQUFBO2dCQUNaLFdBQVcsYUFBQTtnQkFDWCxZQUFZLGNBQUE7Z0JBQ1osZUFBZSxpQkFBQTtnQkFDZixnQkFBZ0Isa0JBQUE7Z0JBQ2hCLGNBQWMsZ0JBQUE7Z0JBQ2QsaUJBQWlCLG1CQUFBO2dCQUNqQixjQUFjLGdCQUFBO2FBQ2YsQ0FBQzs7U0FDSDtJQXhTeUMsQ0F3U3pDLENBQUM7Q0FDSCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVycm9ySGFuZGxlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgQWN0aW9uLFxuICBBY3Rpb25SZWR1Y2VyLFxuICBBY3Rpb25zU3ViamVjdCxcbiAgUmVkdWNlck1hbmFnZXIsXG4gIFVQREFURSxcbiAgSU5JVCxcbn0gZnJvbSAnQG5ncngvc3RvcmUnO1xuaW1wb3J0IHsgZGlmZmVyZW5jZSwgbGlmdEFjdGlvbiB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0ICogYXMgQWN0aW9ucyBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHsgU3RvcmVEZXZ0b29sc0NvbmZpZywgU3RhdGVTYW5pdGl6ZXIgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBQZXJmb3JtQWN0aW9uIH0gZnJvbSAnLi9hY3Rpb25zJztcblxuZXhwb3J0IHR5cGUgSW5pdEFjdGlvbiA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIElOSVQ7XG59O1xuXG5leHBvcnQgdHlwZSBVcGRhdGVSZWR1Y2VyQWN0aW9uID0ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgVVBEQVRFO1xufTtcblxuZXhwb3J0IHR5cGUgQ29yZUFjdGlvbnMgPSBJbml0QWN0aW9uIHwgVXBkYXRlUmVkdWNlckFjdGlvbjtcbmV4cG9ydCB0eXBlIEFjdGlvbnMgPSBBY3Rpb25zLkFsbCB8IENvcmVBY3Rpb25zO1xuXG5leHBvcnQgY29uc3QgSU5JVF9BQ1RJT04gPSB7IHR5cGU6IElOSVQgfTtcblxuZXhwb3J0IGludGVyZmFjZSBDb21wdXRlZFN0YXRlIHtcbiAgc3RhdGU6IGFueTtcbiAgZXJyb3I6IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMaWZ0ZWRBY3Rpb24ge1xuICB0eXBlOiBzdHJpbmc7XG4gIGFjdGlvbjogQWN0aW9uO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExpZnRlZEFjdGlvbnMge1xuICBbaWQ6IG51bWJlcl06IExpZnRlZEFjdGlvbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMaWZ0ZWRTdGF0ZSB7XG4gIG1vbml0b3JTdGF0ZTogYW55O1xuICBuZXh0QWN0aW9uSWQ6IG51bWJlcjtcbiAgYWN0aW9uc0J5SWQ6IExpZnRlZEFjdGlvbnM7XG4gIHN0YWdlZEFjdGlvbklkczogbnVtYmVyW107XG4gIHNraXBwZWRBY3Rpb25JZHM6IG51bWJlcltdO1xuICBjb21taXR0ZWRTdGF0ZTogYW55O1xuICBjdXJyZW50U3RhdGVJbmRleDogbnVtYmVyO1xuICBjb21wdXRlZFN0YXRlczogQ29tcHV0ZWRTdGF0ZVtdO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBuZXh0IGVudHJ5IGluIHRoZSBsb2cgYnkgYXBwbHlpbmcgYW4gYWN0aW9uLlxuICovXG5mdW5jdGlvbiBjb21wdXRlTmV4dEVudHJ5KFxuICByZWR1Y2VyOiBBY3Rpb25SZWR1Y2VyPGFueSwgYW55PixcbiAgYWN0aW9uOiBBY3Rpb24sXG4gIHN0YXRlOiBhbnksXG4gIGVycm9yOiBhbnksXG4gIGVycm9ySGFuZGxlcjogRXJyb3JIYW5kbGVyXG4pIHtcbiAgaWYgKGVycm9yKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXRlLFxuICAgICAgZXJyb3I6ICdJbnRlcnJ1cHRlZCBieSBhbiBlcnJvciB1cCB0aGUgY2hhaW4nLFxuICAgIH07XG4gIH1cblxuICBsZXQgbmV4dFN0YXRlID0gc3RhdGU7XG4gIGxldCBuZXh0RXJyb3I7XG4gIHRyeSB7XG4gICAgbmV4dFN0YXRlID0gcmVkdWNlcihzdGF0ZSwgYWN0aW9uKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgbmV4dEVycm9yID0gZXJyLnRvU3RyaW5nKCk7XG4gICAgZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKGVyci5zdGFjayB8fCBlcnIpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdGF0ZTogbmV4dFN0YXRlLFxuICAgIGVycm9yOiBuZXh0RXJyb3IsXG4gIH07XG59XG5cbi8qKlxuICogUnVucyB0aGUgcmVkdWNlciBvbiBpbnZhbGlkYXRlZCBhY3Rpb25zIHRvIGdldCBhIGZyZXNoIGNvbXB1dGF0aW9uIGxvZy5cbiAqL1xuZnVuY3Rpb24gcmVjb21wdXRlU3RhdGVzKFxuICBjb21wdXRlZFN0YXRlczogQ29tcHV0ZWRTdGF0ZVtdLFxuICBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXg6IG51bWJlcixcbiAgcmVkdWNlcjogQWN0aW9uUmVkdWNlcjxhbnksIGFueT4sXG4gIGNvbW1pdHRlZFN0YXRlOiBhbnksXG4gIGFjdGlvbnNCeUlkOiBMaWZ0ZWRBY3Rpb25zLFxuICBzdGFnZWRBY3Rpb25JZHM6IG51bWJlcltdLFxuICBza2lwcGVkQWN0aW9uSWRzOiBudW1iZXJbXSxcbiAgZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXJcbikge1xuICAvLyBPcHRpbWl6YXRpb246IGV4aXQgZWFybHkgYW5kIHJldHVybiB0aGUgc2FtZSByZWZlcmVuY2VcbiAgLy8gaWYgd2Uga25vdyBub3RoaW5nIGNvdWxkIGhhdmUgY2hhbmdlZC5cbiAgaWYgKFxuICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA+PSBjb21wdXRlZFN0YXRlcy5sZW5ndGggJiZcbiAgICBjb21wdXRlZFN0YXRlcy5sZW5ndGggPT09IHN0YWdlZEFjdGlvbklkcy5sZW5ndGhcbiAgKSB7XG4gICAgcmV0dXJuIGNvbXB1dGVkU3RhdGVzO1xuICB9XG5cbiAgY29uc3QgbmV4dENvbXB1dGVkU3RhdGVzID0gY29tcHV0ZWRTdGF0ZXMuc2xpY2UoMCwgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4KTtcbiAgZm9yIChsZXQgaSA9IG1pbkludmFsaWRhdGVkU3RhdGVJbmRleDsgaSA8IHN0YWdlZEFjdGlvbklkcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGFjdGlvbklkID0gc3RhZ2VkQWN0aW9uSWRzW2ldO1xuICAgIGNvbnN0IGFjdGlvbiA9IGFjdGlvbnNCeUlkW2FjdGlvbklkXS5hY3Rpb247XG5cbiAgICBjb25zdCBwcmV2aW91c0VudHJ5ID0gbmV4dENvbXB1dGVkU3RhdGVzW2kgLSAxXTtcbiAgICBjb25zdCBwcmV2aW91c1N0YXRlID0gcHJldmlvdXNFbnRyeSA/IHByZXZpb3VzRW50cnkuc3RhdGUgOiBjb21taXR0ZWRTdGF0ZTtcbiAgICBjb25zdCBwcmV2aW91c0Vycm9yID0gcHJldmlvdXNFbnRyeSA/IHByZXZpb3VzRW50cnkuZXJyb3IgOiB1bmRlZmluZWQ7XG5cbiAgICBjb25zdCBzaG91bGRTa2lwID0gc2tpcHBlZEFjdGlvbklkcy5pbmRleE9mKGFjdGlvbklkKSA+IC0xO1xuICAgIGNvbnN0IGVudHJ5OiBDb21wdXRlZFN0YXRlID0gc2hvdWxkU2tpcFxuICAgICAgPyBwcmV2aW91c0VudHJ5XG4gICAgICA6IGNvbXB1dGVOZXh0RW50cnkoXG4gICAgICAgICAgcmVkdWNlcixcbiAgICAgICAgICBhY3Rpb24sXG4gICAgICAgICAgcHJldmlvdXNTdGF0ZSxcbiAgICAgICAgICBwcmV2aW91c0Vycm9yLFxuICAgICAgICAgIGVycm9ySGFuZGxlclxuICAgICAgICApO1xuXG4gICAgbmV4dENvbXB1dGVkU3RhdGVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgcmV0dXJuIG5leHRDb21wdXRlZFN0YXRlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnRJbml0aWFsU3RhdGUoXG4gIGluaXRpYWxDb21taXR0ZWRTdGF0ZT86IGFueSxcbiAgbW9uaXRvclJlZHVjZXI/OiBhbnlcbik6IExpZnRlZFN0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICBtb25pdG9yU3RhdGU6IG1vbml0b3JSZWR1Y2VyKHVuZGVmaW5lZCwge30pLFxuICAgIG5leHRBY3Rpb25JZDogMSxcbiAgICBhY3Rpb25zQnlJZDogeyAwOiBsaWZ0QWN0aW9uKElOSVRfQUNUSU9OKSB9LFxuICAgIHN0YWdlZEFjdGlvbklkczogWzBdLFxuICAgIHNraXBwZWRBY3Rpb25JZHM6IFtdLFxuICAgIGNvbW1pdHRlZFN0YXRlOiBpbml0aWFsQ29tbWl0dGVkU3RhdGUsXG4gICAgY3VycmVudFN0YXRlSW5kZXg6IDAsXG4gICAgY29tcHV0ZWRTdGF0ZXM6IFtdLFxuICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBoaXN0b3J5IHN0YXRlIHJlZHVjZXIgZnJvbSBhbiBhcHAncyByZWR1Y2VyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlmdFJlZHVjZXJXaXRoKFxuICBpbml0aWFsQ29tbWl0dGVkU3RhdGU6IGFueSxcbiAgaW5pdGlhbExpZnRlZFN0YXRlOiBMaWZ0ZWRTdGF0ZSxcbiAgZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXIsXG4gIG1vbml0b3JSZWR1Y2VyPzogYW55LFxuICBvcHRpb25zOiBQYXJ0aWFsPFN0b3JlRGV2dG9vbHNDb25maWc+ID0ge31cbikge1xuICAvKipcbiAgICogTWFuYWdlcyBob3cgdGhlIGhpc3RvcnkgYWN0aW9ucyBtb2RpZnkgdGhlIGhpc3Rvcnkgc3RhdGUuXG4gICAqL1xuICByZXR1cm4gKFxuICAgIHJlZHVjZXI6IEFjdGlvblJlZHVjZXI8YW55LCBhbnk+XG4gICk6IEFjdGlvblJlZHVjZXI8TGlmdGVkU3RhdGUsIEFjdGlvbnM+ID0+IChsaWZ0ZWRTdGF0ZSwgbGlmdGVkQWN0aW9uKSA9PiB7XG4gICAgbGV0IHtcbiAgICAgIG1vbml0b3JTdGF0ZSxcbiAgICAgIGFjdGlvbnNCeUlkLFxuICAgICAgbmV4dEFjdGlvbklkLFxuICAgICAgc3RhZ2VkQWN0aW9uSWRzLFxuICAgICAgc2tpcHBlZEFjdGlvbklkcyxcbiAgICAgIGNvbW1pdHRlZFN0YXRlLFxuICAgICAgY3VycmVudFN0YXRlSW5kZXgsXG4gICAgICBjb21wdXRlZFN0YXRlcyxcbiAgICB9ID1cbiAgICAgIGxpZnRlZFN0YXRlIHx8IGluaXRpYWxMaWZ0ZWRTdGF0ZTtcblxuICAgIGlmICghbGlmdGVkU3RhdGUpIHtcbiAgICAgIC8vIFByZXZlbnQgbXV0YXRpbmcgaW5pdGlhbExpZnRlZFN0YXRlXG4gICAgICBhY3Rpb25zQnlJZCA9IE9iamVjdC5jcmVhdGUoYWN0aW9uc0J5SWQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbW1pdEV4Y2Vzc0FjdGlvbnMobjogbnVtYmVyKSB7XG4gICAgICAvLyBBdXRvLWNvbW1pdHMgbi1udW1iZXIgb2YgZXhjZXNzIGFjdGlvbnMuXG4gICAgICBsZXQgZXhjZXNzID0gbjtcbiAgICAgIGxldCBpZHNUb0RlbGV0ZSA9IHN0YWdlZEFjdGlvbklkcy5zbGljZSgxLCBleGNlc3MgKyAxKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpZHNUb0RlbGV0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY29tcHV0ZWRTdGF0ZXNbaSArIDFdLmVycm9yKSB7XG4gICAgICAgICAgLy8gU3RvcCBpZiBlcnJvciBpcyBmb3VuZC4gQ29tbWl0IGFjdGlvbnMgdXAgdG8gZXJyb3IuXG4gICAgICAgICAgZXhjZXNzID0gaTtcbiAgICAgICAgICBpZHNUb0RlbGV0ZSA9IHN0YWdlZEFjdGlvbklkcy5zbGljZSgxLCBleGNlc3MgKyAxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgYWN0aW9uc0J5SWRbaWRzVG9EZWxldGVbaV1dO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNraXBwZWRBY3Rpb25JZHMgPSBza2lwcGVkQWN0aW9uSWRzLmZpbHRlcihcbiAgICAgICAgaWQgPT4gaWRzVG9EZWxldGUuaW5kZXhPZihpZCkgPT09IC0xXG4gICAgICApO1xuICAgICAgc3RhZ2VkQWN0aW9uSWRzID0gWzAsIC4uLnN0YWdlZEFjdGlvbklkcy5zbGljZShleGNlc3MgKyAxKV07XG4gICAgICBjb21taXR0ZWRTdGF0ZSA9IGNvbXB1dGVkU3RhdGVzW2V4Y2Vzc10uc3RhdGU7XG4gICAgICBjb21wdXRlZFN0YXRlcyA9IGNvbXB1dGVkU3RhdGVzLnNsaWNlKGV4Y2Vzcyk7XG4gICAgICBjdXJyZW50U3RhdGVJbmRleCA9XG4gICAgICAgIGN1cnJlbnRTdGF0ZUluZGV4ID4gZXhjZXNzID8gY3VycmVudFN0YXRlSW5kZXggLSBleGNlc3MgOiAwO1xuICAgIH1cblxuICAgIC8vIEJ5IGRlZmF1bHQsIGFnZ3Jlc3NpdmVseSByZWNvbXB1dGUgZXZlcnkgc3RhdGUgd2hhdGV2ZXIgaGFwcGVucy5cbiAgICAvLyBUaGlzIGhhcyBPKG4pIHBlcmZvcm1hbmNlLCBzbyB3ZSdsbCBvdmVycmlkZSB0aGlzIHRvIGEgc2Vuc2libGVcbiAgICAvLyB2YWx1ZSB3aGVuZXZlciB3ZSBmZWVsIGxpa2Ugd2UgZG9uJ3QgaGF2ZSB0byByZWNvbXB1dGUgdGhlIHN0YXRlcy5cbiAgICBsZXQgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4ID0gMDtcblxuICAgIHN3aXRjaCAobGlmdGVkQWN0aW9uLnR5cGUpIHtcbiAgICAgIGNhc2UgQWN0aW9ucy5SRVNFVDoge1xuICAgICAgICAvLyBHZXQgYmFjayB0byB0aGUgc3RhdGUgdGhlIHN0b3JlIHdhcyBjcmVhdGVkIHdpdGguXG4gICAgICAgIGFjdGlvbnNCeUlkID0geyAwOiBsaWZ0QWN0aW9uKElOSVRfQUNUSU9OKSB9O1xuICAgICAgICBuZXh0QWN0aW9uSWQgPSAxO1xuICAgICAgICBzdGFnZWRBY3Rpb25JZHMgPSBbMF07XG4gICAgICAgIHNraXBwZWRBY3Rpb25JZHMgPSBbXTtcbiAgICAgICAgY29tbWl0dGVkU3RhdGUgPSBpbml0aWFsQ29tbWl0dGVkU3RhdGU7XG4gICAgICAgIGN1cnJlbnRTdGF0ZUluZGV4ID0gMDtcbiAgICAgICAgY29tcHV0ZWRTdGF0ZXMgPSBbXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIEFjdGlvbnMuQ09NTUlUOiB7XG4gICAgICAgIC8vIENvbnNpZGVyIHRoZSBsYXN0IGNvbW1pdHRlZCBzdGF0ZSB0aGUgbmV3IHN0YXJ0aW5nIHBvaW50LlxuICAgICAgICAvLyBTcXVhc2ggYW55IHN0YWdlZCBhY3Rpb25zIGludG8gYSBzaW5nbGUgY29tbWl0dGVkIHN0YXRlLlxuICAgICAgICBhY3Rpb25zQnlJZCA9IHsgMDogbGlmdEFjdGlvbihJTklUX0FDVElPTikgfTtcbiAgICAgICAgbmV4dEFjdGlvbklkID0gMTtcbiAgICAgICAgc3RhZ2VkQWN0aW9uSWRzID0gWzBdO1xuICAgICAgICBza2lwcGVkQWN0aW9uSWRzID0gW107XG4gICAgICAgIGNvbW1pdHRlZFN0YXRlID0gY29tcHV0ZWRTdGF0ZXNbY3VycmVudFN0YXRlSW5kZXhdLnN0YXRlO1xuICAgICAgICBjdXJyZW50U3RhdGVJbmRleCA9IDA7XG4gICAgICAgIGNvbXB1dGVkU3RhdGVzID0gW107XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBBY3Rpb25zLlJPTExCQUNLOiB7XG4gICAgICAgIC8vIEZvcmdldCBhYm91dCBhbnkgc3RhZ2VkIGFjdGlvbnMuXG4gICAgICAgIC8vIFN0YXJ0IGFnYWluIGZyb20gdGhlIGxhc3QgY29tbWl0dGVkIHN0YXRlLlxuICAgICAgICBhY3Rpb25zQnlJZCA9IHsgMDogbGlmdEFjdGlvbihJTklUX0FDVElPTikgfTtcbiAgICAgICAgbmV4dEFjdGlvbklkID0gMTtcbiAgICAgICAgc3RhZ2VkQWN0aW9uSWRzID0gWzBdO1xuICAgICAgICBza2lwcGVkQWN0aW9uSWRzID0gW107XG4gICAgICAgIGN1cnJlbnRTdGF0ZUluZGV4ID0gMDtcbiAgICAgICAgY29tcHV0ZWRTdGF0ZXMgPSBbXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIEFjdGlvbnMuVE9HR0xFX0FDVElPTjoge1xuICAgICAgICAvLyBUb2dnbGUgd2hldGhlciBhbiBhY3Rpb24gd2l0aCBnaXZlbiBJRCBpcyBza2lwcGVkLlxuICAgICAgICAvLyBCZWluZyBza2lwcGVkIG1lYW5zIGl0IGlzIGEgbm8tb3AgZHVyaW5nIHRoZSBjb21wdXRhdGlvbi5cbiAgICAgICAgY29uc3QgeyBpZDogYWN0aW9uSWQgfSA9IGxpZnRlZEFjdGlvbjtcbiAgICAgICAgY29uc3QgaW5kZXggPSBza2lwcGVkQWN0aW9uSWRzLmluZGV4T2YoYWN0aW9uSWQpO1xuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgc2tpcHBlZEFjdGlvbklkcyA9IFthY3Rpb25JZCwgLi4uc2tpcHBlZEFjdGlvbklkc107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2tpcHBlZEFjdGlvbklkcyA9IHNraXBwZWRBY3Rpb25JZHMuZmlsdGVyKGlkID0+IGlkICE9PSBhY3Rpb25JZCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3B0aW1pemF0aW9uOiB3ZSBrbm93IGhpc3RvcnkgYmVmb3JlIHRoaXMgYWN0aW9uIGhhc24ndCBjaGFuZ2VkXG4gICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA9IHN0YWdlZEFjdGlvbklkcy5pbmRleE9mKGFjdGlvbklkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIEFjdGlvbnMuU0VUX0FDVElPTlNfQUNUSVZFOiB7XG4gICAgICAgIC8vIFRvZ2dsZSB3aGV0aGVyIGFuIGFjdGlvbiB3aXRoIGdpdmVuIElEIGlzIHNraXBwZWQuXG4gICAgICAgIC8vIEJlaW5nIHNraXBwZWQgbWVhbnMgaXQgaXMgYSBuby1vcCBkdXJpbmcgdGhlIGNvbXB1dGF0aW9uLlxuICAgICAgICBjb25zdCB7IHN0YXJ0LCBlbmQsIGFjdGl2ZSB9ID0gbGlmdGVkQWN0aW9uO1xuICAgICAgICBjb25zdCBhY3Rpb25JZHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIGFjdGlvbklkcy5wdXNoKGkpO1xuICAgICAgICBpZiAoYWN0aXZlKSB7XG4gICAgICAgICAgc2tpcHBlZEFjdGlvbklkcyA9IGRpZmZlcmVuY2Uoc2tpcHBlZEFjdGlvbklkcywgYWN0aW9uSWRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBza2lwcGVkQWN0aW9uSWRzID0gWy4uLnNraXBwZWRBY3Rpb25JZHMsIC4uLmFjdGlvbklkc107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPcHRpbWl6YXRpb246IHdlIGtub3cgaGlzdG9yeSBiZWZvcmUgdGhpcyBhY3Rpb24gaGFzbid0IGNoYW5nZWRcbiAgICAgICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4ID0gc3RhZ2VkQWN0aW9uSWRzLmluZGV4T2Yoc3RhcnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgQWN0aW9ucy5KVU1QX1RPX1NUQVRFOiB7XG4gICAgICAgIC8vIFdpdGhvdXQgcmVjb21wdXRpbmcgYW55dGhpbmcsIG1vdmUgdGhlIHBvaW50ZXIgdGhhdCB0ZWxsIHVzXG4gICAgICAgIC8vIHdoaWNoIHN0YXRlIGlzIGNvbnNpZGVyZWQgdGhlIGN1cnJlbnQgb25lLiBVc2VmdWwgZm9yIHNsaWRlcnMuXG4gICAgICAgIGN1cnJlbnRTdGF0ZUluZGV4ID0gbGlmdGVkQWN0aW9uLmluZGV4O1xuICAgICAgICAvLyBPcHRpbWl6YXRpb246IHdlIGtub3cgdGhlIGhpc3RvcnkgaGFzIG5vdCBjaGFuZ2VkLlxuICAgICAgICBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIEFjdGlvbnMuSlVNUF9UT19BQ1RJT046IHtcbiAgICAgICAgLy8gSnVtcHMgdG8gYSBjb3JyZXNwb25kaW5nIHN0YXRlIHRvIGEgc3BlY2lmaWMgYWN0aW9uLlxuICAgICAgICAvLyBVc2VmdWwgd2hlbiBmaWx0ZXJpbmcgYWN0aW9ucy5cbiAgICAgICAgY29uc3QgaW5kZXggPSBzdGFnZWRBY3Rpb25JZHMuaW5kZXhPZihsaWZ0ZWRBY3Rpb24uYWN0aW9uSWQpO1xuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSBjdXJyZW50U3RhdGVJbmRleCA9IGluZGV4O1xuICAgICAgICBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIEFjdGlvbnMuU1dFRVA6IHtcbiAgICAgICAgLy8gRm9yZ2V0IGFueSBhY3Rpb25zIHRoYXQgYXJlIGN1cnJlbnRseSBiZWluZyBza2lwcGVkLlxuICAgICAgICBzdGFnZWRBY3Rpb25JZHMgPSBkaWZmZXJlbmNlKHN0YWdlZEFjdGlvbklkcywgc2tpcHBlZEFjdGlvbklkcyk7XG4gICAgICAgIHNraXBwZWRBY3Rpb25JZHMgPSBbXTtcbiAgICAgICAgY3VycmVudFN0YXRlSW5kZXggPSBNYXRoLm1pbihcbiAgICAgICAgICBjdXJyZW50U3RhdGVJbmRleCxcbiAgICAgICAgICBzdGFnZWRBY3Rpb25JZHMubGVuZ3RoIC0gMVxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgQWN0aW9ucy5QRVJGT1JNX0FDVElPTjoge1xuICAgICAgICAvLyBBdXRvLWNvbW1pdCBhcyBuZXcgYWN0aW9ucyBjb21lIGluLlxuICAgICAgICBpZiAob3B0aW9ucy5tYXhBZ2UgJiYgc3RhZ2VkQWN0aW9uSWRzLmxlbmd0aCA9PT0gb3B0aW9ucy5tYXhBZ2UpIHtcbiAgICAgICAgICBjb21taXRFeGNlc3NBY3Rpb25zKDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGN1cnJlbnRTdGF0ZUluZGV4ID09PSBzdGFnZWRBY3Rpb25JZHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIGN1cnJlbnRTdGF0ZUluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYWN0aW9uSWQgPSBuZXh0QWN0aW9uSWQrKztcbiAgICAgICAgLy8gTXV0YXRpb24hIFRoaXMgaXMgdGhlIGhvdHRlc3QgcGF0aCwgYW5kIHdlIG9wdGltaXplIG9uIHB1cnBvc2UuXG4gICAgICAgIC8vIEl0IGlzIHNhZmUgYmVjYXVzZSB3ZSBzZXQgYSBuZXcga2V5IGluIGEgY2FjaGUgZGljdGlvbmFyeS5cbiAgICAgICAgYWN0aW9uc0J5SWRbYWN0aW9uSWRdID0gbGlmdGVkQWN0aW9uO1xuXG4gICAgICAgIHN0YWdlZEFjdGlvbklkcyA9IFsuLi5zdGFnZWRBY3Rpb25JZHMsIGFjdGlvbklkXTtcbiAgICAgICAgLy8gT3B0aW1pemF0aW9uOiB3ZSBrbm93IHRoYXQgb25seSB0aGUgbmV3IGFjdGlvbiBuZWVkcyBjb21wdXRpbmcuXG4gICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA9IHN0YWdlZEFjdGlvbklkcy5sZW5ndGggLSAxO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgQWN0aW9ucy5JTVBPUlRfU1RBVEU6IHtcbiAgICAgICAgLy8gQ29tcGxldGVseSByZXBsYWNlIGV2ZXJ5dGhpbmcuXG4gICAgICAgICh7XG4gICAgICAgICAgbW9uaXRvclN0YXRlLFxuICAgICAgICAgIGFjdGlvbnNCeUlkLFxuICAgICAgICAgIG5leHRBY3Rpb25JZCxcbiAgICAgICAgICBzdGFnZWRBY3Rpb25JZHMsXG4gICAgICAgICAgc2tpcHBlZEFjdGlvbklkcyxcbiAgICAgICAgICBjb21taXR0ZWRTdGF0ZSxcbiAgICAgICAgICBjdXJyZW50U3RhdGVJbmRleCxcbiAgICAgICAgICBjb21wdXRlZFN0YXRlcyxcbiAgICAgICAgfSA9IGxpZnRlZEFjdGlvbi5uZXh0TGlmdGVkU3RhdGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgSU5JVDoge1xuICAgICAgICAvLyBBbHdheXMgcmVjb21wdXRlIHN0YXRlcyBvbiBob3QgcmVsb2FkIGFuZCBpbml0LlxuICAgICAgICBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXggPSAwO1xuXG4gICAgICAgIGlmIChvcHRpb25zLm1heEFnZSAmJiBzdGFnZWRBY3Rpb25JZHMubGVuZ3RoID4gb3B0aW9ucy5tYXhBZ2UpIHtcbiAgICAgICAgICAvLyBTdGF0ZXMgbXVzdCBiZSByZWNvbXB1dGVkIGJlZm9yZSBjb21taXR0aW5nIGV4Y2Vzcy5cbiAgICAgICAgICBjb21wdXRlZFN0YXRlcyA9IHJlY29tcHV0ZVN0YXRlcyhcbiAgICAgICAgICAgIGNvbXB1dGVkU3RhdGVzLFxuICAgICAgICAgICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4LFxuICAgICAgICAgICAgcmVkdWNlcixcbiAgICAgICAgICAgIGNvbW1pdHRlZFN0YXRlLFxuICAgICAgICAgICAgYWN0aW9uc0J5SWQsXG4gICAgICAgICAgICBzdGFnZWRBY3Rpb25JZHMsXG4gICAgICAgICAgICBza2lwcGVkQWN0aW9uSWRzLFxuICAgICAgICAgICAgZXJyb3JIYW5kbGVyXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGNvbW1pdEV4Y2Vzc0FjdGlvbnMoc3RhZ2VkQWN0aW9uSWRzLmxlbmd0aCAtIG9wdGlvbnMubWF4QWdlKTtcblxuICAgICAgICAgIC8vIEF2b2lkIGRvdWJsZSBjb21wdXRhdGlvbi5cbiAgICAgICAgICBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBVUERBVEU6IHtcbiAgICAgICAgY29uc3Qgc3RhdGVIYXNFcnJvcnMgPVxuICAgICAgICAgIGNvbXB1dGVkU3RhdGVzLmZpbHRlcihzdGF0ZSA9PiBzdGF0ZS5lcnJvcikubGVuZ3RoID4gMDtcblxuICAgICAgICBpZiAoc3RhdGVIYXNFcnJvcnMpIHtcbiAgICAgICAgICAvLyBSZWNvbXB1dGUgYWxsIHN0YXRlc1xuICAgICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA9IDA7XG5cbiAgICAgICAgICBpZiAob3B0aW9ucy5tYXhBZ2UgJiYgc3RhZ2VkQWN0aW9uSWRzLmxlbmd0aCA+IG9wdGlvbnMubWF4QWdlKSB7XG4gICAgICAgICAgICAvLyBTdGF0ZXMgbXVzdCBiZSByZWNvbXB1dGVkIGJlZm9yZSBjb21taXR0aW5nIGV4Y2Vzcy5cbiAgICAgICAgICAgIGNvbXB1dGVkU3RhdGVzID0gcmVjb21wdXRlU3RhdGVzKFxuICAgICAgICAgICAgICBjb21wdXRlZFN0YXRlcyxcbiAgICAgICAgICAgICAgbWluSW52YWxpZGF0ZWRTdGF0ZUluZGV4LFxuICAgICAgICAgICAgICByZWR1Y2VyLFxuICAgICAgICAgICAgICBjb21taXR0ZWRTdGF0ZSxcbiAgICAgICAgICAgICAgYWN0aW9uc0J5SWQsXG4gICAgICAgICAgICAgIHN0YWdlZEFjdGlvbklkcyxcbiAgICAgICAgICAgICAgc2tpcHBlZEFjdGlvbklkcyxcbiAgICAgICAgICAgICAgZXJyb3JIYW5kbGVyXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb21taXRFeGNlc3NBY3Rpb25zKHN0YWdlZEFjdGlvbklkcy5sZW5ndGggLSBvcHRpb25zLm1heEFnZSk7XG5cbiAgICAgICAgICAgIC8vIEF2b2lkIGRvdWJsZSBjb21wdXRhdGlvbi5cbiAgICAgICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA9IEluZmluaXR5O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY3VycmVudFN0YXRlSW5kZXggPT09IHN0YWdlZEFjdGlvbklkcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBjdXJyZW50U3RhdGVJbmRleCsrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEFkZCBhIG5ldyBhY3Rpb24gdG8gb25seSByZWNvbXB1dGUgc3RhdGVcbiAgICAgICAgICBjb25zdCBhY3Rpb25JZCA9IG5leHRBY3Rpb25JZCsrO1xuICAgICAgICAgIGFjdGlvbnNCeUlkW2FjdGlvbklkXSA9IG5ldyBQZXJmb3JtQWN0aW9uKGxpZnRlZEFjdGlvbiwgK0RhdGUubm93KCkpO1xuICAgICAgICAgIHN0YWdlZEFjdGlvbklkcyA9IFsuLi5zdGFnZWRBY3Rpb25JZHMsIGFjdGlvbklkXTtcblxuICAgICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA9IHN0YWdlZEFjdGlvbklkcy5sZW5ndGggLSAxO1xuXG4gICAgICAgICAgLy8gU3RhdGVzIG11c3QgYmUgcmVjb21wdXRlZCBiZWZvcmUgY29tbWl0dGluZyBleGNlc3MuXG4gICAgICAgICAgY29tcHV0ZWRTdGF0ZXMgPSByZWNvbXB1dGVTdGF0ZXMoXG4gICAgICAgICAgICBjb21wdXRlZFN0YXRlcyxcbiAgICAgICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCxcbiAgICAgICAgICAgIHJlZHVjZXIsXG4gICAgICAgICAgICBjb21taXR0ZWRTdGF0ZSxcbiAgICAgICAgICAgIGFjdGlvbnNCeUlkLFxuICAgICAgICAgICAgc3RhZ2VkQWN0aW9uSWRzLFxuICAgICAgICAgICAgc2tpcHBlZEFjdGlvbklkcyxcbiAgICAgICAgICAgIGVycm9ySGFuZGxlclxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAvLyBSZWNvbXB1dGUgc3RhdGUgaGlzdG9yeSB3aXRoIGxhdGVzdCByZWR1Y2VyIGFuZCB1cGRhdGUgYWN0aW9uXG4gICAgICAgICAgY29tcHV0ZWRTdGF0ZXMgPSBjb21wdXRlZFN0YXRlcy5tYXAoY21wID0+ICh7XG4gICAgICAgICAgICAuLi5jbXAsXG4gICAgICAgICAgICBzdGF0ZTogcmVkdWNlcihjbXAuc3RhdGUsIGxpZnRlZEFjdGlvbiksXG4gICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgY3VycmVudFN0YXRlSW5kZXggPSBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXg7XG5cbiAgICAgICAgICBpZiAob3B0aW9ucy5tYXhBZ2UgJiYgc3RhZ2VkQWN0aW9uSWRzLmxlbmd0aCA+IG9wdGlvbnMubWF4QWdlKSB7XG4gICAgICAgICAgICBjb21taXRFeGNlc3NBY3Rpb25zKHN0YWdlZEFjdGlvbklkcy5sZW5ndGggLSBvcHRpb25zLm1heEFnZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQXZvaWQgZG91YmxlIGNvbXB1dGF0aW9uLlxuICAgICAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCA9IEluZmluaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIC8vIElmIHRoZSBhY3Rpb24gaXMgbm90IHJlY29nbml6ZWQsIGl0J3MgYSBtb25pdG9yIGFjdGlvbi5cbiAgICAgICAgLy8gT3B0aW1pemF0aW9uOiBhIG1vbml0b3IgYWN0aW9uIGNhbid0IGNoYW5nZSBoaXN0b3J5LlxuICAgICAgICBtaW5JbnZhbGlkYXRlZFN0YXRlSW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29tcHV0ZWRTdGF0ZXMgPSByZWNvbXB1dGVTdGF0ZXMoXG4gICAgICBjb21wdXRlZFN0YXRlcyxcbiAgICAgIG1pbkludmFsaWRhdGVkU3RhdGVJbmRleCxcbiAgICAgIHJlZHVjZXIsXG4gICAgICBjb21taXR0ZWRTdGF0ZSxcbiAgICAgIGFjdGlvbnNCeUlkLFxuICAgICAgc3RhZ2VkQWN0aW9uSWRzLFxuICAgICAgc2tpcHBlZEFjdGlvbklkcyxcbiAgICAgIGVycm9ySGFuZGxlclxuICAgICk7XG4gICAgbW9uaXRvclN0YXRlID0gbW9uaXRvclJlZHVjZXIobW9uaXRvclN0YXRlLCBsaWZ0ZWRBY3Rpb24pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1vbml0b3JTdGF0ZSxcbiAgICAgIGFjdGlvbnNCeUlkLFxuICAgICAgbmV4dEFjdGlvbklkLFxuICAgICAgc3RhZ2VkQWN0aW9uSWRzLFxuICAgICAgc2tpcHBlZEFjdGlvbklkcyxcbiAgICAgIGNvbW1pdHRlZFN0YXRlLFxuICAgICAgY3VycmVudFN0YXRlSW5kZXgsXG4gICAgICBjb21wdXRlZFN0YXRlcyxcbiAgICB9O1xuICB9O1xufVxuIl19