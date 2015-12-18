import {readFileSync} from 'fs'
import config from './config'
import compileTemplate from './compile-template'

let source = readFileSync(config.HAPROXY_TEMPLATE_PATH).toString()
let template = compileTemplate(source)

export default template
