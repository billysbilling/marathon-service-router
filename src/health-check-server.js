import http from 'http'
import {log} from './logger'

let port = process.env.HEALTH_CHECK_NODE_PORT

let started = false

export function start() {
    if (!port) {
        return
    }
    if (started) {
        return
    }
    started = true
    return new Promise((resolve) => {
        http.createServer(function(req, res) {
            res.setHeader('content-type', 'text/plain')
            res.writeHead(200)
            res.write('OK')
            res.end()
        }).listen(port, function() {
            log('Health check server started on port ' + port)
            resolve()
        })
    })
}
