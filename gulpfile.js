var gulp       = require('gulp'),
    sass       = require('gulp-sass'),
    concat     = require('gulp-concat')
    uglify     = require('gulp-uglify')
    pump       = require('pump')

gulp.task('hola', function(){
  return console.log('hola mundo');
});

gulp.task('build', function(){
  gulp.src('./public/javascripts/**/*.js')
    .pipe(concat('plugin.js'))
    .pipe(gulp.dest('./public/build'))
});

gulp.task('styles', function() {
  gulp.src('./public/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/stylesheets/compiler_sass'));
});

gulp.task('script', function(cb) {
  pump([
    gulp.src('./scripts/script1.js'),
    uglify(),
    gulp.dest('dist.js')
  ], cb)
})
