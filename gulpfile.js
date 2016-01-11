/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp'),
    jade = require('gulp-jade'),
    revision = require('gulp-rev'),
    inspect = require('gulp-tap'),
    clean = require('gulp-clean'),
    path = require('path'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    merge = require('merge-stream'),
    argv = require('yargs').argv,
    gulpif = require('gulp-if'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    s3 = require('gulp-s3'),
    gzip = require('gulp-gzip'),
    imagemin = require('gulp-imagemin'),
    sitemap = require('gulp-sitemap');




// CONFIGURATIONS
// ===============================================
var siteUrl = 'http://www.google.com';
var tracking = {
    ga: {
        testAccountId: '', // like UA-1234
        prodAccountId: '' // like UA-1235
    }
};
var srcPath = 'src/';
var distPath = 'dist/';
var jqueryPath = './src/js/vendor/jquery-1.11.3.min.js';
var modernizrPath = './src/js/vendor/modernizr-2.8.3.min.js';
var bootstrapJsPath = './bower_components/bootstrap-sass/assets/javascripts/bootstrap.js'
var fontPaths = [
    './bower_components/components-font-awesome/fonts/*.*'
];
// ===============================================




// CDN CACHE CONFIGURATIONS
// ===============================================

// files that shouldn't be cached
var noCacheFiles = [
    distPath + '**/*.html',
    distPath + '**/*.xml',
    distPath + '**/*.txt'
];
var noCacheOptions = {
    gzippedOnly: true,
    headers: { 'Cache-Control': 'max-age=0, no-transform, public' } // don't cache
};


// files that should be cached for a short period of time
var shortCacheFiles = [
    distPath + '**/*.jpg',
    distPath + '**/*.png',
    distPath + '**/*.ico'
];
var shortCacheOptions = {
    gzippedOnly: true,
    headers: { 'Cache-Control': 'max-age=86400, no-transform, public' } // cache for 1 day
};


// files that should be cached for a long period of time
var longCacheFiles = [
    distPath + '**/*.css',
    distPath + '**/*.eot',
    distPath + '**/*.svg',
    distPath + '**/*.ttf',
    distPath + '**/*.woff',
    distPath + '**/*.woff2',
    distPath + '**/*.otf',
    distPath + '**/*.js'
];
var longCacheOptions = {
    gzippedOnly: true,
    headers: { 'Cache-Control': 'max-age=604800, no-transform, public' } // cache for 7 days
};

// ===============================================




// needed to set dynamic file names
var fileNames = {
    css: {},
    js: {}
};




gulp.task('css', ['clean'], function () {
    var main = gulp.src(srcPath + 'css/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCss({ compatibility: 'ie8' }))
        .pipe(revision())
        .pipe(gulp.dest(distPath + 'css/'))
        .pipe(inspect(function (file, t) {
            fileNames.css.main = path.relative(path.join(__dirname, distPath), file.path).replace('\\', '/');
        }));

    var fonts = gulp.src(fontPaths)
        .pipe(gulp.dest(distPath + 'fonts/'));

    return merge(main, fonts);
});




gulp.task('javascript', ['clean'], function () {
    var jquery = gulp.src(jqueryPath)
        .pipe(gulp.dest(distPath + 'js/'))
        .pipe(inspect(function (file, t) {
            fileNames.js.jquery = path.relative(path.join(__dirname, distPath), file.path).replace('\\', '/');
        }));
    var modernizr = gulp.src(modernizrPath)
        .pipe(gulp.dest(distPath + 'js/'))
        .pipe(inspect(function (file, t) {
            fileNames.js.modernizr = path.relative(path.join(__dirname, distPath), file.path).replace('\\', '/');
        }));

    var main = gulp.src([
            // any javascript we want to combine into this file
            srcPath + 'js/*.js',
            srcPath + 'js/main/**/*.js',
            bootstrapJsPath])
        .pipe(concat('main.js'))
        .pipe(gulpif(argv.prod, uglify()))
        .pipe(gulpif(argv.prod, rename({suffix: '.min'})))
        .pipe(revision())
        .pipe(gulp.dest(distPath + 'js/'))
        .pipe(inspect(function (file, t) {
            fileNames.js.main = path.relative(path.join(__dirname, distPath), file.path).replace('\\', '/');
        }));

    return merge(jquery, modernizr, main);
});




gulp.task('templates', ['clean', 'javascript', 'css'], function () {
    var year = new Date().getFullYear();
    var YOUR_LOCALS = {
        fileNames: fileNames,
        year: year,
        tracking: tracking
    };

    // use prod ga account for prod
    if (argv.prod) YOUR_LOCALS.tracking.ga.accountId = tracking.ga.prodAccountId;
    else YOUR_LOCALS.tracking.ga.accountId = tracking.ga.testAccountId;

    return gulp.src([srcPath + 'templates/**/*.jade', '!' + srcPath + 'templates/layouts/**/*.jade'])
        .pipe(jade({
            locals: YOUR_LOCALS
        }))
        .pipe(gulp.dest(distPath));
});
gulp.task('sitemap', ['clean', 'templates'], function () {
    return gulp.src(distPath + '**/*.html')
        .pipe(sitemap({
            siteUrl: siteUrl
        }))
        .pipe(gulp.dest(distPath));
});




gulp.task('clean', function () {
    return gulp.src(distPath + '**/*.*', { read: false })
        .pipe(clean());
});
gulp.task('copy', ['clean'], function () {
    var root = gulp.src(srcPath + '*.*')
        .pipe(gulp.dest(distPath));

    // anything else that needs to be copied here

    return merge(root);
});
gulp.task('images', ['clean'], function () {
    var compressed = gulp.src(srcPath + 'img/**/*.*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
        }))
        .pipe(gulp.dest(distPath + 'img/'));

    // any other image copying here

    return merge(compressed);
});




gulp.task('s3', ['clean', 'templates', 'copy', 'images', 'sitemap'], function () {
    var aws = require('./aws.json');

    var longCache = gulp.src(longCacheFiles)
        .pipe(gzip())
        .pipe(s3(aws, longCacheOptions));

    var shortCache = gulp.src(shortCacheFiles)
        .pipe(gzip())
        .pipe(s3(aws, shortCacheOptions));

    var noCache = gulp.src(noCacheFiles)
        .pipe(gzip())
        .pipe(s3(aws, noCacheOptions));

    return merge(longCache, shortCache, noCache);
});




gulp.task('build', ['clean', 'templates', 'copy', 'images', 'sitemap'], function () {

});
gulp.task('watch', ['build'], function () {
    gulp.watch(srcPath + 'templates/**/*.*', ['build']);
    gulp.watch(srcPath + 'css/**/*.*', ['build']);
    gulp.watch(srcPath + 'js/**/*.*', ['build']);
});
gulp.task('default', ['watch'], function () {

});