import marathonState from './marathon-state'
import template from './template'
import reloadHaproxy from './reload-haproxy'

export default async function() {
    console.log('Syncing Marathon state...')
    let state = await marathonState()
    let config = template(state)
    console.log(config)
    await reloadHaproxy(config)
}
