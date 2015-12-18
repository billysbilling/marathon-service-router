import {expect} from 'chai'
import nock from 'nock'
import marathonState from '../lib/marathon-state'

describe('marathon-state', () => {
    let subject
    let appsReq
    let tasksReq

    describe('normal circumstances', () => {
        before(async () => {
            appsReq = nock('http://master.mesos:8080')
                .get('/v2/apps')
                .reply(200, {
                    apps: [
                        {
                            id: '/invoices-api',
                            ports: [
                                50501
                            ]
                        },
                        {
                            id: '/contacts-api',
                            ports: [
                                50502,
                                50503
                            ]
                        }
                    ]
                })

            tasksReq = nock('http://master.mesos:8080')
                .get('/v2/tasks')
                .reply(200, {
                    tasks: [
                        {
                            id: 't1',
                            appId: 'invoices-api',
                            host: '1.1.1.1',
                            ports: [1001]
                        },
                        {
                            id: 't2',
                            appId: 'invoices-api',
                            host: '1.1.1.2',
                            ports: [1002]
                        },
                        {
                            id: 't3',
                            appId: 'contacts-api',
                            host: '1.1.1.1',
                            ports: [1003, 1004]
                        }
                    ]
                })

            subject = await marathonState()
        })

        it('is good', () => {
            expect(subject).deep.equal({
                services: [
                    {
                        serviceId: 'contacts-api-50502',
                        appId: 'contacts-api',
                        servicePort: 50502,
                        tasks: [
                            {
                                taskId: 't3',
                                host: '1.1.1.1',
                                port: 1003
                            }
                        ]
                    },
                    {
                        serviceId: 'contacts-api-50503',
                        appId: 'contacts-api',
                        servicePort: 50503,
                        tasks: [
                            {
                                taskId: 't3',
                                host: '1.1.1.1',
                                port: 1004
                            }
                        ]
                    },
                    {
                        serviceId: 'invoices-api',
                        appId: 'invoices-api',
                        servicePort: 50501,
                        tasks: [
                            {
                                taskId: 't1',
                                host: '1.1.1.1',
                                port: 1001
                            },
                            {
                                taskId: 't2',
                                host: '1.1.1.2',
                                port: 1002
                            }
                        ]
                    }
                ]
            })
        })
    })
})
