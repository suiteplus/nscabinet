'use strict';

var request = require('request'),
    through = require('through2'),
    vinyl = require('vinyl'),
    es = require('event-stream'),
    nsconfig = require('nsconfig');

var PARAMS_DEF = [
    {name: 'rootPath', def: '/SuiteScripts'},
    {name: 'script', required : true },
    {name: 'deployment', def: 1}
];

module.exports = (params) => {
    params = checkParams(params);

    return through.obj(function (chunk, enc, callback) {

        var that = this,
            path = chunk.path.substr((checkParams.CONF_CWD||chunk.cwd).length + 1);

        console.log('Uploading ' + path + ' to ' + params.rootPath );

        var toRequest = requestOpts(params);
        toRequest.json = {
            action : 'upload',
            filepath: path,
            content: chunk.contents.toString('base64'),
            rootpath: params.rootPath
        };

        request( toRequest ).on('response', response => {

            chunk.nscabinetResponse = response;
            that.push(chunk);

            var logger = es.through( function write(data){

                if (data.message) console.log(data.message);
                if (data.error) console.log(`${data.error.code} - ${data.error.message}`);
                if (data.error && data.error.code == 'INVALID_LOGIN_CREDENTIALS') {
                    console.log(`Email: ${params.email}`);
                }

                this.emit('end');

            });

            response
                .pipe(es.split())
                .pipe(es.parse())
                .pipe(logger);

            callback();

        });

    });

};


module.exports.upload = module.exports;


module.exports.checkParams = checkParams;
function checkParams (override, noThrow) {
    var out = nsconfig(override, PARAMS_DEF, noThrow);
    if (!out.rootPath.startsWith('/')) throw Error('rootPath must begin with /');
    return out;
}


module.exports.download = (files,params) => {

    params = checkParams(params);

    var toRequest = requestOpts(params);
    toRequest.json = {
        action : 'download' ,
        files : files ,
        rootpath: params.rootPath
    };

    var emitter = es.through(

        function write(data) {

            if (data.error) {
                console.error(data.error.message);
                this.emit('error',data.error);
                return;
            }

            data.files = data.files || [];

            data.files.forEach( file => {

                var localPath = file.path.startsWith('/') ? 'cabinet_root' + file.path : file.path;

                var vynFile = new vinyl({
                    path : localPath ,
                    contents : new Buffer(file.contents,'base64')
                });

                console.log(`Got file ${file.path}.`);

                this.emit('data',vynFile);

            });
        } ,

        function end() {
            this.emit('end');
        }
    );

    return request( toRequest )
        .pipe(es.split())
        .pipe(es.parse())
        .pipe(emitter);

};



function requestOpts(params) {
    var nlauthRolePortion = ( params.role ) ? `,nlauth_role=${params.role}` : '',
        server = process.env.NS_SERVER || `https://rest.${params.realm}/app/site/hosting/restlet.nl`;

    return {
        url: server,
        qs: {
            script: params.script,
            deploy: params.deployment
        },
        method : 'POST' ,
        headers: {
            authorization: `NLAuth nlauth_account=${params.account},nlauth_email=${params.email},nlauth_signature=${params.password}${nlauthRolePortion}`
        }
    };
}
