#!/bin/sh

# 1. Substitute DO App Platform $PORT into Nginx config (Your existing logic)
# (Keep whatever sed or envsubst command you already have here to swap the port)

# 2. Start PHP-FPM in the background
php-fpm -D

# 3. Start Laravel Reverb in the background on port 8081
php artisan reverb:start --port=8081 &

# 4. Start Nginx in the FOREGROUND to keep the container alive
echo "Starting Nginx on port $PORT..."
nginx -g "daemon off;"