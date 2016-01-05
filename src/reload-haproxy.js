import fs from 'fs'
import childProcess from 'child_process'
import promisify from 'es6-promisify'
import config from './config'
import {log} from './logger'

let writeFile = promisify(fs.writeFile)
let readFile = promisify(fs.readFile)

let deps = {
    exec: promisify(childProcess.exec)
}
export {deps}

export default async function(contents) {
    try {
        let current = await readFile(config.HAPROXY_CONFIG_PATH)
        current = current.toString()
        if (current == contents) {
            return
        }
    } catch (e) {
        //Ignore errors about the config file not existing (means it's the first run)
        if (e.code != 'ENOENT') {
            throw e
        }
    }

    log('Reloading HAProxy...')

    await writeFile(config.HAPROXY_CONFIG_PATH, contents)


    if (!process.env.NO_HAPROXY_RELOAD) {
        let pid = await deps.exec('[ -f /var/run/haproxy.pid ] && echo "exists" || echo "no"')
        let command = 'haproxy -f ' + config.HAPROXY_CONFIG_PATH + ' -p /var/run/haproxy.pid'
        if (pid === 'exists') {
            command += ' -sf $(cat /var/run/haproxy.pid)'
        }
        log('COMMAND: ' + command)
        await deps.exec(command)
    }

    log('HAProxy reloaded')
}
