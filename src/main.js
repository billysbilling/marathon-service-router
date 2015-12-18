import Queue from 'promise-queue'
import sync from './sync'
import {streamEvents} from './marathon'
import {log} from './logger'

export default async function() {
    let queue = new Queue(1, 2)

    let enqueue = () => {
        if (queue.getQueueLength() <= 1) {
            queue.add(sync)
        }
    }

    //Stream events from Marathon
    let es = await streamEvents()
    log('Streaming events from Marathon')
    es.addEventListener('status_update_event', data => {
        log('Marathon status update event received')
        enqueue()
    })

    /*
    We fetch every 10 seconds no matter what. Probably being paranoid, but
    what if the Marathon event subscription doesn't work for a while and
    we miss an event?
    */
    setInterval(enqueue, 10 * 1000)

    //Sync right away
    enqueue()

    log('Marathon monitor started')
}
