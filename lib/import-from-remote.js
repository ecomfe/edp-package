/**
 * @file lib/import-from-remote.js ~ 2014/06/20 15:43:35
 * @author leeight(liyubei@baidu.com)
 * 从url导入一个package，例如
 * edp import http://git.baidu.com/ecomfe/ria/release/0.0.1.zip
 **/
var fs = require('fs');
var path = require('path');
var http = require('http');
var edp = require('edp-core');

/**
 * 从url导入包，例如
 * edp import http://git.baidu.com/ecomfe/ria/release/0.0.1.zip
 *
 * 因为从url里面无法知道具体的版本号，所以都是先下载下来，然后解压
 * 然后根据package.json来判断版本号
 *
 * @param {ProjectContext} context
 * @param {string} url 包的url地址
 * @param {Function} callback 回调函数
 */
module.exports = function (context, url, callback) {
    var depDir = context.getShadowDependenciesDir();

    // http://git.baidu.com/bec/web/repository/archive.tar.gz?ref=1.0.0
    var pathname = require('url').parse(url).pathname;
    var file = pathname.slice(pathname.lastIndexOf('/') + 1);
    var fullPath = path.resolve(depDir, file);

    var dirname = path.dirname(fullPath);
    if (!fs.existsSync(dirname)) {
        require('mkdirp').sync(dirname);
    }

    edp.log.info('GET %s', url);

    var stream = fs.createWriteStream(fullPath);
    http.get(url, function(res) {
        res.pipe(stream);
    }).on('error', callback);
    stream.on('close', done);

    function done() {
        require('./import-from-file')(
            context, fullPath,
            function(err, pkg) {
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
                callback(err, pkg);
            }
        );
    }
};









/* vim: set ts=4 sw=4 sts=4 tw=120: */
