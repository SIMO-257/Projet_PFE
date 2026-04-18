-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 13 avr. 2026 à 22:11
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `pfe_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `blacklisted_tokens`
--

CREATE TABLE `blacklisted_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_uuid` char(36) NOT NULL,
  `jws_signature` text DEFAULT NULL,
  `reason` varchar(100) NOT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `uuid`, `email`, `phone`, `password_hash`, `first_name`, `last_name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, '888a5c93-3655-44b0-a4b8-983b7cb7b7a9', 'laney24@example.org', '+12082568414', '$2y$12$zs/2OfWNqqD4PNZ6ttC1wuvLHUTNKXh3xp99KVK8gzT8zAzxkCm0y', 'Brad', 'Wisoky', 1, '2026-03-30 10:36:00', '2026-03-30 10:36:02'),
(2, '8ccc0228-aa1a-4fb3-b9e5-6a45d3327429', 'trantow.sunny@example.com', '+18782388907', '$2y$12$dYxMIcZUPBc5Lbe3KPKSU.wHQ..y8I5bb8jtX3Eh90KhWqFY/SaFq', 'Terence', 'Hoppe', 1, '2026-03-30 10:36:00', '2026-03-30 10:36:02'),
(3, '36a49646-598c-41b8-923e-927c5912548e', 'stamm.lesly@example.net', '+19408234108', '$2y$12$G17OOolqA1hRChKM7bNs/.tcM9RkThOKLSh.WMgry8uZMcnWmvp9a', 'Ryley', 'Mertz', 0, '2026-03-30 10:36:00', '2026-03-30 10:36:02'),
(4, '97ff667f-991d-4784-851d-a8e2198d41be', 'jboyer@example.com', '+18589056525', '$2y$12$9vepucMM6/nEmroOwAgsguVF0/cjYWQjPu0X1qN4wd6vBO6iOPxKS', 'Hugh', 'Okuneva', 1, '2026-03-30 10:36:01', '2026-03-30 10:36:02'),
(5, '071b77a0-b5f4-4dd9-87b2-bf60e1775668', 'wilkinson.rosalind@example.com', '+13079962596', '$2y$12$FLpI3/FBS6K0hUdrxniIouvbGQmuLCMcoi8LrsUoj3VQd2tQ4R9xG', 'Vance', 'Borer', 1, '2026-03-30 10:36:01', '2026-03-30 10:36:02'),
(6, 'c36e2c5f-0959-4b9c-9780-f2228337c0cb', '7mohammed.mammah@gmail.com', '0712345623', '$2y$12$hkpqwpqMlVpkGTDxRz/6BOHpH2QZHyZSAMqduVNcgH2DL/ccDQTYe', 'Casa', 'Simo', 1, '2026-03-30 16:10:48', '2026-04-12 10:08:00'),
(7, '51bd69f9-20f5-4a20-b385-3da746b414ea', 'admin@gmail.com', '0670360925', '$2y$12$QYqy8NnGtdhTcQ.43Wdg8Opnr3jgicPy3L2EtGz7PrkZLp2JFedri', 'Mammah', 'Mohammed', 1, '2026-03-30 16:43:41', '2026-03-30 16:43:41'),
(8, '9758ee34-5a51-402e-81f6-9b5b1bcdb258', '0simo.casa@gmail.com', '0770360919', '$2y$12$55QS/EC85.O3f/7gZUsV1OTKXjSYJYUMrcrn6cIkkg/OHlbdyrvoS', 'casa', 'simo', 1, '2026-03-30 19:25:52', '2026-03-30 19:26:16'),
(9, '2ad924d6-0245-474b-b19a-7d921322a58a', 'lbakhira@gmail.com', '0770360925', '$2y$12$VXpFAsbVKApypqBdlV1rBOSlKTssFBrALs813ih9t37Wfam2CY4ZO', 'HOWA', 'ANA', 1, '2026-04-12 12:17:01', '2026-04-12 12:17:01'),
(10, 'ecb3a3fd-289a-4b87-b566-9adcba6979d6', 'leo@gmail.com', '0770360921', '$2y$12$k6r.L4fGfM55JWbldHxRyOZw7H/t1lKBJmuOzXHfRnKTkvyEmL6GS', 'messi', 'leo', 1, '2026-04-13 19:09:46', '2026-04-13 19:09:46');

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_03_13_151743_create_clients_table', 1),
(5, '2026_03_13_152936_create_ticket_types_table', 1),
(6, '2026_03_13_231133_create_wallets_table', 1),
(7, '2026_03_13_231410_create_transactions_table', 1),
(8, '2026_03_13_231416_create_tickets_table', 1),
(9, '2026_03_13_232547_create_validation_logs_table', 1),
(10, '2026_03_13_232819_create_user_devices_table', 1),
(11, '2026_03_13_232837_create_blacklisted_tokens_table', 1),
(12, '2026_04_10_160521_create_personal_access_tokens_table', 2);

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('glVnIhsnuaQDTJML1AeWndUrmr6hGQN6PSPATO3g', NULL, '127.0.0.1', 'curl/8.18.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVkZIZ1JUc05lTmk0QTl0eFFxZzhMaDZBR1lzYmFqWHlwSlI1T3lXRyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dvdXQ/dXVpZD10ZXN0LXV1aWQiO3M6NToicm91dGUiO3M6MTA6ImxvZ291dC5nZXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1776011569),
('Xrpa6ZgU3ogY69t8W8RHIke24RsvG0zaUHcqngTu', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiemxCYXVLbER3VjRkcWxyZ20wRzl0Y01Yblk5bE9sWFZuRklXa0NPVyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dvdXQ/dXVpZD1jMzZlMmM1Zi0wOTU5LTRiOWMtOTc4MC1mMjIyODMzN2MwY2IiO3M6NToicm91dGUiO3M6MTA6ImxvZ291dC5nZXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1776011649);

-- --------------------------------------------------------

--
-- Structure de la table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `ticket_type_id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('active','used','expired') NOT NULL DEFAULT 'active',
  `valid_from` timestamp NULL DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `remaining_uses` int(11) DEFAULT NULL,
  `price_paid` decimal(10,2) NOT NULL,
  `jws_signature` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `ticket_types`
--

CREATE TABLE `ticket_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name_fr` varchar(100) NOT NULL,
  `name_ar` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `is_reusable` tinyint(1) NOT NULL DEFAULT 0,
  `max_uses` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('purchase','validation') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `balance_before` decimal(10,2) NOT NULL,
  `balance_after` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL DEFAULT 'wallet',
  `reference` varchar(100) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user_devices`
--

CREATE TABLE `user_devices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `device_id` varchar(255) NOT NULL,
  `device_type` enum('android','ios') NOT NULL,
  `hce_token` varchar(255) DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `validation_logs`
--

CREATE TABLE `validation_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `validator_id` varchar(100) NOT NULL,
  `validation_type` enum('nfc','qr') NOT NULL,
  `status` enum('success','failure','offline_accepted') NOT NULL,
  `failure_reason` varchar(255) DEFAULT NULL,
  `location` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`location`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `wallets`
--

CREATE TABLE `wallets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `card_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `blacklisted_tokens`
--
ALTER TABLE `blacklisted_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blacklisted_tokens_ticket_uuid_index` (`ticket_uuid`),
  ADD KEY `blacklisted_tokens_expires_at_index` (`expires_at`);

--
-- Index pour la table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Index pour la table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clients_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `clients_email_unique` (`email`),
  ADD UNIQUE KEY `clients_phone_unique` (`phone`);

--
-- Index pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Index pour la table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Index pour la table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Index pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Index pour la table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tickets_uuid_unique` (`uuid`),
  ADD KEY `tickets_user_id_foreign` (`user_id`),
  ADD KEY `tickets_ticket_type_id_foreign` (`ticket_type_id`),
  ADD KEY `tickets_purchase_id_foreign` (`purchase_id`);

--
-- Index pour la table `ticket_types`
--
ALTER TABLE `ticket_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_types_code_unique` (`code`);

--
-- Index pour la table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactions_uuid_unique` (`uuid`),
  ADD KEY `transactions_user_id_foreign` (`user_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Index pour la table `user_devices`
--
ALTER TABLE `user_devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_devices_device_id_unique` (`device_id`),
  ADD KEY `user_devices_user_id_foreign` (`user_id`);

--
-- Index pour la table `validation_logs`
--
ALTER TABLE `validation_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `validation_logs_ticket_id_foreign` (`ticket_id`),
  ADD KEY `validation_logs_user_id_foreign` (`user_id`);

--
-- Index pour la table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallets_user_id_foreign` (`user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `blacklisted_tokens`
--
ALTER TABLE `blacklisted_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `ticket_types`
--
ALTER TABLE `ticket_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `user_devices`
--
ALTER TABLE `user_devices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `validation_logs`
--
ALTER TABLE `validation_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `blacklisted_tokens`
--
ALTER TABLE `blacklisted_tokens`
  ADD CONSTRAINT `blacklisted_tokens_ticket_uuid_foreign` FOREIGN KEY (`ticket_uuid`) REFERENCES `tickets` (`uuid`);

--
-- Contraintes pour la table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tickets_ticket_type_id_foreign` FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_types` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `user_devices`
--
ALTER TABLE `user_devices`
  ADD CONSTRAINT `user_devices_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `validation_logs`
--
ALTER TABLE `validation_logs`
  ADD CONSTRAINT `validation_logs_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `validation_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
