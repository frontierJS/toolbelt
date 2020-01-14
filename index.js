const path = __dirname + '/../../'
// Local ENV
console.log({path})
require('./lib/env.js').config({path: path + '.env'})

// Frontier ENV
require('./lib/env.js').config({path: path + 'front.env'})

// Getter wrapper
exports.env = require('./lib/good-env.js')
