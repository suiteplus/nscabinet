# nscabinet

Upload/download files to a netsuite account, using the included _restlet_.

_PS: This is actually also a gulp plugin._

## Required

 * node.js 4+

## Quick start
```bash
    npm install nscabinet
```
  - Install the __nscabinet restlet__ bundle in your netsuite account (or manually create the script using the file in the repo)

  - Create a `nsconfig.json` file in the root of you project with at least __email__ , __password__, __account__, __script__ number and __deployment__ number.

## Input options

The parameters may be stored in config files, in environment variables, or passed directly.

For environment variables, prefix the options with "NSCONF_" and write in uppercase.

The following priority is taken for each parameter (using `_.extend`)

 1. Options argument `nscabinet(options)`

 2. `./nsconfig.json`, then `../nsconfig.json`, up to 5 levels.

 2. `~/.ns/nsconfig.json`

 3. Environment variables

For instance, let's say you call `nscabinet({ account : '1234' })`. Even if no e-mail is supplied, we also look up in the sources listed above for it. You may set a `nsconfig.json` for the project without the password, setting the latter machine-wise using an environment variable.

For more info see [nsconfig](https://github.com/suiteplus/nsconfig).


## nscabinet.upload

```javascript

var nscabinet = require('nscabinet') ,
	vinylfs = require('vinyl-fs')
//or require('gulp').
//vinyl is the part of gulp which has .src() and .dst()

vinylfs.src('foo.js')
	.pipe(nscabinet({
		email : 'foo@bar.baz.com' ,
		password : '123456' ,
		account : '123456' ,
		realm : 'sandbox.netsuite.com' ,
		role : 3 ,
		rootPath : '/SuiteScripts/MyProject'
		script : 95 ,
		deployment : 1
	}))

```

 * `realm` defaults to `netsuite.com`.
	
 * `role` defaults to the account's default role.
	
 * `deployment` defaults to 1.
	
 * `rootPath` defaults to `/SuiteScripts`. Must begin with `/`.

## nscabinet.download( files , [opts] )

```javascript

nscabinet.download(['MyProject/*.js','/Web Site Hosting Files/My Site/*.html'])
	.pipe(vinylfs.dest('local'))

```

  * `files` file selector (one or many).
    
    * `*` is accepted on the file part, which is replaced by `%` on the underlying netsuite file search.
    
    * Paths are also relative to `opts.rootPath`. If a file selector begins with `/`, files will be queried
      by absolute path in netsuite, but saved locally inside the `cabinet_root` folder.
  
  * `opts` The same options as seen in upload.


## CLI

	npm install -g nscabinet

```bash
$ nscabinet u "file.txt" --rootpath "/SuiteScripts/MyProject"
$ nscabinet u "file.txt" -p "/SuiteScripts/MyProject"
$ nscabinet u "file.txt"
$ nscabinet d "remote.txt" --rootPath "/Downloads"
$ nscabinet d "remote.txt" -p "/Downloads"
$ nscabinet d "remote.txt"
```

Takes in the same arguments (lowercased).

Encase path parameters in string quotes (avoids bash expansion).

As usual, the arguments are defaulted from `nsconfig.json`.

Sent file paths are taken relative to the config file path. Ex:

```bash
$ nscabinet u file.txt
Uploading file.txt to /SuiteScripts
$ cd Views
$ Views nscabinet u view.html
Uploading Views/view.html to /SuiteScripts
```

## Gulp tasks

**gulp/development.js** is for straightforward tasks: lint and unit tests.

**gulp/test.js** is for more involved things.