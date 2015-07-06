/**
 * @file import-from-remote.spec.js ~ 2014/07/29 15:21:10
 * @author leeight(liyubei@baidu.com)
 **/
var fs = require('fs');
var path = require('path');
var factory = require('../lib/context');
var kToDir = path.join(__dirname, 'tmp');
var mkdirp = require('mkdirp');
var edp = require('edp-core');

var importapi = require('../lib/import-from-remote');

describe('import-from-remote', function(){
    var originalTimeout;
    var temporaryImportDir;
    var projectDir;

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        temporaryImportDir = path.join(kToDir, 'dummy-project');
        mkdirp.sync(path.join(temporaryImportDir, '.edpproj'));
        mkdirp.sync(path.join(temporaryImportDir, 'dep'));

        projectDir = path.join(kToDir, 'project-dir');
        mkdirp.sync(path.join(projectDir, '.edpproj'));
        mkdirp.sync(path.join(projectDir, 'dep'));
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

        if (fs.existsSync(temporaryImportDir)) {
            edp.util.rmdir(temporaryImportDir);
        }
        if (fs.existsSync(projectDir)) {
            edp.util.rmdir(projectDir);
        }
    });

    it('default v1', function(done){
        var context = factory.create(temporaryImportDir, temporaryImportDir);
        var url = 'http://edp-registry.baidu.com/er/-/er-3.1.0-beta.4.tgz';

        importapi(context, url, function(e2, pkg){
            expect(e2).toBe(null);
            expect(pkg).not.toBe(null);
            expect(pkg.name).toBe('er');
            expect(pkg.version).toBe('3.1.0-beta.4');
            expect(fs.existsSync(path.join(temporaryImportDir,
                'dep', 'er', '3.1.0-beta.4', 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join(temporaryImportDir,
                'dep', 'er', '3.1.0-beta.4.md5'))).toBe(true);
            expect(fs.existsSync(path.join(temporaryImportDir, 'dep', 'etpl'))).toBe(true);
            expect(fs.existsSync(path.join(temporaryImportDir, 'dep', 'mini-event'))).toBe(true);

            expect(context.hasPackage('er', '3.1.0-beta.4')).toBe(true);
            expect(context.hasPackage('mini-event', '1.0.2')).toBe(true);
            expect(context.hasPackage('etpl', '3.0.1')).toBe(true);

            done();
        });
    });

    it('default v2', function(done){
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
        var url = 'http://edp-registry.baidu.com/er/-/er-3.1.0-beta.4.tgz';

        importapi(context, url, function(e2, pkg){
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
            expect(context.hasPackage('mini-event', '1.0.2')).toBe(true);
            expect(context.hasPackage('etpl', '3.0.1')).toBe(true);

            done();
        });
    });

    it('case2', function(done){
        var context = factory.create(temporaryImportDir, projectDir);
        var url = 'http://edp-registry.baidu.com/er/-/er-3.1.0-beta.4.tgz';

        importapi(context, url, function(e2, pkg){
            expect(e2).toBe(null);
            expect(pkg).not.toBe(null);
            expect(pkg.name).toBe('er');
            expect(pkg.version).toBe('3.1.0-beta.4');

            expect(context.hasPackage('er', '3.1.0-beta.4')).toBe(true);
            expect(context.hasPackage('mini-event', '1.0.2')).toBe(true);
            expect(context.hasPackage('etpl', '3.0.1')).toBe(true);

            // 导入成功之后，应该放到projectDir下面?
            // 但是是等全部结束之后才会拷贝到projectDir下面
            expect(fs.existsSync(path.join(temporaryImportDir,
                'dep', 'er', '3.1.0-beta.4', 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join(projectDir,
                'dep', 'er', '3.1.0-beta.4', 'package.json'))).toBe(false);

            expect(fs.existsSync(path.join(temporaryImportDir,
                'dep', 'er', '3.1.0-beta.4.md5'))).toBe(true);
            expect(fs.existsSync(path.join(projectDir,
                'dep', 'er', '3.1.0-beta.4.md5'))).toBe(false);

            expect(fs.existsSync(path.join(temporaryImportDir, 'dep', 'etpl'))).toBe(true);
            expect(fs.existsSync(path.join(temporaryImportDir, 'dep', 'mini-event'))).toBe(true);

            expect(fs.existsSync(path.join(projectDir, 'dep', 'etpl'))).toBe(false);
            expect(fs.existsSync(path.join(projectDir, 'dep', 'mini-event'))).toBe(false);

            done();
        });
    });
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
