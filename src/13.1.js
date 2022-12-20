const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

function application() {
  // Looks like this data might be appropriately
  // JSON formatted -- so maybe we can do less
  // custom parsing than previous problems
  const lines = data
    .split('\n')
    .map(x => x.trim())
    .filter(x => x.length > 0)
    .map(x => JSON.parse(x))
  
  // Split the list into pairs
  const packetPairs = R.splitEvery(2, lines)

  const ensureArray = x => Array.isArray(x) ? x : [x]
  const isInteger = x => Number.isInteger(x)

  // This is a variation on R.zip that extends the
  // output to the length of the longest list instead
  // of truncating to the length of the shortest list
  const longZip = (a, b) => {
    const o = []
    const lastIdx = Math.max(a.length, b.length)

    for (let i = 0; i < lastIdx; i++) {
      o.push([
        a[i],
        b[i]
      ])
    }

    return o
  }
  
  const checkPacketPair = ([ left, right ]) => {
    const isLeftInt = isInteger(left)
    const isRightInt = isInteger(right)

    // If the left item is undefined that means we had
    // a list comparison where the right side was longer;
    // this is correct
    if (left === undefined) return true

    // But if the right item is undefined it means the
    // left side was longer, which is wrong
    if (right === undefined) return false

    // Are they both integers? If so we are in the right
    // order if left < right, in the wrong order if
    // right > left and indeterminate if they are equal
    if (isLeftInt && isRightInt) {
      return left === right ? null : left < right
    }

    // Are they both arrays? If so we perform a comparison
    // on each list item
    const resultList = longZip(ensureArray(left), ensureArray(right)).map(checkPacketPair)
    return R.compose(R.head, R.dropWhile(x => x == null))(resultList)
  }

  console.log(
    packetPairs
      .map(checkPacketPair)
      .reduce(
        (indexSum, value, index) => value ? indexSum += index + 1 : indexSum,
        0
      )
  )
}

application()