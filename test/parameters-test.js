var fs = require('fs'),
    checkParams = require('../.').checkParams,
    should = require('should'),
    osenv = require('osenv'),
    cp = require('cp'),
    rimraf = require('rimraf')

function myrand() {

    return Math.ceil(Math.random() * 1000)

}

describe('Reading the config files... ', () => {

    function cpIfExists(path, inverse) {
        var ext1 = inverse ? '.temp' : ''
        var ext2 = inverse ? '' : '.temp'
        if (fs.existsSync(path+ext1)) {
            cp.sync(path + ext1, path + ext2)
        }
    }


    //backups your files
    before(() => {
        try {
            fs.mkdirSync(`${osenv.home()}/.ns`)
        } catch (e) {
            if (e.code != 'EEXIST') throw e
        }

        cpIfExists(`${osenv.home()}/.ns/nsconfig.json`)
        cpIfExists('./nsconfig.json')

        var envBackup = Object.keys(process.env).reduce((prev, key) => {
            if (key.startsWith('NSCONF_')) prev[key] = process.env[key]
            return prev
        }, {})

        fs.writeFileSync('nsconfigenv.json.temp', JSON.stringify(envBackup))
    })


    //restores your files
    after(() => {
        cpIfExists(`${osenv.home()}/.ns/nsconfig.json`, true)
        cpIfExists('./nsconfig.json', true)

        try {
            var envBackup = fs.readFileSync('nsconfigenv.json.temp')
            envBackup = JSON.parse(envBackup)
            Object.keys(envBackup).forEach(key => {
                process.env[key] = envBackup[key]
            }, {})
        } catch (e) {
            //ignore for now
        }

        //rimraf.sync(`${osenv.home()}/.ns/nsconfig.json.temp`)
        //rimraf.sync('./nsconfig.json.temp')
        rimraf.sync('./nsconfig.json')
        //rimraf.sync('nsconfigenv.json.temp')
    })


    beforeEach(() => {
        fs.writeFileSync(`${osenv.home()}/.ns/nsconfig.json`, '')
        fs.writeFileSync('./nsconfig.json', '')
        Object.keys(process.env).forEach(key => {
            if (key.startsWith('NSCONF_')) process.env[key] = ''
        })
    })


    it('reads email from global config file', () => {
        var name = `globalemail${myrand()}`

        fs.writeFileSync(`${osenv.home()}/.ns/nsconfig.json`,
            JSON.stringify({email: name})
        )
        var params = checkParams({}, true)

        should(params).have.property('email', name)
    })


    it('reads email from local config file', () => {
        var name = `localemail${myrand()}`

        fs.writeFileSync('./nsconfig.json',
            JSON.stringify({email: name})
        )
        var params = checkParams({}, true)

        should(params).have.property('email', name)
    })


    it('reads email from environment variable', () => {
        var name = `localemail${myrand()}`
        process.env.NSCONF_EMAIL = name
        var params = checkParams({}, true)

        should(params).have.property('email', name)
    })


    it('overrides global setting with local ones', () => {
        var nameGlobal = `globalemail${myrand()}`
        fs.writeFileSync(`${osenv.home()}/.ns/nsconfig.json`,
            JSON.stringify({email: nameGlobal})
        )

        var nameLocal = `localemail${myrand()}`
        fs.writeFileSync(`./nsconfig.json`,
            JSON.stringify({email: nameLocal})
        )

        var params = checkParams({}, true)

        should(params).have.property('email', nameLocal)
    })

})