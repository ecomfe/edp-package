/**
 * @file 从registry导入包
 * @author errorrik[errorrik@gmail.com]
 */
var path = require('path');

var edp = require('edp-core');

var fetch = require('./fetch');
var pkg = require('./pkg');

/**
 * 从registry导入包
 *
 * @param {ProjectContext} context
 * @param {string} name 包名称
 * @param {Function} callback 回调函数
 */
module.exports = function(context, name, callback) {
    fetch(name, null, startImport(context, name, callback));
};


/**
 * @param {null|*} err 正常情况为null，否则代表出错了.
 * @param {{file:string,path:string,version:string,
 * name:string,shasum:string}} data 回调函数传递的数据.
 */
function startImport(context, name, callback) {
    return function(error, data){
        if (error) {
            callback(error);
            return;
        }

        var pkgDir = context.getPackage(data.name, data.version);
        if (pkgDir) {
            // 如果当前的package已经存在了，需要检查依赖的package
            // 是否不小心被干掉了，需要再补充上的
            var packageInfo = require('./util/get-package-info')(pkgDir);
            pkg.importDependencies(context)(packageInfo, callback);
            return;
        }

        var confirm = context.getConfirm();
        confirm(data, function(yes){
            if (yes) {
                require('./import-from-file')(
                    context, data.path,
                    function(error, pkg) {
                        callback(error, pkg);
                    }
                );
            }
            else {
                callback(null, data);
            }
        });
    };
}


if (require.main === module) {
    var context = require('./context').create(
        path.join(__dirname, '..', 'test', 'tmp', 'dummy-project'));
    context.setConfirm(function(data, callback){
        var util = require('util');
        var msg = util.format('Install %s %s [y/n]: ',
            data.name, data.version);

        edp.rl.prompt(msg, function(answer){
            callback(answer === 'y' || answer === 'Y');
        });
    });

    module.exports(
        context,
        'er@3.1.0-beta.4',
        function(error, data){
            console.log(arguments);
            edp.util.rmdir(context.getShadowDir());
        });
}

