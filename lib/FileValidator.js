// FileChecker
//
// + [오류] UTF-8이 아닌 파일명이 포함됐는지
//   - 영문 + 숫자 조합의 이름을 권장 (한글 파일명 x)
//
'use strict';

var fs       = require('fs'),
    wrench   = require('wrench'),
    util     = require('util'),
    _        = require('underscore'),
    Validator= require('./Validator'),
    Image    = require('./ImageValidator'),
    Html     = require('./HtmlValidator'),
    Css      = require('./CssValidator'),
    debug    = require('debug')('file');

function FileValidator(/*String*/file) {
  Validator.call(this, file);
  if (this.isDirectory()) {
    this.basePath = file;
  }
  this.name = 'FILE';
};

util.inherits(FileValidator, Validator);

FileValidator.prototype.validation = function() {
  function validation(file) {
    var validator, lFileExtension = Validator.Util.getFileExtension(file).toLowerCase();
    if (_.contains(Image.prototype.availableFileExtensions(), lFileExtension)) {
      validator = new Image(file);
    } else if (_.contains(Html.prototype.availableFileExtensions(), lFileExtension)) {
      validator = new Html(file);
    } else if (_.contains(Css.prototype.availableFileExtensions(), lFileExtension)) {
      validator = new Css(file);
    }
    if (validator) {
      validator.validation();
    }
  };

  if (this.isDirectory()) {
    var that = this;
    var files = wrench.readdirSyncRecursive(this.file);
    _.each(files, function(path) {
      validation(that.basePath + '/' + path);
    });
  } else {
    validation(this.file);
  }

  debug('files validation in ePub');
};

FileValidator.prototype.availableFileExtensions = function() {
  return ['']
        .concat(Image.prototype.availableFileExtensions())
        .concat(Html.prototype.availableFileExtensions())
        .concat(Css.prototype.availableFileExtensions());
};

FileValidator.prototype.isDirectory = function() {
  return fs.lstatSync(this.file).isDirectory();
};

module.exports = FileValidator;
