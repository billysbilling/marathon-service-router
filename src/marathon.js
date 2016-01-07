import requestp from 'request-promise'
import EventSource from 'eventsource'
import config from './config'

export async function getApps() {
    let {apps} = await request('GET', `/v2/apps`)
    return apps
}

export async function getTasks() {
    let {tasks} = await request('GET', `/v2/tasks`)
    return tasks
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

export async function request(method, url, {payload}={}) {
    try {
        return await requestp({
                method,
                url: config.MARATHON_HOST + url,
                json: payload || true
            })
    } catch (e) {
        let e2 = new Error(`Marathon error ${e.statusCode}: ` + JSON.stringify(e.response && e.response.body, null, '  '))
        e2.code = 'MARATHON_ERROR'
        e2.status = e.statusCode
        throw e2
    }
}
