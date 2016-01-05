import {join} from 'path'
import {readFileSync, readdirSync} from 'fs'
import Handlebars from 'handlebars'

let partialsDir = join(__dirname, '../templates/partials')
readdirSync(partialsDir).forEach(file => {
    let match = file.match(/^(.+)\.hbs$/)
    if (!match) {
        return
    }
    let contents = readFileSync(join(partialsDir, file)).toString()
    Handlebars.registerPartial(match[1], contents)
})

Handlebars.registerHelper('eq', (a, b) => {
    return a == b
})

Handlebars.registerHelper('neq', (a, b) => {
    return a != b
})

export default Handlebars.compile
