'use strict';

require('colors');
const del = require('del');
const gulp = require('gulp');
// const code = require('gulp-seed');
const xtpl = require('gulp-xtpl');
const gulpif = require('gulp-if');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');

const prefix = require('gulp-autoprefixer');
const replace = require('gulp-replace');
const path = require('path');

// const i18n = require('@ali/gulp-mui-i18n');
// const webpack = require('webpack-stream');
// const named = require('vinyl-named');
// const api = require('fie-api');
const utils = require('./utils');

const Promise = require('bluebird');
const globby = require('globby');
const fs = Promise.promisifyAll(require('fs-extra'));


// const config = api.config;
// const fieFs = api.fs;
const cwd = process.cwd();
// const projectInfo = utils.getProjectAndGroupName(cwd);
const pkgFilePath = path.join(cwd, 'package.json');
const pkg = require(pkgFilePath);

// const toolkitConfig = config.get('toolkitConfig', cwd) || {};
// const swString = '';
// if (toolkitConfig.enableServiceWorker) {
//   swString = fs.readFileSync(path.join(__dirname, '../template/service_worker/register.xtpl'), 'utf8');
// } else {
//   swString = fs.readFileSync(path.join(__dirname, '../template/service_worker/unRegister.xtpl'), 'utf8');
// }


function err(error) {
  const isBuild = getEnvBuild();
  if (isBuild) {
    // 如果是build的情况下，需要退出异常
    throw error;
  } else {
    console.log(error);
  }
}

function getEnvBuild() {
  // gulp-if 需要返回bool
  return process.env.FE_BUILD === 'true';
}


function ifxtpl(file) {
  const extname = path.extname(file.path);
  return extname === '.xtpl';
}

function ifnotxtpl(file) {
  const extname = path.extname(file.path);
  return extname !== '.xtpl';
}

