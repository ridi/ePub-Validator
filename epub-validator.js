// Ridibooks-Checker 0.0.1
'use strict';

var ps    = process,
    fs    = require('fs'),
    path  = require('path'),
    uuid  = require('node-uuid'),
    pkg   = require(path.join(__dirname, 'package.json')),
    cmd   = require('commander'),
    rimraf= require('rimraf'),
    Zip   = require('adm-zip'),
    Epub  = require('./lib/EPubValidator'),
    File  = require('./lib/FileValidator'),
    debug = require('debug')('app');

cmd.version(pkg.version)
   .usage('<file>')
   .parse(ps.argv);

var temp = 'epub-validator-temp';
var unzipPath = path.join(temp, uuid.v1());
var exit = function(code) {
  try {
    rimraf.sync(unzipPath);
  } catch(e) {}
  if (code)
    debug('stop (' + code + ')');
  else
    debug('finis (0)');
  ps.exit(code);
};

debug('init');

var file = cmd.args[0];
if (file === undefined) {
  exit(1);
}

debug('check args');

if (fs.existsSync(file) === false) {
	exit(2);
}

debug('check exists file');

try {
  var epub = new Epub(file);
  epub.validation();
} catch(e) {
  exit(3);
}

debug('ePub validation');

try {
  var zip = new Zip(file);
	zip.extractAllTo(unzipPath, true);
} catch(e) {
	exit(4);
}

debug('ePub uncompressed');

try {
  var files = new File(file);
  files.validation();
} catch(e) {
  exit(5);
}

debug('files validation in ePub');

exit(0);
