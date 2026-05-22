# Laravel Backend Codebase Analysis
**Generated:** May 9, 2026  
**Scope:** API routes, controllers, services, and database models

---

## Executive Summary

This analysis systematically examined all 7 API controllers, 12 Eloquent models, 27 database migrations, 1 service class, and all API routes to identify:
- ✅ **9 ACTIVE models/tables** in active use by the API
- ❌ **3 UNUSED models/tables** that should be removed  
- 🔍 **Unused columns** in active tables
- 📊 **Schema improvements** needed

---

## 1. ACTIVE MODELS & TABLES (In Use)

### 1.1 **Client** [PRIMARY USER MODEL]
**Status:** ✅ HEAVILY USED  
**Purpose:** Main authentication & user entity

**Database Table:** `clients`

**Columns Used:**
| Column | Usage | Status |
|--------|-------|--------|
| `id` | Internal PK | ✅ |
| `uuid` | Client identifier in API responses | ✅ |
| `email` | Login, unique constraint | ✅ |
| `phone` | Profile, optional | ✅ |
| `password_hash` | Authentication | ✅ |
| `first_name` | Profile display | ✅ |
| `last_name` | Profile display | ✅ |
| `profile_file` | Avatar (binary) | ✅ |
| `is_active` | Account status check | ✅ |
| `remember_me` | Persist login session | ✅ (partial) |
| `remember_token` | Session persistence | ⚠️ Created but never read |
| `default_ticket_id` | FK to Ticket | ✅ |
| `notification_prefs` | JSON array of notification settings | ✅ |
| `fcm_token` | Firebase Cloud Messaging token | ✅ (partial) |
| `client_preferences` | JSON array of user preferences | ✅ |
| `created_at/updated_at` | Timestamps | ✅ |

**Relationships:**
- `→ wallet()` - `hasOne(Wallet, 'user_id')`
- `→ transactions()` - `hasMany(Transaction, 'user_id')`
- `→ defaultTicket()` - `belongsTo(Ticket, 'default_ticket_id')`
- `← notifications()` - (inverse relationship in Notification model)
- `← auditLogs()` - (implicit in AuditLog.client())
- `← billingDetails()` - (implicit in BillingDetail.client())

**API Endpoints Using Client:**
- POST `/signup` - Create new client
- POST `/login` - Authenticate client
- GET `/profile` - Fetch client profile
- PUT `/profile` - Update profile, phone, avatar
- POST `/logout` - Logout single session
- POST `/logout-all` - Revoke all tokens
- GET `/home` - Dashboard (auth check)
- PUT `/user/fcm-token` - Update FCM token
- GET/PATCH `/user/notification-preferences` - Manage notification settings
- GET/PATCH `/user/preferences` - Manage client preferences

---

### 1.2 **Ticket** [CORE BUSINESS MODEL]
**Status:** ✅ HEAVILY USED  
**Purpose:** Purchase records and validation state machine

**Database Table:** `tickets`

**Columns Used:**
| Column | Usage | Status |
|--------|-------|--------|
| `id` | Internal PK | ✅ |
| `uuid` | Ticket identifier in API | ✅ |
| `user_id` | FK to clients | ✅ |
| `ticket_type_id` | FK to ticket_types | ✅ |
| `purchase_id` | FK to transactions (soft link) | ✅ |
| `status` | State machine: 'active', 'used', 'expired' | ✅ |
| `valid_from` | Start timestamp | ✅ |
| `valid_until` | Expiration timestamp | ✅ |
| `remaining_uses` | Use counter (for non-reusable) | ✅ |
| `price_paid` | Decimal amount paid | ✅ |
| `secure_token` | HMAC-SHA256 token | ⚠️ Generated but not validated in API |
| `jws_signature` | JWT signature | ⚠️ Created but not read |
| `created_at/updated_at` | Timestamps | ✅ |

**Relationships:**
- `→ ticketType()` - `belongsTo(TicketType, 'ticket_type_id')`
- `← validationLogs()` - (implicit in ValidationLog records)

