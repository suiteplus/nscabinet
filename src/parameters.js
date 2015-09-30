'use strict'

var fs = require('fs'),
    _ = {
        extend: require('lodash.assign')
    },
    osenv = require('osenv')

module.exports = (params, nothrow) => {

    var confFileGlobal = readConfFile(`${osenv.home()}/.ns/nsconfig.json`),
        confFileLocal = readConfFile('./nsconfig.json'),
        confEnvVars = readConfEnvVar()

    params = _.extend({}, confEnvVars, confFileGlobal, confFileLocal, params)
    params = checkParams(params, nothrow)
    return params

}

var PARAMS_DEF = [
    {name: 'email', required: true},
    {name: 'password', required: true},
    {name: 'account', required: true},
    {name: 'realm', def: 'system.netsuite.com'},
    {name: 'role'},
    {name: 'rootPath', def: '/SuiteScripts'},
    {name: 'script', required: true},
    {name: 'deployment', def: 1}
] //ps: default is reserved word

function readConfFile(path) {

    var out = {}
    try {
        let content = fs.readFileSync(path)
        out = JSON.parse(content)
    } catch (e) {
        //purposely ignore
    }

    return out

}

function readConfEnvVar() {

    return PARAMS_DEF.reduce((prev, curr) => {

        var value = process.env[`NSCONF_${curr.name.toUpperCase()}`]
        if (value) prev[curr.name] = value
        return prev

    }, {})

}

function checkParams(params, nothrow) {

    var out = PARAMS_DEF.reduce((prev, curr) => {

        if (!params[curr.name] && curr.required && !nothrow) throw Error(`No ${curr.name} defined.`)
        prev[curr.name] = params[curr.name] || curr.def
        return prev

    }, {})

    if (!String(out.rootPath).startsWith('/')) throw Error('rootPath must begin with /')

    return out

}
