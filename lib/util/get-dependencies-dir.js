

module.exports = function ( importDir ) {
    var projectInfo = require( 'edp-config' ).getInfo( importDir );
    if ( projectInfo ) {
        importDir = projectInfo.dir;
    }

    return require( 'path' ).join( 
        importDir, 
        require( '../config/dep-dir' )
    );
};
