/**
 * @file 包管理功能模块
 * @author errorrik[errorrik@gmail.com]
 */




function camelize( source ) {
    return source.replace( /-([a-z])/ig, function ( $0, alpha ) {
        return alpha.toUpperCase();
    } );
}

require( 'fs' ).readdirSync( __dirname + '/lib' ).forEach(
    function ( file ) {
        if ( /\.js$/.test( file ) ) {
            file = file.replace( /\.js$/, '' );
            exports[ camelize( file ) ] = require( './lib/' + file );
        }
    }
);


