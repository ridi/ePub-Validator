// EPubValidator
'use strict';

var exec          = require('sync-exec'),
    fs            = require('fs'), 
    util          = require('util'),
    xml2js        = require('xml2js'),
    isbnValidator = require('validator'),
    path          = require('path'),
    _             = require('underscore'),
    debug         = require('debug')('epub'),
    rootDir       = path.dirname(__dirname),
    report        = require('./Report'),
    Validator     = require('./Validator');

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
  //   - CSS 문법 검사
  //   - 등등...
  debug('Start epubcheck.jar');
  var country    = '-Duser.country=KO',
      language   = '-Duser.language=kr',
      localizeOpt= country + ' ' + language,
      jarDir     = path.join(rootDir, 'lib/epubcheck/epubcheck.jar'),
      targetDir  = this.file.replace(/([ '"])/gi, '\\$1'),
      resultFile = 'epubcheck_result.json',
      command = 'java ' + localizeOpt + ' -jar ' + jarDir + ' ' + targetDir + ' -j ' + resultFile;
  exec(command, 1000 * 60);
  debug('End epubcheck.jar');

  var result = fs.readFileSync(resultFile);
  fs.unlinkSync(resultFile);
  result = JSON.parse(result);

  debug('----- Epubcheck (' + result.checker.checkerVersion + ') -----');
  debug('FileName: ' + result.checker.filename);
  debug('ElapsedTime: ' + result.checker.elapsedTime + 'ms');
  debug('Fatal(' + result.checker.nFatal + ') / Error(' + result.checker.nError + ') / Warning(' + result.checker.nWarning + ')');
  
  if (result.publication === undefined) {
    throw {code: 'EPUB-203'/*도서 정보를 찾을 수 없음*/};
  } else {
    var meta = result.publication;
    if (meta.title !== null) {
      report.add('EPUB-001'/*도서 제목 정보*/, null, [meta.title]);
    }
    if (meta.creator.length > 0) {
      report.add('EPUB-002'/*저자 정보*/, null, [util.inspect(meta.creator)]);
    }
    if (meta.publisher !== null) {
      report.add('EPUB-003'/*출판 정보*/, null, [meta.publisher]);
    }
  }

  // epubcheck에서 나온 에러 메세지들 출력
  _.each(result.messages, function (error) {
    var ID = error.ID;
    var message = error.message;
    if (error.locations.length === 0) {
      report.add(ID, null, [message]);
    } else {
      _.each(error.locations, function (location) {
        var _location = location.fileName;
        if (location.line != -1 && location.column != -1) {
          _location += ('(' + location.line + '줄, ' + location.column + '열');
        } else if (location.line != -1) {
          _location += ('(' + location.line + '줄');
        }
        if (location.context) {
          _location += (', \'' + location.context + '\'');
        }
        if (location.line != -1) {
          _location += ')';
        }
        report.add(ID, _location, [message]);
      });
    }
  });
  debug('-----------------------------------');

  // 2. OPF에 명시된 ISBN 번호가 유효한지 검사
  // TODO: 추후 실존하는지도 검사하도록
  var identifier = result.publication.identifier || '';
  var isbn = (identifier.match(/[\dx]+/gi) || []).join('');
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
    throw {code: 'EPUB-302'/*NCX를 찾을 수 없음*/};
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
      report.add('EPUB-401'/*NCX 파일을 읽을 수 없음*/, ncxPath);
    }
  });
};

EPubValidator.prototype.availableFileExtensions = function() {
  return ['epub'];
};

module.exports = EPubValidator;
