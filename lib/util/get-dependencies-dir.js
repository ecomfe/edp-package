/**
 * @file 获取依赖包目录功能
 * @author errorrik[errorrik@gmail.com]
 */
var edp = require( 'edp-core' );

/**
 * 获取依赖包目录
 * 
 * @param {string} importDir 导入目录
 * @return {string}
 */
module.exports = function ( importDir ) {
    var bizRoot = edp.path.getRootDirectory( importDir );
    return require( 'path' ).join( bizRoot, 'dep' );
};
