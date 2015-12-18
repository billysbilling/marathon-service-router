import marathonState from './marathon-state'
import template from './template'
import reloadHaproxy from './reload-haproxy'

export default async function() {
    let state = await marathonState()
    let config = template(state)
    await reloadHaproxy(config)
}
