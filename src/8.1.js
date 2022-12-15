const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

function application() {
  const lines = data.split('\n').map(x => x.trim()).filter(x => x.length > 0)

  const gridWidth = lines[0].length
  const gridHeight = lines.length
  const treeGrid = lines.flatMap(line => line.split(''))
  
  const toIndex = (x, y) => y * gridWidth + x
  
  const getRow = y => treeGrid.slice(toIndex(0, y), toIndex(gridWidth, y))
  const getColumn = x => {
    const column = []
    
    for (let y = 0; y < gridHeight; y++) {
      column.push(treeGrid[toIndex(x, y)])
    }
    
    return column
  }
  
  let visibleCount = 0
  
  for (let y = 1; y < gridHeight - 1; y++) {
    for (let x = 1; x < gridWidth - 1; x++) {
      const currentHeight = treeGrid[toIndex(x, y)]
      const rowData = R.splitAt(x, getRow(y))
      const columnData = R.splitAt(y, getColumn(x))
      
      const left = rowData[0]
      const right = R.tail(rowData[1])
      const above = columnData[0]
      const below = R.tail(columnData[1])

      const neighborList = [ left, right, above, below ]
        .map(R.any(x => x >= currentHeight))
        .reduce((count, item) => item ? count + 1 : count, 0)

      if (neighborList < 4) visibleCount++
    }
  }

  // This is a silly looking formula:
  // All of the trees on the outside of the grove are visible, so
  // we have gridWidth trees visible on the top and bottom, and
  // gridHeight trees visible on the left and right edges, which
  // gives us the gridWidth * 2 and gridHeight * 2. The trees in
  // the corners are double counted though, since they overlap the
  // first and last rows and columns, so we subtract 4 to account
  // for that.
  console.log(visibleCount + (gridWidth * 2) + (gridHeight * 2) - 4)
}

application()