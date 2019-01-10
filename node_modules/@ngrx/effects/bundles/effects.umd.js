/**
 * @license NgRx 6.0.1
 * (c) 2015-2018 Brandon Roberts, Mike Ryan, Rob Wormald, Victor Savkin
 * License: MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@ngrx/store'), require('rxjs'), require('rxjs/operators'), require('@angular/core')) :
	typeof define === 'function' && define.amd ? define('@ngrx/effects', ['exports', '@ngrx/store', 'rxjs', 'rxjs/operators', '@angular/core'], factory) :
	(factory((global.ngrx = global.ngrx || {}, global.ngrx.effects = {}),global['@ngrx/store'],global.rxjs,global.rxjs.operators,global.ng.core));
}(this, (function (exports,store,rxjs,operators,core) { 'use strict';

var METADATA_KEY = '__@ngrx/effects__';
function getEffectMetadataEntries(sourceProto) {
    return sourceProto.constructor[METADATA_KEY] || [];
}
function setEffectMetadataEntries(sourceProto, entries) {
    var constructor = sourceProto.constructor;
    var meta = constructor.hasOwnProperty(METADATA_KEY)
        ? constructor[METADATA_KEY]
        : Object.defineProperty(constructor, METADATA_KEY, { value: [] })[METADATA_KEY];
    Array.prototype.push.apply(meta, entries);
}
function Effect(_a) {
    var dispatch = (_a === void 0 ? { dispatch: true } : _a).dispatch;
    return function (target, propertyName) {
        var metadata = { propertyName: propertyName, dispatch: dispatch };
        setEffectMetadataEntries(target, [metadata]);
    } /*TODO(#823)*/;
}
function getSourceForInstance(instance) {
    return Object.getPrototypeOf(instance);
}
var getSourceMetadata = store.compose(getEffectMetadataEntries, getSourceForInstance);
function getEffectsMetadata(instance) {
    var metadata = {};
    getSourceMetadata(instance).forEach(function (_a) {
        var propertyName = _a.propertyName, dispatch = _a.dispatch;
        metadata[propertyName] = { dispatch: dispatch };
    });
    return metadata;
}

var onRunEffectsKey = 'ngrxOnRunEffects';
function isOnRunEffects(sourceInstance) {
    var source = getSourceForInstance(sourceInstance);
    return (onRunEffectsKey in source && typeof source[onRunEffectsKey] === 'function');
}

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
function mergeEffects(sourceInstance) {
    var sourceName = getSourceForInstance(sourceInstance).constructor.name;
    var observables = getSourceMetadata(sourceInstance).map(function (_a) {
        var propertyName = _a.propertyName, dispatch = _a.dispatch;
        var observable = typeof sourceInstance[propertyName] === 'function'
            ? sourceInstance[propertyName]()
            : sourceInstance[propertyName];
        if (dispatch === false) {
            return observable.pipe(operators.ignoreElements());
        }
        var materialized$ = observable.pipe(operators.materialize());
        return materialized$.pipe(operators.map(function (notification) {
            return ({
                effect: sourceInstance[propertyName],
                notification: notification,
                propertyName: propertyName,
                sourceName: sourceName,
                sourceInstance: sourceInstance,
            });
        }));
    });
    return rxjs.merge.apply(void 0, __spread(observables));
}
function resolveEffectSource(sourceInstance) {
    var mergedEffects$ = mergeEffects(sourceInstance);
    if (isOnRunEffects(sourceInstance)) {
        return sourceInstance.ngrxOnRunEffects(mergedEffects$);
    }
    return mergedEffects$;
}

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
var Actions = /** @class */ (function (_super) {
    __extends(Actions, _super);
    function Actions(source) {
        var _this = _super.call(this) || this;
        if (source) {
            _this.source = source;
        }
        return _this;
    }
    Actions.prototype.lift = function (operator) {
        var observable = new Actions();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Actions.prototype.ofType = function () {
        var allowedTypes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            allowedTypes[_i] = arguments[_i];
        }
        return ofType.apply(void 0, __spread$1(allowedTypes))(this);
    };
    Actions.decorators = [
        { type: core.Injectable }
    ];
    /** @nocollapse */
    Actions.ctorParameters = function () { return [
        { type: rxjs.Observable, decorators: [{ type: core.Inject, args: [store.ScannedActionsSubject,] },] },
    ]; };
    return Actions;
}(rxjs.Observable));
function ofType() {
    var allowedTypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        allowedTypes[_i] = arguments[_i];
    }
    return operators.filter(function (action) {
        return allowedTypes.some(function (type) { return type === action.type; });
    });
}

