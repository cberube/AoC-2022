const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

function application() {
  const lines = data.split('\n').map(x => x.trim()).filter(x => x.length > 0)

  // Determine the grid dimensions
  const width = lines[0].length
  const height = lines.length

  const indexToPoint = idx => {
    const y = Math.floor(idx / width)

    return {
      x: idx - (y * width),
      y,
    }
  }

  const pointToIndex = ({ x, y }) => (y * width + x)

  const isValidPoint = ({ x, y }) => (x >= 0 && y >= 0 && x < width && y < height)

  const getNeighbors = ({ x, y }) => 
    [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ].filter(isValidPoint)

  const isReachable = (fromHeight, height) => {
    const canReach = height.charCodeAt(0) - fromHeight.charCodeAt(0) <= 1
    //console.log(`${fromHeight} -> ${height}: ${canReach}`)
    return canReach
  }

  // Turn the lines of data into a single flat array
  // that represents the grid (I just prefer to work
  // with the data in that shape)
  const grid = lines.flatMap(x => x.split(''))

  // Find the start and end positions and convert
  // them into coordinates
  const startPoint = indexToPoint(grid.findIndex(R.equals('S')))
  const endPoint = indexToPoint(grid.findIndex(R.equals('E')))

  // Replace those points with their heights in the
  // grid (start is 'a' and end is 'z')
  grid[pointToIndex(startPoint)] = 'a'
  grid[pointToIndex(endPoint)] = 'z'

  const distanceGrid = R.repeat(Number.MAX_SAFE_INTEGER, grid.length)
  distanceGrid[pointToIndex(endPoint)] = 0

  const frontier = [ endPoint ]

  while (frontier.length > 0) {
    const currentPoint = frontier.pop()
    const currentIdx = pointToIndex(currentPoint)
    const currentDistance = distanceGrid[currentIdx] + 1
    const currentHeight = grid[currentIdx]

    const neighborIndices = getNeighbors(currentPoint)

    neighborIndices.forEach(point => {
      const idx = pointToIndex(point)

      if (currentDistance >= distanceGrid[idx]) return 

      // Skip over any cells that are more than 1 unit
      // below the current cell
      if (!isReachable(grid[idx], currentHeight)) return

      distanceGrid[idx] = currentDistance
      frontier.push(point)
    })
  }

  /*
  const leftPad = (l, x) => R.repeat(' ', l - x.length).join('') + x

  console.log(
    R.splitEvery(
      width,
      distanceGrid
        .map(x => `${x}`)
        .map(x => leftPad(4, x))
    ).map(x => x.join(' '))
  )
  */

  console.log(distanceGrid[pointToIndex(startPoint)])
}

application()