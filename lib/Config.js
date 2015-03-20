// Config
'use strict';

var fs     = require('fs'),
    _      = require('underscore'),
    path   = require('path'),
    rootDir= path.dirname(__dirname);

var config = {};

exports = module.exports = config;

(function() {
  function parseConfig(file) {
    if (fs.existsSync(file) === false) {
      return false;
    }

    var lines = fs.readFileSync(file).toString().split('\n');
    _.each(lines, function(line) {
      if (line.substr(0, 2) == '//') {
        return;
      }

      var tokens = line.split(':');
      if (tokens.length != 2) {
        return;
      }

      var key = tokens[0].trim();
      var value = tokens[1].trim();
      if (value.match(/^[0-9]+$/gi) !== null) {
        value = parseInt(value, 10);
      } else if (value.match(/yes|true|on/gi) !== null) {
        value = true;
      } else if (value.match(/no|false|off/gi) !== null) {
        value = false;
      }

      config[key] = value;
    });

    return true;
  };

  if (!parseConfig(path.join(rootDir, 'config/defaults.config'))) {
    throw 'defaults.config 파일을 찾을 수 없습니다.';
  }

  if (!parseConfig(path.join(rootDir, 'config/user.config'))) {
    throw 'user.config 파일을 찾을 수 없습니다.';
  }
})();
