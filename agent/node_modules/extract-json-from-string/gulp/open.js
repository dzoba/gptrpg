const gulp = require('gulp');
const open = require('gulp-open');

gulp.task('open', () => {
  return gulp.src('./coverage/lcov-report/index.html', { read: false })
    .pipe(open());
});

