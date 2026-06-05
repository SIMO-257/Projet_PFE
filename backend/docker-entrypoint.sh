#!/bin/sh

# 1. Substitute the dynamic DO port into the Nginx configuration file
# This finds "__PORT__" and replaces it with whatever value $PORT holds (e.g., 80 or 8080)
sed -i "s/__PORT__/${PORT}/g" /etc/nginx/conf.d/default.conf

# 2. Start PHP-FPM in the background
php-fpm -D

# 3. Start Laravel Reverb in the background on port 8081
php artisan reverb:start --port=8081 &

# 4. Start Nginx in the foreground to keep the container alive
echo "Starting Nginx on port $PORT..."
nginx -g "daemon off;"