/**
 * @file 从package.json中导入包
 * @author treelite(c.xinle@gmail.com)
 */

/**
 * 空函数
 *
 * @inner
 */
function blank () {}

/**
 * 从package.json中导入包
 * 
 * @param {string} file package.json文件
 * @param {Object=} options 配置
 * @param {boolean=} options.older 导入最低版本的包
 * @param {boolean=} options.saveDev 导入dev依赖包
 * @param {string=} options.importDir 导入目录
 * @param {Function=} options.callback 回调函数
 */
module.exports = function (file, options) {
    var fs = require('fs');
    var semver = require('semver');
    var getRegistry = require('./util/get-registry');
    var importFromRegistry = require('./import-from-registry');

    var data = fs.readFileSync(file, 'utf-8');

    data = JSON.parse(data);
    var packages = require( './util/get-dependencies-info' )( data );

    if (options.saveDev) {
        var devDependencies = data.devDependencies || {};
        Object.keys(devDependencies).forEach(function (name) {
            packages[name] = devDependencies[name];
        });
    }

    var callback = options.callback || blank;
    var names = Object.keys(packages);
    var importedPackages = [];

    function importPackage(name, version, index) {
        name += '@' + version;
        importFromRegistry(
            name, 
            options.importDir,
            function (err, pkg) {
                if (err) {
                    console.log(err);
                    callback(err);
                    return;
                }

                importedPackages.push(pkg);
                next(++index);
            }
        );
    }

    function next(index) {
        var name = names[index];
        if (!name) {
            callback(null, importedPackages);
            return;
        }

        var version = packages[name];
        if (options.older) {
            version = version.replace(/^[^0-9]+/, '');
            importPackage(name, version, index);
        }
        else {
            var registry = getRegistry();
            registry.get(
                name,
                function (err, data) {
                    if (err) {
                        console.log(err);
                        callback(err);
                        return;
                    }

                    var versions = Object.keys(data.versions);
                    version = semver.maxSatisfying(versions, version);
                    importPackage(name, version, index);
                }
            );
        }
    }

    next(0);
};
