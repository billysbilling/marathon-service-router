import got from 'got'
import EventSource from 'eventsource'
import config from './config'
import logger from './logger'

export async function getApps() {
    let response = await request('GET', `/v2/apps`)
    logger.trace(response)

    return response.body.apps
}

export async function getTasks() {
    let response = await request('GET', `/v2/tasks`)
    logger.trace(response)

    return response.body.tasks
}

export async function streamEvents() {
    return new Promise((resolve, reject) => {
        let connected = false
        let s = new EventSource(config.MARATHON_HOST + '/v2/events')
        s.onopen = function() {
            connected = true
            resolve(s)
        }
        s.onerror = function(e) {
            if (!connected) {
                let e2 = new Error(`Marathon event stream error ${e.status}: ` + JSON.stringify(e, null, '  '))
                e2.code = 'MARATHON_ERROR'
                e2.status = e.status
                reject(e2)
            }
        }
    })
}

export async function request(method, url) {
    try {
        return await got({
                method,
                url: config.MARATHON_HOST + url,
                responseType: 'json'
            })
    } catch (e) {
        let e2 = new Error(`Marathon error ${e.statusCode}: ` + JSON.stringify(e.response && e.response.body, null, '  '))
        e2.code = 'MARATHON_ERROR'
        e2.status = e.statusCode
        throw e2
    }
}
