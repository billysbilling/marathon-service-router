import Queue from 'promise-queue'
import sync from './sync'
import MarathonEventBus from './marathon-event-bus'
import {log} from './logger'

let deps = {
    sync,
    MarathonEventBus
}
export {deps}

export default class Main {
    async start() {
        log('Starting...')

        let queue = new Queue(1, 2)
        let enqueue = () => {
            if (queue.getQueueLength() <= 1) {
                queue.add(deps.sync)
            }
        }

        //Stream events from Marathon
        this.eventBus = new deps.MarathonEventBus()
        this.eventBus.on('update', enqueue)
        await this.eventBus.start()

        /*
        We fetch every 10 seconds no matter what. Probably being paranoid, but
        what if the Marathon event subscription doesn't work for a while and
        we miss an event?
        */
        this.timer = setInterval(enqueue, 10 * 1000)

        //Sync right away
        enqueue()

        log('Started')
    }

    stop() {
        this.eventBus.stop()
        clearInterval(this.timer)
    }
}
