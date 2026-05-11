# Docker Configuration Checklist & Verification

## ✅ Files Created

Your Docker environment has been fully configured with the following files:

### Core Docker Files
- [x] `backend/Dockerfile` - PHP 8.2-FPM with pdo_mysql
- [x] `backend/.dockerignore` - Excludes node_modules, vendor, .env
- [x] `frontend/Dockerfile` - Node 18-Alpine with multi-stage build
- [x] `frontend/.dockerignore` - Excludes dist, node_modules, .env
- [x] `docker-compose.yml` - Orchestrates all services
- [x] `nginx.conf` - Web server configuration for Laravel + Static files

### Configuration Files
- [x] `.env.docker` - Template environment file for Docker
- [x] `backend/.env.example` - Backend environment template

### Helper Scripts
- [x] `setup-docker.sh` - Bash initialization script (Linux/macOS)
- [x] `setup-docker.bat` - PowerShell initialization script (Windows)

### Documentation
- [x] `DOCKER_SETUP.md` - Comprehensive setup & usage guide

---

## 🚀 Quick Start (Choose Your OS)

### Windows
```powershell
# Open PowerShell in the project root and run:
.\setup-docker.bat
```

### macOS / Linux
```bash
# Make the script executable
chmod +x setup-docker.sh

# Run the setup script
./setup-docker.sh
```

### Manual Setup (All Platforms)
```bash
# 1. Create environment file
cp .env.docker .env

# 2. Start services
docker-compose up -d

# 3. Wait ~10 seconds, then initialize
docker-compose exec app php artisan key:generate --force
docker-compose exec app php artisan migrate --force
docker-compose exec frontend npm install
```

---

## 🐳 Docker Services Explained

### 1. **MySQL Database** (`db`)
- **Image**: `mysql:8.0`
- **Port**: 3306 (exposed for local development)
- **Features**:
  - Auto-initializes with schema from `backend/database/data.sql`
  - Health checks enabled
  - Named volume for persistent data
- **Credentials** (from `.env`):
  - Username: `projet_user`
  - Password: `projet_password`
  - Database: `projet_pfe`

### 2. **Laravel Backend** (`app`)
- **Image**: Built from `backend/Dockerfile`
- **Base**: `php:8.2-fpm`
- **Port**: 9000 (internal PHP-FPM)
- **Features**:
  - Composer dependencies auto-installed
  - Storage and cache directories pre-configured
  - Real-time file sync via volumes
  - Database host: `db` (Docker network)
- **Key Environment Variables**:
  ```env
  DB_HOST=db
  DB_CONNECTION=mysql
  ```

### 3. **Nginx Web Server** (`nginx`)
- **Image**: `nginx:alpine`
- **Port**: 80 (HTTP, no HTTPS in dev)
- **Config**: `nginx.conf`
- **Features**:
  - Serves Laravel public directory
  - PHP-FPM integration
  - Gzip compression enabled
  - Blocks .env and .ht files
  - Routes `/api/*` to Laravel

### 4. **React Frontend** (`frontend`)
- **Image**: Built from `frontend/Dockerfile`
- **Base**: `node:18-alpine`
- **Port**: 5173 (Vite dev server)
- **Features**:
  - Vite HMR enabled for hot reload
  - File polling for Docker file sync
  - Real-time development experience
  - Auto-rebuilds on code changes

---

## 📊 Network & Volume Architecture

### Docker Network: `app-network` (bridge)
```
┌─────────────────────────────────────────┐
│        Docker Bridge Network            │
│          (app-network)                  │
├─────────────────────────────────────────┤
│  nginx:80                               │
│    ├─→ app:9000 (PHP-FPM)              │
│    └─→ frontend:5173 (static/dev)      │
│                                         │
│  app:9000 ←→ db:3306                   │
│  frontend ←→ nginx:80 (/api)           │
└─────────────────────────────────────────┘
```

### Volumes (for development)

**Backend Volume Mapping**:
```yaml
./backend:/var/www                    # Source code sync
/var/www/vendor                       # Excluded (use host's vendor)
/var/www/node_modules                 # Excluded (use container's)
/var/www/bootstrap/cache              # Named volume (performance)
/var/www/storage                      # Named volume (persistence)
```

**Frontend Volume Mapping**:
```yaml
./frontend:/app                       # Source code sync
/app/node_modules                     # Excluded (use container's)
/app/dist                             # Built assets
```

**Database Volume**:
```yaml
mysql_data:/var/lib/mysql             # Named volume (data persistence)
```

---

## 🔧 Configuration Details

### Vite Configuration (`frontend/vite.config.js`)
Updated for Docker development:
```javascript
server: {
  host: '0.0.0.0',           // Listen on all interfaces
  port: 5173,                // Standard Vite port
  hmr: {
    host: 'localhost',       // HMR host
    port: 5173,
    protocol: 'ws',
  },
  watch: {
    usePolling: true,        // Required for Docker file sync
  }
}
```

### Nginx Configuration (`nginx.conf`)
- **Root**: `/var/www/public` (Laravel public directory)
- **PHP Handler**: Routes `.php` files to PHP-FPM on `app:9000`
- **Fallback**: Routes all requests to `/index.php` (Laravel routing)
- **Security**: Blocks `.env`, `.htaccess`, and hidden files
- **Compression**: Gzip enabled for text assets

### Database Initialization
The `backend/database/data.sql` file is automatically imported when the MySQL container starts (via Docker entrypoint).

---

## 🌐 Frontend-Backend Communication

