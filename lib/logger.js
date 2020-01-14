const util = require('util')
const Konsole = require('./konsole.js')
const konsole = new Konsole("Frontier")
konsole.addDefaultListener();
let { black, red, green, yellow, blue, magenta, cyan, white, gray, grey, bold, dim, underline } = require('./kleur.js')

class Logger {
    log(msg, color) {
        msg = util.inspect(msg, false, null, true /* enable colors */)
        msg = color(msg)
        konsole.log(msg)
        return 0
    }

    info(msg) { this.log(msg, blue)}
    err(msg) { this.log(msg, red)}
    good(msg) {this.log(msg, green)}
    warn(msg) { this.log(msg, yellow)}

}

module.exports = new Logger()
