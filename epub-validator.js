// Ridibooks-Checker 0.0.1
'use strict';

var ps    = process,
    log   = require('./lib/Log'),
    report= require('./lib/Report'),
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

var temp = 'epub-validator-temp';
var unzipPath = path.join(temp, uuid.v1());

var exit = function(code) {
  try {
    rimraf.sync(unzipPath);
  } catch(e) {}
  
  report.add(code ? 'APP-004' : 'APP-005', null, [file]);
  report.print();

  debug('exit');
  ps.exit(code);
};

cmd.version(pkg.version)
   .usage('<file>')
   .parse(ps.argv);

debug('init');

var file = cmd.args[0];
if (file === undefined) {
  report.add('APP-001');
  exit(1);
}

debug('check args');

if (fs.existsSync(file) === false) {
  report.add('APP-002', null, [file]);
  exit(2);
}

report.add('APP-003', null, [file]);

debug('check exists file');

try {
  var zip = new Zip(file);
  zip.extractAllTo(unzipPath, true);
} catch(e) {
  report.add('APP-006', null, [file]);
  exit(3);
}

debug('ePub uncompressed');

try {
  var epub = new Epub(file, unzipPath);
  epub.validation();
} catch(e) {
  report.add(e.code, e.location, e.msgArgs, e.descArgs, e.sugArgs);
  exit(4);
}

debug('ePub validation');

try {
  var files = new File(unzipPath);
  files.validation();
} catch(e) {
  report.add(e.code, e.location, e.msgArgs, e.descArgs, e.sugArgs);
  exit(5);
}

debug('files validation in ePub');

exit(0);
