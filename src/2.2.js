const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

/**
 * Looking at this again for a moment, there really isn't even
 * a reason to bother with the nested structure -- the only thing
 * that needs to change is the score for each pair.
 */
 const outcomeMap = {
  'A X': 3 + 0,
  'A Y': 1 + 3,
  'A Z': 2 + 6,
  'B X': 1 + 0,
  'B Y': 2 + 3,
  'B Z': 3 + 6,
  'C X': 2 + 0,
  'C Y': 3 + 3,
  'C Z': 1 + 6,
}

function application() {
  // Added a filter here to trim off any blank lines left over from
  // copy-pasta or accidental formatting
  const lines = data.split('\n').filter(line => line.trim().length > 0)

  const score = R.compose(
    R.sum,
    R.map(line => outcomeMap[line.trim()] || 0)
  )(lines)

  console.log(score)
}

application()