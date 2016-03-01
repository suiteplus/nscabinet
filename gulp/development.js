'use strict';

var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')();

gulp.task('env:development', function () {
    process.env.NODE_ENV = 'development';
});

gulp.task('dev:eslint', function () {
    return gulp.src(['restlet/*.js', 'src/*.js'])
        .pipe(plugins.plumber())
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
});

gulp.task('dev:mocha', () => {
    return gulp.src('test/*-test.js')
        .pipe(plugins.plumber())
        .pipe(plugins.mocha());
});

gulp.task('development', ['env:development', 'dev:eslint', 'dev:mocha']);