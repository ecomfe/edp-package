/**
 * @file 从本地文件导入包
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 从本地文件导入包
 *
 * @param {string} name 包名称
 * @param {string=} importDir 导入目录，没有传入时默认使用cache目录。
 * @param {Function=} callback 回调函数
 */
module.exports = function ( file, importDir, callback ) {
    if (!importDir) {
        importDir = require( './util/get-cache-import-dir' )();
    }
    var depDir = require( './util/get-dependencies-dir' )( importDir );
    callback = callback || require('./util/copy-to-dep')(depDir);

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
            var pkg = {
                name: pkgName,
                version: pkgVersion
            };
            if ( main ) {
                pkg.main = main;
            }

            require( './util/add-to-manifest' )( pkg, depDir );

            require( './define-dependency' )(
                pkgName,
                pkgVersion.split( '.' )[ 0 ] + '.x',
                importDir
            );

            // 放一个文件，里面是包中所有文件的MD5码，以便升级时可以做一下对比看有哪些文件被本地修改过
            require('./util/get-package-md5sum')(
                target,
                function (err, md5sum) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    // 将MD5码放在上一级目录
                    require('fs').writeFileSync(
                        path.resolve(target, '..', pkg.version + '.md5'),
                        JSON.stringify(md5sum, null, '    ')
                    );

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
    );
};
