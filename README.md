# nscabinet [![NPM version][npm-image]][npm-url]

Upload/download files to a netsuite account, using the included _restlet_.

_PS: This is actually also a gulp plugin._

## Required [![Dependency Status][david-image]][david-url] [![devDependency Status][david-image-dev]][david-url-dev]

 * node.js 4+



## Quick start
```bash
    npm install suiteplus/nscabinet
```
> **WARNING**:  The version on npm is outdated, use the command above to install from Github

  - Install the __nscabinet restlet__ bundle in your netsuite account (or manually create the script using the file in the repo) *

  - Create a `nsconfig.json` file in the root of you project with at least __email__ , __password__, __account__, __script__ number and __deployment__ number.

  - Use it with gulp or with the CLI (see CLI section below)


```javascript
var nscabinet = require('nscabinet');
gulp.src('myProject/dist/**/*.js').pipe(nscabinet({ rootPath : '/Templates' }));
```
_(*) if installing from the bundle, the minor version must match your current version of nscabinet_

---

## Accepted input ways

The parameters may be stored in config files, in environment variables,
or passed directly as object.

For environment variables, prefix the options with "NSCONF_" and write in uppercase.

The following priority is taken for each parameter (using `_.extend`)

 1. Options argument `nscabinet(options)`

 2. `./nsconfig.json`, then `../nsconfig.json`, up to 5 levels.

 2. `~/.ns/nsconfig.json`

 3. Environment variables

For instance, let's say you call `nscabinet({ account : '1234' })`. Even if no e-mail is supplied, we also look up in the sources listed above for it. You may set a `nsconfig.json` for the project without the password, setting the latter machine-wise using an environment variable.


## Common parameters

The following parameters are common through most of the methods:

__Connection__

 * `realm` defaults to `netsuite.com`.  _(No longer used, now using account specific domain based on account #)_

 * `role` defaults to the account's default role.

 * `account`

 * `email`

 * `password`

 * `script`

 * `deployment` defaults to 1.

 * `conffile` overrides default `nsconfig.json` file name, allowing multiple project setting.

__Path__

 * `rootPath` sets the root path on the server. Defaults to `/SuiteScripts`. Must begin with `/`.

Example: Upload file with path `img/image.jpg` to rootPath `/Templates` will "upsert" the file
onto '/Templates/img/image.jpg'.

__Token Based Authentication__

 * `consumerKey`

 * `consumerSecret`

 * `token`

 * `tokenSecret`

Setup:
 - Enable Token-based Authentication (Enable Features > SuiteCloud > Manage Authentication)
 - Create an integration record to generate a consumer key and secret
 - Generate a user token (must enable a role with User Access Tokens permission - Administrator role cannot be used)

The email and password are ignored when token based authentication is used.  (They are still required but can just have placeholder values)

## nscabinet.upload

```javascript

var nscabinet = require('nscabinet') ,
	gulp = require('gulp') //or just vinyl-fs

gulp.src('foo.js')
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

 * `isonline` (boolean) lets you set the uploaded files to be avaliable
   without login.

 * `flatten` all files are uploaded to the root path, regardless of their source path.

## nscabinet.download( files , [opts] )

```javascript
nscabinet.download(['MyProject/*.js','/Web Site Hosting Files/My Site/*.html'])
	.pipe(vinylfs.dest('local'))

```

  * `files` file selector (one or many).

    * `*` is accepted on the file part. The restlet then runs a file search by name
      in which `*` is replaced with `%`.

    * Paths are also relative to `opts.rootPath`. If a file selector begins with `/`, files will be queried
      by absolute path in netsuite, but saved locally inside the `cabinet_root` folder.

    * If a path has `/**/`, a recursive search will be done. This can be used to search
      just by file name, regardless of path.

    * (PS: While the syntax is similar, don't expect full glob funcionality. It's not a glob!)


  * `opts` Common options.


## nscabinet.url ( file : string , [opts] ) : Promise[string]

Get the url (internal or external) of a cabinet file. Returns a promise.
Useful for email campaign stuff.

Options: receives the ones which make sense here (ex: rootPath, realm, etc...) in the
same fashion.

```javascript
nscabinet.url('emails/img/header.jpg').then( url => {
    cheerio_img.attr(src,url);
    return cheerio_doc.html();
});
```

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

Takes in the same arguments (always lowercased).

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

## Contributing

 - If you add new funcionality, also add a new test!

At the time tests are run locally. To set up the tests:

 - Install the restlet in an available account;

 - Set up nsconfig.json, pointing to that account; Don't forget to set
   a rootPath to where the tests will play around and create its lots of files;

 - Run 'gulp'



[npm-url]: https://npmjs.org/package/nscabinet
[npm-image]: http://img.shields.io/npm/v/nscabinet.svg

[david-url]: https://david-dm.org/suiteplus/nscabinet
[david-image]: https://david-dm.org/suiteplus/nscabinet.svg

[david-url-dev]: https://david-dm.org/suiteplus/nscabinet#info=devDependencies
[david-image-dev]: https://david-dm.org/suiteplus/nscabinet/dev-status.svg