**API Endpoints Using Ticket:**
- POST `/tickets/purchase` - Create new tickets
- GET `/tickets` - List all tickets
- GET `/tickets/cards` - Get ticket cards with status
- POST `/tickets/cards/default` - Set default ticket
- GET `/tickets/{uuid}` - Get specific ticket
- POST `/tickets/nfc/challenge` - Create NFC validation token
- POST `/tickets/nfc/consume` - Validate ticket via NFC
- POST `/tickets/qr/token` - Create QR validation token
- POST `/tickets/qr/consume` - Validate ticket via QR
- POST `/tickets/{uuid}/validate` - Generic ticket validation

---

### 1.3 **TicketType** [CONFIGURATION TABLE]
**Status:** ✅ HEAVILY USED  
**Purpose:** Ticket product definitions and pricing

**Database Table:** `ticket_types`

**Columns Used:**
| Column | Usage | Status |
|--------|-------|--------|
| `id` | Internal PK | ✅ |
| `code` | Unique product code | ✅ (displayed in logs) |
| `name_fr` | French product name | ✅ (used in notifications) |
| `name_ar` | Arabic product name | ⚠️ Schema included but never read |
| `description` | Product description | ⚠️ Schema included but never read |
| `price` | Decimal price in MAD | ✅ |
| `duration_minutes` | Validity period | ✅ |
| `is_reusable` | Boolean flag | ✅ (controls logic) |
| `max_uses` | Max validation count | ✅ |
| `is_active` | Visibility flag | ✅ (filters in getTicketTypes) |
| `created_at/updated_at` | Timestamps | ⚠️ Never read |

**Relationships:**
- `← tickets()` - (implicit in Ticket records)

**API Endpoints Using TicketType:**
- GET `/ticket-types` - List active types only

---

### 1.4 **Wallet** [BALANCE LEDGER]
**Status:** ✅ HEAVILY USED  
**Purpose:** Track user account balance

**Database Table:** `wallets`

**Columns Used:**
| Column | Usage | Status |
|--------|-------|--------|
| `id` | Internal PK | ✅ |
| `user_id` | FK to clients | ✅ |
| `balance` | Decimal current balance | ✅ |
| `card_number` | Virtual card number | ⚠️ Set but never read or used |
| `card_last_four` | Last 4 digits for display | ⚠️ Set but never read or used |
| `created_at/updated_at` | Timestamps | ✅ |

**Relationships:**
- `→ client()` - `belongsTo(Client, 'user_id')`

**API Endpoints Using Wallet:**
- POST `/tickets/purchase` - Deduct balance, update wallet
- GET `/wallet` - Fetch current balance
- GET `/wallet/transactions` - Fetch transaction history
- POST `/wallet/recharge/init` - Initialize Stripe payment
- POST `/wallet/recharge/confirm` - Update balance after payment

---

### 1.5 **Transaction** [AUDIT & LEDGER]
**Status:** ✅ HEAVILY USED  
**Purpose:** Immutable record of all balance changes

**Database Table:** `transactions`

**Columns Used:**
| Column | Usage | Status |
|--------|-------|--------|
| `id` | Internal PK | ✅ |
| `uuid` | Transaction identifier | ✅ |
| `user_id` | FK to clients | ✅ |
| `type` | 'purchase' \| 'recharge' \| 'validation' | ✅ |
| `status` | 'completed' \| 'pending' \| 'failed' | ✅ |
| `amount` | Decimal transaction amount | ✅ |
| `currency` | 'MAD' or other | ✅ |
| `balance_before` | Balance before transaction | ✅ |
| `balance_after` | Balance after transaction | ✅ |
| `payment_method` | 'wallet' \| 'card' | ✅ |
| `payment_intent_id` | Stripe payment intent ID | ✅ (Stripe webhook matching) |
| `reference` | Human-readable description | ✅ |
| `metadata` | JSON additional data | ✅ (Stripe metadata stored) |
| `created_at` | Timestamp only | ✅ |

**Relationships:**
- `→ client()` - `belongsTo(Client, 'user_id')`

**API Endpoints Using Transaction:**
- POST `/tickets/purchase` - Create purchase transaction
- GET `/wallet/transactions` - List transactions
- POST `/wallet/recharge/confirm` - Create recharge transaction
- POST `/webhooks/stripe` - Create transaction from webhook

---

### 1.6 **ValidationLog** [AUDIT TRAIL]
**Status:** ✅ USED  
**Purpose:** Track all ticket validation attempts (success & failure)

**Database Table:** `validation_logs`

