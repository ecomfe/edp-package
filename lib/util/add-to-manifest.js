
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
        packages,
        'UTF-8'
    );
};
