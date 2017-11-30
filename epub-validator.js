// Ridibooks-Checker 0.0.1
'use strict';

var ps       = process,
    path     = require('path'),
    uuid     = require('node-uuid'),
    tmpDir   = path.join(__dirname, 'epub-validator-temp'),
    unzDir   = path.join(tmpDir, uuid.v1()),
    pkg      = require(path.join(__dirname, 'package.json')),
    fs       = require('fs'),
    jxm      = require('jxm'),
    cmd      = require('commander'),
    rimraf   = require('rimraf'), /*폴더 삭제용*/
    Zip      = require('adm-zip'),
    humanize = require('ms'),
    debug    = require('debug')('app'),
    report   = require('./lib/Report'),
    Epub     = require('./lib/EPubValidator'),
    File     = require('./lib/FileValidator'),
    config   = require('./lib/Config');

var exit = function(/*Number*/code, /*Object*/e) {
  if (e !== undefined) {
    if (e.code === undefined) {
      throw e;
    } else {
      report.add(e.code, e.location, e.msgArgs, e.descArgs, e.sugArgs);
    }
  }

  try {
    rimraf.sync(unzDir);
  } catch(e) {
    report.add('APP-201'/*임시 폴더 삭제 오류*/, null, [unzDir]);
  }

  var finishTime = new Date();
  var ms = finishTime - startTime;
  if (isNaN(ms)) {
    ms = 0;
  }

  report.add(code ? 'APP-102'/*검사 중지*/ : 'APP-103'/*검사 완료*/, null, [file || '', humanize(ms)]);

  report.print();

  debug('exit');
  ps.exit(code);
};

// 배포용으로 실행되면 첫 번째 인자에 'node'가 없어서 cmd가 비정상으로 동작하게 된다
var argv = ps.argv;
var isRelease = false;
if (argv.length > 0 && argv[0] !== 'node') {
  argv.splice(0, 0, 'node');
  isRelease = true;
}

// TODO: 추후 옵션을 추가하거나 사용법을 구체적으로 추가해보자
cmd.version(pkg.name + ' v' + pkg.version)
   .usage('<file>')
   .parse(argv);

debug('init');

var file = cmd.args[isRelease ? 1 : 0];
if (file === undefined) {
  report.add('APP-401'/*파라메터 부족*/);
  exit(1);
}

debug('check args');

if (fs.existsSync(file) === false) {
  report.add('APP-402'/*검사 대상을 찾을 수 없음*/, null, [file]);
  exit(2);
}

debug('check exists file');

var startTime = new Date();
report.add('APP-101'/*검사 시작*/, null, [file]);

try {
  var zip = new Zip(file);
  zip.extractAllTo(unzDir, true);
} catch(e) {
  report.add('APP-403'/*압축해제 오류*/, null, [file]);
  exit(3, e);
}

debug('ePub uncompressed');

try {
  var epub = new Epub(file, unzDir);
  epub.validation();
} catch(e) {
  exit(4, e);
}

debug('ePub validation');

try {
  console.log(unzDir);
  var files = new File(unzDir);
  files.validation();
} catch(e) {
  exit(5, e);
}

debug('files validation in ePub');

exit(0);
