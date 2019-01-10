/**
 * @license NgRx 6.0.1
 * (c) 2015-2018 Brandon Roberts, Mike Ryan, Rob Wormald, Victor Savkin
 * License: MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators')) :
	typeof define === 'function' && define.amd ? define('@ngrx/store', ['exports', '@angular/core', 'rxjs', 'rxjs/operators'], factory) :
	(factory((global.ngrx = global.ngrx || {}, global.ngrx.store = {}),global.ng.core,global.rxjs,global.rxjs.operators));
}(this, (function (exports,core,rxjs,operators) { 'use strict';

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var INIT = '@ngrx/store/init';
var ActionsSubject = /** @class */ (function (_super) {
    __extends$1(ActionsSubject, _super);
    function ActionsSubject() {
        return _super.call(this, { type: INIT }) || this;
    }
    ActionsSubject.prototype.next = function (action) {
        if (typeof action === 'undefined') {
            throw new TypeError("Actions must be objects");
        }
        else if (typeof action.type === 'undefined') {
            throw new TypeError("Actions must have a type property");
        }
        _super.prototype.next.call(this, action);
    };
    ActionsSubject.prototype.complete = function () {
        /* noop */
    };
    ActionsSubject.prototype.ngOnDestroy = function () {
        _super.prototype.complete.call(this);
    };
    ActionsSubject.decorators = [
        { type: core.Injectable }
    ];
    /** @nocollapse */
    ActionsSubject.ctorParameters = function () { return []; };
    return ActionsSubject;
}(rxjs.BehaviorSubject));
var ACTIONS_SUBJECT_PROVIDERS = [ActionsSubject];

var _INITIAL_STATE = new core.InjectionToken('@ngrx/store Internal Initial State');
var INITIAL_STATE = new core.InjectionToken('@ngrx/store Initial State');
var REDUCER_FACTORY = new core.InjectionToken('@ngrx/store Reducer Factory');
var _REDUCER_FACTORY = new core.InjectionToken('@ngrx/store Reducer Factory Provider');
var INITIAL_REDUCERS = new core.InjectionToken('@ngrx/store Initial Reducers');
var _INITIAL_REDUCERS = new core.InjectionToken('@ngrx/store Internal Initial Reducers');
var META_REDUCERS = new core.InjectionToken('@ngrx/store Meta Reducers');
var STORE_FEATURES = new core.InjectionToken('@ngrx/store Store Features');
var _STORE_REDUCERS = new core.InjectionToken('@ngrx/store Internal Store Reducers');
var _FEATURE_REDUCERS = new core.InjectionToken('@ngrx/store Internal Feature Reducers');
var _FEATURE_REDUCERS_TOKEN = new core.InjectionToken('@ngrx/store Internal Feature Reducers Token');
var FEATURE_REDUCERS = new core.InjectionToken('@ngrx/store Feature Reducers');

