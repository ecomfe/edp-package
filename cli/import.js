/**
 * @file 项目导入依赖包模块的命令行执行
 * @author errorrik[errorrik@gmail.com]
 */
var fs = require( 'fs' );
var path = require( 'path' );

var edp = require( 'edp-core' );

/**
 * 命令行配置项
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '导入包';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = [ 'older', 'save-dev' ];

/**
 * 临时创建的目录，程序退出的时候清除之
 * @type {string}
 */
var kTemporaryImportDir = require( '../lib/util/get-temp-import-dir' )();

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    if ( !args.length ) {
        var getDependencies = require( '../lib/get-defined-dependencies' );
        var dependencies = getDependencies();
        if ( dependencies ) {
            require( 'async' ).eachSeries( Object.keys( dependencies ),
                importPackage, refreshProjectConfiguration );
            return;
        }
        else {
            console.log( 'See `edp import --help`' );
            process.exit( 0 );
        }
    }

    require( 'async' ).eachSeries( args,
        importPackage, refreshProjectConfiguration );
};

/**
 * 导入package成功之后，更新项目的配置信息
 * 采用的方式是执行 edp project updateLoaderConfig
 * 这样子就可以避免edp-package对edp-project的依赖了
 */
function refreshProjectConfiguration( err ) {
    if ( err ) {
        throw err;
    }

    // 把TemporaryImportDir/dep目录下面的内容拷贝过来
    var from = path.join( kTemporaryImportDir, 'dep' );
    var to = path.join( process.cwd(), 'dep' );
    require( '../lib/util/copy-dir' )( from, to );

    var cmd = edp.util.spawn( 'edp',
        [ 'project', 'updateLoaderConfig' ], { stdio: 'inherit' } );
    cmd.on( 'close', function( code ){
        // 删除ImportDir
        edp.util.rmdir( kTemporaryImportDir );
    });
}

/**
 * 导入一个package，结束之后执行callback
 * @param {string} name 要导入的package的名字.
 * @param {function} callback 结束之后回调函数.
 */
function importPackage( name, callback ) {
    var pkg = require( '../index' );
    var file = path.resolve( process.cwd(), name );
    var importDir = kTemporaryImportDir;

    if (
        /\.(gz|tgz|zip)$/.test( name )
        && fs.existsSync( file )
    ) {
        pkg.importFromFile( file, importDir, callback );
    }
    else if ( /^https?:\/\/(.+)/.test( name ) ) {
        pkg.importFromRemote( name, importDir, callback );
    }
    else {
        pkg.importFromRegistry( name, importDir, callback );
    }
}

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