function genModName(file) {
  // return pkg.name + (file.path || '')
  //   .replace(path.resolve('src/'), '');
  let path = file.path;
  path = path.replace(/\\/g, '/');
  // if (path.match(/\/pc\//)) {
  //   path = path.split(/\/pc\//)[0] + '/pc/';
  // }
  // if (path.match(/\/m\//)) {
  //   path = path.split(/\/m\//)[0] + '/m/';
  // }
  if (path.match(/\/src\//)) {
    path = path.split(/\/src\//)[1];
  }
  return `${path}`;
}



/**
 * 构建js和seed
 * @return {*} null
 */
function buildJsAndSeed() {
  // const isBuild = getEnvBuild();

  return gulp
    .src([
      'app/public/src/*.js',
      'app/public/src/**/*.js',
      'app/public/src/**/**/*.js',
      'app/public/src/**/*.xtpl',
      'app/public/src/**/**/*.xtpl',
      '!app/public/src/lib/**',
    ], {
      allowEmpty: true,
    })
    .pipe(plumber(err))
    .pipe(gulpif(ifnotxtpl, babel({
      presets: [ require.resolve('babel-preset-es2015'), require.resolve('babel-preset-rax') ],
    })))
    .pipe(gulpif(ifxtpl, xtpl({
      prefix(options, file) {
        const name = genModName(file);
        return `define("${name}",['xtemplate'], function(TPL){var RT=TPL;var _ = ""; return (`;
      },
      suffix: ')(_, RT);});',
    })))
    .pipe(replace(/(\'\.\/.+?\')|(\"\.\/.+?\")|(\'\.\.\/.+?\')|(\"\.\.\/.+?\")|(\'\.\.\/\.\.\/.+?\')|(\"\.\.\/\.\.\/.+?\")/g, function(matchStr) {
      let path = this.file.path;
      path = path.replace(/\\/g, '/'); // for windows
      
      if (path.match(/\/src\//)) {
        path = path.split(/\/src\//)[1];
      }
      let rePath = path.split('/');
      if(rePath.length > 1) {
        rePath.pop(); // 最后的文件名去掉
      }

      // 相对上二目录(目前只支持二层吧。。。。)
      if(matchStr.match(/(\'\.\.\/\.\.\/.+?\')|(\"\.\.\/\.\.\/.+?\")/)) {
        rePath.pop();
        rePath.pop();
        matchStr = matchStr.replace(/(\'\.\.\/\.\.\/)|(\"\.\.\/\.\.\/)/g, '').replace(/(\")|(\')/g, '');
      } else if(matchStr.match(/(\'\.\.\/.+?\')|(\"\.\.\/.+?\")/)) {  
        // 相对上一目录
        rePath.pop();
        matchStr = matchStr.replace(/(\'\.\.\/)|(\"\.\.\/)/g, '').replace(/(\")|(\')/g, '');
      } else {
        // 相对本目录
        matchStr = matchStr.replace(/(\'\.\/)|(\"\.\/)/g, '').replace(/(\")|(\')/g, '');
      } 
     
      rePath.push(matchStr);
      return `'${rePath.join('/')}'`;
    }))
    // .pipe(gulpif(isBuild, code.minify()))
    .pipe(gulp.dest('app/public/build'));
}


/**
 * 清除build目录
 * @param {Function} cb callback
 */
function cleanBuild(cb) {
  del.sync([ '/app/public/build' ], {
    cwd,
  });
  cb();
}


/**
 * less scss css文件编译 ,weex文件夹下单独处理
 * @returns {*}
 * autoprefix只针对pc和mobile
 */
const vendorVersion = [ 'android >= 4.0', 'ie >= 9', 'iOS >= 8' ];

function buildCss() {
  // const isBuild = getEnvBuild();


  return gulp
    .src([ 'app/public/src/**/*.css',
      'app/public/src/**/*.less',
      'app/public/src/**/*.scss',
      'app/public/src/**/**/*.css',
      'app/public/src/**/**/*.less',
      'app/public/src/**/**/*.scss'
    ], {
      allowEmpty: true,
    })
    .pipe(plumber(err))
    // .pipe(gulpif(utils.ifless, less()))
    .pipe(gulpif(utils.ifscss, sass()))
    .pipe(prefix(vendorVersion))
    // .pipe(gulpif(isBuild, code.lint()))
    // .pipe(gulpif(isBuild, code.minify()))
    .pipe(gulp.dest('app/public/build'));
}

/**
 * copy非编译的文件到build/lib目录
 * @return {*} null
 */
function copy2lib() {
  return gulp.src([
    'app/public/src/lib/**'
  ], {
    allowEmpty: true,
  }).pipe(gulp.dest('app/public/build/lib'));

}

/**
 * copy非编译的文件到build目录
 * @return {*} null
 */
function copy2Build() {

  // build config first;
  buildRequireConfig();
  return gulp.src([
    'app/public/src/**/*.xtpl',
    'app/public/src/**/**/*.xtpl',
    'app/public/src/**/*.png',
    'app/public/src/**/**/*.png',
    'app/public/src/**/*.jpg',
    'app/public/src/**/**/*.jpg'
  ], {
    allowEmpty: true,
  }).pipe(gulp.dest('app/public/build'));

}

const watchFiles = [
  'app/public/src/*.js',
  'app/public/src/**/*.js',
  'app/public/src/**/**/*.js',
  'app/public/src/**/*.xtpl',
  'app/public/src/**/**/*.xtpl',
  '!app/public/src/dsl',
];

/**
 * buildRequireConfig
 */
function buildRequireConfig() {
  globby(watchFiles).then(paths => {
    fs.mkdirsSync('app/public/build/');

    const config = {
      baseUrl: '/assets',
      map: {
        '*': {
          css: 'lib/css.min',
        },
      },
      paths: {
        zepto: 'lib/zepto-1.2.0',
        decimaljs: 'lib/decimal.min',
        moment: 'lib/moment-with-locales.min',
        xtemplate: 'lib/xtemplate'
      },
    };
    paths.forEach(item => {
      const fPath = item.replace('app\/public\/src\/', '').replace('.js', '');
      if (fPath.indexOf('lib') !== 0) {
        config.paths[fPath] = fPath; // path.basename(item);
      }
    });

    const configContent = [
      'requirejs.config(\n',
      JSON.stringify(config, null, 2),
      '\n);',
    ];
    // console.log(configContent.join(''));
    try {
      const configFile = path.join(cwd, 'app/public/build/require.config.js');
      fs.writeFileSync(configFile, configContent.join(''));
    } catch (ex) {
      console.log(ex);
    }

  });
}

/**
 * 模块的watch
 */
gulp.task('watch', () => {
  // js pc
  gulp.watch(watchFiles, gulp.series(buildJsAndSeed));

  // reset requrie.config 's paths
  const watcher = gulp.watch(watchFiles);
  watcher.on('change', function(event) {
    // console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    // 将require模块配置到build/require.config.js
    buildRequireConfig(event);
  });


  // css处理
  const watchCss = [
    'app/public/src/**/*.css',
    'app/public/src/**/*.less',
    'app/public/src/**/*.scss',
    'app/public/src/**/**/*.css',
    'app/public/src/**/**/*.less',
    'app/public/src/**/**/*.scss',
    '!app/public/src/dsl',
  ];

  gulp.watch(watchCss, gulp.series(buildCss));

  // gulp.series(buildCss));
  // gulp.watch(['src/theme.scss', 'src/theme-pc.scss'], gulp.series(sass2less));


  gulp.watch([
    'app/public/src/**/*.xtpl',
    'app/public/src/**/**/*.xtpl',
    '!app/public/src/dsl',
    'app/public/src/**/*.png',
    'app/public/src/**/**/*.png',
    'app/public/src/**/*.jpg',
    'app/public/src/**/**/*.jpg',
  ], gulp.series(copy2Build));
});

gulp.task(
  'default',
  gulp.series(
    cleanBuild,
    copy2Build,
    copy2lib,
    gulp.parallel(
      buildCss,
      gulp.series(buildJsAndSeed)
    )
  )
);
// gulp.task('build', ['default']);
gulp.task('test', gulp.series(copy2Build));
