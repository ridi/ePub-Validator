// EPubValidator
'use strict';

var shell    	    = require('shelljs'),
    fs            = require('fs'), 
    util     	    = require('util'),
    xml2js        = require('xml2js'),
    isbnValidator = require('validator'),
    path          = require('path'),
    _             = require('underscore'),
    log           = require('./Log'),
    report        = require('./Report'),
    Validator 	  = require('./Validator'),
    debug    	    = require('debug')('epub');

function EPubValidator(/*String*/file, /*String*/basePath) {
  Validator.call(this, file, basePath);
  this.name = 'EPUB';
};

util.inherits(EPubValidator, Validator);

EPubValidator.prototype.validation = function() {
  // TODO: 오류 메세지 한국어로 변역 (epubCheck 4.0.0 부터 i18n 지원. https://github.com/IDPF/epubcheck#translating-the-40-pre-release)
  // 1. ePubCheck를 사용하여 ePub 2.0 유효성 검사 (참고: https://github.com/IDPF/epubcheck)
  //   - 메타데이터 (container.xml, opf, ncx) 유효성 검사
  //   - opf에 명시되지 않은(사용하지 않는) 파일 유무 검사
  //   - 확장자 및 대소문자 검사
	debug('Start epubcheck.jar');
	var command = 'java -jar ./epubcheck/epubcheck.jar ' + this.file + ' -j epubcheck_result.json';
	shell.exec(command, {silent: true});
	debug('End epubcheck.jar');

  var result = fs.readFileSync('epubcheck_result.json');
  fs.unlinkSync('epubcheck_result.json');
  result = JSON.parse(result);

  debug('----- Epubcheck (' + result.checker.checkerVersion + ') -----');
  debug('FileName: ' + result.checker.filename);
  debug('ElapsedTime: ' + result.checker.elapsedTime + 'ms');
  debug('Fatal(' + result.checker.nFatal + ') / Error(' + result.checker.nError + ') / Warning(' + result.checker.nWarning + ')');
  
  // epubcheck에서 나온 에러 메세지들 출력
  _.each(result.messages, function (error) {
    // TODO: epubCheck 로그 출력하는 부분 정리 필요함
    var ID = error.ID;
    var message = error.message;
    if (error.suggestion != null) {
      message += '\n => ' + error.suggestion;
    }
    if (error.locations.length === 0) {
      report.add('EPUB-001', null, [message, ID]);
    } else {
      _.each(error.locations, function (location) {
        report.add('EPUB-001', location.context + '(' + location.fileName + ':' + location.line + ')', [message, ID]);
      });
    }
  });
  debug('-----------------------------------');

  var opfPath = false;

  var metaFile = fs.readFileSync(this.basePath + '/META-INF/container.xml');
  var xmlParser = new xml2js.Parser();
  xmlParser.parseString(metaFile, function (error, result) {
    var rootfiles = result.container.rootfiles;
    _.each(rootfiles, function (rootfile) {
      var rootfile = rootfile.rootfile[0];
      if (rootfile['$']['media-type'] == 'application/oebps-package+xml') {
        opfPath = rootfile['$']['full-path'];
      }
    });
  });

  if (!opfPath) {
    throw 'container.xml에 OPF 파일 경로가 없거나, 잘못 명시되어 있습니다.';
  } else {
    debug('OPF Path: ' + opfPath);
  }

  var isbn = '';
  var ncxPath = false;

  var opfFile = fs.readFileSync(this.basePath + '/' + opfPath);
  xmlParser.parseString(opfFile, function (error, result) {
    var metadata = result.package.metadata[0];
    if (metadata['dc:identifier']) {
      _.each(metadata['dc:identifier'], function (identifier) {
        if (identifier['$']['opf:scheme'] == 'ISBN') {
          isbn = identifier['_'].replace(/-/g, '');
        }
      });
    }

    var spine = result.package.spine[0];
    var tocId = spine['$']['toc'];

    var manifest = result.package.manifest[0];
    _.each(manifest.item, function (item) {
      if (item['$']['id'] == tocId) {
        ncxPath = item['$']['href'];
      }
    });
  });

  // 2. OPF에 명시된 ISBN 번호가 유효한지 검사
  if (isbn.length == 0) {
    report.add('EPUB-002');
  } else if (!isbnValidator.isISBN(isbn)) {
    report.add('EPUB-003', null, [isbn]);
  } else {
    debug('ISBN: ' + isbn);
  }

  // 3. TOC에서 content src 에 ./ 있는지 검사
  //   - iOS에서 목차 이동이 안됨
  if (!ncxPath) {
    throw 'OPF 파일에 NCX 파일 경로가 없거나, 잘못 명시되어 있습니다.';
  } else {
    debug('NCX Path: ' + ncxPath);
  }

  var opfDirPath = path.dirname(opfPath);
  var ncxFile = fs.readFileSync(this.basePath + '/' + opfDirPath + '/' + ncxPath);
  xmlParser.parseString(ncxFile, function (error, result) {
    var navPoints = result.ncx.navMap[0].navPoint;
    _.each(navPoints, function (navPoint) {
      var src = navPoint.content[0]['$']['src'];
      if (src.indexOf('./') === 0) {
        report.add('EPUB-004', navPoint.navLabel[0]['text'] + '(' + navPoint['$']['id'] + ')');
      }
    });
  });
};

EPubValidator.prototype.availableFileExtensions = function() {
  return ['epub'];
};

module.exports = EPubValidator;
