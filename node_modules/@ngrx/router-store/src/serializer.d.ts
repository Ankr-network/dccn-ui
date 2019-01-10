import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
export declare abstract class RouterStateSerializer<T> {
    abstract serialize(routerState: RouterStateSnapshot): T;
}
export interface SerializedRouterStateSnapshot {
    root: ActivatedRouteSnapshot;
    url: string;
}
export declare class DefaultRouterStateSerializer implements RouterStateSerializer<SerializedRouterStateSnapshot> {
    serialize(routerState: RouterStateSnapshot): SerializedRouterStateSnapshot;
    private serializeRoute(route);
}
