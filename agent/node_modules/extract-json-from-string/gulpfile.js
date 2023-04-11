const gulp = require('gulp');

require('file-manifest').generate('./gulp', { match: '*.js' });

gulp.task('cover', gulp.series('clean:coverage', 'spawn:nyc'));
gulp.task('ci', gulp.series(gulp.parallel('lint', 'cover', 'phantom'), 'codeclimate'));
gulp.task('test', gulp.series('cover', 'browser'));
gulp.task('unit', gulp.series('spawn:nyc'));
gulp.task('default', gulp.series('lint', 'test'));
gulp.task('build', gulp.series('clean:dist', 'spawn:webpack'));