**Columns Used:**
| Column | Usage | Status |
|--------|-------|--------|
| `id` | Internal PK | ✅ |
| `ticket_id` | FK to tickets (nullable) | ✅ |
| `user_id` | FK to clients | ✅ |
| `validator_id` | Device/validator identifier | ✅ |
| `validation_type` | 'nfc' \| 'qr' | ✅ |
| `status` | 'success' \| 'failure' \| 'offline_accepted' | ✅ |
| `failure_reason` | Text reason if failed | ✅ |
| `location` | JSON {lat, lng} | ✅ (optional) |
| `metadata` | JSON {ip, user_agent} | ✅ |
| `created_at` | Timestamp only | ✅ |

**Relationships:**
- (No explicit relationships defined, but references Ticket & Client)

**API Endpoints Using ValidationLog:**
- POST `/tickets/nfc/consume` - Log NFC validation
- POST `/tickets/qr/consume` - Log QR validation
- POST `/tickets/{uuid}/validate` - Log generic validation

---

### 1.7 **AuditLog** [SECURITY AUDIT TRAIL]
**Status:** ✅ USED  
**Purpose:** Track user actions for security compliance

**Database Table:** `audit_logs`

**Columns Used:**
| Column | Usage | Status |
|--------|-------|--------|
| `id` | Internal PK | ✅ |
| `user_id` | FK to clients (nullable) | ✅ |
| `action` | Action code string | ✅ |
| `ip_address` | IP address (nullable) | ✅ |
| `user_agent` | Browser/device info | ✅ |
| `metadata` | JSON additional context | ✅ |
| `created_at` | Timestamp only | ✅ |

**Relationships:**
- `→ client()` - `belongsTo(Client, 'user_id')`

**Logged Actions:**
- `signup`
- `login_success`
- `login_failed`
- `login_failed_inactive`
- `logout`
- `logout_all`
- `forgot_password_request`
- `password_reset_success`
- `password_reset_failed`
- `profile_update`
- `ticket_purchase`
- `ticket_validation_nfc_challenge_success`
- `ticket_validation_success`
- `ticket_validation_failed`
- `ticket_validation_failed_not_found`
- `wallet_recharge_init`
- `payment_intent_created`

---

### 1.8 **Notification** [USER-FACING MESSAGING]
**Status:** ✅ USED  
**Purpose:** Store push notifications for client consumption

**Database Table:** `notifications`

**Columns Used:**
| Column | Usage | Status |
|--------|-------|--------|
| `id` | UUID primary key | ✅ |
| `user_id` | FK to clients | ✅ |
| `type` | 'validation' \| 'payment' \| 'security' \| 'promo' \| 'system' | ✅ |
| `severity` | 'info' \| 'success' \| 'warning' \| 'danger' | ✅ |
| `title` | Notification subject | ✅ |
| `body` | Notification message | ✅ |
| `meta` | JSON {type, severity, amount, etc.} | ✅ |
| `is_read` | Boolean read status | ✅ |
| `read_at` | Timestamp when read | ✅ |
| `created_at/updated_at` | Timestamps | ✅ |

**Relationships:**
- `→ client()` - `belongsTo(Client, 'user_id')`

**Notification Types Sent:**
- `security: 'Nouvelle connexion'` - On login
- `payment: 'Confirmation d\'achat'` - On ticket purchase
- `payment: 'Recharge reussie'` - On wallet recharge success
- `payment: 'Paiement refuse'` - On payment failure
- `security: (low balance)` - Sent via event

**API Endpoints Using Notification:**
- GET `/notifications` - Fetch notifications (paginated)
- GET `/notifications/unread-count` - Count unread
- PATCH `/notifications/{id}/read` - Mark as read
- PATCH `/notifications/read-all` - Mark all as read
- DELETE `/notifications/{id}` - Delete notification
- POST `/notifications/log-failure` - Frontend logs failure as notification

---

### 1.9 **BillingDetail** [PAYMENT ADDRESS]
**Status:** ✅ USED  
**Purpose:** Store payment billing information for Stripe

**Database Table:** `billing_details`

