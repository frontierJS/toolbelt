//TODO add pretty debug colors
require(__dirname + '/outfitter.js')
const argv = front('args')()
const { env } = front('environment')


//TODO: move these to system .env as needed
const DOMAIN = env.get('DOMAIN')
const SITE_NAME = env.get('SITE_NAME')
const PORT = env.get('PORT', 3333)
const SERVER = env.get('SERVER', 'notset')
const SERVER_IP = env.get('SERVER_IP', null)
const TEMPLOC = env.get('TEMPLOC')
const file = __dirname + '/config/' + SITE_NAME + '_nginx.conf'
const template = __dirname + '/dep/template_nginx.conf'

const serverFile = SITE_NAME + '.' + DOMAIN
const site = SITE_NAME + '.' + DOMAIN

let exec = require('child_process').execSync

if (argv.dry) {
    exec = console.log
    exec('******* DRY RUN *********')
}

// copy template
// replace siteName in template

if (SERVER === 'notset' || !TEMPLOC) {
    console.log('Server not set in ENV file.')
    return 1
}

// Create Base Nginx Template
console.log('----------- Creating nginx file...')
exec(`cp ${template} ${file}`)
exec(`echo '${SITE_NAME} future site' > ${__dirname}/config/index.html`)

// Customize for new site name and root domain
console.log('----------- Customizing nginx file based on .env SITE_NAME and DOMAIN')
exec(`sed -i 's/{{site}}/${SITE_NAME}/' ${file}`)
exec(`sed -i 's/{{domain}}/${DOMAIN}/' ${file}`)
exec(`sed -i 's/{{port}}/${PORT}/' ${file}`)


// TODO: add checks to prevent chaos
//
// Create base directory for site and link to index.html
console.log('----------- Creating directory on server')
exec(`ssh ${SERVER} mkdir -p /home/forge/${site}/dist`)
exec(`ssh ${SERVER} touch /home/forge/${site}/dist/index.html`)
exec(`scp ${__dirname}/config/index.html ${SERVER}:/home/forge/${site}/dist/`)
exec(`scp ${file} ${SERVER}:${TEMPLOC}/${serverFile}`)
exec(`ssh ${SERVER} ln -s /home/forge/${site}/dist/index.html /home/forge/${site}/index.html`)

// Active conf on server
console.log('----------- Activating nginx and restarting nginx service')
exec(`scp ${file} ${SERVER}:${TEMPLOC}/${serverFile}`)
exec(`ssh ${SERVER} sudo mv ${TEMPLOC}/${serverFile} /etc/nginx/sites-available`)
exec(`ssh ${SERVER} sudo ln -s /etc/nginx/sites-available/${serverFile} /etc/nginx/sites-enabled/${serverFile}`)
exec(`ssh ${SERVER} sudo service nginx restart`)

// Create alias on cloudflare
console.log('----------- Creating alias in Cloudflare.....')
if (SITE_NAME && SERVER_IP) {
    exec = require('child_process').execSync
    exec(`cfcli -a -t A add ${SITE_NAME} ${SERVER_IP}`)
}

console.log('----------- Site Creation done!')
