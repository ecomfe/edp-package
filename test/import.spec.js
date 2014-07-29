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
    beforeEach(function(){
        process.chdir(kProjectDir);
    });

    afterEach(function(){
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
        var opts = {};
        cli.main(args, opts, function(error){
            expect(error).toBe(null);
            expect(fs.existsSync('module.conf')).toBe(true);
            expect(fs.existsSync('dep')).toBe(true);
            done();
        });
    });

    it('import specific package', function(done){
        var args = [
            'my-test',
            'my-test@1.0.7',
            path.join(__dirname, 'my-test-1.0.6.tgz'),
            'http://edp-registry.baidu.com/er/-/er-3.1.0-beta.4.tgz'
        ];
        var opts = {};
        cli.main(args, opts, function(error){
            expect(error).toBe(null);
            expect(fs.existsSync('module.conf')).toBe(true);
            expect(fs.existsSync(path.join('dep', 'my-test', '1.0.8', 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join('dep', 'my-test', '1.0.7', 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join('dep', 'my-test', '1.0.6', 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join('dep', 'er', '3.1.0-beta.4', 'package.json'))).toBe(true);
            done();
        });
    });
});









/* vim: set ts=4 sw=4 sts=4 tw=120: */
