import httpRequest from 'request'

const MARATHON_HOST = process.env.MARATHON_HOST || 'http://master.mesos:8080'

export default async function(method, url, reqPayload) {
    return new Promise(function(resolve, reject) {
        url = MARATHON_HOST + url
        let options = {
    		method,
    		url,
    		json: reqPayload || true
    	}
        httpRequest(options, function(err, res, resPayload) {
			if (err) {
				reject(err)
			} else {
				let status = res.statusCode

				if (status >= 200 && status < 300) {
					resolve(resPayload)
				} else {
					let e = new Error('Marathon API error (' + status + '): ' + JSON.stringify(resPayload))
					e.code = 'MARATHON_API_ERROR'
					e.status = status
					e.payload = resPayload
					reject(e)
				}
			}
		})
    })
}
