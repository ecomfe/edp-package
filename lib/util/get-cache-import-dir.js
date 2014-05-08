/**
 * @file npm包缓存目录
 * @author errorrik[errorrik@gmail.com]
 */

var cache = require('./get-cache-dir')();
var getTempName = require('./get-temp-name');
var md = require( 'mkdirp' );

/**
 * 获取registry cache目录
 * 
 * @return {string} 返回一个执行导入操作的临时目录
 */
module.exports = function () {
    var temp = require( 'path' ).join( cache, getTempName() );
    md.sync( temp );
    return temp;
};