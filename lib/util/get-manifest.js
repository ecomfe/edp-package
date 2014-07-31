/**
 * @file 获取已导入包清单功能
 * @author errorrik[errorrik@gmail.com]
 */
var fs = require('fs');
var path = require('path');

/**
 * 简单的过滤一下是否是package
 * @param {string} item 文件路径
 * @return {boolean}
 */
function filter(item) {
    var stat = fs.statSync(item);
    if (!stat.isDirectory()) {
        return false;
    }

    var isPackage = false;
    // 检查item下面的任何一个目录是否存在package.json
    fs.readdirSync(item).filter(function(x) {
        return fs.statSync(path.join(item, x)).isDirectory();
    }).some(function(x) {
        if (fs.existsSync(path.join(item, x, 'package.json'))) {
            isPackage = true;

            // break loop
            return true;
        }
    });

    return isPackage;
}

/**
 * 获取可以出现在module.conf或者require.config里面的package的配置信息
 * @param {string} dir 一个package的目录地址.
 * @return {Object|null}
 */
function getPackageDeclare(dir) {
    var pkgData = require('./get-package-info')(dir);
    if (!pkgData) {
        return null;
    }

    var pkgName = pkgData.name;
    var pkgVersion = pkgData.version;

    // edp import jquery 时，module.conf生成的配置如下
    // {
    //      "name": "jquery",
    //      "location": "dep/jquery/1.9.1/src",
    //      "main": "jquery.min.js"
    // }
    // 这时如果用edp.esl.getModuleFile('jquery', moduleConfPath)
    // 得到的是 ${path}/dep/jquery/1.9.1/src/jquery.min.js.js
    // 因为jquery的package.json配置是
    // {
    //     "name": "jquery",
    //     "version": "1.9.1",
    //     "main": "./src/jquery.min.js"
    // }
    // 因此这里把main后缀的.js给去掉
    var main = (pkgData.main || 'main').replace(/\.js$/, '');
    var pkg = {
        name: pkgName,
        version: pkgVersion
    };
    if (main) {
        pkg.main = main;
    }

    return pkg;
}

/**
 * 获取当前已经导入的包列表
 *
 * @inner
 * @param {string} depDir 当前目录
 * @return {Object}
 */
module.exports = function(depDir) {
    var manifest = {};
    if (!fs.existsSync(depDir)) {
        return manifest;
    }

    fs.readdirSync(depDir).filter(function(x) {
        return filter(path.join(depDir, x));
    }).forEach(check);

    function check(item) {
        var p = {};
        var dir = path.join(depDir, item);

        fs.readdirSync(dir).filter(function(x) {
            return fs.statSync(path.join(dir, x)).isDirectory();
        }).forEach(function(x) {
            var target = path.join(dir, x);
            var pkg = getPackageDeclare(target);
            if (pkg) {
                p[pkg.version] = pkg;
            }
        });

        if (Object.keys(p).length) {
            manifest[item] = p;
        }
    }

    return manifest;
};
