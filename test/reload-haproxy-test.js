import {expect} from 'chai'
import {stub} from 'sinon'
import fs from 'fs'
import reloadHaproxy from '../lib/reload-haproxy'
import {deps} from '../lib/reload-haproxy'
import config from '../lib/config'

describe('reload-haproxy', () => {
    let subject

    let setup = (result) => {
        stub(deps, 'exec').resolves(result)
    }

    let cleanup = () => {
        fs.unlinkSync(config.HAPROXY_CONFIG_PATH)
        deps.exec.restore()
    }

    let readCfg = async () => {
        return (fs.readFileSync(config.HAPROXY_CONFIG_PATH)).toString()
    }

    let writeCfg = async (contents) => {
        fs.writeFileSync(config.HAPROXY_CONFIG_PATH, contents)
    }

    describe('when haproxy.cfg does not exist', () => {
        before(async () => {
            setup({ stdout: 'no\n', stderr: '' })
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
            setup({ stdout: 'exists\n', stderr: '' })
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
            setup({ stdout: 'exists\n', stderr: '' })
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
