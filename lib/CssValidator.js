// CSSChecker
//
// + [경고] Android / iOS에서 지원하지 않는 속성 사용 여부 확인 (Warning)
//   - 예) page-break-after, page-break-before은 Android 4.0 미만에서 지원 안함
// + [경고] 'word-break' 속성값이 'break-all'일 때 균둥 정렬되지 못해서 각 줄의 끝이 삐뚤빼뚤 해진다는걸 알려주기
// + [오류] CSS에서 html, body에 너비 또는 높이를 조절하고 있는지
//   - Android 2.x, 3.x에서 정상적으로 페이징이 안됨(spine에 1~a 있는 것으로 인식함)
// + [경고] 2단 편집(column) 태그를 사용하는지
// + [???] 서체 크기 단위로 px를 사용하는지
// + [경고] CSS 문법 검사
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
    parser   = require('css'),
    validator= require('w3c-css'),
    Validator= require('./Validator'),
    debug    = require('debug')('css');

function CssValidator(/*String*/file) {
  Validator.call(this, file);
};

util.inherits(CssValidator, Validator);

CssValidator.prototype.validation = function() {

};

CssValidator.prototype.availableFileExtensions = function() {
  return ['css'];
};

module.exports = CssValidator;
