/**
 * @file 临时名称生成
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 获取临时名称
 * 可用于文件名
 * 
 * @return {string}
 */
module.exports = function () {
    return 'tmp' + ( (new Date()).getTime() + Math.random() );
};
