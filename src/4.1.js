const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

const rangeIsContained = (inner, outer) => 
  inner.start >= outer.start && inner.end <= outer.end

function application() {
  const lines = data.split('\n')

  // Split the lines into pairs and the pairs
  // into tuples -- then convert them into
  // little range objects just to make things
  // easier to read
  const ranges = lines
    .map(R.split(','))
    .map(
      pair => pair.map(
        pairString => {
          const [ start, end ] = R.split('-', pairString)
          return { start: parseInt(start, 10), end: parseInt(end, 10) }
        }
      )
    )
    .map(([a, b]) => {
      return rangeIsContained(a, b) || rangeIsContained(b, a)
    })
    .filter(R.identity)

  console.log(ranges.length)
}

application()