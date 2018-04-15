const gulp = require('gulp');
const less = require('gulp-less');
const path = require('path');
const browserSync = require('browser-sync');
const uglify = require('gulp-uglify');
const pump = require('pump');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');

const reload = browserSync.reload;

gulp.task('less', function() {
    return gulp.src('./src/styles/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('./dist/styles'))
        .pipe(reload({ stream: true }));
});

gulp.task('uglify', function(cb) {
    pump([
        gulp.src('./dist/scripts/*.js'),
        uglify(),
        gulp.dest('./dist/scripts')
    ], cb);
});

gulp.task('compile', function() {
    return browserify({
            entries: './src/scripts/main.js',
            debug: true,
        })
        .transform('babelify', { presets: ['es2015', 'react', 'stage-0'] })
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('./dist/scripts/'));
});

// watch files for changes and reload
gulp.task('serve', ['less', 'compile'], function() {
    browserSync({ server: { baseDir: '.' } });

    gulp.watch(
        ['*.html', 'src/*.js', 'src/styles/*.less', 'src/scripts/*.js', './../dist/*.js'],
        ['less', 'compile', reload]
    );
});
