/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * lib/util/get-temp-import-dir.js ~ 2014/05/11 19:41:54
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/

/**
 * 获取import和update的时候，临时存在package的目录
 * @return {string}
 */
module.exports = exports = function() {
    var os = require( 'os' );
    var path = require( 'path' );
    var mkdir = require( 'mkdirp' );

    var name = require( './get-temp-name' )();
    var dir = path.join( os.tmpdir(), name );
    mkdir.sync( path.join( dir, '.edpproj' ) );
    mkdir.sync( path.join( dir, 'dep' ) );

    return dir;
}





















/* vim: set ts=4 sw=4 sts=4 tw=100: */
