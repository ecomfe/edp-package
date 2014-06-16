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
    var getDepDir = require( './util/get-dependencies-dir' );
    var depDir = getDepDir( importDir );
    callback = callback || new Function();

    require( './fetch' )(
        name,
        // 完成时从文件导入
        function ( error, data ) {
            if ( error ) {
                callback( error, data );
                return;
            }

            require( './import-from-file' )(
                data.path, 
                importDir, 
                function( error, pkg ) {
                    callback( error, pkg );
                }
            );
        },
        // 取到版本信息文件之后检查本地是否存在
        // 如果已经存在则直接跳过下载返回
        function ( name, version ) {
            var projectDep = getDepDir( process.cwd() );
            var checkPackage = require( './util/is-package-exists' );
            var isPkgExists = 
                checkPackage( name, version, depDir ) ||
                checkPackage( name, version, projectDep );
            if ( isPkgExists ) {
                callback( null, {
                    name: name,
                    version: version
                });
            }
            return isPkgExists;
        }
    );
};
