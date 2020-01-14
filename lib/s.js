require(__dirname + '/outfitter.js')
const argv = require('./args.js')()
const exec = require('child_process').execSync
//const fs = require('fs')
//const readline = require('readline');

//const rl = readline.createInterface({
  //input: fs.createReadStream(__dirname + '/front.env'),
  //output: process.stdout
//});


//rl.on('line', line => {
    //console.log(`Received: ${line}`)
//})

if (argv.var) {
    let value = argv.value ? argv.value : true
    exec(`echo ${argv.var}=${value} >> ${__dirname}/../.env`)
}

