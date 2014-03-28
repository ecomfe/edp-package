/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 **************************************************************************/



/**
 * semver.spec.js ~ 2014/02/24 11:21:59
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$
 * @description
 * 测试一下调用semver的的地方
 **/

var semver = require( 'semver' );

describe('semver', function(){
    it('default', function(){
        // er的版本号
        var versions = [
            '3.0.0', '3.0.1',
            '3.0.2', '3.0.3',
            '3.1.0-alpha.1','3.1.0-alpha.2',
            '3.1.0-alpha.3','3.1.0-alpha.4',
            '3.1.0-alpha.5','3.1.0-alpha.6'
        ];

        // 命令行中指定的版本号
        // edp import er@3.0.0
        var version = '*';
        var ver = semver.maxSatisfying( versions, version );
        expect( ver ).toBe( '3.1.0-alpha.6' );
    });
});




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
