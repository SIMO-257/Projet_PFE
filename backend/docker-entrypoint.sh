#!/bin/sh

# 1. Clear Laravel cache to ensure fresh config/routes/services on every deploy
php artisan optimize:clear

# 2. Substitute the dynamic DO port into the Nginx configuration file
# This finds "__PORT__" and replaces it with whatever value $PORT holds (e.g., 80 or 8080)
sed -i "s/__PORT__/${PORT}/g" /etc/nginx/conf.d/default.conf

# 3. Start PHP-FPM in the background
php-fpm -D

# 4. Start Nginx in the foreground to keep the container alive
echo "Starting Nginx on port $PORT..."
nginx -g "daemon off;"