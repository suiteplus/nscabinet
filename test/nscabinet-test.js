var should = require('should'),
	vinyl = require('vinyl-fs'),
	nscabinet = require('../nscabinet.js'),
	through = require('through2'),
	jsonStream = require('JSONStream')

describe('Upload a file...' , () => {

	it('is the login set up?' , () => {

		nscabinet.checkParams({})

	})

	it('upload it!' , function(done) {

		this.timeout(10000)

		vinyl.src('test/uploadme.txt')
			.pipe(nscabinet())
			.pipe( through.obj( function(chunk,enc,callback) {

				var that = this
				var concat
				chunk.nscabinetResponse
					.pipe(jsonStream.parse())
					.on('data', json => {
						concat = json
					}).on('end' , () => {
						should(concat).have.property('fileid').be.Number()
						that.push(null)
						callback()
						done()
					})

			}))

	})

	it('force auth error' , function(done) {

		this.timeout(10000)

		vinyl.src('test/uploadme.txt')
			.pipe(nscabinet({email:'anyemail'}))
			.pipe( through.obj( function(chunk,enc,callback) {

				var that = this
				var concat

				chunk.nscabinetResponse
					.pipe(jsonStream.parse())
					.on('data', json => {
						concat = json
					}).on('end', () => {
						should(concat).have.property('error').have.property('code','INVALID_LOGIN_CREDENTIALS')
						that.push(null)
						callback()
						done()
					})

			}))

	})

})