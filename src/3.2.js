const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

const isUppercase = x => x.toUpperCase() === x

const convertToPriority = x => isUppercase(x)
  ? x.codePointAt(0) - 64 + 26
  : x.codePointAt(0) - 96

function application() {
  const lines = data.split('\n')

  // Create groups of 3
  const groups = R.splitEvery(3, lines)

  // Find the intersection of each set of three
  const duplicates = groups.flatMap(([a, b, c]) => R.intersection(
    R.intersection(a, b),
    R.intersection(a, c)
  ))

  // Convert to priorities
  const priorityList = duplicates.map(convertToPriority)

  console.log(R.sum(priorityList))
}

application()