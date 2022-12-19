const R = require('ramda')

let values = [3, 4, 6]

const allEqual = ar => R.all(
  R.equals(R.head(ar)),
  R.tail(ar)
)

// This is just an escape hatch in case there
// is a bug in the loop that keeps it from
// completing
let cap = 0

const firstValues = [...values]
while (!allEqual(values) && cap++ < 10) {
  const smallest = values.reduce(
    (out, value, index) => {
      if (value < out.value) {
        out.value = value
        out.index = index
      }

      return out
    },
    {
      index: -1,
      value: Number.MAX_SAFE_INTEGER
    }
  )

  values[smallest.index] += firstValues[smallest.index]
}