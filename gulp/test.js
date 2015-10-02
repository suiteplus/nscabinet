'use strict';

var file, msg = '**/*-test.js';
process.argv.forEach(function (val, index, array) {
    if (val === '-file' || val === '--f') {
        let env_val = array[index + 1];
        msg = '**/*' + env_val+ '*-test.js';
        file = env_val;
    }
});
console.log('use => load tests: ', msg);

var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins(),
    appRoot = process.cwd(),
    paths = {
        js: [
            appRoot + '/reslet/**/*.js',
            appRoot + '/src/**/*.js'
        ],
        jsRequire: [appRoot + '/src/**/*.js'],
        jsVMContext: [appRoot + '/reslet/**/*.js']
    };
var defaultTasks = ['env:test', 'test:eslint', 'test:coverage'];

gulp.task('env:test', function () {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    process.env.NODE_ENV = 'test';
    let $port = process.env.PORT || 3001;
    process.env.NS_SERVER = `http://localhost:${$port}/nscabinet-reslet`;
    process.env.NSCONF_EMAIL = 'test@@suiteplus.com';
    process.env.NSCONF_PASSWORD = '123';
    process.env.NSCONF_ACCOUNT = 'JJJ';
    process.env.NSCONF_SCRIPT = 'nscabinet-restlet';
});

gulp.task('test:eslint', function () {
    return gulp.src(paths.js)
        .pipe(plugins.plumber())
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
});

gulp.task('test:coverage', function (cb) {
    var deferred = require('q').defer();

    let executeTests = function () {
        var fakerServer = require(appRoot + '/test/__mock-server/fake-server');
        fakerServer.start(() => {
            let path = '/test/**/*' + (file ? file + '*' : '') + '-test.js';
            gulp.src([appRoot + path])
                .pipe(plugins.plumber(() => fakerServer.stop(deferred.resolve)))
                .pipe(plugins.mocha({
                    reporters: 'spec'
                }))
                .pipe(plugins.istanbul.writeReports({
                    reports: ['lcovonly']
                })); // Creating the reports after tests runned
        });
    };

    // instrumentation nsapi.js
    //gulp.src(paths.jsRequire)
    //    .pipe(plugins.plumber())
    //    .pipe(plugins.istanbul({
    //        includeUntested: true,
    //        instrumenter: require('isparta').Instrumenter
    //
    //    })) // Covering files
    //    .pipe(plugins.istanbul.hookRequire())// Force `require` to return covered files
    //    .on('finish', () => executeTests());
    executeTests();
    return deferred.promise;
});

gulp.task('test', defaultTasks);