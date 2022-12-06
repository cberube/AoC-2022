const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

function detectMarker(data) {
  /*
  const words = R.aperture(4, data)
  const uniqueCounts = R.compose(
    R.add(4),
    R.findIndex(R.equals(4)),
    R.map(R.compose(R.length, R.uniq)),
  )(words)
  */

  const word = []
  for (let i = 0; i < data.length; i++) {
    word.push(data[i])
    if (word.length > 4) word.shift()

    if (R.uniq(word).length === 4) {
      // Adding one to switch from 0-based to 1-based
      return i + 1
    }
  }
}

function application() {
  const lines = data.split('\n')

  const markerPositions = lines.map(detectMarker)

  console.log(markerPositions)
}

application()