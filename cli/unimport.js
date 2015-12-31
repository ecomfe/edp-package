/**
 * @file 
 * @Author: lidianbin(lidianbin@baidu.com)
 * @Date:   2015-12-22 18:19:56
 * @Last Modified by:   lidianbin
 * @Last Modified time: 2015-12-30 18:18:12
 */

var util = require('util');
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
cli.description = '移除包';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = ['force'];

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数.
 * @param {Array} opts 命令运行参数.
 * @param {function=} opt_callback 执行完毕之后的回掉函数.
 */
cli.main = function (args, opts, opt_callback) {

    var context = factory.create(
        pkg.getTempImportDir(),
        process.cwd());

    var projectInfo = context.getProjectInfo();
    if (!projectInfo) {
        edp.log.info('You are not in a EDP project!');
        return;
    }

    if (!args.length) {
        edp.log.info('See `edp unimport --help`');
        return;
    }

    var dependencies = pkg.getDefinedDependencies();
    // 判断要引入的包是否已经存在，如果存在则提示请使用update
    // console.log(dependencies);
    args = args.filter(function (arg, i) {
        if (Object.keys(dependencies).indexOf(arg) < 0) {
            edp.log.warn(util.format('Package `%s` not found!', arg));
            return false;
        }
        context.addPkgs(arg);
        return true;
    });
    if (!args.length) {
        return;
    }
    if (!opts.force) {
        // 如果不是强制import, 那么每次更新之前需要确认一下。
        context.setConfirm(getConfirm(context));
    }

    var callback = opt_callback || function () {};

    // 移除传入的包
    require('../lib/unimport-package')(context, args, callback);

};

function getConfirm(context) {
    return function (data, callback) {
        var msg = '';
        msg = util.format('Remove package %s [y/n]: ', data.name);

        edp.rl.prompt(msg, function (answer) {
            callback(answer === 'y' || answer === 'Y');
        });
    };
}


/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;