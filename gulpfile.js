'use strict'

var gulp = require('gulp')
require('require-dir')('./gulp')

var env = process.env.NODE_ENV || 'development'
console.log('Invoking gulp -', env)

gulp.task('default', () => gulp.start(env) )
gulp.task('development', ['env:development', 'dev:eslint', 'dev:mocha'])
gulp.task('test', ['env:test', 'test:eslint', 'test:coverage'])