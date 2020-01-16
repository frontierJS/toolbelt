//TODO:IMPROV make paths array to make things relative?
require(__dirname + '/outfitter.js')

// 3 ways of doing it
const argv = front('args')
const { env } = front('environment')
const log = front('logger')

log.info({target: argv.target})

//for pushing code
//rsync -Pav --delete . ${SERVER}:${site}
//but maybe use git repos?
//
const DOMAIN = env.get('DOMAIN')
const SITE_NAME = env.get('SITE_NAME')
const SERVER = env.get('SERVER', 'notset')
const TEMPLOC = env.get('TEMPLOC')
const site = SITE_NAME + '.' + DOMAIN


let exec = require('child_process').execSync
if (argv.dry) {
    exec = console.log
    exec('******** DRY RUN *********')
}

let deploy = target => {
    if (!target) {
        exec('No target specified')
        return 1
    }
    if (target === 'idea') {
        exec('doing somethin')
        exec(`testing`)
        return 0
    }
    if (target === 'test') {
        exec('npm run site:build')
        exec(`scp -r dist ${SERVER}:${site}`)
        return 0
    }
    if (target === 'stage') {
        exec('npm run site:build')
        exec(`scp -r dist ${SERVER}:${site}`)
        return 0
    }

}
