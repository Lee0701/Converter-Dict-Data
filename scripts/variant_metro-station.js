
const fs = require('fs')

const lines = fs.readFileSync('./preprocessed-data/metro-station_sorted.tsv').toString().split('\n')

const comments = lines.filter((line) => line.startsWith('#'))
const data = lines.filter((line) => !line.startsWith('#')).filter((line) => line.trim())

const variant = data.map((line) => {
    const [hangul, hanja] = line.split(':')
    return `${hangul}역:${hanja}驛:`
})

const result = [...comments, ...variant].join('\n')
fs.writeFileSync('./preprocessed-data/metro-station_sorted_var.tsv', result)
