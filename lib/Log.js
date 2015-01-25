// Log
//
'use strict';

var fmt = require('util').format;

exports.DEBUG = 4;
exports.INFO = 3;
exports.WARNING = 2;
exports.ERROR = 1;
exports.FATAL_ERROR = 0;

var localized = {
	DEBUG: '디버그',
	INFO: '안내',
	WARNING: '경고',
	ERROR: '오류',
	FATAL_ERROR: '심각'
};

module.exports = {
  log: function(levelStr, args) {
    if (exports[levelStr] !== undefined) {
      var msg = fmt.apply(null, args);
      process.stdout.write(
          '[' + localized[levelStr] + ']'
        + ' ' + msg
        + '\n'
      );
    }
  },

  debug: function(msg) {
    this.log('DEBUG', arguments);
  },

  info: function(msg) {
    this.log('INFO', arguments);
  },

  warning: function(msg) {
    this.log('WARNING', arguments);
  },

  error: function(msg) {
    this.log('ERROR', arguments);
  },

  fatal: function(msg) {
    this.log('FATAL_ERROR', arguments);
  }
};
