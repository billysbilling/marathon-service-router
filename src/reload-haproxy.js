import fs from 'fs'
import childProcess from 'child_process'
import promisify from 'es6-promisify'

let writeFile = promisify(fs.writeFile)
let readFile = promisify(fs.readFile)
let exec = promisify(childProcess.exec)

const HAPROXY_CONFIG_PATH = process.env.HAPROXY_CONFIG_PATH || './haproxy.cfg'

export default async function(config) {
    //TODO: Only reload haproxy if the file actually changed
    try {
        let current = await readFile(HAPROXY_CONFIG_PATH)
        if (current == config) {
            return
        }
    } catch (e) {
        //Ignore errors about the config file not existing (means it's the first run)
        if (e.code != 'ENOENT') {
            throw e
        }
    }

    console.log('Reloading HAProxy config...')

    await writeFile(HAPROXY_CONFIG_PATH, config)

    let command = 'haproxy -f ' + HAPROXY_CONFIG_PATH + ' -p /var/run/haproxy.pid -sf $(cat /var/run/haproxy.pid)'
    let options = {}
    await exec(command, options)

    console.log('Reloaded')
}
