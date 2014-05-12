/**
 * @file 拷贝cache中的包到dep下
 * @author errorrik[errorrik@gmail.com]
 */
 
var edp = require( 'edp-core' );
/**
 * 拷贝cache中的包到dep下, 并删除temp目录
 * 
 * @return {string} 
 */
module.exports = function ( depDir ) {
    return function ( err, packData ) {
        if ( err ) {
            console.log( err );
            return;
        }
        var fsExt = require( './fs-copy' );
        var projectDep = require( './get-dependencies-dir' )( process.cwd() );
        var path = require( 'path' );

        console.log( depDir, '>>>', projectDep );
        fsExt.copyDir(depDir, projectDep);
        edp.util.spawn( 'edp', [ 'project', 'updateLoaderConfig' ] );
        var temp = path.join( depDir, '..' );
        console.log( 'removing temp folder: ' + temp );
        fsExt.rmdir( temp );
    };
};