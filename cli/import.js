/**
 * @file 项目导入依赖包模块的命令行执行
 * @author errorrik[errorrik@gmail.com]
 */
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
 */
var TemporaryImportDir = null;
function getTemporaryImportDir() {
    if ( TemporaryImportDir ) {
        return TemporaryImportDir;
    }

    var path = require( 'path' );
    var os = require( 'os' );
    var mkdir = require( 'mkdirp' );

    var name = require( '../lib/util/get-temp-name' )();
    TemporaryImportDir = path.join( os.tmpdir(), name );
    mkdir.sync( path.join( TemporaryImportDir, '.edpproj' ) );
    mkdir.sync( path.join( TemporaryImportDir, 'dep' ) );

    return TemporaryImportDir;
}

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    if ( !args.length ) {
        console.error( cli.usage );
        process.exit( 0 );
    }

    require( 'async' ).eachLimit( args, 1,
        importPackage, refreshProjectConfiguration );
}

/**
 * 导入package成功之后，更新项目的配置信息
 * 采用的方式是执行 edp project updateLoaderConfig
 * 这样子就可以避免edp-package对edp-project的依赖了
 */
function refreshProjectConfiguration( err ) {
    if ( err ) throw err;

    var cmd = edp.util.spawn( 'edp',
        [ 'project', 'updateLoaderConfig' ], { stdio: 'inherit' } );
    cmd.on( 'close', function( code ){
        // IGNORE
    });

    // 删除ImportDir
    // edp.util.rmdir( getImportDir() );
}

/**
 * 导入一个package，结束之后执行callback
 * @param {string} name 要导入的package的名字.
 * @param {function} callback 结束之后回调函数.
 */
function importPackage( name, callback ) {
    var path = require( 'path' );
    var pkg = require( '../index' );
    var fs = require( 'fs' );
    var file = path.resolve( process.cwd(), name );
    var importDir = getTemporaryImportDir();

    if (
        /\.(gz|tgz|zip)$/.test( name )
        && fs.existsSync( file )
    ) {
        pkg.importFromFile( file, importDir, callback );
    }
    /*
    else if ( path.basename( file ) == 'package.json' ) {
        var options = {
            older: opts[ 'older' ],
            saveDev: opts[ 'save-dev' ]
        };
        def = pkg.importFromPackage( file, options );
    }
    */
    else {
        pkg.importFromRegistry( name, importDir, callback );
    }
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
