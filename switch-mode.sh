#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
#  CasaWay — Mode Switcher
#  Usage:  ./switch-mode.sh docker|local|status
# ═══════════════════════════════════════════════════════════════

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# ── Colors ─────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}ℹ${NC}  $1"; }
ok()    { echo -e "${GREEN}✔${NC}  $1"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $1"; }
err()   { echo -e "${RED}✘${NC}  $1"; }

# ── Helpers ────────────────────────────────────────────────────

# Kill any process listening on a given port
kill_port() {
  local port=$1
  local pid
  pid=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    kill "$pid" 2>/dev/null || true
  fi
  # Wait for the port to be released (up to 15 seconds for Docker port handover)
  local waited=0
  while lsof -ti :"$port" >/dev/null 2>&1; do
    if [ $waited -ge 15 ]; then
      warn "Port $port still in use after ${waited}s — continuing anyway"
      return 1
    fi
    sleep 1
    waited=$((waited + 1))
  done
  ok "Freed port $port"
}

# Check if Docker is running
docker_running() {
  docker info >/dev/null 2>&1
}

# Check if Docker containers are up
docker_containers_up() {
  docker-compose -f "$ROOT_DIR/docker-compose.yml" ps --services 2>/dev/null \
    | grep -q . 2>/dev/null
}

# Detect current mode based on backend/.env
detect_mode() {
  local env_file="$BACKEND_DIR/.env"
  if [ ! -f "$env_file" ]; then
    echo "none"
    return
  fi
  local db_host
  db_host=$(grep -E '^DB_HOST=' "$env_file" | cut -d= -f2 | tr -d ' ')
  if [ "$db_host" = "db" ]; then
    echo "docker"
  elif [ "$db_host" = "127.0.0.1" ]; then
    echo "local"
  else
    echo "unknown"
  fi
}

# ── Commands ───────────────────────────────────────────────────

cmd_status() {
  echo ""
  echo "  ╔══════════════════════════════════════╗"
  echo "  ║      CasaWay — Mode Status           ║"
  echo "  ╚══════════════════════════════════════╝"
  echo ""

  local mode
  mode=$(detect_mode)
  echo -e "  Mode (from backend/.env):  ${YELLOW}$mode${NC}"

  if docker_running; then
    echo -e "  Docker daemon:             ${GREEN}running${NC}"
    if docker_containers_up; then
      echo ""
      echo "  Docker containers:"
      docker-compose -f "$ROOT_DIR/docker-compose.yml" ps --services 2>/dev/null \
        | while read -r svc; do
          echo -e "    ${GREEN}✔${NC}  $svc"
        done
    fi
  else
    echo -e "  Docker daemon:             ${RED}not running${NC}"
  fi

  # Check local dev servers — try lsof first, fall back to curl health check
  local backend_pid
  backend_pid=$(lsof -ti :8000 2>/dev/null || true)
  if [ -z "$backend_pid" ]; then
    # lsof didn't find it — try a quick HTTP check
    if curl -s -o /dev/null --max-time 2 http://127.0.0.1:8000/api/health 2>/dev/null; then
      backend_pid="(responding on port 8000)"
    fi
  fi

  local frontend_port="5173"
  local frontend_pid
  frontend_pid=$(lsof -ti :5173 2>/dev/null || true)
  if [ -z "$frontend_pid" ]; then
    frontend_pid=$(lsof -ti :5174 2>/dev/null || true)
    [ -n "$frontend_pid" ] && frontend_port="5174"
  fi
  if [ -z "$frontend_pid" ]; then
    for fp in 5173 5174; do
      if curl -s -o /dev/null --max-time 2 http://127.0.0.1:"$fp" 2>/dev/null; then
        frontend_pid="(responding on port $fp)"
        frontend_port="$fp"
        break
      fi
    done
  fi

  echo ""
  if [ -n "$backend_pid" ]; then
    echo -e "  Backend (port 8000):       ${GREEN}running $backend_pid${NC}"
  else
    echo -e "  Backend (port 8000):       ${RED}stopped${NC}"
  fi
  if [ -n "$frontend_pid" ]; then
    echo -e "  Frontend (port $frontend_port): ${GREEN}running $frontend_pid${NC}"
  else
    echo -e "  Frontend (port 5173):      ${RED}stopped${NC}"
  fi

  echo ""
  local current_mode
  current_mode=$(detect_mode)
  if [ "$current_mode" = "docker" ]; then
    echo -e "  🐳  Your project is configured for ${BLUE}Docker mode${NC}"
    echo -e "      Access:  Frontend → ${BLUE}http://localhost:5173${NC}"
    echo -e "               Backend  → ${BLUE}http://localhost/api${NC}"
  elif [ "$current_mode" = "local" ]; then
    echo -e "  💻  Your project is configured for ${BLUE}Local mode${NC}"
    echo -e "      Access:  Frontend → ${BLUE}http://localhost:5173${NC}"
    echo -e "               Backend  → ${BLUE}http://localhost:8000/api${NC}"
  fi
  echo ""
}

cmd_docker() {
  echo ""
  echo "  ╔══════════════════════════════════════╗"
  echo "  ║     Switching to DOCKER mode...      ║"
  echo "  ╚══════════════════════════════════════╝"
  echo ""

  # 1. Kill any local dev servers
  warn "Stopping local dev servers..."
  kill_port 8000
  kill_port 5173

  # 2. Copy Docker env file
  if [ ! -f "$ROOT_DIR/.env.docker" ]; then
    err "Missing .env.docker file at project root!"
    exit 1
  fi
  cp "$ROOT_DIR/.env.docker" "$BACKEND_DIR/.env"
  ok "Copied .env.docker → backend/.env"

  # 2b. Update frontend .env for Docker mode (Vite proxy through nginx)
  if [ -f "$FRONTEND_DIR/.env" ]; then
    sed -i 's|^VITE_API_URL=.*|VITE_API_URL=|' "$FRONTEND_DIR/.env"
    sed -i 's|^VITE_API_PROXY_TARGET=.*|VITE_API_PROXY_TARGET=http://nginx|' "$FRONTEND_DIR/.env"
    grep -q '^VITE_API_URL=' "$FRONTEND_DIR/.env" || echo 'VITE_API_URL=' >> "$FRONTEND_DIR/.env"
    grep -q '^VITE_API_PROXY_TARGET=' "$FRONTEND_DIR/.env" || echo 'VITE_API_PROXY_TARGET=http://nginx' >> "$FRONTEND_DIR/.env"
    ok "Updated frontend/.env for Docker mode (VITE_API_URL= → Vite proxy)"
  fi

  # 3. Start Docker
  if ! docker_running; then
    err "Docker is not running. Please start Docker Desktop first."
    exit 1
  fi
  info "Starting Docker containers..."
  cd "$ROOT_DIR"
  docker-compose up -d 2>&1 | while read -r line; do
    echo "    $line"
  done
  ok "Docker containers started"

  # 4. Wait for DB to be healthy
  info "Waiting for database to be ready..."
  sleep 3
  docker-compose exec -T db mysqladmin ping --silent -u projet_user -pprojet_password 2>/dev/null \
    || { sleep 5; docker-compose exec -T db mysqladmin ping --silent -u projet_user -pprojet_password 2>/dev/null; } \
    || true

  # 5. Generate app key & migrate (idempotent — safe to run every time)
  info "Ensuring app key is set..."
  docker-compose exec -T app php artisan key:generate --force 2>/dev/null || true

  info "Running migrations..."
  docker-compose exec -T app php artisan migrate --force 2>/dev/null || true

  # 6. Print URLs
  echo ""
  echo "  ╔══════════════════════════════════════╗"
  echo "  ║   🐳  Docker mode is ACTIVE          ║"
  echo "  ╠══════════════════════════════════════╣"
  echo "  ║  Frontend:  http://localhost:5173    ║"
  echo "  ║  Backend:   http://localhost/api     ║"
  echo "  ║  MySQL:     localhost:3307           ║"
  echo "  ╚══════════════════════════════════════╝"
  echo ""

  # Unset DB_ vars so they don't leak into the user's shell
  unset DB_CONNECTION DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD DB_ROOT_PASSWORD 2>/dev/null || true
}

cmd_local() {
  echo ""
  echo "  ╔══════════════════════════════════════╗"
  echo "  ║     Switching to LOCAL mode...       ║"
  echo "  ╚══════════════════════════════════════╝"
  echo ""

  # 1. Stop Docker
  if docker_running; then
    warn "Stopping Docker containers..."
    cd "$ROOT_DIR"
    docker-compose down 2>&1 | while read -r line; do
      echo "    $line"
    done
    ok "Docker containers stopped"
  else
    info "Docker is not running — skipping"
  fi

  # 2. Unset DB_ env vars that would override .env, and VITE_ vars too
  warn "Clearing environment variables that may override .env..."
  unset DB_CONNECTION DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD DB_ROOT_PASSWORD
  unset VITE_API_URL VITE_API_PROXY_TARGET VITE_STRIPE_PUBLISHABLE_KEY
  ok "Cleared DB_* and VITE_* environment variables"

  # 3. Kill any lingering dev servers
  warn "Stopping any existing dev servers..."
  kill_port 8000
  kill_port 5173

  # 4. Copy local env file (XAMPP MySQL)
  if [ ! -f "$ROOT_DIR/.env.local" ]; then
    err "Missing .env.local file at project root!"
    exit 1
  fi
  cp "$ROOT_DIR/.env.local" "$BACKEND_DIR/.env"
  ok "Copied .env.local → backend/.env (XAMPP MySQL)"

  # 4b. Update frontend .env for local mode (direct API calls to port 8000)
  if [ -f "$FRONTEND_DIR/.env" ]; then
    sed -i 's|^VITE_API_URL=.*|VITE_API_URL=http://127.0.0.1:8000|' "$FRONTEND_DIR/.env"
    sed -i 's|^VITE_API_PROXY_TARGET=.*|VITE_API_PROXY_TARGET=http://127.0.0.1:8000|' "$FRONTEND_DIR/.env"
    # Add if not present
    grep -q '^VITE_API_URL=' "$FRONTEND_DIR/.env" || echo 'VITE_API_URL=http://127.0.0.1:8000' >> "$FRONTEND_DIR/.env"
    grep -q '^VITE_API_PROXY_TARGET=' "$FRONTEND_DIR/.env" || echo 'VITE_API_PROXY_TARGET=http://127.0.0.1:8000' >> "$FRONTEND_DIR/.env"
    ok "Updated frontend/.env for local mode (VITE_API_URL=http://127.0.0.1:8000)"
  else
    warn "frontend/.env not found — CORS errors may occur"
  fi

  # 5. Generate app key
  info "Generating APP_KEY..."
  cd "$BACKEND_DIR"
  php artisan key:generate --force 2>&1 | tail -1
  ok "APP_KEY generated"

  # 6. Create database fresh
  info "Setting up XAMPP MySQL database..."
  php -r "
    \$db = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
    \$db->exec('DROP DATABASE IF EXISTS \`projet_pfe\`');
    \$db->exec('CREATE DATABASE \`projet_pfe\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    echo 'ok';
  " 2>&1
  if [ $? -eq 0 ]; then
    ok "XAMPP MySQL reachable — database created"
  else
    err "XAMPP MySQL not reachable on 127.0.0.1:3306 — make sure XAMPP is running, then re-run"
    exit 1
  fi

  # 7. Import db.sql + register completed migrations, then run pending ones + seed
  info "Importing db.sql & setting up database..."
  cd "$BACKEND_DIR"
  php -r "
    \$sqlFile = getcwd() . '/database/db.sql';
    if (!file_exists(\$sqlFile)) { echo 'db.sql not found'; exit(1); }
    \$sql = file_get_contents(\$sqlFile);
    if (\$sql === false) { echo 'Failed to read db.sql'; exit(1); }

    // Connect to projet_pfe
    \$db = new PDO('mysql:host=127.0.0.1;port=3306;dbname=projet_pfe', 'root', '');
    \$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    \$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);

    // Import db.sql
    \$db->exec('SET FOREIGN_KEY_CHECKS = 0');
    \$db->exec(\$sql);
    \$db->exec('SET FOREIGN_KEY_CHECKS = 1');
    echo 'db.sql imported' . PHP_EOL;

    // Create migrations tracking table & register all create-table migrations as done
    \$db->exec('CREATE TABLE IF NOT EXISTS migrations (id INT AUTO_INCREMENT PRIMARY KEY, migration VARCHAR(255) NOT NULL, batch INT NOT NULL)');

    \$migrationsDir = getcwd() . '/database/migrations';
    \$files = scandir(\$migrationsDir);
    sort(\$files);
    \$count = 0;
    foreach (\$files as \$file) {
        if (pathinfo(\$file, PATHINFO_EXTENSION) !== 'php') continue;
        \$name = pathinfo(\$file, PATHINFO_FILENAME);
        \$stmt = \$db->prepare('INSERT INTO migrations (migration, batch) VALUES (?, 1)');
        \$stmt->execute([\$name]);
        \$count++;
    }
    echo \"Registered \$count migrations as completed\" . PHP_EOL;
  " 2>&1
  if [ $? -eq 0 ]; then
    ok "db.sql imported & all migrations marked complete"
  else
    err "Database setup failed — check XAMPP MySQL connection"
    exit 1
  fi

  # 8. Clear config cache & seed database (idempotent — adds admin account, ticket types)
  info "Clearing config cache & seeding..."
  php artisan config:clear 2>/dev/null || true
  php artisan db:seed --force 2>&1
  if [ $? -eq 0 ]; then
    ok "Database seeded: admin@casaway.ma / Admin@CasaWay2026!"
  else
    warn "Seeding had issues — admin account may already exist"
  fi

  cd "$ROOT_DIR"

  # 10. Start local dev servers in background
  warn "Starting local dev servers..."

  # Start backend
  cd "$BACKEND_DIR"
  php artisan serve --port=8000 --host=127.0.0.1 > /tmp/artisan.log 2>&1 &
  BACKEND_PID=$!
  sleep 2
  # Try lsof first, fall back to curl health check
  if lsof -ti :8000 >/dev/null 2>&1 || curl -s -o /dev/null --max-time 2 http://127.0.0.1:8000/api/health 2>/dev/null; then
    ok "Backend started (PID $BACKEND_PID) on http://127.0.0.1:8000"
  else
    err "Backend failed to start. Check /tmp/artisan.log"
    cat /tmp/artisan.log
  fi

  # Start frontend — export correct VITE_API_URL to override system env var
  cd "$FRONTEND_DIR"
  export VITE_API_URL=http://127.0.0.1:8000
  export VITE_API_PROXY_TARGET=http://127.0.0.1:8000
  npx vite --host 127.0.0.1 --port 5173 > /tmp/vite.log 2>&1 &
  FRONTEND_PID=$!
  sleep 3
  # Check both 5173 and fallback 5174 (lsof first, then curl)
  local detected_frontend_port=""
  for fp in 5173 5174; do
    if lsof -ti :"$fp" >/dev/null 2>&1 || curl -s -o /dev/null --max-time 2 http://127.0.0.1:"$fp" 2>/dev/null; then
      detected_frontend_port="$fp"
      break
    fi
  done
  if [ -n "$detected_frontend_port" ]; then
    ok "Frontend started (PID $FRONTEND_PID) on http://127.0.0.1:$detected_frontend_port"
  else
    warn "Frontend may have started on a different port. Check /tmp/vite.log"
    cat /tmp/vite.log
  fi

  cd "$ROOT_DIR"

  # 11. Print URLs
  echo ""
  echo "  ╔══════════════════════════════════════╗"
  echo "  ║   💻  Local mode is ACTIVE           ║"
  echo "  ╠══════════════════════════════════════╣"
  echo "  ║  Frontend:  http://localhost:5173    ║"
  echo "  ║  Backend:   http://localhost:8000    ║"
  echo "  ║                                     ║"
  echo "  ║  Stop servers:                      ║"
  echo "  ║    kill $BACKEND_PID $FRONTEND_PID   ║"
  echo "  ╚══════════════════════════════════════╝"
  echo ""
}

# ── Main ───────────────────────────────────────────────────────

case "${1:-}" in
  docker)
    cmd_docker
    ;;
  local)
    cmd_local
    ;;
  status)
    cmd_status
    ;;
  *)
    echo ""
    echo "  CasaWay — Mode Switcher"
    echo ""
    echo "  Usage:  ./switch-mode.sh <command>"
    echo ""
    echo "  Commands:"
    echo "    docker    Switch to Docker mode (full containers)"
    echo "    local     Switch to local mode (XAMPP MySQL + artisan/npm)"
    echo "    status    Show current mode and running services"
    echo ""
    exit 1
    ;;
esac
