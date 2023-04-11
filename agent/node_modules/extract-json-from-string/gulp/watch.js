const gulp = require('gulp');
const config = require('./config');

gulp.task('watch', (done) => {
  gulp.watch(config.lib.concat(config.tests), gulp.series('unit'));
  done();
});

