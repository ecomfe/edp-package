/**
 * @file 计算指定文件的MD5码
 * @author otakustay[otakustay@gmail.com]
 */
var fs = require('fs');
var crypto = require('crypto');

/**
 * 计算文件MD5
 *
 * @param {string} file 文件路径
 * @param {Function} callback 回調函数，参数为HEX格式的MD5码
 */
module.exports = function (file, callback) {
    fs.readFile(
        file,
        function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            try {
                var md5 = crypto.createHash('md5');
                md5.update(data);

                callback(null, md5.digest('hex'));
            }
            catch (ex) {
                callback(ex);
            }
        }
    );
};
