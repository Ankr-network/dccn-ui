/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @abstract
 * @template T
 */
export class RouterStateSerializer {
}
function RouterStateSerializer_tsickle_Closure_declarations() {
    /**
     * @abstract
     * @param {?} routerState
     * @return {?}
     */
    RouterStateSerializer.prototype.serialize = function (routerState) { };
}
/**
 * @record
 */
export function SerializedRouterStateSnapshot() { }
function SerializedRouterStateSnapshot_tsickle_Closure_declarations() {
    /** @type {?} */
    SerializedRouterStateSnapshot.prototype.root;
    /** @type {?} */
    SerializedRouterStateSnapshot.prototype.url;
}
export class DefaultRouterStateSerializer {
    /**
     * @param {?} routerState
     * @return {?}
     */
    serialize(routerState) {
        return {
            root: this.serializeRoute(routerState.root),
            url: routerState.url,
        };
    }
    /**
     * @param {?} route
     * @return {?}
     */
    serializeRoute(route) {
        const /** @type {?} */ children = route.children.map(c => this.serializeRoute(c));
        return {
            params: route.params,
            paramMap: route.paramMap,
            data: route.data,
            url: route.url,
            outlet: route.outlet,
            routeConfig: {
                component: route.routeConfig ? route.routeConfig.component : undefined,
            },
            queryParams: route.queryParams,
            queryParamMap: route.queryParamMap,
            fragment: route.fragment,
            component: /** @type {?} */ ((route.routeConfig
                ? route.routeConfig.component
                : undefined)),
            root: /** @type {?} */ (undefined),
            parent: /** @type {?} */ (undefined),
            firstChild: children[0],
            pathFromRoot: /** @type {?} */ (undefined),
            children,
        };
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvcm91dGVyLXN0b3JlL3NyYy9zZXJpYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBRUEsTUFBTTtDQUVMOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBT0QsTUFBTTs7Ozs7SUFFSixTQUFTLENBQUMsV0FBZ0M7UUFDeEMsTUFBTSxDQUFDO1lBQ0wsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztZQUMzQyxHQUFHLEVBQUUsV0FBVyxDQUFDLEdBQUc7U0FDckIsQ0FBQztLQUNIOzs7OztJQUVPLGNBQWMsQ0FDcEIsS0FBNkI7UUFFN0IsdUJBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sQ0FBQztZQUNMLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7WUFDeEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1lBQ2hCLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztZQUNkLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixXQUFXLEVBQUU7Z0JBQ1gsU0FBUyxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTO2FBQ3ZFO1lBQ0QsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXO1lBQzlCLGFBQWEsRUFBRSxLQUFLLENBQUMsYUFBYTtZQUNsQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7WUFDeEIsU0FBUyxvQkFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXO2dCQUMzQixDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTO2dCQUM3QixDQUFDLENBQUMsU0FBUyxDQUFRLENBQUE7WUFDckIsSUFBSSxvQkFBRSxTQUFnQixDQUFBO1lBQ3RCLE1BQU0sb0JBQUUsU0FBZ0IsQ0FBQTtZQUN4QixVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN2QixZQUFZLG9CQUFFLFNBQWdCLENBQUE7WUFDOUIsUUFBUTtTQUNULENBQUM7O0NBRUwiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBSb3V0ZXJTdGF0ZVNuYXBzaG90IH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJvdXRlclN0YXRlU2VyaWFsaXplcjxUPiB7XG4gIGFic3RyYWN0IHNlcmlhbGl6ZShyb3V0ZXJTdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCk6IFQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Qge1xuICByb290OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90O1xuICB1cmw6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRSb3V0ZXJTdGF0ZVNlcmlhbGl6ZXJcbiAgaW1wbGVtZW50cyBSb3V0ZXJTdGF0ZVNlcmlhbGl6ZXI8U2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Q+IHtcbiAgc2VyaWFsaXplKHJvdXRlclN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90KTogU2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Qge1xuICAgIHJldHVybiB7XG4gICAgICByb290OiB0aGlzLnNlcmlhbGl6ZVJvdXRlKHJvdXRlclN0YXRlLnJvb3QpLFxuICAgICAgdXJsOiByb3V0ZXJTdGF0ZS51cmwsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgc2VyaWFsaXplUm91dGUoXG4gICAgcm91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3RcbiAgKTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSByb3V0ZS5jaGlsZHJlbi5tYXAoYyA9PiB0aGlzLnNlcmlhbGl6ZVJvdXRlKGMpKTtcbiAgICByZXR1cm4ge1xuICAgICAgcGFyYW1zOiByb3V0ZS5wYXJhbXMsXG4gICAgICBwYXJhbU1hcDogcm91dGUucGFyYW1NYXAsXG4gICAgICBkYXRhOiByb3V0ZS5kYXRhLFxuICAgICAgdXJsOiByb3V0ZS51cmwsXG4gICAgICBvdXRsZXQ6IHJvdXRlLm91dGxldCxcbiAgICAgIHJvdXRlQ29uZmlnOiB7XG4gICAgICAgIGNvbXBvbmVudDogcm91dGUucm91dGVDb25maWcgPyByb3V0ZS5yb3V0ZUNvbmZpZy5jb21wb25lbnQgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgICAgcXVlcnlQYXJhbXM6IHJvdXRlLnF1ZXJ5UGFyYW1zLFxuICAgICAgcXVlcnlQYXJhbU1hcDogcm91dGUucXVlcnlQYXJhbU1hcCxcbiAgICAgIGZyYWdtZW50OiByb3V0ZS5mcmFnbWVudCxcbiAgICAgIGNvbXBvbmVudDogKHJvdXRlLnJvdXRlQ29uZmlnXG4gICAgICAgID8gcm91dGUucm91dGVDb25maWcuY29tcG9uZW50XG4gICAgICAgIDogdW5kZWZpbmVkKSBhcyBhbnksXG4gICAgICByb290OiB1bmRlZmluZWQgYXMgYW55LFxuICAgICAgcGFyZW50OiB1bmRlZmluZWQgYXMgYW55LFxuICAgICAgZmlyc3RDaGlsZDogY2hpbGRyZW5bMF0sXG4gICAgICBwYXRoRnJvbVJvb3Q6IHVuZGVmaW5lZCBhcyBhbnksXG4gICAgICBjaGlsZHJlbixcbiAgICB9O1xuICB9XG59XG4iXX0=