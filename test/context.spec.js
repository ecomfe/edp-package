/**
 * @file test/context.spec.js ~ 2014/07/31 09:43:46
 * @author leeight(liyubei@baidu.com)
 **/
var factory = require('../lib/context');

describe('context', function(){
    it('compareMap', function(){
        var context = factory.create('/tmp');
        var a = {};
        var b = {};
        expect(context.compareMap(a, b)).toEqual([]);

        a = {a:10, b:30};
        b = {a:20, c:40};
        expect(context.compareMap(a, b)).toEqual([
            'M a',
            'D b',
            'A c'
        ]);
    });
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
