# Migration Deployment Guide

**Date:** May 9, 2026  
**Version:** 1.0 - Final Clean Structure

---

## Quick Start (Fresh Development Environment)

```bash
cd backend

# 1. Install dependencies
composer install

# 2. Generate app key
php artisan key:generate

# 3. Run fresh migrations with seeding
php artisan migrate:fresh --seed

# 4. Validate migration structure
php artisan tinker
>>> DB::select("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
>>> DB::table('clients')->count();
```

**Expected Output:**
```
Migration table created successfully.
⚩ Migrating: 2026_05_10_000000_create_clients_table
⚩ Migrating: 2026_05_10_000100_create_ticket_types_table
⚩ Migrating: 2026_05_10_000200_create_wallets_table
⚩ Migrating: 2026_05_10_000300_create_transactions_table
⚩ Migrating: 2026_05_10_000400_create_tickets_table
⚩ Migrating: 2026_05_10_000500_create_validation_logs_table
⚩ Migrating: 2026_05_10_000600_create_audit_logs_table
⚩ Migrating: 2026_05_10_000700_createns_tab_notificatiole
⚩ Migrating: 2026_05_10_000800_create_billing_details_table
⚩ Migrating: 2026_05_10_000900_create_processed_stripe_events_table
Database seeding completed successfully.
```

---

## Detailed Deployment Steps

### Step 1: Pre-Migration Checklist

- [ ] All team members have pulled latest code
- [ ] Database backup created (if production)
- [ ] No active user sessions (or maintenance mode enabled)
- [ ] API rate limiting temporarily disabled if needed
- [ ] Monitoring dashboard open (to watch for errors)

### Step 2: Backup Current Database (if upgrading)

```bash
# Linux/Mac
php artisan schema:dump
cp database/database.sqlite database/database.sqlite.backup

# Windows (PowerShell)
php artisan schema:dump
Copy-Item -Path "database/database.sqlite" -Destination "database/database.sqlite.backup"

# MySQL
mysqldump -u root -p app_database > database/backup_$(date +%s).sql

# PostgreSQL
pg_dump app_database > database/backup_$(date +%s).sql
```

### Step 3: Test Migration in Development

```bash
# On development machine
php artisan migrate:fresh

# Verify structure
php artisan tinker
>>> DB::table('clients')->columns();
>>> DB::table('ticket_types')->count();
>>> DB::select("SELECT * FROM sqlite_master WHERE type='index'");
```

### Step 4: Test with Seeding

```bash
php artisan migrate:fresh --seed

# Verify seed data
php artisan tinker
>>> App\Models\TicketType::count(); // Should be 4
>>> App\Models\Client::count(); // Should be >= 1
>>> App\Models\Wallet::count(); // Should be >= 1
```

### Step 5: Test API Endpoints

```bash
# In a separate terminal, start the server
php artisan serve

# Test login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Should return token

# Test ticket types
curl -X GET http://localhost:8000/api/ticket-types \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return 4 ticket types
```

### Step 6: Production Deployment

```bash
# 1. Enable maintenance mode
php artisan down

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
composer install

# 4. Backup database
php artisan schema:dump
cp database/database.sqlite database/database.sqlite.backup.$(date +%s)

# 5. Run migrations (with pretend flag first)
php artisan migrate --pretend

# 6. If pretend shows correct changes, run actual migration
php artisan migrate

# 7. Seed required data (ticket types)
php artisan db:seed --class=TicketTypeSeeder

# 8. Validate migration
php artisan validate-migrations

# 9. Disable maintenance mode
php artisan up
```

---

## Rollback Procedures

### If Migration Fails

```bash
# Rollback last migration step
php artisan migrate:rollback --step=1

# Rollback all migrations
php artisan migrate:reset

# Restore from backup
# Linux/Mac
cp database/database.sqlite.backup database/database.sqlite

# Windows
Copy-Item -Path "database/database.sqlite.backup" -Destination "database/database.sqlite" -Force

# Re-run previous migrations
php artisan migrate
```

### If Data is Corrupted

```bash
# Restore from backup
mysql app_database < database/backup_DATE.sql

# Or with Laravel
php artisan migrate:refresh

# Or specific table
php artisan migrate:reset --path=database/migrations/2026_05_10_000000_create_clients_table.php
```

---

## Verification Checklist

After deployment, verify:

