const { src, dest, parallel, series, watch } = require('gulp');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const gcssmq = require('gulp-group-css-media-queries');
const includeFiles = require('gulp-include');
const browserSync = require('browser-sync').create();

function browsersync() {
  browserSync.init({
    server: {
      baseDir: './public/',
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
    port: 3000,
    open: true,
  })
}

function styles() {
  return src('./src/styles/style.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({ grid: true }))
  .pipe(gcssmq())
  .pipe(dest('./public/css/'))
  .pipe(browserSync.stream())
}

function pages() {
  return src('./src/*.html')
  .pipe(
    includeFiles({
      includePaths: './src/components/**/',
    })
  )
  .pipe(dest('./public/'))
  .pipe(browserSync.reload({ stream: true, }))
}

function copyFonts() {
  return src('./src/fonts/**/*')
  .pipe(dest('./public/fonts/'))
}

function copyImages() {
  return src('./src/img/**/*')
  .pipe(dest('./public/img/'))
}

function copyIcon() {
  return src('./src/*.svg')
  .pipe(dest('./public/'))
}

async function copyResources() {
  copyFonts()
  copyImages()
  copyIcon()
}

async function clean() {
  return del.sync('./public/', { force: true })
}

function watch_dev() {
  watch(['./src/styles/style.scss', './src/components/**/*.scss'], styles).on(
    'change',
    browserSync.reload
  )
  watch(['./src/pages/*.html', './src/components/**/*.html'], pages).on(
    'change',
    browserSync.reload
  )
}

exports.browsersync = browsersync
exports.clean = clean
exports.styles = styles
exports.pages = pages
exports.copyResources = copyResources

exports.default = parallel(
  clean,
  styles,
  copyResources,
  pages,
  browsersync,
  watch_dev
)

exports.build = series(
  clean,
  styles,
  copyResources,
  pages
)
