// HTMLChecker
//
// + [오류] HTML 파일 크기 확인
//   - 파일당 최대 300KB, 권장 150KB 이내
// * [경고] Android / iOS에서 지원하지 않는 태그 사용 여부 확인 (Warning)
//   - 예) image, svg는 Android 4.0 미만에서 지원 안함
// * [경고] <head></head>에서 삽입된 인라인 스타일 속성 중에 앱에서 삽입하는 normalize 스타일에 의해 덮어지는 속성이 있는지
//   - 추가적으로 <body> 에 삽입된 background-color 검사
// * [오류] 외부의 자바스크립트, CSS 링크가 있는지
// * [오류] 특정 엘리먼트(body, div, p, ...)에 너무 많은 자식이 달려있지 않는지 검사
//   - 자식이 많으면 부양하기 힘든지 뷰어 로딩이 느려짐
// * [오류] HTML에서 body가 존재하는지
//
'use strict';

var fs       = require('fs'),
    util     = require('util'),
    Validator= require('./Validator'),
    debug    = require('debug')('html');

function HtmlValidator(/*String*/file) {
  Validator.call(this, file);
  this.name = 'HTML';
};

util.inherits(HtmlValidator, Validator);

HtmlValidator.prototype.validation = function() {

};

HtmlValidator.prototype.availableFileExtensions = function() {
  return ['htm', 'html', 'xhtm', 'xhtml'];
};

module.exports = HtmlValidator;
