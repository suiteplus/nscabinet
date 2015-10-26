'use strict';

var fs = require('fs'),
    nsmockup = require('nsmockup'),
    nscabinet = require('../.');

var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

describe('<Unit Test - NetSuite File Cabinet>', () => {
    var should = require('should'),
        vinyl = require('vinyl-fs');

    beforeEach(function (done) {
        this.timeout(10000);

        ['.nscabinet'].forEach(function(dir) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
        });

        nsmockup.init({server: true}, (err) => {
            if (err) return done(err);
            else {
                let opts = {
                    name: 'customscript_nscabinet_restlet',
                    files: [
                        __dirname + '/../restlet/nscabinet-restlet.js'
                    ],
                    funcs: {
                        post: 'post'
                    }
                };
                nsmockup.createRESTlet(opts, () => {
                    return done();
                });
            }
        });
    });

    describe('Upload and download a file...', function() {
        let outDir = '.nscabinet/output';
        
        it('is the login set up?', () => {
            nscabinet.checkParams({});
        });

        it('upload it!', function (done) {
            this.timeout(10000);
            vinyl.src('test/__input-files/uploadme.txt')
                .pipe(nscabinet())
                .pipe(vinyl.dest(outDir))
                .on('finish', function () {
                    should(fs.existsSync(outDir));
                    done();
                });
        });

        //it('force auth error', function (done) {
        //    this.timeout(10000);
        //    vinyl.src('test/__input-files/uploadme.txt')
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

        it('download back our file', function (done) {
            this.timeout(10000);
            let download = function() {
                nscabinet.download('test/__input-files/uploadme.txt')
                    .pipe(vinyl.dest(outDir))
                    .on('finish', () => {
                        var outpath = outDir + '/test/__input-files/uploadme.txt';

                        should(fs.existsSync(outpath)).be.true();
                        should(fs.readFileSync(outpath).toString()).be.equal('content\ncontent');
                        done();
                    });
            };

            vinyl.src('test/__input-files/uploadme.txt')
                .pipe(nscabinet())
                .pipe(vinyl.dest(outDir))
                .on('finish', function () {
                    should(fs.existsSync(outDir));
                    download();
                });
        });

        it('upload two files. download them using a wildcard', function (done) {
            this.timeout(20000);

            fs.writeFileSync('test/__input-files/file1.js', 'hello 1');
            fs.writeFileSync('test/__input-files/file2.js', 'hello 2');

            vinyl.src('test/__input-files/*.js').pipe(nscabinet())
                .on('finish', () => {
                    nscabinet
                        .download('test/__input-files/*.js')
                        .pipe(vinyl.dest(outDir))
                        .on('finish', () => {
                            should(fs.existsSync(outDir + '/test/__input-files/file1.js')).be.true();
                            should(fs.readFileSync(outDir + '/test/__input-files/file1.js').toString()).be.equal('hello 1');

                            should(fs.existsSync(outDir + '/test/__input-files/file2.js')).be.true();
                            should(fs.readFileSync(outDir + '/test/__input-files/file2.js').toString()).be.equal('hello 2');

                            done();
                        });
                });
        });
    });

    afterEach(function (done) {
        nsmockup.destroy(function(err) {
            if (err) {
                return done(err);
            } else {
                deleteFolderRecursive('.nscabinet');
                return done();
            }
        });
    });
});
