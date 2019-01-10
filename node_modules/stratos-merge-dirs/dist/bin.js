#!/usr/bin/env node
'use strict';

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var argv = (0, _minimist2.default)(process.argv.slice(2));

var helpString = 'Usage: merge-dirs source destination --[conflict resolver(overwrite|skip|ask)]';
if (argv.help) {
  console.log(helpString);
  process.exit();
}
if (!argv._ || argv._.length !== 2) {
  console.log(helpString);
  process.exit();
}

var resolver = _index.conflictResolvers.skip;
if (argv.overwrite) {
  resolver = _index.conflictResolvers.overwrite;
} else if (argv.interactive || argv.ask) {
  resolver = _index.conflictResolvers.ask;
}

(0, _index2.default)(argv._[0], argv._[1], resolver);