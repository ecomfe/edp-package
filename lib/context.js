/**
 * @file context.js
 * @author leeight(liyubei@baidu.com)
 * 用来维护一下项目的上下文信息.
 **/
var path = require('path');
var fs = require('fs');
var edp = require('edp-core');
var async = require('async');

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
     * key主要是package的名字，用来标记是否已经处理完毕这个
     * package的所有依赖
     * @type {Object.<string, boolean>}
     */
    this.resolved = {};

    /**
     * edp import xxx yyy 中的 xxx yyy的集合
     * @type {Array}
     */
    this.pkgs = [];

    /**
     * edp import er --alias=er3
     * @type {Object.<string, string>}
     */
    this.aliasMap = {};

    /**
     * v2 || other
     * @type {string}
     */
    this.layout = this._getProjectLayout();
}

/**
 * 获取项目信息对象
 * 
 * @return {Object} 返回项目信息 `{dir: '', 'infoDir': ''}`
 */
ProjectContext.prototype.getProjectInfo = function () {
    var project = require('edp-project');
    return project.getInfo(this.dir);
};

/**
 * 获取项目的dep目录
 * 
 * @return {string} 项目dep目录
 */
ProjectContext.prototype.getProjectDepDir = function () {
    return path.join(this.getProjectInfo().dir, kDependencyDir);
};

/**
 * 获取项目module配置
 * 
 * @return {Object} 返回项目的module配置
 */
ProjectContext.prototype.getModuleConfig = function () {
    var project = require('edp-project');
    return project.module.getConfig(this.getProjectInfo());
};

/**
 * 获取项目的树形结构的依赖
 * @return {Array} 树形结构的项目的依赖关系
 */
ProjectContext.prototype.getDependenciesTree = function () {
    var projectInfo = this.getProjectInfo();
    var dependencies = pkg.getDefinedDependencies(this.dir);
    var moduleCongfig = this.getModuleConfig();
    return require('./util/get-dep-info')(projectInfo.dir, dependencies, moduleCongfig);
};

/**
 * @return {string}
 */
ProjectContext.prototype._getProjectLayout = function() {
    var pkgFile = path.join(this.dir, 'package.json');
    if (!fs.existsSync(pkgFile)) {
        return 'v1';
    }

    var config = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
    if (config && config.edp && config.edp.layout) {
        return config.edp.layout;
    }

    return 'v1';
};

/**
 * @param {Object} aliasMap 调用edp import的时候传递的参数alias参数
 */
ProjectContext.prototype.setAliasMap = function(aliasMap) {
    this.aliasMap = aliasMap;
};

/**
 * @param {Object} pkgs 调用edp import时要引入的包
 */
ProjectContext.prototype.addPkgs = function(pkgs) {
    this.pkgs || (this.pkgs = []);
    if (typeof pkgs === 'string') {
        this.pkgs.push(pkgs);
    }
    else {
        pkgs.forEach(function (pkg) {
            this.pkgs.push(pkg);
        });
    }
};

/**
 * @param {string} name 创建目录的时候，需要通过context过滤一下，得到真正的目标目录名.
 * @return {string}
 */
ProjectContext.prototype.getPackageDstName = function(name) {
    return this.aliasMap[name] || name;
};

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
    var a = this.layout === 'v2'
            ? path.join(this.dir, kDependencyDir, pkg)
            : path.join(this.dir, kDependencyDir, pkg, version);
    if (fs.existsSync(a)) {
        return a;
    }

    var b = this.layout === 'v2'
            ? path.join(this.getShadowDependenciesDir(), pkg)
            : path.join(this.getShadowDependenciesDir(), pkg, version);
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
    return this.confirm || function(data, callback) {
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

    return function(error) {
        if (error) {
            callback(error);
            return;
        }

        pkg.copyDirectory(
            context.getShadowDependenciesDir(),
            context.getDependenciesDir());

        if (context.layout !== 'v2' && opt_cleanup === true) {
            context.takeCleanupIfPossible();
        }

        // 更新本地的配置文件
        context.updateConfigFiles(callback)(null);

    };
};

/**
 * 更新本地的配置信息，包括package.json module.conf 还有项目入口
 * 处的LoaderConfig
 *
 * @param  {Function} callback 自定义的回掉函数
 * @return {[type]}
 */
ProjectContext.prototype.updateConfigFiles = function (callback) {
    var context = this;
    return function (error) {
        if (error) {
            callback(error);
            return;
        }
        // 更新项目的package.json的dependencies
        // 为了避免对edp-project的依赖，这里重新实现
        // 这部分的功能
        context.refreshProjectDependencies();

        // 有人可能会直接修改本地dep里面的内容
        // 这样子升级之后，可能功能就不正常了
        // 我们在import或者update之后做一次检查
        // 这样子给出用户一些提示，知道有哪些文件改动了
        context.checkLocalModifications(function(error, diffs) {
            diffs.forEach(function(line) {
                edp.log.warn(line);
            });

            var cmd = edp.util.spawn(
                'edp',
                [ 'project', 'updateLoaderConfig' ],
                { stdio: 'inherit' }
            );
            cmd.on('error', function(error) {
                console.log(error);
            });
            cmd.on('close', function(code) {
                edp.util.rmdir(context.getShadowDir());
                edp.log.info('Impossible Mission Completed.');
                callback(code === 0 ? null : code);
            });
        });
    }
};

