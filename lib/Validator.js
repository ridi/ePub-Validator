// Validator
//
'use strict';

var fs   = require('fs'),
    path = require('path'),
    _    = require('underscore');

function Validator(/*String*/file, /*String*/basePath) {
  this.name = '';

  this.file = '';
  this.fileExtension = '';
  this.basePath = null;

  if (file && typeof file === 'string') {
    if (fs.existsSync(file)) {
      this.fileExtension = Validator.Util.getFileExtension(file);
      if (_.contains(this.availableFileExtensions(), this.fileExtension.toLowerCase())) {
        this.file = file;
        if (typeof basePath === 'string') {
          this.basePath = basePath;
        } else if (this.isDirectory()) {
          this.basePath = file;
        }
      } else {
        throw 'File format ' + this.fileExtension + ' is not support';
      }
    } else {
      throw 'Not found file ' + file;
    }
  } else {
    throw 'invalid argument \'file\'';
  }
};

Validator.Util = {
  getFileExtension: function(/*String*/file) {
    return (/[.]/.exec(file)) ? /[^.]+$/.exec(file).toString() : '';
  },

  getFileSizeInKB: function(/*String*/file) {
    var stats = fs.statSync(file);
    return stats['size'] / 1024;
  },

  getFileSizeInMB: function(/*String*/file) {
    var stats = fs.statSync(file);
    return stats['size'] / (1024 * 1024);
  }
};

Validator.prototype.validation = function() {
  throw 'Not implemented';
};

Validator.prototype.availableFileExtensions = function() {
  throw 'Not implemented';
};

Validator.prototype.isDirectory = function() {
  return fs.lstatSync(this.file).isDirectory();
};

Validator.prototype.getAbsolutePath = function() {
  if (this.basePath !== null) {
    return path.join(this.basePath, this.file);
  } else {
    return this.file;
  }
};

Validator.prototype.getRelativePath = function() {
  if (this.basePath !== null) {
    var path = this.file.replace(this.basePath, '');
    if (path.length === 0) {
      return '.';
    } else {
      return path;
    }
  } else {
    return this.file;
  }
};

module.exports = Validator;
