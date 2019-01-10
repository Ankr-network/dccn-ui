/**
 * @license NgRx 6.0.1
 * (c) 2015-2018 Brandon Roberts, Mike Ryan, Rob Wormald, Victor Savkin
 * License: MIT
 */
import { Inject, Injectable, InjectionToken, Injector, NgModule } from '@angular/core';
import { BehaviorSubject, Observable, Subject, queueScheduler } from 'rxjs';
import { distinctUntilChanged, map, observeOn, pluck, scan, withLatestFrom } from 'rxjs/operators';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const INIT = /** @type {?} */ ('@ngrx/store/init');
class ActionsSubject extends BehaviorSubject {
    constructor() {
        super({ type: INIT });
    }
    /**
     * @param {?} action
     * @return {?}
     */
    next(action) {
        if (typeof action === 'undefined') {
            throw new TypeError(`Actions must be objects`);
        }
        else if (typeof action.type === 'undefined') {
            throw new TypeError(`Actions must have a type property`);
        }
        super.next(action);
    }
    /**
     * @return {?}
     */
    complete() {
        /* noop */
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        super.complete();
    }
}
ActionsSubject.decorators = [
    { type: Injectable }
];
/** @nocollapse */
ActionsSubject.ctorParameters = () => [];
const ACTIONS_SUBJECT_PROVIDERS = [ActionsSubject];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const _INITIAL_STATE = new InjectionToken('@ngrx/store Internal Initial State');
const INITIAL_STATE = new InjectionToken('@ngrx/store Initial State');
const REDUCER_FACTORY = new InjectionToken('@ngrx/store Reducer Factory');
const _REDUCER_FACTORY = new InjectionToken('@ngrx/store Reducer Factory Provider');
const INITIAL_REDUCERS = new InjectionToken('@ngrx/store Initial Reducers');
const _INITIAL_REDUCERS = new InjectionToken('@ngrx/store Internal Initial Reducers');
const META_REDUCERS = new InjectionToken('@ngrx/store Meta Reducers');
const STORE_FEATURES = new InjectionToken('@ngrx/store Store Features');
const _STORE_REDUCERS = new InjectionToken('@ngrx/store Internal Store Reducers');
const _FEATURE_REDUCERS = new InjectionToken('@ngrx/store Internal Feature Reducers');
const _FEATURE_REDUCERS_TOKEN = new InjectionToken('@ngrx/store Internal Feature Reducers Token');
const FEATURE_REDUCERS = new InjectionToken('@ngrx/store Feature Reducers');

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} reducers
 * @param {?=} initialState
 * @return {?}
 */
function combineReducers(reducers, initialState = {}) {
    const /** @type {?} */ reducerKeys = Object.keys(reducers);
    const /** @type {?} */ finalReducers = {};
    for (let /** @type {?} */ i = 0; i < reducerKeys.length; i++) {
        const /** @type {?} */ key = reducerKeys[i];
        if (typeof reducers[key] === 'function') {
            finalReducers[key] = reducers[key];
        }
    }
    const /** @type {?} */ finalReducerKeys = Object.keys(finalReducers);
    return function combination(state, action) {
        state = state === undefined ? initialState : state;
        let /** @type {?} */ hasChanged = false;
        const /** @type {?} */ nextState = {};
        for (let /** @type {?} */ i = 0; i < finalReducerKeys.length; i++) {
            const /** @type {?} */ key = finalReducerKeys[i];
            const /** @type {?} */ reducer = finalReducers[key];
            const /** @type {?} */ previousStateForKey = state[key];
            const /** @type {?} */ nextStateForKey = reducer(previousStateForKey, action);
            nextState[key] = nextStateForKey;
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        }
        return hasChanged ? nextState : state;
    };
}
/**
 * @template T
 * @param {?} object
 * @param {?} keyToRemove
 * @return {?}
 */
function omit(object, keyToRemove) {
    return Object.keys(object)
        .filter(key => key !== keyToRemove)
        .reduce((result, key) => Object.assign(result, { [key]: object[key] }), {});
}
/**
 * @param {...?} functions
 * @return {?}
 */
