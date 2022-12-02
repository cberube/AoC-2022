const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

// Since there are only 9 possibilities we can just
// write down a look-up table of the resulting scores.
// This is written as (shape score) + (win/loss score)
// just for clarity.
const outcomeMap = {
  'A X': 1 + 3,
  'A Y': 2 + 6,
  'A Z': 3 + 0,
  'B X': 1 + 0,
  'B Y': 2 + 3,
  'B Z': 3 + 6,
  'C X': 1 + 6,
  'C Y': 2 + 0,
  'C Z': 3 + 3,
}

function application() {
  const lines = data.split('\n')

  const score = R.compose(
    R.sum,
    R.map(line => outcomeMap[line.trim()] || 0)
  )(lines)
  console.log(score)
}

application()