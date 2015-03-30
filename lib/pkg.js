/**
 * @file ../lib/pkg.js ~ 2014/07/29 17:46:39
 * @author leeight(liyubei@baidu.com)
 **/
var os = require('os');
var fs = require('fs');
var path = require('path');

var async = require('async');
var mkdirp = require('mkdirp');
var edp = require('edp-core');

/**
 * 获取package的dependencies信息
 *
 * @inner
 * @param {Object} packageInfo package信息对象
 * @return {Object}
 */
exports.getDependencies = function(packageInfo) {
    var edpInfo = packageInfo.edp;

    return (edpInfo && edpInfo.dependencies) || packageInfo.dependencies || {};
};


/**
 * 获取临时名称
 * 可用于文件名
 *
 * @return {string}
 */
exports.getTempName = function() {
    return 'tmp' + ((new Date()).getTime() + Math.random());
};

/**
 * 获取import和update的时候，临时存在package的目录
 * @param {string=} opt_dir 临时目录.
 * @return {string}
 */
exports.getTempImportDir = function(opt_dir) {
    var name = exports.getTempName();
    var dir = opt_dir || path.join(os.tmpdir(), name);

    mkdirp.sync(path.join(dir, '.edpproj'));
    mkdirp.sync(path.join(dir, 'dep'));

    return dir;
};

/**
 * 获取已定义的依赖包
 *
 * @param {string=} opt_importDir 导入目录
 * @return {?Object}
 */
exports.getDefinedDependencies = function(opt_importDir) {
    var importDir = opt_importDir || process.cwd();

    var data = null;
    var project = require('edp-project');
    var projectInfo = project.getInfo(importDir);
    if (projectInfo) {
        // edp-project/lib/metadata里面处理可package.json和.edpproj/metadata的兼容性问题
        data = project.metadata.get(projectInfo);
    }

    if (data) {
        return data.dependencies || null;
    }

    return null;
};

/**
 * @param {string} from 源目录.
 * @param {string} to 目标目录.
 */
exports.copyDirectory = function(from, to) {
    edp.util.scanDir(from, function(fullPath) {
        var z = path.relative(from, fullPath);
        var target = path.join(to, z);
        if (fs.existsSync(target)) {
            return;
        }
        mkdirp.sync(path.dirname(target));
        fs.writeFileSync(target, fs.readFileSync(fullPath));
    });
};


/**
 * 安装package的其它依赖模块
 */
exports.importDependencies = function(context) {
    return function(packageInfo, callback) {
        var key = packageInfo.name + '@' + packageInfo.version;
        if (context.hasResolved(key)) {
            callback(null, packageInfo);
            return;
        }

        var dependencies = exports.getDependencies(packageInfo);
        var dependNames = Object.keys(dependencies);

        function importPackage(dependName, callback) {
            var dependVer = dependencies[dependName];

            if (/^https?:\/\/(.+)/.test(dependVer)) {
                require('./import-from-remote')(context, dependVer, callback);
            }
            else {
                require('./import-from-registry')(
                    context, dependName + '@' + dependVer, callback);
            }
        }

        async.eachSeries(dependNames, importPackage, function(error) {
            if (error) {
                callback(error);
                return;
            }
            // 是否可以解决循环依赖的问题呢？实际上是没有测试用例来覆盖的
            context.markAsResolved(key);
            callback(null, packageInfo);
        });
    };
};


/* vim: set ts=4 sw=4 sts=4 tw=120: */