function compose(...functions) {
    return function (arg) {
        if (functions.length === 0) {
            return arg;
        }
        const /** @type {?} */ last = functions[functions.length - 1];
        const /** @type {?} */ rest = functions.slice(0, -1);
        return rest.reduceRight((composed, fn) => fn(composed), last(arg));
    };
}
/**
 * @template T, V
 * @param {?} reducerFactory
 * @param {?=} metaReducers
 * @return {?}
 */
function createReducerFactory(reducerFactory, metaReducers) {
    if (Array.isArray(metaReducers) && metaReducers.length > 0) {
        return compose.apply(null, [...metaReducers, reducerFactory]);
    }
    return reducerFactory;
}
/**
 * @template T, V
 * @param {?=} metaReducers
 * @return {?}
 */
function createFeatureReducerFactory(metaReducers) {
    const /** @type {?} */ reducerFactory = Array.isArray(metaReducers) && metaReducers.length > 0
        ? compose(...metaReducers)
        : (r) => r;
    return (reducer, initialState) => {
        reducer = reducerFactory(reducer);
        return (state, action) => {
            state = state === undefined ? initialState : state;
            return reducer(state, action);
        };
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @abstract
 */
class ReducerObservable extends Observable {
}
/**
 * @abstract
 */
class ReducerManagerDispatcher extends ActionsSubject {
}
const UPDATE = /** @type {?} */ ('@ngrx/store/update-reducers');
class ReducerManager extends BehaviorSubject {
    /**
     * @param {?} dispatcher
     * @param {?} initialState
     * @param {?} reducers
     * @param {?} reducerFactory
     */
    constructor(dispatcher, initialState, reducers, reducerFactory) {
        super(reducerFactory(reducers, initialState));
        this.dispatcher = dispatcher;
        this.initialState = initialState;
        this.reducers = reducers;
        this.reducerFactory = reducerFactory;
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    addFeature({ reducers, reducerFactory, metaReducers, initialState, key, }) {
        const /** @type {?} */ reducer = typeof reducers === 'function'
            ? createFeatureReducerFactory(metaReducers)(reducers, initialState)
            : createReducerFactory(reducerFactory, metaReducers)(reducers, initialState);
        this.addReducer(key, reducer);
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    removeFeature({ key }) {
        this.removeReducer(key);
    }
    /**
     * @param {?} key
     * @param {?} reducer
     * @return {?}
     */
    addReducer(key, reducer) {
        this.reducers = Object.assign({}, this.reducers, { [key]: reducer });
        this.updateReducers(key);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    removeReducer(key) {
        this.reducers = /** @type {?} */ (omit(this.reducers, key) /*TODO(#823)*/);
        this.updateReducers(key);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    updateReducers(key) {
        this.next(this.reducerFactory(this.reducers, this.initialState));
        this.dispatcher.next(/** @type {?} */ ({
            type: UPDATE,
            feature: key,
        }));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.complete();
    }
}
ReducerManager.decorators = [
    { type: Injectable }
];
/** @nocollapse */
ReducerManager.ctorParameters = () => [
    { type: ReducerManagerDispatcher, },
    { type: undefined, decorators: [{ type: Inject, args: [INITIAL_STATE,] },] },
    { type: undefined, decorators: [{ type: Inject, args: [INITIAL_REDUCERS,] },] },
    { type: undefined, decorators: [{ type: Inject, args: [REDUCER_FACTORY,] },] },
];
const REDUCER_MANAGER_PROVIDERS = [
    ReducerManager,
    { provide: ReducerObservable, useExisting: ReducerManager },
    { provide: ReducerManagerDispatcher, useExisting: ActionsSubject },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class ScannedActionsSubject extends Subject {
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.complete();
    }
}
ScannedActionsSubject.decorators = [
    { type: Injectable }
];
const SCANNED_ACTIONS_SUBJECT_PROVIDERS = [
    ScannedActionsSubject,
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @abstract
 */
class StateObservable extends Observable {
}
/**
 * @template T
 */
class State extends BehaviorSubject {
    /**
     * @param {?} actions$
     * @param {?} reducer$
     * @param {?} scannedActions
     * @param {?} initialState
     */
    constructor(actions$, reducer$, scannedActions, initialState) {
        super(initialState);
        const /** @type {?} */ actionsOnQueue$ = actions$.pipe(observeOn(queueScheduler));
        const /** @type {?} */ withLatestReducer$ = actionsOnQueue$.pipe(withLatestFrom(reducer$));
        const /** @type {?} */ seed = { state: initialState };
        const /** @type {?} */ stateAndAction$ = withLatestReducer$.pipe(scan(reduceState, seed));
        this.stateSubscription = stateAndAction$.subscribe(({ state, action }) => {
            this.next(state);
            scannedActions.next(action);
        });
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.stateSubscription.unsubscribe();
        this.complete();
    }
}
State.INIT = INIT;
State.decorators = [
    { type: Injectable }
];
/** @nocollapse */
State.ctorParameters = () => [
    { type: ActionsSubject, },
    { type: ReducerObservable, },
    { type: ScannedActionsSubject, },
    { type: undefined, decorators: [{ type: Inject, args: [INITIAL_STATE,] },] },
];
/**
 * @template T, V
 * @param {?=} stateActionPair
 * @param {?=} __1
 * @return {?}
 */
function reduceState(stateActionPair = { state: undefined }, [action, reducer]) {
    const { state } = stateActionPair;
    return { state: reducer(state, action), action };
}
const STATE_PROVIDERS = [
    State,
    { provide: StateObservable, useExisting: State },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @template T
 */
class Store extends Observable {
    /**
     * @param {?} state$
     * @param {?} actionsObserver
     * @param {?} reducerManager
     */
    constructor(state$, actionsObserver, reducerManager) {
        super();
        this.actionsObserver = actionsObserver;
        this.reducerManager = reducerManager;
        this.source = state$;
    }
    /**
     * @param {?} pathOrMapFn
     * @param {...?} paths
     * @return {?}
     */
    select(pathOrMapFn, ...paths) {
        return select.call(null, pathOrMapFn, ...paths)(this);
    }
    /**
     * @template R
     * @param {?} operator
     * @return {?}
     */
    lift(operator) {
        const /** @type {?} */ store = new Store(this, this.actionsObserver, this.reducerManager);
        store.operator = operator;
        return store;
    }
    /**
     * @template V
     * @param {?} action
     * @return {?}
     */
    dispatch(action) {
        this.actionsObserver.next(action);
    }
    /**
     * @param {?} action
     * @return {?}
     */
    next(action) {
        this.actionsObserver.next(action);
    }
    /**
     * @param {?} err
     * @return {?}
     */
    error(err) {
        this.actionsObserver.error(err);
    }
    /**
     * @return {?}
     */
    complete() {
        this.actionsObserver.complete();
    }
    /**
     * @template State, Actions
     * @param {?} key
     * @param {?} reducer
     * @return {?}
     */
    addReducer(key, reducer) {
        this.reducerManager.addReducer(key, reducer);
    }
    /**
     * @template Key
     * @param {?} key
     * @return {?}
     */
    removeReducer(key) {
        this.reducerManager.removeReducer(key);
    }
}
Store.decorators = [
    { type: Injectable }
];
/** @nocollapse */
Store.ctorParameters = () => [
    { type: StateObservable, },
    { type: ActionsSubject, },
    { type: ReducerManager, },
];
const STORE_PROVIDERS = [Store];
/**
 * @template T, K
 * @param {?} pathOrMapFn
 * @param {...?} paths
 * @return {?}
 */
function select(pathOrMapFn, ...paths) {
    return function selectOperator(source$) {
        let /** @type {?} */ mapped$;
        if (typeof pathOrMapFn === 'string') {
            mapped$ = source$.pipe(pluck(pathOrMapFn, ...paths));
        }
        else if (typeof pathOrMapFn === 'function') {
            mapped$ = source$.pipe(map(pathOrMapFn));
        }
        else {
            throw new TypeError(`Unexpected type '${typeof pathOrMapFn}' in select operator,` +
                ` expected 'string' or 'function'`);
        }
        return mapped$.pipe(distinctUntilChanged());
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 * @template State, Result
 */

/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function isEqualCheck(a, b) {
    return a === b;
}
/**
 * @param {?} t
 * @param {?=} isEqual
 * @return {?}
 */
function defaultMemoize(t, isEqual = isEqualCheck) {
    let /** @type {?} */ lastArguments = null;
    let /** @type {?} */ lastResult = null;
    /**
     * @return {?}
     */
    function reset() {
        lastArguments = null;
        lastResult = null;
    }
    /**
     * @return {?}
     */
    function memoized() {
        if (!lastArguments) {
            lastResult = t.apply(null, arguments);
            lastArguments = arguments;
            return lastResult;
        }
        for (let /** @type {?} */ i = 0; i < arguments.length; i++) {
            if (!isEqual(arguments[i], lastArguments[i])) {
                lastResult = t.apply(null, arguments);
                lastArguments = arguments;
                return lastResult;
            }
        }
        return lastResult;
    }
    return { memoized, reset };
}
/**
 * @param {...?} input
 * @return {?}
 */
function createSelector(...input) {
    return createSelectorFactory(defaultMemoize)(...input);
}
/**
 * @param {?} state
 * @param {?} selectors
 * @param {?} memoizedProjector
 * @return {?}
 */
function defaultStateFn(state, selectors, memoizedProjector) {
    const /** @type {?} */ args = selectors.map(fn => fn(state));
    return memoizedProjector.memoized.apply(null, args);
}
/**
 * @param {?} memoize
 * @param {?=} options
 * @return {?}
 */
function createSelectorFactory(memoize, options = {
    stateFn: defaultStateFn,
}) {
    return function (...input) {
        let /** @type {?} */ args = input;
        if (Array.isArray(args[0])) {
            const [head, ...tail] = args;
            args = [...head, ...tail];
        }
        const /** @type {?} */ selectors = args.slice(0, args.length - 1);
        const /** @type {?} */ projector = args[args.length - 1];
        const /** @type {?} */ memoizedSelectors = selectors.filter((selector) => selector.release && typeof selector.release === 'function');
        const /** @type {?} */ memoizedProjector = memoize(function (...selectors) {
            return projector.apply(null, selectors);
        });
        const /** @type {?} */ memoizedState = defaultMemoize(function (state) {
            return options.stateFn.apply(null, [state, selectors, memoizedProjector]);
        });
        /**
         * @return {?}
         */
        function release() {
            memoizedState.reset();
            memoizedProjector.reset();
            memoizedSelectors.forEach(selector => selector.release());
        }
        return Object.assign(memoizedState.memoized, {
            release,
            projector: memoizedProjector.memoized,
        });
    };
}
/**
 * @template T
 * @param {?} featureName
 * @return {?}
 */
function createFeatureSelector(featureName) {
    return createSelector((state) => state[featureName], (featureState) => featureState);
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class StoreRootModule {
    /**
     * @param {?} actions$
     * @param {?} reducer$
     * @param {?} scannedActions$
     * @param {?} store
     */
    constructor(actions$, reducer$, scannedActions$, store) { }
}
StoreRootModule.decorators = [
    { type: NgModule, args: [{},] }
];
/** @nocollapse */
StoreRootModule.ctorParameters = () => [
    { type: ActionsSubject, },
    { type: ReducerObservable, },
    { type: ScannedActionsSubject, },
    { type: Store, },
];
class StoreFeatureModule {
    /**
     * @param {?} features
     * @param {?} featureReducers
     * @param {?} reducerManager
     * @param {?} root
     */
    constructor(features, featureReducers, reducerManager, root) {
        this.features = features;
        this.featureReducers = featureReducers;
        this.reducerManager = reducerManager;
        features
            .map((feature, index) => {
            const /** @type {?} */ featureReducerCollection = featureReducers.shift();
            const /** @type {?} */ reducers = /** @type {?} */ ((featureReducerCollection))[index];
            return Object.assign({}, feature, { reducers, initialState: _initialStateFactory(feature.initialState) });
        })
            .forEach(feature => reducerManager.addFeature(feature));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.features.forEach(feature => this.reducerManager.removeFeature(feature));
    }
}
StoreFeatureModule.decorators = [
    { type: NgModule, args: [{},] }
];
/** @nocollapse */
StoreFeatureModule.ctorParameters = () => [
    { type: Array, decorators: [{ type: Inject, args: [STORE_FEATURES,] },] },
    { type: Array, decorators: [{ type: Inject, args: [FEATURE_REDUCERS,] },] },
    { type: ReducerManager, },
    { type: StoreRootModule, },
];
class StoreModule {
    /**
     * @param {?} reducers
     * @param {?=} config
     * @return {?}
     */
    static forRoot(reducers, config = {}) {
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
                    useExisting: reducers instanceof InjectionToken ? reducers : _INITIAL_REDUCERS,
                },
                {
                    provide: INITIAL_REDUCERS,
                    deps: [Injector, _INITIAL_REDUCERS, [new Inject(_STORE_REDUCERS)]],
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
    }
    /**
     * @param {?} featureName
     * @param {?} reducers
     * @param {?=} config
     * @return {?}
     */
    static forFeature(featureName, reducers, config = {}) {
        return {
            ngModule: StoreFeatureModule,
            providers: [
                {
                    provide: STORE_FEATURES,
                    multi: true,
                    useValue: /** @type {?} */ ({
                        key: featureName,
                        reducerFactory: config.reducerFactory
                            ? config.reducerFactory
                            : combineReducers,
                        metaReducers: config.metaReducers ? config.metaReducers : [],
                        initialState: config.initialState,
                    }),
                },
                { provide: _FEATURE_REDUCERS, multi: true, useValue: reducers },
                {
                    provide: _FEATURE_REDUCERS_TOKEN,
                    multi: true,
                    useExisting: reducers instanceof InjectionToken ? reducers : _FEATURE_REDUCERS,
                },
                {
                    provide: FEATURE_REDUCERS,
                    multi: true,
                    deps: [
                        Injector,
                        _FEATURE_REDUCERS,
                        [new Inject(_FEATURE_REDUCERS_TOKEN)],
                    ],
                    useFactory: _createFeatureReducers,
                },
            ],
        };
    }
}
StoreModule.decorators = [
    { type: NgModule, args: [{},] }
];
/**
 * @param {?} injector
 * @param {?} reducers
 * @param {?} tokenReducers
 * @return {?}
 */
function _createStoreReducers(injector, reducers, tokenReducers) {
    return reducers instanceof InjectionToken ? injector.get(reducers) : reducers;
}
/**
 * @param {?} injector
 * @param {?} reducerCollection
 * @param {?} tokenReducerCollection
 * @return {?}
 */
function _createFeatureReducers(injector, reducerCollection, tokenReducerCollection) {
    const /** @type {?} */ reducers = reducerCollection.map((reducer, index) => {
        return reducer instanceof InjectionToken ? injector.get(reducer) : reducer;
    });
    return reducers;
}
/**
 * @param {?} initialState
 * @return {?}
 */
function _initialStateFactory(initialState) {
    if (typeof initialState === 'function') {
        return initialState();
    }
    return initialState;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * DO NOT EDIT
 *
 * This file is automatically generated at build
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ACTIONS_SUBJECT_PROVIDERS as ɵngrx_modules_store_store_c, REDUCER_MANAGER_PROVIDERS as ɵngrx_modules_store_store_d, SCANNED_ACTIONS_SUBJECT_PROVIDERS as ɵngrx_modules_store_store_e, STATE_PROVIDERS as ɵngrx_modules_store_store_f, STORE_PROVIDERS as ɵngrx_modules_store_store_b, Store, select, combineReducers, compose, createReducerFactory, ActionsSubject, INIT, ReducerManager, ReducerObservable, ReducerManagerDispatcher, UPDATE, ScannedActionsSubject, createSelector, createSelectorFactory, createFeatureSelector, defaultMemoize, defaultStateFn, State, StateObservable, reduceState, INITIAL_STATE, _REDUCER_FACTORY, REDUCER_FACTORY, _INITIAL_REDUCERS, INITIAL_REDUCERS, STORE_FEATURES, _INITIAL_STATE, META_REDUCERS, _STORE_REDUCERS, _FEATURE_REDUCERS, FEATURE_REDUCERS, _FEATURE_REDUCERS_TOKEN, StoreModule, StoreRootModule, StoreFeatureModule, _initialStateFactory, _createStoreReducers, _createFeatureReducers };
//# sourceMappingURL=store.js.map
