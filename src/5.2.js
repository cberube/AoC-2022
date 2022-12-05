const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

/**
 * The shape of the data for this puzzle is truly
 * irksome. I suspect that parsing the input will
 * be the majority of the effort, but we'll see
 * how it goes.
 */
function application() {
  const lines = data.split('\n')

  const [stackLines, instructionLines] = R.splitWhen(
    line => line.trim().length === 0,
    lines 
  )

  // Remove clutter from the stacks
  const stacks = stackLines.slice(0, -1).map(
    line => R
      .splitEvery(4, line)
      .map(line => line.replace(/\[|\]/g, '').trim())
  )

  // We'll create a stack for each... stack.
  const workingStacks = R.times(() => [], stacks[0].length)

  // The stacks are listed top-down, but it would be simpler
  // to process them bottom-up so we can create stacks in the
  // data-structure sense.
  R.compose(
    R.forEach(row => {
      row.forEach(
        (item, idx) => {
          if (item.length == 0) return
          workingStacks[idx].push(item)
        },
      )
    }),
    R.reverse
  )(stacks)

  // Now let's clean up the instructions list
  // - Trim any blank lines
  // - Split by spaces
  // - Remove all the words
  // - Convert to objects with helpful names
  // - Also ensure we have numbers instead of strings, and adjust
  //   the stack indices from 1-based to 0-based
  const instructions = R.compose(
    R.map(([count, from, to]) => ({
      from: parseInt(from, 10) - 1,
      to: parseInt(to, 10) - 1,
      count: parseInt(count, 10)
    })),
    R.map(R.filter(item => /[0-9]/.test(item))),
    R.map(R.split(' ')),
    R.filter(line => line.length > 0)
  )(instructionLines)

  // Now execute the instructions
  instructions.forEach(instruction => {
    const inFlight = []

    for (let i = 0; i < instruction.count; i++) {
      const item = workingStacks[instruction.from].pop()
      inFlight.push(item)
    }

    while (inFlight.length) {
      workingStacks[instruction.to].push(inFlight.pop())
    }
  })

  const topContainers = workingStacks
    .map(stack => stack.pop())
    .join('')

  console.log(topContainers)
}

application()