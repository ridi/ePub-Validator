// ImageChecker
'use strict';

var fs         = require('fs'),
    util       = require('util'),
    imageSizeOf= require('image-size'),
    debug      = require('debug')('image'),
    report     = require('./Report'),
    Validator  = require('./Validator'),
    config     = require('./Config');

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
  var id, location = path + '(' + imgSize.width + '×' + imgSize.height + ')', msgArgs, sugArgs;
  var pixel = imgSize.width * imgSize.height;
  if (isCover) {
    msgArgs = [config.cover_image_min_width, config.cover_image_min_height];
    sugArgs = [config.cover_image_recommend_width, config.cover_image_recommend_height];
    if (config.image_compare_type == 1) {
      var min_pixel = config.cover_image_min_width * config.cover_image_min_height;
      if (pixel < min_pixel) {
        id = 'IMG-305';
        msgArgs.splice(0, 0, min_pixel);
        sugArgs.splice(0, 0, config.cover_image_recommend_width * config.cover_image_recommend_height);
      }
    } else {
      if (imgSize.width < config.cover_image_min_width ||
          imgSize.height < config.cover_image_min_height) {
        id = 'IMG-301';
      }
    }
  } else {
    msgArgs = [config.content_image_max_width, config.content_image_max_height];
    if (config.image_compare_type == 1) {
      var max_pixel = config.content_image_max_width * config.content_image_max_height;
      if (pixel > max_pixel) {
        id = 'IMG-306';
        msgArgs.splice(0, 0, max_pixel);
      }
    } else {
      if (imgSize.width > config.content_image_max_width &&
          imgSize.height > config.content_image_max_height) {
        id = 'IMG-302';
      }
    }
  }

  if (id) {
    report.add(id, location, msgArgs, null, sugArgs);
  }

  // 2. 이미지 파일 크기 검사
  //   - 저사양 기기에서 책을 열 수 없거나 랜더링할 수 없음
  var fileSizeInKB = Validator.Util.getFileSizeInKB(this.file);
  if (fileSizeInKB > config.image_file_max_size) {
    var args = [config.image_file_max_size];
    report.add('IMG-303', path + '(' + fileSizeInKB + 'KB)', args, null, args);
  }

  // 3. CMYK 모드 검사
  //   - Android에서 랜더링할 수 없음

  // https://www.npmjs.com/package/exif
  // https://www.npmjs.com/package/pixel-stream

  debug((isCover ? 'cover' : 'image') + '(' + imgSize.type + ') validation in ePub: ' + this.getRelativePath());
};

ImageValidator.prototype.availableFileExtensions = function() {
  return ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tif', 'tiff', 'svg'];
};

ImageValidator.prototype.isCoverImage = function() {
  return /cover/gi.exec(this.file);
};

module.exports = ImageValidator;
