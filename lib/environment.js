const path = __dirname
// Local ENV
require('./env.js').config({path: path + '/../../../../.env'})

// Frontier ENV
require('./env.js').config({path: path + '/front.env'})

// Getter wrapper
exports.env = require('./good-env.js')
