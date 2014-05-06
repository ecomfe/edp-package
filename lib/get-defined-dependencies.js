/**
 * @file 获取已定义的依赖包
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 获取已定义的依赖包
 * 
 * @param {string=} importDir 导入目录
 * @return {Object}
 */
module.exports = function ( importDir ) {
    importDir = importDir || process.cwd();

    var data = null;
    var project = require( 'edp-project' );
    var projectInfo = project.getInfo( importDir );
    if ( projectInfo ) {
        // edp-project/lib/metadata里面处理可package.json和.edpproj/metadata的兼容性问题
        data = project.metadata.get( projectInfo );
    }

    if ( data ) {
        return data.dependencies || null;
    }

    return null;
};
