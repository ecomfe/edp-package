/**
 * @file 从registry导入包
 * @author errorrik[errorrik@gmail.com]
 */
var fs = require( 'fs' );

/**
 * 从registry导入包
 * 
 * @param {string} name 包名称
 * @param {string} importDir 导入目录
 * @param {Function} callback 回调函数
 */
module.exports = function ( name, importDir, callback ) {
    /**
     * @param {null|*} err 正常情况为null，否则代表出错了.
     * @param {{file:string,path:string,version:string,
     * name:string,shasum:string}} data 回调函数传递的数据.
     */
    function afterFetch( err, data ) {
        if ( err ) {
            callback( err );
            return;
        }

        // TODO 这个判断是否应该放到fetch里面去做呢？
        /*
        var name = data.name;
        var version = data.version;
        var isPkgExists = require( './util/is-package-exists' );
        if ( isPkgExists( name, version, depDir ) ) {
            fs.unlinkSync( data.path );
            callback( null, {
                name: name,
                version: version
            });
            return;
        }
        */

        require( './import-from-file' )(
            data.path,
            importDir,

            /**
             * @param {null|*} err 正常情况为null，否则代表出错了.
             * @param {Object} pkg package.json的内容.
             */
            function( err, pkg ) {
                fs.unlinkSync( data.path );
                callback( err, pkg );
            }
        );
    };

    // XXX 这里的depDir不是项目的dep目录，而是一个临时创建的项目中dep目录
    var depDir = require( './util/get-dependencies-dir' )( importDir );
    require( './fetch' )( name, depDir, afterFetch );
};
