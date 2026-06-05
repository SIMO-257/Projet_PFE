#!/bin/bash
set -e

# Substitute the PORT placeholder in the Nginx config
# DO App Platform assigns $PORT dynamically (typically 8080)
sed -i "s/__PORT__/${PORT:-8080}/g" /etc/nginx/conf.d/default.conf

# Start supervisord (manages Nginx + PHP-FPM + Reverb)
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
