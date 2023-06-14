const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

const pointToKey = ({ x, y }) => `${x}:${y}`

function application() {
  const lines = data.split('\n').map(x => x.trim()).filter(x => x.length > 0)

  // More inconvenient format parsing fun!
  // - Sensor and beacon data is split by ':' and coordinates are split by ','
  //   so we can remove all characters that are not a digit, a ':' or a ','
  // - Split the sensor and beacon data on ':'
  // - We now have a pair of strings, which we split on ',' to get a pair of
  //   two-element tuples
  // - Convert eact element of each tuple from a string to an int
  // - Convert the entries into objects with a sensor and beacon key
  // - Convert the tuples for the sensor and beacon into { x, y } objects
  // - For each sensor and beacon pair compute the Manhattan distance from
  //   the sensor to the beacon
  // - For each senseor, compute the bounding box of the covered area
  const sensorList = lines
    .map(line => line.replace(/[^0-9,:]/g, ''))
    .map(line => line.split(':'))
    .map(pair => pair.map(coords => coords.split(',')))
    .map(pair => pair.map(coords => coords.map(x => parseInt(x, 10))))
    .map(R.applySpec({ sensor: R.prop(0), beacon: R.prop(1) }))
    .map(data => ({ sensor: { x: data.sensor[0], y: data.sensor[1] }, beacon: { x: data.beacon[0], y: data.beacon[1] } }))
    .map(data => {
      const delta = {
        x: Math.abs(data.sensor.x - data.beacon.x),
        y: Math.abs(data.sensor.y - data.beacon.y)
      }
      return { ...data, delta, distance: delta.x + delta.y }
    })
    .map(data => {
      const extent = {
        left: data.sensor.x - data.distance,
        right: data.sensor.x + data.distance,
        top: data.sensor.y - data.distance,
        bottom: data.sensor.y + data.distance
      }

      return { ...data, extent }
    })

  const mapExtent = R.reduce(
    (extent, data) => {
      return {
        left: Math.min(extent.left, data.extent.left),
        right: Math.max(extent.right, data.extent.right),
        top: Math.min(extent.top, data.extent.top),
        bottom: Math.max(extent.bottom, data.extent.bottom)
      }
    },
    {
      left: Number.MAX_SAFE_INTEGER,
      right: Number.MIN_SAFE_INTEGER,
      top: Number.MAX_SAFE_INTEGER,
      bottom: Number.MIN_SAFE_INTEGER
    },
    sensorList
  )

  // Create a map that stores (x,y) pairs of known beacons, so we
  // can lookup beacons later to exclude them from the "no-beacon"
  // position count later
  const beaconMap = R.reduce(
    (acc, data) => {
      const key = pointToKey(data.beacon)
      return { ...acc, [key]: true }
    },
    {},
    sensorList
  )

  const isPointCovered = (x, y, sensorList) => {
    return R.reduce(
      (_, data) => {
        const delta = {
          x: Math.abs(data.sensor.x - x),
          y: Math.abs(data.sensor.y - y)
        }
        
        const distance = delta.x + delta.y
        const isCovered = (distance - 1) <= data.distance

        if (isCovered) {
          return R.reduced(true)
        }

        return false
      },
      false,
      sensorList
    )
  }

  const determineCoverageAtRow = (extent, row) => {
    let coveredCount = 0
    let coveredMap = {}

    for (let x = extent.left; x <= extent.right; x++) {
      const isCovered = isPointCovered(x, row, sensorList)
      const hasBeacon = R.propOr(false, pointToKey({ x, y: row }), beaconMap)
      //`if (hasBeacon) console.log('HAS BEACON')
      //if (isCovered && !hasBeacon) coveredCount++
      coveredMap[pointToKey({ x, y: row })] = isCovered
    }
    console.log(coveredMap)

    return R.keys(coveredMap).length
  }

  //console.log(sensorList)
  console.log(mapExtent)
  console.log(beaconMap)

  //console.log(determineCoverageAtRow(mapExtent, 10))
  console.log(determineCoverageAtRow(mapExtent, 2000000))

  // 4839811 is too low 
  // 4839813 also wrong
}

application()