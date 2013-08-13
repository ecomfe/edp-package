/**
 * @file 包移除功能
 * @author errorrik[errorrik@gmail.com]
 */


/**
 * 移除包
 * 不带@version信息时，移除整个包
 * 
 * @param {string=} name 包名称
 * @param {string=} importDir 导入目录
 * @param {Function=} callback 回调函数
 */
module.exports = function ( name, importDir, callback ) {
    importDir = importDir || process.cwd();
    callback = callback || new Function();
    var depDir = require( './util/get-dependencies-dir' )( importDir );

    // 分析移除包的名称与版本
    var segs = name.split( '@' );
    name = segs[ 0 ];
    var version = segs[ 1 ];

    var fs = require( 'fs' );
    var path = require( 'path' );
    var rmdir = require( './util/rmdir' );
    var removeFromManifest = require( './util/remove-from-manifest' );

    // 扫瞄当前包含的版本，并移除
    var pkgDir = path.join( depDir, name );
    var pkgVersions = fs.readdirSync( pkgDir );
    var pkgVersionLen = pkgVersions.length;
    pkgVersions.forEach( 
        function ( dir ) {
            if ( !version || dir == version ) {
                rmdir( path.join( pkgDir, dir ) );
                removeFromManifest( 
                    { name: name, version: dir }, 
                    depDir 
                );
                pkgVersionLen--;
            }
        }
    );

    // 如果未指定移除版本号，或已经删除所有存在版本，则移除整个包
    if ( !version || pkgVersionLen === 0 ) {
        rmdir( pkgDir );
        removeFromManifest( 
            { name: name }, 
            depDir 
        );
    }

    callback();
};
