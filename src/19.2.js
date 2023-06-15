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

const canAfford = (resources, cost) => {
    if ((cost.ore ?? 0) > resources.ore) return false
    if ((cost.clay ?? 0) > resources.clay) return false
    if ((cost.obsidian ?? 0) > resources.obsidian) return false

    return true
}

const makeId = (resources, robots) => Object.values(resources).concat(Object.values(robots)).join('.')

const phi = (1 + Math.sqrt(5)) / 2
const omega = 1 - phi
const sq5 = Math.sqrt(5)
const fib = n => (Math.pow(phi, n) - Math.pow(omega, n)) / sq5

const scoreState = (resources, robots, minutesLeft) =>
    0
    + resources.geode
    + (robots.geode * minutesLeft)
    + fib(minutesLeft)

const simulate = blueprint => {
    const allStates = new Set()

    let resources = R.zipObj(robotTypes, R.repeat(0, robotTypes.length))
    let robots = R.zipObj(robotTypes, R.repeat(0, robotTypes.length))

    robots.ore = 1

    const minutes = 32
    let currentStateStack = [{ resources, robots }]
    let bestGeodes = 0
    let bestRobots = { geode: 0, obsidian: 0 }
    let nextBestGeodes = 0
    let nextBestRobots = { ...bestRobots }

    for (let i = 0; i < minutes; i++) {
        let stackBestGeodes = 0

        console.log(`------ Minute ${i + 1} ------`)
        console.log(`${currentStateStack.length} nodes`)

        const nextStateStack = currentStateStack.reduce((nextStates, state) => {
            const nextResources = { ...state.resources }
            const nextRobots = { ...state.robots }

            const afforable = {
                ore: canAfford(state.resources, blueprint.ore),
                clay: canAfford(state.resources, blueprint.clay),
                obsidian: canAfford(state.resources, blueprint.obsidian),
                geode: canAfford(state.resources, blueprint.geode)
            }

            // Add resources from our existing robots
            nextResources.ore += (state.robots.ore ?? 0)
            nextResources.clay += (state.robots.clay ?? 0)
            nextResources.obsidian += (state.robots.obsidian ?? 0)
            nextResources.geode += (state.robots.geode ?? 0)
            nextBestGeodes = Math.max(nextBestGeodes, nextResources.geode)
            stackBestGeodes = Math.max(nextResources.geode, nextResources.geode)

            if (nextResources.geode < stackBestGeodes) return nextStates

            //console.log(i, nextRobots)

            // Add the "do nothing" state
            const id = makeId(nextResources, nextRobots)
            if (!allStates.has(id)) {
                const score = scoreState(nextResources, nextRobots, minutes - i)
                nextStates[id] = { resources: { ...nextResources }, robots: { ...nextRobots }, score }
                allStates.add(id)
            }

            // Split the state based on which robots we can afford
            if (afforable.geode) {
                const nextState = { resources: { ...nextResources }, robots: { ...nextRobots } }
                nextState.robots.geode += 1
                nextBestRobots.geode = Math.max(nextState.robots.geode, nextBestRobots.geode)
                nextState.resources.ore -= blueprint.geode.ore ?? 0
                nextState.resources.clay -= blueprint.geode.clay ?? 0
                nextState.resources.obsidian -= blueprint.geode.obsidian ?? 0

                const id = makeId(nextState.resources, nextState.robots)
                if (!allStates.has(id)) {
                    nextState.score = scoreState(nextState.resources, nextState.robots, minutes - i)
                    nextStates[id] = nextState
                    allStates.add(id)
                }
            }

            if (afforable.obsidian) {
                const nextState = { resources: { ...nextResources }, robots: { ...nextRobots } }
                nextState.robots.obsidian += 1
                nextBestRobots.obsidian = Math.max(nextState.robots.obsidian, nextBestRobots.obsidian)

                nextState.resources.ore -= blueprint.obsidian.ore ?? 0
                nextState.resources.clay -= blueprint.obsidian.clay ?? 0
                nextState.resources.obsidian -= blueprint.obsidian.obsidian ?? 0
                const id = makeId(nextState.resources, nextState.robots)
                if (!allStates.has(id)) {
                    nextState.score = scoreState(nextState.resources, nextState.robots, minutes - i)
                    nextStates[id] = nextState
                    allStates.add(id)
                }
            }

            if (afforable.clay) {
                const nextState = { resources: { ...nextResources }, robots: { ...nextRobots } }
                nextState.robots.clay += 1
                nextBestRobots.clay = Math.max(nextState.robots.clay, nextBestRobots.clay)

                nextState.resources.ore -= blueprint.clay.ore ?? 0
                nextState.resources.clay -= blueprint.clay.clay ?? 0
                nextState.resources.obsidian -= blueprint.clay.obsidian ?? 0
                const id = makeId(nextState.resources, nextState.robots)
                if (!allStates.has(id)) {
                    nextState.score = scoreState(nextState.resources, nextState.robots, minutes - i)
                    nextStates[id] = nextState
                    allStates.add(id)
                }
            }

            if (afforable.ore) {
                const nextState = { resources: { ...nextResources }, robots: { ...nextRobots } }
                nextState.robots.ore += 1
                nextBestRobots.ore = Math.max(nextState.robots.ore, nextBestRobots.ore)

                nextState.resources.ore -= blueprint.ore.ore ?? 0
                nextState.resources.clay -= blueprint.ore.clay ?? 0
                nextState.resources.obsidian -= blueprint.ore.obsidian ?? 0
                const id = makeId(nextState.resources, nextState.robots)
                if (!allStates.has(id)) {
                    nextState.score = scoreState(nextState.resources, nextState.robots, minutes - i)
                    nextStates[id] = nextState
                    allStates.add(id)
                }
            }

            return nextStates
        }, {})

        currentStateStack = Object.values(nextStateStack)
        currentStateStack.sort((a, b) => b.score - a.score)
        //console.log(currentStateStack)
        const bestScore = currentStateStack[0].score
        currentStateStack = R.takeWhile(s => s.score == bestScore, currentStateStack)

        bestGeodes = nextBestGeodes
        bestRobots = { ...nextBestRobots }

        console.log(bestRobots, bestGeodes, allStates.size, bestScore)
    }

    return bestGeodes
}

function application() {
    const blueprints = R.take(1, parseBlueprints(data))
    const results = {}

    blueprints.forEach((blueprint, idx) => {
        const geodes = simulate(blueprint)
        const quality = (idx + 1) * geodes

        results[idx] = quality
    })

    console.log(results)
    console.log(R.sum(Object.values(results)))
}

application()
