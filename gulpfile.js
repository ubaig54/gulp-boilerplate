const gulp = require('gulp');
const { src, dest, series, parallel, watch } = require('gulp');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const nunjucksRender = require('gulp-nunjucks-render');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const browserSync = require("browser-sync").create();
const babel = require('gulp-babel');
const del = require('del');

const jsPath = './src/assets/js/**/*.js';
const cssPath = './src/assets/css/**/*.css';
const htmlPagesPath = './src/pages/*.html';
const htmlTemplatesPath = './src/templates/*.html';

// ### dist files - start ###
// nunjucks (copy HTML files)
function nunjucks() {
    return src('./src/pages/*.html')
        .pipe(nunjucksRender({
            path: ['src/templates/']
        }))
        .pipe(dest('./dist'));
}

// copy CSS files
function copyCss() {
    return src(cssPath).pipe(dest('./dist/assets/css'));
}

// copy JS files
function copyJS() {
    return src(jsPath).pipe(dest('./dist/assets/js'));
}
// ### dist files - end ###

// ### build files - start ###
// minify HTML files
function nunjucksMinify() {
    return src('./src/pages/*.html')
        .pipe(nunjucksRender({
            path: ['src/templates/']
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest('./build'));
}

// Compile and minify Sass
function minifyCss() {
    return src(cssPath)
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./build/assets/css'))
        .pipe(browserSync.stream());
}

// minify JS
function minifyJs() {
    return src(jsPath)
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['@babel/preset-env'] }))
        // .pipe(concat('app.js'))
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./build/assets/js'));
}

// Optimize images
function optimizeImages() {
    return src('./src/images/*').pipe(imagemin()).pipe(dest('./build/images'));
}
// ### build files - end ###

// delete existing build
const clean = () => del(['./build']);

// watch all the tasks
function watchTask() {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        notify: false
    });
    watch(cssPath, copyCss);
    watch(jsPath, copyJS).on('change', browserSync.reload);
    watch(htmlPagesPath, nunjucks).on('change', browserSync.reload);
    watch(htmlTemplatesPath, nunjucks).on('change', browserSync.reload);
}

// exports.copyHtml = copyHtml;
exports.nunjucks = nunjucks;
exports.nunjucksMinify = nunjucksMinify;
exports.optimizeImages = optimizeImages;
exports.copyJS = copyJS;
exports.copyCss = copyCss;
exports.minifyJs = minifyJs;
exports.minifyCss = minifyCss;

exports.watch = series(parallel(nunjucks, copyJS, copyCss), watchTask);

exports.default = series(clean, parallel(nunjucksMinify, optimizeImages, minifyJs, minifyCss));