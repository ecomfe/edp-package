/**
 * @file ../lib/context.js ~ 2014/07/29 13:49:24
 * @author leeight(liyubei@baidu.com)
 * 用来维护一下项目的上下文信息.
 **/
var path = require('path');
var fs = require('fs');
var pkg = require('./pkg');
var edp = require('edp-core');

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
     * @type {Object.<string, boolean>}
     */
    this.resolved = {};
}

/**
 * 是否已经存在pkg和version的组合了？
 * @param {string} pkg 包名.
 * @param {string} version 包版本.
 * @return {boolean}
 */
ProjectContext.prototype.hasPackage = function(pkg, version) {
    return this.getPackage(pkg, version) != null;
};

/**
 * 获取已经存在pkg和version的组合目录.
 * @param {string} pkg 包名.
 * @param {string} version 包版本.
 * @return {?string}
 */
ProjectContext.prototype.getPackage = function(pkg, version) {
    var a = path.join(this.dir, kDependencyDir, pkg, version);
    if (fs.existsSync(a)) {
        return a;
    }

    var b = path.join(this.getShadowDependenciesDir(), pkg, version);
    if (fs.existsSync(b)) {
        return b;
    }

    return null;
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
 * 获取当前已经导入的包列表
 *
 * @return {Object}
 */
ProjectContext.prototype.getImported = function() {
    var depDir = path.join(this.dir, kDependencyDir);

    return require('./util/get-manifest')(depDir);
};

/**
 * 设置一下confirm的回调函数.
 * @param {function} confirm;
 */
ProjectContext.prototype.setConfirm = function(confirm) {
    this.confirm = confirm;
};

/**
 * 获取confirm的回调函数.
 * @return {function}
 */
ProjectContext.prototype.getConfirm = function() {
    return this.confirm || function(data, callback){
        callback(true);
    };
};

ProjectContext.prototype.hasResolved = function(key) {
    return this.resolved[key];
};

ProjectContext.prototype.markAsResolved = function(key) {
    this.resolved[key] = true;
};

/**
 * 导入package成功之后，更新项目的配置信息
 * 采用的方式是执行 edp project updateLoaderConfig
 * 这样子就可以避免edp-package对edp-project的依赖了
 * @return {function}
 */
ProjectContext.prototype.refresh = function(callback) {
    var context = this;

    return function(err) {
        if (err) {
            callback(err);
            throw err;
        }

        pkg.copyDirectory(
            context.getShadowDependenciesDir(),
            context.getDependenciesDir());

        var cmd = edp.util.spawn(
            'edp',
            ['project', 'updateLoaderConfig'],
            { stdio: 'inherit' }
        );
        cmd.on('error', function(error){
            console.log(error);
        });
        cmd.on('close', function(code){
            edp.util.rmdir(context.getShadowDir());
            edp.log.info('Everything is done.');
            callback(code === 0 ? null : code);
        });
    };
};









/* vim: set ts=4 sw=4 sts=4 tw=120: */
