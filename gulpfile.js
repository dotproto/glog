var gulp = require('gulp');

var clean = require('gulp-clean');
var concat = require('gulp-concat');
var declare = require('gulp-declare');
var defineModule = require('gulp-define-module');
// var handlebars = require('gulp-handlebars');
var handlebars = require('gulp-ember-handlebars');


// Paths used by various build tasks
var paths = {
	'output': './_dist',
	'static': {
		html: 'index.html',
		js: [ './js/**/*.js', '!./js/templates' ],
		css: [ './css/**/*.css' ]
	},
	'templates': ['./js/templates/*.handlebars' ]
}

// Define static sub-tasks
// - JS
gulp.task('static-js', function() {
	gulp.src(paths.static.js, { base: './js'})
		.pipe(gulp.dest( paths.output + '/js'));
})
// - HTML
gulp.task('static-html', function() {
	gulp.src(paths.static.html, { base: './'})
		.pipe(gulp.dest( paths.output + '/'));
})
// - CSS
gulp.task('static-css', function() {
	gulp.src(paths.static.css, { base: './css'})
		.pipe(gulp.dest( paths.output + '/css'));
})
// All static
gulp.task('static', ['static-js', 'static-html', 'static-css']);

// Pre-compile EmberJS templates
// gulp.task('templates', function(){
// 	gulp.src(paths.templates)
// 		.pipe(handlebars())
// 		.pipe(defineModule('plain'))
// 		.pipe(declare({
// 			namespace: 'Ember.TEMPLATES'
// 		}))
// 		.pipe(concat('templates.js'))
// 		.pipe(gulp.dest('_dist/js/'));
// });
gulp.task('templates', function(){
  gulp.src(paths.templates)
    .pipe(handlebars({
      outputType: 'browser'
     }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest( paths.output + '/js' ));
});

// NUKE IT FROM ORBIT
gulp.task('clean', function() {
	gulp.src(paths.output, {read: false})
		.pipe(clean());
})

// Rerun tasks when their associated files change
gulp.task('watch', function() {
	gulp.watch(paths.templates, ['templates']);
	gulp.watch(paths.static.js, ['static-js']);
	gulp.watch(paths.static.css, ['static-css']);
	gulp.watch(paths.static.html, ['static-html']);
});

// Default task
gulp.task('default', ['static', 'templates', 'watch']);
