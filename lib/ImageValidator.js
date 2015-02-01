// ImageChecker
//
// + [오류] 이미지 파일 크기 및 메타 데이터 확인
//   - 표지 이미지에 한해서 최소 크기 560x800, 권장 크기 1120x1600
//   - 본문 이미지는 최대 1080x1600
//   - CMYK 모드 검사 (Android에서 지원 안함)
//
'use strict';

var fs         = require('fs'),
    util       = require('util'),
    Validator  = require('./Validator'),
    imageSizeOf= require('image-size'),
    debug      = require('debug')('image');

function ImageValidator(/*String*/file) {
  Validator.call(this, file);
  this.name = 'IMG';
};

util.inherits(ImageValidator, Validator);

ImageValidator.prototype.validation = function() {

};

ImageValidator.prototype.availableFileExtensions = function() {
  return ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tif', 'tiff', 'svg'];
};

module.exports = ImageValidator;
