/**
 * @file 添加依赖包声明
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 添加依赖包声明
 * 
 * @inner
 * @param {string} name 依赖包名称
 * @param {string} version 依赖包版本
 * @param {string=} importDir 导入目录
 */
module.exports = function ( name, version, importDir ) {
    importDir = importDir || process.cwd();
    var depDir = require( './util/get-dependencies-dir' )( importDir );

    var fs = require( 'fs' );
    var path = require( 'path' );
    var data;

    // 目录下存在package.json时，以该文件的dependencies为准
    var pkgFile = path.resolve( depDir, '..', 'package.json' );
    if ( fs.existsSync( pkgFile ) ) {
        data = JSON.parse( fs.readFileSync( pkgFile, 'UTF-8' ) );
        addDependencyDefine( data, name, version );
        fs.writeFileSync( pkgFile, JSON.stringify( data, null, 4 ), 'UTF-8' );
        return;
    }

    // 否则，如果目录是一个项目目录内，则更新项目的metadata信息
    var project = require( 'edp-project' );
    var projectInfo = project.getInfo( importDir );
    if ( projectInfo ) {
        data = project.metadata.get( projectInfo );
        addDependencyDefine( data, name, version );
        project.metadata.set( projectInfo, data );
    }
};

/**
 * 添加依赖定义
 * 
 * @inner
 * @param {Object} data 依赖信息数据载体对象
 * @param {string} name 依赖包名称
 * @param {string} version 依赖包版本号
 */
function addDependencyDefine( data, name, version ) {
    var depData = data.dependencies;
    if ( !depData ) {
        depData = data.dependencies = {};
    }

    if ( !depData[ name ] ) {
        depData[ name ] = version;
    }
}
