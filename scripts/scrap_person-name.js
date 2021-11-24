
const fs = require('fs')
const wikijs = require('wikijs').default

const categoryNames = ['분류:대한민국의 배우', '분류:대한민국의 가수']

const wiki = wikijs({
    apiUrl: 'https://ko.wikipedia.org/w/api.php',
})

const getPagesInCategoryRecursive = async (name, depth=0) => {
    if(!name.startsWith('분류:')) return [name]
    if(depth <= 0) return []
    const pages = await wiki.pagesInCategory(name)
    return (await Promise.all(pages.map((name) => getPagesInCategoryRecursive(name, depth - 1)))).flat()
}

;

(async () => {
    
    const names = (await Promise.all(categoryNames.map((cat) => getPagesInCategoryRecursive(cat, 4)))).flat()
    const filteredNames = names.filter((a, i, arr) => arr.indexOf(a) == i)
    fs.writeFileSync(`raw-data/person-names.json`, JSON.stringify(filteredNames))
    
})()
