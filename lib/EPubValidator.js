// EPubValidator
'use strict';

var shell         = require('shelljs'),
    fs            = require('fs'), 
    util          = require('util'),
    xml2js        = require('xml2js'),
    isbnValidator = require('validator'),
    path          = require('path'),
    _             = require('underscore'),
    log           = require('./Log'),
    report        = require('./Report'),
    Validator     = require('./Validator'),
    debug         = require('debug')('epub');

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
  var resultFile = 'epubcheck_result.json';
  var command = 'java -jar ./epubcheck/epubcheck.jar ' + this.file.replace(/([ '"])/gi, '\\$1') + ' -j ' + resultFile;

  shell.exec(command, {silent: true});
  debug('End epubcheck.jar');

  var result = fs.readFileSync(resultFile);
  fs.unlinkSync(resultFile);
  result = JSON.parse(result);

  debug('----- Epubcheck (' + result.checker.checkerVersion + ') -----');
  debug('FileName: ' + result.checker.filename);
  debug('ElapsedTime: ' + result.checker.elapsedTime + 'ms');
  debug('Fatal(' + result.checker.nFatal + ') / Error(' + result.checker.nError + ') / Warning(' + result.checker.nWarning + ')');
  
  // epubcheck에서 나온 에러 메세지들 출력
  _.each(result.messages, function (error) {
    var ID = error.ID;
    var message = error.message;
    if (error.suggestion != null) {
      message += '\n => ' + error.suggestion;
    }
    if (error.locations.length === 0) {
      report.add('EPUB-000', null, [message, ID]);
    } else {
      _.each(error.locations, function (location) {
        report.add('EPUB-000', location.context + '(' + location.fileName + ':' + location.line + ')', [message, ID]);
      });
    }
  });
  debug('-----------------------------------');

  if (result.publication === undefined) {
    throw {code: 'EPUB-401'/*도서 정보를 찾을 수 없음*/};
  }

  report.add('EPUB-001', null, [result.publication.title]);
  report.add('EPUB-002', null, [result.publication.creator]);
  report.add('EPUB-003', null, [result.publication.publisher]);

  // 2. OPF에 명시된 ISBN 번호가 유효한지 검사
  var identifier = result.publication.identifier;
  var isbn = identifier.match(/[\dx]+/gi).join('');
  if (isbn.length === 0) {
    report.add('EPUB-201'/*ISBN 정보 누락*/);
  } else if (!isbnValidator.isISBN(isbn)) {
    report.add('EPUB-202'/*유효하지 않은 ISBN*/, null, [isbn]);
  } else {
    debug('ISBN: ' + isbn);
  }

  // 3. TOC에서 content src 에 ./ 있는지 검사
  //   - iOS에서 목차 이동이 안됨
  var that = this;
  var ncxPath = null;
  var ncxMediaTypes = ['application/x-dtbncx+xml'];
  _.find(result.items, function(item) {
    if (_.contains(ncxMediaTypes, item.media_type)) {
      ncxPath = that.basePath + '/' + item.fileName;
      return true;
    } else {
      return false;
    }
  });

  if (ncxPath === null) {
    throw {code: 'EPUB-402'/*NCX를 찾을 수 없음*/};
  } else {
    debug('NCX Path: ' + ncxPath);
  }

  var ncxFile = fs.readFileSync(ncxPath);
  new xml2js.Parser().parseString(ncxFile, function (error, result) {
    if (error === null) {
      var navPoints = result.ncx.navMap[0].navPoint;
      _.each(navPoints, function (navPoint) {
        var src = navPoint.content[0]['$']['src'];
        if (src.indexOf('./') === 0) {
          report.add('EPUB-301'/*상대경로를 사용하고 있음*/, navPoint.navLabel[0]['text'] + '(' + navPoint['$']['id'] + ')');
        }
      });
    } else {
      report.add('EPUB-403'/*NCX 파일을 읽을 수 없음*/, ncxPath);
    }
  });
};

EPubValidator.prototype.availableFileExtensions = function() {
  return ['epub'];
};

module.exports = EPubValidator;
