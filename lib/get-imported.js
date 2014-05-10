/**
 * @file 获取当前已经导入的包列表
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 获取当前已经导入的包列表
 * 
 * @param {string=} importDir 导入目录
 * @return {Object}
 */
module.exports = function ( importDir ) {
    importDir = importDir || process.cwd();
    var depDir = require( './util/get-dependencies-dir' )( importDir );

    return require( './util/get-manifest' )( depDir );
};
