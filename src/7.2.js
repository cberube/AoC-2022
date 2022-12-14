const path = require('path')
const R = require('ramda')

const inputTools = require('./lib/inputTools')

const dataPath = path.join(__dirname, process.argv[2])
const data = inputTools.loadInputFile(dataPath)

const node = (name, parent, size = 0) => ({ name, parent, size, fileList: [], directoryList: [] })
const fileNode =  (name, parent, size) => ({ name, parent, size })

const DEVICE_SIZE = 70000000
const REQUIRED_SPACE = 30000000
const root = node('/')

function application() {
  const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let currentNode = null

  //console.log(lines)

  const handleCD = (arg) => {
    if (arg === '..') {
      currentNode = currentNode.parent
    } else if (arg === '/') {
      currentNode = root
    } else {
      const childNode = node(arg, currentNode)
      currentNode.directoryList.push(childNode)
      currentNode = childNode
    }
  }

  lines.forEach(line => {
    if (!line.startsWith('$')) {
      const [size, name] = line.split(' ')

      if (size === 'dir') return
      
      currentNode.fileList.push(fileNode(name, currentNode, size))
    }

    const [ _, command, arg ] = line.split(' ')

    if (command === 'cd') {
      handleCD(arg)
      return
    }
  })

  const computeSize = (node) => {
    if (node.fileList.length > 0) {
      node.size += node.fileList.reduce((sum, fileNode) => sum + parseInt(fileNode.size, 10), 0)
    }

    node.directoryList.forEach(
      directoryNode => {
        computeSize(directoryNode)
        node.size += directoryNode.size
      }
    )
  }

  const candidateList = []

  const selectDirectoriesBySize = (minSize, node) => {
    console.log(node.name, node.size, minSize)

    if (node.size >= minSize) {
      candidateList.push(node)
    }

    node.directoryList.forEach(
      directoryNode => {
        selectDirectoriesBySize(minSize, directoryNode)
      }
    )
  }

  computeSize(root)

  const availableSpace = DEVICE_SIZE - root.size
  const spaceToFree = REQUIRED_SPACE - availableSpace
  console.log(availableSpace, spaceToFree)

  selectDirectoriesBySize(spaceToFree, root)

  console.log(candidateList.map(node => node.size).sort((a, b) => a - b))
}


application()