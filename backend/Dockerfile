# Multi-stage build for Laravel backend
FROM php:8.2-fpm as base

# Install system dependencies including pcntl and sockets for Reverb
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    supervisor \
    nginx \
    gettext-base \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        gd \
        zip \
        mbstring \
        bcmath \
        xml \
        simplexml \
        dom \
        pcntl \
        sockets \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Create necessary directories and set permissions
RUN mkdir -p storage/logs \
    && chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage /var/www/bootstrap/cache

# Configure PHP-FPM to listen on TCP (for Docker networking)
RUN sed -i 's/listen = \/run\/php\/php8.2-fpm.sock/listen = 9000/g' /usr/local/etc/php-fpm.d/zz-docker.conf \
    && sed -i 's/listen = 9000/listen = 0.0.0.0:9000/g' /usr/local/etc/php-fpm.d/zz-docker.conf

# Supervisor config for Nginx + PHP-FPM + Reverb
RUN mkdir -p /etc/supervisor/conf.d
COPY docker-supervisord.conf /etc/supervisor/supervisord.conf
COPY docker-reverb.conf /etc/supervisor/conf.d/reverb.conf

# Nginx config (proxies HTTP to PHP-FPM and WebSocket /app to Reverb)
COPY docker-nginx.conf /etc/nginx/conf.d/default.conf

# Entrypoint: substitutes DO App Platform $PORT into Nginx config, then starts supervisord
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

CMD ["/usr/local/bin/docker-entrypoint.sh"]