### Architecture
```
User Browser (localhost)
    ↓
Vite Dev Server (localhost:5173) ← Hot Reload via WebSocket
    ├─ Serves React components
    ├─ Handles HMR
    └─ Proxies API calls to:
         ↓
Nginx (localhost/api) → Nginx forwards to PHP-FPM
    ↓
Laravel App (app:9000)
    ↓
MySQL Database (db:3306)
```

### Environment Variables for API Communication

**Frontend** (`.env`):
```env
VITE_API_BASE_URL=http://localhost/api
```

**Backend** (`docker-compose.yml`):
```env
APP_URL=http://localhost
DB_HOST=db
```

### Example API Call from React:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api';

// Using fetch
fetch(`${API_BASE}/users`, {
  headers: { 'Accept': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data));

// Using axios
import axios from 'axios';
axios.defaults.baseURL = API_BASE;
axios.get('/users')
  .then(res => console.log(res.data));
```

---

## 🔄 Inertia.js Integration

Your project uses **Inertia.js** for seamless React/Laravel integration.

### How It Works in Docker
1. **Backend** (Laravel): Renders Inertia responses via controllers
2. **Frontend** (React): Receives and renders components
3. **Network**: Communication via HTTP/JSON through Nginx

### Example Controller Response:
```php
// app/Http/Controllers/UserController.php
return inertia('Users/Index', [
    'users' => User::all(),
]);
```

### Corresponding React Component:
```jsx
// frontend/src/Pages/Users/Index.jsx
import { usePage } from '@inertiajs/react';

export default function Index() {
  const { users } = usePage().props;
  return <div>{users.map(user => <p>{user.name}</p>)}</div>;
}
```

### Important: SSR (Server-Side Rendering)
- **Current Setup**: Client-side rendering only
- **For SSR**: You'd need to add a Node.js SSR server service in `docker-compose.yml`
- The current setup works perfectly for development and production

---

## 📁 Expected Directory Structure After Setup

```
project-root/
├── backend/
│   ├── Dockerfile ✅
│   ├── .dockerignore ✅
│   ├── .env.example ✅
│   ├── app/
│   ├── config/
│   ├── routes/
│   ├── storage/
│   ├── bootstrap/cache/
│   ├── vendor/ (after docker-compose up)
│   └── ...
├── frontend/
│   ├── Dockerfile ✅
│   ├── .dockerignore ✅
│   ├── vite.config.js ✅ (updated)
│   ├── src/
│   ├── node_modules/ (after npm install)
│   ├── dist/ (after npm run build)
│   └── ...
├── .env ✅ (create from .env.docker)
├── .env.docker ✅
├── docker-compose.yml ✅
├── nginx.conf ✅
├── setup-docker.sh ✅
├── setup-docker.bat ✅
├── DOCKER_SETUP.md ✅
├── DOCKER_CHECKLIST.md ✅ (this file)
└── ...
```

---

## ✅ Pre-Launch Verification

Before running `docker-compose up`, verify:

- [ ] `.env.docker` exists in project root
- [ ] `backend/Dockerfile` exists
- [ ] `frontend/Dockerfile` exists
- [ ] `docker-compose.yml` exists in project root
- [ ] `nginx.conf` exists in project root
- [ ] Docker Desktop/Engine is running
- [ ] Ports 80, 3306, 5173 are available
- [ ] At least 4GB free disk space

---

## 🚨 Common Issues & Solutions

### Issue: Containers Won't Start
**Solution**:
```bash
# Check logs
docker-compose logs app
docker-compose logs db

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Issue: Database Connection Refused
**Solution**:
- Verify `.env` has `DB_HOST=db` (not localhost)
- Check MySQL container health: `docker-compose logs db`
- Wait 10-15 seconds for MySQL to initialize

### Issue: Frontend Can't Connect to Backend
**Solution**:
- Check Nginx is running: `docker-compose ps nginx`
- Verify `VITE_API_BASE_URL` is set in `.env`
- Check browser console for CORS errors

### Issue: Port 80 Already in Use
**Solution**: Edit `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Changed from 80:80
```

Then access at: `http://localhost:8080`

### Issue: HMR Not Working
**Solution**:
- Verify `watch.usePolling: true` in `vite.config.js`
- Check port 5173 is accessible: `http://localhost:5173`
- Restart frontend container: `docker-compose restart frontend`

---

## 📚 Next Steps

1. **Run Setup**:
   - Windows: `.\setup-docker.bat`
   - Linux/macOS: `./setup-docker.sh`

2. **Verify Services**:
   - `docker-compose ps` (should show all containers running)
   - Visit `http://localhost:5173` (React app)
   - Visit `http://localhost/api` (Laravel API)

3. **Start Developing**:
   - Edit backend files in `/backend` → Changes appear instantly
   - Edit React components → Hot reload in browser
   - Use `docker-compose exec` for CLI commands

4. **Deploy**:
   - Build images: `docker-compose build --no-cache`
   - Push to registry: `docker tag projet_pfe_app myregistry/app`
   - Use in production with environment-specific configurations

---

## 📞 Support & Resources

| Resource | Link |
|----------|------|
| Docker Docs | https://docs.docker.com |
| Docker Compose | https://docs.docker.com/compose |
| Laravel Docs | https://laravel.com/docs |
| Vite Docs | https://vitejs.dev |
| Inertia.js | https://inertiajs.com |
| React Docs | https://react.dev |

---

**Last Updated**: May 2026
**Tested With**: Docker 24.x, Docker Compose 2.x, Laravel 12, React 19, Node 18
