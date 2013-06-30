

/**
 * 获取当前已经导入的包列表
 * 
 * @inner
 * @param {string} dir 当前目录
 * @return {Object}
 */
module.exports = function ( dir ) {
    var filename = require( '../config/manifest-file' );
    var file = require( 'path' ).join( dir, filename );

    if ( fs.existsSync( file ) ) {
        return JSON.parse( fs.readFileSync( file, 'UTF-8' ) );
    }

    return {};
};
