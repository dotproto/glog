var gulp = require('gulp');

var clean = require('gulp-clean');
var concat = require('gulp-concat');
var declare = require('gulp-declare');
var defineModule = require('gulp-define-module');
var handlebars = require('gulp-ember-handlebars');
var livereload = require('gulp-livereload');


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
	var server = livereload();

	var reload = function(file) {
		server.changed(file.path);
	}

	gulp.watch(paths.templates, ['templates']).on('change', reload);
	gulp.watch(paths.static.js, ['static-js']).on('change', reload);
	gulp.watch(paths.static.css, ['static-css']).on('change', reload);
	gulp.watch(paths.static.html, ['static-html']).on('change', reload);
});

// Default task
gulp.task('default', ['static', 'templates', 'watch']);
