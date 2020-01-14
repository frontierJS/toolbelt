const fs = require('fs')
const path = require('path')

module.exports.createFile = (file, content) => {
    fs.promises.mkdir(path.dirname(file), {recursive: true}).then(x => fs.promises.writeFile(file, content))
    console.log(`Created file ${file}`)
}
