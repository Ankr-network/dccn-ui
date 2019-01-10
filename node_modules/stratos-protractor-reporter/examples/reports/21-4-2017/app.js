var app = angular.module('reportingApp', []);

app.controller('ScreenshotReportController', function ($scope) {
    $scope.searchSettings = {
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true,
    };

    $scope.inlineScreenshots = false;
    this.showSmartStackTraceHighlight = true;

    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }
        
        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.getParent = function (str) {
        var arr = str.split('|');
        str = "";
        for (var i = arr.length - 2; i > 0; i--) {
            str += arr[i] + " > ";
        }
        return str.slice(0, -3);
    };

    this.specLevel = function (str) {
        var arr = str.split('|');
        str = "";
        if (arr.length < 3) {
            return true;
        }
        return false;
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };


    this.getShortDescription = function (str) {
        return str.split('|')[0];
    };


    this.nToBr = function (str) {
        return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
    };


    this.convertTimestamp = function (timestamp) {
        var d = new Date(timestamp),
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),
            dd = ('0' + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh == 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    };


    this.round = function (number, roundVal) {
        return parseFloat(number).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {passCount++};
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {pendingCount++};
        }
        return pendingCount;
    };


    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {failCount++}
        }
        return failCount;
    };

    this.applySmartHighlight = function (line) {
        if (this.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return true;
    };


    this.results =[
    {
        "description": "should fail as greeting text is different|angularjs homepage",
        "passed": false,
        "pending": false,
        "os": "MAC",
        "sessionId": "1de887f2-c9d6-4d26-ac67-8ed6943e69b2",
        "browser": {
            "name": "chrome",
            "version": "57.0.2987.133"
        },
        "message": "Expected 'Hello Julie!' to equal 'Hello Julie hello!'.",
        "trace": "Error: Failed expectation\n    at Object.<anonymous> (/Users/evilweed/protractor-beautiful-reporter/examples/specs/example_spec.js:13:45)\n    at /Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasminewd2/index.js:110:25\n    at new ManagedPromise (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:1067:7)\n    at ControlFlow.promise (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:2396:12)\n    at schedulerExecute (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasminewd2/index.js:95:18)\n    at TaskQueue.execute_ (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:2970:14)\n    at TaskQueue.executeNext_ (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:2953:27)\n    at asyncRun (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:2860:25)\n    at /Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:676:7",
        "browserLogs": [],
        "screenShotFile": "images/should fail as greeting text is different-angularjs homepage.png",
        "duration": 4.767
    },
    {
        "description": "should greet the named user|angularjs homepage",
        "passed": true,
        "pending": false,
        "os": "MAC",
        "sessionId": "1de887f2-c9d6-4d26-ac67-8ed6943e69b2",
        "browser": {
            "name": "chrome",
            "version": "57.0.2987.133"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "duration": 2.473
    },
    {
        "description": "should contain log and pretty stack trace|angularjs homepage",
        "passed": false,
        "pending": false,
        "os": "MAC",
        "sessionId": "1de887f2-c9d6-4d26-ac67-8ed6943e69b2",
        "browser": {
            "name": "chrome",
            "version": "57.0.2987.133"
        },
        "message": "Failed: unknown error: Runtime.evaluate threw exception: SyntaxError: Unexpected token throw\n  (Session info: chrome=57.0.2987.133)\n  (Driver info: chromedriver=2.29.461585 (0be2cd95f834e9ee7c46bcc7cf405b483f5ae83b),platform=Mac OS X 10.11.5 x86_64) (WARNING: The server did not provide any stacktrace information)\nCommand duration or timeout: 6 milliseconds\nBuild info: version: '3.4.0', revision: 'unknown', time: 'unknown'\nSystem info: host: 'iMac-mczernow.local', ip: '192.168.0.114', os.name: 'Mac OS X', os.arch: 'x86_64', os.version: '10.11.5', java.version: '1.8.0_121'\nDriver info: org.openqa.selenium.chrome.ChromeDriver\nCapabilities [{applicationCacheEnabled=false, rotatable=false, mobileEmulationEnabled=false, networkConnectionEnabled=false, chrome={chromedriverVersion=2.29.461585 (0be2cd95f834e9ee7c46bcc7cf405b483f5ae83b), userDataDir=/var/folders/h5/6wmqsrbd0bqf348fzbmr9fh80000gp/T/.org.chromium.Chromium.0EBcSq}, takesHeapSnapshot=true, pageLoadStrategy=normal, databaseEnabled=false, handlesAlerts=true, hasTouchScreen=false, version=57.0.2987.133, platform=MAC, browserConnectionEnabled=false, nativeEvents=true, acceptSslCerts=true, locationContextEnabled=true, webStorageEnabled=true, browserName=chrome, takesScreenshot=true, javascriptEnabled=true, cssSelectorsEnabled=true, unexpectedAlertBehaviour=}]\nSession ID: 9978e968ba03efed77e1c17bcb73d74f",
        "trace": "WebDriverError: unknown error: Runtime.evaluate threw exception: SyntaxError: Unexpected token throw\n  (Session info: chrome=57.0.2987.133)\n  (Driver info: chromedriver=2.29.461585 (0be2cd95f834e9ee7c46bcc7cf405b483f5ae83b),platform=Mac OS X 10.11.5 x86_64) (WARNING: The server did not provide any stacktrace information)\nCommand duration or timeout: 6 milliseconds\nBuild info: version: '3.4.0', revision: 'unknown', time: 'unknown'\nSystem info: host: 'iMac-mczernow.local', ip: '192.168.0.114', os.name: 'Mac OS X', os.arch: 'x86_64', os.version: '10.11.5', java.version: '1.8.0_121'\nDriver info: org.openqa.selenium.chrome.ChromeDriver\nCapabilities [{applicationCacheEnabled=false, rotatable=false, mobileEmulationEnabled=false, networkConnectionEnabled=false, chrome={chromedriverVersion=2.29.461585 (0be2cd95f834e9ee7c46bcc7cf405b483f5ae83b), userDataDir=/var/folders/h5/6wmqsrbd0bqf348fzbmr9fh80000gp/T/.org.chromium.Chromium.0EBcSq}, takesHeapSnapshot=true, pageLoadStrategy=normal, databaseEnabled=false, handlesAlerts=true, hasTouchScreen=false, version=57.0.2987.133, platform=MAC, browserConnectionEnabled=false, nativeEvents=true, acceptSslCerts=true, locationContextEnabled=true, webStorageEnabled=true, browserName=chrome, takesScreenshot=true, javascriptEnabled=true, cssSelectorsEnabled=true, unexpectedAlertBehaviour=}]\nSession ID: 9978e968ba03efed77e1c17bcb73d74f\n    at WebDriverError (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/error.js:27:5)\n    at Object.checkLegacyResponse (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/error.js:505:15)\n    at parseHttpResponse (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at doSend.then.response (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/http.js:440:13)\n    at process._tickCallback (internal/process/next_tick.js:103:7)\nFrom: Task: WebDriver.executeScript()\n    at thenableWebDriverProxy.schedule (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/webdriver.js:816:17)\n    at thenableWebDriverProxy.executeScript (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/webdriver.js:887:16)\n    at run (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/protractor/lib/browser.ts:66:27)\n    at ProtractorBrowser.to.(anonymous function) [as executeScript] (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/protractor/lib/browser.ts:74:12)\n    at Object.<anonymous> (/Users/evilweed/protractor-beautiful-reporter/examples/specs/example_spec.js:26:17)\n    at /Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasminewd2/index.js:110:25\n    at new ManagedPromise (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:1067:7)\n    at ControlFlow.promise (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:2396:12)\n    at schedulerExecute (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasminewd2/index.js:95:18)\n    at TaskQueue.execute_ (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:2970:14)\nFrom: Task: Run it(\"should contain log and pretty stack trace\") in control flow\n    at Object.<anonymous> (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasminewd2/index.js:94:19)\n    at attemptAsync (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1980:24)\n    at QueueRunner.run (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1935:9)\n    at /Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1962:16\n    at /Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1905:9\n    at /Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:2565:10)\n    at shutdownTask_.MicroTask (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:2490:53)\n    at MicroTask.asyncRun (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/selenium-webdriver/lib/promise.js:2619:9)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/Users/evilweed/protractor-beautiful-reporter/examples/specs/example_spec.js:21:5)\n    at addSpecsToSuite (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:867:25)\n    at Env.describe (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:836:7)\n    at describe (/Users/evilweed/protractor-beautiful-reporter/examples/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:3576:18)\n    at Object.<anonymous> (/Users/evilweed/protractor-beautiful-reporter/examples/specs/example_spec.js:3:1)\n    at Module._compile (module.js:570:32)\n    at Object.Module._extensions..js (module.js:579:10)\n    at Module.load (module.js:487:32)\n    at tryModuleLoad (module.js:446:12)",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "console-api 357:40 \"This is some kind of warning!\"",
                "timestamp": 1492781725413,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "console-api 357:40 \"This is some kind of warning!\"",
                "timestamp": 1492781725438,
                "type": ""
            }
        ],
        "screenShotFile": "images/should contain log and pretty stack trace-angularjs homepage.png",
        "duration": 2.538
    },
    {
        "description": "should list todos|todo list|angularjs homepage",
        "passed": true,
        "pending": false,
        "os": "MAC",
        "sessionId": "1de887f2-c9d6-4d26-ac67-8ed6943e69b2",
        "browser": {
            "name": "chrome",
            "version": "57.0.2987.133"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "duration": 1.956
    },
    {
        "description": "should display first todo with proper text|todo list|angularjs homepage",
        "passed": true,
        "pending": false,
        "os": "MAC",
        "sessionId": "1de887f2-c9d6-4d26-ac67-8ed6943e69b2",
        "browser": {
            "name": "chrome",
            "version": "57.0.2987.133"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "duration": 1.949
    }
];
});

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            countLogMessages(item);

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    checkIfShouldDisplaySpecName(prevItem, item);
                    filtered.push(item);
                    var prevItem = item;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    checkIfShouldDisplaySpecName(prevItem, item);
                    filtered.push(item);
                    var prevItem = item;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    checkIfShouldDisplaySpecName(prevItem, item);
                    filtered.push(item);
                    var prevItem = item;
                }

            }
        }

        return filtered;
    };
});

var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
        return;
    }

    if (getSpec(item.description) != getSpec(prevItem.description)) {
        item.displaySpecName = true;
        return;
    }
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length-1];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};