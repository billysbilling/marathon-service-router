import {expect} from 'chai'
import nock from 'nock'
import template from '../lib/template'

describe('template', () => {
    it('compiles', () => {
        let compiled = template({
            services: [
                {
                    serviceId: 'service-a'
                },
                {
                    serviceId: 'service-b'
                }
            ]
        })

        expect(compiled).equal('haproxy fun\nservice-a\nservice-b\n')
    })
})
