#!/bin/sh

set -e

# Copy default haproxy.cfg template
cp /app/templates/haproxy.cfg.hbs /haproxy.cfg.hbs

# Copy runit services
mkdir -p /etc/service/marathon-monitor
cp /app/docker/services/marathon-monitor.sh /etc/service/marathon-monitor/run
