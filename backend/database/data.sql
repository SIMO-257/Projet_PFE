SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `pfe_db`
--

-- --------------------------------------------------------
-- Table `clients`
-- --------------------------------------------------------
CREATE TABLE `clients` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `profile_photo` LONGBLOB DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_me` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clients_uuid_unique` (`uuid`),
  UNIQUE KEY `clients_email_unique` (`email`),
  UNIQUE KEY `clients_phone_unique` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `wallets`
-- --------------------------------------------------------
CREATE TABLE `wallets` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `wallets_user_id_foreign` (`user_id`),
  CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `ticket_types`
-- --------------------------------------------------------
CREATE TABLE `ticket_types` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name_fr` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_types_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `tickets`
-- --------------------------------------------------------
CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `ticket_type_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','used','expired') NOT NULL DEFAULT 'active',
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `validation_method` enum('nfc','qr') NOT NULL DEFAULT 'nfc',
  `price_paid` decimal(10,2) NOT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_uuid_unique` (`uuid`),
  KEY `tickets_user_id_foreign` (`user_id`),
  CONSTRAINT `tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tickets_ticket_type_id_foreign` FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `transactions`
-- --------------------------------------------------------
CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('purchase','recharge') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `transactions_uuid_unique` (`uuid`),
  KEY `transactions_user_id_foreign` (`user_id`),
  CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Laravel Standard Tables
-- --------------------------------------------------------
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Initial Seed Data
-- --------------------------------------------------------

INSERT INTO `ticket_types` (`id`, `code`, `name_fr`, `description`, `price`, `duration_minutes`, `is_reusable`, `max_uses`, `is_active`) VALUES
(1, 'BILLET_SIMPLE', 'Billet Normal', 'Valable pour un trajet avec 2 correspondances.', 8.00, 10080, 0, 1, 1),
(2, 'BILLET_DOUBLE', 'Carte Aller/Retour (A/R)', 'Valable pour un trajet aller-retour.', 14.00, 10080, 0, 2, 1),
(4, 'BILLET_SEMAINE', 'Billet de Semaine', 'Voyages illimités pendant 7 jours.', 70.00, 10080, 1, 999, 1),
(5, 'BILLET_MOIS', 'Billet de Mois', 'Voyages illimités pendant 30 jours.', 250.00, 43200, 1, 999, 1);

COMMIT;
```

### Key Changes Implemented:

1.  **Profiles in SQL**: The `clients` table now includes a `profile_photo` column of type `LONGBLOB`. This allows you to store the raw binary data of the image directly in the database, avoiding the need for an external file server or storage service like Minio.
2.  **Remember Me Logic**: Added the `remember_me` boolean column to the `clients` table. This allows the backend to track whether a session should persist beyond the browser closing.
3.  **Default Ticket Logic**: 
   *   Added `is_default` to the `tickets` table. When the user "chooses which card they wish to be the default," your logic should set all other cards for that user to `0` and the selected one to `1`.
   *   Added `validation_method` (`nfc` or `qr`) to the `tickets` table, defaulting to `nfc` as you requested.
4.  **Simplified Schema**: I focused on the core tables (`clients`, `wallets`, `tickets`, `ticket_types`, `transactions`) while removing unnecessary columns to keep the code short and "obvious for a student."
5.  **Laravel Compatibility**: Kept the `sessions`, `cache`, and `password_reset_tokens` tables so that your local Laravel installation works perfectly with standard session and authentication drivers.

To use this, simply import it into your local MySQL database (e.g., via PHPMyAdmin or the MySQL CLI).

<!--
[PROMPT_SUGGESTION]How do I write the Eloquent model for the Client to handle the LONGBLOB profile photo?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Explain how to implement the logic for setting a default ticket in the Laravel controller.[/PROMPT_SUGGESTION]
