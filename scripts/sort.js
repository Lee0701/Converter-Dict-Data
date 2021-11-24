
const fs = require('fs')

const inFile = './preprocessed-data/person-name_replaced.txt'
const outFile = './preprocessed-data/person-name_sorted.txt'

const lines = fs.readFileSync(inFile).toString().split('\n')

const comments = lines.filter((line) => line.startsWith('#'))
const data = lines.filter((line) => !line.startsWith('#')).filter((line) => line.trim())

const sorted = data.filter((line, i, arr) => arr.indexOf(line) == i).sort().map((line) => line + ':')

const result = [...comments, ...sorted].join('\n')
fs.writeFileSync(outFile, result)
