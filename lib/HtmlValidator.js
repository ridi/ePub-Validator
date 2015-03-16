// HTMLChecker
//
// * [경고] Android / iOS에서 지원하지 않는 태그 사용 여부 확인 (Warning)
//   - 예) image, svg는 Android 4.0 미만에서 지원 안함
// * [경고] <head></head>에서 삽입된 인라인 스타일 속성 중에 앱에서 삽입하는 normalize 스타일에 의해 덮어지는 속성이 있는지
//   - 추가적으로 <body> 에 삽입된 background-color 검사
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
    var col = 0;
    var line = 0;
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
    _.each(nodes, function(node) {
      if (node.name == 'body') {
        hasBody = true;
      }
      if (node.children !== undefined) {
        // 2. 엘리먼트에 너무 많은 자식이 달려있지 않는지 검사
        //   - 자식이 많으면 부양하기 힘든지 뷰어 로딩이 느려지고, 선택과 형광펜 기능이 느려짐
        if (node.children.length > config.child_nodes_limit) {
            var location = findLocation(node.startIndex);
            report.add('HTML-302', path + '(' + location.line + '줄, ' + location.col + '열, ' + node.name + ')');
        }
        checker(node.children, false);
      }
    });
  };
  checker(result, true);

  // 3. HTML에 body가 존재하는지
  if (hasBody === false) {
    report.add('HTML-401', path);
  }

  debug('html validation in ePub: ' + this.getRelativePath());
};

HtmlValidator.prototype.availableFileExtensions = function() {
  return ['htm', 'html', 'xhtm', 'xhtml'];
};

module.exports = HtmlValidator;
