var RouterStateSerializer = /** @class */ (function () {
    function RouterStateSerializer() {
    }
    return RouterStateSerializer;
}());
export { RouterStateSerializer };
var DefaultRouterStateSerializer = /** @class */ (function () {
    function DefaultRouterStateSerializer() {
    }
    DefaultRouterStateSerializer.prototype.serialize = function (routerState) {
        return {
            root: this.serializeRoute(routerState.root),
            url: routerState.url,
        };
    };
    DefaultRouterStateSerializer.prototype.serializeRoute = function (route) {
        var _this = this;
        var children = route.children.map(function (c) { return _this.serializeRoute(c); });
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
            component: (route.routeConfig
                ? route.routeConfig.component
                : undefined),
            root: undefined,
            parent: undefined,
            firstChild: children[0],
            pathFromRoot: undefined,
            children: children,
        };
    };
    return DefaultRouterStateSerializer;
}());
export { DefaultRouterStateSerializer };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvcm91dGVyLXN0b3JlL3NyYy9zZXJpYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLElBQUE7OztnQ0FGQTtJQUlDLENBQUE7QUFGRCxpQ0FFQztBQU9ELElBQUE7OztJQUVFLGdEQUFTLEdBQVQsVUFBVSxXQUFnQztRQUN4QyxNQUFNLENBQUM7WUFDTCxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQzNDLEdBQUcsRUFBRSxXQUFXLENBQUMsR0FBRztTQUNyQixDQUFDO0tBQ0g7SUFFTyxxREFBYyxHQUF0QixVQUNFLEtBQTZCO1FBRC9CLGlCQXlCQztRQXRCQyxJQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQztRQUNqRSxNQUFNLENBQUM7WUFDTCxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07WUFDcEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO1lBQ3hCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtZQUNoQixHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7WUFDZCxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07WUFDcEIsV0FBVyxFQUFFO2dCQUNYLFNBQVMsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUzthQUN2RTtZQUNELFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVztZQUM5QixhQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWE7WUFDbEMsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO1lBQ3hCLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXO2dCQUMzQixDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTO2dCQUM3QixDQUFDLENBQUMsU0FBUyxDQUFRO1lBQ3JCLElBQUksRUFBRSxTQUFnQjtZQUN0QixNQUFNLEVBQUUsU0FBZ0I7WUFDeEIsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDdkIsWUFBWSxFQUFFLFNBQWdCO1lBQzlCLFFBQVEsVUFBQTtTQUNULENBQUM7S0FDSDt1Q0E3Q0g7SUE4Q0MsQ0FBQTtBQW5DRCx3Q0FtQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBSb3V0ZXJTdGF0ZVNuYXBzaG90IH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJvdXRlclN0YXRlU2VyaWFsaXplcjxUPiB7XG4gIGFic3RyYWN0IHNlcmlhbGl6ZShyb3V0ZXJTdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCk6IFQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Qge1xuICByb290OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90O1xuICB1cmw6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRSb3V0ZXJTdGF0ZVNlcmlhbGl6ZXJcbiAgaW1wbGVtZW50cyBSb3V0ZXJTdGF0ZVNlcmlhbGl6ZXI8U2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Q+IHtcbiAgc2VyaWFsaXplKHJvdXRlclN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90KTogU2VyaWFsaXplZFJvdXRlclN0YXRlU25hcHNob3Qge1xuICAgIHJldHVybiB7XG4gICAgICByb290OiB0aGlzLnNlcmlhbGl6ZVJvdXRlKHJvdXRlclN0YXRlLnJvb3QpLFxuICAgICAgdXJsOiByb3V0ZXJTdGF0ZS51cmwsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgc2VyaWFsaXplUm91dGUoXG4gICAgcm91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3RcbiAgKTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSByb3V0ZS5jaGlsZHJlbi5tYXAoYyA9PiB0aGlzLnNlcmlhbGl6ZVJvdXRlKGMpKTtcbiAgICByZXR1cm4ge1xuICAgICAgcGFyYW1zOiByb3V0ZS5wYXJhbXMsXG4gICAgICBwYXJhbU1hcDogcm91dGUucGFyYW1NYXAsXG4gICAgICBkYXRhOiByb3V0ZS5kYXRhLFxuICAgICAgdXJsOiByb3V0ZS51cmwsXG4gICAgICBvdXRsZXQ6IHJvdXRlLm91dGxldCxcbiAgICAgIHJvdXRlQ29uZmlnOiB7XG4gICAgICAgIGNvbXBvbmVudDogcm91dGUucm91dGVDb25maWcgPyByb3V0ZS5yb3V0ZUNvbmZpZy5jb21wb25lbnQgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgICAgcXVlcnlQYXJhbXM6IHJvdXRlLnF1ZXJ5UGFyYW1zLFxuICAgICAgcXVlcnlQYXJhbU1hcDogcm91dGUucXVlcnlQYXJhbU1hcCxcbiAgICAgIGZyYWdtZW50OiByb3V0ZS5mcmFnbWVudCxcbiAgICAgIGNvbXBvbmVudDogKHJvdXRlLnJvdXRlQ29uZmlnXG4gICAgICAgID8gcm91dGUucm91dGVDb25maWcuY29tcG9uZW50XG4gICAgICAgIDogdW5kZWZpbmVkKSBhcyBhbnksXG4gICAgICByb290OiB1bmRlZmluZWQgYXMgYW55LFxuICAgICAgcGFyZW50OiB1bmRlZmluZWQgYXMgYW55LFxuICAgICAgZmlyc3RDaGlsZDogY2hpbGRyZW5bMF0sXG4gICAgICBwYXRoRnJvbVJvb3Q6IHVuZGVmaW5lZCBhcyBhbnksXG4gICAgICBjaGlsZHJlbixcbiAgICB9O1xuICB9XG59XG4iXX0=