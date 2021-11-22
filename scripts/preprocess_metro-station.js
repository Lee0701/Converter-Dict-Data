
const fs = require('fs')

const {convertHanjaReading} = require('./hanja-reading')

// csv 데이터에서 '역사명'·'한자역사명' 컬럼을 抽出
const lines = fs.readFileSync('./raw-data/metro-station.tsv').toString().split('\n')
const comments = lines.filter((line) => line.startsWith('#'))
const data = lines.filter((line) => !line.startsWith('#')).filter((line) => line.trim())
        .slice(1).map((line) => line.split('\t'))

const isAlphabet = (c) => c.toLowerCase() >= 'a' && c.toLowerCase() <= 'z'

const hangulNumbers = Object.fromEntries('영일이삼사오륙칠팔구'.split('').map((c, i) => [i.toString(), c]))
const replaceHangulNumbers = (c) => hangulNumbers[c] || c

const hanjaNumbers = Object.fromEntries('零一二三四五六七八九'.split('').map((c, i) => [i.toString(), c]))
const replaceHanjaNumbers = (c) => hanjaNumbers[c] || c

let processed = data.map(([hangul, hanja]) => {
    hangul = hangul.trim().normalize('NFC')
    hanja = hanja.trim().normalize('NFC')

    hangul = hangul.replace(/-/g, '').replace(/·/g, '').replace(/ /g, '')
    hanja = hanja.replace(/·/g, '').replace(/ /g, '')

    // remove entries without hanja element
    // if(hanja == '-') return null
    // if(hanja.split('').every(isAlphabet)) return null
    // Required in -驛 variant

    hangul = hangul.replace(/\([^\(\)]+\)/g, '')
    hanja = hanja.replace(/\([^\(\)]+\)/g, '')

    // normalize
    if(hangul[hangul.length - 1] == '역') hangul = hangul.slice(0, hangul.length - 1)
    if(hanja[hanja.length - 1] == '驛') hanja = hanja.slice(0, hanja.length - 1)

    // replace numbers
    hangul = hangul.split('').map(replaceHangulNumbers).join('')
    hanja = hanja.split('').map(replaceHanjaNumbers).join('')

    return `${hangul}:${hanja}`
}).filter((line) => line).filter((line, i, arr) => arr.indexOf(line) == i).sort()

const mismatches = processed.filter((line) => {
    const [hangul, hanja] = line.split(':')

    // print warnings
    if(hanja.split('').some(isAlphabet)) console.log('ALPHABET', hangul, hanja)
    else if(hanja.includes('?')) console.log('QUESTION MARK', hangul, hanja)
    else if(hanja.includes('-')) console.log('HYPHEN', hangul, hanja)
    else if(hanja.includes('없음')) console.log('NONE', hangul, hanja)
    else if(hanja.length != hangul.length) console.log('LENGTH MISMATCH', hangul, hanja)
    else if(convertHanjaReading(hanja) != hangul) console.log('READING MISMATCH', hangul, hanja)
    else return false

    return true
})

const correctionMap = [
    ['캠퍼스', 'Campus'],
    ['디지털', '數碼'],
    ['서울', '首爾'],
    ['터미널', '巴士客運'],
    ['미디어', '媒體'],
    ['센터', '中心'],
    ['삼거리', '丁字路口', '三거리'],
    ['사거리', '十字路口', '四거리'],
    ['네거리', '十字路口'],
    ['시티', '城'],
]

const edited = mismatches.map((line) => {
    let [hangul, hanja] = line.split(':')
    let corrected = null

    if(hangul.endsWith('앞')) corrected = hanja + '앞'
    if(hanja.includes('없음')) corrected = hangul
    if(hanja.endsWith('站')) hanja = hanja.substring(0, hanja.length - 1)
    correctionMap.forEach(([k, v, r]) => {
        if(hangul.includes(k) && (corrected || hanja).includes(v)) corrected = (corrected || hanja).replace(v, r || k)
    })

    return `${hangul}:${hanja}:${corrected || 'FAIL'}`
})

const passed = processed.filter((line) => !mismatches.includes(line))
const corrected = edited.filter((line) => !line.includes('FAIL'))
const failed = edited.filter((line) => line.includes('FAIL'))

const result = [...comments, ...passed, '# CORRECTED', ...corrected, '# FAILED', ...failed].join('\n')
fs.writeFileSync('./preprocessed-data/metro-station.tsv', result)
