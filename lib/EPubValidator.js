// EPubValidator
//
// * [오류] TOC에서 './' 제거 -> 1429000001~6
//   - iOS에서 목차 이동이 안됨
// * [경고] opf에 명시된 ISBN이 유효한지
//
'use strict';

var shell    	  = require('shelljs'),
    fs          = require('fs'), 
    util     	  = require('util'),
    isbnIsValid = require('isbn-validator'),
    _           = require('underscore'),
    log         = require('./Log'),
    Validator 	= require('./Validator'),
    debug    	  = require('debug')('epub');

function EPubValidator(/*String*/file) {
  Validator.call(this, file);
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
	debug('start epubcheck.jar');
	var command = 'java -jar ./epubcheck/epubcheck.jar ' + this.file + ' -j epubcheck_result.json';
	shell.exec(command, {silent: true});
	debug('end epubcheck.jar');

  var result = fs.readFileSync('epubcheck_result.json');
  //TODO: epubcheck.jar 에서 출력한 epubcheck_result.json파일 삭제. (테스트 다 끝나고 이 부분 주석 제거)
  // fs.unlinkSync('epubcheck_result.json');
  
  result = JSON.parse(result);
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
      default:
        log.info(message);
    }
  });

	//TODO: ISBN 검사. isbnIsValid('ISBN번호') => true, false
};

EPubValidator.prototype.availableFileExtensions = function() {
  return ['epub'];
};

module.exports = EPubValidator;
