import fs from 'fs'
import util from 'util'
import config from './config'
import logger from './logger'

let deps = {
    exec: util.promisify(require('child_process').exec)
}
export {deps}

export default async function(contents) {
    try {
        let current = fs.readFileSync(config.HAPROXY_CONFIG_PATH)
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

    logger.info(
        { type: 'x-haproxy-config-file-update', data: contents },
        'Updating haproxy configuration file...'
    )

    fs.writeFileSync(config.HAPROXY_CONFIG_PATH, contents)

    logger.info({ type: 'x-haproxy-reloading' }, 'Reloading haproxy...')

    if (!process.env.NO_HAPROXY_RELOAD) {
        let pidChild = await deps.exec('[ -f /var/run/haproxy.pid ] && echo "exists" || echo "no"')

        let command = 'haproxy -f ' + config.HAPROXY_CONFIG_PATH + ' -p /var/run/haproxy.pid'

        if (pidChild.stdout.trim() === 'exists') {
            command += ' -sf $(cat /var/run/haproxy.pid)'
        }

        await deps.exec(command)
    }

    logger.info({ type: 'x-haproxy-reloaded' }, 'haproxy reloaded')
}
