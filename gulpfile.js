const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const cleancss = require('gulp-clean-css');
const gulp = require('gulp');
const gutil = require('gulp-util');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const watch = require('gulp-watch');

process.env.NODE_ENV = typeof process.env.npm_config_development !== 'undefined'
  ? 'development'
  : 'production';

gulp.task('build', ['browserify', 'copy', 'css']);

gulp.task('browserify', () => {
  const b = browserify({
    entries: './src/Popup/Popup.js',
    debug: true,
    transform: [babelify],
  });

  return b.bundle()
    .pipe(source('Popup.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
      // Add transformation tasks to the pipeline here.
      .pipe(uglify())
      .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/Popup'));
});

gulp.task('copy', () => {
  gulp
    .src([
      '!./src/__mocks__/*.js',
      '!./src/**/*-test.js',
      '!./src/Popup/*.js',
      './src/**/*.js',
      './src/**/*.html',
      './src/**/*.json',
      './src/**/*.png',
    ])
    .pipe(gulp.dest('./dist'));
});

gulp.task('css', () =>
  gulp
    .src('./src/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleancss())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'))
);

gulp.task('css:watch', () =>
  gulp
    .src('./src/**/*.scss')
    .pipe(watch('./src/**/*.scss'))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleancss())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'))
);
