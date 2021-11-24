
const fs = require('fs')
const queue = require('block-queue')
const wikijs = require('wikijs').default

const kowiki = wikijs({
    apiUrl: 'https://ko.wikipedia.org/w/api.php',
})
const zhwiki = wikijs({
    apiUrl: 'https://zh.wikipedia.org/w/api.php',
})

const sleep = (t) => new Promise((resolve) => setTimeout(resolve, t))

const getHanjaName = async (pageName) => {
    const name = pageName.replace(/\([^\(\)]+\)/, '').trim()
    const meta = (pageName.match(/\(([^\(\)]+)\)/, '') || [])[1] || ''
    for(let i = 0 ; i < 5 ; i++) {
        try {
            const page = await kowiki.page(pageName)
            try {
                const langlinks = await page.langlinks()
                const zhLink = langlinks.find(({lang}) => lang == 'zh')
                if(zhLink) {
                    const hanjaName = zhLink.title
                    return [name, hanjaName, meta]
                }
            } catch(e) {
                break
            }
        } catch(ee) {
        }
    }
    return null
}

;

(async () => {
    const personNames = JSON.parse(fs.readFileSync('data/person-names.json').toString()).filter((name) => !name.includes(':'))
    const hanjaNames = []
    const q = queue(20, ([name, i], done) => {
        (async () => {
            await sleep(10)
            const hanjaName = await getHanjaName(name)
            hanjaNames.push(hanjaName)
            if(i % 100 == 0 || i == personNames.length - 1) {
                console.log(i)
                const filtered = hanjaNames.filter((entry) => entry)
                const formatted = filtered.map((entry) => entry.join(':')).join('\n')
                fs.writeFileSync('raw-data/person-hanja-names.txt', formatted)
            }
            done()
        })()
    })
    personNames.forEach((name, i) => q.push([name, i]))
})()
