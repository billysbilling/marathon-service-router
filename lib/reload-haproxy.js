import fs from 'fs'
import promisify from 'es6-promisify'

let writeFile = promisify(fs.writeFile)

const HAPROXY_CONFIG_PATH = process.env.HAPROXY_CONFIG_PATH || './haproxy.cfg'

export default async function(config) {
    //TODO: Only reload haproxy if the file actually changed
    await writeFile(HAPROXY_CONFIG_PATH, config)
}
