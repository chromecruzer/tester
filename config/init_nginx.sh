#!/bin/bash
cp /var/lib/trac/config/webConfig.js /usr/share/nginx/html/assets/ && \
cp /var/lib/trac/config/nginx.conf /etc/nginx/conf.d/default.conf && \
nginx-debug -g "daemon off;"
#nginx -g "daemon off;"
