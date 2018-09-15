/*eslint-env node */
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require('gulp-sourcemaps');

gulp.task('scripts1', () => {
  gulp.src('js/main/*.js')
      .pipe(concat('index.js'))
      .pipe(uglify())
      .pipe(gulp.dest('js'))
});

gulp.task('scripts2', () => {
  gulp.src('js/restaurant-page/*.js')
      .pipe(concat('restaurant.js'))
      .pipe(uglify())
      .pipe(gulp.dest('js'));
});

gulp.task('image', () => {
  gulp.src('img/*')
      .pipe(imagemin())
      .pipe(gulp.dest('img'));
});

gulp.task('default', ['scripts1', 'scripts2']);