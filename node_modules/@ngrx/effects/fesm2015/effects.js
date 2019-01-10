/**
 * @license NgRx 6.0.1
 * (c) 2015-2018 Brandon Roberts, Mike Ryan, Rob Wormald, Victor Savkin
 * License: MIT
 */
import { ScannedActionsSubject, Store, StoreFeatureModule, StoreRootModule, compose } from '@ngrx/store';
import { Observable, Subject, merge } from 'rxjs';
import { dematerialize, exhaustMap, filter, groupBy, ignoreElements, map, materialize, mergeMap } from 'rxjs/operators';
import { ErrorHandler, Inject, Injectable, InjectionToken, NgModule, Optional } from '@angular/core';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const METADATA_KEY = '__@ngrx/effects__';
/**
 * @record
 */

/**
 * @param {?} sourceProto
 * @return {?}
 */
function getEffectMetadataEntries(sourceProto) {
    return sourceProto.constructor[METADATA_KEY] || [];
}
/**
 * @param {?} sourceProto
 * @param {?} entries
 * @return {?}
 */
function setEffectMetadataEntries(sourceProto, entries) {
    const /** @type {?} */ constructor = sourceProto.constructor;
    const /** @type {?} */ meta = constructor.hasOwnProperty(METADATA_KEY)
        ? (/** @type {?} */ (constructor))[METADATA_KEY]
        : Object.defineProperty(constructor, METADATA_KEY, { value: [] })[METADATA_KEY];
    Array.prototype.push.apply(meta, entries);
}
/**
 * @param {?=} __0
 * @return {?}
 */
function Effect({ dispatch } = { dispatch: true }) {
    return /** @type {?} */ (function (target, propertyName) {
        const /** @type {?} */ metadata = { propertyName, dispatch };
        setEffectMetadataEntries(target, [metadata]);
    } /*TODO(#823)*/);
}
/**
 * @param {?} instance
 * @return {?}
 */
function getSourceForInstance(instance) {
    return Object.getPrototypeOf(instance);
}
const getSourceMetadata = compose(getEffectMetadataEntries, getSourceForInstance);
/**
 * @template T
 * @param {?} instance
 * @return {?}
 */
