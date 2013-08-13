/**
 * @file 移除已导入的依赖包信息
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 从manifest文件中将包信息移除
 * 
 * @inner
 * @param {Object} pkg 包信息对象
 * @param {string} dir 当前目录
 */
module.exports = function ( pkg, dir ) {
    var name = pkg.name;
    var packages = require( './get-manifest' )( dir );

    if ( !packages[ name ] ) {
        return;
    }

    var version = pkg.version;
    if ( !version ) {
        delete packages[ name ];
    }
    else {
        delete packages[ name ][ version ];
    }

    var fs = require( 'fs' );
    fs.writeFileSync(
        require( 'path' ).join( dir, require( '../config/manifest-file' ) ),
        JSON.stringify( packages, null, 4 ),
        'UTF-8'
    );
};
