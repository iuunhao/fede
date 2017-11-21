#!/usr/bin/env node

const gulp = require('gulp');
const child = require('child_process');
const path = require('path')
const fs = require('fs')
const program = require('commander');

const color = require('../lib/util.js').color;
const log = require('../lib/util.js').log;
const exec = require('../lib/util.js').exec;

const PATHS = {
    cwd: process.cwd(),
    fofconf: path.join(process.cwd(), 'fofrc.json')
}

program
    .version(require('../package.json').version)
    .usage('[options] [value ...]')
    .option('dev, --development', '开发编译')
    .option('init, --init <string>', '初始化项目 <项目名称>')
    .option('build, --build', '打包编译')

program.on('--help', () => {
    console.log('\n  Examples:\n')
    console.log('\n    # 初始化项目')
    console.log('    $ fede init static\n')
    console.log('    # 实时编译')
    console.log('    $ fede dev\n')
    console.log('    # 打包编译')
    console.log('    $ fede build\n')
    console.log('    # 说明\n')
    console.log('        1. postcss目录层级类如：')
    console.log('           postcss/product/product_list.css')
    console.log('           images/product/bg.png')
    console.log('           images/product/icon-btns/btn1.png\n')
    console.log('        2. 图片目录层级需与postcss层级保持一致')
    console.log('           postcss/product/*')
    console.log('           images/product/*\n')
    console.log('        3. 合成图需要放在以icon-开头的文件夹内\n')
    console.log('        4. 合成图不需要写背景定位，但需写宽高\n')
    console.log('        5. 禁止手动修改css目录下文件\n')
    console.log('        6. html|css以下划线(_)开头文件不会被单独输出，但可引用(html除外)\n')
    console.log('        7. 页面内应用的css及生产环境的css以css目录为主，postcss只是源文件\n\n\n')
})
program.parse(process.argv)

// 开发编译
if (program.development) {
    fs.exists(PATHS.fofconf, function(exists) {
        if (!exists) {
            log('请在指定目录运行此命令！', 'ERROR', 'bgRed')
        } else {
            log('开发模式', 'INFO', 'bgCyan')
            exec(`gulp default --gulpfile ${path.join(__dirname, '../lib')}/gulpfile.js --cwd  ${process.cwd()} --color`);
        }
    })
}

// 初始化项目
if (program.init) {
    log('初始化项目中...', 'INIT', 'bgGreen')
    require('../lib/init.js')(program.init);
}

// // build
if (program.build) {
    fs.exists(PATHS.fofconf, function(exists) {
        if (!exists) {
            log('请在指定目录运行此命令！', 'ERROR', 'bgRed')
        } else {
            log('打包编译', 'INFO', 'bgCyan')
            exec(`gulp build --gulpfile ${path.join(__dirname, '../lib')}/gulpfile.js --cwd ${process.cwd()} --color `);
        }
    })
}
