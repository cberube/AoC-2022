const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

function application() {
  const lines = data.split('\n').map(x => x.trim()).filter(x => x.length > 0)

  const valueList = [1]
  let currentValue = 1

  lines.forEach(line => {
    if (line === 'noop') {
      valueList.push(currentValue)
      return
    }

    const [_, arg] = line.split(' ')
    
    valueList.push(currentValue)

    currentValue += parseInt(arg, 10)
    valueList.push(currentValue)
  })

  const screen = []

  for (let beam = 0; beam < 240; beam++) {
    const beamX = beam % 40
    const value = valueList[beam]

    const isLit = Math.abs(beamX - value) < 2
    screen.push(isLit ? '#' : '.')
  }

  console.log(R.splitEvery(40, screen).map(R.join('')))
}

application()