var __read$1 = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread$1 = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$1(arguments[i]));
    return ar;
};
function combineReducers(reducers, initialState) {
    if (initialState === void 0) { initialState = {}; }
    var reducerKeys = Object.keys(reducers);
    var finalReducers = {};
    for (var i = 0; i < reducerKeys.length; i++) {
        var key = reducerKeys[i];
        if (typeof reducers[key] === 'function') {
            finalReducers[key] = reducers[key];
        }
    }
    var finalReducerKeys = Object.keys(finalReducers);
    return function combination(state, action) {
        state = state === undefined ? initialState : state;
        var hasChanged = false;
        var nextState = {};
        for (var i = 0; i < finalReducerKeys.length; i++) {
            var key = finalReducerKeys[i];
            var reducer = finalReducers[key];
            var previousStateForKey = state[key];
            var nextStateForKey = reducer(previousStateForKey, action);
            nextState[key] = nextStateForKey;
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        }
        return hasChanged ? nextState : state;
    };
}
function omit(object, keyToRemove) {
    return Object.keys(object)
        .filter(function (key) { return key !== keyToRemove; })
        .reduce(function (result, key) {
        return Object.assign(result, (_a = {}, _a[key] = object[key], _a));
        var _a;
    }, {});
}
function compose() {
    var functions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        functions[_i] = arguments[_i];
    }
    return function (arg) {
        if (functions.length === 0) {
            return arg;
        }
        var last = functions[functions.length - 1];
        var rest = functions.slice(0, -1);
        return rest.reduceRight(function (composed, fn) { return fn(composed); }, last(arg));
    };
}
function createReducerFactory(reducerFactory, metaReducers) {
    if (Array.isArray(metaReducers) && metaReducers.length > 0) {
        return compose.apply(null, __spread$1(metaReducers, [reducerFactory]));
    }
    return reducerFactory;
}
function createFeatureReducerFactory(metaReducers) {
    var reducerFactory = Array.isArray(metaReducers) && metaReducers.length > 0
        ? compose.apply(void 0, __spread$1(metaReducers)) : function (r) { return r; };
    return function (reducer, initialState) {
        reducer = reducerFactory(reducer);
        return function (state, action) {
            state = state === undefined ? initialState : state;
            return reducer(state, action);
        };
    };
}

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var ReducerObservable = /** @class */ (function (_super) {
    __extends$2(ReducerObservable, _super);
    function ReducerObservable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ReducerObservable;
}(rxjs.Observable));
var ReducerManagerDispatcher = /** @class */ (function (_super) {
    __extends$2(ReducerManagerDispatcher, _super);
    function ReducerManagerDispatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ReducerManagerDispatcher;
}(ActionsSubject));
var UPDATE = '@ngrx/store/update-reducers';
var ReducerManager = /** @class */ (function (_super) {
    __extends$2(ReducerManager, _super);
    function ReducerManager(dispatcher, initialState, reducers, reducerFactory) {
        var _this = _super.call(this, reducerFactory(reducers, initialState)) || this;
        _this.dispatcher = dispatcher;
        _this.initialState = initialState;
        _this.reducers = reducers;
        _this.reducerFactory = reducerFactory;
        return _this;
    }
    ReducerManager.prototype.addFeature = function (_a) {
        var reducers = _a.reducers, reducerFactory = _a.reducerFactory, metaReducers = _a.metaReducers, initialState = _a.initialState, key = _a.key;
        var reducer = typeof reducers === 'function'
            ? createFeatureReducerFactory(metaReducers)(reducers, initialState)
            : createReducerFactory(reducerFactory, metaReducers)(reducers, initialState);
        this.addReducer(key, reducer);
    };
    ReducerManager.prototype.removeFeature = function (_a) {
        var key = _a.key;
        this.removeReducer(key);
    };
    ReducerManager.prototype.addReducer = function (key, reducer) {
        this.reducers = __assign({}, this.reducers, (_a = {}, _a[key] = reducer, _a));
        this.updateReducers(key);
        var _a;
    };
    ReducerManager.prototype.removeReducer = function (key) {
        this.reducers = omit(this.reducers, key) /*TODO(#823)*/;
        this.updateReducers(key);
    };
    ReducerManager.prototype.updateReducers = function (key) {
        this.next(this.reducerFactory(this.reducers, this.initialState));
        this.dispatcher.next({
            type: UPDATE,
            feature: key,
        });
    };
    ReducerManager.prototype.ngOnDestroy = function () {
        this.complete();
    };
    ReducerManager.decorators = [
        { type: core.Injectable }
    ];
    /** @nocollapse */
    ReducerManager.ctorParameters = function () { return [
        { type: ReducerManagerDispatcher, },
        { type: undefined, decorators: [{ type: core.Inject, args: [INITIAL_STATE,] },] },
        { type: undefined, decorators: [{ type: core.Inject, args: [INITIAL_REDUCERS,] },] },
        { type: undefined, decorators: [{ type: core.Inject, args: [REDUCER_FACTORY,] },] },
    ]; };
    return ReducerManager;
}(rxjs.BehaviorSubject));
var REDUCER_MANAGER_PROVIDERS = [
    ReducerManager,
    { provide: ReducerObservable, useExisting: ReducerManager },
    { provide: ReducerManagerDispatcher, useExisting: ActionsSubject },
];

