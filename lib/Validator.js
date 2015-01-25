// Validator
//
'use strict';

var fs = require('fs');

function Validator(/*String*/file) {
  this.file = '';

  if (file && typeof file === 'string') {
    if (fs.existsSync(file)) {
      this.file = file;
    } else {
      throw 'Not found file ' + file;
    }
  } else {
    throw 'invalid argument \'file\''
  }
};

Validator.prototype.validation = function() {
    throw 'Not implemented';
};

module.exports = Validator;
