import {join} from 'path'
import {readFileSync} from 'fs'
import Handlebars from 'handlebars'
import config from './config'

let source = readFileSync(config.HAPROXY_TEMPLATE_PATH).toString()
let template = Handlebars.compile(source)

export default template
