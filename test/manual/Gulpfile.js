var testcafe = require('../../');
var mocha    = require('gulp-mocha');
var gulp     = require('gulp');


gulp.task('unit', function () {
    return gulp
        .src('mocha-test.js')
        .pipe(mocha());
});

gulp.task('functional', function () {
    return gulp
        .src('../fixtures/passing*.js')
        .pipe(testcafe({
            browsers: ['chrome'],
            reporter: 'list'
        }));
});

gulp.task('functional-fail', function () {
    return gulp
        .src('../fixtures/failing.js')
        .pipe(testcafe({
            browsers: ['chrome'],
            reporter: 'list'
        }));
});

gulp.task('test', ['functional', 'unit']);
gulp.task('test-fail', ['functional-fail', 'unit']);
