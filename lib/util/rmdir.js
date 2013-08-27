/**
 * @file 删除目录功能
 * @author errorrik[errorrik@gmail.com]
 */


/**
 * 删除目录
 * 
 * @param {string} path 目录路径
 */
function rmdir( path ) {
    var fs = require( 'fs' );

    if ( fs.existsSync( path ) && fs.statSync( path ).isDirectory() ) {
        fs.readdirSync( path ).forEach(
            function ( file ) {
                var fullPath = require( 'path' ).join( path, file );
                if ( fs.statSync( fullPath ).isDirectory() ) {
                    rmdir( fullPath );
                }
                else {
                    fs.unlinkSync( fullPath );
                }
            }
        );

        fs.rmdirSync( path );
    }
};

module.exports = rmdir;
