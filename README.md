# nscabinet

Upload files to a netsuite account, using the included _restlet_.

## Usage

```javascript

var up = require('nscabinet') ,
	vinyl = require('vinyl-fs')

vinyl.src('foo.js')
	.pipe(up({
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

 * `realm` is optional. Defaults to `system.netsuite.com`.
	
 * `role` is optional. Defaults to the account's default role.
	
 * `script` and `deployment` may also take the scriptId (i.e. `customscript_something`) as parameter.
	
 * `deployment` is optional. Defaults to 1.
	
 * `rootPath` is optional. Defaults to `SuiteScripts`. May also take a number as input.

 ## Input

The parameters may be stored in `~/ns/config.json` or in environment variables.

For environment variables, prefix the options with "NSCONF_" and write in uppercase.

The following priority is taken for each parameter (using `_.extend`)

 1. Direct code input

 2. `./nsconfig.json`

 2. `~/.ns/nsconfig.json`

 3. Environment variables
