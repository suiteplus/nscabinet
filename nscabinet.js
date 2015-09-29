"use strict"

var request = require('request'),
    through = require('through2'),
    jsonStream = require('JSONStream')

module.exports = ( params ) => {

    if (!params.email) throw 'No email defined'
    if (!params.password) throw 'No password defined'
    if (!params.account) throw 'No account defined'
    if (!params.rootPath) throw 'No destination root path defined'
    if (!params.script) throw 'No script defined'
    params.realm = params.realm || 'system.netsuite.com'
    params.deployment = params.deployment || 1
    params.method = params.method || 'POST'

    var nlauthRolePortion = ( params.role ) ? `,nlauth_role=${params.role}` : ''

    return through.obj( function(chunk,enc,callback) {

        var that = this;
        var path = chunk.path.substr(chunk.dirname.length)

        request({
            url : `https://rest.${params.realm}/app/site/hosting/restlet.nl` ,
            qs : {
                script : params.script ,
                deploy : params.deployment
            } ,
            method : params.method ,
            headers : {
                authorization : `NLAuth nlauth_account=${params.account},nlauth_email=${params.email},nlauth_signature=${params.password}${nlauthRolePortion}`
            } ,
            json : {
                filename : path ,
                content : chunk.contents.toString('base64') ,
                rootfolder : params.rootPath
            }
        }).on('response' , response => {

            chunk.nscabinetResponse = response
            that.push(chunk)
            response.pipe(jsonStream.parse('error.code')).pipe(process.stdout)
            response.pipe(jsonStream.parse('message')).pipe(process.stdout)
            callback()

        })

    })

}