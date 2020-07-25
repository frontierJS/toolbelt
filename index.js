import { existsSync } from 'fs'
import path from 'path'
import config from './lib/env.js'

const cwd = process.cwd() + '/'
const __dirname = path.resolve()
const cpath = __dirname + '/../../'

// Local ENV and if not check for api one level down or parallel
let envSource = {
  sources: [
    { source: 'api', file: '.env' },
    { source: 'app', file: '../api/.env' },
    { source: 'frontier', file: 'api/.env' },
  ],
  load: function () {
    this.sources.forEach(({ source, file }) => {
      if (existsSync(cwd + file)) {
        console.log('Loading from ... ' + source + ' and file ' + file)
        config({ path: cwd + file })
        return
      }
    })
  },
}

envSource.load()

// Frontier ENV
config({ path: cpath + 'front.env' })

import env from './lib/good-env.js'
import dotenv from './lib/env.js'
import args from './lib/args.js'
import arsenal from './lib/arsenal.js'
// import environment from './lib/environment.js'
import errorHandling from './lib/error-handling.js'
import github from './lib/github.js'
import jsonFiles from './lib/jsonFiles.js'
import kleur from './lib/kleur.js'
import logger from './lib/logger.js'
import minimist from './lib/minimist.js'
import outfitter from './lib/outfitter.js'
import til from './lib/til.js'
export {
  env as default,
  dotenv,
  args,
  arsenal,
  errorHandling,
  github,
  jsonFiles,
  kleur,
  logger,
  minimist,
  outfitter,
  til,
}
// Getter wrapper

//exports.debug = require('./lib/debug.js')
//exports.deliver = require('./lib/deliver.js')
//exports.forgery = require('./lib/forgery.js')
//exports.deploy = require('./lib/deploy.js')
//exports.require = require('./lib/require.js')
