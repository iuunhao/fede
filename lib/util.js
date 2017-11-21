const colors = require('colors');
const path = require('path');
const fs = require('fs');

function log(msg, info, color, num) {
    num = num || 1;
    let arr = [
        colors.bold.bgYellow.black(' FOF '),
        colors.bold.black[color](` ${info} `),
        ` ${msg}${('\n').repeat(+num)}`,
    ]
    console.log(('\n').repeat(+num), arr.join(''))
}

module.exports = {
    color: colors,
    log,
    exec(cmd) {
        let cmdHandle = require('child_process').exec(cmd);
        cmdHandle.stdout.on('data', function(data) {
            console.log(data);
        });
        cmdHandle.stderr.on('data', function(data) {
            log(data, 'ERROR', 'bgRed')
        })
    }
}
