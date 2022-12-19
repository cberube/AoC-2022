const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

const maybeAsInt = x => {
  const int = parseInt(x, 10)
  return isNaN(int) ? x : int
}

const extractNumber = R.compose(
  x => parseInt(x.trim(), 10),
  x => x.replace(/[^0-9]/g, '')
)

const parseMonkeyData = data => {
  const [
    _,
    startingItemData,
    operationData,
    testData,
    trueData,
    falseData
  ] = data.map(line => line.trim()).map(R.split(':')).map(R.last).map(R.trim)

  return {
    items: R.compose(
      R.map(x => parseInt(x.trim(), 10)),
      R.split(','),
    )(startingItemData),
    operation: R.compose(
      R.applySpec({
        left: R.compose(maybeAsInt, R.prop(0)),
        right: R.compose(maybeAsInt, R.prop(2)),
        op: R.prop(1)
      }),
      R.split(' '),
      R.trim(),
      R.last(),
      R.split('=')
    )(operationData),
    testValue: extractNumber(testData),
    trueTarget: extractNumber(trueData),
    falseTarget: extractNumber(falseData),
    inspectionCount: 0
  }
}

function application() {
  const lines = data.split('\n')

  // A lot of focus on parsing slightly bad input formats
  // in this year's puzzles...
  // Let's split the list into paragraphs for each monkey
  const monkeyDataList = R.splitWhenever(line => line.length < 1, lines)

  // The first line that identifies the monkey is unimportant
  // so let's just throw it away
  const monkeyList = monkeyDataList.map(parseMonkeyData)

  const operationMap = {
    '*': R.multiply,
    '+': R.add,
    '-': R.subtract,
    '/': R.divide
  }

  const applyOperation = (worry, operation) => {
    const opFn = operationMap[operation.op]
    const left = operation.left == 'old' ? worry : operation.left
    const right = operation.right == 'old' ? worry : operation.right

    return opFn(left, right)
  }

  const divideBy = R.flip(R.divide)
  const moduloBy = R.flip(R.modulo)

  const monkeyTurn = monkey => {
    const nextItems = monkey.items
      .map(worry => applyOperation(worry, monkey.operation))
      .map(R.compose(Math.floor, divideBy(3)))

    const shouldThrow = nextItems
      .map(R.compose(R.equals(0), moduloBy(monkey.testValue)))

    shouldThrow.forEach((should, index) => {
      const worry = nextItems[index]
      const targetMonkeyId = should ? monkey.trueTarget : monkey.falseTarget
      const targetMonkey = monkeyList[targetMonkeyId]

      targetMonkey.items.push(worry)

      //console.log(`Item with worry level ${worry} is thrown to monkey ${targetMonkey}`)
    })

    monkey.inspectionCount += monkey.items.length
    monkey.items = []
  }

  for (let i = 0; i < 20; i++) {
    monkeyList.map(monkeyTurn)

    console.log(`Round ${i + 1}:`)
    monkeyList.forEach(monkey => console.log(`  ${monkey.items.join(', ')}`))
  }

  console.log(R.compose(
    R.reduce(R.multiply, 1),
    R.take(2),
    R.sort(R.flip(R.subtract)),
    R.pluck('inspectionCount')
  )(monkeyList))
}

application()