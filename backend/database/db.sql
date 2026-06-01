-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 1. Core tables (no foreign keys)
-- =============================================

CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `full_name` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_verification_code` VARCHAR(6) NULL,
    `email_verification_token` VARCHAR(255) NULL,
    `email_verified_at` TIMESTAMP NULL,
    `email_verification_sent_at` TIMESTAMP NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `avatar_path` VARCHAR(255) NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `is_student` TINYINT(1) NOT NULL DEFAULT 0,
    `last_active_at` TIMESTAMP NULL,
    `fcm_token` VARCHAR(255) NULL,
    `notification_prefs` JSON NULL,
    `user_preferences` JSON NULL,
    `default_ticket_id` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `users_uuid_unique` (`uuid`),
    UNIQUE KEY `users_phone_unique` (`phone`),
    UNIQUE KEY `users_email_unique` (`email`),
    KEY `users_email_index` (`email`),
    KEY `users_uuid_index` (`uuid`),
    KEY `users_is_active_index` (`is_active`)
) ENGINE=InnoDB;

CREATE TABLE `ticket_types` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` JSON NOT NULL,
    `description` JSON NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `student_price` DECIMAL(10,2) NULL,
    `duration_minutes` INT NULL,
    `is_reusable` TINYINT(1) NOT NULL DEFAULT 0,
    `max_uses` INT NOT NULL DEFAULT 1,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `ticket_types_code_unique` (`code`),
    KEY `ticket_types_code_index` (`code`),
    KEY `ticket_types_is_active_index` (`is_active`)
) ENGINE=InnoDB;

INSERT INTO `ticket_types` (`id`, `code`, `name`, `description`, `price`, `student_price`, `duration_minutes`, `is_reusable`, `max_uses`, `is_active`) VALUES
(1, 'BILLET_SIMPLE', '{"fr":"Billet Normal","en":"Standard Ticket","ar":"تذكرة عادية"}', '{"fr":"Valable pour un trajet avec 2 correspondances.","en":"Valid for one trip with 2 connections.","ar":"صالحة لرحلة واحدة مع وصلتين"}', 8.00, NULL, 10080, 0, 1, 1),
(2, 'BILLET_DOUBLE', '{"fr":"Carte Aller/Retour (A/R)","en":"Round Trip Card","ar":"بطاقة ذهاب وإياب"}', '{"fr":"Valable pour un trajet aller-retour.","en":"Valid for a round trip.","ar":"صالحة لرحلة ذهاب وإياب"}', 14.00, NULL, 10080, 0, 2, 1),
(4, 'BILLET_SEMAINE', '{"fr":"Billet de Semaine","en":"Weekly Ticket","ar":"تذكرة أسبوعية"}', '{"fr":"Voyages illimités pendant 7 jours.","en":"Unlimited travel for 7 days.","ar":"سفر غير محدود لمدة 7 أيام"}', 70.00, 40.00, 10080, 1, 999, 1),
(5, 'BILLET_MOIS', '{"fr":"Billet de Mois","en":"Monthly Ticket","ar":"تذكرة شهرية"}', '{"fr":"Voyages illimités pendant 30 jours.","en":"Unlimited travel for 30 days.","ar":"سفر غير محدود لمدة 30 يوماً"}', 250.00, 150.00, 43200, 1, 999, 1);


CREATE TABLE `pending_registrations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NULL,
    `avatar_path` VARCHAR(255) NULL,
    `email_verification_code` VARCHAR(6) NULL,
    `email_verification_token` VARCHAR(255) NULL,
    `email_verification_sent_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `pending_registrations_email_unique` (`email`),
    UNIQUE KEY `pending_registrations_phone_unique` (`phone`)
) ENGINE=InnoDB;

-- =============================================
-- 2. Tables with simple foreign keys (to users only)
-- =============================================

