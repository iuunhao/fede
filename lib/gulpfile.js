// base
const gulp = require("gulp");
const path = require("path");
const fs = require("fs");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const gulpSequence = require('gulp-sequence');

// postcss
const gulpPostcss = require("gulp-postcss");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const precss = require("precss");
const sprites = require("postcss-sprites");
const updateRule = require("postcss-sprites").updateRule;
const spritesmith = require("gulp.spritesmith");
const postcssSorting = require("postcss-sorting");
const url = require("postcss-url")
const atImport = require("postcss-import")
const clean = require("postcss-clean");

// server
const browserSync = require("browser-sync");
const reload = browserSync.reload;

const cleanf = require('gulp-clean');
const gulpCopy = require('gulp-copy');

// public method
const utils = {
    resolve(dir, isParent = false) {
        return path.join(isParent ? '..' : '.', dir)
    }
}

// user basic settings
const USER_CONFIG = {
    DESIGN_SIZE: 750
}

// base paths
const fofrc = require(path.join(process.cwd(), 'fofrc.json'))
const PATHS = {
    ROOT: utils.resolve(fofrc.path_name.root, true),
    WORK: utils.resolve(fofrc.path_name.root),
    POSTCSS: utils.resolve(fofrc.path_name.postcss),
    HTML: utils.resolve(fofrc.path_name.html),
    IMAGES: utils.resolve(fofrc.path_name.images),
    FONTS: utils.resolve(fofrc.path_name.fonts),
    DIST_HTML: utils.resolve(fofrc.path_name.html, true),
    CSS: utils.resolve(fofrc.path_name.css),
    DIST_CSS: utils.resolve(fofrc.path_name.css, true),
    DIST_IMAGES: utils.resolve(fofrc.path_name.images, true),
    DIST_FONTS: utils.resolve(fofrc.path_name.fonts, true)
}

// postcss DIY plugins
const postcssFunc = {

    // pm to px, rm to rem
    calculatesn(css) {
        css.walkDecls((decl, i) => {
            decl.value = decl.value.replace(/(\d*\.?\d+)pm/ig, (str) => `${parseInt(str) / 2}px`);
            decl.value = decl.value.replace(/(\d*\.?\d+)rm/ig, (str) => `${parseInt(str) / (USER_CONFIG.DESIGN_SIZE / 10)}rem`);
        });
    },

    // css background url change
    changeUrl(css) {
        css.walkDecls((decl, i) => {
            decl.value = decl.value.replace(/(url\()(.*)(\))/ig, ($1, $2, $3) => {
                console.log($3)
                if (RegExp(/sprites\/sprite/, 'ig').test($3)) {
                    return 'url(../' + $3 + ')'
                } else {
                    return 'url(' + $3 + ')'
                }
            });
        });
    },

    // css media shorthand
    postcssMedia(css) {
        css.walkDecls((decl, i) => {
            if (decl.parent.params != "undefined") {
                const mv = decl.parent.params;
                const mtv = {
                    iphone4: "screen and (device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 2)",
                    iphone45: "screen and (device-width: 320px) and (-webkit-device-pixel-ratio: 2)",
                    iphone5: "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
                    iphone6: "only screen and (min-device-width: 375px) and (max-device-width: 667px) and (orientation: portrait)",
                    iphone6p: "only screen and (min-device-width: 414px) and (max-device-width: 736px) and (orientation: portrait)",
                    landscape: "screen and (orientation: landscape)",
                    shuping: "all and (orientation : portrait)"
                };
                return decl.parent.params = mtv[mv] ? mtv[mv] : false;
            }
        });
    }
};

