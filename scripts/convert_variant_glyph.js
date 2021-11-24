
const fs = require('fs')
const {replaceVariant} = require('./hanja-reading')

const inFile = 'preprocessed-data/person-name_corrected.txt'
const outFile = 'preprocessed-data/person-name_replaced.txt'

const data = fs.readFileSync(inFile).toString()
const replaced = replaceVariant(data)
fs.writeFileSync(outFile, replaced)
