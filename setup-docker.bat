@echo off
REM Docker Setup Initialization Script for Projet PFE (Windows)
REM This script sets up the Docker environment and initializes the application

setlocal enabledelayedexpansion

echo 🚀 Starting Projet PFE Docker Setup...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please update Docker Desktop.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from .env.docker template...
    copy .env.docker .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)

REM Build and start containers
echo.
echo 🐳 Building and starting Docker containers...
docker-compose up -d --build

REM Wait for database to be ready
echo.
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak

REM Check if database is healthy
set attempt=1
set max_attempts=30
:wait_db
if !attempt! geq %max_attempts% (
    echo ❌ Database failed to start
    pause
    exit /b 1
)

docker-compose exec -T db mysqladmin ping -h localhost --silent >nul 2>&1
if errorlevel 1 (
    echo   Attempt !attempt!/%max_attempts%: Waiting for MySQL...
    timeout /t 2 /nobreak
    set /a attempt=!attempt!+1
    goto wait_db
)

echo ✅ Database is ready

REM Generate Laravel app key
echo.
echo 🔑 Generating Laravel APP_KEY...
docker-compose exec -T app php artisan key:generate --force

REM Run migrations
echo.
echo 🗄️  Running database migrations...
docker-compose exec -T app php artisan migrate --force

REM Install frontend dependencies
echo.
echo 📦 Installing frontend dependencies...
docker-compose exec -T frontend npm install

REM Set proper permissions
echo.
echo 🔐 Setting proper file permissions...
docker-compose exec -T app chown -R www-data:www-data storage bootstrap/cache
docker-compose exec -T app chmod -R 755 storage bootstrap/cache

echo.
echo ✅ Setup Complete!
echo.
echo 📋 Your application is ready:
echo    🌐 Frontend (React): http://localhost:5173
echo    🔗 Backend API: http://localhost/api
echo    📊 MySQL: localhost:3306
echo.
echo 💡 Useful commands:
echo    View logs:     docker-compose logs -f
echo    Laravel CLI:   docker-compose exec app php artisan ^<command^>
echo    Node CLI:      docker-compose exec frontend npm ^<command^>
echo    Stop services: docker-compose down
echo.
echo 📚 For detailed information, see DOCKER_SETUP.md
echo.
pause
