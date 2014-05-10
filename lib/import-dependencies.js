/**
 * @file 为包导入其依赖功能
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 为包导入其依赖
 * 
 * @param {string} name 包名称
 * @param {string} version 包版本
 * @param {string} importDir 导入目录
 * @param {function} callback 导入完成回调函数
 */
module.exports = function ( name, version, importDir, callback ) {
    // XXX 这里的depDir不是项目的dep目录，而是一个临时创建的项目中dep目录
    var depDir = require( './util/get-dependencies-dir' )( importDir );

    var pkgDir = require( 'path' ).resolve( depDir, name, version );
    var pkgData = require( './util/get-package-info' )( pkgDir );
    var dependencies = require( './util/get-dependencies-info' )( pkgData );
    var dependNames = Object.keys( dependencies );

    require( 'async' ).eachLimit( dependNames, 1, importPackage, callback );
    function importPackage( dependName, callback ) {
        var dependVer = dependencies[ dependName ];
        require( './import-from-registry' )(
            dependName + '@' + dependVer, importDir, callback );
    }
};

