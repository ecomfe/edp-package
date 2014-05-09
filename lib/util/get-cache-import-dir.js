/**
 * @file npm包缓存目录
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 获取registry cache目录
 * 
 * @return {string} 返回一个执行导入操作的临时目录
 */
module.exports = function () {
    var cacheDir = require( './get-cache-dir' )();
    var name = require( './get-temp-name' )();
    var dir = require( 'path' ).join( cacheDir, name );
    require( 'mkdirp' ).sync( dir );
    return dir;
};