/*eslint-env mocha*/
'use strict';

var fs = require('fs'),
    nscabinet = require('../.'),
    should = require('should'),
    vinyl = require('vinyl-fs'),
    del = require('del');

function randContent() {

    return 'content' + Math.ceil(Math.random() * 10000);

}

describe('nscabinet:', function() {
    this.timeout(100000);

    
    before( () => {
        del.sync(['test/_input/*.*','text/_output/*.*']);
        //return nscabinet.deleteFolder('test/_input');
    });


    it('is the login set up?', () => {
        nscabinet.checkParams({});
    });


    //it('force auth error', function (done) {
    //    this.timeout(10000);
    //    vinyl.src('test/_input-files/uploadme.txt')
    //        .pipe(nscabinet({email: 'anyemail'}))
    //        .pipe(through.obj(function (chunk, enc, callback) {
    //            var that = this;
    //            var concat;
    //
    //            chunk.nscabinetResponse
    //                .pipe(jsonStream.parse())
    //                .on('data', json => {
    //                    concat = json;
    //                }).on('end', () => {
    //                    should(concat).have.property('error').have.property('code', 'INVALID_LOGIN_CREDENTIALS');
    //                    that.push(null);
    //                    callback();
    //                    done();
    //                });
    //        }));
    //});


    var content1 = randContent();
    it('1: upload it!', function (done) {
        fs.writeFileSync('test/_input/test1.txt',content1);
        vinyl.src('test/_input/test1.txt')
            .pipe(nscabinet())
            .on('finish', () => {
                done();
            });
    });


    it('2: download back our file', function (done) {
        nscabinet.download('test/_input/test1.txt')
            .pipe(vinyl.dest('test/_output'))
            .on('finish', () => {
                should(fs.existsSync('test/_output/test1.txt')).be.true();
                should(fs.readFileSync('test/_output/test1.txt').toString())
                    .be.equal(content1);
                done();
            });
    });


    it('3: upload two files. download them using a wildcard', function (done) {
        var content2 = randContent();
        var content3 = randContent();
        fs.writeFileSync('test/_input/up2.js', content2);
        fs.writeFileSync('test/_input/up3.js', content3);

        vinyl.src(['test/_input/up*.js'])
            .pipe(nscabinet())
            .on('finish', () => {
                nscabinet
                    .download('test/_input/up*.js')
                    .pipe(vinyl.dest('test/_output'))
                    .on('finish', () => {
                        should(fs.existsSync('test/_input/up2.js')).be.true();
                        should(fs.readFileSync('test/_input/up2.js').toString()).be.equal(content2);
                        should(fs.existsSync('test/_input/up3.js')).be.true();
                        should(fs.readFileSync('test/_input/up3.js').toString()).be.equal(content3);
                        done();
                    });
            });
    });

    
    it('upload using a different cwd. download it back', function(done) {
        var content4 = randContent();
        fs.writeFileSync('test/_input/test4.js', content4);

        vinyl.src(['test4.js'], { cwd : 'test/_input' })
            .pipe(nscabinet())
            .on('finish', () => {
                nscabinet.download('test/_input/file4.js')
                    .pipe(vinyl.dest('test/_output'))
                    .on('finish', () => {
                        should(fs.existsSync('test/_output/file4.js')).be.true();
                        should(fs.readFileSync('test/_output/file4.js')
                            .toString()).be.equal(content4);
                        done();
                    });
            });
    });


});
