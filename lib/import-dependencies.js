/**
 * @file 为包导入其依赖功能
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 为包导入其依赖
 * 
 * @param {string} name 包名称
 * @param {string} version 包版本
 * @param {string=} importDir 导入目录
 * @param {Function=} callback 导入完成回调函数
 */
module.exports = function ( name, version, importDir, callback ) {
    importDir = importDir || process.cwd();
    callback = callback || new Function();
    var depDir = require( './util/get-dependencies-dir' )( importDir );

    var pkgDir = require( 'path' ).resolve( depDir, name, version );
    var pkgData = require( './util/get-package-info' )( pkgDir );
    var dependencies = require( './util/get-dependencies-info' )( pkgData );
    var dependNames = Object.keys( dependencies );

    var i = -1;

    var isPkgExists = require( './util/is-package-exists' );
    var importFromRegistry = require( './import-from-registry' );

    function next( error ) {
        if ( error ) {
            console.log( 'Import dependency "' + dependNames[ i ] + '" fail!' );
        }

        if ( ++i >= dependNames.length ) {
            callback();
            return;
        }

        var dependName = dependNames[ i ];
        var dependVer = dependencies[ dependName ];
        
        if ( isPkgExists( dependName, dependVer, depDir ) ) {
            next();
        }
        else {
            importFromRegistry( dependName + '@' + dependVer, importDir, next );
        }
    }

    next();
};

