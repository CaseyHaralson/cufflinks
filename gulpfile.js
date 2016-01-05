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



var siteUrl = '';
var distPath = 'dist/';
var fileNames = {
    css: {},
    js: {}
};
var jqueryPath = './src/js/vendor/jquery-1.11.3.min.js';
var modernizrPath = './src/js/vendor/modernizr-2.8.3.min.js';
var bootstrapJsPath = './bower_components/bootstrap-sass/assets/javascripts/bootstrap.js'
var fontPaths = [
    './bower_components/components-font-awesome/fonts/*.*'
];
var tracking = {
    dontAutoPageview: [
        ''
    ],
    ga: {
        testAccountId: '',
        prodAccountId: '',
        accountId: ''
    }
};




gulp.task('sass', ['clean'], function () {
    var front = gulp.src('./css/front.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCss({ compatibility: 'ie8' }))
        .pipe(revision())
        .pipe(gulp.dest(distPath + 'css/'))
        .pipe(inspect(function (file, t) {
            fileNames.css.front = path.relative(path.join(__dirname, distPath), file.path).replace('\\', '/');
        }));
    var slides = gulp.src('./css/slides.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCss({ compatibility: 'ie8'}))
        .pipe(revision())
        .pipe(gulp.dest(distPath + 'css/'))
        .pipe(inspect(function (file, t) {
            fileNames.css.slides = path.relative(path.join(__dirname, distPath), file.path).replace('\\', '/');
        }));
    var ie8 = gulp.src('./css/ie8.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCss({ compatibility: 'ie8' }))
        .pipe(revision())
        .pipe(gulp.dest(distPath + 'css/'))
        .pipe(inspect(function (file, t) {
            fileNames.css.ie8 = path.relative(path.join(__dirname, distPath), file.path).replace('\\', '/');
        }));

    var fonts = gulp.src(fontPaths)
        .pipe(gulp.dest(distPath + 'fonts/'));

    return merge(front, slides, ie8, fonts);
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


    var front = gulp.src(['./js/*.js', './js/front/**/*.js', bootstrapJsPath].concat(['!' + jqueryPath, '!' + modernizrPath]))
        .pipe(concat('site.js'))
        .pipe(gulpif(argv.prod, uglify()))
        .pipe(gulpif(argv.prod, rename({suffix: '.min'})))
        .pipe(revision())
        .pipe(gulp.dest(distPath + 'js/'))
        .pipe(inspect(function (file, t) {
            fileNames.js.front = path.relative(path.join(__dirname, distPath), file.path).replace('\\', '/');
        }));

    var slides = gulp.src(['./js/*.js', './js/slides/**/*.js', slipnJSPath].concat(['!' + jqueryPath, '!' + modernizrPath]))
        .pipe(concat('slides.js'))
        .pipe(gulpif(argv.prod, uglify()))
        .pipe(gulpif(argv.prod, rename({ suffix: '.min' })))
        .pipe(revision())
        .pipe(gulp.dest(distPath + 'js/'))
        .pipe(inspect(function (file, t) {
            fileNames.js.slides = path.relative(path.join(__dirname, distPath), file.path).replace('\\', '/');
        }));

    return merge(jquery, modernizr, front, slides);
});




gulp.task('templates', ['clean', 'javascript', 'sass'], function () {
    var year = new Date().getFullYear();
    var YOUR_LOCALS = {
        fileNames: fileNames,
        year: year,
        tracking: tracking
    };

    // use prod ga account for prod
    if (argv.prod) YOUR_LOCALS.tracking.ga.accountId = tracking.ga.prodAccountId;

    return gulp.src(['./templates/**/*.jade', '!./templates/layouts/**/*.*'])
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
    var source = [
        './*.*'
    ];
    var ignore = [
        '!./404_boilerplate.html',
        '!./aws.json',
        '!./boilerplate.html',
        '!./bower.json',
        '!./gulpfile.js',
        '!./humans.txt',
        '!./LICENSE.txt',
        '!./package.json',

        '!./*.tmp',
        '!./*.docx'
    ];

    var root = gulp.src(source.concat(ignore))
        .pipe(gulp.dest(distPath));

    //var images = gulp.src('./img/**/*.*')
    //    .pipe(gulp.dest(distPath + 'img/'));

    return merge(root);
});

gulp.task('images', ['clean'], function () {
    var compressed = gulp.src('./img/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
        }))
        .pipe(gulp.dest(distPath + 'img/'));

    //var photos = gulp.src('./img/photography/**/*.*')
    //    .pipe(imagemin({
    //        progressive: true,
    //        svgoPlugins: [{ removeViewBox: false }],
    //    }))
    //    .pipe(gulp.dest(distPath + 'img/photography/'));

    return merge(compressed);
});



gulp.task('s3', ['clean', 'templates', 'copy', 'images', 'sitemap'], function () {
    var aws = require('./aws.json');

    // css
    // fonts
    // javascript
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
        headers: { 'Cache-Control': 'max-age=604800, no-transform, public' } // 7 days
    };
    var longCache = gulp.src(longCacheFiles)
        .pipe(gzip())
        .pipe(s3(aws, longCacheOptions));


    // images
    // .ico
    var shortCacheFiles = [
        distPath + '**/*.jpg',
        distPath + '**/*.png',
        distPath + '**/*.ico'
    ];
    var shortCacheOptions = {
        gzippedOnly: true,
        headers: { 'Cache-Control': 'max-age=86400, no-transform, public' } // 1 day
    };
    var shortCache = gulp.src(shortCacheFiles)
        .pipe(gzip())
        .pipe(s3(aws, shortCacheOptions));


    // not cached
    // .html, .xml, .txt
    var noCacheFiles = [
        distPath + '**/*.html',
        distPath + '**/*.xml',
        distPath + '**/*.txt'
    ];
    var noCacheOptions = {
        gzippedOnly: true,
        headers: { 'Cache-Control': 'max-age=0, no-transform, public' } // none
    };
    var noCache = gulp.src(noCacheFiles)
        .pipe(gzip())
        .pipe(s3(aws, noCacheOptions));


    return merge(longCache, shortCache, noCache);

    /*var options = {
        gzippedOnly: true,
        headers: {'Cache-Control': 'max-age=3600, no-transform, public'} // 21600 = 6 hours
    };

    return gulp.src(distPath + '**')
        .pipe(gzip())
        .pipe(s3(aws, options));*/
});





gulp.task('build', ['clean', 'templates', 'copy', 'images', 'sitemap'], function () {

});
gulp.task('watch', ['build'], function () {
    gulp.watch('./templates/**/*.jade', ['build']);
    gulp.watch('./css/**/*.scss', ['build']);
    gulp.watch('./js/**/*.js', ['build']);
});
gulp.task('default', ['watch'], function () {

});