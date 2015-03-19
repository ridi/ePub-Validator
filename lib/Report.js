// Report
'use strict';

var _       = require('underscore'),
    xml2js  = require('xml2js'),
    hash    = require("string-hash"),
    fs      = require('fs'), 
    config  = require('./Config'),
    inspect = require('util').inspect,
    vsprintf= require('sprintf').vsprintf;

var report = {};
var sequenceQueue = [];

var codes = (function() {
  var CodeDataSource = function() {
    var _codesFile = fs.readFileSync(__dirname + '/../db/codes.json');
    if (_codesFile == undefined) {
      throw 'codes.json 파일을 찾을 수 없습니다.';
    }

    var jsonString = '';
    _.each(_codesFile.toString().split('\n'), function(line) {
      if (line.substr(0, 2) != '//') {
        jsonString += line;
      }
    });

    var _codes = JSON.parse(jsonString);

    var _ignoreList = [];
    if (config.ignore_code_list_use) {
      var lines = fs.readFileSync(__dirname + '/../db/ignore_code_list.txt').toString().split('\n');
      if (lines == undefined) {
        throw 'ignore_code_list.txt 파일을 찾을 수 없습니다.';
      }
      _.each(lines, function(line) {
        var index = 0;
        if (line.substr(0, 2) == '//') {
          return;
        } else if ((index = line.indexOf('//')) >= 0) {
          line = line.substr(0, max(index - 1, 0));
        }
        _ignoreList.push(line.trim());
      });
    }

    this.atCodeId = function(/*String*/codeId) {
      if (_.find(_ignoreList, function(_codeId) {
        return _codeId == codeId;
      }) !== undefined) {
        return undefined;
      } else {
        return _.find(_codes, function(_code) {
          return _code.id == codeId;
        });
      }
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
      sequenceQueue.push(codeId);
    }

    msgArgs  = (msgArgs === undefined || msgArgs === null) ? [] : msgArgs;
    descArgs = (descArgs === undefined || descArgs === null) ? [] : descArgs;
    sugArgs  = (sugArgs === undefined || sugArgs === null) ? [] : sugArgs;

    var groupId = makeGroupId(msgArgs, descArgs, sugArgs);
    if (report[codeId][groupId] === undefined) {
      report[codeId][groupId] = {
        'msgArgs': msgArgs,
        'descArgs': descArgs,
        'sugArgs': sugArgs,
        locations: []
      };
    }

    if (location === undefined || location === null) {
      return;
    }

    report[codeId][groupId].locations.push(location);
  },

  print: function() {
    _.each(sequenceQueue, function (codeId) {
      var code = codes.atCodeId(codeId);
      var prefix = '[' + code.level + '] ';
      var groupList = Object.keys(report[codeId]);
      _.each(groupList, function (groupId) {
        var group = report[codeId][groupId];
        var message = vsprintf(code.message.toString(), group.msgArgs);
        if (config.display_code_id) {
          message += ' (' + code.id + ')\n';
        } else {
          message += '\n';
        }
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
