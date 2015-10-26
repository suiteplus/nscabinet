'use strict';

var file, msg = '**/*-test.js';
process.argv.forEach(function (val, index, array) {
    if (val === '-file' || val === '--f') {
        let env_val = array[index + 1];
        msg = '**/*' + env_val + '*-test.js';
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
            appRoot + '/restlet/**/*.js',
            appRoot + '/src/**/*.js'
        ],
        jsRequire: [
            appRoot + '/src/**/*.js',
            '!' + appRoot + '/src/cli.js'
        ],
        jsVMContext: [appRoot + '/restlet/**/*.js'],
        jsTest: [appRoot + '/test/**/*-test.js']
    };

gulp.task('env:test', function () {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    process.env.NODE_ENV = 'test';

    let $port = process.env.PORT || 3030;
    process.env.NS_SERVER = `http://localhost:${$port}/app/site/hosting/restlet.nl`;
    process.env.NSCONF_EMAIL = 'test@@suiteplus.com';
    process.env.NSCONF_PASSWORD = '123';
    process.env.NSCONF_ACCOUNT = 'JJJ';
    process.env.NSCONF_SCRIPT = '1';
});

gulp.task('test:eslint', function () {
    return gulp.src(paths.js)
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
});

gulp.task('test:coverage', function () {
    var deferred = require('q').defer();

    let executeTests = function () {
        gulp.src(paths.jsTest)
            .pipe(plugins.mocha({
                reporters: 'spec'
            }))
            .pipe(plugins.istanbulSp.writeReports({
                reports: ['lcovonly']
            })); // Creating the reports after tests runned
    };

    // instrumentation nsapi.js
    gulp.src(paths.jsRequire)
        .pipe(plugins.istanbulSp({
            includeUntested: true

        })) // Covering files
        .pipe(plugins.istanbulSp.hookRequire())
        //.pipe(plugins.istanbulSp.hookCreateScript())
        //.pipe(plugins.istanbulSp.hookRunInContext())
        .on('finish', () => executeTests());
    return deferred.promise;
});

gulp.task('test', ['env:test', 'test:eslint', 'test:coverage']);