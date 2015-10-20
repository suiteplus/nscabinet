'use strict';

var nsconfig = require('nsconfig');

var PARAMS_DEF = [
    {name: 'rootPath', def: '/SuiteScripts'},
    {name: 'script', required: true},
    {name: 'deployment', def: 1}
];

module.exports = function(override,noThrow) {

    var out = nsconfig(override,PARAMS_DEF,noThrow);
    if (!out.rootPath.startsWith('/')) throw Error('rootPath must begin with /');
    return out;

};