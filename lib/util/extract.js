/**
 * @file 压缩包提取功能
 * @author errorrik[errorrik@gmail.com]
 */
var pkg = require('../pkg');

/**
 * 将压缩文件的提取目录从临时目录移动到目标目录
 *
 * @inner
 * @param {string} tempDir 提取目录
 * @param {string} target 目标目录
 */
function moveExtractToTarget( tempDir, target ) {
    var fs = require( 'fs' );
    var path = require( 'path' );
    if ( !fs.existsSync( tempDir ) ) {
        return;
    }

    var source = fs.readdirSync( tempDir )[ 0 ];
    if ( source ) {
        fs.renameSync(
            path.resolve( tempDir, source ),
            target
        );
    }

    fs.rmdirSync( tempDir );
}

/**
 * 提取tgz文件
 *
 * @param {string} tarball tgz文件名
 * @param {string} target 解压路径
 * @param {Function} callback 回调函数
 */
exports.tgz = function ( tarball, target, callback ) {
    var zlib = require( 'zlib' );
    var tar = require( 'tar' );
    var path = require( 'path' );
    var parentDir = path.resolve( target, '..' );

    require( 'mkdirp' ).sync( parentDir );
    var tmpDir = path.resolve( parentDir, pkg.getTempName() );

    require( 'fstream' )
        .Reader( {
            type: 'File',
            path: tarball
        } )
        .pipe( zlib.createGunzip() )
        .pipe( tar.Extract( { path: tmpDir } ) )
        .on(
            'end',
            function () {
                moveExtractToTarget( tmpDir, target );
                callback && callback();
            }
        );
};

/**
 * 提取zip文件
 *
 * @param {string} zipFile zip文件名
 * @param {string} target 解压路径
 * @param {Function} callback 回调函数
 */
exports.zip = function ( zipFile, target, callback ) {
    var path = require( 'path' );
    var parentDir = path.resolve( target, '..' );
    var tmpDir = path.resolve( parentDir, pkg.getTempName() );
    require( 'mkdirp' ).sync( parentDir );

    var admZip = new require( 'adm-zip' )( zipFile );

    admZip.extractAllTo( tmpDir );
    moveExtractToTarget( tmpDir, target );
    callback && callback();
};
