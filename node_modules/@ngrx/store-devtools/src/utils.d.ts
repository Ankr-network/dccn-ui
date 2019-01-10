import { Action } from '@ngrx/store';
import * as Actions from './actions';
import { ActionSanitizer, StateSanitizer } from './config';
import { ComputedState, LiftedAction, LiftedActions, LiftedState } from './reducer';
export declare function difference(first: any[], second: any[]): any[];
/**
 * Provides an app's view into the state of the lifted store.
 */
export declare function unliftState(liftedState: LiftedState): any;
export declare function unliftAction(liftedState: LiftedState): LiftedAction;
/**
 * Lifts an app's action into an action on the lifted store.
 */
export declare function liftAction(action: Action): Actions.PerformAction;
/**
 * Sanitizes given actions with given function.
 */
export declare function sanitizeActions(actionSanitizer: ActionSanitizer, actions: LiftedActions): LiftedActions;
/**
 * Sanitizes given action with given function.
 */
export declare function sanitizeAction(actionSanitizer: ActionSanitizer, action: LiftedAction, actionIdx: number): LiftedAction;
/**
 * Sanitizes given states with given function.
 */
export declare function sanitizeStates(stateSanitizer: StateSanitizer, states: ComputedState[]): ComputedState[];
/**
 * Sanitizes given state with given function.
 */
export declare function sanitizeState(stateSanitizer: StateSanitizer, state: any, stateIdx: number): any;
