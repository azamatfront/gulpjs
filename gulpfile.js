let preprocessor = 'scss';

const {src, dest, parallel, series, watch} 	= require('gulp');
const browserSync 													= require('browser-sync').create();
const concat																= require('gulp-concat');
const uglify																= require('gulp-uglify-es').default;
const scss																	= require('gulp-sass')(require('sass'));
const autoprefixer													= require('gulp-autoprefixer');
const cleancss															= require('gulp-clean-css');
const imagemin															= require('gulp-imagemin');
const newer																	= require('gulp-newer');
const del																		= require('del');

function cleaning() {
	return del('app/images/dist/**/*', {force: true})
}

function cleandist() {
	return del('dist/**/*', {force: true})
}

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app/'
		},
		notify: false,
		online: true
	})
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.min.js',
		'app/js/app.js'
	])
	.pipe(concat('app.min.js'))
	.pipe(uglify())
	.pipe(dest('app/js/'))
	.pipe(browserSync.stream())
}

function styles() {
	return src('app/' + preprocessor + '/main.' + preprocessor + '')
	.pipe(eval(preprocessor)())
	.pipe(concat('main.min.css'))
	.pipe(autoprefixer({
		overrideBrowserslist: ['last 10 versions'],
		grid: true
	}))
	.pipe(cleancss({
		level: {1: {specialComments: 0}},
		// format: 'beautify'
	}))
	.pipe(dest('app/css/'))
	.pipe(browserSync.stream())
}

function images() {
	return src('app/images/src/**/*')
	.pipe(newer('app/images/dist/'))
	.pipe(imagemin())
	.pipe(dest('app/images/dist'))
}

function startWatch() {
	watch(['app/**/' + preprocessor + '/**/*'], styles);
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
	watch('app/**/*.html').on('change', browserSync.reload);
	watch('app/images/src/**/*', images)
}

function buildCopy() {
	return src([
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/images/dist/**/*',
		'app/**/*.html'
	], {base: 'app'})
	.pipe(dest('dist'))
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleaning = cleaning;

exports.build = series(cleandist, styles, scripts, images, buildCopy);
exports.default = parallel(styles, scripts, browsersync, startWatch);