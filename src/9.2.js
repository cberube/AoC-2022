const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

const deltaMap = {
  R: [ 1, 0 ],
  L: [ -1, 0 ],
  D: [ 0, -1 ],
  U: [ 0, 1 ]
}

function application() {
  const lines = data.split('\n').map(x => x.trim()).filter(x => x.length > 0)

  // We ultimately just want a list of all the movements,
  // so we'll convert each [Direction Distance] pair into
  // Direction repeated Distance times. Then we can convert
  // each Direction symbol into a tuple: [dx, dy]. The tuple
  // indicates the distance moved along each axis.
  const deltaList = lines
    .flatMap(
      line => {
        const [direction, distance] = line.split(' ').map(x => x.trim())
        return R.repeat(direction, distance)
      }
    )
    .map(direction => deltaMap[direction])

  const tailVisitMap = {}

  const positionToString = (x, y) => `${x}:${y}`

  const headPosition = { x: 0, y: 0 }
  const tailPositionList = []
  
  for (let i = 0; i < 9; i++) tailPositionList.push({ x: 0, y: 0 })

  tailVisitMap[positionToString(headPosition.x, headPosition.y)] = true

  const getAdjacentList = (x, y) => ([
    [x, y],
    [x, y - 1],
    [x, y + 1],
    [x + 1, y],
    [x + 1, y - 1],
    [x + 1, y + 1],
    [x - 1, y],
    [x - 1, y - 1],
    [x - 1, y + 1],
  ])

  const isAdjacent = (ax, ay, bx, by) => R.findIndex(p => p[0] == bx && p[1] == by, getAdjacentList(ax, ay)) >= 0

  deltaList.forEach(delta => {
    headPosition.x += delta[0]
    headPosition.y += delta[1]

    let lead = headPosition

    for (let i = 0; i < tailPositionList.length; i++) {
      const tailPosition = tailPositionList[i]
      const isTailAdjacent = isAdjacent(lead.x, lead.y, tailPosition.x, tailPosition.y)

      // If the tail is overlapping or adjacent to the head
      // we don't need to do anything
      if (isTailAdjacent) return 
    
      const dx = Math.sign(lead.x - tailPosition.x)
      const dy = Math.sign(lead.y - tailPosition.y)
  
      tailPosition.x += dx
      tailPosition.y += dy

      if (i == 8) {
        tailVisitMap[positionToString(tailPosition.x, tailPosition.y)] = true
      }
  
      lead = tailPositionList[i]
    }

  })

  console.log(R.keys(tailVisitMap).join('\n'))
  console.log(R.keys(tailVisitMap).length)
}

application()