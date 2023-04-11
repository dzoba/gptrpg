const gulp = require('gulp');
const rimraf = require('rimraf');

gulp.task('clean:coverage', done => rimraf('./coverage', done));
gulp.task('clean:dist', done => rimraf('./dist', done));
gulp.task('clean:instrumented', done => rimraf('./instrumented', done));

gulp.task('clean', gulp.parallel('clean:coverage', 'clean:dist', 'clean:instrumented'));
