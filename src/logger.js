var bunyan = require('bunyan')

export default bunyan.createLogger({
  name: process.env.SERVICE_NAME || 'marathon-service-router',
  service: process.env.SERVICE_NAME || 'marathon-service-router',
  level: process.env.LOG_LEVEL || 'INFO'
})
