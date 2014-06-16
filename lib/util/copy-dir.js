/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * lib/util/copy-dir.js ~ 2014/05/10 20:26:09
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/
var fs = require( 'fs' );
var path = require( 'path' );

var edp = require( 'edp-core' );

/**
 * @param {string} from 源目录.
 * @param {string} to 目标目录.
 */
module.exports = exports = function( from, to ) {
    edp.util.scanDir( from, function( fullPath ) {
        var z = path.relative( from, fullPath );
        var target = path.join( to, z );
        if ( fs.existsSync( z ) ) {
            return;
        }
        require( 'mkdirp' ).sync( path.dirname( target ) );
        fs.writeFileSync( target, fs.readFileSync( fullPath ) );
    });
};




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
