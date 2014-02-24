/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * download.js ~ 2014/02/24 10:55:37
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 * 测试一下，减少对`request`的依赖
 **/
var http = require( 'http' );
var path = require( 'path' );
var fs = require( 'fs' );

var url = 'http://registry.edp.baidu.com/er/-/er-3.0.0.tgz';
var fullPath = path.join( __dirname, 'er-3.0.0.tgz' );

http.get( url, function( res ){
  var stream = fs.createWriteStream( fullPath );
  res.pipe( stream );
}).on( 'error', function( e ){
    console.log("Got error: " + e.message);
});




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
