/**
 * @file 从项目中移除指定的package
 * @author: lidianbin(lidianbin@baidu.com)
 * @Date:   2015-12-23 16:35:22
 * @Last Modified by:   lidianbin
 * @Last Modified time: 2015-12-25 17:33:28
 */
var edp = require('edp-core');
var path = require('path');
var async = require('async');

/**
 * 从本地文件导入包
 *
 * @param {ProjectContext} context
 * @param {Array|string} file 包名称
 * @param {Function} callback 回调函数
 */
module.exports = function (context, pkgs, callback) {
    // 获取所有的包
    // 获取依赖树
    // 找出所有要移除的包
    // 依次将他们移除并提示
    // 执行回掉
    if (typeof pkgs === 'string') {
        pkgs = [pkgs];
    }
    var depTree = context.getDependenciesTree();
    var removeStruct = buildRemoveStruct(pkgs, depTree);
    var removePkgTree = removeStruct.removePkgTree;
    var pkgRefNum = removeStruct.pkgRefNum;

    async.eachSeries(
        removePkgTree,
        function (pkg, callback) {
            var confirm = context.getConfirm();
            confirm(pkg, function(yes) {
                if (yes) {
                    edp.log.info('Remove package %s', pkg.name);
                    removePackage(context, pkg, pkgRefNum, callback);
                }
                else {
                    callback(null);
                }
            });
        },
        context.updateConfigFiles(callback)
    );

};


/**
 * 构造一个对象包含两个属性`removePkgTree`、`pkgRefNum`
 * `removePkgTree(要移除的包的依赖树)`、`pkgRefNum(所有包的引用计数)`
 *
 * @param  {Array} pkgs    要移除的package数组
 * @param  {Array} depTree project中的依赖树
 * @return {Object}         一个包含要移除的包的依赖树和所有包的引用计数的对象
 */
function buildRemoveStruct(pkgs, depTree) {
    // 要移除的包的依赖树
    var removePkgTree = [];
    // project中所有的包的引用计数
    var pkgRefNum = {};

    // 遍历depTree 构造出 `pkgRefNum`
    (function scanDepTree(tree) {
        if (tree === null) {
            return;
        }
        tree.forEach(function (item) {

            pkgRefNum[item.name] ? pkgRefNum[item.name]++ : pkgRefNum[item.name] = 1;
            scanDepTree(item.deps);
        });
    })(depTree);

    // 筛选出 `removePkgTree`
    removePkgTree = depTree.filter(function (item) {
        if (pkgs.indexOf(item.name) >= 0) {
            return true;
        }
        return false;
    });

    return {removePkgTree: removePkgTree, pkgRefNum: pkgRefNum};

}

/**
 * 移除一个包
 * @param  {ProjectContext} context
 * @param  {Object}   removeStruct  一个包含要移除的包的依赖树和所有包的引用计数的对象
 * @param  {Function} callback     回掉函数
 */
function removePackage(context, pkg, pkgRefNum, callback) {
    if (--pkgRefNum[pkg.name] <= 0) {
        var pkgDir = path.join(context.getProjectDepDir(), pkg.name);
        edp.util.rmdir(pkgDir);
        removeDeps(context, pkg.deps, pkgRefNum);
    }
    callback(null);
}

/**
 * 移除package的依赖包
 * @param  {ProjectContext} context
 * @param  {Array} pkgs     所有依赖包
 * @param  {Object} pkgRefNum 所有依赖包的引用计数
 */
function removeDeps(context, pkgs, pkgRefNum) {
    if (!pkgs) {
        return;
    }
    pkgs.forEach(function (pkg) {
        if (--pkgRefNum[pkg.name] <= 0) {
            edp.log.info('Remove depend package %s', pkg.name);
            var pkgDir = path.join(context.getProjectDepDir(), pkg.name);
            edp.util.rmdir(pkgDir);
        }
        removeDeps(context, pkg.deps, pkgRefNum);
    });
}
