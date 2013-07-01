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
            return;
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

            require( './util/add-to-manifest' )( 
                {
                    name: pkgName, 
                    version: pkgVersion,
                    main: pkgData.main || 'main'
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
                        project.loader.updateConfig( projectInfo );
                    }

                    callback( null, pkgData );
                } 
            );
        }
    );
};
