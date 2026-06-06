# 🚌 CasaWay — Projet PFE

Application de gestion de tickets de bus avec portefeuille électronique, validation NFC/QR et administration.

---

## 🚀 Quick Start — Two Ways to Run

You can run the project **with Docker** (full stack, MySQL) or **directly with artisan + npm** (lighter, SQLite).

### 🐳 Option 1 — Docker (Full Stack)

```bash
# 1. Copy Docker env file to Laravel
cp .env.docker backend/.env

# 2. Start all services
docker-compose up -d

# 3. Generate app key & run migrations
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed

# 4. Install frontend deps (inside container)
docker-compose exec frontend npm install
```

**Access:**
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost/api |
| MySQL | localhost:3307 (user: projet_user, password: projet_password) |

> Full Docker reference: see [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

### 💻 Option 2 — Local (Artisan + NPM)

Requires PHP 8.2+, Composer, Node.js 22+, and optionally MySQL.

```bash
# ── 1. Backend Setup ──────────────────────────────────

cd backend

# Copy env file (SQLite by default — no MySQL needed!)
cp .env.example .env

# Install PHP dependencies
composer install

# Generate app key
php artisan key:generate

# Create SQLite database file & run migrations
touch database/database.sqlite
php artisan migrate

# Seed the database (optional)
php artisan db:seed

# ── 2. Frontend Setup ────────────────────────────────

cd ../frontend

# Install JS dependencies
npm install

# ── 3. Run Everything ────────────────────────────────

# Backend terminal (stays running):
cd backend && php artisan serve

# Frontend terminal (stays running):
cd frontend && npm run dev

# Or do both with one command (from backend/):
cd backend && composer run dev
```

*(`composer run dev` starts artisan serve, queue worker, logs, and Vite all at once using `concurrently`)*

**Access:**
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api |

The frontend Vite dev server proxies `/api/*` requests to the backend automatically.

---

## 🔀 Switching Between Modes

| You want… | What to do |
|-----------|------------|
| **Run with Docker** | `cp .env.docker backend/.env`, then `docker-compose up -d` |
| **Run locally** | `cp backend/.env.example backend/.env`, then `php artisan serve` + `npm run dev` |
| **Stop Docker** | `docker-compose down` |
| **Switch from local to Docker** | `docker-compose up -d` (containers use their own DB) |

> ⚠️ **Env files are different:** `.env.docker` uses MySQL via Docker, `.env.example` uses SQLite.
> Keep them separate — never copy one over the other without knowing which mode you want.

---

## 📁 Project Structure

```
Projet_PFE/
├── backend/              # Laravel API (PHP 8.2)
│   ├── app/              # Models, Controllers, Services, Events, Jobs
│   ├── config/           # App configuration
│   ├── database/         # Migrations, seeders, SQLite file
│   ├── routes/           # API & web routes
│   ├── .env.example      # Template for local dev
│   └── Dockerfile
├── frontend/             # React SPA (Vite + Redux)
│   ├── src/
│   │   ├── Pages/        # Route pages
│   │   ├── Components/   # Reusable components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API client (axios)
│   │   └── Redux/        # State management
│   ├── vite.config.js    # Dev server + proxy config
│   └── Dockerfile
├── docker-compose.yml    # Docker orchestration
├── docker-compose.prod.yml
├── .env.docker           # Env template for Docker
├── docker/nginx.local.conf # Nginx config for Docker
└── DOCKER_SETUP.md       # Detailed Docker guide
```

---

## 🔧 Common Tasks

### Database

```bash
# Local (SQLite) — after migrations, the file is at:
backend/database/database.sqlite

# Docker (MySQL) — access via:
docker-compose exec db mysql -u projet_user -p projet_pfe

# Reset all data (Docker):
docker-compose down -v && docker-compose up -d
```

### Artisan Commands

```bash
# Local:
cd backend && php artisan <command>

# Docker:
docker-compose exec app php artisan <command>
```

### NPM Commands (frontend)

```bash
# Local:
cd frontend && npm <command>

# Docker:
docker-compose exec frontend npm <command>
```

### Adding Packages

```bash
# PHP package (local):
cd backend && composer require vendor/package

# PHP package (Docker):
docker-compose exec app composer require vendor/package

# JS package (local):
cd frontend && npm install package-name

# JS package (Docker):
docker-compose exec frontend npm install package-name
```

---

## 🧪 Environment Variables

| Variable | Docker value | Local value | Purpose |
|----------|-------------|-------------|---------|
| `DB_CONNECTION` | `mysql` | `sqlite` | Database driver |
| `DB_HOST` | `db` | (ignored for SQLite) | Database host |
| `DB_DATABASE` | `projet_pfe` | `database/database.sqlite` | Database name/path |
| `SESSION_DRIVER` | `file` | `file` | Session storage |
| `VITE_API_URL` | `http://localhost` | *(blank — uses proxy)* | API base URL |

---

## 📚 Reference Docs

- [Docker Setup Guide](DOCKER_SETUP.md)
- [Database Schema](DATABASE_SCHEMA_REFERENCE.md)
- [Codebase Analysis](CODEBASE_ANALYSIS.md)
- [DB Usage Report](backend/DB_USAGE_REPORT.md)
- [Email Setup](EMAIL_SETUP.md)
