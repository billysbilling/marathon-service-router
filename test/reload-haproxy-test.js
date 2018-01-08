import {expect} from 'chai'
import {stub} from 'sinon'
import fs from 'fs'
import promisify from 'es6-promisify'
import reloadHaproxy from '../lib/reload-haproxy'
import {deps} from '../lib/reload-haproxy'

let readFile = promisify(fs.readFile)
let writeFile = promisify(fs.writeFile)
let unlink = promisify(fs.unlink)

describe('reload-haproxy', () => {
    let subject

    let setup = (result) => {
        stub(deps, 'exec').resolves(result)
    }

    let cleanup = async () => {
        await unlink('tmp/haproxy.cfg')
        deps.exec.restore()
    }

    let readCfg = async () => {
        return (await readFile('tmp/haproxy.cfg')).toString()
    }

    let writeCfg = async (contents) => {
        await writeFile('tmp/haproxy.cfg', contents)
    }

    describe('when haproxy.cfg does not exist', () => {
        before(async () => {
            setup(['no exists\n'])
            await reloadHaproxy('haproxy fun')
        })

        after(cleanup)

        it('wrote haproxy.cfg', async () => {
            expect(await readCfg()).equal('haproxy fun')
        })

        it('reloaded haproxy', async () => {
            expect(deps.exec).calledTwice
            expect(deps.exec).calledWith('[ -f /var/run/haproxy.pid ] && echo "exists" || echo "no"')
            expect(deps.exec).calledWith('haproxy -f tmp/haproxy.cfg -p /var/run/haproxy.pid')
        })
    })

    describe('when haproxy.cfg exist and content changed', () => {
        before(async () => {
            setup(['exists\n'])
            writeCfg('haproxy old fun')
            await reloadHaproxy('haproxy fun')
        })

        after(cleanup)

        it('wrote haproxy.cfg', async () => {
            expect(await readCfg()).equal('haproxy fun')
        })

        it('reloaded haproxy', async () => {
            expect(deps.exec).calledTwice
            expect(deps.exec).calledWith('[ -f /var/run/haproxy.pid ] && echo "exists" || echo "no"')
            expect(deps.exec).calledWith('haproxy -f tmp/haproxy.cfg -p /var/run/haproxy.pid -sf $(cat /var/run/haproxy.pid)')
        })
    })

    describe('when haproxy.cfg exist and content is the same', () => {
        before(async () => {
            setup(['exists\n'])
            writeCfg('haproxy fun')
            await reloadHaproxy('haproxy fun')
        })

        after(cleanup)

        it('haproxy.cfg stayed the same', async () => {
            expect(await readCfg()).equal('haproxy fun')
        })

        it('did not reload haproxy', async () => {
            expect(deps.exec).notCalled
        })
    })
})
