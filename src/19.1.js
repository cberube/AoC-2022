const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

const robotTypes = [
  'ore',
  'clay',
  'obsidian',
  'geode'
]

const parseBlueprints = R.pipe(
  R.split('\n'),
  R.chain(x => R.tail(x.split(':'))),
  R.map(R.trim),
  R.map(x => x.split('.')),
  R.map(R.take(4)),
  R.map(R.map(R.split('costs'))),
  R.map(R.chain(R.tail)),
  R.map(R.map(R.split('and'))),
  R.map(R.map(R.map(R.trim))),
  R.map(R.zipObj(robotTypes)),
  R.map(R.map(R.map(R.split(' ')))),
  R.map(R.map(R.map(([a, b]) => ([b, a])))),
  R.map(R.map(R.fromPairs)),
  R.map(R.map(R.map(x => parseInt(x, 10)))),
)

const simulate = blueprint => {
  const resources = R.zipObj(robotTypes, R.repeat(0, robotTypes.length))
  const robots = R.zipObj(robotTypes, R.repeat(0, robotTypes.length))

  console.log(resources, robots)
}

function application() {
  const blueprints = parseBlueprints(data)

  simulate(blueprints[0])
}

application()