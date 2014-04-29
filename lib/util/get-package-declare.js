/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * lib/util/get-package-declare.js ~ 2014/04/29 21:26:15
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/

/**
 * 获取可以出现在module.conf或者require.config里面的package的配置信息
 * @param {string} dir 一个package的目录地址.
 * @return {Object|null}
 */
module.exports = exports = function( dir ) {
    var pkgData = require( './get-package-info' )( dir );
    if ( !pkgData ) {
        return null;
    }

    var pkgName = pkgData.name;
    var pkgVersion = pkgData.version;

    // edp import jquery 时，module.conf生成的配置如下
    // {
    //      "name": "jquery",
    //      "location": "dep/jquery/1.9.1/src",
    //      "main": "jquery.min.js"
    // }
    // 这时如果用edp.esl.getModuleFile('jquery', moduleConfPath)
    // 得到的是 ${path}/dep/jquery/1.9.1/src/jquery.min.js.js
    // 因为jquery的package.json配置是
    // {
    //     "name": "jquery",
    //     "version": "1.9.1",
    //     "main": "./src/jquery.min.js"
    // }
    // 因此这里把main后缀的.js给去掉
    var main = (pkgData.main || 'main').replace(/\.js$/, '');
    var pkg = {
        name: pkgName,
        version: pkgVersion
    };
    if ( main ) {
        pkg.main = main;
    }

    return pkg;
};




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
