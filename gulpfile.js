const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('transpile', () =>
    gulp.src('./src/index.js')
        .pipe(babel({
            presets: ['es2015', 'react', 'stage-0']
        }))
        .pipe(gulp.dest('./dist'))
);

// watch files for changes and recompile
gulp.task('watch', ['transpile'], function() {
    gulp.watch(
        ['./src/*.js'],
        ['transpile']
    );
});
