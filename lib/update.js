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
 * @param {Object=} opts 配置，是否保留旧版本的包及是否需要confirm
 * @param {Function=} callback 回调函数
 */
module.exports = function ( name, opts, callback ) {
    // 不清楚是reserve-older还是要删除delete-older，先屏蔽这个功能了
    // var deleteOlder = opts['delete-older'] || false;
    var force = opts['force'] || false;

    var importDir = process.cwd();
    callback = callback || new Function();
    var importeds = require('./get-imported')( importDir );
    var definedDeps = require('./get-defined-dependencies')( importDir ) || {};
    var importAll = require( './import-all' );

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

    importAll( 
        updates,
        null,
        function ( pkg, importPkg, doneCallback ) {
            if ( force ) {
                importPkg();
            } else {
                getReadLine (
                    'Update ' + pkg + ' and dependencies?',
                    function (res) {
                        if (res.answer) {
                            importPkg();
                        }
                        else {
                            doneCallback( 'cancelled', pkg );
                        }
                    }
                );
            }
        },
        function (err) {
            // if ( !err && deleteOlder ) {
                // updates.forEach( function (curDep) {
                    // for ( var key in importeds[ curDep ] ) {
                        // require( './unimport' )(
                            // curDep + '@' + key
                        // );
                    // }
                // } );
            // }
            callback(err);
        }
    );
};