**Columns Used:**
| Column | Usage | Status |
|--------|-------|--------|
| `id` | Internal PK | ✅ |
| `user_id` | FK to clients | ✅ |
| `address` | JSON {street, city, postal_code, state} | ✅ |
| `tax_id` | String tax/VAT ID | ✅ (optional) |
| `country` | 2-letter country code | ✅ |
| `created_at/updated_at` | Timestamps | ✅ |

**Relationships:**
- `→ client()` - `belongsTo(Client, 'user_id')`

**API Endpoints Using BillingDetail:**
- POST `/payments/billing-details` - Save/update billing address

---

## 2. UNUSED MODELS & TABLES (Should Be Removed)

### ❌ 2.1 **User Model**
**Status:** COMPLETELY UNUSED  
**Problem:** Duplicate/legacy user model that conflicts with primary Client model

**Evidence:**
- ❌ Not imported in any controller
- ❌ Not imported in any service
- ❌ Not referenced in any route
- ❌ Auth config uses 'clients' provider, not 'users'
- ❌ Database table `users` never created by migrations
- ⚠️ Has a UserFactory that is never used

**Files to Delete:**
1. `app/Models/User.php`
2. `database/factories/UserFactory.php`

**Configuration to Update:**
- `config/auth.php` - Remove 'users' provider if unused (currently defines it but code uses 'clients')

---

### ⚠️ 2.2 **UserDevice Model**
**Status:** CREATED BUT UNUSED  
**Problem:** Table created but no API endpoints read/write from it

**Evidence:**
- ✅ Table exists: `user_devices`
- ❌ No imports in any controller
- ❌ No usage in TicketController despite NFC/mobile context
- ❌ No endpoints for device management
- ✅ Model exists but is orphaned

**Database Table:** `user_devices`
```
- id (PK)
- user_id (FK to clients)
- device_id (unique device identifier)
- device_type (android|ios)
- hce_token (NFC Host Card Emulation token)
- last_used_at (timestamp)
- created_at/updated_at
```

**Recommendation:**
- **EITHER** implement device management endpoints (register device, list devices, update last_used)
- **OR** remove the model and migration entirely

---

### ⚠️ 2.3 **BlacklistedToken Model**
**Status:** CREATED BUT UNUSED  
**Problem:** Appears designed for token revocation but not used in API

**Evidence:**
- ✅ Table exists: `blacklisted_tokens`
- ❌ No imports in any controller
- ❌ No endpoints that check/manage blacklist
- ✅ Model exists but is never queried

**Database Table:** `blacklisted_tokens`
```
- id (PK)
- ticket_uuid (UUID, FK to tickets)
- jws_signature (text signature)
- reason (string: refunded|expired|stolen)
- expires_at (timestamp)
- created_at (timestamp)
```

**Observation:**
- Ticket model has `jws_signature` column but it's never validated during validation
- Token doesn't appear to be implemented as a security mechanism
- Could be placeholder for future token revocation system

**Recommendation:**
- Remove until token revocation is actually needed
- OR implement logic in `consumeQrValidationToken()` and `consumeNfcChallenge()` to check this table

---

## 3. UNUSED COLUMNS IN ACTIVE TABLES

### 3.1 **Client Table**
| Column | Issue | Recommendation |
|--------|-------|-----------------|
| `remember_token` | Created in migration but never set or read | Remove or implement proper session persistence |
| `remember_me` (mostly unused) | Column exists, set in login but rarely checked | Keep for now, needed for session persistence |

### 3.2 **Ticket Table**
| Column | Issue | Recommendation |
|--------|-------|-----------------|
| `secure_token` | Generated with HMAC-SHA256 in boot() but never validated | Remove unless needed for security |
| `jws_signature` | Marked as "to be signed" but never populated or validated | Remove - use JWTs in validation tokens instead |

### 3.3 **TicketType Table**
| Column | Issue | Recommendation |
|--------|-------|-----------------|
| `name_ar` | Arabic name schema included but never queried | Keep for i18n support or remove if not needed |
| `description` | Schema exists but never fetched by API | Remove if description not needed |
| `created_at/updated_at` | Never read by API | Keep for audit (harmless) |

### 3.4 **Wallet Table**
| Column | Issue | Recommendation |
|--------|-------|-----------------|
| `card_number` | Set to default '****' but never updated or read | Remove completely - Stripe handles card data |
| `card_last_four` | Set during recharge but never used in responses | Remove or expose in wallet responses |