```bash
# 1. All tables exist
php artisan tinker
>>> $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table'");
>>> echo count($tables); // Should output 10

# 2. All foreign keys work
>>> App\Models\Ticket::first()?->ticketType; // Should not error

# 3. No orphaned references
>>> App\Models\User::count(); // Should be 0 (removed model)

# 4. Indexes exist
>>> DB::select("SELECT name FROM sqlite_master WHERE type='index'");
// Should show many indexes

# 5. Test authentication flow
>>> $client = App\Models\Client::first();
>>> $token = $client->createToken('test')->plainTextToken;
>>> echo $token;

# 6. Test wallet operations
>>> $wallet = $client->wallet;
>>> echo $wallet->balance;

# 7. Test ticket operations
>>> $tickets = $client->tickets;
>>> echo $tickets->count();
```

---

## Post-Migration Tasks

### 1. Update Documentation
```bash
# Update team wiki/docs with new schema
git add MIGRATION_REBASE_REPORT.md
git commit -m "Update migration structure documentation"
git push
```

### 2. Delete Old Migration Backups (after verification)
```bash
# After confirming everything works, clean up old migrations
rm -rf database/migrations_backup/

# Or archive them
tar -czf database/migrations_old_structure.tar.gz database/migrations_backup/
rm -rf database/migrations_backup/
```

### 3. Clean Up Unused Models (Manual)
```bash
# If not already done
rm app/Models/User.php
rm app/Models/BlacklistedToken.php
rm database/factories/UserFactory.php
rm database/factories/BlacklistedTokenFactory.php

# Update config/auth.php to remove unused 'users' provider (optional)
```

### 4. Monitor Application

```bash
# Watch logs for errors
tail -f storage/logs/laravel.log

# Monitor database performance
# Check slow queries
php artisan tinker
>>> DB::enableQueryLog();
>>> App\Models\Ticket::where('user_id', 1)->with('ticketType')->get();
>>> foreach(DB::getQueryLog() as $q) echo $q['query']."\n";
```

---

## Troubleshooting

### Issue: "Table already exists"
```bash
# Solution: Drop and recreate
php artisan migrate:reset
php artisan migrate
```

### Issue: "Foreign key constraint failed"
```bash
# Check constraint
php artisan tinker
>>> DB::select("PRAGMA foreign_key_list(tickets)");

# Verify data integrity
>>> App\Models\Ticket::where('purchase_id', '!=', null)->whereDoesntHave('transaction)->count();
```

### Issue: "Seeding not working"
```bash
# Check seeder file
cat database/seeders/DatabaseSeeder.php

# Run with debug
php artisan db:seed -vvv

# Or specific seeder
php artisan db:seed --class=TicketTypeSeeder
```

### Issue: "Migrations not running"
```bash
# Check migration table
php artisan tinker
>>> DB::table('migrations')->get();

# Mark a migration as run without executing
php artisan migrate:mark-batches

# Or revert and re-run
php artisan migrate:reset
php artisan migrate
```

---

## Performance Optimization (Post-Deployment)

```bash
# Run database optimization
php artisan tinker

# For SQLite
>>> DB::statement('VACUUM');

# For MySQL
>>> DB::statement('OPTIMIZE TABLE transactions');
>>> DB::statement('ANALYZE TABLE tickets');

# For PostgreSQL
>>> DB::statement('VACUUM ANALYZE');
```

---

## Monitoring Commands

```bash
# Check migration status
php artisan migrate:status

# Count records in each table
php artisan tinker
>>> foreach(['clients', 'tickets', 'transactions', 'notifications'] as $t) {
      echo "$t: " . DB::table($t)->count() . "\n";
    }

# Monitor database size
php artisan tinker
>>> filesize(database_path('database.sqlite')) / 1024 / 1024; // MB for SQLite
```

---

## Maintenance

### Weekly
- Review migration history: `php artisan migrate:status`
- Check slow queries in logs
- Verify backups exist

### Monthly
- Run `VACUUM` / `OPTIMIZE TABLE` commands
- Archive old logs
- Review and clean up orphaned records

### Quarterly
- Full database health check
- Update migration documentation
- Plan for schema changes

---

## Rollback Plan (Emergency)

If something goes wrong:

1. **Immediate**: Enable maintenance mode
   ```bash
   php artisan down
   ```

2. **Restore**: Rollback all migrations
   ```bash
   php artisan migrate:reset
   ```

3. **Data Recovery**: Restore from backup
   ```bash
   cp database/database.sqlite.backup database/database.sqlite
   ```

4. **Verification**: Confirm system works
   ```bash
   php artisan migrate
   curl -X GET http://localhost:8000/api/profile
   ```

5. **Recovery**: Disable maintenance mode
   ```bash
   php artisan up
   ```

---

## Questions & Support

For issues with the new migration structure:

1. Check this guide's Troubleshooting section
2. Review MIGRATION_REBASE_REPORT.md for schema details
3. Check Laravel migration documentation
4. Review git history of migrations: `git log --oneline database/migrations/`

---

**End of Guide**
