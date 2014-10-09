/**
 * @file 从本地文件导入包
 * @author errorrik[errorrik@gmail.com]
 */
var fs = require('fs');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var edp = require('edp-core');
var semver = require('semver');

var pkg = require('./pkg');


/**
 * 从本地文件导入包
 *
 * @param {ProjectContext} context
 * @param {string} file 包名称
 * @param {Function} callback 回调函数
 */
module.exports = function(context, file, callback) {
    var extractMethod;
    var extract = require('./util/extract');
    var fileExtname = path.extname(file).slice(1);
    switch (fileExtname) {
        case 'gz':
        case 'tgz':
            extractMethod = extract.tgz;
            break;
        case 'zip':
            extractMethod = extract.zip;
            break;
        default:
            throw new Error(fileExtname + ' file is not supported!');
    }

    // XXX 这里的depDir不是项目的dep目录，而是一个临时创建的项目中dep目录
    // lib/util/get-temp-import-dir.js 会创建一个临时的目录，临时目录中存在
    // tmpdir/
    //   .edpproj/
    //   dep/
    var depDir = context.getShadowDependenciesDir();
    var tempDir = path.resolve(depDir, pkg.getTempName());

    var tasks = [
        extractArchive(file, tempDir, extractMethod),
        moveToTargetDirectory(context, tempDir),
        pkg.importDependencies(context)
    ];
    async.waterfall(tasks, callback);
};

/**
 * 解压到临时的目录
 */
function extractArchive(file, tempDir, method) {
    return function(callback) {
        try {
            method(file, tempDir, function() {
                if (!fs.existsSync(tempDir)) {
                    // 压缩包解压失败了？
                    callback(new Error(file + ' decompress failed!'));
                    return;
                }

                callback(null);
            });
        }
        catch (ex) {
            callback(ex);
        }
    };
}

/**
 * 把临时目录重名为目标目录
 * 在layout == 'v2'的情况下，tempDir可能是老的，当前的target可能是新的
 */
function moveToTargetDirectory(context, tempDir) {
    return function(callback) {
        var v2 = context.layout === 'v2';

        var packageInfo = require('./util/get-package-info')(tempDir);

        var dstname = context.getPackageDstName(packageInfo.name);
        var version = packageInfo.version;
        var target = v2
                     ? path.join(tempDir, '..', dstname)
                     : path.join(tempDir, '..', dstname, version);

        if (v2) {
            // 重命名的方式直接拷贝过去即可.
            // TODO(user) 如果是 edp import pkg@old 那么可以直接覆盖当前 new 的版本
            // TODO(user) 如果是 edp update 的话，那么就不要覆盖当前 new 的版本了
            var currentPackageInfo = require('./util/get-package-info')(target);
            if (!currentPackageInfo || semver.gt(version, currentPackageInfo.version)) {
                // 在 update 的情况只有当 tempDir 的版本大于当前版本，才会覆盖
                require('./pkg').copyDirectory(tempDir, target);
            }
            edp.util.rmdir(tempDir);
        }
        else {
            if (fs.existsSync(target)) {
                // 如果目标包目录已经存在，不进行操作
                // 只需要删除当前的临时目录即可
                edp.util.rmdir(tempDir);
            }
            else {
                mkdirp.sync(path.dirname(target));
                fs.renameSync(tempDir, target);
            }
        }

        // 放一个文件，里面是包中所有文件的MD5码，以便升级时可以做一下
        // 对比看有哪些文件被本地修改过
        require('./util/get-package-md5sum')(
            target,
            function(err, md5sum) {
                if (err) {
                    callback(err);
                    return;
                }

                // 将MD5码放在上一级目录
                var md5file = v2 ? dstname + '.md5' : version + '.md5';
                fs.writeFileSync(
                    path.resolve(target, '..', md5file),
                    JSON.stringify(md5sum, null, 4)
                );

                callback(null, packageInfo);
            });
    };
}

if (require.main === module) {
    (function() {
        var ctx = require('./context').create(
            path.join(__dirname, '..', 'test', 'tmp', 'dummy-project'));
        ctx.setAliasMap({ er: 'er3' });
        module.exports(
            ctx, 'test/tmp/er-3.1.0-beta.4.tgz',
            function(error, data) {
                console.log(arguments);
            });
    })();
}
