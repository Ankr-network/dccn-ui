/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
export const /** @type {?} */ PERFORM_ACTION = 'PERFORM_ACTION';
export const /** @type {?} */ REFRESH = 'REFRESH';
export const /** @type {?} */ RESET = 'RESET';
export const /** @type {?} */ ROLLBACK = 'ROLLBACK';
export const /** @type {?} */ COMMIT = 'COMMIT';
export const /** @type {?} */ SWEEP = 'SWEEP';
export const /** @type {?} */ TOGGLE_ACTION = 'TOGGLE_ACTION';
export const /** @type {?} */ SET_ACTIONS_ACTIVE = 'SET_ACTIONS_ACTIVE';
export const /** @type {?} */ JUMP_TO_STATE = 'JUMP_TO_STATE';
export const /** @type {?} */ JUMP_TO_ACTION = 'JUMP_TO_ACTION';
export const /** @type {?} */ IMPORT_STATE = 'IMPORT_STATE';
export class PerformAction {
    /**
     * @param {?} action
     * @param {?} timestamp
     */
    constructor(action, timestamp) {
        this.action = action;
        this.timestamp = timestamp;
        this.type = PERFORM_ACTION;
        if (typeof action.type === 'undefined') {
            throw new Error('Actions may not have an undefined "type" property. ' +
                'Have you misspelled a constant?');
        }
    }
}
function PerformAction_tsickle_Closure_declarations() {
    /** @type {?} */
    PerformAction.prototype.type;
    /** @type {?} */
    PerformAction.prototype.action;
    /** @type {?} */
    PerformAction.prototype.timestamp;
}
export class Refresh {
    constructor() {
        this.type = REFRESH;
    }
}
function Refresh_tsickle_Closure_declarations() {
    /** @type {?} */
    Refresh.prototype.type;
}
export class Reset {
    /**
     * @param {?} timestamp
     */
    constructor(timestamp) {
        this.timestamp = timestamp;
        this.type = RESET;
    }
}
function Reset_tsickle_Closure_declarations() {
    /** @type {?} */
    Reset.prototype.type;
    /** @type {?} */
    Reset.prototype.timestamp;
}
export class Rollback {
    /**
     * @param {?} timestamp
     */
    constructor(timestamp) {
        this.timestamp = timestamp;
        this.type = ROLLBACK;
    }
}
function Rollback_tsickle_Closure_declarations() {
    /** @type {?} */
    Rollback.prototype.type;
    /** @type {?} */
    Rollback.prototype.timestamp;
}
export class Commit {
    /**
     * @param {?} timestamp
     */
    constructor(timestamp) {
        this.timestamp = timestamp;
        this.type = COMMIT;
    }
}
function Commit_tsickle_Closure_declarations() {
    /** @type {?} */
    Commit.prototype.type;
    /** @type {?} */
    Commit.prototype.timestamp;
}
export class Sweep {
    constructor() {
        this.type = SWEEP;
    }
}
function Sweep_tsickle_Closure_declarations() {
    /** @type {?} */
    Sweep.prototype.type;
}
export class ToggleAction {
    /**
     * @param {?} id
     */
    constructor(id) {
        this.id = id;
        this.type = TOGGLE_ACTION;
    }
}
function ToggleAction_tsickle_Closure_declarations() {
    /** @type {?} */
    ToggleAction.prototype.type;
    /** @type {?} */
    ToggleAction.prototype.id;
}
export class SetActionsActive {
    /**
     * @param {?} start
     * @param {?} end
     * @param {?=} active
     */
    constructor(start, end, active = true) {
        this.start = start;
        this.end = end;
        this.active = active;
        this.type = SET_ACTIONS_ACTIVE;
    }
}
function SetActionsActive_tsickle_Closure_declarations() {
    /** @type {?} */
    SetActionsActive.prototype.type;
    /** @type {?} */
    SetActionsActive.prototype.start;
    /** @type {?} */
    SetActionsActive.prototype.end;
    /** @type {?} */
    SetActionsActive.prototype.active;
}
export class JumpToState {
    /**
     * @param {?} index
     */
    constructor(index) {
        this.index = index;
        this.type = JUMP_TO_STATE;
    }
}
function JumpToState_tsickle_Closure_declarations() {
    /** @type {?} */
    JumpToState.prototype.type;
    /** @type {?} */
    JumpToState.prototype.index;
}
export class JumpToAction {
    /**
     * @param {?} actionId
     */
    constructor(actionId) {
        this.actionId = actionId;
        this.type = JUMP_TO_ACTION;
    }
}
function JumpToAction_tsickle_Closure_declarations() {
    /** @type {?} */
    JumpToAction.prototype.type;
    /** @type {?} */
    JumpToAction.prototype.actionId;
}
export class ImportState {
    /**
     * @param {?} nextLiftedState
     */
    constructor(nextLiftedState) {
        this.nextLiftedState = nextLiftedState;
        this.type = IMPORT_STATE;
    }
}
function ImportState_tsickle_Closure_declarations() {
    /** @type {?} */
    ImportState.prototype.type;
    /** @type {?} */
    ImportState.prototype.nextLiftedState;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvc3RvcmUtZGV2dG9vbHMvc3JjL2FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLE1BQU0sQ0FBQyx1QkFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUM7QUFDL0MsTUFBTSxDQUFDLHVCQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFDakMsTUFBTSxDQUFDLHVCQUFNLEtBQUssR0FBRyxPQUFPLENBQUM7QUFDN0IsTUFBTSxDQUFDLHVCQUFNLFFBQVEsR0FBRyxVQUFVLENBQUM7QUFDbkMsTUFBTSxDQUFDLHVCQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDL0IsTUFBTSxDQUFDLHVCQUFNLEtBQUssR0FBRyxPQUFPLENBQUM7QUFDN0IsTUFBTSxDQUFDLHVCQUFNLGFBQWEsR0FBRyxlQUFlLENBQUM7QUFDN0MsTUFBTSxDQUFDLHVCQUFNLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDO0FBQ3ZELE1BQU0sQ0FBQyx1QkFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDO0FBQzdDLE1BQU0sQ0FBQyx1QkFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUM7QUFDL0MsTUFBTSxDQUFDLHVCQUFNLFlBQVksR0FBRyxjQUFjLENBQUM7QUFFM0MsTUFBTTs7Ozs7SUFHSixZQUFtQixNQUFjLEVBQVMsU0FBaUI7UUFBeEMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVE7b0JBRjNDLGNBQWM7UUFHNUIsRUFBRSxDQUFDLENBQUMsT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FDYixxREFBcUQ7Z0JBQ25ELGlDQUFpQyxDQUNwQyxDQUFDO1NBQ0g7S0FDRjtDQUNGOzs7Ozs7Ozs7QUFFRCxNQUFNOztvQkFDWSxPQUFPOztDQUN4Qjs7Ozs7QUFFRCxNQUFNOzs7O0lBR0osWUFBbUIsU0FBaUI7UUFBakIsY0FBUyxHQUFULFNBQVMsQ0FBUTtvQkFGcEIsS0FBSztLQUVtQjtDQUN6Qzs7Ozs7OztBQUVELE1BQU07Ozs7SUFHSixZQUFtQixTQUFpQjtRQUFqQixjQUFTLEdBQVQsU0FBUyxDQUFRO29CQUZwQixRQUFRO0tBRWdCO0NBQ3pDOzs7Ozs7O0FBRUQsTUFBTTs7OztJQUdKLFlBQW1CLFNBQWlCO1FBQWpCLGNBQVMsR0FBVCxTQUFTLENBQVE7b0JBRnBCLE1BQU07S0FFa0I7Q0FDekM7Ozs7Ozs7QUFFRCxNQUFNOztvQkFDWSxLQUFLOztDQUN0Qjs7Ozs7QUFFRCxNQUFNOzs7O0lBR0osWUFBbUIsRUFBVTtRQUFWLE9BQUUsR0FBRixFQUFFLENBQVE7b0JBRmIsYUFBYTtLQUVJO0NBQ2xDOzs7Ozs7O0FBRUQsTUFBTTs7Ozs7O0lBR0osWUFDUyxPQUNBLEtBQ0EsU0FBa0IsSUFBSTtRQUZ0QixVQUFLLEdBQUwsS0FBSztRQUNMLFFBQUcsR0FBSCxHQUFHO1FBQ0gsV0FBTSxHQUFOLE1BQU07b0JBTEMsa0JBQWtCO0tBTTlCO0NBQ0w7Ozs7Ozs7Ozs7O0FBRUQsTUFBTTs7OztJQUdKLFlBQW1CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO29CQUZoQixhQUFhO0tBRU87Q0FDckM7Ozs7Ozs7QUFFRCxNQUFNOzs7O0lBR0osWUFBbUIsUUFBZ0I7UUFBaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtvQkFGbkIsY0FBYztLQUVTO0NBQ3hDOzs7Ozs7O0FBRUQsTUFBTTs7OztJQUdKLFlBQW1CLGVBQW9CO1FBQXBCLG9CQUFlLEdBQWYsZUFBZSxDQUFLO29CQUZ2QixZQUFZO0tBRWU7Q0FDNUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBY3Rpb24gfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5cbmV4cG9ydCBjb25zdCBQRVJGT1JNX0FDVElPTiA9ICdQRVJGT1JNX0FDVElPTic7XG5leHBvcnQgY29uc3QgUkVGUkVTSCA9ICdSRUZSRVNIJztcbmV4cG9ydCBjb25zdCBSRVNFVCA9ICdSRVNFVCc7XG5leHBvcnQgY29uc3QgUk9MTEJBQ0sgPSAnUk9MTEJBQ0snO1xuZXhwb3J0IGNvbnN0IENPTU1JVCA9ICdDT01NSVQnO1xuZXhwb3J0IGNvbnN0IFNXRUVQID0gJ1NXRUVQJztcbmV4cG9ydCBjb25zdCBUT0dHTEVfQUNUSU9OID0gJ1RPR0dMRV9BQ1RJT04nO1xuZXhwb3J0IGNvbnN0IFNFVF9BQ1RJT05TX0FDVElWRSA9ICdTRVRfQUNUSU9OU19BQ1RJVkUnO1xuZXhwb3J0IGNvbnN0IEpVTVBfVE9fU1RBVEUgPSAnSlVNUF9UT19TVEFURSc7XG5leHBvcnQgY29uc3QgSlVNUF9UT19BQ1RJT04gPSAnSlVNUF9UT19BQ1RJT04nO1xuZXhwb3J0IGNvbnN0IElNUE9SVF9TVEFURSA9ICdJTVBPUlRfU1RBVEUnO1xuXG5leHBvcnQgY2xhc3MgUGVyZm9ybUFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIHJlYWRvbmx5IHR5cGUgPSBQRVJGT1JNX0FDVElPTjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgYWN0aW9uOiBBY3Rpb24sIHB1YmxpYyB0aW1lc3RhbXA6IG51bWJlcikge1xuICAgIGlmICh0eXBlb2YgYWN0aW9uLnR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdBY3Rpb25zIG1heSBub3QgaGF2ZSBhbiB1bmRlZmluZWQgXCJ0eXBlXCIgcHJvcGVydHkuICcgK1xuICAgICAgICAgICdIYXZlIHlvdSBtaXNzcGVsbGVkIGEgY29uc3RhbnQ/J1xuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlZnJlc2ggaW1wbGVtZW50cyBBY3Rpb24ge1xuICByZWFkb25seSB0eXBlID0gUkVGUkVTSDtcbn1cblxuZXhwb3J0IGNsYXNzIFJlc2V0IGltcGxlbWVudHMgQWN0aW9uIHtcbiAgcmVhZG9ubHkgdHlwZSA9IFJFU0VUO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0aW1lc3RhbXA6IG51bWJlcikge31cbn1cblxuZXhwb3J0IGNsYXNzIFJvbGxiYWNrIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgcmVhZG9ubHkgdHlwZSA9IFJPTExCQUNLO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0aW1lc3RhbXA6IG51bWJlcikge31cbn1cblxuZXhwb3J0IGNsYXNzIENvbW1pdCBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIHJlYWRvbmx5IHR5cGUgPSBDT01NSVQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHRpbWVzdGFtcDogbnVtYmVyKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgU3dlZXAgaW1wbGVtZW50cyBBY3Rpb24ge1xuICByZWFkb25seSB0eXBlID0gU1dFRVA7XG59XG5cbmV4cG9ydCBjbGFzcyBUb2dnbGVBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICByZWFkb25seSB0eXBlID0gVE9HR0xFX0FDVElPTjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgaWQ6IG51bWJlcikge31cbn1cblxuZXhwb3J0IGNsYXNzIFNldEFjdGlvbnNBY3RpdmUgaW1wbGVtZW50cyBBY3Rpb24ge1xuICByZWFkb25seSB0eXBlID0gU0VUX0FDVElPTlNfQUNUSVZFO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBzdGFydDogbnVtYmVyLFxuICAgIHB1YmxpYyBlbmQ6IG51bWJlcixcbiAgICBwdWJsaWMgYWN0aXZlOiBib29sZWFuID0gdHJ1ZVxuICApIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBKdW1wVG9TdGF0ZSBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIHJlYWRvbmx5IHR5cGUgPSBKVU1QX1RPX1NUQVRFO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgSnVtcFRvQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgcmVhZG9ubHkgdHlwZSA9IEpVTVBfVE9fQUNUSU9OO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBhY3Rpb25JZDogbnVtYmVyKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgSW1wb3J0U3RhdGUgaW1wbGVtZW50cyBBY3Rpb24ge1xuICByZWFkb25seSB0eXBlID0gSU1QT1JUX1NUQVRFO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuZXh0TGlmdGVkU3RhdGU6IGFueSkge31cbn1cblxuZXhwb3J0IHR5cGUgQWxsID1cbiAgfCBQZXJmb3JtQWN0aW9uXG4gIHwgUmVmcmVzaFxuICB8IFJlc2V0XG4gIHwgUm9sbGJhY2tcbiAgfCBDb21taXRcbiAgfCBTd2VlcFxuICB8IFRvZ2dsZUFjdGlvblxuICB8IFNldEFjdGlvbnNBY3RpdmVcbiAgfCBKdW1wVG9TdGF0ZVxuICB8IEp1bXBUb0FjdGlvblxuICB8IEltcG9ydFN0YXRlO1xuIl19