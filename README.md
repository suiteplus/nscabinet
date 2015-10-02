# nscabinet  [![NPM version][npm-image]][npm-url]

Upload/download files to a netsuite account, using the included _restlet_.

## Required
 * node.js 4+

## Install
```bash
    npm install nscabinet
```

## nscabinet.upload

```javascript

var nscabinet = require('nscabinet') ,
	vinylfs = require('vinyl-fs')

vinylfs.src('foo.js')
	.pipe(nscabinet({
		email : 'foo@bar.baz.com' ,
		password : '123456' ,
		account : '123456' ,
		realm : 'sandbox.netsuite.com' ,
		role : 3 ,
		rootPath : 'SuiteScripts/MyProject'
		script : 95 ,
		deployment : 1
	}))

```

 * `realm` defaults to `system.netsuite.com`.
	
 * `role` defaults to the account's default role.
	
 * `deployment` defaults to 1.
	
 * `rootPath` defaults to `/SuiteScripts`. Must begin with `/`.

## nscabinet.download( files , [opts] )

```javascript

nscabinet.download(['MyProject/*.js','/Web Site Hosting Files/My Site/*.html'])
	.pipe(vinylfs.dest('local'))

```

  * `files` file selector (one or many).
    
    * `*` is accepted on the file part, which is replaced by `%` on the netsuite file search.
    
    * Paths are also relative to `opts.rootPath`. If a file selector begins with `/`, files will be queried
      by absolute path in netsuite, but saved locally inside the `cabinet_root` folder.
  
  * `opts` The same options as seen in upload.


## Input options

The parameters may be stored in `~/ns/nsconfig.json` or in environment variables.

For environment variables, prefix the options with "NSCONF_" and write in uppercase.

The following priority is taken for each parameter (using `_.extend`)

 1. Direct code input

 2. `./nsconfig.json`

 2. `~/.ns/nsconfig.json`

 3. Environment variables


[npm-url]: https://npmjs.org/package/nscabinet
[npm-image]: http://img.shields.io/npm/v/nscabinet.svg


## CLI

	npm install -g nscabinet

```bash
$ nscabinet u file.txt  --rootpath /SuiteScripts/MyProject
$ nscabinet u file.txt -p /SuiteScripts/MyProject
$ nscabinet u file.txt
$ nscabinet d remote.txt --rootPath /Downloads
$ nscabinet d remote.txt -p /Downloads
$ nscabinet d remote.txt
```

Takes in the same arguments (lowercased).

As usual, the arguments are defaulted from `nsconfig.json`.