'use strict';

var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins(),
    appRoot = process.cwd(),
    paths = {
        js: [
            appRoot + '/reslet/**/*.js',
            appRoot + '/src/**/*.js'
        ],
        jsTest: [appRoot + '/test/**/*-test.js']
    };

gulp.task('env:development', function () {
    process.env.NODE_ENV = 'development';
});

gulp.task('dev:eslint', function () {
    return gulp.src(paths.js)
        .pipe(plugins.plumber())
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
});

gulp.task('dev:mocha', () => {
    gulp.src(paths.jsTest)
        .pipe(plugins.plumber())
        .pipe(plugins.mocha());
});

gulp.task('development', ['env:development', 'dev:eslint', 'dev:mocha']);