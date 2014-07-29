/**
 * @file ../lib/util/semver.js ~ 2014/07/28 16:32:05
 * @author leeight(liyubei@baidu.com)
 **/
var semver = require('semver');

var kHashTags = ['*', 'latest', 'stable', 'rc', 'beta', 'alpha'];

/**
 * 参考 https://github.com/ecomfe/edp/issues/283#issuecomment-50277162
 * version的可能性
 * 1.0.0
 * 1.0.0-alpha.1
 * 1.0.1-beta.2
 * 1.0.2-rc.3
 * 1.0.0@stable
 * 1.0.0@rc
 * 1.0.0@beta
 * 1.0.0@alpha
 * @param {Array.<string>} versions 所有待选的版本号.
 * @param {string} version 需要参考的版本号.
 * @param {string=} opt_releaseType 版本号的类型.
 * @return {string|null} 如果没有找到符合的版本号，返回null.
 */
semver.maxSatisfying2 = function(versions, version, opt_releaseType){
    var pattern = /\d+\.\d+\.\d+\-(rc|alpha|beta)\.\d+/i;
    if (pattern.test(version)) {
        return version;
    }

    var releaseType = opt_releaseType || 'rc';

    if (-1 === kHashTags.indexOf(releaseType)) {
        return null;
    }

    var candidates = null;
    switch(releaseType) {
        case 'stable':
            candidates = versions.filter(stable);
            break;
        case 'rc':
            candidates = versions.filter(rc);
            break;
        case 'beta':
            candidates = versions.filter(beta);
            break;
        case 'alpha':
            candidates = versions.filter(alpha);
            break;
        default:
            candidates = versions;
            break;
    }

    return semver.maxSatisfying(candidates, version);
};

function stable(item) {
    var pattern = /^(\d+)\.(\d+)\.(\d+)$/i;
    return pattern.test(item);
}

function rc(item) {
    var pattern = /^(\d+)\.(\d+)\.(\d+)\-rc\.\d+$/i;
    return stable(item) || pattern.test(item);
}

function beta(item) {
    var pattern = /^(\d+)\.(\d+)\.(\d+)\-beta\.\d+$/i;
    return rc(item) || pattern.test(item);
}

function alpha(item) {
    var pattern = /^(\d+)\.(\d+)\.(\d+)\-alpha\.\d+$/i;
    return beta(item) || pattern.test(item);
}



module.exports = semver;







/* vim: set ts=4 sw=4 sts=4 tw=120: */
