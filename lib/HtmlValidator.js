// HTMLChecker
//
// * [경고] Android / iOS에서 지원하지 않는 태그 사용 여부 확인 (Warning)
//   - 예) image, svg는 Android 4.0 미만에서 지원 안함
// * [경고] <head></head>에서 삽입된 인라인 스타일 속성 중에 앱에서 삽입하는 normalize 스타일에 의해 덮어지는 속성이 있는지
//   - 추가적으로 <body> 에 삽입된 background-color 검사
// * [오류] 특정 엘리먼트(body, div, p, ...)에 너무 많은 자식이 달려있지 않는지 검사
//   - 자식이 많으면 부양하기 힘든지 뷰어 로딩이 느려짐
// * [오류] HTML에서 body가 존재하는지
//
'use strict';

var fs       = require('fs'),
    util     = require('util'),
    report   = require('./Report'),
    parser   = require('htmlparser2'),
    Validator= require('./Validator'),
    _        = require('underscore'),
    debug    = require('debug')('html');

function HtmlValidator(/*String*/file, /*String*/basePath) {
  Validator.call(this, file, basePath);
  this.name = 'HTML';
};

util.inherits(HtmlValidator, Validator);

HtmlValidator.COMMON = {
  MAX_FILE_SIZE_IN_KB: 300,
  RECOMMENDED_FILE_SIZE_IN_KB: 150,
};

HtmlValidator.prototype.validation = function() {
  var path = this.getRelativePath();

  // 1. HTML 파일 크기 검사
  //   - 파일당 최대 300KB, 권장 150KB 이내
  var fileSizeInKB = Validator.Util.getFileSizeInKB(this.file);
  if (fileSizeInKB > HtmlValidator.COMMON.MAX_FILE_SIZE_IN_KB) {
    report.add('HTML-001', path, [HtmlValidator.COMMON.MAX_FILE_SIZE_IN_KB], null, [HtmlValidator.COMMON.RECOMMENDED_FILE_SIZE_IN_KB]);
  }

  var html = fs.readFileSync(this.file);
  var result = parser.parseDOM(html, {lowerCaseTags: true, lowerCaseAttributeNames: true});

  var checker = function(nodes, isRoot) {
    _.each(nodes, function(node) {
      if (node.children !== undefined) {
        checker(node.children, false);
      }
    });
  };
  checker(result, true);
};

HtmlValidator.prototype.availableFileExtensions = function() {
  return ['htm', 'html', 'xhtm', 'xhtml'];
};

module.exports = HtmlValidator;
