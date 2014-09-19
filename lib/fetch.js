/**
 * @file 包获取功能
 * @author errorrik[errorrik@gmail.com]
 */
var path = require('path');
var fs = require('fs');
var http = require('http');
var edp = require('edp-core');
var mkdirp = require('mkdirp');

var async = require('async');
var semver = require('./util/semver');

var DEFAULT_REGISTRY = 'http://edp-registry.baidu.com/';

/**
 * 从registry获取包
 *
 * @param {string} pkgName 包名称
 * @param {string=} opt_toDir 要放到的目录下
 * @param {function} callback 回调函数
 */
module.exports = function(pkgName, opt_toDir, callback) {
    var part = pkgName.split('@');

    var name = part[0];
    var version = part[1] || '*';

    var toDir = opt_toDir || getCacheDir();
    if (!fs.existsSync(toDir)) {
        mkdirp.sync(toDir);
    }

    var tasks = [
        fetchPackageMeta(name, version),
        fetchPackageDetail(),
        downloadPackageArchive(toDir)
    ];

    async.waterfall(tasks, callback);
};

/**
 * 加载package的meta信息
 *
 * @param {string} name 包名称
 * @param {string} version 包名称
 * @param {function} callback 回调函数
 * @return {function}
 */
function fetchPackageMeta(name, version) {
    return function(callback) {
        var url = buildUrl(name);
        httpGet(url, function(error, data) {
            if (error) {
                callback(error);
                return;
            }

            var ver = null;
            if (data.versions[version]) {
                // 优先考虑指定版本的情况
                ver = version;
            }
            else {
                // 考虑版本的别名情况
                var distTags = data['dist-tags'];
                if (distTags && distTags[version]) {
                    // version -> latest
                    // ver -> 3.1.0-beta.4
                    ver = distTags[version];
                }
                else {
                    var candidates = Object.keys(data.versions || {});
                    ver = semver.maxSatisfying(candidates, version);
                }
            }

            if (!ver) {
                callback(new Error('No matched version ' + version + '!'));
                return;
            }

            callback(null, name + '/' + ver, data);
        });
    };
}

/**
 * 加载package的meta信息
 *
 * @return {function}
 */
function fetchPackageDetail() {
    return function(suffix, meta, callback) {
        var url = buildUrl(suffix);
        httpGet(url, function(error, data) {
            if (error) {
                callback(error);
                return;
            }

            callback(null, data);
        });
    };
}

function getCacheDir() {
    var parentDir = process.env[
        require('os').platform() === 'win32'
            ? 'APPDATA'
            : 'HOME'
    ];

    return path.resolve(parentDir, '.edp-package-cache');
}

/**
 * 下载package，存储到toDir目录.
 *
 * @param {string} toDir 缓存的目录.
 * @return {function}
 */
function downloadPackageArchive(toDir) {
    return function(data, callback) {
        var shasum = data.dist.shasum;
        var tarball = data.dist.tarball;

        var basename = path.basename(tarball);
        var dstpath = path.resolve(toDir, basename);

        if (fs.existsSync(dstpath)) {
            done(true);
        }
        else {
            download();
        }

        function download() {
            var stream = fs.createWriteStream(dstpath);
            http.get(tarball, function(res) {
                res.pipe(stream);
            }).on('error', callback);

            stream.on('close', done);
        }

        function done(opt_retry) {
            require('./util/check-sha')(
                dstpath, shasum,
                function(error) {
                    if (error) {
                        if (true === opt_retry) {
                            download();
                            return;
                        }
                        else {
                            callback(error);
                        }
                    }
                    else {
                        callback(null, {
                            file: basename,
                            path: dstpath,
                            version: data.version,
                            name: data.name,
                            shasum: shasum
                        });
                    }
                }
            );
        }
    };
}


/**
 * 用来缓存registry的返回结果
 * @type {Object.<string, *>}
 */
var kCache = {};

/**
 * 发起http请求，加载json的数据
 * @param {string} url 完整的url地址.
 * @param {function} callback 结果的回调函数.
 */
function httpGet(url, callback) {
    if (kCache[url]) {
        callback(null, kCache[url]);
        return;
    }

    edp.log.info('GET %s', url);

    var req = http.get(url, function(res) {
        if (res.statusCode !== 200) {
            edp.log.warn('GET %s, STATUS CODE = %s',
                url, res.statusCode);
            callback(new Error('httpGet failed, statusCode = ' +
                res.statusCode));
            req.abort();
            return;
        }

        var buffer = [];
        res.on('data', function(d) {
            buffer.push(d);
        });
        res.on('end', function() {
            var body = Buffer.concat(buffer).toString();
            var data = JSON.parse(body);

            kCache[url] = data;

            callback(null, data);
        });
    }).on('error', callback);
}

/**
 * @param {string} name url的后缀部分.
 * @return {string}
 */
function buildUrl(name) {
    var registryUrl = require('edp-config').get('registry') || DEFAULT_REGISTRY;

    return registryUrl + name;
}


if (require.main === module) {
    module.exports(
        'no-such-package',
        path.join(__dirname, '..', 'test', 'tmp'),
        function(error, data) {
            console.log(arguments);
        });
}