/**
 * https://github.com/ecomfe/edp/issues/191
 * @param {function} done 检查完毕之后的回调函数.
 */
ProjectContext.prototype.checkLocalModifications = function(done) {
    var context = this;
    var pkgDirs = edp.glob.sync(kDependencyDir + '/**/*.md5').map(function(md5file) {
        return md5file.replace('.md5', '');
    });

    async.mapLimit(pkgDirs, 1,
        function(pkgDir, callback) {
            if (!fs.existsSync(pkgDir)) {
                // 如果不存在pkgDir的话，就用默认的值，这样子至少后续
                // 比较的时候不会出错
                callback(null, JSON.parse(fs.readFileSync(pkgDir + '.md5', 'utf-8')));
                return;
            }

            require('./util/get-package-md5sum')(pkgDir, callback);
        },
        function(error, results) {
            var diffs = [];
            pkgDirs.forEach(function(pkgDir, i) {
                var a = JSON.parse(fs.readFileSync(pkgDir + '.md5', 'utf-8'));
                var b = results[i];
                diffs = diffs.concat(context.compareMap(a, b, pkgDir));
            });
            done(error, diffs);
        });
};

/**
 * 比较两个哈希表的内容，把差异找出来.
 * @param {Object} a 老的内容.
 * @param {Object} b 新的内容.
 * @param {string=} opt_pkgDir 目录前缀.
 * @return {Array.<string>} 变更的内容.
 */
ProjectContext.prototype.compareMap = function(a, b, opt_pkgDir) {
    var diffs = [];
    var prefix = opt_pkgDir ? opt_pkgDir + '/' : '';

    Object.keys(a).forEach(function(key) {
        if (!b[key]) {
            diffs.push('D ' + prefix + key);
        }
        else if (a[key] !== b[key]) {
            diffs.push('M ' + prefix + key);
        }
    });

    Object.keys(b).forEach(function(key) {
        if (!a[key]) {
            diffs.push('A ' + prefix + key);
        }
    });

    return diffs;
};

/**
 * 更新成功之后，删除旧的版本，保留最新的版本
 */
ProjectContext.prototype.takeCleanupIfPossible = function() {
    var manifest = this.getImported();

    var unluckyPackages = [];
    Object.keys(manifest).forEach(function(pkg) {
        var versions = Object.keys(manifest[pkg]);
        var bestVersion = semver.maxSatisfying(versions, '*');
        versions.forEach(function(v) {
            if (v !== bestVersion) {
                unluckyPackages.push({
                    name: pkg,
                    version: v
                });
            }
        });
    });

    var bizDir = this.dir;
    unluckyPackages.forEach(function(item) {
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
    var context = this;

    // 这个是项目中当前真正存在的模块
    var manifest = this.getImported();
    var packages = [];

    // 读现有的 `package.json` 获取现在的 `dependencies`
    var config = path.join(this.dir, 'package.json');
    if (!fs.existsSync(config)) {
        config = path.join(this.dir, '.edpproj', 'metadata');
        if (!fs.existsSync(config)) {
            return;
        }
    }
    var packageInfo = JSON.parse(fs.readFileSync(config, 'utf-8'));
    var dependencies = pkg.getDependencies(packageInfo);
    // 过滤掉所有不是直接依赖的包
    // 然后依次添加到 `packages` 数组中
    Object.keys(manifest).filter(function (dirName) {
        // 如果是已经在package.json中存在的包
        if (dependencies[dirName]) {
            return true;
        }

        // 如果是在这次import中import过来的包
        for (var i = 0, l = context.pkgs.length; i < l; i++) {
            if (dirName === context.pkgs[i]) {
                return true;
            }
            else if (
                context.aliasMap[context.pkgs[i]]
                && context.aliasMap[context.pkgs[i]] === dirName
            ) {
                return true;
            }
        }

        return false;
    }).forEach(function(pkg) {
        var versions = Object.keys(manifest[pkg]);
        var bestVersion = semver.maxSatisfying(versions, '*');
        packages.push({
            name: pkg,
            version: bestVersion
        });
    });

    packages.forEach(function(pkg) {
        if (!dependencies[pkg.name]) {
            // 尊重原作者的选择，如果已经有了，我们不修改
            // 即便原来的版本是1.0.0，我们人肉import了2.0.0，也不去修改
            dependencies[pkg.name] = (context.layout === 'v2')
                                     ? 'latest'
                                     : '~' + pkg.version;
        }
    });

    // 去掉 `dependencies` 中有的但是当前不存在的包
    Object.keys(dependencies).forEach(function (pkgName) {
        for (var i = 0, l = packages.length; i < l; i++) {
            if (packages[i].name === pkgName) {
                return;
            }
        }
        delete dependencies[pkgName];
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