// postcss plugins
let spriteRegExp = /(?!\/)icon-(\w+)(?=\/\w{1})/ig;
let postcssPlugins = [
    atImport,
    url({
        url: "rebase"
    }),
    precss,
    sprites({
        stylesheetPath: PATHS.CSS,
        spritePath: path.join(PATHS.IMAGES, 'sprites'),
        spritesmith: {
            padding: 5
        },
        hooks: {
            onUpdateRule: function(rule, token, image) {
                var backgroundSizeX =
                    image.spriteWidth / image.coords.width * 100;
                var backgroundSizeY =
                    image.spriteHeight / image.coords.height * 100;
                var backgroundPositionX =
                    image.coords.x /
                    (image.spriteWidth - image.coords.width) *
                    100;
                var backgroundPositionY =
                    image.coords.y /
                    (image.spriteHeight - image.coords.height) *
                    100;

                backgroundSizeX = isNaN(backgroundSizeX) ?
                    0 :
                    backgroundSizeX;
                backgroundSizeY = isNaN(backgroundSizeY) ?
                    0 :
                    backgroundSizeY;
                backgroundPositionX = isNaN(backgroundPositionX) ?
                    0 :
                    backgroundPositionX;
                backgroundPositionY = isNaN(backgroundPositionY) ?
                    0 :
                    backgroundPositionY;

                var backgroundImage = postcss.decl({
                    prop: "background-image",
                    value: "url(" + image.spriteUrl + ")"
                });

                var backgroundSize = postcss.decl({
                    prop: "background-size",
                    value: backgroundSizeX + "% " + backgroundSizeY + "%"
                });
                var backgroundPosition = postcss.decl({
                    prop: "background-position",
                    value: backgroundPositionX +
                        "% " +
                        backgroundPositionY +
                        "%"
                });
                rule.insertAfter(token, backgroundImage);
                rule.insertAfter(backgroundImage, backgroundPosition);
                rule.insertAfter(backgroundPosition, backgroundSize);
            }
        },
        groupBy: function(image) {
            if (!spriteRegExp.test(image.url)) return Promise.reject();
            let _filename = path.dirname(image.url).split('/images/')[1];
            return Promise.resolve(_filename.replace(/(\/)|(icon-)/g, '_'));
        },
        filterBy: function(image) {
            if (!spriteRegExp.test(image.url)) return Promise.reject();
            return Promise.resolve();
        }
    }),
    autoprefixer({
        browsers: ["last 50 versions"]
    }),
    cssnano({
        zindex: false,
        autoprefixer: false,
        core: true,
        reduceIdents: false,
        svgo: false
    }),
    postcssSorting({
        "sort-order": "yandex"
    }),
    postcssFunc.calculatesn,
    postcssFunc.postcssMedia,
    postcssFunc.changeUrl,
    clean
];

// postcss build
gulp.task("postcss_build", () => {
    return gulp
        .src([path.join(PATHS.POSTCSS, '**/*.css'), `!${path.join(PATHS.POSTCSS, '**/_*.css')}`])
        .pipe(
            plumber({
                errorHandler: notify.onError("错误信息: <%= error.message %>")
            })
        )
        .pipe(gulpPostcss(postcssPlugins))
        .pipe(gulp.dest(PATHS.CSS))
        .pipe(reload({ stream: true }));
});

// local server
gulp.task("server_dev", function() {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: [PATHS.WORK],
            directory: true
        },
        // open: "external"
    });
    gulp.start("watch");
});

// watch file change
gulp.task('watch', function() {
    gulp.watch([
        path.join(PATHS.HTML, "/**/*.html")
    ]);
    gulp.watch([
        path.join(PATHS.POSTCSS, "/**/*.css")
    ], ['postcss_build']);
});

// clean file
gulp.task("clean_file", function() {
    return gulp
        .src([PATHS.CSS, PATHS.DIST_CSS, PATHS.DIST_HTML])
        .pipe(cleanf({ force: true }))
});

// copy css
gulp.task("copy_css", function() {
    return gulp
        .src([path.join(path.join(PATHS.CSS), '**/*.css')])
        .pipe(gulp.dest(PATHS.DIST_CSS))
});

// copy html
gulp.task("copy_html", function() {
    return gulp
        .src([path.join(PATHS.HTML, '**/*.html'), '!' + path.join(PATHS.HTML, '**/_*.html')])
        .pipe(gulp.dest(PATHS.DIST_HTML))
});

// copy images
gulp.task("copy_image", function() {
    return gulp
        .src([path.join(PATHS.IMAGES, '**/*'), '!' + path.join(PATHS.IMAGES, '**/icon-*/*')])
        .pipe(gulp.dest(PATHS.DIST_IMAGES))
});

// async build
gulp.task('build', gulpSequence(
    'clean_file', 'postcss_build', 'copy_css', 'copy_html', 'copy_image'
));

// default task
gulp.task("default", ["server_dev"]);
