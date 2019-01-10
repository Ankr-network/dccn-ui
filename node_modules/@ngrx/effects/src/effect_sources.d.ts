import { ErrorHandler } from '@angular/core';
import { Subject } from 'rxjs';
export declare class EffectSources extends Subject<any> {
    private errorHandler;
    constructor(errorHandler: ErrorHandler);
    addEffects(effectSourceInstance: any): void;
}
