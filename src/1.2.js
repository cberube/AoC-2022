const path = require('path')

const R = require('ramda')

const inputTools = require('./lib/inputTools')
const day1 = require('./lib/day1')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

async function application() {
  const elfList = day1.parseElfSnackData(data)

  // Sort the list
  const sortedElfList = R.sort((a, b) => b - a, elfList)

  // Take the top three items
  const topThreeElves = R.take(3, sortedElfList)

  // Add them up
  const sum = R.sum(topThreeElves)
  
  console.log(sum)
}

application()