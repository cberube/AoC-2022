const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

const omitIndex = (ar, idx) => ar.filter((_, i) => i != idx)

function application() {
  const lines = data.split('\n').map(x => x.trim()).filter(x => x.length > 0)

  const gridWidth = lines[0].length
  const gridHeight = lines.length
  const treeGrid = lines.flatMap(line => line.split(''))
  
  const toIndex = (x, y) => y * gridWidth + x
  const isValidPosition = (x, y) => (x >= 0 && y >= 0 && x < gridWidth && y < gridHeight)
  
  const getRow = y => treeGrid.slice(toIndex(0, y), toIndex(gridWidth, y))
  const getColumn = x => {
    const column = []
    
    for (let y = 0; y < gridHeight; y++) {
      column.push(treeGrid[toIndex(x, y)])
    }
    
    return column
  }
  
  const visibleList = []
  
  // Because trees on the edges have at least one viewing distance of 0
  // and we multiple viewing distances to get the final score we can just
  // continue to ignore the outer ring of trees.
  for (let y = 1; y < gridHeight - 1; y++) {
    for (let x = 1; x < gridWidth - 1; x++) {
      const currentHeight = treeGrid[toIndex(x, y)]
      const rowData = R.splitAt(x, getRow(y))
      const columnData = R.splitAt(y, getColumn(x))
      
      // We want to look FROM the tree TOWARDS the edge, but the
      // left and above arrays will be orders FROM the edge TOWARDS
      // the tree, so we reverse them
      const left = R.reverse(rowData[0])
      const above = R.reverse(columnData[0])
      const right = R.tail(rowData[1])
      const below = R.tail(columnData[1])

      const canSee = x => x < currentHeight

      const visibleCount = [ left, right, above, below ]
        .map(list => {
          const canSeeList = R.takeWhile(canSee, list)

          // If we got to the edge of the map then the visible
          // list will have the same length as the input list and
          // that is the number of trees we can see; if a tree
          // blocked our view we need to add 1 to the length of
          // the visible list because the blocking tree counts
          return canSeeList.length === list.length ? list.length : canSeeList.length + 1
        })
        .reduce((product, value) => product * value, 1)

        console.log(x, y, visibleCount)
        visibleList.push(visibleCount)
    }
  }

  console.log(Math.max(...visibleList))
}

application()