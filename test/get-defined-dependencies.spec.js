/**
 * @file get-defined-dependencies.spec.js ~ 2014/07/28 15:07:36
 * @author leeight(liyubei@baidu.com)
 **/
var path = require('path');
var kData = path.join(__dirname, 'data');
var kP1Dir = path.join(kData, 'p1');
var kP2Dir = path.join(kData, 'p2');
var kExpected = {
    'ef' : '3.x',
    'er' : '3.x',
    'mini-event' : '1.x',
    'etpl' : '2.x',
    'esui' : '3.x',
    'underscore' : '1.x',
    'moment' : '2.x',
    'esf-ms' : '1.x',
    'est' : '1.x',
    'bat-ria' : '0.x',
    'urijs' : '1.x',
    'jquery' : '1.x',
    'echarts' : '1.x',
    'zrender' : '1.x',
    'jquery.cookie' : '1.x'
};

var api = require('../lib/pkg').getDefinedDependencies;

describe('get-defined-dependencies', function(){
    it('old format', function(){
        // 读取的是.edpproj/metadata/dependencies的内容
        expect(api(kP1Dir)).toEqual(kExpected);
    });
    it('new format', function(){
        // 读取的是 package.json/edp/dependencies的内容
        expect(api(kP2Dir)).toEqual(kExpected);
    });
    it('invalid', function(){
        expect(api(kData)).toEqual(null);
    });
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
