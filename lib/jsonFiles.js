import fs from 'fs'
let _fs = fs
let fromCallback = function (fn) {
  return Object.defineProperty(
    function () {
      if (typeof arguments[arguments.length - 1] === 'function')
        fn.apply(this, arguments)
      else {
        return new Promise((resolve, reject) => {
          arguments[arguments.length] = (err, res) => {
            if (err) return reject(err)
            resolve(res)
          }
          arguments.length++
          fn.apply(this, arguments)
        })
      }
    },
    'name',
    { value: fn.name }
  )
}

let fromPromise = function (fn) {
  return Object.defineProperty(
    function () {
      const cb = arguments[arguments.length - 1]
      if (typeof cb !== 'function') return fn.apply(this, arguments)
      else fn.apply(this, arguments).then((r) => cb(null, r), cb)
    },
    'name',
    { value: fn.name }
  )
}

//const universalify = require('universalify')

function readFileWithCallback(file, options, callback) {
  if (callback == null) {
    callback = options
    options = {}
  }

  if (typeof options === 'string') {
    options = { encoding: options }
  }

  options = options || {}
  const fs = options.fs || _fs

  let shouldThrow = true
  if ('throws' in options) {
    shouldThrow = options.throws
  }

  fs.readFile(file, options, (err, data) => {
    if (err) return callback(err)

    data = stripBom(data)

    let obj
    try {
      obj = JSON.parse(data, options ? options.reviver : null)
    } catch (err2) {
      if (shouldThrow) {
        err2.message = `${file}: ${err2.message}`
        return callback(err2)
      } else {
        return callback(null, null)
      }
    }

    callback(null, obj)
  })
}

const readFile = fromCallback(readFileWithCallback)

function readFileSync(file, options) {
  options = options || {}
  if (typeof options === 'string') {
    options = { encoding: options }
  }

  const fs = options.fs || _fs

  let shouldThrow = true
  if ('throws' in options) {
    shouldThrow = options.throws
  }

  try {
    let content = fs.readFileSync(file, options)
    content = stripBom(content)
    return JSON.parse(content, options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      return null
    }
  }
}

function stringify(obj, options) {
  let spaces
  let EOL = '\n'
  if (typeof options === 'object' && options !== null) {
    if (options.spaces) {
      spaces = options.spaces
    }
    if (options.EOL) {
      EOL = options.EOL
    }
  }

  const str = JSON.stringify(obj, options ? options.replacer : null, spaces)

  return str.replace(/\n/g, EOL) + EOL
}

function writeFileWithCallback(file, obj, options, callback) {
  if (callback == null) {
    callback = options
    options = {}
  }
  options = options || {}
  const fs = options.fs || _fs

  let str = ''
  try {
    str = stringify(obj, options)
  } catch (err) {
    return callback(err, null)
  }

  fs.writeFile(file, str, options, callback)
}

const writeFile = fromCallback(writeFileWithCallback)

function writeFileSync(file, obj, options) {
  options = options || {}
  const fs = options.fs || _fs

  const str = stringify(obj, options)
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

function stripBom(content) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) content = content.toString('utf8')
  content = content.replace(/^\uFEFF/, '')
  return content
}

const jsonFiles = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync,
}

export default jsonFiles