var __extends$4 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ScannedActionsSubject = /** @class */ (function (_super) {
    __extends$4(ScannedActionsSubject, _super);
    function ScannedActionsSubject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScannedActionsSubject.prototype.ngOnDestroy = function () {
        this.complete();
    };
    ScannedActionsSubject.decorators = [
        { type: core.Injectable }
    ];
    return ScannedActionsSubject;
}(rxjs.Subject));
var SCANNED_ACTIONS_SUBJECT_PROVIDERS = [
    ScannedActionsSubject,
];

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read$2 = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var StateObservable = /** @class */ (function (_super) {
    __extends$3(StateObservable, _super);
    function StateObservable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return StateObservable;
}(rxjs.Observable));
var State = /** @class */ (function (_super) {
    __extends$3(State, _super);
    function State(actions$, reducer$, scannedActions, initialState) {
        var _this = _super.call(this, initialState) || this;
        var actionsOnQueue$ = actions$.pipe(operators.observeOn(rxjs.queueScheduler));
        var withLatestReducer$ = actionsOnQueue$.pipe(operators.withLatestFrom(reducer$));
        var seed = { state: initialState };
        var stateAndAction$ = withLatestReducer$.pipe(operators.scan(reduceState, seed));
        _this.stateSubscription = stateAndAction$.subscribe(function (_a) {
            var state = _a.state, action = _a.action;
            _this.next(state);
            scannedActions.next(action);
        });
        return _this;
    }
    State.prototype.ngOnDestroy = function () {
        this.stateSubscription.unsubscribe();
        this.complete();
    };
    State.INIT = INIT;
    State.decorators = [
        { type: core.Injectable }
    ];
    /** @nocollapse */
    State.ctorParameters = function () { return [
        { type: ActionsSubject, },
        { type: ReducerObservable, },
        { type: ScannedActionsSubject, },
        { type: undefined, decorators: [{ type: core.Inject, args: [INITIAL_STATE,] },] },
    ]; };
    return State;
}(rxjs.BehaviorSubject));
function reduceState(stateActionPair, _a) {
    if (stateActionPair === void 0) { stateActionPair = { state: undefined }; }
    var _b = __read$2(_a, 2), action = _b[0], reducer = _b[1];
    var state = stateActionPair.state;
    return { state: reducer(state, action), action: action };
}
var STATE_PROVIDERS = [
    State,
    { provide: StateObservable, useExisting: State },
];

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var Store = /** @class */ (function (_super) {
    __extends(Store, _super);
    function Store(state$, actionsObserver, reducerManager) {
        var _this = _super.call(this) || this;
        _this.actionsObserver = actionsObserver;
        _this.reducerManager = reducerManager;
        _this.source = state$;
        return _this;
    }
    Store.prototype.select = function (pathOrMapFn) {
        var paths = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            paths[_i - 1] = arguments[_i];
        }
        return select.call.apply(select, __spread([null, pathOrMapFn], paths))(this);
    };
    Store.prototype.lift = function (operator) {
        var store = new Store(this, this.actionsObserver, this.reducerManager);
        store.operator = operator;
        return store;
    };
    Store.prototype.dispatch = function (action) {
        this.actionsObserver.next(action);
    };
    Store.prototype.next = function (action) {
        this.actionsObserver.next(action);
    };
    Store.prototype.error = function (err) {
        this.actionsObserver.error(err);
    };
    Store.prototype.complete = function () {
        this.actionsObserver.complete();
    };
    Store.prototype.addReducer = function (key, reducer) {
        this.reducerManager.addReducer(key, reducer);
    };
    Store.prototype.removeReducer = function (key) {
        this.reducerManager.removeReducer(key);
    };
    Store.decorators = [
        { type: core.Injectable }
    ];
    /** @nocollapse */
    Store.ctorParameters = function () { return [
        { type: StateObservable, },
        { type: ActionsSubject, },
        { type: ReducerManager, },
    ]; };
    return Store;
}(rxjs.Observable));
var STORE_PROVIDERS = [Store];
function select(pathOrMapFn) {
    var paths = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        paths[_i - 1] = arguments[_i];
    }
    return function selectOperator(source$) {
        var mapped$;
        if (typeof pathOrMapFn === 'string') {
            mapped$ = source$.pipe(operators.pluck.apply(void 0, __spread([pathOrMapFn], paths)));
        }
        else if (typeof pathOrMapFn === 'function') {
            mapped$ = source$.pipe(operators.map(pathOrMapFn));
        }
        else {
            throw new TypeError("Unexpected type '" + typeof pathOrMapFn + "' in select operator," +
                " expected 'string' or 'function'");
        }
        return mapped$.pipe(operators.distinctUntilChanged());
    };
}

