import config from './env.js'
import path from 'path'

const __dirname = path.resolve()
const cpath = __dirname
// Local ENV
config({ path: cpath + '/../../../../.env' })

// Frontier ENV
config({ path: cpath + '/front.env' })

// Getter wrapper
import env from './good-env.js'

export default env
