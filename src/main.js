import MarathonState from './marathon-state'
import template from './template'
import reloadHaproxy from './reload-haproxy'

export default async function() {
    let stateManager = new MarathonState()
    await stateManager.start()
    while (true) {
        let state = await stateManager.poll()
        let config = template(state)
        await reloadHaproxy(config)
    }
}
