/**
 * @file api.spec.js ~ 2014/07/30 15:51:57
 * @author leeight(liyubei@baidu.com)
 * 测试对外暴露的api功能是否正确
 **/
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

var kAPIDir = path.join(__dirname, 'api-test-tmp-dir');

var edp = require('edp-core');

var api = require('../index');

describe('api', function(){
    var originalTimeout;

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        mkdirp.sync(kAPIDir);
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

        if (fs.existsSync('dep')) {
            edp.util.rmdir('dep');
        }

        if (fs.existsSync(kAPIDir)) {
            edp.util.rmdir(kAPIDir);
        }
    });

    it('importFromRegistry', function(done){
        api.importFromRegistry('my-test', null, function(error, pkg){
            expect(error).toBeNull();
            expect(pkg.name).toBe('my-test');
            expect(fs.existsSync(path.join(__dirname, 'dep', 'my-test'))).toBe(true);
            done();
        });
    });

    it('importFromRegistry with specific projectDir', function(done){
        api.importFromRegistry('my-test', kAPIDir, function(error, pkg){
            expect(error).toBeNull();
            expect(pkg.name).toBe('my-test');
            expect(fs.existsSync(path.join(kAPIDir, 'dep', 'my-test'))).toBe(true);
            done();
        });
    });

    it('importFromFile with default projectDir', function(done){
        api.importFromFile('my-test-1.0.6.tgz', null, function(error, pkg){
            expect(error).toBeNull();
            expect(pkg.name).toBe('my-test');
            expect(fs.existsSync(path.join(__dirname, 'dep', 'my-test'))).toBe(true);
            done();
        });
    });

    it('importFromFile with specific projectDir', function(done){
        api.importFromFile('my-test-1.0.6.tgz', kAPIDir, function(error, pkg){
            expect(error).toBeNull();
            expect(pkg.name).toBe('my-test');
            expect(fs.existsSync(path.join(kAPIDir, 'dep', 'my-test'))).toBe(true);
            done();
        });
    });
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
