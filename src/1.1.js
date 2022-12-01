const path = require('path')

const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

async function application() {
  // Parse the data into lines
  const lines = data.split('\n')
  const elfList = []
  let elf = 0

  // Process each line one by one
  while (lines.length > 0) {
    const line = lines.shift()

    // If the line is blank...
    if (line === '') {
      // Store the elf's calorie count, if available
      if (elf > 0) {
        elfList.push(elf)
      }

      // And reset the calorie count
      elf = 0
      continue
    }

    // ...Otherwise convert the line into a number and
    // add it to the running total for the current elf
    elf += parseInt(line, 10)
  }

  // Find the maximum calorie amount
  const max = elfList.reduce((a, b) => Math.max(a, b), 0)
  console.log(max)
}

application()