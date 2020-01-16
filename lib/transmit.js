require(__dirname + '/outfitter.js')
const argv = front('args')
const { env } = front('environment')
const log = front('logger')

/* 
 * Item that we are delivering
**/
const SERVER = env.get('SERVER', 'notset')
const DOMAIN = env.get('DOMAIN')
const SITE_NAME = env.get('SITE_NAME')
const site = SITE_NAME + '.' + DOMAIN

let excludeList = '--exclude node_modules --exclude .git --exclude *.sqlite --exclude .env'
let exec = require('child_process').execSync
if (argv.dry) {
    exec = console.log
    exec('******** DRY RUN *********')
}

if (argv.item === 'app') {
    if (argv.dry) {
        exec(`rsync -Pav --delete ${excludeList} ${argv.dryRun ? '-n' : ''} ${process.cwd()}/ ${SERVER}:${site}`)
    } else {
        let result = exec(`rsync -Pav --delete ${excludeList} ${argv.dryRun ? '-n' : ''} ${process.cwd()}/ ${SERVER}:${site}`)
        console.log(result.toString())
    }

    return 0
}

