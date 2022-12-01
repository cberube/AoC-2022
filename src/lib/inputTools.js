const fs = require('fs')

const loadInputFile = filePath => fs.readFileSync(filePath).toString()

module.exports = {
  loadInputFile
}