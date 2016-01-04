#!/bin/sh

set -e

# Copy default haproxy.cfg template
cp /app/templates/haproxy.cfg.hbs /haproxy.cfg.hbs
cp /app/templates/initial.cfg /etc/haproxy.cfg

# Copy runit services
mkdir -p /etc/service/marathon-monitor
cp /app/docker/services/marathon-monitor.sh /etc/service/marathon-monitor/run

# Copy startup scripts
cp /app/docker/scripts/haproxy.sh /etc/my_init.d/haproxy.sh
