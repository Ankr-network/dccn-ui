import { ActionReducer, Action } from '@ngrx/store';
import { InjectionToken } from '@angular/core';
export declare type ActionSanitizer = (action: Action, id: number) => Action;
export declare type StateSanitizer = (state: any, index: number) => any;
export declare class StoreDevtoolsConfig {
    maxAge: number | false;
    monitor: ActionReducer<any, any>;
    actionSanitizer?: ActionSanitizer;
    stateSanitizer?: StateSanitizer;
    name?: string;
    serialize?: boolean;
    logOnly?: boolean;
    features?: any;
}
export declare const STORE_DEVTOOLS_CONFIG: InjectionToken<StoreDevtoolsConfig>;
export declare const INITIAL_OPTIONS: InjectionToken<StoreDevtoolsConfig>;
export declare type StoreDevtoolsOptions = Partial<StoreDevtoolsConfig> | (() => Partial<StoreDevtoolsConfig>);
