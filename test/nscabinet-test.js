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

    //steps from this test suite may have dependencies upon each other,
    //please dont add any clean-up between steps. For a fresh set of data,
    //add a new test suite.

    before( function() {
        del.sync(['test/_input/**','test/_output/**']);
        fs.mkdirSync('test/_input');
        fs.mkdirSync('test/_output');
        //return nscabinet.deleteFolder('test');
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
    it('upload it!', function (done) {
        fs.writeFileSync('test/_input/test1.txt',content1);
        vinyl.src('test/_input/test1.txt')
            .pipe(nscabinet())
            .on('finish', () => {
                done();
            });
    });


    it('download back our file', function (done) {
        nscabinet.download('test/_input/test1.txt')
            .pipe(vinyl.dest('test/_output'))
            .on('finish', () => {
                should(fs.existsSync('test/_output/test/_input/test1.txt')).be.true();
                should(fs.readFileSync('test/_output/test/_input/test1.txt').toString())
                    .be.equal(content1);
                done();
            });
    });

    
    it('upload two files. download them using a wildcard', function (done) {
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
                        should(fs.existsSync('test/_output/test/_input/up2.js')).be.true();
                        should(fs.readFileSync('test/_output/test/_input/up2.js').toString())
                            .be.equal(content2);
                        should(fs.existsSync('test/_output/test/_input/up3.js')).be.true();
                        should(fs.readFileSync('test/_output/test/_input/up3.js').toString())
                            .be.equal(content3);
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
                nscabinet.download('test4.js')
                    .pipe(vinyl.dest('test/_output'))
                    .on('finish', () => {
                        should(fs.existsSync('test/_output/test4.js')).be.true();
                        should(fs.readFileSync('test/_output/test4.js')
                            .toString()).be.equal(content4);
                        done();
                    });
            });
    });


    it('upload and download a bigger file' , function(done) {
        var content = '';
        for ( var it = 0 ; it < 10000 ; it++ ) {
            content += randContent() + '\n';
        }
        fs.writeFileSync('test/_input/bigfile.txt', content);
        vinyl.src(['test/_input/bigfile.txt'])
            .pipe(nscabinet())
            .on('finish' , () => {
                nscabinet.download('test/_input/bigfile.txt')
                .pipe(vinyl.dest('test/_output'))
                .on('finish', () => {
                    //#callbackhell
                    should(fs.existsSync('test/_output/test/_input/bigfile.txt')).be.true();
                    should(fs.readFileSync('test/_output/test/_input/bigfile.txt')
                        .toString()).be.equal(content);
                    done();
                });
            });
    });


    //before running this
    //install this updated copy of nscabinet globally using, for instance, npm i -g .
    /*
    it('upload from sub path using CLI. download it back', function(done) {
        var content = randContent();
        fs.writeFileSync('test/_input/test5.js', content);

        var cp = require('child_process');
        var out = cp.execSync('nscabinet u test5.js' , { cwd : 'test/_input' } );
        console.log(String(out));
        nscabinet.download('test5.js')
            .pipe(vinyl.dest('test/_output'))
            .on('finish', () => {
                should(fs.existsSync('test/_output/test/_input/test5.js')).be.true();
                should(fs.readFileSync('test/_output/test/_input/test5.js')
                    .toString()).be.equal(content);
                done();
            });
    });
    */


    it('try to download 2 files, the 1st does not exist. Emit warning but still download the second', function(done){
        var content = randContent();
        fs.writeFileSync('test/_input/cnt1.txt', content);
        vinyl.src(['test/_input/cnt1.txt']).pipe(nscabinet()).on('finish', () => {
            nscabinet.download(['test/_input/cnt2.txt','test/_input/cnt1.txt'])
                .pipe(vinyl.dest('test/_output'))
                .on('finish' , () => {
                    should(fs.existsSync('test/_output/test/_input/cnt1.txt')).be.true();
                    should(fs.readFileSync('test/_output/test/_input/cnt1.txt').toString())
                        .be.equal(content);
                    done()
                });
        });

    });


});
