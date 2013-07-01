/**
 * @file 导入依赖包的目录路径修正功能
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 将导入包当前所在临时目录修正到正确的目录
 * 
 * @inner
 * @param {string} currentDir 临时目录
 * @return {string} 修正后正确的目录
 */
module.exports = function ( currentDir ) {
    var fs = require( 'fs' );
    var path = require( 'path' );

    // 读取package的信息
    var pkgData = require( './get-package-info' )( currentDir );
    var name = pkgData.name;
    var version = pkgData.version;

    // 执行目录修正
    // 如果目标包目录已经存在，不进行覆盖
    var importDir = path.resolve( currentDir, '..' );
    var target = path.join( importDir, name, version );
    if ( fs.existsSync( target ) ) {
        fs.rmdirSync( currentDir );
    }
    else {
        require( 'mkdirp' ).sync( path.join( importDir, name ) );
        fs.renameSync( currentDir, target );
    }

    return target;
};
