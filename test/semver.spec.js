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

var semver = require('../lib/util/semver');

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
        var ver = semver.maxSatisfying(versions, version);
        expect(ver).toBe('3.1.0-alpha.6');
    });
    it('maxSatisfying2', function(){
        var versions = [
            "3.0.0", "3.0.1", "3.0.2", "3.0.3",
            "3.1.0-alpha.1", "3.1.0-alpha.2", "3.1.0-alpha.3", "3.1.0-alpha.4",
            "3.1.0-alpha.5", "3.1.0-alpha.6", "3.1.0-alpha.7", "3.1.0-alpha.8",
            "3.1.0-beta.1", "3.1.0-beta.2", "3.1.0-beta.3", "3.1.0-beta.4",
            "3.1.0-rc.1", "3.1.0-rc.2", "3.1.0-rc.3", "3.1.0-rc.4",
            "3.1.0",
            "3.2.0-alpha.1", "3.2.0-alpha.2", "3.2.0-alpha.3", "3.2.0-alpha.4",
            "3.2.0-beta.1", "3.2.0-beta.2", "3.2.0-beta.3", "3.2.0-beta.4",
            "3.3.0-alpha.1", "3.3.0-alpha.2", "3.3.0-alpha.3", "3.3.0-alpha.4",
            "3.9.0-alpha.1"
        ];

        expect(semver.maxSatisfying2(versions, '3.0')).toBe('3.0.3');
        expect(semver.maxSatisfying2(versions, '3.0.x')).toBe('3.0.3');

        // 3.1, 3.1.x, 3.1.x@rc 最终都会归结为 3.1.x@rc
        expect(semver.maxSatisfying2(versions, '3.1')).toBe('3.1.0');
        expect(semver.maxSatisfying2(versions, '3.1.x')).toBe('3.1.0');
        expect(semver.maxSatisfying2(versions, '3.1.x', 'rc')).toBe('3.1.0');

        // 3.1.x@alpha
        expect(semver.maxSatisfying2(versions, '3.1.x', 'alpha')).toBe('3.1.0');

        // 3.1.x@beta
        expect(semver.maxSatisfying2(versions, '3.1.x', 'beta')).toBe('3.1.0');

        // 3.2只有alpha和beta的版本
        expect(semver.maxSatisfying2(versions, '3.2')).toBe(null);
        expect(semver.maxSatisfying2(versions, '3.2.x')).toBe(null);

        expect(semver.maxSatisfying2(versions, '3.2', '*')).toBe('3.2.0-beta.4');
        expect(semver.maxSatisfying2(versions, '3.2.x', 'latest')).toBe('3.2.0-beta.4');

        expect(semver.maxSatisfying2(versions, '3.2', 'alpha')).toBe('3.2.0-beta.4');
        expect(semver.maxSatisfying2(versions, '3.2', 'beta')).toBe('3.2.0-beta.4');

        // 3.x有最新的3.9-alpha版本
        expect(semver.maxSatisfying2(versions, '3.x', 'alpha')).toBe('3.9.0-alpha.1');

        expect(semver.maxSatisfying2(versions, '3.x', 'beta')).toBe('3.2.0-beta.4');

        // 如果输入的是确定的版本号，那么就用这个就够了
        expect(semver.maxSatisfying2(versions, '3.1.0-alpha.3')).toBe('3.1.0-alpha.3');
        expect(semver.maxSatisfying2(versions, '3.1.0-alpha.3', 'rc')).toBe('3.1.0-alpha.3');
        expect(semver.maxSatisfying2(versions, '3.1.0-alpha.3', 'beta')).toBe('3.1.0-alpha.3');
        expect(semver.maxSatisfying2(versions, '3.1.0-alpha.3', 'alpha')).toBe('3.1.0-alpha.3');
    });
});




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
