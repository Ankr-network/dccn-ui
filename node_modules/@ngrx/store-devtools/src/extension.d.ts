import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { StoreDevtoolsConfig } from './config';
import { LiftedAction, LiftedState } from './reducer';
export declare const ExtensionActionTypes: {
    START: string;
    DISPATCH: string;
    STOP: string;
    ACTION: string;
};
export declare const REDUX_DEVTOOLS_EXTENSION: InjectionToken<ReduxDevtoolsExtension>;
export interface ReduxDevtoolsExtensionConnection {
    subscribe(listener: (change: any) => void): void;
    unsubscribe(): void;
    send(action: any, state: any): void;
    init(state?: any): void;
    error(anyErr: any): void;
}
export interface ReduxDevtoolsExtensionConfig {
    features?: object | boolean;
    name: string | undefined;
    instanceId: string;
    maxAge?: number;
    serialize?: boolean;
}
export interface ReduxDevtoolsExtension {
    connect(options: ReduxDevtoolsExtensionConfig): ReduxDevtoolsExtensionConnection;
    send(action: any, state: any, options: ReduxDevtoolsExtensionConfig, instanceId?: string): void;
}
export declare class DevtoolsExtension {
    private config;
    private instanceId;
    private devtoolsExtension;
    private extensionConnection;
    liftedActions$: Observable<any>;
    actions$: Observable<any>;
    start$: Observable<any>;
    constructor(devtoolsExtension: ReduxDevtoolsExtension, config: StoreDevtoolsConfig);
    notify(action: LiftedAction, state: LiftedState): void;
    private createChangesObservable();
    private createActionStreams();
    private unwrapAction(action);
    private getExtensionConfig(instanceId, config);
}
