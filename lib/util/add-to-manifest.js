/**
 * @file 添加已导入的依赖包信息
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 添加包信息到manifest文件
 * 
 * @inner
 * @param {Object} pkg 包信息对象
 * @param {string} dir 当前目录
 */
module.exports = function ( pkg, dir ) {
    var name = pkg.name;
    var packages = require( './get-manifest' )( dir );

    if ( !packages[ name ] ) {
        packages[ name ] = {};
    }

    packages[ name ][ pkg.version ] = pkg;

    var fs = require( 'fs' );
    fs.writeFileSync(
        require( 'path' ).join( dir, require( '../config/manifest-file' ) ),
        JSON.stringify( packages, null, 4 ),
        'UTF-8'
    );
};
