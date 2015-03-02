// Ridibooks-Checker 0.0.1
'use strict';

var ps    = process,
    log   = require('./lib/Log'),
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
  if (code) {
    debug('stop (' + code + ')');
    log.info('검사 중단: %s', file);
  } else {
    debug('finish (0)');
    log.info('검사 완료: %s', file);
  }
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

log.info('검사 시작: %s', file);

debug('check exists file');

try {
  var zip = new Zip(file);
  zip.extractAllTo(unzipPath, true);
} catch(e) {
  log.fatal(e);
  exit(3);
}

debug('ePub uncompressed');

try {
  var epub = new Epub(file, unzipPath);
  epub.validation();
} catch(e) {
  log.fatal(e);
  exit(4);
}

debug('ePub validation');

try {
  var files = new File(unzipPath);
  files.validation();
} catch(e) {
  log.fatal(e);
  exit(5);
}

debug('files validation in ePub');

exit(0);
