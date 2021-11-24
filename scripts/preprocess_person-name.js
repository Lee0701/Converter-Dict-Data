
const fs = require('fs')

const {convertHanjaReading} = require('./hanja-reading')

const lines = fs.readFileSync('./raw-data/person-hanja-name.txt').toString().split('\n')
const comments = lines.filter((line) => line.startsWith('#'))
const data = lines.filter((line) => !line.startsWith('#')).filter((line) => line.trim()).map((line) => line.split(':'))

const isHangul = (c) => c >= '가' && c <= '힣'
const isAlphabet = (c) => c.toLowerCase() >= 'a' && c.toLowerCase() <= 'z'
const matchHanjaReading = (hangul, hanja) => {
    const converted = convertHanjaReading(hanja)
    if(converted == hangul) return true
    const splitHanjaA = converted.split('')
    const splitHanjaB = hanja.split('').map((c) => convertHanjaReading(c))
    const splitHanjaC = hanja.split('').map((c) => convertHanjaReading(c, false))
    const splitHangul = hangul.split('')
    if(splitHangul.every((c, i) => c == splitHanjaA[i] || c == splitHanjaB[i] || c == splitHanjaC[i])) return true
    return false
}

let processed = data.map(([hangul, hanja, meta]) => {
    hangul = hangul.trim().normalize('NFC')
    hanja = hanja.trim().normalize('NFC')

    hanja = hanja.replace(/\([^\(\)]+\)/, '').trim()

    return [hangul, hanja, meta]
}).filter((line) => line).filter((line, i, arr) => arr.indexOf(line) == i).sort()

const mismatches = processed.map(([hangul, hanja, meta]) => {

    let reason = ''

    // print warnings
    if(!hangul.split('').every(isHangul)) reason = 'NONHANGUL'
    else if(hanja.split('').some(isAlphabet)) reason = 'ALPHABET'
    else if(hanja.length != hangul.length) reason = 'LENGTH'
    else if(!matchHanjaReading(hangul, hanja)) reason = 'READING'
    else return null

    return [reason, hangul, hanja, meta]
}).filter((entry) => entry).sort()

const passed = processed.filter((line) => !mismatches.find((l) => l[1] == line[0]))

const result = [...comments, ...passed.map((entry) => entry.join(':')), '# MISMATCH', ...mismatches.map((entry) => entry.join(':'))].join('\n')
fs.writeFileSync('./preprocessed-data/person-name.txt', result)
