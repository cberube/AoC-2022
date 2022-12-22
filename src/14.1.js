const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

const minOf = prop => R.compose(R.reduce(Math.min, Number.MAX_SAFE_INTEGER), R.pluck(prop))
const maxOf = prop => R.compose(R.reduce(Math.max, 0), R.pluck(prop))
const pointToKey = ({ x, y }) => `${x}:${y}`

const renderGrid = (grid, extent) => {
  const output = []

  for (let y = extent.top; y <= extent.bottom; y++) {
    const row = []
    for (let x = extent.left; x <= extent.right; x++) {
      let what = '.'

      const key = pointToKey({ x, y })
      what = R.propOr('.', key, grid)

      row.push(what)
    }
    output.push(row)
  }

  console.log(output.map(string => string.join('')).join('\n'))
}

function application() {
  const lines = data.split('\n').map(x => x.trim()).filter(x => x.length > 0)

  const parseToPoint = text => {
    const [ x, y ] = text.split(',').map(x => parseInt(x, 10))

    return { x, y }
  }

  // Parse each line, converting it to a series of points
  const rockPatternList = lines
    .map(line => line.split(' -> '))
    .map(listOfPoints => listOfPoints.map(parseToPoint))

  // Determine the extent of the region that contains the
  // rock walls
  const extents = R.compose(
    R.applySpec({
      left: minOf('x'),
      right: maxOf('x'),
      top: R.always(0),
      bottom: maxOf('y')
    }),
    R.flatten()
  )(rockPatternList)

  const sparseGrid = {}

  // Generate the various rock segments
  rockPatternList.forEach(
    pointList => {
      let currentPoint = R.head(pointList)
      const otherPoints = R.tail(pointList)

      while (otherPoints.length) {
        const cursor = { ...currentPoint }
        const nextPoint = otherPoints.shift()
        let [ from, to, which ] = (currentPoint.x === nextPoint.x)
          ? [ currentPoint.y, nextPoint.y, 'y' ]
          : [ currentPoint.x, nextPoint.x, 'x' ]

        if (from > to) {
          const temp = from
          from = to
          to = temp
        }

        for(let w = from; w <= to; w++) {
          cursor[which] = w
          const key = pointToKey(cursor)
          sparseGrid[key] = '#'
        }

        currentPoint = nextPoint
      }
    }
  )

  const dropOneGrainOfSand = (bottom, grid) => {
    const position = {
      x: 500,
      y: 0
    }

    while (position.y <= bottom) {
      let key
      let contents

      // Can we move down?
      key = pointToKey({ x: position.x, y: position.y + 1 })
      contents = R.propOr('.', key, grid)
      console.log('down', key, contents)

      if (contents === '.') {
        position.y += 1
        continue
      }

      // Try down-left
      key = pointToKey({ x: position.x - 1, y: position.y + 1 })
      contents = R.propOr('.', key, grid)

      if (contents === '.') {
        position.x -= 1
        position.y += 1
        continue
      }

      // Try down-right
      key = pointToKey({ x: position.x + 1, y: position.y + 1 })
      contents = R.propOr('.', key, grid)

      if (contents === '.') {
        position.x += 1
        position.y += 1
        continue
      }

      // If we can't move at all, we're done
      break
    }

    const restingKey = pointToKey(position)
    grid[restingKey] = 'o'

    // We return true if we went off the bottom of the
    // valid area
    return position.y > bottom
  }

  console.log(rockPatternList)
  console.log(extents)
  console.log(sparseGrid)

  let fellOff = false
  let count = 0
  do {
    fellOff = dropOneGrainOfSand(extents.bottom, sparseGrid)
    count++
  } while (!fellOff)

  renderGrid(sparseGrid, extents)
  console.log(count - 1)
}

application()