import {join} from 'path'

export default {
    MARATHON_HOST: process.env.MARATHON_HOST || 'http://master.mesos:8080',
    HAPROXY_TEMPLATE_PATH: process.env.HAPROXY_TEMPLATE_PATH || join(__dirname, '../templates/haproxy.cfg.hbs'),
    HAPROXY_CONFIG_PATH: process.env.HAPROXY_CONFIG_PATH || './haproxy.cfg'
}
