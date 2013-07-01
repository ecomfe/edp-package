/**
 * @file 获取npm registry client功能
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 默认的registry地址
 * 
 * @inner
 * @const
 * @type {string}
 */
var DEFAULT_REGISTRY = 'http://registry.edp.baidu.com/';

/**
 * 获取registry地址
 * 
 * @inner
 * @return {string} 
 */
function getRegistryUrl() {
    return require( 'edp-config' ).get( 'registry' ) || DEFAULT_REGISTRY;
};

/**
 * 获取registry client配置
 * 
 * @inner
 * @return {Object}
 */
function getRegistryConf() {
    return { 
        'loglevel'   : 'warn',
        'cache'      : require( './get-cache-dir' )(),
        'registry'   : getRegistryUrl(), 
        'strict-ssl' : false, 
        '_auth'      : '', 
        'username'   : '', 
        '_password'  : '',
        'email'      : '' 
    };
}

/**
 * registry client对象
 * 
 * @inner
 * @type {RegClient}
 */
var registry;

/**
 * 初始化registry client对象
 * 
 * @inner
 */
function initRegistry() {
    if ( !registry ) {
        var RegClient = require( 'npm-registry-client' );
        registry = new RegClient( getRegistryConf() );
    }
}

/**
 * 获取registry client对象
 * 
 * @return {RegClient}
 */
module.exports = exports = function () {
    initRegistry();
    return registry;
};
