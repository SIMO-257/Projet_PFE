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

# Supervisor config for PHP-FPM + Reverb
RUN mkdir -p /etc/supervisor/conf.d
COPY docker-supervisord.conf /etc/supervisor/supervisord.conf
COPY docker-reverb.conf /etc/supervisor/conf.d/reverb.conf

# Expose ports for PHP-FPM (9000) and Reverb (8080)
EXPOSE 9000
EXPOSE 8080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
