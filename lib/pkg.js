/**
 * @file ../lib/pkg.js ~ 2014/07/29 17:46:39
 * @author leeight(liyubei@baidu.com)
 **/
var os = require('os');
var path = require('path');
var mkdirp = require('mkdirp');

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
    mkdirp.sync(path.join(dir, 'dep' ));

    return dir;
};

/**
 * 获取已定义的依赖包
 *
 * @param {string=} importDir 导入目录
 * @return {Object}
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





/* vim: set ts=4 sw=4 sts=4 tw=120: */