var __read$3 = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread$2 = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$3(arguments[i]));
    return ar;
};
function isEqualCheck(a, b) {
    return a === b;
}
function defaultMemoize(t, isEqual) {
    if (isEqual === void 0) { isEqual = isEqualCheck; }
    var lastArguments = null;
    var lastResult = null;
    function reset() {
        lastArguments = null;
        lastResult = null;
    }
    function memoized() {
        if (!lastArguments) {
            lastResult = t.apply(null, arguments);
            lastArguments = arguments;
            return lastResult;
        }
        for (var i = 0; i < arguments.length; i++) {
            if (!isEqual(arguments[i], lastArguments[i])) {
                lastResult = t.apply(null, arguments);
                lastArguments = arguments;
                return lastResult;
            }
        }
        return lastResult;
    }
    return { memoized: memoized, reset: reset };
}
function createSelector() {
    var input = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        input[_i] = arguments[_i];
    }
    return createSelectorFactory(defaultMemoize).apply(void 0, __spread$2(input));
}
function defaultStateFn(state, selectors, memoizedProjector) {
    var args = selectors.map(function (fn) { return fn(state); });
    return memoizedProjector.memoized.apply(null, args);
}
function createSelectorFactory(memoize, options) {
    if (options === void 0) { options = {
        stateFn: defaultStateFn,
    }; }
    return function () {
        var input = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            input[_i] = arguments[_i];
        }
        var args = input;
        if (Array.isArray(args[0])) {
            var _a = __read$3(args), head = _a[0], tail = _a.slice(1);
            args = __spread$2(head, tail);
        }
        var selectors = args.slice(0, args.length - 1);
        var projector = args[args.length - 1];
        var memoizedSelectors = selectors.filter(function (selector) {
            return selector.release && typeof selector.release === 'function';
        });
        var memoizedProjector = memoize(function () {
            var selectors = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                selectors[_i] = arguments[_i];
            }
            return projector.apply(null, selectors);
        });
        var memoizedState = defaultMemoize(function (state) {
            return options.stateFn.apply(null, [state, selectors, memoizedProjector]);
        });
        function release() {
            memoizedState.reset();
            memoizedProjector.reset();
            memoizedSelectors.forEach(function (selector) { return selector.release(); });
        }
        return Object.assign(memoizedState.memoized, {
            release: release,
            projector: memoizedProjector.memoized,
        });
    };
}
function createFeatureSelector(featureName) {
    return createSelector(function (state) { return state[featureName]; }, function (featureState) { return featureState; });
}

