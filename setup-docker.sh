#!/bin/bash

# Docker Setup Initialization Script for Projet PFE
# This script sets up the Docker environment and initializes the application

set -e

echo "🚀 Starting Projet PFE Docker Setup..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.docker template..."
    cp .env.docker .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Build and start containers
echo ""
echo "🐳 Building and starting Docker containers..."
docker-compose up -d --build

# Wait for database to be ready
echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is healthy
max_attempts=30
attempt=1
until docker-compose exec -T db mysqladmin ping -h localhost --silent &> /dev/null || [ $attempt -eq $max_attempts ]; do
    echo "  Attempt $attempt/$max_attempts: Waiting for MySQL..."
    sleep 2
    ((attempt++))
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Database failed to start"
    exit 1
fi

echo "✅ Database is ready"

# Generate Laravel app key
echo ""
echo "🔑 Generating Laravel APP_KEY..."
docker-compose exec -T app php artisan key:generate --force

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
docker-compose exec -T app php artisan migrate --force

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
docker-compose exec -T frontend npm install

# Set proper permissions
echo ""
echo "🔐 Setting proper file permissions..."
docker-compose exec -T app chown -R www-data:www-data storage bootstrap/cache
docker-compose exec -T app chmod -R 755 storage bootstrap/cache

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Your application is ready:"
echo "   🌐 Frontend (React): http://localhost:5173"
echo "   🔗 Backend API: http://localhost/api"
echo "   📊 MySQL: localhost:3306"
echo ""
echo "💡 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Laravel CLI:   docker-compose exec app php artisan <command>"
echo "   Node CLI:      docker-compose exec frontend npm <command>"
echo "   Stop services: docker-compose down"
echo ""
echo "📚 For detailed information, see DOCKER_SETUP.md"
