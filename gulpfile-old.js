var gulp = require('gulp'),
//add gulp-plugins when we have more plugins
    plugins = {
        eslint: require('gulp-eslint'),
        mocha: require('gulp-mocha')
    }

var PATHS ={
    alljs : ['src/*.js','test/*.js','restlet/*.js']
}

gulp.task('eslint', () => {

    var el = plugins.eslint

    return gulp.src(PATHS.alljs)
        .pipe(el())
        .pipe(el.format())
        .pipe(el.failAfterError())

})

gulp.task('tests', () => {

    return gulp.src('test/*-test.js').pipe(plugins.mocha())

})

gulp.task('watch', () => {

    gulp.watch(PATHS.alljs, ['eslint'])

})