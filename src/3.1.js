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

  // Split each line in half
  const compartments = lines.map(
    line => {
      const half = Math.floor(line.length / 2)
      const compartmentStrings = R.splitAt(half, line)
      return compartmentStrings.map(R.splitEvery(1))
    }
  )

  // Find the intersection of each pair of compartments
  const duplicates = compartments.flatMap(pair => R.intersection(...pair))

  const priorityList = duplicates.map(convertToPriority)

  console.log(R.sum(priorityList))
}

application()