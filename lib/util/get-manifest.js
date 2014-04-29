/**
 * @file 获取已导入包清单功能
 * @author errorrik[errorrik@gmail.com]
 */
var fs = require( 'fs' );
var path = require( 'path' );

/**
 * 简单的过滤一下是否是package
 * @param {string} item 文件路径
 * @return {boolean}
 */
function filter( item ) {
    var stat = fs.statSync( item );
    if ( !stat.isDirectory() ) {
        return false;
    }

    var isPackage = false;
    // 检查item下面的任何一个目录是否存在package.json
    fs.readdirSync( item ).filter(function( x ){
        return fs.statSync( path.join( item, x ) ).isDirectory();
    }).some(function( x ){
        if ( fs.existsSync( path.join( item, x, 'package.json' ) ) ) {
            isPackage = true;

            // break loop
            return true;
        }
    });

    return isPackage;
}

function isDirectory( p ) {
    return function ( x ) {
        return fs.statSync( path.join( p, x ) ).isDirectory()
    }
}

/**
 * 获取当前已经导入的包列表
 * 
 * @inner
 * @param {string} depDir 当前目录
 * @return {Object}
 */
module.exports = function ( depDir ) {
    var manifest = {};
    fs.readdirSync( depDir ).filter( function( x ){
        return filter( path.join( depDir, x ) );
    }).forEach( check );

    function check( item ) {
        var package = {};
        var dir = path.join( depDir, item );

        fs.readdirSync( dir ).filter( function( x ){
            return fs.statSync( path.join( dir, x ) ).isDirectory();
        } ).forEach( function( x ){
            var target = path.join( dir, x );
            var pkg = require( './get-package-declare' )( target );
            if ( pkg ) {
                package[ pkg.version ] = pkg;
            }
        });

        if ( Object.keys( package ).length ) {
            manifest[ item ] = package;
        }
    }

    return manifest;
};
