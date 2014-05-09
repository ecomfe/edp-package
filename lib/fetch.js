/**
 * @file 包获取功能
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 从registry获取包并放入edp-package-cache目录下。
 * 
 * @param {string} name 包名称
 * @param {Function} callback 回调函数
 * @param {Function} existingCheck  取到目标版本后要调用的函数来检查package是否已经被加载。
 */
function fetch( name, callback, existingCheck ) {
    callback = callback || function () {};

    var part = name.split( '@' );
    name = part[ 0 ];
    var version = part[ 1 ] || '*';
    var registry = require( './util/get-registry' )();
    registry.get(
        name,
        function ( error, data ) {
            if ( error ) {
                callback( error, data );
                return;
            }

            var versions = Object.keys( data.versions || {} );
            var ver = require( 'semver' ).maxSatisfying( versions, version );

            if ( !ver ) {
                console.log( 'No matched version!' );
                return;
            }
            // 取tar包之前去检查一下是否已经有了这个包了。
            // TODO: 可以继续检查cache目录中是否有了，如果有可以直接从cache目录取。
            if ( existingCheck && existingCheck() ) {
                return;
            }
            
            registry.get( 
                name + '/' + ver,
                function ( error, data ) {
                    if ( error ) {
                        throw error;
                    }

                    var fs = require( 'fs' );
                    var path = require( 'path' );
                    var http = require( 'http' );
                    var shasum = data.dist.shasum;
                    var tarball = data.dist.tarball;
                    var file = tarball.slice( tarball.lastIndexOf( '/' ) + 1 );
                    // 保存到cache目录
                    var cacheFolder = require( './util/get-cache-dir' )();
                    var packageFolder = path.join( cacheFolder, name, ver );
                    var fullPath = path.resolve( packageFolder, file );

                    var stream = fs.createWriteStream( fullPath );
                    http.get( tarball, function( res ) {
                        res.pipe( stream );
                    }).on( 'error', function( error ){
                        stream.emit( 'error', error );
                    });

                    stream.on( 'close', function () {
                        require( './util/check-sha' )( 
                            fullPath, 
                            shasum, 
                            function ( error ) {
                                callback( error, {
                                    file: file,
                                    path: fullPath,
                                    version: ver,
                                    name: name,
                                    shasum: shasum
                                } );
                            } 
                        );
                    } );
                }
            );
        }
    );
}

module.exports = exports = fetch;


