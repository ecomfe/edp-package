/**
 * @file 项目导入依赖包模块的命令行执行
 * @author errorrik[errorrik@gmail.com]
 */
var fs = require('fs');
var path = require('path');
var util = require('util');

var async = require('async');
var semver = require('semver');
var edp = require('edp-core');

var pkg = require('../lib/pkg');
var factory = require('../lib/context');

/**
 * 命令行配置项
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '导入包';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = [ 'older', 'save-dev', 'force', 'alias:' ];

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数.
 * @param {Array} opts 命令运行参数.
 * @param {function=} opt_callback 执行完毕之后的回掉函数.
 */
cli.main = function (args, opts, opt_callback) {
    if (args.length > 1 && opts.alias) {
        console.log('See `edp import --help`');
        return;
    }

    var aliasMap = {};
    if (args.length) {
        // 其实只支持一个而已
        aliasMap[args[0]] = opts.alias;
    }

    var context = factory.create(
        pkg.getTempImportDir(),
        process.cwd());
    context.setAliasMap(aliasMap);

    if (!opts.force) {
        // 如果不是强制import, 那么每次更新之前需要确认一下。
        context.setConfirm(getConfirm(context));
    }

    var callback = opt_callback || function() {};
    var dependencies = pkg.getDefinedDependencies();

    if (!args.length) {
        if (dependencies) {
            args = Object.keys(dependencies);
        }
        else {
            console.log('See `edp import --help`');
            return;
        }
    }

    // 判断要引入的包是否已经存在，如果存在则提示请使用update
    var importedPkgs = context.getImported();
    var invalidPackages = [];
    args = args.filter(function (arg, i) {
        if (checkPkgType(arg) === 'name') {
            // 如果没有指定版本，已经在依赖中，并且已经引入
            if (arg.indexOf('@') === -1 && dependencies[arg] && importedPkgs[arg]) {
                if (aliasMap[arg]) {
                    delete aliasMap[arg];
                }
                invalidPackages.push(arg);
                return false;
            }
        }
        return true;
    });

    if (invalidPackages.length) {
        edp.log.warn(
            util.format(
                'Package `%s` exists, please use `edp update %s`!',
                invalidPackages.join(' '), invalidPackages.join(' ')
            )
        );
    }

    if (!args.length) {
        callback(null);
        return;
    }

    async.eachSeries(
        args,
        importPackage(context, dependencies),
        context.refresh(callback));
};

function getConfirm(context) {
    return function (data, callback) {
        var msg = '';
        var manifest = context.getImported();
        // console.log(manifest);
        var versions = Object.keys(manifest[data.name] || {});
        if (!versions.length) {
            // msg = util.format('Import %s %s [y/n]: ',
            //     data.name, data.version);
            callback(true);
        }
        else {
            var version = semver.maxSatisfying(versions, '*');
            // 如果当前的版本 < 要import的版本
            if (semver.lt(version, data.version)) {
                msg = util.format('Upgrade %s %s → %s [y/n]: ',
                    data.name, version, data.version);
            }
            else {
                msg = util.format(
                    'The package you are importing is older than the current one(%s), Are you sure?[y/n]: ',
                    version
                );
            }
            edp.rl.prompt(msg, function(answer) {
                callback(answer === 'y' || answer === 'Y');
            });
        }
    };
}

/**
 * 导入一个package，结束之后执行callback
 * @param {Object} context 执行的上下文信息.
 * @param {Object} dependencies package.json里面定义的依赖信息.
 * @return {function} callback 结束之后回调函数.
 */
function importPackage(context, dependencies) {
    return function(name, callback) {
        var file = path.resolve(process.cwd(), name);
        var method = null;
        var args = name;
        var pkgType = checkPkgType(name);
        if (pkgType === 'file' && fs.existsSync(file)) {
            args = file;
            edp.log.info('GET file://%s', path.normalize(file));
            method = require('../lib/import-from-file');
        }
        else if (pkgType === 'http') {
            method = require('../lib/import-from-remote');
        }
        else {
            dependencies = dependencies || {};
            // 如果调用的是 edp import er
            // 如果metadata里面配置了版本依赖，自动追加
            if (args.indexOf('@') === -1
                && dependencies[name]) {
                args += '@' + dependencies[name];
            }

            method = require('../lib/import-from-registry');
        }

        if (context.aliasMap[name]) {
            context.aliasMap[args] = context.aliasMap[name];
            delete context.aliasMap[name];
        }
        context.addPkgs(args);
        method(context, args, callback);
    };
}

/**
 * 检查用户要引入的包是那种格式
 * @param  {string} pkgSrc pkg的源
 * @return {string}  类型
 */
function checkPkgType(pkgSrc) {
    if (/^https?:\/\/(.+)/.test(pkgSrc)) {
        return 'http';
    }
    else if (/\.(gz|tgz|zip)$/.test(pkgSrc)) {
        return 'file';
    }
    else {
        return 'name';
    }
}


/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
