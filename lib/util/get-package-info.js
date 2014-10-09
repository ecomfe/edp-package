/**
 * @file 获取package信息功能
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 获取package信息
 *
 * @inner
 * @param {string} dir package目录
 * @return {Object}
 */
module.exports = function(dir) {
    var fs = require('fs');
    var path = require('path');

    var file = path.resolve(dir, 'package.json');
    if (fs.existsSync(file)) {
        try {
            return JSON.parse(fs.readFileSync(file, 'UTF-8'));
        }
        catch(ex) {
        }
    }

    return null;
};
