const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

/**
 * There isn't really any *more* data in this case, it is
 * just differently organized. This object maps the shape
 * played by our opponent to an object which lists the
 * scores for each outcome. X for losing, Y for a tie,
 * and Z for winning.
 * 
 * We could add another layer of lookups to determine the
 * scores for the outcomes and shapes, but they are fixed
 * and there are still only 9 of them, so we can just list
 * them here. Once again, the format is (shape score) +
 * (win/loss score) for clarity
 */
const responseMap = {
  A: {
    X: 3 + 0,
    Y: 1 + 3,
    Z: 2 + 6
  },
  B: {
    X: 1 + 0,
    Y: 2 + 3,
    Z: 3 + 6
  },
  C: {
    X: 2 + 0,
    Y: 3 + 3,
    Z: 1 + 6
  }
}

function application() {
  // Added a filter here to trim off any blank lines left over from
  // copy-pasta or accidental formatting
  const lines = data.split('\n').filter(line => line.trim().length > 0)

  // Translate each line into a score. Conveniently when we split
  // the line on spaces we get an array of [shape, result] which
  // is precisely the format we need for `R.pathOr`.
  const score = R.compose(
    R.sum,
    R.map(pair => R.pathOr(0, pair, responseMap)),
    R.map(line => line.split(' '))
  )(lines)

  console.log(score)
}

application()