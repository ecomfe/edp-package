/**
 * @file 从registry导入包
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 从registry导入包
 * 
 * @param {string} name 包名称
 * @param {string=} importDir 导入目录
 * @param {Function=} callback 回调函数
 */
module.exports = function ( name, importDir, callback ) {
    var fs = require( 'fs' );

    importDir = importDir || process.cwd();
    callback = callback || new Function();
    var depDir = require( './util/get-dependencies-dir' )( importDir );

    require( './fetch' )( name, depDir, function ( error, data ) {
        if ( error ) {
            callback( error, data );
            return;
        }

        var name = data.name;
        var version = data.version;

        var isPkgExists = require( './util/is-package-exists' );
        if ( isPkgExists( name, version, depDir ) ) {
            fs.unlinkSync( data.path );
            callback && callback( null, {
                name: name,
                version: version
            });
            return;
        }

        require( './import-from-file' )( 
            data.path, 
            importDir, 
            function( error, pkg ) {
                fs.unlinkSync( data.path );
                callback( error, pkg );
            }
        );
    } );
};
