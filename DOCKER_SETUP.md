# Docker Setup & Quick Start Guide

## 📋 Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)
- At least 4GB of free disk space

## 🚀 Quick Start

### 1. Environment Configuration
Copy the provided environment file:
```bash
cp .env.docker .env
```

Or create a `.env` file in the root directory with these variables:
```env
# Application
APP_NAME="Projet PFE"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Database
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=projet_pfe
DB_USERNAME=projet_user
DB_PASSWORD=projet_password
DB_ROOT_PASSWORD=root

# Cache & Queue
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Frontend API
VITE_API_BASE_URL=http://localhost/api
```

### 2. Start the Docker Environment
```bash
docker-compose up -d
```

This will start:
- **MySQL 8.0** database service (port 3306)
- **Laravel** backend service (php:8.2-fpm)
- **Nginx** web server (port 80)
- **React** frontend service with Vite dev server (port 5173)

### 3. Initialize the Application (First Time Only)

#### Generate Laravel APP_KEY:
```bash
docker-compose exec app php artisan key:generate
```

#### Run Database Migrations:
```bash
docker-compose exec app php artisan migrate
```

#### Seed the Database (if seeders exist):
```bash
docker-compose exec app php artisan db:seed
```

#### Install Frontend Dependencies:
```bash
docker-compose exec frontend npm install
```

### 4. Access Your Application

| Service | URL | Details |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | React Vite dev server with HMR |
| **Backend API** | http://localhost/api | Served through Nginx + Laravel |
| **Nginx** | http://localhost | Web server root |
| **MySQL** | localhost:3306 | Database (host: `db`, user: `projet_user`) |

## 📁 Project Structure in Docker

```
.
├── backend/              # Laravel application
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── app/
│   ├── routes/
│   ├── config/
│   └── ...
├── frontend/             # React application
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── src/
│   ├── vite.config.js
│   └── ...
├── docker-compose.yml    # Orchestration
├── nginx.conf            # Nginx configuration
├── .env.docker           # Docker environment template
└── .env                  # Your actual environment (create from .env.docker)
```

## 🛠️ Common Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f frontend
docker-compose logs -f db
```

### Execute Commands in Containers

#### Laravel Artisan Commands:
```bash
docker-compose exec app php artisan <command>

# Examples:
docker-compose exec app php artisan tinker
docker-compose exec app php artisan make:migration <name>
docker-compose exec app php artisan make:controller <name>
```

#### Frontend npm Commands:
```bash
docker-compose exec frontend npm <command>

# Examples:
docker-compose exec frontend npm install <package>
docker-compose exec frontend npm run build
```

#### MySQL Commands:
```bash
docker-compose exec db mysql -u projet_user -p projet_pfe
```

### Rebuild Services (if Dockerfile changes)
```bash
docker-compose up -d --build
```

### Clean Up & Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Remove all containers, networks, and volumes
docker-compose down --rmi all -v
```

## 🔒 File Permissions & Storage

The Docker setup automatically handles permissions for:
- `/backend/storage/` - Writable by www-data
- `/backend/bootstrap/cache/` - Writable by www-data

If you encounter permission issues, run:
```bash
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
docker-compose exec app chmod -R 755 storage bootstrap/cache
```

## 🔄 Real-Time Development

### Laravel Changes
The backend volume is mounted at `/var/www`, so changes to PHP files are reflected immediately. No rebuild needed.

### React Changes
The frontend runs Vite with HMR enabled. Changes to React components and CSS are hot-reloaded in the browser automatically.

### Vendor/Node Modules Updates
```bash
# Backend - install new PHP packages
docker-compose exec app composer require vendor/package

# Frontend - install new npm packages
docker-compose exec frontend npm install package-name
```

## 🗄️ Database Management

### Import Existing Data
If you have a database dump, copy it to the backend and run:
```bash
docker-compose exec db mysql -u projet_user -p projet_pfe < /path/to/dump.sql
```

### Export Database
```bash
docker-compose exec db mysqldump -u projet_user -p projet_pfe > backup.sql
```

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
docker-compose exec app php artisan migrate
```

## 🌐 Frontend-Backend Communication

### From React to Laravel API
Set the API base URL in your React code:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api';

// In your fetch/axios calls:
fetch(`${API_BASE}/endpoint`);
// or
axios.defaults.baseURL = API_BASE;
```

### CORS Configuration
The Nginx config passes all requests to `/api/*` directly to Laravel. Ensure your backend's CORS config in `config/cors.php` allows requests from the frontend.

## 🔧 Inertia.js & SSR (If Enabled)

If you're using Inertia.js for SSR:
1. Ensure Laravel can communicate with Node SSR server on port 13714
2. Update `docker-compose.yml` to add an SSR service if needed
3. Configure the SSR URL in `config/inertia.php`

## ⚠️ Troubleshooting

### Containers Won't Start
```bash
# Check logs
docker-compose logs app
docker-compose logs frontend
docker-compose logs db

# Restart services
docker-compose restart
```

### Permission Denied Errors
```bash
# Fix storage permissions
docker-compose exec app chown -R www-data:www-data storage
```

### Frontend Can't Connect to Backend
- Ensure Nginx is running: `docker-compose ps`
- Check the backend is healthy: `docker-compose logs app`
- Verify VITE_API_BASE_URL matches your setup

### Database Connection Issues
- Verify DB_HOST is set to `db` (not localhost)
- Check MySQL container is healthy: `docker-compose exec db mysqladmin ping`
- Verify credentials in .env match docker-compose.yml

### Port Already in Use
If ports 80, 3306, or 5173 are in use, modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "8080:80"    # Frontend/API access via :8080
  - "3307:3306"  # MySQL via :3307
  - "5174:5173"  # Vite dev server via :5174
```

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [Vite Documentation](https://vitejs.dev)
- [Inertia.js Documentation](https://inertiajs.com)

## ✅ Verification Checklist

After setup, verify everything is working:

- [ ] All containers running: `docker-compose ps`
- [ ] Frontend accessible at http://localhost:5173
- [ ] Backend accessible at http://localhost/api
- [ ] Database connected: `docker-compose exec app php artisan tinker` → `exit`
- [ ] HMR working: Edit a React component and see it hot-reload
- [ ] Storage writable: Can create files in storage/
