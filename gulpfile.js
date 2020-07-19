const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const nunjucksRender = require('gulp-nunjucks-render');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const { src, dest, series, parallel, watch } = require('gulp');
const browserSync = require("browser-sync").create();
const babel = require('gulp-babel');

const jsPath = './src/assets/js/**/*.js';
const cssPath = './src/assets/css/**/*.css';
const htmlPagesPath = './src/pages/*.html';
const htmlTemplatesPath = './src/templates/*.html';

// nunjucks
function nunjucks() {
    return src('./src/pages/*.html')
        .pipe(nunjucksRender({
            path: ['src/templates/']
        }))
        .pipe(dest('./dist'));
}

function nunjucksMinify() {
    return src('./src/pages/*.html')
        .pipe(nunjucksRender({
            path: ['src/templates/']
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest('./dist'));
}

// Optimize images
function imageTask() {
    return src('./src/images/*').pipe(imagemin()).pipe(dest('./dist/images'));
}

// minify JS
function jsTask() {
    return src(jsPath)
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['@babel/preset-env'] }))
        .pipe(concat('all.js'))
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./dist/assets/js'));
}

// Compile and minify Sass
function cssTask() {
    return src(cssPath)
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./dist/assets/css'))
        .pipe(browserSync.stream());
}

// watch all the tasks
function watchTask() {
    browserSync.init({
        server: {
            baseDir: "dist/",
        }
    });
    watch(cssPath, cssTask);
    watch(jsPath, jsTask).on('change', browserSync.reload);
    watch(htmlPagesPath, nunjucks).on('change', browserSync.reload);
    watch(htmlTemplatesPath, nunjucks).on('change', browserSync.reload);
}

// exports.copyHtml = copyHtml;
exports.nunjucks = nunjucks;
exports.nunjucksMinify = nunjucksMinify;
exports.imageTask = imageTask;
exports.jsTask = jsTask;
exports.cssTask = cssTask;

exports.default = series(parallel(nunjucks, nunjucksMinify, imageTask, jsTask, cssTask), watchTask);