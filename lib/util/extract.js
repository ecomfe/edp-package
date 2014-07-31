/**
 * @file 压缩包提取功能
 * @author errorrik[errorrik@gmail.com]
 */
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

var tar = require('tar');
var mkdirp = require('mkdirp');
var AdmZip = require('adm-zip');

var pkg = require('../pkg');

/**
 * 将压缩文件的提取目录从临时目录移动到目标目录
 *
 * @inner
 * @param {string} tempDir 提取目录
 * @param {string} target 目标目录
 */
function moveExtractToTarget(tempDir, target) {
    if (!fs.existsSync(tempDir)) {
        return;
    }

    var source = fs.readdirSync(tempDir)[0];
    if (source) {
        fs.renameSync(
            path.resolve(tempDir, source),
            target
        );
    }

    fs.rmdirSync(tempDir);
}

/**
 * 提取tgz文件
 *
 * @param {string} tarball tgz文件名
 * @param {string} target 解压路径
 * @param {Function} callback 回调函数
 */
exports.tgz = function(tarball, target, callback) {
    var parentDir = path.resolve(target, '..');

    mkdirp.sync(parentDir);
    var tmpDir = path.resolve(parentDir, pkg.getTempName());

    require('fstream')
        .Reader({
            type: 'File',
            path: tarball
        })
        .pipe(zlib.createGunzip())
        .pipe(tar.Extract({ path: tmpDir }))
        .on(
            'end',
            function() {
                moveExtractToTarget(tmpDir, target);
                callback && callback();
            }
        );
};

/**
 * 提取zip文件
 *
 * @param {string} zipFile zip文件名
 * @param {string} target 解压路径
 * @param {Function} callback 回调函数
 */
exports.zip = function(zipFile, target, callback) {
    var parentDir = path.resolve(target, '..');
    var tmpDir = path.resolve(parentDir, pkg.getTempName());
    mkdirp.sync(parentDir);

    var admZip = new AdmZip(zipFile);

    admZip.extractAllTo(tmpDir);
    moveExtractToTarget(tmpDir, target);
    callback && callback();
};
