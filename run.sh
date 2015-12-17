#!/bin/bash

haproxy -f /etc/haproxy.cfg -p /var/run/haproxy.pid

/app/bin/marathon-monitor
