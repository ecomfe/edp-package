/**
 * @file 获取整个package的MD5信息
 * @author otakustay[otakustay@gmail.com]
 */
var FILE_SYSTEM_LIMIT = 30;

var fs = require('fs');
var path = require('path');

var computeMD5 = require('./compute-md5');

/**
 * 获取一个package的MD5信息
 *
 * @param {string} dir package所在目录
 * @param {Function} callback 回调函数，参数是一个由路径-MD5组成的对象
 */
module.exports = function (dir, callback) {
    var result = {};

    require('async').eachLimit(
        require('edp-core').glob.sync(dir + '/**'),
        FILE_SYSTEM_LIMIT,
        function (file, callback) {
            if (!fs.statSync(file).isFile()) {
                callback();
                return;
            }


            computeMD5(
                file,
                function (err, md5) {
                    result[path.relative(dir, file)] = md5;

                    callback();
                }
            );
        },
        function (err) {
            callback(err, result);
        }
    );
};
