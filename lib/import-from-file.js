/**
 * @file 从本地文件导入包
 * @author errorrik[errorrik@gmail.com]
 */


var project = require( 'edp-project' );

/**
 * 从本地文件导入包
 *
 * @param {string} name 包名称
 * @param {string=} importDir 导入目录
 * @param {Function=} callback 回调函数
 */
module.exports = function ( file, importDir, callback ) {
    importDir = importDir || process.cwd();
    callback = callback || new Function();
    var depDir = require( './util/get-dependencies-dir' )( importDir );

    var extractMethod;
    var extract = require( './util/extract' );
    var path = require( 'path' );
    var fileExtname = path.extname( file ).slice( 1 );
    switch ( fileExtname ) {
        case 'gz':
        case 'tgz':
            extractMethod = extract.tgz;
            break;
        case 'zip':
            extractMethod = extract.zip;
            break;
        default:
            throw new Error( fileExtname + ' file is not supported!' );
    }

    var tempDir = path.resolve( depDir, require( './util/get-temp-name' )() );
    extractMethod(
        file,
        tempDir,
        function () {
            var target = require( './util/amend-import-path' )( tempDir );
            var pkgData = require( './util/get-package-info' )( target );
            var pkgName = pkgData.name;
            var pkgVersion = pkgData.version;

            // edp import jquery 时，module.conf生成的配置如下
            // {
            //      "name": "jquery",
            //      "location": "dep/jquery/1.9.1/src",
            //      "main": "jquery.min.js"
            // }
            // 这时如果用edp.esl.getModuleFile('jquery', moduleConfPath)
            // 得到的是 ${path}/dep/jquery/1.9.1/src/jquery.min.js.js
            // 因为jquery的package.json配置是
            // {
            //     "name": "jquery",
            //     "version": "1.9.1",
            //     "main": "./src/jquery.min.js"
            // }
            // 因此这里把main后缀的.js给去掉
            var main = (pkgData.main || 'main').replace(/\.js$/, '');

            require( './util/add-to-manifest' )(
                {
                    name: pkgName,
                    version: pkgVersion,
                    main: main
                },
                depDir
            );

            require( './define-dependency' )(
                pkgName,
                pkgVersion.split( '.' )[ 0 ] + '.x',
                importDir
            );

            require( './import-dependencies' )(
                pkgName,
                pkgVersion,
                importDir,
                function () {
                    var projectInfo = project.getInfo( importDir );
                    if ( projectInfo ) {
                        project.module.updateConfig( projectInfo );
                        project.loader.updateAllFilesConfig( projectInfo );
                        project.style.updatePackageImport( projectInfo );
                    }

                    callback( null, pkgData );
                }
            );
        }
    );
};
