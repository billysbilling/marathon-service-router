import {expect} from 'chai'
import nock from 'nock'
import compileTemplate from '../lib/compile-template'

describe('compile-template', () => {
    it('supports partials', () => {
        let tpl = compileTemplate('{{>service-frontends}}')
        let res = tpl({
            services: [
                {
                    serviceId: 'fun-service-id'
                }
            ]
        })
        expect(res).contains('frontend fun-service-id-incoming')
    })
})
