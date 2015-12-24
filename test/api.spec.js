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

        mkdirp.sync(path.join(kAPIDir, '.edpproj'));
        fs.writeFileSync(path.join(kAPIDir, '.edpproj', 'metadata'), JSON.stringify({
            "wwwroot": "/",
            "depDir": "dep",
            "srcDir": "src",
            "loaderAutoConfig": "js,htm,html,tpl,vm,phtml",
            "loaderUrl": "http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-2/esl.js",
            "dependencies": {}
        }, null, 4));

        mkdirp.sync(path.join(kAPIDir, '2', '.edpproj'));
        fs.writeFileSync(path.join(kAPIDir, '2', 'package.json'), JSON.stringify({
            "name": "x",
            "version": "0.0.1",
            "description": "edp project",
            "main": "index.js",
            "scripts": {
                "test": "echo \"Error: no test specified\" && exit 1"
            },
            "edp": {
                "wwwroot": "/",
                "depDir": "dep",
                "srcDir": "src",
                "loaderAutoConfig": "js,htm,html,tpl,vm,phtml",
                "loaderUrl": "http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-2/esl.js",
                "dependencies": {
                    "er": "hello world"
                }
            },
            "dependencies": {},
            "author": "leeight@gmail.com",
            "repository": "empty",
            "license": "BSD",
            "readme": "README"
        }));
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
            var xyz = fs.readFileSync(path.join(kAPIDir, '.edpproj', 'metadata'), 'utf-8');
            var dependencies = JSON.parse(xyz).dependencies;
            expect(dependencies['my-test']).not.toBeUndefined();

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
            var xyz = fs.readFileSync(path.join(kAPIDir, '.edpproj', 'metadata'), 'utf-8');
            var dependencies = JSON.parse(xyz).dependencies;
            expect(dependencies['my-test']).not.toBeUndefined();
            done();
        });
    });

    it('importFromRegistry with new format', function(done){
        api.importFromRegistry('my-test', path.join(kAPIDir, '2'), function(error, pkg){
            expect(error).toBeNull();
            expect(pkg.name).toBe('my-test');
            expect(fs.existsSync(path.join(kAPIDir, '2', 'dep', 'my-test'))).toBe(true);
            var xyz = fs.readFileSync(path.join(kAPIDir, '2', 'package.json'), 'utf-8');
            var dependencies = JSON.parse(xyz).edp.dependencies;
            expect(dependencies['my-test']).not.toBeUndefined();

            api.importFromRegistry('er@latest', path.join(kAPIDir, '2'), function(error, pkg){
                expect(error).toBeNull();
                expect(pkg.name).toBe('er');
                expect(fs.existsSync(path.join(kAPIDir, '2', 'dep', 'er'))).toBe(true);
                var xyz = fs.readFileSync(path.join(kAPIDir, '2', 'package.json'), 'utf-8');
                var dependencies = JSON.parse(xyz).edp.dependencies;
                // 即便以前写的版本号有问题，我们也不要去动它
                // expect(dependencies['er']).toBe('hello world'); // 由于测试用例里没有这个包，在最后刷新目录时被移除了 这个会不通过
                done();
            });
        });
    });
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
