// FileChecker
'use strict';

var fs       = require('fs'),
    wrench   = require('wrench'),
    util     = require('util'),
    path     = require('path'),
    isUtf8   = require('is-utf8'),
    report   = require('./Report'),
    _        = require('underscore'),
    Validator= require('./Validator'),
    Image    = require('./ImageValidator'),
    Html     = require('./HtmlValidator'),
    Css      = require('./CssValidator'),
    debug    = require('debug')('file');

function FileValidator(/*String*/file, /*String*/basePath) {
  Validator.call(this, file, basePath);
  this.name = 'FILE';
};

util.inherits(FileValidator, Validator);

FileValidator.prototype.validation = function() {
  function validation(file, basePath) {
    var validator, lFileExtension = Validator.Util.getFileExtension(file).toLowerCase();
    if (_.contains(Image.prototype.availableFileExtensions(), lFileExtension)) {
      validator = new Image(file, basePath);
    } else if (_.contains(Html.prototype.availableFileExtensions(), lFileExtension)) {
      validator = new Html(file, basePath);
    } else if (_.contains(Css.prototype.availableFileExtensions(), lFileExtension)) {
      validator = new Css(file, basePath);
    }
    
    if (validator) {
      // UTF-8에서 지원하지 않는 문자가 파일명에 포함됐는지 검사
      if (isFileNameUtf8(file) !== true) {
        report.add("FILE-001", [], validator.getRelativePath());
      }
      validator.validation();
    }
  };

  function isFileNameUtf8(file) {
    var fileName = path.basename(file);
    var buffer = [];
    for (var i = 0; i < fileName.length; i++) {
      buffer.push(fileName.charCodeAt(i));
    }
    return isUtf8(buffer);
  };

  if (this.isDirectory()) {
    var that = this;
    var files = wrench.readdirSyncRecursive(this.file);
    _.each(files, function(path) {
      validation(that.basePath + '/' + path, that.basePath);
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
