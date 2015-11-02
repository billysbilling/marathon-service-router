#!/bin/bash

haproxy -f /etc/haproxy.cfg -p /var/run/haproxy.pid

node /srv/marathon-service-router/marathon-monitor.js
