/**
 * @file 项目更新依赖包模块的命令行执行
 * @author errorrik[errorrik@gmail.com]
 *         Ielgnaw[wuji0223@gmail.com]
 */
var edp = require('edp-core');
var async = require('async');
var util = require('util');

var factory = require('../lib/context');
var semver = require('../lib/util/semver');
var pkg = require('../lib/pkg');

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
cli.description = '更新依赖包';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = [ 'delete-older', 'force' ];

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令运行选项
 * @param {function=} opt_callback 执行完毕之后的回掉函数.
 */
cli.main = function (args, opts, opt_callback) {
    var context = factory.create(
        pkg.getTempImportDir(),
        process.cwd());
    var callback = opt_callback || function(){};

    if (!opts['force']) {
        // 如果不是强制update，那么每次更新之前需要确认一下。
        context.setConfirm(getConfirm(context));
    }

    // dependencies是在package.json或者metadata里面定义的
    // 并不是通过扫描dep得到的manifest的信息
    var dependencies = pkg.getDefinedDependencies() || {};

    if (!args.length) {
        // 没有任何参数，说明需要更新项目中所有的package
        // 此时采用的策略是全部检查一次，下载最新的package即可
        // 不用考虑当前是否是最新的package了
        if (dependencies) {
            async.eachSeries(
                Object.keys(dependencies),
                updatePackage(context, dependencies),
                context.refresh(callback, opts['delete-older']));
            return;
        }
        else {
            console.log('See `edp update --help`');
            process.exit(0);
        }
    }

    var invalidPackages = [];
    args = args.filter(function(item){
        if (!dependencies[item]) {
            invalidPackages.push(item);
            return false;
        }
        return true;
    });

    if (invalidPackages.length) {
        edp.log.warn('Run `edp import %s\' first.',
            invalidPackages.join(' '));
    }

    if (!args.length) {
        // 过滤之后没有合法的package了，那就啥也不干了
        process.exit(0);
    }

    // 指定了名称，需要过滤出当前项目中已经存在的package
    // 对于不存在的package，需要给出是当的提示
    // $ edp update no-such-package
    // edp WARN
    async.eachSeries(
        args,
        updatePackage(context, dependencies),
        context.refresh(callback, opts['delete-older']));
};

function getConfirm(context) {
    return function(data, callback){
        var msg = '';
        var manifest = context.getImported();
        var versions = Object.keys(manifest[data.name] || {});
        if (!versions.length) {
            msg = util.format('Import %s %s [y/n]: ',
                data.name, data.version);
        }
        else {
            var version = semver.maxSatisfying(versions, '*');
            msg = util.format('Upgrade %s %s → %s [y/n]: ',
                data.name, version, data.version);
        }

        edp.rl.prompt(msg, function(answer){
            callback(answer === 'y' || answer === 'Y');
        });
    }
}

/**
 * 导入一个package，结束之后执行callback
 * @param {string} name 要导入的package的名字.
 * @param {Object} dependencies package.json里面定义的依赖信息.
 * @param {function} callback 结束之后回调函数.
 */
function updatePackage(context, dependencies) {
    // 已经在dep目录下存在的package
    // {
    //   "er": {
    //     "3.0.0": {},
    //     "3.0.1": {},
    //     "3.0.2": {}
    //   },
    //   "esui": {
    //     "4.0.0": {},
    //     "4.0.1": {},
    //     "4.0.2": {}
    //   },
    //   ...
    // }
    return function(name, callback){
        var version = dependencies[name];
        if (!version) {
            callback(new Error('No matched version for ' + name + '!'));
            return;
        }

        var args = name + '@' + version;
        var method = require('../lib/import-from-registry');
        method(context, args, callback);
    };
}

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
