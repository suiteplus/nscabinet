'use strict';

var gulp = require('gulp');
require('require-dir')('./gulp');

var env = process.env.NODE_ENV || 'development';
console.log('Invoking gulp -', env);

gulp.task('default', () => gulp.start(env));