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
    // XXX 这里的depDir不是项目的dep目录，而是一个临时创建的项目中dep目录
    var depDir = require( './util/get-dependencies-dir' )( importDir );

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

        // 需要检查两个目录，一个是临时的dep目录，一个是项目的dep目录
        // TODO 这个工作放到fetch里面去，可以减少一些请求
        var isExists = require( './util/is-package-exists' );
        var depDirs = [ require( 'path' ).join( process.cwd(), 'dep' ), depDir ];
        if ( isExists( data.name, data.version, depDirs ) ) {
            fs.unlinkSync( data.path );
            callback( null, data );
            return;
        }

        require( './import-from-file' )(
            data.path,
            importDir,

            /**
             * @param {null|*} err 正常情况为null，否则代表出错了.
             * @param {Object} pkg package.json的内容.
             */
            function( err, pkg ) {
                if ( fs.existsSync( data.path ) ) {
                    fs.unlinkSync( data.path );
                }
                callback( err, pkg );
            }
        );
    }

    require( './fetch' )( name, depDir, afterFetch );
};
