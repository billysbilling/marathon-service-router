import {EventEmitter} from 'events'
import {expect} from 'chai'
import {stub, useFakeTimers} from 'sinon'
import Main from '../lib/main'
import {deps} from '../lib/main'

describe('main', () => {
    let subject
    let clock
    let emitter

    let setup = () => {
        clock = useFakeTimers()

        stub(deps, 'sync', () => {
            return new Promise(resolve => {
                setTimeout(resolve, 100)
            })
        })

        emitter = new EventEmitter()
        emitter.start = () => {}
        emitter.stop = () => {}
        stub(deps, 'MarathonEventBus').returns(emitter)
    }

    let cleanup = () => {
        subject.stop()
        deps.sync.restore()
        deps.MarathonEventBus.restore()
        clock.restore()
    }

    let wait = () => new Promise(setImmediate)

    describe('start', () => {
        before(async () => {
            setup()
            subject = new Main()
            await subject.start()
            clock.tick(100)
        })

        after(cleanup)

        it('synced right away', () => {
            expect(deps.sync).calledOnce
        })
    })

    describe('syncs due to events', () => {
        before(async () => {
            setup()
            subject = new Main()
            await subject.start()

            //Initial sync
            clock.tick(100)
        })

        after(cleanup)

        it('triggers', async () => {
            expect(deps.sync).callCount(1)

            emitter.emit('update')
            expect(deps.sync).callCount(2)
            await wait

            clock.tick(10)
            emitter.emit('update')
            await wait
            expect(deps.sync).callCount(2)

            clock.tick(10)
            emitter.emit('update')
            await wait
            expect(deps.sync).callCount(2)

            clock.tick(80)
            await wait
            expect(deps.sync).callCount(3)
        })
    })

    describe('syncs periodically', () => {
        before(async () => {
            setup()
            subject = new Main()
            await subject.start()

            //Initial sync
            clock.tick(100)
        })

        after(cleanup)

        it('triggers', async () => {
            expect(deps.sync).callCount(1)

            clock.tick(10 * 1000)
            clock.tick(100)
            await wait
            expect(deps.sync).callCount(2)

            clock.tick(10 * 1000)
            clock.tick(100)
            await wait
            expect(deps.sync).callCount(3)

            clock.tick(10 * 1000)
            clock.tick(100)
            await wait
            expect(deps.sync).callCount(4)
        })
    })
})
