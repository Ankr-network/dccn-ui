import { Observable } from 'rxjs';
import { EffectNotification } from './effect_notification';
export declare function mergeEffects(sourceInstance: any): Observable<EffectNotification>;
export declare function resolveEffectSource(sourceInstance: any): Observable<EffectNotification>;