function getEffectsMetadata(instance) {
    const /** @type {?} */ metadata = {};
    getSourceMetadata(instance).forEach(({ propertyName, dispatch }) => {
        (/** @type {?} */ (metadata))[propertyName] = { dispatch };
    });
    return metadata;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 */

const onRunEffectsKey = 'ngrxOnRunEffects';
/**
 * @param {?} sourceInstance
 * @return {?}
 */
function isOnRunEffects(sourceInstance) {
    const /** @type {?} */ source = getSourceForInstance(sourceInstance);
    return (onRunEffectsKey in source && typeof source[onRunEffectsKey] === 'function');
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} sourceInstance
 * @return {?}
 */
function mergeEffects(sourceInstance) {
    const /** @type {?} */ sourceName = getSourceForInstance(sourceInstance).constructor.name;
    const /** @type {?} */ observables = getSourceMetadata(sourceInstance).map(({ propertyName, dispatch }) => {
        const /** @type {?} */ observable = typeof sourceInstance[propertyName] === 'function'
            ? sourceInstance[propertyName]()
            : sourceInstance[propertyName];
        if (dispatch === false) {
            return observable.pipe(ignoreElements());
        }
        const /** @type {?} */ materialized$ = observable.pipe(materialize());
        return materialized$.pipe(map((notification) => ({
            effect: sourceInstance[propertyName],
            notification,
            propertyName,
            sourceName,
            sourceInstance,
        })));
    });
    return merge(...observables);
}
/**
 * @param {?} sourceInstance
 * @return {?}
 */
function resolveEffectSource(sourceInstance) {
    const /** @type {?} */ mergedEffects$ = mergeEffects(sourceInstance);
    if (isOnRunEffects(sourceInstance)) {
        return sourceInstance.ngrxOnRunEffects(mergedEffects$);
    }
    return mergedEffects$;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @template V
 */
class Actions extends Observable {
    /**
     * @param {?=} source
     */
    constructor(source) {
        super();
        if (source) {
            this.source = source;
        }
    }
    /**
     * @template R
     * @param {?} operator
     * @return {?}
     */
    lift(operator) {
        const /** @type {?} */ observable = new Actions();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }
    /**
     * @template V2
     * @param {...?} allowedTypes
     * @return {?}
     */
    ofType(...allowedTypes) {
        return /** @type {?} */ (ofType(...allowedTypes)(/** @type {?} */ (this)));
    }
}
Actions.decorators = [
    { type: Injectable }
];
/** @nocollapse */
Actions.ctorParameters = () => [
    { type: Observable, decorators: [{ type: Inject, args: [ScannedActionsSubject,] },] },
];
/**
 * @template T
 * @param {...?} allowedTypes
 * @return {?}
 */
function ofType(...allowedTypes) {
    return filter((action) => allowedTypes.some(type => type === action.type));
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 */

/**
 * @param {?} output
 * @param {?} reporter
 * @return {?}
 */
function verifyOutput(output, reporter) {
    reportErrorThrown(output, reporter);
    reportInvalidActions(output, reporter);
}
/**
 * @param {?} output
 * @param {?} reporter
 * @return {?}
 */
function reportErrorThrown(output, reporter) {
    if (output.notification.kind === 'E') {
        reporter.handleError(output.notification.error);
    }
}
/**
 * @param {?} output
 * @param {?} reporter
 * @return {?}
 */
function reportInvalidActions(output, reporter) {
    if (output.notification.kind === 'N') {
        const /** @type {?} */ action = output.notification.value;
        const /** @type {?} */ isInvalidAction = !isAction(action);
        if (isInvalidAction) {
            reporter.handleError(new Error(`Effect ${getEffectName(output)} dispatched an invalid action: ${action}`));
        }
    }
}
/**
 * @param {?} action
 * @return {?}
 */
function isAction(action) {
    return action && action.type && typeof action.type === 'string';
}
/**
 * @param {?} __0
 * @return {?}
 */
function getEffectName({ propertyName, sourceInstance, sourceName, }) {
    const /** @type {?} */ isMethod = typeof sourceInstance[propertyName] === 'function';
    return `"${sourceName}.${propertyName}${isMethod ? '()' : ''}"`;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class EffectSources extends Subject {
    /**
     * @param {?} errorHandler
     */
    constructor(errorHandler) {
        super();
        this.errorHandler = errorHandler;
    }
    /**
     * @param {?} effectSourceInstance
     * @return {?}
     */
    addEffects(effectSourceInstance) {
        this.next(effectSourceInstance);
    }
    /**
     * \@internal
     * @return {?}
     */
    toActions() {
        return this.pipe(groupBy(getSourceForInstance), mergeMap(source$ => source$.pipe(exhaustMap(resolveEffectSource), map(output => {
            verifyOutput(output, this.errorHandler);
            return output.notification;
        }), filter((notification) => notification.kind === 'N'), dematerialize())));
    }
}
EffectSources.decorators = [
    { type: Injectable }
];
/** @nocollapse */
EffectSources.ctorParameters = () => [
    { type: ErrorHandler, },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const IMMEDIATE_EFFECTS = new InjectionToken('ngrx/effects: Immediate Effects');
const ROOT_EFFECTS = new InjectionToken('ngrx/effects: Root Effects');
const FEATURE_EFFECTS = new InjectionToken('ngrx/effects: Feature Effects');

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class EffectsRunner {
    /**
     * @param {?} effectSources
     * @param {?} store
     */
    constructor(effectSources, store$$1) {
        this.effectSources = effectSources;
        this.store = store$$1;
        this.effectsSubscription = null;
    }
    /**
     * @return {?}
     */
    start() {
        if (!this.effectsSubscription) {
            this.effectsSubscription = this.effectSources
                .toActions()
                .subscribe(this.store);
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this.effectsSubscription) {
            this.effectsSubscription.unsubscribe();
            this.effectsSubscription = null;
        }
    }
}
EffectsRunner.decorators = [
    { type: Injectable }
];
/** @nocollapse */
EffectsRunner.ctorParameters = () => [
    { type: EffectSources, },
    { type: Store, },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const ROOT_EFFECTS_INIT = '@ngrx/effects/init';
class EffectsRootModule {
    /**
     * @param {?} sources
     * @param {?} runner
     * @param {?} store
     * @param {?} rootEffects
     * @param {?} storeRootModule
     * @param {?} storeFeatureModule
     */
    constructor(sources, runner, store$$1, rootEffects, storeRootModule, storeFeatureModule) {
        this.sources = sources;
        runner.start();
        rootEffects.forEach(effectSourceInstance => sources.addEffects(effectSourceInstance));
        store$$1.dispatch({ type: ROOT_EFFECTS_INIT });
    }
    /**
     * @param {?} effectSourceInstance
     * @return {?}
     */
    addEffects(effectSourceInstance) {
        this.sources.addEffects(effectSourceInstance);
    }
}
EffectsRootModule.decorators = [
    { type: NgModule, args: [{},] }
];
/** @nocollapse */
EffectsRootModule.ctorParameters = () => [
    { type: EffectSources, },
    { type: EffectsRunner, },
    { type: Store, },
    { type: Array, decorators: [{ type: Inject, args: [ROOT_EFFECTS,] },] },
    { type: StoreRootModule, decorators: [{ type: Optional },] },
    { type: StoreFeatureModule, decorators: [{ type: Optional },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class EffectsFeatureModule {
    /**
     * @param {?} root
     * @param {?} effectSourceGroups
     * @param {?} storeRootModule
     * @param {?} storeFeatureModule
     */
    constructor(root, effectSourceGroups, storeRootModule, storeFeatureModule) {
        this.root = root;
        effectSourceGroups.forEach(group => group.forEach(effectSourceInstance => root.addEffects(effectSourceInstance)));
    }
}
EffectsFeatureModule.decorators = [
    { type: NgModule, args: [{},] }
];
/** @nocollapse */
EffectsFeatureModule.ctorParameters = () => [
    { type: EffectsRootModule, },
    { type: Array, decorators: [{ type: Inject, args: [FEATURE_EFFECTS,] },] },
    { type: StoreRootModule, decorators: [{ type: Optional },] },
    { type: StoreFeatureModule, decorators: [{ type: Optional },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class EffectsModule {
    /**
     * @param {?} featureEffects
     * @return {?}
     */
    static forFeature(featureEffects) {
        return {
            ngModule: EffectsFeatureModule,
            providers: [
                featureEffects,
                {
                    provide: FEATURE_EFFECTS,
                    multi: true,
                    deps: featureEffects,
                    useFactory: createSourceInstances,
                },
            ],
        };
    }
    /**
     * @param {?} rootEffects
     * @return {?}
     */
    static forRoot(rootEffects) {
        return {
            ngModule: EffectsRootModule,
            providers: [
                EffectsRunner,
                EffectSources,
                Actions,
                rootEffects,
                {
                    provide: ROOT_EFFECTS,
                    deps: rootEffects,
                    useFactory: createSourceInstances,
                },
            ],
        };
    }
}
EffectsModule.decorators = [
    { type: NgModule, args: [{},] }
];
/**
 * @param {...?} instances
 * @return {?}
 */
function createSourceInstances(...instances) {
    return instances;
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

export { EffectsFeatureModule as ɵngrx_modules_effects_effects_c, createSourceInstances as ɵngrx_modules_effects_effects_a, EffectsRootModule as ɵngrx_modules_effects_effects_b, EffectsRunner as ɵngrx_modules_effects_effects_f, FEATURE_EFFECTS as ɵngrx_modules_effects_effects_e, ROOT_EFFECTS as ɵngrx_modules_effects_effects_d, Effect, getEffectsMetadata, mergeEffects, Actions, ofType, EffectsModule, EffectSources, ROOT_EFFECTS_INIT };
//# sourceMappingURL=effects.js.map
