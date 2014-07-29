/**
 * @file 包移除功能
 * @author errorrik[errorrik@gmail.com]
 */
var edp = require( 'edp-core' );

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
    callback = callback || function(){};
    var depDir = require( './util/get-dependencies-dir' )( importDir );

    // 分析移除包的名称与版本
    var segs = name.split( '@' );
    name = segs[ 0 ];
    var version = segs[ 1 ];

    var fs = require( 'fs' );
    var path = require( 'path' );

    // 扫瞄当前包含的版本，并移除
    var pkgDir = path.join( depDir, name );
    var pkgVersions = fs.readdirSync( pkgDir );
    var pkgVersionLen = pkgVersions.length;
    pkgVersions.forEach(
        function ( dir ) {
            if ( !version || dir === version ) {
                edp.util.rmdir( path.join( pkgDir, dir ) );
                // 同时把.md5文件删了
                var md5File = path.resolve(pkgDir, dir + '.md5');
                if (fs.existsSync(md5File)) {
                    fs.unlinkSync(md5File);
                }
                pkgVersionLen--;
            }
        }
    );

    // 如果未指定移除版本号，或已经删除所有存在版本，则移除整个包
    if ( !version || pkgVersionLen === 0 ) {
        edp.util.rmdir( pkgDir );
    }

    callback();
};