function verifyOutput(output, reporter) {
    reportErrorThrown(output, reporter);
    reportInvalidActions(output, reporter);
}
function reportErrorThrown(output, reporter) {
    if (output.notification.kind === 'E') {
        reporter.handleError(output.notification.error);
    }
}
function reportInvalidActions(output, reporter) {
    if (output.notification.kind === 'N') {
        var action = output.notification.value;
        var isInvalidAction = !isAction(action);
        if (isInvalidAction) {
            reporter.handleError(new Error("Effect " + getEffectName(output) + " dispatched an invalid action: " + action));
        }
    }
}
function isAction(action) {
    return action && action.type && typeof action.type === 'string';
}
function getEffectName(_a) {
    var propertyName = _a.propertyName, sourceInstance = _a.sourceInstance, sourceName = _a.sourceName;
    var isMethod = typeof sourceInstance[propertyName] === 'function';
    return "\"" + sourceName + "." + propertyName + (isMethod ? '()' : '') + "\"";
}

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
var EffectSources = /** @class */ (function (_super) {
    __extends$1(EffectSources, _super);
    function EffectSources(errorHandler) {
        var _this = _super.call(this) || this;
        _this.errorHandler = errorHandler;
        return _this;
    }
    EffectSources.prototype.addEffects = function (effectSourceInstance) {
        this.next(effectSourceInstance);
    };
    /**
     * @internal
     */
    /**
       * @internal
       */
    EffectSources.prototype.toActions = /**
       * @internal
       */
    function () {
        var _this = this;
        return this.pipe(operators.groupBy(getSourceForInstance), operators.mergeMap(function (source$) {
            return source$.pipe(operators.exhaustMap(resolveEffectSource), operators.map(function (output) {
                verifyOutput(output, _this.errorHandler);
                return output.notification;
            }), operators.filter(function (notification) {
                return notification.kind === 'N';
            }), operators.dematerialize());
        }));
    };
    EffectSources.decorators = [
        { type: core.Injectable }
    ];
    /** @nocollapse */
    EffectSources.ctorParameters = function () { return [
        { type: core.ErrorHandler, },
    ]; };
    return EffectSources;
}(rxjs.Subject));

var IMMEDIATE_EFFECTS = new core.InjectionToken('ngrx/effects: Immediate Effects');
var ROOT_EFFECTS = new core.InjectionToken('ngrx/effects: Root Effects');
var FEATURE_EFFECTS = new core.InjectionToken('ngrx/effects: Feature Effects');

var EffectsRunner = /** @class */ (function () {
    function EffectsRunner(effectSources, store$$1) {
        this.effectSources = effectSources;
        this.store = store$$1;
        this.effectsSubscription = null;
    }
    EffectsRunner.prototype.start = function () {
        if (!this.effectsSubscription) {
            this.effectsSubscription = this.effectSources
                .toActions()
                .subscribe(this.store);
        }
    };
    EffectsRunner.prototype.ngOnDestroy = function () {
        if (this.effectsSubscription) {
            this.effectsSubscription.unsubscribe();
            this.effectsSubscription = null;
        }
    };
    EffectsRunner.decorators = [
        { type: core.Injectable }
    ];
    /** @nocollapse */
    EffectsRunner.ctorParameters = function () { return [
        { type: EffectSources, },
        { type: store.Store, },
    ]; };
    return EffectsRunner;
}());