CREATE TABLE `wallets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `balance` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    KEY `wallets_user_id_index` (`user_id`),
    CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `student_verifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `cin_doc_path` VARCHAR(255) NOT NULL,
    `school_doc_path` VARCHAR(255) NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `admin_id` BIGINT UNSIGNED NULL,
    `rejected_reason` TEXT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    KEY `student_verifications_user_id_index` (`user_id`),
    KEY `student_verifications_status_index` (`status`),
    CONSTRAINT `student_verifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `student_verifications_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE `repports` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type_probleme` VARCHAR(255) NOT NULL,
    `sujet` VARCHAR(255) NULL,
    `description` TEXT NOT NULL,
    `image_path` VARCHAR(255) NULL,
    `statut` ENUM('en attente', 'en cours', 'résolu') NOT NULL DEFAULT 'en attente',
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    KEY `repports_user_id_index` (`user_id`),
    KEY `repports_statut_index` (`statut`),
    CONSTRAINT `repports_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `payment_intent_id` VARCHAR(100) NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'completed',
    `payment_method` VARCHAR(50) NOT NULL DEFAULT 'wallet',
    `amount` DECIMAL(10,2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'MAD',
    `balance_before` DECIMAL(10,2) NOT NULL,
    `balance_after` DECIMAL(10,2) NOT NULL,
    `reference` VARCHAR(100) NULL,
    `metadata` JSON NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `transactions_uuid_unique` (`uuid`),
    UNIQUE KEY `transactions_payment_intent_id_unique` (`payment_intent_id`),
    KEY `transactions_user_id_index` (`user_id`),
    KEY `transactions_uuid_index` (`uuid`),
    KEY `transactions_payment_intent_id_index` (`payment_intent_id`),
    KEY `transactions_type_index` (`type`),
    KEY `transactions_status_index` (`status`),
    KEY `transactions_created_at_index` (`created_at`),
    CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- 3. Tickets table (references multiple tables)
-- =============================================

CREATE TABLE `tickets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `ticket_type_id` BIGINT UNSIGNED NOT NULL,
    `purchase_id` BIGINT UNSIGNED NULL,
    `status` ENUM('active', 'used', 'expired') NOT NULL DEFAULT 'active',
    `valid_from` TIMESTAMP NULL,
    `valid_until` TIMESTAMP NULL,
    `remaining_uses` INT NULL,
    `price_paid` DECIMAL(10,2) NOT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `tickets_uuid_unique` (`uuid`),
    KEY `tickets_user_id_index` (`user_id`),
    KEY `tickets_uuid_index` (`uuid`),
    KEY `tickets_ticket_type_id_index` (`ticket_type_id`),
    KEY `tickets_status_index` (`status`),
    KEY `tickets_valid_until_index` (`valid_until`),
    KEY `tickets_user_id_status_index` (`user_id`, `status`),
    CONSTRAINT `tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `tickets_ticket_type_id_foreign` FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_types` (`id`) ON DELETE CASCADE,
    CONSTRAINT `tickets_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================
-- 4. Add default_ticket_id to users (circular reference fix)
-- =============================================

ALTER TABLE `users` ADD CONSTRAINT `users_default_ticket_id_foreign` 
    FOREIGN KEY (`default_ticket_id`) REFERENCES `tickets` (`id`) ON DELETE SET NULL;

-- =============================================
-- 5. Remaining tables
-- =============================================

CREATE TABLE `validation_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ticket_id` BIGINT UNSIGNED NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `validator_id` VARCHAR(100) NOT NULL,
    `validation_type` ENUM('nfc', 'qr') NOT NULL,
    `status` ENUM('success', 'failure', 'offline_accepted') NOT NULL,
    `failure_reason` VARCHAR(255) NULL,
    `location` JSON NULL,
    `metadata` JSON NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `validation_logs_ticket_id_index` (`ticket_id`),
    KEY `validation_logs_user_id_index` (`user_id`),
    KEY `validation_logs_validator_id_index` (`validator_id`),
    KEY `validation_logs_validation_type_index` (`validation_type`),
    KEY `validation_logs_status_index` (`status`),
    KEY `validation_logs_created_at_index` (`created_at`),
    KEY `validation_logs_user_id_status_index` (`user_id`, `status`),
    CONSTRAINT `validation_logs_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE SET NULL,
    CONSTRAINT `validation_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `action` VARCHAR(255) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `audit_logs_user_id_index` (`user_id`),
    KEY `audit_logs_action_index` (`action`),
    KEY `audit_logs_created_at_index` (`created_at`),
    KEY `audit_logs_user_id_action_index` (`user_id`, `action`),
    CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('validation', 'payment', 'security', 'promo', 'system') NOT NULL,
    `severity` ENUM('info', 'success', 'warning', 'danger') NOT NULL DEFAULT 'info',
    `title` VARCHAR(255) NOT NULL,
    `body` VARCHAR(255) NOT NULL,
    `meta` JSON NULL,
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `read_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    KEY `notifications_user_id_index` (`user_id`),
    KEY `notifications_user_id_is_read_index` (`user_id`, `is_read`),
    KEY `notifications_user_id_created_at_index` (`user_id`, `created_at`),
    KEY `notifications_type_index` (`type`),
    CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `processed_stripe_events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `event_id` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `processed_stripe_events_event_id_unique` (`event_id`),
    KEY `processed_stripe_events_event_id_index` (`event_id`)
) ENGINE=InnoDB;

