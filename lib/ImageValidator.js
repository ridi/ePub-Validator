// ImageChecker
'use strict';

var fs         = require('fs'),
    util       = require('util'),
    report     = require('./Report'),
    Validator  = require('./Validator'),
    imageSizeOf= require('image-size'),
    config     = require('./Config'),
    debug      = require('debug')('image');

function ImageValidator(/*String*/file, /*String*/basePath) {
  Validator.call(this, file, basePath);
  this.name = 'IMG';
};

util.inherits(ImageValidator, Validator);

ImageValidator.prototype.validation = function() {
  var path = this.getRelativePath();

  // 1. 이미지 크기 검사
  //   - 표지 이미지에 한해서 최소 크기 560x800, 권장 크기 1120x1600
  //   - 본문 이미지는 최대 1080x1600
  var imgSize = imageSizeOf(this.file);
  var isCover = this.isCoverImage();
  if (isCover) {
    if (imgSize.width < config.cover_image_min_width ||
        imgSize.height < config.cover_image_min_height) {
      report.add('IMG-301', path, [config.cover_image_min_width, config.cover_image_min_height], null,
                                  [config.cover_image_recommend_width, config.cover_image_recommend_height]);
    }
  } else if (imgSize.width > config.content_image_max_width ||
             imgSize.height > config.content_image_max_height) {
    report.add('IMG-302', path, [config.content_image_max_width, config.content_image_max_height]);
  }

  // 2. 이미지 파일 크기 검사
  //   - 저사양 기기에서 책을 열 수 없거나 랜더링할 수 없음
  var fileSizeInKB = Validator.Util.getFileSizeInKB(this.file);
  if (fileSizeInKB > config.image_file_max_size) {
    var args = [config.image_file_max_size];
    report.add('IMG-303', path, args, null, args);
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
