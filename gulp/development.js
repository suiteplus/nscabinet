'use strict';

var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    through = require('through'),
    plugins = gulpLoadPlugins(),
    appRoot = process.cwd(),
    paths = {
        js: [
            appRoot + '/restlet/**/*.js',
            appRoot + '/src/**/*.js'
        ],
        jsTests: [appRoot + '/test/**/*-test.js']
    };

var defaultTasks = ['env:development', 'dev:eslint', 'dev:mocha', 'watch'];

gulp.task('env:development', function () {
    process.env.NODE_ENV = 'development';
});

gulp.task('dev:eslint', function () {
    return gulp.src(paths.js.concat(paths.jsTests))
        .pipe(plugins.plumber())
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
});

gulp.task('dev:mocha', function (cb) {
    gulp.src(paths.jsTests)
        .pipe(plugins.plumber())
        .pipe(plugins.mocha({
            reporters: 'spec'
        }));
});

gulp.task('watch', function () {
    gulp.watch(paths.js.concat(paths.jsTests), ['dev:eslint', 'dev:mocha'])
        .on('error', e => console.error(e));
});

gulp.task('development', defaultTasks);