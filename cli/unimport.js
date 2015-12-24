/**
 * @file 
 * @Author: lidianbin(lidianbin@baidu.com)
 * @Date:   2015-12-22 18:19:56
 * @Last Modified by:   lidianbin
 * @Last Modified time: 2015-12-24 13:53:17
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

    if (!opts.force) {
        // 如果不是强制import, 那么每次更新之前需要确认一下。
        context.setConfirm(getConfirm(context));
    }

    var callback = opt_callback || function () {};

    // 移除传入的包
    require('../lib/unimport-package')(args, context, callback);

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