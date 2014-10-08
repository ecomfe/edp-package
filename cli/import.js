/**
 * @file 项目导入依赖包模块的命令行执行
 * @author errorrik[errorrik@gmail.com]
 */
var fs = require('fs');
var path = require('path');

var async = require('async');
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
cli.options = [ 'older', 'save-dev', 'alias:' ];

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
    var callback = opt_callback || function() {};
    var dependencies = pkg.getDefinedDependencies();

    if (!args.length) {
        if (dependencies) {
            async.eachSeries(
                Object.keys(dependencies),
                importPackage(context, dependencies),
                context.refresh(callback));
        }
        else {
            console.log('See `edp import --help`');
        }
        return;
    }

    async.eachSeries(
        args,
        importPackage(context, dependencies),
        context.refresh(callback));
};

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

        if (/\.(gz|tgz|zip)$/.test(name) && fs.existsSync(file)) {
            args = file;
            edp.log.info('GET file://%s', path.normalize(file));
            method = require('../lib/import-from-file');
        }
        else if (/^https?:\/\/(.+)/.test(name)) {
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

        method(context, args, callback);
    };
}

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
