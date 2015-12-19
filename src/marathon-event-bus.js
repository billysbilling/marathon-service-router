import {EventEmitter} from 'events'
import {streamEvents} from './marathon'
import {log} from './logger'

let eventTypes = [
    'status_update_event',
    'health_status_changed_event'
]

export default class MarathonEventBus extends EventEmitter {
    async start() {
        this.es = await streamEvents()
        eventTypes.forEach(eventType => {
            this.es.addEventListener(eventType, () => {
                log(`Marathon ${eventType} received`)
                this.emit('update')
            })
        })
    }

    stop() {
        this.es.close()
    }
}
