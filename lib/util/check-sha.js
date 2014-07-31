/**
 * @file sha校验功能
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 检查package tar包的sha
 *
 * @param {string} file tar包文件
 * @param {string} sha sha值
 * @param {function} callback 回调函数
 */
module.exports = function (file, sha, callback) {
    sha = sha.toLowerCase();
    var crypto = require('crypto');
    var hash = crypto.createHash('sha1');

    var stream = require('fs').createReadStream(file);
    stream
        .on('data', function(chunk) {
            hash.update(chunk);
        })
        .on('end', function() {
            var actual = hash.digest('hex').toLowerCase().trim();
            var error = sha === actual
                ? null
                : new Error('[shasum]expect ' + sha + ', actual ' + actual);
            callback(error);
        })
        .on('error', function(error) {
            callback(error);
        });
};
