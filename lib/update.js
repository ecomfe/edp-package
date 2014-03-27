/**
 * @file 包更新功能
 * @author errorrik[errorrik@gmail.com]
 *         Ielgnaw[wuji0223@gmail.com]
 */
var edp = require( 'edp-core' );

/**
 * 从命令行获取信息
 *
 * @param  {string=}   msg     提示信息
 * @param  {Function} callback 回调
 */
function getReadLine (msg, callback) {
    var res = {};
    edp.rl.prompt(
        msg,
        function (answer) {
            answer = (answer + '').toLowerCase();
            if (
                answer === ''
                ||
                answer === 'y'
                ||
                answer === 'yes'
            ) {
                res.answer = true;
            }
            else {
                res.answer = false;
            }
            callback && callback(res);
        }
    );
}

/**
 * 更新包
 *
 * @param {string=} name 包名称
 * @param {string=} importDir 导入目录
 * @param {Object=} opts 配置，是否保留旧版本的包及是否需要confirm
 * @param {Function=} callback 回调函数
 */
module.exports = function ( name, importDir, opts, callback ) {
    var deleteOlder = opts['delete-older'] || false;
    var force = opts['force'] || false;

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

    function doUpdate (curDep, ver) {
        importFromRegistry(
            curDep + '@' + ver,
            importDir,
            function ( error ) {
                if ( !error && deleteOlder ) {
                    for ( var key in importeds[ curDep ] ) {
                        require( './unimport' )(
                            curDep + '@' + key
                        );
                    }
                }
                next();
            }
        );
    }

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
                    depVersion || '*'
                );

                if (semver.gt(ver, maxImportedVer)) {
                    if (force) {
                        doUpdate(dep, ver);
                    }
                    else {
                        var confirmMsg = '';
                        if (maxImportedVer === '0.0.0') {
                            confirmMsg = dep
                                + ' - '
                                + 'Current dependence `'
                                + dep
                                + '` does not exist, ';
                        }
                        else {
                            confirmMsg = dep
                                + ' - '
                                + 'current version: '
                                + maxImportedVer
                                + ', ';
                        }

                        confirmMsg += 'will update to version: '
                            + ver
                            + '\nContinue update? [Y/n]';

                        getReadLine (
                            confirmMsg,
                            function (res) {
                                if (res.answer) {
                                    doUpdate(dep, ver);
                                }
                                else {
                                    next();
                                }
                            }
                        );
                    }
                }
                else {
                    next();
                }

            }
        );
    }

    next();
};
