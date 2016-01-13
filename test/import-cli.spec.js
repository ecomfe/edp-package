/**
 * @file import.spec.js ~ 2014/07/29 20:37:27
 * @author leeight(liyubei@baidu.com)
 **/
var path = require('path');
var edp = require('edp-core');
var fs = require('fs');

var cli = require('../cli/import').cli;

var kProjectDir = path.join(__dirname, 'data', 'p3');

describe('import-cli', function(){
    var originalTimeout;

    beforeEach(function(){
        process.chdir(kProjectDir);

        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    });

    afterEach(function(){
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

        if (fs.existsSync('dep')) {
            edp.util.rmdir('dep');
        }

        if (fs.existsSync('module.conf')) {
            fs.unlinkSync('module.conf');
        }

        process.chdir(__dirname);
    });

    it('run without any arguments', function(done){
        var args = [];
        var opts = {force: true};
        cli.main(args, opts, function(error){
            expect(error).toBe(null);
            expect(fs.existsSync('module.conf')).toBe(true);
            expect(fs.existsSync('dep')).toBe(true);
            done();
        });
    });

    it('import specific package', function(done){
        // 同时引入my-test的三个版本 这三个版本都会被import过来，
        // 如果这三个版本是分三次引入，则不一定全都存在
        var args = [
            'my-test',
            'my-test@1.0.7',
            path.join(__dirname, 'my-test-1.0.6.tgz'),
            'http://edp-registry.baidu.com/er/-/er-3.1.0-beta.4.tgz'
        ];
        var opts = {force: true};
        cli.main(args, opts, function(error){
            expect(error).toBe(null);
            expect(fs.existsSync('module.conf')).toBe(true);
            expect(fs.existsSync(path.join('dep', 'my-test', '1.0.9-rc.8', 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join('dep', 'my-test', '1.0.7', 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join('dep', 'my-test', '1.0.6', 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join('dep', 'er', '3.1.0-beta.4', 'package.json'))).toBe(true);
            done();
        });
    });
});









/* vim: set ts=4 sw=4 sts=4 tw=120: */
