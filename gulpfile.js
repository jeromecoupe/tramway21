'use strict';

// Load plugins
var gulp					= require('gulp');
var sass					= require('gulp-sass');
var autoprefixer	= require('gulp-autoprefixer');
var jshint				= require('gulp-jshint');
var stripdebug		= require('gulp-strip-debug');
var uglify				= require('gulp-uglify');
var rename				= require('gulp-rename');
var replace				= require('gulp-replace');
var concat				= require('gulp-concat');
var notify				= require('gulp-notify');
var minifycss			= require('gulp-minify-css');
var plumber				= require('gulp-plumber');
var gutil					= require('gulp-util');
var base64				= require('gulp-base64');
var imagemin			= require('gulp-imagemin');
var svgstore			= require('gulp-svgstore');
var cp			      = require('child_process');
var browsersync		= require('browser-sync');

// error function for plumber
var onError = function (err) {
	gutil.beep();
	console.log(err);
	this.emit('end');
};

// Browser definitions for autoprefixer
var AUTOPREFIXER_BROWSERS = [
	'last 3 versions',
	'ie >= 9'
];

// BrowserSync proxy
gulp.task('browser-sync', function() {
	browsersync({
		proxy: 'www.tramway21.dev',
		port: 3000
	});
});

// BrowserSync reload all Browsers
gulp.task('browsersync-reload', function () {
    browsersync.reload();
});

// Optimize Images task
gulp.task('img', function() {
	return gulp.src(['./img/**/*'])
	.pipe(imagemin({
		progressive: true,
		svgoPlugins: [ {removeViewBox:false}, {removeUselessStrokeAndFill:false} ]
	}))
	.pipe(gulp.dest('./img/'))
	.pipe(notify({ message: 'Images task done' }));
});

// CSS task
gulp.task('css', function() {
	return gulp.src('./css/**/*.scss')
	.pipe(plumber({ errorHandler: onError }))
	.pipe(sass({ style: 'expanded' }))
	.pipe(gulp.dest('./css/dist/'))
	.pipe(gulp.dest('./_site/css/dist/'))
	.pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
	.pipe(base64({ extensions:['svg'] }))
	.pipe(rename({ suffix: '.min' }))
	.pipe(minifycss())
	.pipe(gulp.dest('./css/dist/'))
	.pipe(gulp.dest('./_site/css/dist/'))
	.pipe(browsersync.reload({stream:true}))
	.pipe(notify({ message: 'Styles task done' }));
});

// Lint JS task
gulp.task('jslint', function() {
	return gulp.src('./js/modules/**/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
	.pipe(jshint.reporter('fail'))
	.pipe(notify({ message: 'Lint task done' }));
});

//Concatenate and Minify JS task
gulp.task('scripts', function() {
	return gulp.src(['./js/modules/**/*.js'])
	.pipe(concat('all.js'))
	.pipe(gulp.dest('./js/dist/'))
	.pipe(gulp.dest('./_site/js/dist/'))
	.pipe(rename('all.min.js'))
	.pipe(stripdebug())
	.pipe(uglify())
	.pipe(gulp.dest('./js/dist/'))
	.pipe(gulp.dest('./_site/js/dist/'))
	.pipe(browsersync.reload({stream:true}))
	.pipe(notify({ message: 'Scripts task done' }));
});

// Jekyll build
gulp.task('jekyll-build', function (done) {
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
  .on('close', done);
})

// Rebuild Jekyll & reload
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browsersync.reload();
});

// Watch task
gulp.task('watch', ['browser-sync'], function () {
	gulp.watch('./css/**/*.scss', ['css']);
	gulp.watch('./js/modules/**/*', ['jslint', 'scripts']);
	gulp.watch(['index.html','_includes/**/*','_layouts/**/*'], ['jekyll-rebuild']);
});

// Tasks
gulp.task('default', ['css', 'jslint', 'scripts', 'jekyll-build']);
gulp.task('images', ['img']);
gulp.task('svg', ['svgsprite']);
