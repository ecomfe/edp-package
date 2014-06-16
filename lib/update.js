/**
 * @file 包更新功能
 * @author errorrik[errorrik@gmail.com]
 *         Ielgnaw[wuji0223@gmail.com]
 *         leeight[leeight@gmail.com]
 */
var fs = require( 'fs' );
var path = require( 'path' );
var semver = require( 'semver' );

var edp = require( 'edp-core' );


/**
 * 更新包
 *
 * @param {string} name 包名称
 * @param {string} importDir 导入目录
 * @param {Object} opts 配置，是否保留旧版本的包及是否需要confirm
 * @param {Function=} callback 回调函数
 */
module.exports = function ( name, importDir, opts, callback ) {
    callback = callback || new Function();

    // 命令行参数
    var deleteOlder = opts[ 'delete-older' ] || false;
    var force = opts[ 'force' ] || false;

    // 准备要更新的数据
    var importeds = null;
    try {
        importeds = require( './get-imported' )( importDir );
    }
    catch( ex ) {
        edp.log.warn( ex.toString() );
        return;
    }

    var pkgs = [];
    for( var key in importeds ) {
        var version = semver.maxSatisfying(
            Object.keys( importeds[ key ] ),
            '*'
        );
        if ( !name || ( name === key ) ) {
            pkgs.push( { name: key, version: version });
        }
    }

    if ( !pkgs.length ) {
        edp.log.warn( 'Not found the specified pkg(s).' );
        return;
    }

    /**
     * 临时存在导入package的目录
     * @type {string}
     */
    var kToDir = require( './util/get-temp-import-dir' )();
    require( 'async' ).eachSeries( pkgs, packageUpdate( force, kToDir ), function( err ){
        if ( err ) {
            throw err;
        }

        // 把kToDir/dep目录下面的内容拷贝过来
        var from = path.join( kToDir, 'dep' );
        var to = path.join( process.cwd(), 'dep' );

        if ( deleteOlder ) {
            // 删除旧的版本
            fs.readdirSync( from ).forEach(function( dir ){
                var target = path.join( to, dir );
                if ( fs.existsSync( target ) ) {
                    edp.util.rmdir( target );
                }
            });
        }

        // 拷贝数据
        require( './util/copy-dir' )( from, to );

        // 清理工作
        var cmd = edp.util.spawn( 'edp',
            [ 'project', 'updateLoaderConfig' ], { stdio: 'inherit' } );
        cmd.on( 'close', function( code ){
            // 删除ImportDir
            edp.util.rmdir( kToDir );
            callback();
        });
    });
};

/**
 * @param {{name:string,version:string}} pkg package的名字和版本.
 * @param {function} done 执行完毕之后的回调函数.
 */
function packageUpdate( force, kToDir ) {
    var targetDir = path.join( kToDir, 'dep' );
    var registry = require( './util/get-registry' )();

    function fetch( pkg, version, done ) {
        require( './fetch' )( pkg.name + '@' + version, targetDir, function( err, data ){
            if ( err ) {
                cleanup( err );
                return;
            }

            function cleanup() {
                if ( fs.existsSync( data.path ) ) {
                    fs.unlinkSync( data.path );
                }
                done.apply( null, arguments );
            }


            if ( force ) {
                doUpdate( data, targetDir, cleanup );
                return;
            }

            var msg = require( 'util' ).format( 'Upgrade %s %s → %s [y/n]: ',
                pkg.name, pkg.version, version );
            edp.rl.prompt( msg, function( answer ){
                if ( answer === 'y' || answer === 'Y' ) {
                    // 确认了
                    doUpdate( data, targetDir, cleanup );
                }
                else {
                    // Cancel了
                    cleanup();
                }
            } );
        } );
    }

    return function( pkg, done ) {
        registry.get( pkg.name, function( err, data ){
            if ( err ) {
                done( err );
                return;
            }

            // 当前最新的版本
            var current = pkg.version;

            // 服务器上最新的版本
            var version = semver.maxSatisfying( Object.keys( data.versions ), '*' );

            if ( !semver.gt( version, current ) ) {
                // 没有符合要求的版本，直接跳过
                done();
                return;
            }

            fetch( pkg, version, done );
        } );
    }
}

/**
 * @param {Object} data 下载的package信息.
 * @param {string} targetDir 导入到的目标目录.
 * @param {function} done 结束之后的回调函数.
 */
function doUpdate( data, targetDir, done ) {
    require( './import-from-file' )(
        data.path,
        targetDir,

        /**
          * @param {null|*} err 正常情况为null，否则代表出错了.
          * @param {Object} pkg package.json的内容.
          */
        function( err, pkg ) {
            if ( err ) {
                done( err );
                return;
            }

            done( null, pkg );
        }
    );
}