---

## 4. MODEL RELATIONSHIPS (ER Diagram)

```
┌──────────────────────────────────────────────┐
│             CLIENT (users)                    │
│  id, uuid, email, phone, password_hash       │
│  first_name, last_name, profile_file         │
│  is_active, notification_prefs, fcm_token    │
└──────────────┬───────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────┬────────────┐
    │          │          │          │            │
    ▼          ▼          ▼          ▼            ▼
┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐
│WALLET  │ │TICKET(s) │ │TRANSACTION│ │NOTIFICATION
└────────┘ └────┬─────┘ └──────────┘ └────────────┘
               │
               │ has relation
               ▼
          ┌──────────────┐
          │ TICKET_TYPE  │
          └──────────────┘

      VALIDATION_LOGS (references Client & Ticket)
      AUDIT_LOGS (references Client)
      BILLING_DETAILS (references Client)

UNUSED:
      BLACKLISTED_TOKENS (references Ticket)
      USER_DEVICES (references Client)
      USER (orphaned model)
```

---

## 5. FOREIGN KEY RELATIONSHIPS

### Explicit Relationships (via Model definitions):

**Client:**
- `hasOne(Wallet, 'user_id')`
- `hasMany(Transaction, 'user_id')`
- `belongsTo(Ticket, 'default_ticket_id')` ← Default card for validation

**Ticket:**
- `belongsTo(TicketType, 'ticket_type_id')`
- `belongsTo(Client, 'user_id')`
- Soft FK to `Transaction('purchase_id')`

**Wallet:**
- `belongsTo(Client, 'user_id')`

**Transaction:**
- `belongsTo(Client, 'user_id')`

**Notification:**
- `belongsTo(Client, 'user_id')`

**BillingDetail:**
- `belongsTo(Client, 'user_id')`

**AuditLog:**
- `belongsTo(Client, 'user_id')` ← Nullable

**ValidationLog:**
- Implicit FK: `user_id → clients.id`
- Implicit FK: `ticket_id → tickets.id` (nullable)

---

## 6. SCHEMA IMPROVEMENTS & RECOMMENDATIONS

### 6.1 **High Priority Issues**

#### Issue: Unused Columns
| Table | Column | Action | Impact |
|-------|--------|--------|--------|
| `clients` | `remember_token` | Delete if not using sessions | Low |
| `tickets` | `secure_token` | Delete unless used | Low |
| `tickets` | `jws_signature` | Delete - use JWT validation tokens | Low |
| `wallets` | `card_number` | Delete - Stripe handles this | Low |
| `wallets` | `card_last_four` | Delete or populate correctly | Low |
| `ticket_types` | `name_ar` | Keep or delete (depends on i18n) | Low |
| `ticket_types` | `description` | Delete if not used | Low |

#### Issue: Unused Models
| Model | Action | Priority |
|-------|--------|----------|
| `User` | Delete model & factory | High |
| `UserDevice` | Implement or delete | Medium |
| `BlacklistedToken` | Implement or delete | Medium |

### 6.2 **Data Quality Issues**

#### 1. **Payment Intent Webhook Processing**
**Issue:** `processed_stripe_events` table is referenced in `StripeWebhookController` but no migration creates it.

**Evidence:**
```php
// StripeWebhookController.php line 42
$alreadyProcessed = DB::table('processed_stripe_events')->where('event_id', $event->id)->exists();
```

**Solution:** Create migration:
```php
Schema::create('processed_stripe_events', function (Blueprint $table) {
    $table->id();
    $table->string('event_id')->unique();
    $table->timestamp('processed_at')->useCurrent();
});
```

#### 2. **Wallet Creation Logic**
**Issue:** Wallet is created on-demand in both `TicketController::purchase()` and `WalletController::rechargeConfirm()`, but there's no explicit initial wallet creation during signup.

**Risk:** Race condition if two concurrent purchase requests hit non-existent wallet.

**Solution:** Create wallet immediately in `ClientController::signup()`:
```php
Wallet::create([
    'user_id' => $client->id,
    'balance' => 0.00,
]);
```

#### 3. **Default Ticket Resolution**
**Issue:** `resolveDefaultTicketForUser()` in WalletController updates `client.default_ticket_id` during read operation, violating CQS (Command Query Separation).

