const R = require('ramda')

const parseElfSnackData = R.compose(
  R.map(R.sum),
  R.splitWhenever(a => a === ''),
  R.split('\n')
)

module.exports = {
  parseElfSnackData
}