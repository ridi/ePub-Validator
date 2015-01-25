// FileChecker
//
// + [오류] HTML 파일 크기 확인
//   - 파일당 최대 300KB, 권장 150KB 이내
// + [오류] 이미지 파일 크기 및 메타 데이터 확인
//   - 표지 이미지에 한해서 최소 크기 560x800, 권장 크기 1120x1600
//   - 본문 이미지는 최대 1080x1600
//   - CMYK 모드 검사 (Android에서 지원 안함)
// + [오류] UTF-8이 아닌 파일명이 포함됐는지
//   - 영문 + 숫자 조합의 이름을 권장 (한글 파일명 x)
//
'use strict';

var fs       = require('fs'),
    util     = require('util'),
    Validator= require('./Validator'),
    Image    = require('./ImageValidator'),
    Html     = require('./HtmlValidator'),
    Css      = require('./CssValidator'),
    debug    = require('debug')('file');

function FileValidator(/*String*/file) {
  Validator.call(this, file);
};

util.inherits(FileValidator, Validator);

FileValidator.prototype.validation = function() {

};

module.exports = FileValidator;
