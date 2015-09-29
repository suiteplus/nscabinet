'use strict'

var request = require('request'),
	through = require('through2'),
	jsonStream = require('JSONStream'),
	checkParams = require('./parameters.js')


module.exports = (params) => {

	params = checkParams(params)

	var nlauthRolePortion = ( params.role ) ? `,nlauth_role=${params.role}` : ''

	return through.obj(function (chunk, enc, callback) {

		var that = this,
			path = chunk.path.substr(chunk.dirname.length)

		request({
			url: `https://rest.${params.realm}/app/site/hosting/restlet.nl`,
			qs: {
				script: params.script,
				deploy: params.deployment
			},
			method: params.method,
			headers: {
				authorization: `NLAuth nlauth_account=${params.account},nlauth_email=${params.email},nlauth_signature=${params.password}${nlauthRolePortion}`
			},
			json: {
				filename: path,
				content: chunk.contents.toString('base64'),
				rootfolder: params.rootPath
			}
		}).on('response', response => {

			chunk.nscabinetResponse = response
			that.push(chunk)
			response.pipe(jsonStream.parse('error.code')).pipe(process.stdout)
			response.pipe(jsonStream.parse('message')).pipe(process.stdout)
			callback()

		})

	})

}

module.exports.checkParams = checkParams