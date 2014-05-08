/**
 * @file 拷贝cache中的包到dep下
 * @author errorrik[errorrik@gmail.com]
 */
 
var project = require( 'edp-project' );
var fsExtra = require('fs.extra');
/**
 * 拷贝cache中的包到dep下, 并删除temp目录
 * 
 * @return {string} 
 */
module.exports = function (depDir) {
    return function (err, packData) {
        if (err) {
            console.log(err);
            return;
        }
        var projectDep = require( './get-dependencies-dir' )( process.cwd() );
        var path = require('path');

        console.log(depDir, '>>>', projectDep);
        fsExtra.copyRecursive(depDir, projectDep, function () {
            // 成功后更新项目信息
            var projectInfo = project.getInfo( projectDep );
            if ( projectInfo ) {
                project.module.updateConfig( projectInfo );
                project.loader.updateAllFilesConfig( projectInfo );
                project.style.updatePackageImport( projectInfo );
            }
            console.log('removing temp folder: ' + depDir)
            fsExtra['delete'](path.join(depDir, '..'));
        });
    };
};