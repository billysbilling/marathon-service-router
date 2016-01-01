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

export default Handlebars.compile
