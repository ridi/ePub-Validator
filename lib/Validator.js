// Validator
//
'use strict';

var fs = require('fs'),
    _  = require('underscore');

function Validator(/*String*/file) {
  this.name = '';

  this.file = '';
  this.fileExtension = '';

  if (file && typeof file === 'string') {
    if (fs.existsSync(file)) {
      this.fileExtension = Validator.Util.getFileExtension(file);
      if (_.contains(this.availableFileExtensions(), this.fileExtension.toLowerCase())) {
        this.file = file;
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
  getFileExtension: function(file) {
    return (/[.]/.exec(file)) ? /[^.]+$/.exec(file).toString() : '';
  }
};

Validator.prototype.validation = function() {
  throw 'Not implemented';
};

Validator.prototype.availableFileExtensions = function() {
  throw 'Not implemented';
};

module.exports = Validator;
