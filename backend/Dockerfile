# Multi-stage build for Laravel backend
FROM php:8.2-fpm as base

# Install system dependencies
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

    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Remove default Nginx site config to avoid port conflicts
RUN rm -f /etc/nginx/sites-enabled/default

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

# Configure PHP-FPM to listen on TCP port 9000 (for Docker networking)
RUN echo "listen = 0.0.0.0:9000" >> /usr/local/etc/php-fpm.d/zz-docker.conf

# Supervisor config for Nginx + PHP-FPM
RUN mkdir -p /etc/supervisor/conf.d
COPY docker-supervisord.conf /etc/supervisor/supervisord.conf

# Nginx config
COPY docker-nginx.conf /etc/nginx/conf.d/default.conf

# Copy the entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the internal routing ports
EXPOSE 9000

# Run the unified entrypoint script (ONLY ONE CMD ALLOWED)
CMD ["/usr/local/bin/docker-entrypoint.sh"]

