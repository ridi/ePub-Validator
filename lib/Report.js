// Report
'use strict';

var _       = require('underscore'),
    xml2js  = require('xml2js'),
    hash    = require("string-hash"),
    fs      = require('fs'), 
    inspect = require('util').inspect,
    vsprintf= require('sprintf').vsprintf;

var report = {};

var codes = (function() {
  var CodeDataSource = function() {
    var _codes = {};
    var _codesFile = fs.readFileSync(__dirname + '/../codes.xml');
    if (_codesFile == undefined) {
      throw 'codes.xml 파일을 찾을 수 없습니다.';
    }
    new xml2js.Parser().parseString(_codesFile, function (error, result) {
      _codes = result.codes.code;
    });

    this.atCodeId = function(/*String*/codeId) {
      return _.find(_codes, function(_code) {
        return _code.id == codeId;
      });
    };
  }
  return new CodeDataSource();
})();

var makeGroupId = function(/*Array*/msgArgs, /*Array*/descArgs, /*Array*/sugArgs) {
  return 'g' + hash(msgArgs + '|' + descArgs + '|' + sugArgs);
};

module.exports = {
  add: function(/*String*/codeId, /*String*/location, /*Array*/msgArgs, /*Array*/descArgs, /*Array*/sugArgs) {
    if (typeof codeId != 'string') {
      return;
    }

    if (codes.atCodeId(codeId) === undefined) {
      return;
    }

    if (report[codeId] === undefined) {
      report[codeId] = {};
    }

    msgArgs  = (msgArgs === undefined || msgArgs === null) ? [] : msgArgs;
    descArgs = (descArgs === undefined || descArgs === null) ? [] : descArgs;
    sugArgs  = (sugArgs === undefined || sugArgs === null) ? [] : sugArgs;

    var groupId = makeGroupId(msgArgs, descArgs, sugArgs);
    if (report[codeId][groupId] === undefined) {
      report[codeId][groupId] = {
        "msgArgs": msgArgs,
        "descArgs": descArgs,
        "sugArgs": sugArgs,
        locations: []
      };
    }

    if (location === undefined || location === null) {
      return;
    }

    report[codeId][groupId].locations.push(location);
  },

  print: function() {
    _.each(Object.keys(report), function (codeId) {
      var code = codes.atCodeId(codeId);
      var prefix = '[' + code.level + '] ';
      var groupList = Object.keys(report[codeId]);
      _.each(groupList, function (groupId) {
        var group = report[codeId][groupId];
        var message = vsprintf(code.message.toString(), group.msgArgs) + '\n';
        if (code.description !== undefined) {
          message += ('  |설명: ' + vsprintf(code.description.toString(), group.descArgs) + '\n');
        }
        if (code.suggestion !== undefined) {
          message += ('  |제안: ' + vsprintf(code.suggestion.toString(), group.sugArgs) + '\n');
        }
        process.stdout.write(prefix + message);
        _.each(group.locations, function (location) {
          process.stdout.write('  > ' + location + '\n');
        });
      });
    });
  }
};
