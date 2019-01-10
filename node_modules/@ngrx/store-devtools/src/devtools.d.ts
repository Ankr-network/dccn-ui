import { ErrorHandler } from '@angular/core';
import { Action, ActionsSubject, ReducerObservable, ScannedActionsSubject } from '@ngrx/store';
import { Observable, Observer } from 'rxjs';
import { StoreDevtoolsConfig } from './config';
import { DevtoolsExtension } from './extension';
import { LiftedState } from './reducer';
export declare class DevtoolsDispatcher extends ActionsSubject {
}
export declare class StoreDevtools implements Observer<any> {
    private stateSubscription;
    private extensionStartSubscription;
    dispatcher: ActionsSubject;
    liftedState: Observable<LiftedState>;
    state: Observable<any>;
    constructor(dispatcher: DevtoolsDispatcher, actions$: ActionsSubject, reducers$: ReducerObservable, extension: DevtoolsExtension, scannedActions: ScannedActionsSubject, errorHandler: ErrorHandler, initialState: any, config: StoreDevtoolsConfig);
    dispatch(action: Action): void;
    next(action: any): void;
    error(error: any): void;
    complete(): void;
    performAction(action: any): void;
    refresh(): void;
    reset(): void;
    rollback(): void;
    commit(): void;
    sweep(): void;
    toggleAction(id: number): void;
    jumpToAction(actionId: number): void;
    jumpToState(index: number): void;
    importState(nextLiftedState: any): void;
}
