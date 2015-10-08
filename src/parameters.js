'use strict'

var fs = require('fs'),
    _ = {
        extend: require('lodash.assign')
    },
    osenv = require('osenv') ,
    path = require('path')

module.exports = (params, nothrow) => {

    var confFileGlobal = readConfFile(`${osenv.home()}/.ns/nsconfig.json`),
        confFileLocal = readConfFile(resolveLocalConfPath()),
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


function resolveLocalConfPath() {

    function parent(pathstr) {
        var out = ''
        var pathobj = path.parse(pathstr)
        var split = pathobj.dir.split('/')
        for ( var it = 0 ; it < split.length - 1 ; it++ )
            out += split[it] + '/'
        return out + pathobj.base
    }

    var pathobj = path.parse(process.cwd() + '/nsconfig.json')
    var trial = pathobj.dir + '/' + pathobj.base
    for ( var it = 0 ; it < 3 ; it++ ) {
        if (fs.existsSync(trial)) {
            module.exports.CONF_CWD = path.parse(trial).dir
            return trial
        }
        trial = parent(trial)
    }

    return ''

}

function readConfFile(path) {

    var out = {}
    if (!fs.existsSync(path)) return out
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
