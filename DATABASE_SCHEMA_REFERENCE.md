# Database Schema Reference

**Last Updated:** May 9, 2026  
**Version:** 2.0 - Clean Structure

---

## Table of Contents

1. [Core Tables](#core-tables)
2. [Relationship Diagram](#relationship-diagram)
3. [Column Specifications](#column-specifications)
4. [Index Specifications](#index-specifications)
5. [Constraints Reference](#constraints-reference)
6. [Query Examples](#query-examples)

---

## Core Tables

### 1. **clients** (Primary User Table)

**Purpose:** Store user account information and authentication data

```sql
CREATE TABLE clients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid CHAR(36) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NULLABLE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NULLABLE,
    last_name VARCHAR(100) NULLABLE,
    profile_file LONGBLOB NULLABLE,
    is_active BOOLEAN DEFAULT TRUE,
    remember_me BOOLEAN DEFAULT FALSE,
    default_ticket_id BIGINT NULLABLE,
    fcm_token VARCHAR(255) NULLABLE,
    notification_prefs JSON NULLABLE,
    client_preferences JSON NULLABLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (default_ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_uuid (uuid),
    INDEX idx_is_active (is_active)
);
```

**Key Columns:**
- `uuid`: Public identifier for API responses
- `password_hash`: Hashed password (using bcrypt)
- `is_active`: Account status (soft activation)
- `remember_me`: Session persistence flag
- `default_ticket_id`: FK to primary ticket for validation
- `fcm_token`: Firebase Cloud Messaging token for push notifications
- `notification_prefs`: JSON object storing notification preferences
- `client_preferences`: JSON object storing user preferences

**Usage:** Authentication, profile management, notifications

---

### 2. **ticket_types** (Configuration Table)

**Purpose:** Define available ticket products and pricing

```sql
CREATE TABLE ticket_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NULLABLE,
    is_reusable BOOLEAN DEFAULT FALSE,
    max_uses INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
);
```

**Standard Data:**
```
┌─────────────────┬──────────────────────┬────────┬──────────────┐
│ code            │ name_fr              │ price  │ max_uses     │
├─────────────────┼──────────────────────┼────────┼──────────────┤
│ BILLET_SIMPLE   │ Billet Simple        │ 8.00   │ 2 uses       │
│ BILLET_DOUBLE   │ Billet Double (A/R)  │ 14.00  │ 4 uses       │
│ BILLET_SEMAINE  │ Billet de Semaine    │ 70.00  │ Unlimited    │
│ BILLET_MOIS     │ Billet de Mois       │ 250.00 │ Unlimited    │
└─────────────────┴──────────────────────┴────────┴──────────────┘
```

**Usage:** Product catalog, pricing, ticket creation validation

---

### 3. **wallets** (Balance Ledger)

**Purpose:** Track user account balance and wallet information

```sql
CREATE TABLE wallets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);
```

**Constraints:**
- `balance >= 0.00` (enforced in application)
- One wallet per user (UNIQUE user_id)
- Created automatically on signup

**Usage:** Balance tracking, recharge history, purchase validation

---

### 4. **transactions** (Financial Audit Trail)

**Purpose:** Immutable record of all financial operations

```sql
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid CHAR(36) UNIQUE NOT NULL,
    payment_intent_id VARCHAR(100) UNIQUE NULLABLE,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,  -- 'purchase', 'recharge', 'validation'
    status VARCHAR(20) DEFAULT 'completed',  -- 'completed', 'pending', 'failed'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MAD',
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'wallet',  -- 'wallet', 'card'
    reference VARCHAR(100) NULLABLE,  -- Human-readable description
    metadata JSON NULLABLE,  -- Stripe metadata, payment details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_uuid (uuid),
    INDEX idx_payment_intent_id (payment_intent_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_user_type_status (user_id, type, status)
);
```

**Types:**
- `purchase`: Ticket purchase (deducts balance)
- `recharge`: Wallet top-up (adds balance)
- `validation`: Ticket validation (audit only)

**Statuses:**
- `completed`: Transaction finished successfully
- `pending`: Waiting for external confirmation (Stripe webhook)
- `failed`: Transaction failed (refund/rollback)

**Usage:** Financial reporting, audit trail, Stripe webhook matching

---

### 5. **tickets** (Purchase Records)

**Purpose:** Store ticket purchase records and validation state

```sql
CREATE TABLE tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid CHAR(36) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    ticket_type_id BIGINT NOT NULL,
    purchase_id BIGINT NULLABLE,
    status ENUM('active', 'used', 'expired') DEFAULT 'active',
    valid_from TIMESTAMP NULLABLE,
    valid_until TIMESTAMP NULLABLE,
    remaining_uses INT NULLABLE,
    price_paid DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE CASCADE,
    FOREIGN KEY (purchase_id) REFERENCES transactions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_uuid (uuid),
    INDEX idx_ticket_type_id (ticket_type_id),
    INDEX idx_status (status),
    INDEX idx_valid_until (valid_until),
    INDEX idx_user_status (user_id, status)
);
```

**Status Machine:**
```
active ──[validate]──> used ──[expire]──> expired
  │
  └─────[expire]──────────────────────────> expired
```

**Usage:** Ticket management, validation, status tracking

---

### 6. **validation_logs** (Validation Audit Trail)

**Purpose:** Track all ticket validation attempts (success & failure)

```sql
CREATE TABLE validation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NULLABLE,
    user_id BIGINT NOT NULL,
    validator_id VARCHAR(100) NOT NULL,  -- Bus/tram/validator device ID
    validation_type ENUM('nfc', 'qr') NOT NULL,
    status ENUM('success', 'failure', 'offline_accepted') NOT NULL,
    failure_reason VARCHAR(255) NULLABLE,
    location JSON NULLABLE,  -- {lat, lng}
    metadata JSON NULLABLE,  -- {ip, user_agent, device_info}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_user_id (user_id),
    INDEX idx_validator_id (validator_id),
    INDEX idx_validation_type (validation_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_user_status (user_id, status)
);
```

**Validation Types:**
- `nfc`: NFC chip validation
- `qr`: QR code validation

**Failure Reasons:**
- 'Ticket expired'
- 'Ticket used'
- 'Invalid signature'
- 'No remaining uses'
- 'Offline mode - accepted'

**Usage:** Audit trail, analytics, fraud detection

---

### 7. **audit_logs** (Security Compliance)

**Purpose:** Track user actions for security and compliance

```sql
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NULLABLE,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NULLABLE,  -- IPv4 or IPv6
    user_agent TEXT NULLABLE,
    metadata JSON NULLABLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    INDEX idx_user_action (user_id, action)
);
```

**Logged Actions:**
- `signup` - User registration
- `login_success` - Successful authentication
- `login_failed` - Failed authentication attempt
- `logout` - User logout
- `profile_update` - Profile modification
- `ticket_purchase` - Ticket purchased
- `ticket_validation_success` - Ticket validated
- `wallet_recharge_init` - Recharge initiated
- `payment_intent_created` - Stripe payment created

**Usage:** Security monitoring, compliance reports, fraud detection

---

### 8. **notifications** (User Messaging)

**Purpose:** Store push notifications for client consumption

```sql
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,  -- UUID
    user_id BIGINT NOT NULL,
    type ENUM('validation', 'payment', 'security', 'promo', 'system') NOT NULL,
    severity ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    body VARCHAR(1024) NOT NULL,
    meta JSON NULLABLE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULLABLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_user_is_read (user_id, is_read),
    INDEX idx_user_created_at (user_id, created_at),
    INDEX idx_type (type)
);
```

**Notification Types:**
- `validation` - Ticket validation events
- `payment` - Transaction confirmations
- `security` - Login alerts, account changes
- `promo` - Marketing/promotional messages
- `system` - System maintenance, errors

**Usage:** Push notification delivery, notification history, user preferences

---

### 9. **billing_details** (Payment Information)

**Purpose:** Store payment and billing address for Stripe

```sql
CREATE TABLE billing_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    address JSON NULLABLE,  -- {street, city, postal_code, state}
    tax_id VARCHAR(50) NULLABLE,  -- VAT/tax number
    country VARCHAR(2) NULLABLE,  -- ISO 3166-1 alpha-2
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);
```

**Address Format:**
```json
{
  "street": "123 Rue de la Paix",
  "city": "Casablanca",
  "postal_code": "20000",
  "state": "Casablanca-Settat",
  "country": "MA"
}
```

**Usage:** Stripe payment processing, invoice generation, tax compliance

---

### 10. **processed_stripe_events** (Webhook Deduplication)

**Purpose:** Prevent duplicate webhook processing and replay attacks

```sql
CREATE TABLE processed_stripe_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_id (event_id)
);
```

**Usage:** Stripe webhook security, idempotency

---

## Relationship Diagram

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTS                          │
│  (Users, Authentication, Accounts)                  │
└────────────┬────────────────────────────────────────┘
             │
    ┌────────┼────────┬────────────────┬──────────┐
    │        │        │                │          │
    ▼        ▼        ▼                ▼          ▼
┌────────┐┌──────────┐┌──────────────┐┌─────────────────┐
│WALLETS ││TICKETS   ││TRANSACTIONS  ││AUDIT_LOGS
└────────┘└─────┬────┘└──────────────┘└─────────────────┘
               │
               ├─→ TICKET_TYPES (product definitions)
               │
               └─→ VALIDATION_LOGS (audit trail)

┌──────────────────────────┐
│   NOTIFICATIONS          │
│   (Push messages)        │
└──────────────────────────┘
        ↑
        └─ References CLIENTS

┌──────────────────────────┐
│   BILLING_DETAILS        │
│   (Payment addresses)    │
└──────────────────────────┘
        ↑
        └─ References CLIENTS

┌──────────────────────────────────────┐
│   PROCESSED_STRIPE_EVENTS            │
│   (Webhook deduplication)            │
└──────────────────────────────────────┘
```

---

## Column Specifications

### Data Types Reference

| Type | Usage | Examples |
|------|-------|----------|
| `BIGINT` | IDs, counts | id, user_id, balance (before unit conversion) |
| `CHAR(36)` | UUIDs | uuid, notification.id |
| `VARCHAR(n)` | Short strings | email, phone, codes |
| `TEXT` | Long strings | user_agent, descriptions |
| `DECIMAL(10,2)` | Money | balance, price, amount |
| `BOOLEAN` | Flags | is_active, is_read |
| `ENUM` | Fixed choices | status, type, severity |
| `JSON` | Structured data | metadata, notification_prefs, address |
| `TIMESTAMP` | Date/time | created_at, updated_at |
| `LONGBLOB` | Binary data | profile_file |

### Nullable Columns

**Nullable columns in schema:**
- `phone` - Optional user phone number
- `first_name`, `last_name` - Optional name fields
- `profile_file` - Avatar (initially null)
- `default_ticket_id` - No default ticket selected
- `duration_minutes` - Unlimited tickets have null
- `ticket_id` - Validation log may not reference ticket
- `user_id` in audit_logs - System actions have no user
- `payment_intent_id` - Some transactions aren't from Stripe
- `failure_reason` - Success validations have null reason
- And others...

**Note:** Most nullable fields are optional and can be implemented in phases.

---

## Index Specifications

### Single Column Indexes

**Purpose:** Speed up WHERE clause filtering

```
clients: email, uuid, is_active
ticket_types: code, is_active
wallets: user_id
transactions: user_id, uuid, payment_intent_id, type, status, created_at
tickets: user_id, uuid, ticket_type_id, status, valid_until
validation_logs: ticket_id, user_id, validator_id, validation_type, status, created_at
audit_logs: user_id, action, created_at
notifications: user_id, type
billing_details: user_id
processed_stripe_events: event_id
```

### Composite Indexes

**Purpose:** Speed up complex queries with multiple WHERE conditions

```
transactions: (user_id, type, status) - Common query pattern
tickets: (user_id, status) - Find active tickets for user
validation_logs: (user_id, status) - Find user's validation failures
audit_logs: (user_id, action) - Find specific actions for user
notifications: (user_id, is_read), (user_id, created_at) - Notification queries
```

**Example Query Usage:**
```sql
-- Uses (user_id, status) index
SELECT * FROM tickets WHERE user_id = 123 AND status = 'active';

-- Uses (user_id, created_at) index
SELECT * FROM notifications WHERE user_id = 123 ORDER BY created_at DESC LIMIT 20;
```

---

## Constraints Reference

### Primary Keys
All tables have `id` as PRIMARY KEY (auto-increment BIGINT)

### Foreign Key Constraints

| Constraint | Action on Delete | Reason |
|-----------|------------------|--------|
| tickets.user_id → clients.id | CASCADE | Delete all user's tickets |
| tickets.ticket_type_id → ticket_types.id | CASCADE | Delete ticket-type relationship |
| tickets.purchase_id → transactions.id | SET NULL | Preserve ticket after transaction deletion |
| wallets.user_id → clients.id | CASCADE | Delete wallet when user deleted |
| transactions.user_id → clients.id | CASCADE | Delete transactions when user deleted |
| validation_logs.user_id → clients.id | CASCADE | Delete logs when user deleted |
| validation_logs.ticket_id → tickets.id | SET NULL | Preserve log when ticket deleted |
| audit_logs.user_id → clients.id | CASCADE | Delete logs when user deleted |
| notifications.user_id → clients.id | CASCADE | Delete notifications when user deleted |
| billing_details.user_id → clients.id | CASCADE | Delete details when user deleted |
| clients.default_ticket_id → tickets.id | SET NULL | Clear default if ticket deleted |

### Unique Constraints

```
clients: uuid, email, phone
ticket_types: code
wallets: user_id (one wallet per user)
transactions: uuid, payment_intent_id (optional)
tickets: uuid
billing_details: user_id (one billing detail per user)
processed_stripe_events: event_id
```

---

## Query Examples

### Common Operations

**1. Get user's active tickets**
```sql
SELECT t.* FROM tickets t
WHERE t.user_id = ? 
  AND t.status = 'active'
  AND t.valid_until > NOW()
ORDER BY t.created_at DESC;
```

**2. Get user's wallet balance**
```sql
SELECT w.balance 
FROM wallets w 
WHERE w.user_id = ?;
```

**3. Get recent transactions**
```sql
SELECT t.* 
FROM transactions t
WHERE t.user_id = ? 
ORDER BY t.created_at DESC 
LIMIT 20;
```

**4. Get ticket type pricing**
```sql
SELECT id, code, name_fr, price, max_uses
FROM ticket_types
WHERE is_active = TRUE
ORDER BY price ASC;
```

**5. Get user's validation history**
```sql
SELECT vl.* 
FROM validation_logs vl
WHERE vl.user_id = ?
ORDER BY vl.created_at DESC
LIMIT 50;
```

**6. Get recent security logs**
```sql
SELECT al.* 
FROM audit_logs al
WHERE al.user_id = ?
ORDER BY al.created_at DESC
LIMIT 30;
```

**7. Get unread notifications**
```sql
SELECT n.* 
FROM notifications n
WHERE n.user_id = ? 
  AND n.is_read = FALSE
ORDER BY n.created_at DESC;
```

**8. Find ticket by UUID**
```sql
SELECT t.* 
FROM tickets t
WHERE t.uuid = ?
LIMIT 1;
```

**9. Calculate user's total spending**
```sql
SELECT SUM(t.amount) as total_spending
FROM transactions t
WHERE t.user_id = ? 
  AND t.type = 'purchase'
  AND t.status = 'completed';
```

**10. Get top validators by validations**
```sql
SELECT vl.validator_id, COUNT(*) as validation_count
FROM validation_logs vl
GROUP BY vl.validator_id
ORDER BY validation_count DESC
LIMIT 10;
```

---

**End of Schema Reference**
