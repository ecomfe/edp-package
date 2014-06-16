/**
 * @file 包获取功能
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 从registry获取包
 * 
 * @param {string} pkgName 包名称
 * @param {string} toDir 要放到的目录下
 * @param {Function=} callback 回调函数
 */
function fetch( pkgName, toDir, callback ) {
    var part = pkgName.split( '@' );

    var name = part[ 0 ];
    var version = part[ 1 ] || '*';

    function afterReadMeta( error, data ) {
        if ( error ) {
            callback( error );
            return;
        }

        // 没有指定版本，选择最新的
        var versions = Object.keys( data.versions || {} );
        var ver = require( 'semver' ).maxSatisfying( versions, version );

        if ( !ver ) {
            callback( new Error( 'No matched version ' + version + '!' ) );
            return;
        }

        registry.get( name + '/' + ver, afterReadDetail );
    }

    function afterReadDetail( error, data ) {
        if ( error ) {
            callback( error );
            return;
        }

        var fs = require( 'fs' );
        var path = require( 'path' );
        var http = require( 'http' );
        var shasum = data.dist.shasum;
        var tarball = data.dist.tarball;
        var file = tarball.slice( tarball.lastIndexOf( '/' ) + 1 );
        var fullPath = path.resolve( toDir, file );

        var stream = fs.createWriteStream( fullPath );
        http.get( tarball, function( res ) {
            res.pipe( stream );
        }).on( 'error', function( error ){
            stream.emit( 'error', error );
        });
        stream.on( 'close', done );

        function done() {
            require( './util/check-sha' )(
                fullPath,
                shasum,
                function ( error ) {
                    callback( error, {
                        file: file,
                        path: fullPath,
                        version: data.version,
                        name: name,
                        shasum: shasum
                    } );
                }
            );
        }
    }

    var registry = require( './util/get-registry' )();
    registry.get( name, afterReadMeta );
}


module.exports = exports = fetch;