var __assign$1 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var StoreRootModule = /** @class */ (function () {
    function StoreRootModule(actions$, reducer$, scannedActions$, store) {
    }
    StoreRootModule.decorators = [
        { type: core.NgModule, args: [{},] }
    ];
    /** @nocollapse */
    StoreRootModule.ctorParameters = function () { return [
        { type: ActionsSubject, },
        { type: ReducerObservable, },
        { type: ScannedActionsSubject, },
        { type: Store, },
    ]; };
    return StoreRootModule;
}());
var StoreFeatureModule = /** @class */ (function () {
    function StoreFeatureModule(features, featureReducers, reducerManager, root) {
        this.features = features;
        this.featureReducers = featureReducers;
        this.reducerManager = reducerManager;
        features
            .map(function (feature, index) {
            var featureReducerCollection = featureReducers.shift();
            var reducers = featureReducerCollection[index];
            return __assign$1({}, feature, { reducers: reducers, initialState: _initialStateFactory(feature.initialState) });
        })
            .forEach(function (feature) { return reducerManager.addFeature(feature); });
    }
    StoreFeatureModule.prototype.ngOnDestroy = function () {
        var _this = this;
        this.features.forEach(function (feature) {
            return _this.reducerManager.removeFeature(feature);
        });
    };
    StoreFeatureModule.decorators = [
        { type: core.NgModule, args: [{},] }
    ];
    /** @nocollapse */
    StoreFeatureModule.ctorParameters = function () { return [
        { type: Array, decorators: [{ type: core.Inject, args: [STORE_FEATURES,] },] },
        { type: Array, decorators: [{ type: core.Inject, args: [FEATURE_REDUCERS,] },] },
        { type: ReducerManager, },
        { type: StoreRootModule, },
    ]; };
    return StoreFeatureModule;
}());
var StoreModule = /** @class */ (function () {
    function StoreModule() {
    }
    StoreModule.forRoot = function (reducers, config) {
        if (config === void 0) { config = {}; }
        return {
            ngModule: StoreRootModule,
            providers: [
                { provide: _INITIAL_STATE, useValue: config.initialState },
                {
                    provide: INITIAL_STATE,
                    useFactory: _initialStateFactory,
                    deps: [_INITIAL_STATE],
                },
                { provide: _INITIAL_REDUCERS, useValue: reducers },
                {
                    provide: _STORE_REDUCERS,
                    useExisting: reducers instanceof core.InjectionToken ? reducers : _INITIAL_REDUCERS,
                },
                {
                    provide: INITIAL_REDUCERS,
                    deps: [core.Injector, _INITIAL_REDUCERS, [new core.Inject(_STORE_REDUCERS)]],
                    useFactory: _createStoreReducers,
                },
                {
                    provide: META_REDUCERS,
                    useValue: config.metaReducers ? config.metaReducers : [],
                },
                {
                    provide: _REDUCER_FACTORY,
                    useValue: config.reducerFactory
                        ? config.reducerFactory
                        : combineReducers,
                },
                {
                    provide: REDUCER_FACTORY,
                    deps: [_REDUCER_FACTORY, META_REDUCERS],
                    useFactory: createReducerFactory,
                },
                ACTIONS_SUBJECT_PROVIDERS,
                REDUCER_MANAGER_PROVIDERS,
                SCANNED_ACTIONS_SUBJECT_PROVIDERS,
                STATE_PROVIDERS,
                STORE_PROVIDERS,
            ],
        };
    };
    StoreModule.forFeature = function (featureName, reducers, config) {
        if (config === void 0) { config = {}; }
        return {
            ngModule: StoreFeatureModule,
            providers: [
                {
                    provide: STORE_FEATURES,
                    multi: true,
                    useValue: {
                        key: featureName,
                        reducerFactory: config.reducerFactory
                            ? config.reducerFactory
                            : combineReducers,
                        metaReducers: config.metaReducers ? config.metaReducers : [],
                        initialState: config.initialState,
                    },
                },
                { provide: _FEATURE_REDUCERS, multi: true, useValue: reducers },
                {
                    provide: _FEATURE_REDUCERS_TOKEN,
                    multi: true,
                    useExisting: reducers instanceof core.InjectionToken ? reducers : _FEATURE_REDUCERS,
                },
                {
                    provide: FEATURE_REDUCERS,
                    multi: true,
                    deps: [
                        core.Injector,
                        _FEATURE_REDUCERS,
                        [new core.Inject(_FEATURE_REDUCERS_TOKEN)],
                    ],
                    useFactory: _createFeatureReducers,
                },
            ],
        };
    };
    StoreModule.decorators = [
        { type: core.NgModule, args: [{},] }
    ];
    return StoreModule;
}());
function _createStoreReducers(injector, reducers, tokenReducers) {
    return reducers instanceof core.InjectionToken ? injector.get(reducers) : reducers;
}
function _createFeatureReducers(injector, reducerCollection, tokenReducerCollection) {
    var reducers = reducerCollection.map(function (reducer, index) {
        return reducer instanceof core.InjectionToken ? injector.get(reducer) : reducer;
    });
    return reducers;
}
function _initialStateFactory(initialState) {
    if (typeof initialState === 'function') {
        return initialState();
    }
    return initialState;
}

