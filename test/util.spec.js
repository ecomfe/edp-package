describe('util', function(){
    it('get-dependencies-info', function(){
        var getDependenciesInfo = require('../lib/util/get-dependencies-info');

        expect( getDependenciesInfo({}) ).toEqual( {} );

        var defDeps = { a: '1.0.0', b: '2.0.0', c:'3.x', d: '~1.0'};
        var edpDeps = { e: '2.0.0', d: '2.0', p:'5.x', hy: '~2.0'};
        expect( getDependenciesInfo({
            dependencies: defDeps
        }) ).toBe( defDeps );
        expect( getDependenciesInfo({
            dependencies: defDeps,
            edp:{}
        }) ).toBe( defDeps );
        expect( getDependenciesInfo({
            dependencies: defDeps,
            edp:{ dependencies: edpDeps }
        }) ).toBe( edpDeps );
    });

    describe('extract', function () {

        it('.zip() should unzip files', function () {

            var targetDir = require('path').resolve(__dirname, 'zip');
            var filePath = require('path').resolve(targetDir, 'hello.js');
            var content = 'alert(\'hello\');\n';
            var fs = require('fs');
            var zip = require('../lib/util/extract').zip;

            function clear() {
                fs.unlinkSync(filePath);
                fs.rmdirSync(targetDir);
            }

            function finish() {
                var fileExists = fs.existsSync(filePath);

                expect(fileExists).toBeTruthy();

                if (fileExists) {
                    var file = fs.readFileSync(filePath, 'utf-8');
                    expect(file).toEqual(content);

                    clear();
                }

            }

            zip(require('path').resolve(__dirname, 'data', 'hello.zip'), targetDir, finish);
        });

    });
});
