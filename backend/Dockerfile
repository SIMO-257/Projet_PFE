# Multi-stage build for Laravel backend
FROM php:8.2-apache as base

# Install system dependencies (Added libxml2-dev)
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

# Configure Apache DocumentRoot
RUN sed -ri -e 's!/var/www/html!/var/www/public!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!/var/www/public!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Enable Apache mod_rewrite for Laravel routing
RUN a2enmod rewrite

# Expose port 80 for HTTP
EXPOSE 80
# Multi-stage build for Laravel backend
# FROM php:8.2-apache as base

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     git \
#     curl \
#     libpng-dev \
#     libjpeg-dev \
#     libfreetype6-dev \
#     zip \
#     unzip \
#     libzip-dev \
#     libonig-dev \
#     && docker-php-ext-configure gd --with-freetype --with-jpeg \
#     && docker-php-ext-install -j$(nproc) \
#         pdo \
#         pdo_mysql \
#         gd \
#         zip \
#         mbstring \
#         bcmath \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

# # Install Composer
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# # Set working directory
# WORKDIR /var/www

# # Copy application files
# COPY . .

# # Install PHP dependencies
# RUN composer install --no-dev --optimize-autoloader

# # Create necessary directories and set permissions
# RUN mkdir -p storage/logs \
#     && chown -R www-data:www-data /var/www \
#     && chmod -R 755 /var/www/storage /var/www/bootstrap/cache

# # Configure Apache DocumentRoot
# RUN sed -ri -e 's!/var/www/html!/var/www/public!g' /etc/apache2/sites-available/*.conf
# RUN sed -ri -e 's!/var/www/!/var/www/public!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# # Enable Apache mod_rewrite for Laravel routing
# RUN a2enmod rewrite

# # Expose port 80 for HTTP
# EXPOSE 80
