import {expect} from 'chai'
import {stub} from 'sinon'
import sync from '../lib/sync'
import {deps} from '../lib/sync'

describe('sync', () => {
    let subject

    let setup = () => {
        stub(deps, 'marathonState').resolves({services: []})
        stub(deps, 'template').returns('haproxy fun')
        stub(deps, 'reloadHaproxy').resolves()
    }

    let cleanup = () => {
        deps.marathonState.restore()
        deps.template.restore()
        deps.reloadHaproxy.restore()
    }

    describe('successful', () => {
        before(async () => {
            setup()
            await sync()
        })

        after(cleanup)

        it('called marathonState', async () => {
            expect(deps.marathonState).calledOnce
        })

        it('called template', async () => {
            expect(deps.template).calledOnce
            let data = deps.template.firstCall.args[0]
            expect(data.services).deep.equal([])
            expect(data.env.NODE_ENV).equal('test')
        })

        it('called reloadHaproxy', async () => {
            expect(deps.reloadHaproxy).calledOnce
            expect(deps.reloadHaproxy).calledWith('haproxy fun')
        })
    })

    describe('when marathon fails', () => {
        before(async () => {
            setup()

            let e = new Error('Marathon test error')
            e.code = 'MARATHON_ERROR'
            deps.marathonState.rejects(e)

            await sync()
        })

        after(cleanup)

        it('did not reload haproxy', async () => {
            expect(deps.reloadHaproxy).notCalled
        })
    })
})
