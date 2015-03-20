// CSSChecker
//
// + [???] span 태그의 서체 크기가 일정 크기(약 26pt)를 넘지 않는지 -> 820000203
//   - Android에서 글씨가 잘려보임
// + [오류] css에서 존재하지 않는 파일을 import하고 있는지(ePubCheck에서 걸릴것 같지만 일단 기재)
//   - 페이징 오차 발생함
// + [오류] url 속성으로 존재하지 않는 로컬 파일이나 외부 파일을 불러오려고 하는지
//   - 페이징 오차가 발생할 수도 있고 이미지 보정이 롤백될 수 있음
//
'use strict';

var fs       = require('fs'),
    util     = require('util'),
    _        = require('underscore'),
    cssParser= require('css'),
    Validator= require('./Validator'),
    debug    = require('debug')('css');

function CssValidator(/*String*/file, /*String*/basePath) {
  Validator.call(this, file, basePath);
  this.name = 'CSS';
};

util.inherits(CssValidator, Validator);

var propertyAvail = (function() {
  var PropertyAvailDataSource = function() {
    var _listFile = fs.readFileSync(__dirname + '/../db/property_avail.json');
    if (_listFile == undefined) {
      throw 'property_avail.json 파일을 찾을 수 없습니다.';
    }

    var jsonString = '';
    _.each(_listFile.toString().split('\n'), function(line) {
      if (line.substr(0, 2) != '//') {
        jsonString += line;
      }
    });

    var _list = JSON.parse(jsonString);

    function parseVersion(/*Object*/item) {
      function stringFromKey(/*String*/key) {
        if (key == 'ios') {
          return 'iOS';
        } else if (key == 'android') {
          return 'Android';
        } else if (key == 'pc') {
          return 'PC';
        } else if (key == 'ridibooks') {
          return 'Ridibooks for '
        } else {
          return '';
        }
      };

      function convert(/*String*/version, /*String*/platformKey) {
        if (version == 'n/a') { // n/a = not avaliable = 모든 버전에서 지원하지 않음
          return version;
        } else if (platformKey == 'ridibooks') {
          return 'v' + version + ' 이상';
        } else {
          return version + ' 이상';
        }
      };

      var message = '';
      _.each(Object.keys(item), function(key) {
        if (item[key] !== undefined) {
          var category = item[key];
          _.each(Object.keys(category), function(categoryKey) {
            if (category[categoryKey] !== undefined && typeof category[categoryKey] === 'object') {
              var platform = category[categoryKey];
              _.each(Object.keys(platform), function(platformKey) {
                if (platform[platformKey] !== undefined) {
                  var version = platform[platformKey];
                  message += (stringFromKey(categoryKey) + stringFromKey(platformKey) + ' ' + convert(version) + ', ');
                }
              });
            }
          });
        }
      });

      return message;
    };

    this.atProperty = function(/*String*/property) {
      var message = undefined;
      _.find(_list, function(item) {
        if (item.name == property) {
          message = parseVersion(item);
          message = message.substr(0, message.length - 2);
          return true;
        }
      });
      return message;
    };
  }
  return new PropertyAvailDataSource();
})();

CssValidator.prototype.validation = function() {
  var path = this.getRelativePath();

  var css = fs.readFileSync(this.file);
  var result = cssParser.parse(css.toString(), {silent: true});

  if (result.stylesheet) {
    _.each(result.stylesheet.rules, function(rule) {
      var isHtml = false;
      var isBody = false;

      _.each(rule.selectors, function(selector) {
        isHtml = selector.toLowerCase() == 'html';
        isBody = selector.toLowerCase() == 'body';
      });
      _.each(rule.declarations, function(declaration) {
        var property = declaration.property.toLowerCase();
        var value = declaration.value;
        var location = declaration.position.start;

        // 1. html, body의 너비 또는 높이를 조절하고 있는지
        if ((isHtml || isBody) && _.find(property, ['width', 'height']) !== undefined) {
          report.add('CSS-301', path + '(' + location.line + '줄, ' + location.column + '열)');
        }

        // 2. column 속성을 사용하고 있는지
        if (property.indexOf('column') >= 0) {
          report.add('CSS-302', path + '(' + location.line + '줄, ' + location.column + '열)');
        }

        // 3. 균등 정렬이 무시되어 각 줄의 끝이 삐뜰삐들 해짐
        if (property == 'word-break' && value == 'break-all') {
          report.add('CSS-201', path + '(' + location.line + '줄, ' + location.column + '열)');
        }

        // 4. OS 또는 앱에서 지원하지 않는 속성인지
        var result = null;
        if ((result = propertyAvail.atProperty(property))) {
          var location = declaration.position.start;
          report.add('CSS-202', path + '(' + location.line + '줄, ' + location.column + '열)', [property, result]);
        }
      });
    });
  }

  debug('css validation in ePub: ' + path);
};

CssValidator.prototype.availableFileExtensions = function() {
  return ['css'];
};

module.exports = CssValidator;
