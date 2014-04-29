/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * get-manifest.spec.js ~ 2014/04/29 20:49:31
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/
var fs = require( 'fs' );
var path = require( 'path' );
var Project = path.join( __dirname, 'data', 'dummy-project' );
var GetManifest = require( '../lib/util/get-manifest' );

describe( 'get-manifest', function(){
    it( 'default', function(){
        var depDir = path.join( Project, 'dep' );
        var manifest = GetManifest( depDir );
        expect( manifest ).toEqual( JSON.parse( fs.readFileSync(
            path.join( depDir, 'packages.manifest' ), 'utf-8' ) ) );
    });
});




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
