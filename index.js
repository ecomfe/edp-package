/**
 * @file package管理功能模块
 * @author errorrik[errorrik@gmail.com]
 * 这里面需要维护其它模块使用的api，具体有哪些模块依赖了哪些api，需要
 * 从这个查看：https://www.npmjs.org/package/edp-package
 *
 * edpx-bat-ria: getImported, importFromRegistry
 * edp-project: getImported
 * edpx-crm: importFromFile, lib/util/extract
 * edpx-mobile: importFromRegistry
 * edpx-ria: importFromRegistry, getImported
 * ub-ria-tool: importFromRegistry
 */
var path = require('path');

var edp = require('edp-core');

var pkg = require('./lib/pkg');
var factory = require('./lib/context');

/**
 * 获取当前已经导入的包列表
 *
 * @param {string} projectDir 导入目录
 * @return {Object}
 */
exports.getImported = function(projectDir) {
    var bizRoot = edp.path.getRootDirectory(projectDir);
    return require('./lib/util/get-manifest')(path.join(bizRoot, 'dep'));
};

function apiImplementation(api, args, projectDir, callback) {
    var context = factory.create(pkg.getTempImportDir(), projectDir);
    context.addPkgs(args);
    require(api)(context, args, function(error, edpkg){
        try {
            pkg.copyDirectory(
                context.getShadowDependenciesDir(),
                context.getDependenciesDir());
            context.refreshProjectDependencies();
            edp.util.rmdir(context.getShadowDir());
        }
        catch(ex) {
            callback(ex, edpkg);
            return;
        }
        callback(error, edpkg);
    });
}


/**
 * 从http://edp-registry.baidu.com导入所需要的package.
 * @param {string} name 需要导入的package.
 * @param {string=} opt_projectDir 项目的目录.
 * @param {function=} opt_callback 成功之后的回调函数.
 */
exports.importFromRegistry = function(name, opt_projectDir, opt_callback) {
    var projectDir = opt_projectDir || process.cwd();
    var callback = opt_callback || function(err) {
        if (err) {
            edp.log.fatal(err);
        }
    };

    apiImplementation('./lib/import-from-registry', name, projectDir, callback);
};

/**
 * 从本地文件导入所需要的package.
 *
 * @param {string} name 需要导入的package.
 * @param {string=} opt_projectDir 项目的目录.
 * @param {function=} opt_callback 成功之后的回调函数.
 */
exports.importFromFile = function(file, opt_projectDir, opt_callback) {
    var projectDir = opt_projectDir || process.cwd();
    var callback = opt_callback || function(err) {
        if (err) {
            edp.log.fatal(err);
        }
    };

    apiImplementation('./lib/import-from-file', file, projectDir, callback);
};


