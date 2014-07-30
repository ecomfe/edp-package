/**
 * @file fetch.spec.js ~ 2014/07/28 21:39:47
 * @author leeight(liyubei@baidu.com)
 **/
var fs = require('fs');
var path = require('path');
var fetch = require('../lib/fetch');
var kToDir = path.join(__dirname, 'tmp');

describe('fetch', function(){
    var originalTimeout;

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it('default', function(done){
        // my-test的内容比较少，不容易超时
        fetch('my-test@1.0.8', kToDir, function(){
            expect(fs.existsSync(path.join(kToDir,
                'my-test-1.0.8.tgz'))).toBe(true);
            fetch('my-test@1.0.7', kToDir, function(){
                expect(fs.existsSync(path.join(kToDir,
                    'my-test-1.0.7.tgz'))).toBe(true);
                done();
            });
        });
    });

    it('default with dist-tags', function(done){
        fetch('my-test@latest', kToDir, function(){
            expect(fs.existsSync(path.join(kToDir,
                'my-test-1.0.8.tgz'))).toBe(true);
            fetch('my-test@no-such-tag', kToDir, function(error){
                expect(error).not.toBe(null);
                done();
            });
        });
    });

    it('er with specific version', function(done){
        fetch('er@3.0.0', kToDir, function(){
            expect(fs.existsSync(path.join(kToDir,
                'er-3.0.0.tgz'))).toBe(true);
            done();
        });
    });

    it('er', function(done){
        fetch('er@3.1.0-beta.4', kToDir, function(){
            expect(fs.existsSync(path.join(kToDir,
                'er-3.1.0-beta.4.tgz'))).toBe(true);
            fetch('er@3.1.0-beta.4', kToDir, function(){
                expect(fs.existsSync(path.join(kToDir,
                    'er-3.1.0-beta.4.tgz'))).toBe(true);
                done();
            });
        });
    });

    it('no-such-package', function(done){
        fetch('no-such-package', kToDir, function(error){
            expect(error).not.toBeNull();
            done();
        });
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