**Solution:** Separate into explicit `setDefaultTicket()` call or make it a background job.

### 6.3 **Security Issues**

#### 1. **Ticket Signature Not Validated**
**Issue:** Tickets have `secure_token` and `jws_signature` fields but they're never validated during consumption.

**Line:** `TicketController::buildValidationToken()` and `parseValidationToken()` create JWTs for validation but don't verify existing ticket signatures.

**Impact:** If a ticket signature is compromised, it won't be caught.

**Solution:** Either implement signature validation or remove the unused columns.

#### 2. **BlacklistedToken Never Checked**
**Issue:** No code checks if a ticket's signature is in the blacklist during validation.

**Solution:** Add check in `validateTicketByUuid()`:
```php
if (BlacklistedToken::where('ticket_uuid', $ticket->uuid)->exists()) {
    return $this->errorResponse('This ticket has been revoked.', 422);
}
```

### 6.4 **Performance Issues**

#### 1. **N+1 Queries in Ticket Listing**
**Issue:** `cards()` endpoint loads all tickets then calls `$ticket->ticketType` on each in map.

**Solution:** Eager load with:
```php
Ticket::where('user_id', $client->id)
    ->with('ticketType')  // ← Add this
    ->orderBy('created_at', 'desc')
    ->get()
```

#### 2. **Notification Unread Count Caching**
**Issue:** Redis cache fallback to DB query if Redis unavailable. Good pattern but could be optimized.

**Suggestion:** Add database-level unread count denormalization if notifications grow large.

---

## 7. API ENDPOINTS COVERAGE

### Covered by Existing Models (✅)
- ✅ Authentication (Client)
- ✅ Profile Management (Client, BillingDetail)
- ✅ Ticket Purchasing (Ticket, Transaction, Wallet)
- ✅ Ticket Validation (Ticket, ValidationLog)
- ✅ Wallet Management (Wallet, Transaction)
- ✅ Notifications (Notification)
- ✅ Stripe Webhooks (Transaction)

### Not Covered by Existing Models (❌)
- ❌ Device Management (UserDevice model unused)
- ❌ Token Revocation (BlacklistedToken model unused)

---

## 8. SUMMARY & ACTION ITEMS

### 🔴 MUST REMOVE
1. **User.php model** - Orphaned, conflicts with Client
2. **UserFactory.php** - Associated with unused User model
3. Unused columns: `tickets.secure_token`, `tickets.jws_signature`, `wallets.card_number`, `wallets.card_last_four`

### 🟡 SHOULD CLEAN UP
1. **UserDevice** - Either implement full feature or remove
2. **BlacklistedToken** - Either implement validation checks or remove
3. Add missing `processed_stripe_events` table migration
4. Remove unused `clients.remember_token` if not using session persistence
5. Clarify `clients.remember_me` usage (set but rarely checked)

### 🟢 KEEP AS-IS
1. All 9 active models (Client, Ticket, TicketType, Wallet, Transaction, ValidationLog, AuditLog, Notification, BillingDetail)
2. All 7 controllers and routes
3. NotificationService

### 🔵 OPTIMIZE
1. Fix ticket listing N+1 queries
2. Implement wallet creation in signup
3. Validate blacklist tokens during consumption
4. Fix `resolveDefaultTicket()` CQS violation
5. Add missing `processed_stripe_events` migration

---

## Appendix: Unused Columns Details

### Clients Table Unused Columns
```
- remember_token: Created in migration 2026_05_02_210000 but never set or checked
- remember_me: Set during login but rarely verified (login just uses `Auth::attempt()`)
```

### Tickets Table Unused Columns
```
- secure_token: Generated in booted() with HMAC-SHA256 but never validated
- jws_signature: Text field marked for signing but never populated or verified
```

### Wallets Table Unused Columns
```
- card_number: Always set to '****' in migration, never updated
- card_last_four: Updated in recharge but never read by any endpoint
```

### TicketTypes Table Unused Columns
```
- name_ar: Never fetched by API (only name_fr used in notifications)
- description: Never fetched by API
- created_at/updated_at: Standard timestamps, never read
```

---

**Report Generated:** 2026-05-09  
**Analysis Depth:** Complete (27 migrations, 12 models, 7 controllers, 1 service, 60+ API usages traced)