/**
 * DO NOT EDIT
 *
 * This file is automatically generated at build
 */

/**
 * Generated bundle index. Do not edit.
 */

exports.ɵngrx_modules_store_store_c = ACTIONS_SUBJECT_PROVIDERS;
exports.ɵngrx_modules_store_store_d = REDUCER_MANAGER_PROVIDERS;
exports.ɵngrx_modules_store_store_e = SCANNED_ACTIONS_SUBJECT_PROVIDERS;
exports.ɵngrx_modules_store_store_f = STATE_PROVIDERS;
exports.ɵngrx_modules_store_store_b = STORE_PROVIDERS;
exports.Store = Store;
exports.select = select;
exports.combineReducers = combineReducers;
exports.compose = compose;
exports.createReducerFactory = createReducerFactory;
exports.ActionsSubject = ActionsSubject;
exports.INIT = INIT;
exports.ReducerManager = ReducerManager;
exports.ReducerObservable = ReducerObservable;
exports.ReducerManagerDispatcher = ReducerManagerDispatcher;
exports.UPDATE = UPDATE;
exports.ScannedActionsSubject = ScannedActionsSubject;
exports.createSelector = createSelector;
exports.createSelectorFactory = createSelectorFactory;
exports.createFeatureSelector = createFeatureSelector;
exports.defaultMemoize = defaultMemoize;
exports.defaultStateFn = defaultStateFn;
exports.State = State;
exports.StateObservable = StateObservable;
exports.reduceState = reduceState;
exports.INITIAL_STATE = INITIAL_STATE;
exports._REDUCER_FACTORY = _REDUCER_FACTORY;
exports.REDUCER_FACTORY = REDUCER_FACTORY;
exports._INITIAL_REDUCERS = _INITIAL_REDUCERS;
exports.INITIAL_REDUCERS = INITIAL_REDUCERS;
exports.STORE_FEATURES = STORE_FEATURES;
exports._INITIAL_STATE = _INITIAL_STATE;
exports.META_REDUCERS = META_REDUCERS;
exports._STORE_REDUCERS = _STORE_REDUCERS;
exports._FEATURE_REDUCERS = _FEATURE_REDUCERS;
exports.FEATURE_REDUCERS = FEATURE_REDUCERS;
exports._FEATURE_REDUCERS_TOKEN = _FEATURE_REDUCERS_TOKEN;
exports.StoreModule = StoreModule;
exports.StoreRootModule = StoreRootModule;
exports.StoreFeatureModule = StoreFeatureModule;
exports._initialStateFactory = _initialStateFactory;
exports._createStoreReducers = _createStoreReducers;
exports._createFeatureReducers = _createFeatureReducers;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=store.umd.js.map
