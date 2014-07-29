/**
 * @file ../lib/context.js ~ 2014/07/29 13:49:24
 * @author leeight(liyubei@baidu.com)
 * 用来维护一下项目的上下文信息.
 **/
var path = require('path');
var fs = require('fs');

var kDependencyDir = 'dep';

/**
 * @param {string} shadowDir 临时的项目目录，只是用来import package，
 * 全部成功之后，统一移动到当前项目的目录，避免中断对当前项目造成影响.
 * @param {string=} opt_projectDir 项目的目录，一般来说，是当前目录.
 * @return {ProjectContext}
 */
exports.create = function(shadowDir, opt_projectDir) {
    return new ProjectContext(
        opt_projectDir || process.cwd(),
        shadowDir);
};

/**
 * @constructor
 * @param {string} dir 项目的目录.
 * @param {string} shadowDir 临时的项目目录.
 */
function ProjectContext(dir, shadowDir) {
    /**
     * 项目目录
     * @type {string}
     */
    this.dir = dir;

    /**
     * 临时的项目目录，执行edp import或者edp update
     * 之前自动创建的
     * @type {string}
     */
    this.shadowDir = shadowDir;

    /**
     * 用来缓存edp import或者edp update的中间结果
     * 此时安装成功的package还没有被更新到项目的dep目录里面去
     * 但是的确已经存在了（在临时创建的目录里面），如果后续需
     * 要同样的版本，其实就不需要重新下载了
     *
     * @private
     * @type {Object.<string, boolean>}
     */
    this._temporaryPackageCache = {};
}

/**
 * 计算pkg和version的路径.
 * @param {string} pkg
 * @param {string} version
 * @return {string}
 */
ProjectContext.prototype._getPackageDir = function(pkg, version) {
    return path.join(this.dir, kDependencyDir, pkg, version);
};

/**
 * 是否已经存在pkg和version的组合了？
 * @param {string} pkg 包名.
 * @param {string} version 包版本.
 * @return {boolean}
 */
ProjectContext.prototype.hasPackage = function(pkg, version) {
    var a = fs.existsSync(path.join(this.dir, kDependencyDir, pkg, version));
    if (a) {
        return a;
    }
    return fs.existsSync(path.join(this.getShadowDependenciesDir(), pkg, version));
};

/**
 * @return {string}
 */
ProjectContext.prototype.getShadowDependenciesDir = function() {
    return path.join(this.shadowDir, kDependencyDir);
};

/**
 * @return {string}
 */
ProjectContext.prototype.getDependenciesDir = function() {
    return path.join(this.dir, kDependencyDir);
};

/**
 * @return {string}
 */
ProjectContext.prototype.getShadowDir = function() {
    return this.shadowDir;
};

/**
 * 记录一下已经成功import或者update的package.
 * @param {string} pkg
 * @param {string} version
 */
ProjectContext.prototype.addPackage = function(pkg, version) {
    var key = pkg + '@' + version;
    this._temporaryPackageCache[key] = true;
};










/* vim: set ts=4 sw=4 sts=4 tw=120: */
