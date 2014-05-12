/**
 * @file fs 同步拷贝删除目录等操作。
 * @author tkihira
 */
var fs = require('fs');
var path = require('path');
var rimraf = require( './rimraf' );

var mkdir = function(dir) {
    // making directory without exception if exists
    try {
        fs.mkdirSync(dir, 0755);
    } catch(e) {
        if( e.code != 'EEXIST' ) {
            throw e;
        }
    }
};

var copyDir = function(src, dest) {
    mkdir(dest);
    var files = fs.readdirSync(src);
    for(var i = 0; i < files.length; i++) {
        var current = fs.lstatSync(path.join(src, files[i]));
        if(current.isDirectory()) {
            copyDir(path.join(src, files[i]), path.join(dest, files[i]));
        } else if(current.isSymbolicLink()) {
            var symlink = fs.readlinkSync(path.join(src, files[i]));
            fs.symlinkSync(symlink, path.join(dest, files[i]));
        } else {
            copy(path.join(src, files[i]), path.join(dest, files[i]));
        }
    }
};

var BUF_LENGTH = 64 * 1024;
var _buff = new Buffer(BUF_LENGTH);

var copy = function(srcFile, destFile) {
    var bytesRead, fdr, fdw, pos;
    fdr = fs.openSync(srcFile, 'r');
    fdw = fs.openSync(destFile, 'w');
    bytesRead = 1;
    pos = 0;
    while (bytesRead > 0) {
        bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
        fs.writeSync(fdw, _buff, 0, bytesRead);
        pos += bytesRead;
    }
    fs.closeSync(fdr);
    return fs.closeSync(fdw);
};

module.exports = {
    copy: copy,
    copyDir: copyDir,
    rmdir: rimraf.sync
};