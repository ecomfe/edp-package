/**
 * @file 获取package的dependencies信息功能
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 获取package的dependencies信息
 * 
 * @inner
 * @param {Object} packageInfo package信息对象
 * @return {Object}
 */
module.exports = function ( packageInfo ) {
    var edpInfo = packageInfo.edp;

    return (edpInfo && edpInfo.dependencies) || packageInfo.dependencies || {};
};
