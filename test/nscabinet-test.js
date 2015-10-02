var should = require('should'),
    vinyl = require('vinyl-fs'),
    nscabinet = require('../.'),
    through = require('through2'),
    jsonStream = require('JSONStream'),
    fs = require('fs')

describe('Upload and download a file...', function() {

    this.timeout(10000)

    it('is the login set up?', () => {

        nscabinet.checkParams({})

    })


    it('upload it!', function (done) {

        this.timeout(10000)

        vinyl.src('test/__input-files/uploadme.txt')
            .pipe(nscabinet())
            .pipe(vinyl.dest('output'))
            .on('finish' , function() {

                should(fs.existsSync('output'))
                done()

            })

    })


    it('force auth error', function (done) {

        this.timeout(10000)

        vinyl.src('test/__input-files/uploadme.txt')
            .pipe(nscabinet({email: 'anyemail'}))
            .pipe(through.obj(function (chunk, enc, callback) {

                var that = this
                var concat

                chunk.nscabinetResponse
                    .pipe(jsonStream.parse())
                    .on('data', json => {
                        concat = json
                    }).on('end', () => {
                        should(concat).have.property('error').have.property('code', 'INVALID_LOGIN_CREDENTIALS')
                        that.push(null)
                        callback()
                        done()
                    })

            }))

    })


    it('download back our file' , function(done) {

        try {
            fs.mkdirSync(`test/output`)
        } catch (e) {
            if (e.code != 'EEXIST') throw e
        }

        nscabinet.download('uploadme.txt')
            .pipe(vinyl.dest('test/output'))
            .on('finish' , () => {

                var outpath = 'test/output/uploadme.txt'

                should(fs.existsSync(outpath)).be.true()
                should(fs.readFileSync(outpath).toString()).be.equal('content\ncontent')
                done()

            })

    })


    it('upload two files. download them using a wildcard' , function(done) {
        this.timeout(20000)

        fs.writeFileSync('test/__input-files/file1.js','hello 1')
        fs.writeFileSync('test/__input-files/file2.js','hello 2')

        vinyl.src('test/__input-files/*.js').pipe(nscabinet())
            .on('finish' , () => {
                nscabinet.download('test/__input-files/*.js').pipe(vinyl.dest('test/output')).on('finish' , () => {
                    should(fs.existsSync('test/output/test/__input-files/file1.js')).be.true()
                    should(fs.readFileSync('test/output/test/__input-files/file1.js').toString()).be.equal('hello 1')

                    should(fs.existsSync('test/output/test/__input-files/file2.js')).be.true()
                    should(fs.readFileSync('test/output/test/__input-files/file2.js').toString()).be.equal('hello 2')

                    done()
                })
            })
    })


})

