/**
 * @file 判断包是否已导入
 * @author errorrik[errorrik@gmail.com]
 */
var path = require( 'path' );
var fs = require( 'fs' );

/**
 * 判断包在当下是否存在
 *
 * @param {string} name 包名称
 * @param {string} version 包版本
 * @param {Array.<string>} dirs 需要检查的dep目录，一个是临时的，一个是项目的.
 * @return {boolean}
 */
module.exports = function ( name, version, dirs ) {
    // version已经是具体的版本了，不需要semver了吧
    return dirs.some(function( dir ){
        return fs.existsSync( path.join( dir, name, version ) );
    });
};
