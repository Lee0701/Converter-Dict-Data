
const fs = require('fs')

const lines = fs.readFileSync('./preprocessed-data/metro-station_corrected.tsv').toString().split('\n')

const comments = lines.filter((line) => line.startsWith('#'))
const data = lines.filter((line) => !line.startsWith('#')).filter((line) => line.trim())

const sorted = data.filter((line, i, arr) => arr.indexOf(line) == i).sort()

const result = [...comments, ...sorted].join('\n')
fs.writeFileSync('./preprocessed-data/metro-station_sorted.tsv', result)