CREATE TABLE `password_reset_tokens` (
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NULL,
    PRIMARY KEY (`email`)
) ENGINE=InnoDB;

CREATE TABLE `cache` (
    `key` VARCHAR(255) NOT NULL,
    `value` MEDIUMTEXT NOT NULL,
    `expiration` INT NOT NULL,
    PRIMARY KEY (`key`),
    KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB;

CREATE TABLE `cache_locks` (
    `key` VARCHAR(255) NOT NULL,
    `owner` VARCHAR(255) NOT NULL,
    `expiration` INT NOT NULL,
    PRIMARY KEY (`key`),
    KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB;

CREATE TABLE `jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `queue` VARCHAR(255) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `attempts` TINYINT UNSIGNED NOT NULL,
    `reserved_at` INT UNSIGNED NULL,
    `available_at` INT UNSIGNED NOT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB;

CREATE TABLE `job_batches` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `total_jobs` INT NOT NULL,
    `pending_jobs` INT NOT NULL,
    `failed_jobs` INT NOT NULL,
    `failed_job_ids` LONGTEXT NOT NULL,
    `options` MEDIUMTEXT NULL,
    `cancelled_at` INT NULL,
    `created_at` INT NOT NULL,
    `finished_at` INT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `failed_jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(255) NOT NULL,
    `connection` TEXT NOT NULL,
    `queue` TEXT NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `exception` LONGTEXT NOT NULL,
    `failed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB;

CREATE TABLE `personal_access_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tokenable_type` VARCHAR(255) NOT NULL,
    `tokenable_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `abilities` TEXT NULL,
    `last_used_at` TIMESTAMP NULL,
    `expires_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
    KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB;

CREATE TABLE `admins` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `is_super_admin` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `admins_email_unique` (`email`)
) ENGINE=InnoDB;

INSERT INTO `admins` (`first_name`, `last_name`, `email`, `password`, `is_active`, `is_super_admin`, `created_at`, `updated_at`)
VALUES ('Admin', 'CasaWay', 'admin@casaway.ma', '$2y$10$WuqkRgbZpbhi20dbEHROFe19B/2LE2KiJPv15jTn.neaK6ES57diO', 1, 1, NOW(), NOW());

-- =============================================
-- 6. Event (MySQL only)
-- =============================================

CREATE EVENT IF NOT EXISTS `delete_expired_tickets_daily`
ON SCHEDULE EVERY 1 DAY
DO
    DELETE FROM `tickets` WHERE `status` = 'expired';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
