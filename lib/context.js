/**
 * @file ../lib/context.js ~ 2014/07/29 13:49:24
 * @author leeight(liyubei@baidu.com)
 * 用来维护一下项目的上下文信息.
 **/
var path = require('path');
var fs = require('fs');
var edp = require('edp-core');

var pkg = require('./pkg');
var semver = require('./util/semver');

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
 * @param {function} callback 自定义的回掉函数.
 * @param {boolean=} opt_cleanup 是否删除老的package.
 * @return {function}
 */
ProjectContext.prototype.refresh = function(callback, opt_cleanup) {
    var context = this;

    return function(err) {
        if (err) {
            callback(err);
            throw err;
        }

        pkg.copyDirectory(
            context.getShadowDependenciesDir(),
            context.getDependenciesDir());

        if (opt_cleanup === true) {
            context.takeCleanupIfPossible();
        }

        // 更新项目的package.json的dependencies
        // 为了避免对edp-project的依赖，这里重新实现
        // 这部分的功能
        context.refreshProjectDependencies();

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
            edp.log.info('Impossible Mission Completed.');
            callback(code === 0 ? null : code);
        });
    };
};

/**
 * 更新成功之后，删除旧的版本，保留最新的版本
 */
ProjectContext.prototype.takeCleanupIfPossible = function() {
    var manifest = this.getImported();

    var unluckyPackages = [];
    Object.keys(manifest).forEach(function(package){
        var versions = Object.keys(manifest[package]);
        var bestVersion = semver.maxSatisfying(versions, '*');
        versions.forEach(function(v){
            if (v !== bestVersion) {
                unluckyPackages.push({
                    name: package,
                    version: v
                });
            }
        });
    });

    var bizDir = this.dir;
    unluckyPackages.forEach(function(item){
        var pkgDir = path.join(bizDir, kDependencyDir, item.name, item.version);
        if (fs.existsSync(pkgDir)) {
            edp.log.info('Cleanup %s', path.join(kDependencyDir, item.name, item.version));
            edp.util.rmdir(pkgDir);
        }

        var md5sum = path.join(bizDir, kDependencyDir, item.name, item.version + '.md5');
        if (fs.existsSync(md5sum)) {
            fs.unlinkSync(md5sum);
        }
    });
};

/**
 * 实际情况中，package.json中的dependencies跟dep目录中的packages
 * 可能是不一样的，比如我手工执行了
 * edp import hello world
 * 那么就需要把hello和world加入到package.json的dependencies里面去
 * 否则到时候执行edp update的时候没有选择的对象，其实挺麻烦的，是吧
 */
ProjectContext.prototype.refreshProjectDependencies = function() {
    // 这个是项目中当前真正存在的模块
    var manifest = this.getImported();
    var packages = [];
    Object.keys(manifest).forEach(function(package){
        var versions = Object.keys(manifest[package]);
        var bestVersion = semver.maxSatisfying(versions, '*');
        packages.push({
            name: package,
            version: bestVersion
        });
    });

    var config = path.join(this.dir, 'package.json');
    if (!fs.existsSync(config)) {
        config = path.join(this.dir, '.edpproj', 'metadata');
        if (!fs.existsSync(config)) {
            return;
        }
    }

    var packageInfo = JSON.parse(fs.readFileSync(config, 'utf-8'));
    var dependencies = pkg.getDependencies(packageInfo);
    packages.forEach(function(package){
        if (!dependencies[package.name]) {
            // 尊重原作者的选择，如果已经有了，我们不修改
            // 即便原来的版本是1.0.0，我们人肉import了2.0.0，也不去修改
            dependencies[package.name] = '~' + package.version;
        }
    });


    // 更新到配置文件里面去
    if (path.basename(config) === 'package.json') {
        packageInfo.edp.dependencies = dependencies;
    }
    else {
        packageInfo.dependencies = dependencies;
    }

    fs.writeFileSync(config, JSON.stringify(packageInfo, null, 4));
};









/* vim: set ts=4 sw=4 sts=4 tw=120: */
