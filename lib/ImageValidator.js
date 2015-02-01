// ImageChecker
'use strict';

var fs         = require('fs'),
    util       = require('util'),
    log        = require('./Log'),
    Validator  = require('./Validator'),
    imageSizeOf= require('image-size'),
    debug      = require('debug')('image');

function ImageValidator(/*String*/file, /*String*/basePath) {
  Validator.call(this, file, basePath);
  this.name = 'IMG';
};

util.inherits(ImageValidator, Validator);

ImageValidator.COMMON = {
  MAX_FILE_SIZE_IN_MB: 5.0,
};

ImageValidator.COVER = {
  MIN_WIDTH: 560,
  MIN_HEIGHT: 800,
  DEFAULT_WIDTH: 1120,
  DEFAULT_HEIGHT: 1600
};

ImageValidator.CONTENT = {
  MAX_WIDTH: 1080,
  MAX_HEIGHT: 1600
};

ImageValidator.prototype.validation = function() {
  var path = this.getRelativePath();

  // 1. 이미지 크기 검사
  //   - 표지 이미지에 한해서 최소 크기 560x800, 권장 크기 1120x1600
  //   - 본문 이미지는 최대 1080x1600
  var imgSize = imageSizeOf(this.file),
      isCover = this.isCoverImage();
  if (isCover) {
    if (imgSize.width < ImageValidator.COVER.MIN_WIDTH ||
        imgSize.height < ImageValidator.COVER.MIN_HEIGHT) {
      log.error('표지 이미지가 %dx%d보다 작습니다. (%s)', ImageValidator.COVER.MIN_WIDTH, 
                                                   ImageValidator.COVER.MIN_HEIGHT, path);
      log.info('표지 이미지의 권장 크기는 %dx%d입니다. (%s)', ImageValidator.COVER.DEFAULT_WIDTH, 
                                                      ImageValidator.COVER.DEFAULT_HEIGHT, path);
    }
  } else if (imgSize.width > ImageValidator.CONTENT.MAX_WIDTH ||
             imgSize.height > ImageValidator.CONTENT.MAX_HEIGHT) {
    log.error('본문 이미지가 %dx%d보다 큽니다. (%s)', ImageValidator.CONTENT.MAX_WIDTH, 
                                                ImageValidator.CONTENT.MAX_HEIGHT, path);
  }

  // 2. 이미지 파일 크기 검사
  //   - 저사양 기기에서 책을 열 수 없거나 랜더링할 수 없음
  if (Validator.Util.getFileSizeInMB(this.file) > ImageValidator.COMMON.MAX_FILE_SIZE_IN_MB) {
    log.error('이미지 파일 크기가 5MB를 초과했습니다. (%s)', path);
  }

  // 3. CMYK 모드 검사
  //   - Android에서 랜더링할 수 없음

  // https://www.npmjs.com/package/exif
  // https://www.npmjs.com/package/pixel-stream

  debug((isCover ? 'cover' : 'image') + '(' + imgSize.type + ') validation in ePub');
};

ImageValidator.prototype.availableFileExtensions = function() {
  return ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tif', 'tiff', 'svg'];
};

ImageValidator.prototype.isCoverImage = function() {
  return /cover/gi.exec(this.file);
};

module.exports = ImageValidator;
