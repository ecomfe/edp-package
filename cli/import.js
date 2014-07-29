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
cli.options = [ 'older', 'save-dev' ];

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数.
 * @param {Array} opts 命令运行参数.
 * @param {function=} function 执行完毕之后的回掉函数.
 */
cli.main = function (args, opts, opt_callback) {
    var context = factory.create(
        pkg.getTempImportDir(),
        process.cwd());
    var callback = opt_callback || function(){};

    if (!args.length) {
        var dependencies = pkg.getDefinedDependencies();
        if (dependencies) {
            async.eachSeries(
                Object.keys(dependencies),
                importPackage(context),
                refresh(context, callback));
            return;
        }
        else {
            console.log('See `edp import --help`');
            process.exit(0);
        }
    }

    async.eachSeries(
        args,
        importPackage(context),
        refresh(context, callback));
};

/**
 * 导入package成功之后，更新项目的配置信息
 * 采用的方式是执行 edp project updateLoaderConfig
 * 这样子就可以避免edp-package对edp-project的依赖了
 */
function refresh(context, callback) {
    return function(err) {
        if (err) {
            callback(err);
            throw err;
        }

        require('../lib/util/copy-dir')(
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
            callback(code === 0 ? null : code);
        });
    };
}

/**
 * 导入一个package，结束之后执行callback
 * @param {string} name 要导入的package的名字.
 * @param {function} callback 结束之后回调函数.
 */
function importPackage(context) {
    return function(name, callback) {
        var file = path.resolve(process.cwd(), name);

        var method = null;
        var args = name;

        if ( /\.(gz|tgz|zip)$/.test(name) && fs.existsSync(file)) {
            args = file;
            edp.log.info('GET file://%s', path.normalize(file));
            method = require('../lib/import-from-file');
        }
        else if (/^https?:\/\/(.+)/.test(name)) {
            method = require('../lib/import-from-remote');
        }
        else {
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
