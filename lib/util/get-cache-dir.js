

/**
 * registry cache目录名
 * 
 * @const
 * @type {string}
 */
var CACHE_DIR = '.edp-package-cache';

/**
 * 获取registry cache目录
 * 
 * @return {string} 
 */
module.exports = exports = function () {
    var parentDir = require( 'os' ).platform() === 'win32' 
            ? 'APPDATA'
            : 'HOME';
    return require( 'path' ).resolve( parentDir, CACHE_DIR );
};

// 初始化registry cache目录
require( 'mkdirp' ).sync( getCacheDir() );
