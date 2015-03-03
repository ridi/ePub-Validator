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
    Validator 	  = require('./Validator'),
    debug    	    = require('debug')('epub');

function EPubValidator(/*String*/file, /*String*/basePath) {
  Validator.call(this, file, basePath);
  this.name = 'EPUB';
};

util.inherits(EPubValidator, Validator);

EPubValidator.prototype.validation = function() {
  /*
  [???] ePub 2.0 유효성 검사 (epubCheck 사용. https://github.com/IDPF/epubcheck)
   - 메타데이터 (container.xml, opf, ncx) 유효성 검사
   - opf에 명시되지 않은(사용하지 않는) 파일 유무 검사
   - 확장자 및 대소문자 검사
   - 오류 메세지 등은 한국어로 번역 (epubCheck 4.0.0 부터 i18n 지원. https://github.com/IDPF/epubcheck#translating-the-40-pre-release)
  */
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
    //TODO: 로그 출력 부분 정리 필요함
    var message = error.message + ' (' + error.ID + ')';

    _.each(error.locations, function (location) {
      message += '\n at ';
      if (location.context != null) {
        message += location.context;
      }
      message += '(' + location.fileName + ':' + location.line + ')';
    });

    if (error.suggestion != null) {
      message += '\n => ' + error.suggestion;
    }

    switch(error.severity) {
      case "WARNING":
        log.warning(message);
        break;
      case "ERROR":
        log.error(message);
        break;
      case "FATAL":
        log.fatal(message);
        break;
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

  // TODO: opfPath 가 false 일 때 예외처리 필요함
  if (!opfPath) {
    log.fatal('meta 파일의 opf 경로가 잘못됐습니다.');
  } else {
    debug('OPF Path: ' + opfPath);
  }

  var isbn = '';
  var tocPath = false;

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
        tocPath = item['$']['href'];
      }
    });
  });

  // opf에 명시된 ISBN이 유효한지 검사
  if (!isbnValidator.isISBN(isbn)) {
    log.warning('ISBN이 올바르지 않습니다. (%s)', isbn);
  } else {
    debug('ISBN: ' + isbn);
  }

  // TODO: tocPath가 false일 때 예외처리 필요함
  // * [오류] TOC에서 './' 제거 -> 1429000001~6
  //   - iOS에서 목차 이동이 안됨
  if (!tocPath) {
    log.fatal('opf 파일의 toc 경로가 잘못됐습니다.');
  } else {
    debug('TOC Path: ' + tocPath);
  }

  var opfDirPath = path.dirname(opfPath);
  var tocFile = fs.readFileSync(this.basePath + '/' + opfDirPath + '/' + tocPath);
  xmlParser.parseString(tocFile, function (error, result) {
    var navPoints = result.ncx.navMap[0].navPoint;
    _.each(navPoints, function (navPoint) {
      var src = navPoint.content[0]['$']['src'];
      if (src.indexOf('./') === 0) {
        log.error('\'%s\' 목차의 content src가 ./ 로 시작합니다. (navPoint id: %s)', navPoint.navLabel[0]['text'], navPoint['$']['id']);
      }
    });
  });
};

EPubValidator.prototype.availableFileExtensions = function() {
  return ['epub'];
};

module.exports = EPubValidator;
