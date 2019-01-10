import { ActionReducer, Action } from '@ngrx/store';
/**
 * Meta-reducer that prevents state from being mutated anywhere in the app.
 */
export declare function storeFreeze<T, V extends Action = Action>(reducer: ActionReducer<T, V>): ActionReducer<T, V>;
