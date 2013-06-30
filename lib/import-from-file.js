
/**
 * 从本地文件导入包
 * 
 * @param {string} name 包名称
 * @param {string} importDir 导入目录
 * @param {Function=} callback 回调函数
 */
function importFromFile( file, importDir, callback ) {
    importDir = importDir || process.cwd();
    callback = callback || new Function();
    var depDir = require( './util/get-dependencies-dir' )( importDir );

    var extractMethod;
    var extract = require( './util/extract' );
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
                    // TODO: 这里要处理
                    // project.updateModuleConfFile( dir );
                    // require( '../project/loader' ).updateConfig( dir );
                    callback( null, pkgData );
                } 
            );
        }
    );
}