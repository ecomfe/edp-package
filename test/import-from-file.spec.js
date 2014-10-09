/**
 * @file import-from-file.spec.js ~ 2014/07/29 11:23:08
 * @author leeight(liyubei@baidu.com)
 **/
var fs = require('fs');
var path = require('path');
var fetch = require('../lib/fetch');
var factory = require('../lib/context');
var kToDir = path.join(__dirname, 'tmp');
var mkdirp = require('mkdirp');
var edp = require('edp-core');

var importapi = require('../lib/import-from-file');

describe('import-from-file', function(){
    var originalTimeout;
    var temporaryImportDir;

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

        temporaryImportDir = path.join(kToDir, 'dummy-project');
        mkdirp.sync(path.join(temporaryImportDir, '.edpproj'));
        mkdirp.sync(path.join(temporaryImportDir, 'dep'));
        fs.writeFileSync(path.join(kToDir, 'no-such.tgz'), 'x');
    });

    it('error', function(done){
        var context = factory.create(temporaryImportDir, temporaryImportDir);

        importapi(context, 'tmp/no-such.tgz', function(e1){
            expect(e1).not.toBe(null);
            done();
        });
    });

    it('default v1', function(done){
        fetch('my-test@1.0.8', kToDir, function(e1, data){
            expect(e1).toBe(null);
            expect(fs.existsSync(data.path)).toBe(true);

            var context = factory.create(temporaryImportDir, temporaryImportDir);

            importapi(context, data.path, function(e2, pkg){
                expect(e2).toBe(null);
                expect(pkg).not.toBe(null);
                expect(pkg.name).toBe('my-test');
                expect(pkg.version).toBe('1.0.8');
                expect(fs.existsSync(path.join(temporaryImportDir,
                    'dep', 'my-test', '1.0.8'))).toBe(true);
                expect(fs.existsSync(path.join(temporaryImportDir,
                    'dep', 'my-test', '1.0.8.md5'))).toBe(true);
                done();
            });
        });
    });

    it('default v2', function(done){
        fetch('my-test@1.0.8', kToDir, function(e1, data){
            expect(e1).toBe(null);
            expect(fs.existsSync(data.path)).toBe(true);

            var config = {
                edp: {
                    dependencies: {},
                    layout: 'v2'
                }
            };
            fs.writeFileSync(
                path.join(temporaryImportDir, 'package.json'),
                JSON.stringify(config, null, 4),
                'utf-8'
            );
            var context = factory.create(temporaryImportDir, temporaryImportDir);

            importapi(context, data.path, function(e2, pkg){
                expect(e2).toBe(null);
                expect(pkg).not.toBe(null);
                expect(pkg.name).toBe('my-test');
                expect(pkg.version).toBe('1.0.8');
                expect(fs.existsSync(path.join(temporaryImportDir,
                    'dep', 'my-test'))).toBe(true);
                expect(fs.existsSync(path.join(temporaryImportDir,
                    'dep', 'my-test.md5'))).toBe(true);
                done();
            });
        });
    });

    it('er', function(done){
        fetch('er@3.1.0-beta.4', kToDir, function(e1, data){
            expect(e1).toBe(null);
            expect(fs.existsSync(data.path)).toBe(true);

            var config = {
                edp: {
                    dependencies: {},
                    layout: 'v2'
                }
            };
            fs.writeFileSync(
                path.join(temporaryImportDir, 'package.json'),
                JSON.stringify(config, null, 4),
                'utf-8'
            );
            var context = factory.create(temporaryImportDir, temporaryImportDir);
            importapi(context, data.path, function(e2, pkg){
                expect(e2).toBe(null);
                expect(pkg).not.toBe(null);
                expect(pkg.name).toBe('er');
                expect(pkg.version).toBe('3.1.0-beta.4');
                expect(fs.existsSync(path.join(temporaryImportDir,
                    'dep', 'er', 'package.json'))).toBe(true);
                expect(fs.existsSync(path.join(temporaryImportDir,
                    'dep', 'er.md5'))).toBe(true);
                expect(fs.existsSync(path.join(temporaryImportDir, 'dep', 'etpl'))).toBe(true);
                expect(fs.existsSync(path.join(temporaryImportDir, 'dep', 'mini-event'))).toBe(true);

                expect(context.hasPackage('er', '3.1.0-beta.4')).toBe(true);
                expect(context.hasPackage('mini-event', '1.0.0')).toBe(true);
                expect(context.hasPackage('etpl', '2.1.2')).toBe(true);

                done();
            });
        });
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

        if (fs.existsSync(temporaryImportDir)) {
            edp.util.rmdir(temporaryImportDir);
        }
        fs.unlinkSync(path.join(kToDir, 'no-such.tgz'));
    });
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
