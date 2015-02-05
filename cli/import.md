import
---------

### Usage

    edp import <name>[@version]
    edp import <localfile>
    edp import <http://git.baidu.com/bec/web/repository/archive.tar.gz?ref=1.0.0>
    edp import <package.json> [--older] [--save-dev] [--force] [--alias=dirname]


### Description

导入包。将包导入到本地开发环境，默认为`dep`目录。

+ 如果`当前目录`处于`项目目录`下，将导入`项目目录`下的`dep`目录，更新`项目目录`下的`module.conf`文件，并自动更新项目中所有HTML的`require.config`配置。
+ 如果`当前目录`不处于`项目目录`下，将导入`当前目录`下的`dep`目录。

默认情况下`import`从`http://edp-registry.baidu.com`导入包。从本地文件导入包时，`localfile`支持`.zip`、`.tar.gz`、`.tgz`文件。

支持从`package.json`文件导入包，同时有两个可选参数：`--older`表示只导入最低版本的包；`--save-dev`表示同时导入`devDependencies`。

默认情况下，导入之后，`dep`目录下面的名字是包的名字，可以通过`--alias`更改默认的目录名。