var ROOT_EFFECTS_INIT = '@ngrx/effects/init';
var EffectsRootModule = /** @class */ (function () {
    function EffectsRootModule(sources, runner, store$$1, rootEffects, storeRootModule, storeFeatureModule) {
        this.sources = sources;
        runner.start();
        rootEffects.forEach(function (effectSourceInstance) {
            return sources.addEffects(effectSourceInstance);
        });
        store$$1.dispatch({ type: ROOT_EFFECTS_INIT });
    }
    EffectsRootModule.prototype.addEffects = function (effectSourceInstance) {
        this.sources.addEffects(effectSourceInstance);
    };
    EffectsRootModule.decorators = [
        { type: core.NgModule, args: [{},] }
    ];
    /** @nocollapse */
    EffectsRootModule.ctorParameters = function () { return [
        { type: EffectSources, },
        { type: EffectsRunner, },
        { type: store.Store, },
        { type: Array, decorators: [{ type: core.Inject, args: [ROOT_EFFECTS,] },] },
        { type: store.StoreRootModule, decorators: [{ type: core.Optional },] },
        { type: store.StoreFeatureModule, decorators: [{ type: core.Optional },] },
    ]; };
    return EffectsRootModule;
}());

var EffectsFeatureModule = /** @class */ (function () {
    function EffectsFeatureModule(root, effectSourceGroups, storeRootModule, storeFeatureModule) {
        this.root = root;
        effectSourceGroups.forEach(function (group) {
            return group.forEach(function (effectSourceInstance) {
                return root.addEffects(effectSourceInstance);
            });
        });
    }
    EffectsFeatureModule.decorators = [
        { type: core.NgModule, args: [{},] }
    ];
    /** @nocollapse */
    EffectsFeatureModule.ctorParameters = function () { return [
        { type: EffectsRootModule, },
        { type: Array, decorators: [{ type: core.Inject, args: [FEATURE_EFFECTS,] },] },
        { type: store.StoreRootModule, decorators: [{ type: core.Optional },] },
        { type: store.StoreFeatureModule, decorators: [{ type: core.Optional },] },
    ]; };
    return EffectsFeatureModule;
}());

var EffectsModule = /** @class */ (function () {
    function EffectsModule() {
    }
    EffectsModule.forFeature = function (featureEffects) {
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
    };
    EffectsModule.forRoot = function (rootEffects) {
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
    };
    EffectsModule.decorators = [
        { type: core.NgModule, args: [{},] }
    ];
    return EffectsModule;
}());
function createSourceInstances() {
    var instances = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        instances[_i] = arguments[_i];
    }
    return instances;
}

/**
 * DO NOT EDIT
 *
 * This file is automatically generated at build
 */

/**
 * Generated bundle index. Do not edit.
 */

exports.ɵngrx_modules_effects_effects_c = EffectsFeatureModule;
exports.ɵngrx_modules_effects_effects_a = createSourceInstances;
exports.ɵngrx_modules_effects_effects_b = EffectsRootModule;
exports.ɵngrx_modules_effects_effects_f = EffectsRunner;
exports.ɵngrx_modules_effects_effects_e = FEATURE_EFFECTS;
exports.ɵngrx_modules_effects_effects_d = ROOT_EFFECTS;
exports.Effect = Effect;
exports.getEffectsMetadata = getEffectsMetadata;
exports.mergeEffects = mergeEffects;
exports.Actions = Actions;
exports.ofType = ofType;
exports.EffectsModule = EffectsModule;
exports.EffectSources = EffectSources;
exports.ROOT_EFFECTS_INIT = ROOT_EFFECTS_INIT;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=effects.umd.js.map
