/**
 * @file 获取依赖包目录功能
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 获取依赖包目录
 * 
 * @param {string} importDir 导入目录
 * @return {string}
 */
module.exports = function ( importDir ) {
    var projectInfo = require( 'edp-project' ).getInfo( importDir );
    if ( projectInfo ) {
        importDir = projectInfo.dir;
    }

    return require( 'path' ).join( 
        importDir, 
        require( '../config/dep-dir' )
    );
};
