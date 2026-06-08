#!/bin/sh

# 1. Run pending database migrations (safe: each migration is idempotent with hasColumn guards)
php artisan migrate --force --ansi 2>&1 || echo "[entrypoint] WARNING: migrations failed -- check logs"

# 2. Optimize Laravel for production — clear stale cache then rebuild
# Each command uses || true so a single failure (e.g. route closures) doesn't
# prevent the container from starting with the remaining optimizations active.
php artisan optimize:clear
php artisan config:cache --ansi || true
php artisan route:cache --ansi || true
php artisan view:cache --ansi || true
php artisan event:cache --ansi || true

# 3. Substitute the dynamic DO port into the Nginx configuration file
# This finds "__PORT__" and replaces it with whatever value $PORT holds (e.g., 80 or 8080)
sed -i "s/__PORT__/${PORT}/g" /etc/nginx/conf.d/default.conf

# 4. Start PHP-FPM in the background
php-fpm -D

# 5. Start Nginx in the foreground to keep the container alive
echo "Starting Nginx on port $PORT..."
nginx -g "daemon off;"
