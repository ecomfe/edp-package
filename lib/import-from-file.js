/**
 * @file 从本地文件导入包
 * @author errorrik[errorrik@gmail.com]
 */
var edp = require( 'edp-core' );

/**
 * 从本地文件导入包
 *
 * @param {string} name 包名称
 * @param {string} importDir 导入目录
 * @param {Function} callback 回调函数
 */
module.exports = function ( file, importDir, callback ) {
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

    // XXX 这里的depDir不是项目的dep目录，而是一个临时创建的项目中dep目录
    var depDir = require( './util/get-dependencies-dir' )( importDir );
    var tempDir = path.resolve( depDir, require( './util/get-temp-name' )() );

    function afterExtract() {
        var target = require( './util/amend-import-path' )( tempDir );
        var pkgData = require( './util/get-package-info' )( target );
        var pkgName = pkgData.name;
        var pkgVersion = pkgData.version;

        // FIXME(有意义么？）
        /*
        require( './define-dependency' )(
            pkgName,
            pkgVersion.split( '.' )[ 0 ] + '.x',
            importDir
        );*/

        // 放一个文件，里面是包中所有文件的MD5码，以便升级时可以做一下对比看有哪些文件被本地修改过
        require( './util/get-package-md5sum' )(
            target,
            function ( err, md5sum ) {
                if ( err ) {
                    callback( err );
                    return;
                }

                // 将MD5码放在上一级目录
                require( 'fs' ).writeFileSync(
                    path.resolve( target, '..', pkgVersion + '.md5' ),
                    JSON.stringify( md5sum, null, 4 )
                );

                // 导入这个package相关的依赖
                require( './import-dependencies' )(
                    pkgName,
                    pkgVersion,
                    importDir,
                    function () {
                        callback( null, pkgData );
                    }
                );
            }
        );
    }

    extractMethod( file, tempDir, afterExtract );
};
