/**
 * @file 包查询功能
 * @author errorrik[errorrik@gmail.com]
 *         fanxueliang[fanxueliang.g@gmail.com]
 */


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
cli.description = '查询现有的包';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function(args) {
    console.log('See `http://edp.baidu.com`');
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
