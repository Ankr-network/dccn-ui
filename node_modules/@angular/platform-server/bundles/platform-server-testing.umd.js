/**
 * @license Angular v6.1.1
 * (c) 2010-2018 Google, Inc. https://angular.io/
 * License: MIT
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/platform-browser-dynamic/testing'), require('@angular/platform-browser/animations'), require('@angular/platform-server')) :
    typeof define === 'function' && define.amd ? define('@angular/platform-server/testing', ['exports', '@angular/core', '@angular/platform-browser-dynamic/testing', '@angular/platform-browser/animations', '@angular/platform-server'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.platformServer = global.ng.platformServer || {}, global.ng.platformServer.testing = {}),global.ng.core,global.ng.platformBrowserDynamic.testing,global.ng.platformBrowser.animations,global.ng.platformServer));
}(this, (function (exports,core,testing,animations,platformServer) { 'use strict';

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Platform for testing
     *
     * @experimental API related to bootstrapping are still under review.
     */
    var platformServerTesting = core.createPlatformFactory(testing.ɵplatformCoreDynamicTesting, 'serverTesting', platformServer.ɵINTERNAL_SERVER_PLATFORM_PROVIDERS);
    /**
     * NgModule for testing.
     *
     * @experimental API related to bootstrapping are still under review.
     */
    var ServerTestingModule = /** @class */ (function () {
        function ServerTestingModule() {
        }
        ServerTestingModule.decorators = [
            { type: core.NgModule, args: [{
                        exports: [testing.BrowserDynamicTestingModule],
                        imports: [animations.NoopAnimationsModule],
                        providers: platformServer.ɵSERVER_RENDER_PROVIDERS
                    },] }
        ];
        return ServerTestingModule;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    // This file only reexports content of the `src` folder. Keep it that way.

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.platformServerTesting = platformServerTesting;
    exports.ServerTestingModule = ServerTestingModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=platform-server-testing.umd.js.map
