import {join} from 'path'
import {readFileSync} from 'fs'
import Handlebars from 'handlebars'

const HAPROXY_TEMPLATE_PATH = process.env.HAPROXY_TEMPLATE_PATH || join(__dirname, '../templates/haproxy.cfg.hbs')

let file = HAPROXY_TEMPLATE_PATH
let source = readFileSync(file).toString()
let template = Handlebars.compile(source)

export default template
