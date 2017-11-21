const path = require('path')
const fs = require('fs')
const log = require('./util.js').log;
const color = require('./util.js').color;
const makeDir = require('make-dir');
const copy = require('copy');


const PATHS = {
    cwd: process.cwd(),
    fofconf: path.join(process.cwd(), 'fofrc.json')
}
module.exports = function(cname) {
    let conf = {
        "name": cname,
        "path_name": {
            "root": ".",
            "postcss": "postcss",
            "html": "html",
            "images": "images",
            "css": "css",
            "fonts": "fonts"
        }
    };
    let rootPath = path.join(PATHS.cwd, cname);

    fs.exists(path.join(process.cwd(), cname, 'fofrc.json'),  async function(exi) {
        if (exi) {
            log('已存在项目，不可以在此目录重复初始化！', 'ERROR', 'bgRed')
            return;
        } else {
            await makeDir(rootPath);
            await fs.writeFile(path.join(rootPath, 'fofrc.json'), JSON.stringify(conf), { flag: 'w', encoding: 'utf-8', mode: '0666' }, function(err) {
                if (err) return;
            });
            await copy(path.join(__dirname, '../tpl/**/*'), rootPath, function(err, files) {
                if (err) throw err;
            });
            console.log(`  fof-cli · 生成 "${color.bold.red(cname)}".\n`)
            console.log('  To get started:\n')
            console.log(`    cd ${cname}`)
            console.log('    fof dev\n')
        }
    })
}
