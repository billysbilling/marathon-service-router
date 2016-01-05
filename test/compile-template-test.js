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

    it('eq helper', () => {
        let tpl = compileTemplate('{{#if (eq type "invoice")}}Invoice{{else}}Something else{{/if}}')
        expect(tpl({type: 'invoice'})).equals('Invoice')
        expect(tpl({type: 'not-it'})).equals('Something else')
    })

    it('neq helper', () => {
        let tpl = compileTemplate('{{#if (neq type "invoice")}}Not an invoice{{else}}An invoice{{/if}}')
        expect(tpl({type: 'invoice'})).equals('An invoice')
        expect(tpl({type: 'not-it'})).equals('Not an invoice')
    })
})
