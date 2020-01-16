require(__dirname + '/outfitter.js')
const { black, red, green, yellow, blue, magenta, cyan, white, gray, grey, bold, dim, underline } = require('./kleur.js')
const argv = require('./args.js')
const exec = require('child_process').execSync

let response = exec('cat ' + __dirname + '/../.env | grep ' + argv.var)
console.log(black(response.toString()))
console.log(red(response.toString()))
console.log(green(response.toString()))
console.log(yellow(response.toString()))
console.log(blue(response.toString()))
console.log(magenta(response.toString()))
console.log(cyan(response.toString()))
console.log(white(response.toString()))
console.log(bold(response.toString()))
console.log(dim(response.toString()))
console.log(underline(response.toString()))

