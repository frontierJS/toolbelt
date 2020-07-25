import util from 'util'
import Konsole from './konsole.js'
import kleur from './kleur.js'

let red = kleur.red
let green = kleur.green
let yellow = kleur.yellow
let blue = kleur.blue

const konsole = new Konsole('Frontier')
konsole.addDefaultListener()

class Logger {
  log(msg, color) {
    msg = util.inspect(msg, false, null, true /* enable colors */)
    msg = color(msg)
    konsole.log(msg)
    return 0
  }

  info(msg) {
    this.log(msg, blue)
  }
  err(msg) {
    this.log(msg, red)
  }
  good(msg) {
    this.log(msg, green)
  }
  warn(msg) {
    this.log(msg, yellow)
  }
}

export default Logger
