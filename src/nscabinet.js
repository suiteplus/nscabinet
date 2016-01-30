'use strict';

var request = require('request'),
    through = require('through2'),
    checkParams = require('./parameters.js'),
    vinyl = require('vinyl'),
    es = require('event-stream'),
    path = require('path');

module.exports = (params) => {
    params = checkParams(params);

    return through.obj(function (chunk, enc, callback) {
        var that = this,
            fullCwd = path.resolve(checkParams.CONF_CWD || chunk.cwd),
            remotePath = chunk.path.substr(fullCwd.length+1);

        console.log('Uploading ' + remotePath + ' to ' + params.rootPath );
        var toRequest = requestOpts(params);
        toRequest.json = {
            action : 'upload',
            filepath: remotePath,
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

module.exports.download = (files, params, callback) => {
    params = checkParams(params);

    var toRequest = requestOpts(params);
    toRequest.json = {
        action : 'download' ,
        files : files ,
        rootpath: params.rootPath
    };
    var result = []
    var emitter = es.through(

        function write(data) {

            if (data.error) {
                console.error(data.error.message);
                this.emit('error',data.error);
                return;
            }

            result = data.files = data.files || [];

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
            if (typeof callback === 'function') {
              callback(result.map(function(file) {
                return file.path
              }))
            }
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
