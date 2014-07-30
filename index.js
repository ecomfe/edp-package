/**
 * @file package管理功能模块
 * @author errorrik[errorrik@gmail.com]
 */

var factory = require('./lib/context');

/**
 * 获取当前已经导入的包列表
 *
 * @param {string} importDir 导入目录
 * @return {Object}
 */
exports.getImported = function(importDir) {
    var context = factory.create(null, importDir);
    return context.getImported();
};


