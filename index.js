const path = __dirname + '/../../'
// Local ENV
require('./lib/env.js').config({path: path + '.env'})

// Frontier ENV
require('./lib/env.js').config({path: path + 'front.env'})

// Getter wrapper
exports.env = require('./lib/good-env.js')
exports.args = require('./lib/args.js')
exports.arsenal = require('./lib/arsenal.js')
//exports.debug = require('./lib/debug.js')
//exports.deliver = require('./lib/deliver.js')
//exports.forgery = require('./lib/forgery.js')
//exports.deploy = require('./lib/deploy.js')
exports.environment = require('./lib/environment.js')
exports.errorHandling = require('./lib/error-handling.js')
exports.github = require('./lib/github.js')
exports.jsonFiles = require('./lib/jsonFiles.js')
exports.kleur = require('./lib/kleur.js')
exports.logger = require('./lib/logger.js')
exports.minimist = require('./lib/minimist.js')
exports.outfitter = require('./lib/outfitter.js')
//exports.require = require('./lib/require.js')
