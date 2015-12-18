import marathonState from './marathon-state'
import template from './template'
import reloadHaproxy from './reload-haproxy'
import {logError} from './logger'

let deps = {
    marathonState,
    template,
    reloadHaproxy
}
export {deps}

export default async function() {
    let state
    try {
        state = await deps.marathonState()
    } catch (e) {
        if (e.code === 'MARATHON_ERROR') {
            //If we got an error from the Marathon API we log it and continue (no crashing because of this)
            logError(e)
            return
        }
        throw e
    }

    let config = deps.template(state)

    await deps.reloadHaproxy(config)
}
