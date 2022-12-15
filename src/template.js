const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

function application() {
  const lines = data.split('\n').map(x => x.trim()).filter(x => x.length > 0)
  console.log(lines)
}

application()