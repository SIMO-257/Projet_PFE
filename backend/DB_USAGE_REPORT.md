DB Usage Report — per-column findings
Generated: 2026-05-21

Summary: static grep across `backend/` confirms which candidate columns are actively used, partially used, or unused. Evidence file paths are listed for quick review.

1) notification_prefs (clients)
- Status: Used
- Evidence: app/Services/NotificationService.php (reads), app/Http/Controllers/ClientController.php (update)

2) client_preferences (clients)
- Status: Used
- Evidence: app/Http/Controllers/ClientController.php (merge/update), app/Models/Client.php (cast array)

3) fcm_token (clients)
- Status: Used (partial)
- Evidence: app/Services/NotificationService.php (sends if present), app/Http/Controllers/ClientController.php (endpoint to set)

4) remember_me / remember_token (clients / User model)
- Status: Partially used / legacy
- Evidence: `remember_me` read/set in ClientController login; `remember_token` present in User and Client models but no active logic reads it (models: app/Models/User.php, app/Models/Client.php)

5) avatar_path / profile_file (clients / pending registration)
- Status: Used
- Evidence: ClientController (serve avatar_url, upload/delete), EmailVerificationController (pending avatar_path)

6) secure_token (tickets)
- Status: Generated but not validated (questionable)
- Evidence: app/Models/Ticket.php (boot sets hash), no controller checks for secure_token during validation flows

7) jws_signature (tickets / blacklisted_tokens)
- Status: Present in models, not used in validation
- Evidence: app/Models/Ticket.php (fillable includes jws_signature), app/Models/BlacklistedToken.php (fillable), no controllers reference it during validation

8) card_number / card_last_four (wallets)
- Status: `card_last_four` written during recharge; `card_number` present in model but not a proper schema column
- Evidence: Wallet model fillable contains `card_number`; WalletController writes `card_last_four`/`currency` in transaction metadata; migrations do not create `card_number` column (mismatch)

9) address / tax_id / country (billing_details)
- Status: Used (billing details persisted)
- Evidence: app/Models/BillingDetail.php (casts), payments endpoints (store/update billing details)

10) reason (blacklisted_tokens)
- Status: Present but table unused (blacklist feature not checked)
- Evidence: app/Models/BlacklistedToken.php exists; no controllers check or insert records

11) currency (transactions)
- Status: Used (mostly MAD)
- Evidence: WalletController and Transaction model store currency (hardcoded defaults in some places)

12) location / metadata fields (validation_logs, transactions, audit_logs)
- Status: Used
- Evidence: ValidationLog model casts `location`/`metadata`; controllers log `location` on validation; Transaction metadata used for Stripe

Notes / Actionable items discovered:
- Fillable/schema mismatches: `card_number` and `jws_signature` appear in model fillables but not reliably present in migrations — reconcile by adding migration or removing fillable entries.
- Blacklist & UserDevice features exist but are unused; decide to implement or remove migrations/models.
- `secure_token` and `jws_signature` should either be enforced (validation checks) or removed to avoid dead schema.

References (high-value files):
- [backend/app/Models/Client.php](backend/app/Models/Client.php#L1)
- [backend/app/Models/Ticket.php](backend/app/Models/Ticket.php#L1)
- [backend/app/Models/Wallet.php](backend/app/Models/Wallet.php#L1)
- [backend/app/Http/Controllers/ClientController.php](backend/app/Http/Controllers/ClientController.php#L1)
- [backend/app/Services/NotificationService.php](backend/app/Services/NotificationService.php#L1)
- [backend/app/Http/Controllers/TicketController.php](backend/app/Http/Controllers/TicketController.php#L1)
- [backend/database/migrations/](backend/database/migrations/)
- [backend/database/data.sql](backend/database/data.sql#L1)

Next steps (pick one):
A) Produce SQL queries to run on a DB snapshot to detect populated columns (will generate `SELECT COUNT(*) WHERE col IS NOT NULL` statements per candidate).
B) Draft exact MySQL tuning + docker-compose/.env changes for short-term vertical scaling.
C) Create migrations to reconcile fillable/schema mismatches (prepare PR).

If you want option A, provide DB access details or run the generated queries in your staging/production snapshot and paste results here; I can produce the queries now.
