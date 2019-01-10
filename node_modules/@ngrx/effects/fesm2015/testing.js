/**
 * @license NgRx 6.0.1
 * (c) 2015-2018 Brandon Roberts, Mike Ryan, Rob Wormald, Victor Savkin
 * License: MIT
 */
import { Actions } from '@ngrx/effects';
import { defer } from 'rxjs';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} factoryOrSource
 * @return {?}
 */
function provideMockActions(factoryOrSource) {
    return {
        provide: Actions,
        useFactory: () => {
            if (typeof factoryOrSource === 'function') {
                return new Actions(defer(factoryOrSource));
            }
            return new Actions(factoryOrSource);
        },
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * Generated bundle index. Do not edit.
 */

export { provideMockActions };
//# sourceMappingURL=testing.js.map
