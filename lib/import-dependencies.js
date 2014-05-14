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
    var isPkgExists = require( './util/is-package-exists' );
    var importFromRegistry = require( './import-from-registry' );

    var async = require( 'async' );
    var tasks = [];

    dependNames.forEach( function ( dependName ) {
        tasks.push( function ( completedCallback ) {
            var dependVer = dependencies[ dependName ];

            if ( isPkgExists( dependName, dependVer, depDir ) ) {
                completedCallback( null, dependName );
            }
            else {
                importFromRegistry( dependName + '@' + dependVer, importDir, function () {
                    completedCallback( null, dependName );
                } );
            }
        } );
    } );
    async.series(
        tasks,
        function( err, results ) {
            if ( err ) {
                console.log( 'Import dependency fail!' );
            }
            callback();
        }
    );
};

