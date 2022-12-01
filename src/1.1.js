const path = require('path')

const R = require('ramda')

const inputTools = require('./lib/inputTools')
const day1 = require('./lib/day1')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

async function application() {
  const elfList = day1.parseElfSnackData(data)

  // Find the maximum calorie amount
  const max = elfList.reduce((a, b) => Math.max(a, b), 0)
  console.log(max)
}

application()