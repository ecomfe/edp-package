# edp-package

[![Build Status](https://travis-ci.org/ecomfe/edp-package.png?branch=master)](https://travis-ci.org/ecomfe/edp-package) [![Dependencies Status](https://david-dm.org/ecomfe/edp-package.png)](https://david-dm.org/ecomfe/edp-package)

Package for edp package manage.

## Usage

```javascript
var edpPackage = require( 'edp-package' );
edpPackage.importFromRegistry( 
    'er', 
    process.cwd(), 
    function ( error, pkg ) {
        if ( !error ) {
             console.log( 'ER is imported!' );
        }
    } 
);
```

## API


### defineDependency( name, version, importDir )

添加依赖包声明.

- `name` {string}
- `version` {string}
- `importDir` {string=}


### fetch( name, toDir, callback )

从registry获取包.

- `name` {string}
- `toDir` {string}
- `callback` {Function=}


### getDefinedDependencies( importDir )

获取已定义的依赖包.

- `importDir` {string}


### getImported( importDir )

获取当前已导入的包列表.

- `importDir` {string}


### importDependencies( name, version, importDir, callback )

为包导入其依赖.

- `name` {string}
- `version` {string}
- `importDir` {string=}
- `callback` {Function=}


### importFromFile( file, importDir, callback )

从本地文件导入包.

- `file` {string}
- `importDir` {string=}
- `callback` {Function=}


### importFromRegistry( name, importDir, callback )

从registry导入包.

- `name` {string}
- `importDir` {string=}
- `callback` {Function=}

### importFromPackage( file, options )

从`package.json`中导入包

- `file` {string}
- `options` {Object=}
- `options.older` {boolean=}
- `options.saveDev` {boolean=}
- `options.importDir` {string=}
- `options.callback` {Function=}


### search( keyword, callback )

查询registry中的包.

- `keyword` {string=}
- `callback` {Function=}


### update( name, importDir, callback )

更新包.

- `name` {string=}
- `importDir` {string=}
- `callback` {Function=}


