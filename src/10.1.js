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

  const cyclesOfInterest = [ 20, 60, 100, 140, 180, 220 ]

  valueList.forEach((value, idx) => console.log(`${idx + 1}: ${value}`))

  cyclesOfInterest.forEach((cycle) => console.log(`${cycle}: ${valueList[cycle - 1]}`))
  const strengthList = cyclesOfInterest.map(cycle => (cycle * valueList[cycle - 1]))

  console.log(strengthList.reduce((sum, x) => sum + x, 0))
}

application()