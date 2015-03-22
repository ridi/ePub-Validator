// jxp
'use strict';

var fs      = require('fs'),
    path    = require('path'),
    _       = require('underscore'),
    util    = require('util'),
    rootDir = path.dirname(__dirname),
    pkg     = require(path.join(rootDir, 'package.json'));

(function(){
  var jxpDir = path.join(rootDir, pkg.jxp);
  var jxpFile = fs.readFileSync(jxpDir);
  if (jxpFile === undefined) {
    return;
  }

  var jxp = JSON.parse(jxpFile);
  if (jxp === undefined) {
    return;
  }

  var filter = function(list) {
    var filteredList = [];
    _.each(list, function(item) {
      if (item.match(/^(db|config|lib\/epubcheck)\//gi) !== null) {
        return;
      } else if (item.match(/(test|examples|samples|benchmark)/gi) !== null) {
        return;
      } else if (item.match(/(LICENSE|AUTHORS|Makefile|makefile)/g) !== null) { 
        return;
      } else if (item.match(/\.(java|jar|md|npmignore|gitignore|gitattributes|yml|jscsrc|jshintrc|properties)$/gi) !== null) {
        return;
      } else if (item.match(/(epub-validator.jxp|jxp.js)/gi) !== null) {
        return;
      }
      filteredList.push(item);
    });
    return filteredList;
  };

  jxp.name = pkg.name;
  jxp.version = pkg.version;
  jxp.author = pkg.author;
  jxp.description = pkg.description;
  jxp.company = pkg.company;
  jxp.website = pkg.repository.url;

  jxp.files = filter(jxp.files);
  jxp.assets = filter(jxp.assets);

  fs.writeFileSync(jxpDir, JSON.stringify(jxp));
})();
