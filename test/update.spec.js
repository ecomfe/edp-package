/**
 * @file update.spec.js ~ 2014/07/30 12:37:57
 * @author leeight(liyubei@baidu.com)
 **/
var path = require('path');
var edp = require('edp-core');
var fs = require('fs');

var cli = require('../cli/update').cli;

var kProjectDir = path.join(__dirname, 'data', 'p3');

describe('update-cli', function(){
    var originalTimeout;

    beforeEach(function(){
        process.chdir(kProjectDir);

        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
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
        var opts = { force: true, f: true };
        cli.main(args, opts, function(error){
            expect(error).toBe(null);
            expect(fs.existsSync('module.conf')).toBe(true);
            expect(fs.existsSync('dep')).toBe(true);
            expect(fs.existsSync(path.join('dep', 'er', '3.1.0-beta.3', 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join('dep', 'er', '3.1.0-beta.3.md5'))).toBe(true);
            done();
        });
    });
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
