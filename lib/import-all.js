/**
 * @file 循环导入多个包，全部完成后拷贝到dep目录下。
 * @author yankun[vcfg.code@hotmail.com]
 */

/**
 * 从本地文件导入包
 *
 * @param {Array} packages 包名称数组
 * @param {Object=} opts 导入命令的参数
 */
module.exports = function ( packages, opts ) {
    var importDir = require( './util/get-cache-import-dir' )();
    var depDir = require( './util/get-dependencies-dir' )( importDir );
    var async = require( 'async' );
    var tasks = [];

    packages.forEach( function ( pkg ) {
        tasks.push( function( callback ) {
            importPackage( pkg, importDir,  function () {
                callback( null, pkg );
            } );
        } );
    } );
    async.series(
        tasks,
        function( err, results ) {
            require( './util/copy-to-dep' )( depDir )();
        }
    );
};

function importPackage( name, tempDir, callback ) {
    var path = require( 'path' );
    var pkg = require( '../index' );
    var fs = require( 'fs' );
    var file = path.resolve( process.cwd(), name );

    if (
        /\.(gz|tgz|zip)$/.test( name )
        && fs.existsSync( file )
    ) {
        pkg.importFromFile( file, tempDir, callback );
    }
    else if ( path.basename( file ) == 'package.json' ) {
        var options = {
                older: opts[ 'older' ],
                saveDev: opts[ 'save-dev' ],
                tempDir: tempDir,
                callback: callback
            };
        pkg.importFromPackage( file , options );
    }
    else {
        pkg.importFromRegistry( name, tempDir, callback );
    }
}