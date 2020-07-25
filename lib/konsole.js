import util from 'util'
var format = util.format
import events from 'events'
var EventEmitter = events.EventEmitter
var version = '2.2.0'
var pattern = new RegExp(
  /^at (([^ ]+) )?(\(?([^:]+)*:([0-9]+)*:([0-9]+)*\)?)?$/g
)
var slice = Array.prototype.slice
var globalEventName = 'message'
var loglevels = ['log', 'info', 'warn', 'error']
var proxies = ['dir', 'time', 'timeEnd', 'trace', 'assert']
var times = {}
var emptyStack = { object: null, path: null, line: null, char: null }
var prevTime = {}

/**
 * Default Listener for Konsole
 * @param level String Level used for logging. log|info|warn|error
 * @param args Array Original arguments of the konsole.* call
 */
function defaultListener(level, args) {
  var trace = this.trace // trace is a getter, if you do not access the property it will not generate a trace
  this.write(
    ' ' +
      this.label +
      ' ' +
      this.processType +
      ':' +
      this.pid +
      ' ' +
      level.toUpperCase() +
      ' ' +
      '+' +
      this.diff +
      'ms ' +
      (trace.path ? '(' + trace.path : '') +
      (trace.line ? ':' + trace.line + ') ' : '') +
      "\n'" +
      this.format.apply(this, args) +
      "'"
  )
}

function parseStackLine(line) {
  var match,
    stack = []
  while ((match = pattern.exec(line))) {
    stack.push({
      object: match[2] || null,
      path: match[4] || null,
      line: match[5] || null,
      char: match[6] || null,
    })
  }
  return stack[0] || emptyStack
}

function getTrace() {
  return parseStackLine(getTraceLine())
}

function getTraceLine() {
  var err = new Error()
  Error.captureStackTrace(err, arguments.callee)
  var stack = err.stack.split('\n'),
    i = 0,
    l = stack.length,
    line
  for (l; l > i; l--) {
    line = (stack[l] || '').trim()
    if (line.match(/\(\/|\\.+\)/)) return line
  }
}

function getDiff(label) {
  var curr = new Date(),
    diff = curr - (prevTime[label] || curr)
  prevTime[label] = curr
  return diff
}

function Konsole(label) {
  EventEmitter.call(this)
  this._label = label || ''
  this._processType = process.env.NODE_WORKER_ID ? 'worker' : 'master'
}
util.inherits(Konsole, EventEmitter)

loglevels.forEach(function (funcName) {
  Konsole.prototype[funcName] = function () {
    var args = slice.call(arguments) || [],
      level = funcName
    this.emit(globalEventName, level, args)
    this.emit(level, args)
  }
})
proxies.forEach(function (funcName) {
  Konsole.prototype[funcName] = function () {
    return console[funcName].apply(console, arguments)
  }
})

Konsole.prototype.write = function () {
  process.stdout.write(format.apply(this, arguments) + '\n')
}
Konsole.prototype.format = function () {
  return format.apply(this, arguments)
}
Konsole.prototype.relay = function () {
  var that = this,
    origins = slice.call(arguments)
  origins.forEach(function (origin) {
    that.listeners(globalEventName).forEach(function (listener) {
      origin.on(globalEventName, listener)
    })
  })
}
Konsole.prototype.version = version
Konsole.prototype.addDefaultListener = function () {
  this.on(globalEventName, defaultListener)
}
Konsole.prototype.__defineGetter__('trace', function () {
  return getTrace.call(this)
})
Konsole.prototype.__defineGetter__('diff', function () {
  return getDiff.apply(this, [this.label])
})
Konsole.prototype.__defineGetter__('processType', function () {
  return this._processType
})
Konsole.prototype.__defineGetter__('pid', function () {
  return process.pid
})
Konsole.prototype.__defineGetter__('label', function () {
  return this._label || ''
})
Konsole.prototype.time = function (label) {
  times[label] = Date.now()
}
Konsole.prototype.timeEnd = function (label) {
  var duration = Date.now() - times[label]
  this.log('%s: %dms', label, duration)
}
export default Konsole
