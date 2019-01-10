var HtmlReporter = require('protractor-beautiful-reporter');
var path = require('path');


// ----- Config example for Jasmine 1 -----
// Please note that package.json is configured with 'Jasmine 2'
// If You would like to check this config instead please change protractor version in package.json to '^0.14.0':

exports.config = {

    // ----- How to setup Selenium -----
    //
    // There are three ways to specify how to use Selenium. Specify one of the
    // following:
    //
    // 1. seleniumServerJar - to start Selenium Standalone locally.
    // 2. seleniumAddress - to connect to a Selenium server which is already
    //    running.
    // 3. sauceUser/sauceKey - to use remote Selenium servers via SauceLabs.

    // The location of the selenium standalone server .jar file.
    //seleniumServerJar: 'node_modules/protractor/selenium/selenium-server-standalone-2.37.0.jar',

    // Address of selenium server (before running protractor, run "webdriver-manager start" to start the Selenium server)
    seleniumAddress: 'http://localhost:4444/wd/hub',

    // The port to start the selenium server on, or null if the server should
    // find its own unused port.
    seleniumPort: null,

    // Chromedriver location is used to help the selenium standalone server
    // find chromedriver. This will be passed to the selenium jar as
    // the system property webdriver.chrome.driver. If null, selenium will
    // attempt to find chromedriver using PATH.
    //chromeDriver: 'node_modules/protractor/selenium/chromedriver',

    // Additional command line options to pass to selenium. For example,
    // if you need to change the browser timeout, use
    // seleniumArgs: ['-browserTimeout=60'],
    seleniumArgs: [],

    // If sauceUser and sauceKey are specified, seleniumServerJar will be ignored.
    // The tests will be run remotely using SauceLabs.
    sauceUser: null,
    sauceKey: null,

    // ----- What tests to run -----
    //
    // Spec patterns are relative to the location of this config.
    specs: [
        './specs/*.js'
    ],

    // ----- Capabilities to be passed to the webdriver instance ----
    //
    // For a full list of available capabilities, see
    // https://code.google.com/p/selenium/wiki/DesiredCapabilities
    // and
    // https://code.google.com/p/selenium/source/browse/javascript/webdriver/capabilities.js
    capabilities: {
        'browserName': 'chrome'
    },

    // A base URL for your application under test. Calls to protractor.get()
    // with relative paths will be prepended with this.
    baseUrl: 'http://localhost:9999',

    // Selector for the element housing the angular app - this defaults to
    // body, but is necessary if ng-app is on a descendant of <body>
    rootElement: 'body',

    onPrepare: function () {
        // Add a screenshot reporter:
        jasmine.getEnv().addReporter(new HtmlReporter({
            preserveDirectory: false,
            baseDirectory: 'reports',
            screenshotsSubfolder: 'images',
            jsonsSubfolder: 'jsons',
            takeScreenShotsOnlyForFailedSpecs: true,
            pathBuilder: function pathBuilder(spec, descriptions, results, capabilities) {

                var monthMap = {
                    "1": "Jan",
                    "2": "Feb",
                    "3": "Mar",
                    "4": "Apr",
                    "5": "May",
                    "6": "Jun",
                    "7": "Jul",
                    "8": "Aug",
                    "9": "Sep",
                    "10": "Oct",
                    "11": "Nov",
                    "12": "Dec"
                };

                var currentDate = new Date(),
                    totalDateString = currentDate.getDate() + '-' + monthMap[currentDate.getMonth() + 1] + '-' + (currentDate.getYear() + 1900);

                return path.join(totalDateString, capabilities.caps_.browserName, descriptions.join('-'));
            }
        }));
    },


    // ----- Options to be passed to minijasminenode -----
    jasmineNodeOpts: {
        // onComplete will be called just before the driver quits.
        onComplete: null,
        // If true, display spec names.
        isVerbose: false,
        // If true, print colors to the terminal.
        showColors: true,
        // If true, include stack traces in failures.
        includeStackTrace: true,
        // Default time to wait in ms before a test fails.
        defaultTimeoutInterval: 10000
    }
};
