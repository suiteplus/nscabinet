'use strict';

var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

gulp.task('env:development', function () {
    process.env.NODE_ENV = 'development';
});

gulp.task('dev:eslint', function () {
    return gulp.src(['!node_modules/**/*.*','./**/*.js','!test/**/*.js','test/*.js'])
        .pipe(plugins.plumber())
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
});

gulp.task('dev:mocha', () => {
    gulp.src('test/*.js')
        .pipe(plugins.plumber())
        .pipe(plugins.mocha());
});