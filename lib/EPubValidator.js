// EPubValidator
//
// * [???] ePub 2.0 유효성 검사 (epubCheck 사용. https://github.com/IDPF/epubcheck)
//   - 메타데이터 (container.xml, opf, ncx) 유효성 검사
//   - opf에 명시되지 않은(사용하지 않는) 파일 유무 검사
//   - 확장자 및 대소문자 검사
//   - 오류 메세지 등은 한국어로 번역 (epubCheck 4.0.0 부터 i18n 지원. https://github.com/IDPF/epubcheck#translating-the-40-pre-release)
// * [오류] TOC에서 './' 제거 -> 1429000001~6
//   - iOS에서 목차 이동이 안됨
// * [경고] opf에 명시된 ISBN이 유효한지
//
'use strict';

var shell    	= require('shelljs'),
    util     	= require('util'),
    isbnIsValid = require('isbn-validator'),
    Validator 	= require('./Validator'),
    debug    	= require('debug')('epub');

function EPubValidator(/*String*/file) {
  Validator.call(this, file);
  this.name = 'EPUB';
};

util.inherits(EPubValidator, Validator);

EPubValidator.prototype.validation = function() {
	debug('start epubcheck.jar');
	var command = 'java -jar ./epubcheck/epubcheck.jar ' + this.file + ' -j output.json';
	shell.exec(command, {silent: true});
	debug('end epubcheck.jar');

	//TODO: Output.json 파싱하면 epubcheck 돌린 결과 알 수 있음.

	//TODO: ISBN 검사. isbnIsValid('ISBN번호') => true, false
};

EPubValidator.prototype.availableFileExtensions = function() {
  return ['epub'];
};

module.exports = EPubValidator;
