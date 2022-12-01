const path = require('path')

const R = require('ramda')

const inputTools = require('./lib/inputTools')
const day1 = require('./lib/day1')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

async function application() {
  const elfList = day1.parseElfSnackData(data)

  // Sort the list (note that Array.sort mutates the array
  // and returns a reference to it, but it is handy to have
  // a variable with a clearer name and this lays the ground-
  // work for an immutable approach)
  const sortedElfList = elfList.sort((a, b) => b - a)

  // Take the top three items
  const topThreeElves = sortedElfList.slice(0, 3)

  // Add them up
  const sum = topThreeElves.reduce((a, b) => a + b, 0)
  
  console.log(sum)
}

application()