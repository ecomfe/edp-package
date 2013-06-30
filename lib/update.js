
/**
 * 更新包
 * 
 * @param {string=} name 包名称
 * @param {string=} importDir 导入目录
 * @param {Function=} callback 回调函数
 */
module.exports = function ( name, importDir, callback ) {
    var semver = require( 'semver' );
    var getRegistry = require('./util/get-registry');
    var importFromRegistry = require('./import-from-registry');

    importDir = importDir || process.cwd();
    callback = callback || new Function();
    var importeds = require('./get-imported')( importDir );
    var definedDeps = require('./get-defined-dependencies')( importDir ) || {};

    // 具名更新或批量更新的预处理
    var updatesMap;
    var updatesLen = -1;
    if ( name ) {
        updatesMap = {};
        updatesMap[ name ] = definedDeps[ name ];
    }
    else {
        updatesMap = definedDeps;
    }
    updates = Object.keys( updatesMap );

    /**
     * 异步更新step函数
     * 
     * @inner
     */
    function next() {
        if ( ++updatesLen >= updates.length ) {
            callback();
            return;
        }

        var dep = updates[ updatesLen ];
        var depVersion = updatesMap[ dep ];
        var registry = getRegistry();
        registry.get(
            dep,
            function ( error, data ) {
                if ( error ) {
                    console.log( 'Cannot update package "' + dep + '"!');
                    next();
                    return;
                }

                var maxImportedVer = Object.keys( importeds[ dep ] || {} )
                    .sort( semver.rcompare )[ 0 ] || '0.0.0';
                var ver = semver.maxSatisfying( 
                    Object.keys( data.versions || {} ), 
                    depVersion
                );

                if ( semver.gt( ver, maxImportedVer ) ) {
                    importFromRegistry( dep + '@' + ver, importDir, next );
                }
            }
        )
    }
    
    next();
};
