var gulp = require('gulp');
// var gutil = require('gulp-util');
// var bower = require('bower');
// var concat = require('gulp-concat');
// var sass = require('gulp-sass');
// var minifyCss = require('gulp-minify-css');
// var rename = require('gulp-rename');
// var sh = require('shelljs');
// var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var plato = require('gulp-plato');
var jsinspect = require('gulp-jsinspect');
var jshint = require('gulp-jshint');
var complexity = require('gulp-escomplex');
var reporter = require('gulp-escomplex-reporter-html');
var eslint = require('gulp-eslint');
var plato = require('plato');

// var paths = {
//   sass: ['./scss/**/*.scss']
// };

// gulp.task('default', ['sass']);

// gulp.task('sass', function(done) {
//   gulp.src('./scss/ionic.app.scss')
//     .pipe(sass())
//     .on('error', sass.logError)
//     .pipe(gulp.dest('./www/css/'))
//     .pipe(minifyCss({
//       keepSpecialComments: 0
//     }))
//     .pipe(rename({ extname: '.min.css' }))
//     .pipe(gulp.dest('./www/css/'))
//     .on('end', done);
// });

// gulp.task('watch', function() {
//   gulp.watch(paths.sass, ['sass']);
// });

// gulp.task('install', ['git-check'], function() {
//   return bower.commands.install()
//     .on('log', function(data) {
//       gutil.log('bower', gutil.colors.cyan(data.id), data.message);
//     });
// });

// gulp.task('git-check', function(done) {
//   if (!sh.which('git')) {
//     console.log(
//       '  ' + gutil.colors.red('Git is not installed.'),
//       '\n  Git, the version control system, is required to download Ionic.',
//       '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
//       '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
//     );
//     process.exit(1);
//   }
//   done();
// });

var platoOptions = {
  jshint: {
    options: {
      strict: false
    }
  },
  complexity: {
    trycatch: true
  }
};

// gulp.task('copy-css', function() {
//     gulp.src('./www/css/*.css')
//       .pipe(gulp.dest('build/app/css'));
// });

gulp.task('builder-app', function() {
  gulp.src('./routes/*/*.js')
    .pipe(gulp.dest('./build/js'));
});

gulp.task('copy-package', function() {
    gulp.src('package.json')
      .pipe(gulp.dest('build'));
});
gulp.task('copy-paste-report', function () {
  return gulp.src('./build/js/*.js')
  .pipe(jsinspect({
    'threshold':   10,
    'identifiers': true,
    'suppress':    0
  }));
});

// gulp.task('convoluted-code-smell-report', function () {
//   return gulp.src('./build/js/*.js')
//   .pipe(complexity({
//     packageName: 'gulp-escomplex',
//     packageVersion: '1.0.1beta4'
//   }))
//   .pipe(reporter())
//   .pipe(gulp.dest("reports/escomplex"));
// });

gulp.task('generate-report', function(){
  plato.inspect(['./build/js/*/*.js'], "./reports/complexity", platoOptions, function(e){
    
  })
})


gulp.task('lint', function() {
  return gulp.src('./build/js/*/*.js').pipe(eslint({
    'rules':{
        'quotes': [1, 'single'],
        'semi': [2, 'always'],
        'max-len': [1, 80],
        'max-statements': [2],
        'no-nested-ternary':[2],
        'one-var-declaration-per-line': [1],
        'no-unused-vars': [1],
        'camelcase': [1],
    }
  }))
  .pipe(eslint.format())
  // Brick on failure to be super strict
  .pipe(eslint.failOnError());
});

// gulp.task('watch', function() {
//     gulp.watch('./www/**/*.*', ['default']);
// });

gulp.task('default', ['builder-app', 'lint','generate-report']);
