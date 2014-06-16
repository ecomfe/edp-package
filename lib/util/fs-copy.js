/**
 * @file fs 同步拷贝删除目录等操作。
 * @author yankun01 (vcfg.code@hotmail.com)
 */
 
var edp = require('edp-core');

function copyDir( from, to ) {
    var fs = require('fs');
    var path = require('path');
    edp.util.scanDir( from, function( f ) {
        var relative = f.replace( from, '' );
        var toPath = path.join( to, relative );
        require('mkdirp').sync( path.dirname( toPath ) );
        fs.writeFileSync( toPath, fs.readFileSync( path.join( from, relative ) ) );
    });
}

module.exports = {
    copyDir: copyDir,
    rmdir: edp.util.rmdir
};