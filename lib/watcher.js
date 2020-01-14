const fs = require('fs');
const exec = require('child_process').exec

const buttonPressesLogFile = './frontier.log';

console.log(`Watching for file changes on ${buttonPressesLogFile}`);

fs.watch(buttonPressesLogFile, (event, filename) => {
  if (filename) {
      console.log(event)
    console.log(`${filename} file Changed`)
    exec('npm run test', (err, out, stdout) => {
        console.log( {out, err})
    })
  }
})
