/**
 * @file lib/search.js ~ 2014/10/10 11:21:46
 * @author leeight(liyubei@baidu.com)
 * edp search的功能
 **/
var http = require('http');
var util = require('util');

var edp = require('edp-core');

/**
 * @type {Array.<string>} args 查询的参数
 */
exports.run = function(args) {
    http.get('http://edp-registry.baidu.com/-/all', function(res) {
        var buffer = [];
        res.on('data', function(chunk) {
            buffer.push(chunk);
        });
        res.on('end', function() {
            var raw = JSON.parse(Buffer.concat(buffer).toString());
            var items = filter(flatten(raw), args);
            if (!items.length) {
                console.error('Nothing found.');
                return;
            }

            items.forEach(function(x) {
                var versions = [];
                Object.keys(x.versions).forEach(function(v) {
                    versions.push(edp.util.colorize(v + '(' + x.versions[v] + ')', 'title'));
                });

                console.log(util.format('%s: %s',
                    x.name,
                    formatDate(new Date(x.time.modified))));
                console.log('  %s', x.description);
                console.log('  版本：%s', versions.join(', '));
            });
        });
    }).on('error', function(e) {
        edp.log.fatal(e);
    });
};

function formatDate(t) {
    var year = t.getFullYear();
    var month = t.getMonth() + 1;
    var day = t.getDate();
    var hour = t.getHours();
    var minute = t.getMinutes();
    var second = t.getSeconds();

    function pad(e) {
        return (e < 10) ? '0' + e : e;
    }

    return year + '/' + pad(month) + '/' + pad(day) + ' '
        + pad(hour) + ':' + pad(minute) + ':' + pad(second);
}

function flatten(object) {
    var items = [];
    Object.keys(object).forEach(function(x) {
        if (x !== '_updated') {
            items.push(object[x]);
        }
    });

    items.sort(function(a, b) {
        var am = new Date(a.time.modified);
        var bm = new Date(b.time.modified);

        return bm.getTime() - am.getTime();
    });

    return items;
}

function filter(items, keywords) {
    if (!keywords.length) {
        items.forEach(function(item) {
            item.name = edp.util.colorize(item.name, 'success');
        });
        return items;
    }

    return items.filter(function(item) {
        var name = item.name;
        for (var i = 0; i < keywords.length; i ++) {
            if (name.indexOf(keywords[i]) !== -1) {
                item.name = name.replace(keywords[i],
                    edp.util.colorize(keywords[i], 'success'));
                return true;
            }
        }
    });
}










/* vim: set ts=4 sw=4 sts=4 tw=120: */
