const parseElfSnackData = data => {
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

  return elfList
}

module.exports = {
  parseElfSnackData
}