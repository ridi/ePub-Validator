// HTMLChecker
//
// * [경고] Android / iOS에서 지원하지 않는 태그 사용 여부 확인 (Warning)
//   - 예) image, svg는 Android 4.0 미만에서 지원 안함
// * [경고] <head></head>에서 삽입된 인라인 스타일 속성 중에 앱에서 삽입하는 normalize 스타일에 의해 덮어지는 속성이 있는지
//
'use strict';

var fs        = require('fs'),
    util      = require('util'),
    report    = require('./Report'),
    htmlparser= require('htmlparser2'),
    cheerio   = require('cheerio'),
    Validator = require('./Validator'),
    _         = require('underscore'),
    config    = require('./Config'),
    debug     = require('debug')('html');

function HtmlValidator(/*String*/file, /*String*/basePath) {
  Validator.call(this, file, basePath);
  this.name = 'HTML';
};

util.inherits(HtmlValidator, Validator);

var tagAvail = (function() {
  var TagAvailDataSource = function() {
    var _listFile = fs.readFileSync(__dirname + '/../db/tag_avail.json');
    if (_listFile == undefined) {
      throw 'tag_avail.json 파일을 찾을 수 없습니다.';
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
        if (version == 'n/a') {
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

    this.atTag = function(/*String*/tag) {
      var message = undefined;
      _.find(_list, function(item) {
        if (item.name == tag) {
          message = parseVersion(item);
          message = message.substr(0, message.length - 2);
          return true;
        }
      });
      return message;
    };
  }
  return new TagAvailDataSource();
})();

HtmlValidator.prototype.validation = function() {
  var path = this.getRelativePath();

  // 1. HTML 파일 크기 검사
  //   - 파일당 최대 300KB, 권장 150KB 이내
  var fileSizeInKB = Validator.Util.getFileSizeInKB(this.file);
  if (fileSizeInKB > config.html_file_max_size) {
    report.add('HTML-301', path, [config.html_file_max_size], null, [config.html_file_recommend_file_size]);
  }

  var html = fs.readFileSync(this.file);
  var result = htmlparser.parseDOM(html, {lowerCaseTags: true, lowerCaseAttributeNames: true, withStartIndices: true});

  var locations = [];
  var lines = html.toString().split('\n');
  _.each(lines, function(line) {
    var prev = 0;
    if (locations.length > 0) {
      prev = locations[locations.length - 1];
    }
    locations.push(prev + line.length);
  });

  function findLocation(/*Number*/offset) {
    var col = 0, line = 0;
    var result = _.find(locations, function(location, index) {
      if (offset <= location) {
        line = index;
        if (index > 0) {
          col = offset - locations[index - 1];
        } else {
          col = offset;
        }
        return true;
      }
    });

    if (result === undefined) {
      return {line: -1, col: -1};
    } else {
      return {line: line + 1, col: col};
    }
  };

  var hasBody = false;
  function checker(/*Array*/nodes, /*Boolean*/isRoot) {
    var that = this;
    _.each(nodes, function(node) {
      var tag = node.name;
      if (tag == 'body') {
        hasBody = true;
        // 2. body에 background-color 속성이 들어가 있는지 검사
        var style;
        if (node.attribs !== undefined && (style = node.attribs['style']) !== undefined) {
          if (style.match(/background-color/gi) !== undefined) {
            var location = findLocation(node.startIndex);
            report.add('HTML-303', path + '(' + location.line + '줄, ' + location.col + '열)');
          }
        }
      }

      var result = null;
      if ((result = tagAvail.atTag(tag))) {
        var location = findLocation(node.startIndex);
        report.add('HTML-201', path + '(' + location.line + '줄, ' + location.col + '열)', [tag, result]);
      }

      if (node.children !== undefined) {
        // 3. 엘리먼트에 너무 많은 자식이 달려있지 않는지 검사
        //   - 자식이 많으면 부양하기 힘든지 뷰어 로딩이 느려지고, 선택과 형광펜 기능이 느려짐
        if (node.children.length > config.child_nodes_limit) {
            var location = findLocation(node.startIndex);
            report.add('HTML-302', path + '(' + location.line + '줄, ' + location.col + '열, ' + tag + ')');
        }
        checker(node.children, false);
      }
    });
  };
  checker(result, true);

  // 4. HTML에 body가 존재하는지
  if (hasBody === false) {
    report.add('HTML-401', path);
  }

  debug('html validation in ePub: ' + this.getRelativePath());
};

HtmlValidator.prototype.availableFileExtensions = function() {
  return ['htm', 'html', 'xhtm', 'xhtml'];
};

module.exports = HtmlValidator;
