// Ridibooks-Checker 0.0.1
'use strict';

var fs = require('fs');
var path = require('path');
var pkg = require(path.join(__dirname, 'package.json'));
var program = require('commander');

program.version(pkg.version)
			.usage('<file>')
    	.parse(process.argv);

var targetPath = program.args[0];
if (targetPath === undefined) {
	process.exit(1);	// 인자 없음
}

if (fs.existsSync(targetPath) === false) {
	process.exit(2);	// 대상 파일을 찾을 수 없음
}

var epub = require('./lib/EPubChecker');
// epub.

var uuid = require('node-uuid');
var AdmZip = require('adm-zip');
var unzipPath = path.join('epub-validator-temp', uuid.v1());
var zip = new AdmZip(targetPath);
try {
	zip.extractAllTo(unzipPath, true);
} catch(e) {
	process.exit(3);	// zip 파일이 아니거나 압축파일이 손상 됐음
}

var file = require('./lib/FileChecker');
// file.

// fs.rmdirSync(unzipPath);

process.exit(0);		// 완료
