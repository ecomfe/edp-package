/**
 * @file 从registry导入包
 * @author errorrik[errorrik@gmail.com]
 */
var fs = require( 'fs' );
var fetch = require('./fetch');

/**
 * 从registry导入包
 *
 * @param {ProjectContext} context
 * @param {string} name 包名称
 * @param {Function} callback 回调函数
 */
module.exports = function(context, name, callback) {
    var depDir = context.getShadowDependenciesDir();
    fetch(name, depDir, startImport(context, name, callback));
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

        if (context.hasPackage(data.name, data.version)) {
            fs.unlinkSync(data.path);
            callback(null, data);
            return;
        }

        require('./import-from-file')(
            context, data.path,
            function(error, pkg) {
                if (fs.existsSync(data.path)) {
                    fs.unlinkSync(data.path);
                }
                callback(error, pkg);
            }
        );
    };
}

