import marathonRequest from './marathon-request'

//TODO: Health checks

export default async function() {
    //TODO: Does Marathon use paging?
    let appsPayload = await marathonRequest('GET', '/v2/apps')
    console.log(JSON.stringify(appsPayload, null, '  '))

    //TODO: Does Marathon use paging?
    let tasksPayload = await marathonRequest('GET', '/v2/tasks')
    console.log(JSON.stringify(tasksPayload, null, '  '))

    let tasksPerApp = tasksPayload.tasks.reduce((memo, task) => {
        let appId = formatAppId(task.appId)

        if (!memo[appId]) {
            memo[appId] = []
        }
        memo[appId].push(task)

        return memo
    }, {})

    let services = []
    appsPayload.apps.forEach(app => {
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

    let state = {
        services
    }

    console.log(JSON.stringify(state, null, '  '))

    return state
}

function formatAppId(id) {
    id = id.replace(/^\//, '')
    return id
}
