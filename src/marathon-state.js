import {EventEmitter} from 'events'
import {getApps, getTasks, streamEvents} from './marathon'

export default class MarathonState extends EventEmitter {
    constructor() {
        super()

        this.polling = false
        this.changedSinceLastPoll = false
    }

    async start() {
        let es = await streamEvents()
        console.log('Streaming events from Marathon')
        es.addEventListener('status_update_event', data => {
            console.log('Marathon status update event received')
            this.fetch()
        })

        /*
        We fetch every 10 seconds no matter what. Probably being paranoid, but
        what if the Marathon event subscription doesn't work for a while and
        we miss an event?
        */
        setInterval(this.fetch.bind(this), 10 * 1000)
        await this.fetch()
    }

    async poll() {
        if (this.polling) {
            throw new Error('poll() should not be called more than once at a time.')
        }

        //If state changed since last poll, we return the new state immediately
        if (this.changedSinceLastPoll) {
            this.changedSinceLastPoll = false
            return this.state
        }

        //Wait for the next update to occur
        this.polling = true
        return new Promise(resolve => {
            this.once('updated', () => {
                this.polling = false
                this.changedSinceLastPoll = false
                resolve(this.state)
            })
        })
    }

    async fetch() {
        /*
        We only fetch once at a time. If a second fetch is requested we will
        start the next fetch after the active one finishes.
        */
        if (this.fetching) {
            this.fetchAgain = true
            return
        }
        console.log('Fetching state...')

        //TODO: Does Marathon use paging?
        let appsPayload = await getApps()
        // console.log(JSON.stringify(appsPayload, null, '  '))

        //TODO: Does Marathon use paging?
        let tasksPayload = await getTasks()
        // console.log(JSON.stringify(tasksPayload, null, '  '))

        let tasksPerApp = tasksPayload.reduce((memo, task) => {
            let appId = formatAppId(task.appId)

            if (!memo[appId]) {
                memo[appId] = []
            }
            memo[appId].push(task)

            return memo
        }, {})

        let services = []
        appsPayload.forEach(app => {
            let appId = formatAppId(app.id)
            app.ports.forEach((servicePort, portIndex) => {
                let serviceId = appId + (app.ports.length > 1 ? '-' + servicePort : '')
                let tasks = (tasksPerApp[appId] || []).map(task => {
                    return {
                        taskId: task.id,
                        host: task.host,
                        port: task.ports[portIndex]
                    }
                })
                services.push({
                    serviceId,
                    appId,
                    servicePort,
                    tasks: tasks
                })
            })
        })

        //Sort to get a uniform output
        services.sort((a, b) => a.serviceId.localeCompare(b.serviceId))
        services.forEach(service => {
            service.tasks.sort((a, b) => a.taskId.localeCompare(b.taskId))
        })

        this.state = {
            services
        }
        this.changedSinceLastPoll = true
        this.emit('updated')

        console.log('State fetched')
        // console.log(JSON.stringify(state, null, '  '))=

        this.fetching = false
        if (this.fetchAgain) {
            this.fetchAgain = false
            this.fetch()
        }
    }
}

function formatAppId(id) {
    id = id.replace(/^\//, '')
    return id
}
