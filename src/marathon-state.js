import _ from 'lodash'
import {getApps, getTasks} from './marathon'
import {log} from './logger'

export default async function() {
    log('Fetching state...')

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
        const ports = app.ports ||
            _.chain(app)
                .get('container.portMappings')
                .flatMap('servicePort')
                .value() || []

        return ports.forEach((servicePort, portIndex) => {
            let serviceId = appId + (ports.length > 1 ? '-' + servicePort : '')
            let tasks = (tasksPerApp[appId] || [])
                .filter(task => {
                    //Include the task if the app does not have any health checks
                    if (!app.healthChecks || app.healthChecks.length === 0) {
                        return true
                    }

                    //Exclude the task if the task does not have any healthCheckResults (it probably just started and is wihin its `gracePeriodSeconds`)
                    if (!task.healthCheckResults) {
                        return false
                    }

                    //Include the task if all health checks are passing
                    return task.healthCheckResults.every(check => check.alive)
                })
                .map(task => {
                    return {
                        taskId: task.id,
                        host: task.host,
                        port: task.ports[portIndex]
                    }
                })
                .sort((a, b) => {
                    a.taskId.localeCompare(b.taskId)
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

    let state = {
        services
    }

    log('State fetched')
    // console.log(JSON.stringify(state, null, '  '))

    return state
}

function formatAppId(id) {
    id = id.replace(/^\//, '')
    return id
}
