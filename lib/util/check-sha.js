
/**
 * 检查package tar包的sha
 * 
 * @param {string} file tar包文件
 * @param {string} sha sha值
 * @param {function({Error}error)} callback 回调函数
 */
module.exports = exports = function ( file, sha, callback ) {
    sha = sha.toLowerCase();
    var crypto = require( 'crypto' );
    var hash = crypto.createHash( 'sha1' );

    var stream = require( 'fs' ).createReadStream( file );
    stream
        .on( 'data', function ( chunk ) {
            hash.update( chunk );
        })
        .on( 'end', function () {
            var actual = hash.digest( 'hex' ).toLowerCase().trim();
            var error = sha === actual 
                ? null 
                : new Error( '[shasum]expect ' + sha1 + ', actual ' + actual );
            callback( error );
        })
        .on( 'error', function ( error ) {
            callback( error );
        });
}
