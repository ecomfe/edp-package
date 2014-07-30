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


### getImported( projectDir )

获取当前已导入的包列表.

- `projectDir` {string}

### importFromFile( file, projectDir, callback )

从本地文件导入包.

- `file` {string}
- `projectDir` {string=}
- `callback` {Function=}


### importFromRegistry( name, projectDir, callback )

从registry导入包.

- `name` {string}
- `projectDir` {string=}
- `callback` {Function=}
