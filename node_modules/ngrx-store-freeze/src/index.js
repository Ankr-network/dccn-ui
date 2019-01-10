"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var deepFreeze = require('deep-freeze-strict');
function storeFreeze(reducer) {
    return function freeze(state, action) {
        state = state || {};
        deepFreeze(state);
        // guard against trying to freeze null or undefined types
        if (action.payload) {
            deepFreeze(action.payload);
        }
        var nextState = reducer(state, action);
        deepFreeze(nextState);
        return nextState;
    };
}
exports.storeFreeze = storeFreeze;
//# sourceMappingURL=index.js.map