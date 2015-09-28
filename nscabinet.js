'use strict'

var request = require('request'),
    through = require('through2')

var upsuite = ( params ) => {

    if (!params.email) throw 'No email defined'
    if (!params.password) throw 'No password defined'
    if (!params.account) throw 'No account defined'
    if (!params.rootPath) throw 'No destination root path defined'
    if (!params.script) throw 'No script defined'
    params.realm = params.realm || 'sandbox.netsuite.com'
    params.deployment = params.deployment || 1
    params.method = params.method || 'POST'

    var nlauthRolePortion = ( params.role ) ? `,nlauth_role=${params.role}` : ''

    var fileTransform = through.obj( (chunk,enc,callback) => {
        var a = 0;
        callback()
    })

    /*
    request({
        url : `https://rest.${params.realm}//app/site/hosting/restlet.nl` ,
        qs : {
            script : params.script ,
            deploy : params.deploy
        } ,
        method : params.method ,
        headers : {
            authorization : `NLAuth nlauth_account=${params.account},nlauth_email=${params.email},nlauth_signature=${params.password}${nlauthRolePortion}`
        } ,
        json : {
         //   filename
        }
    })
    */

}