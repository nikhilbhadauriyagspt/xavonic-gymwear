-- ================================================
-- GUIDELYA / XAVONIC FULL DATABASE BACKUP
-- Generated: 2026-09-30T22:13:11.429Z
-- ================================================

CREATE DATABASE IF NOT EXISTS `guidelya_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `guidelya_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------
-- Structure for table `admins`
-- ------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'Super Admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `admins` (1 rows)
INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`, `created_at`, `last_login`) VALUES (1, 'Master Admin', 'admin@xavonic.com', '$2b$10$19Q0zDXBEASnvzvYa8xm..6AiKHMspjlAsaHqKXsvODVeFgUQhSru', 'Super Admin', '2026-09-30 19:57:29', '2026-09-30 19:57:41');

-- ------------------------------------------------
-- Structure for table `users`
-- ------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT 'Athlete',
  `phone` varchar(20) DEFAULT NULL,
  `phone_verified` tinyint(1) DEFAULT '0',
  `email` varchar(150) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'customer',
  `gender` varchar(20) DEFAULT 'Male',
  `tier` varchar(50) DEFAULT 'VIP Athlete Club',
  `points` int DEFAULT '100',
  `chest_size` varchar(20) DEFAULT 'L (42")',
  `lower_size` varchar(20) DEFAULT 'M (32")',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `customer_id` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `users` (1 rows)
INSERT INTO `users` (`id`, `customer_id`, `name`, `phone`, `phone_verified`, `email`, `email_verified`, `password`, `role`, `gender`, `tier`, `points`, `chest_size`, `lower_size`, `created_at`, `last_login`) VALUES (1, 'GDL-00001', 'Nikhil singh', '917317788940', 1, 'abcd@gmail.com', 1, NULL, 'customer', 'Male', 'VIP Athlete Club', 100, 'M (40")', 'XL (36")', '2026-09-30 20:56:10', NULL);

-- ------------------------------------------------
-- Structure for table `otp_verifications`
-- ------------------------------------------------
DROP TABLE IF EXISTS `otp_verifications`;
CREATE TABLE `otp_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identifier` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `otp_verifications` (2 rows)
INSERT INTO `otp_verifications` (`id`, `identifier`, `phone`, `email`, `otp`, `expires_at`, `is_used`, `created_at`) VALUES (1, '917317788940', '917317788940', NULL, '1234', '2026-09-30 21:01:08', 0, '2026-09-30 20:56:08');
INSERT INTO `otp_verifications` (`id`, `identifier`, `phone`, `email`, `otp`, `expires_at`, `is_used`, `created_at`) VALUES (2, 'link_abcd@gmail.com', NULL, 'abcd@gmail.com', '1234', '2026-09-30 21:01:21', 0, '2026-09-30 20:56:20');

-- ------------------------------------------------
-- Structure for table `store_settings`
-- ------------------------------------------------
DROP TABLE IF EXISTS `store_settings`;
CREATE TABLE `store_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=693 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `store_settings` (15 rows)
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (1, 'whatsapp_mode', 'test', '2026-09-30 20:07:07');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (2, 'whatsapp_meta_token', '', '2026-09-30 20:07:07');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (3, 'whatsapp_phone_number_id', '', '2026-09-30 20:07:07');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (4, 'whatsapp_waba_id', '', '2026-09-30 20:07:07');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (5, 'whatsapp_template_name', 'guidelya_otp_auth', '2026-09-30 20:07:07');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (26, 'smtp_mode', 'test', '2026-09-30 20:12:28');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (27, 'smtp_host', 'smtp.gmail.com', '2026-09-30 20:12:28');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (28, 'smtp_port', '465', '2026-09-30 20:12:28');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (29, 'smtp_secure', 'true', '2026-09-30 20:12:28');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (30, 'smtp_user', '', '2026-09-30 20:12:28');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (31, 'smtp_pass', '', '2026-09-30 20:12:28');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (32, 'smtp_sender_name', 'Guidelya Athletics', '2026-09-30 20:12:28');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (304, 'cloudinary_cloud_name', 'fwlidd7t', '2026-09-30 21:09:31');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (305, 'cloudinary_api_key', '887531852538712', '2026-09-30 21:09:31');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (306, 'cloudinary_api_secret', 'lkB-KXtVa7j9Zi8pzhTn1VhT5xU', '2026-09-30 21:09:31');

-- ------------------------------------------------
-- Structure for table `categories`
-- ------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `level` enum('main','sub','item_type') DEFAULT 'main',
  `gender_target` enum('Men','Women','Unisex') DEFAULT 'Men',
  `image_url` varchar(500) DEFAULT NULL,
  `show_title_overlay` tinyint(1) DEFAULT '1',
  `subtitle` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `show_in_dual_section` tinyint(1) DEFAULT '0',
  `kicker_title` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `categories` (25 rows)
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (1, 'Men', 'men', NULL, 'main', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805028/guidelya/products/fytbuv7tb2t6q5lkfukh.jpg', 1, NULL, 1, 'active', '2026-09-30 21:18:00', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (2, 'Women', 'women', NULL, 'main', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805017/guidelya/products/jar1kslgtpww9gjudcro.jpg', 1, NULL, 2, 'active', '2026-09-30 21:18:00', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (3, 'Gym T-Shirts & Tops', 'men-t-shirts', 1, 'sub', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805028/guidelya/products/fytbuv7tb2t6q5lkfukh.jpg', 1, NULL, 1, 'active', '2026-09-30 21:18:00', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (4, 'Gym Lowers & Bottomwear', 'men-lowers-bottoms', 1, 'sub', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805021/guidelya/products/xcrkibtuhgweokp0tkot.jpg', 1, NULL, 2, 'active', '2026-09-30 21:18:00', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (5, 'Compression T-Shirts', 'compression', 3, 'item_type', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805017/guidelya/products/jar1kslgtpww9gjudcro.jpg', 1, '2nd Skin High Elastic Performance', 1, 'active', '2026-09-30 21:18:00', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (6, 'Oversized T-Shirts', 'oversized', 3, 'item_type', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805028/guidelya/products/fytbuv7tb2t6q5lkfukh.jpg', 1, 'Heavyweight Drop-Shoulder Relaxed Fit', 2, 'active', '2026-09-30 21:18:00', 1, 'Heavyweight Fits');
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (7, 'Drop Cut T-Shirts', 'drop-cut', 3, 'item_type', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805024/guidelya/products/h9enotzzgh15wdjjjiwx.jpg', 1, 'Extended Curved Hem Aesthetic', 3, 'active', '2026-09-30 21:18:00', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (8, 'Tanks & Stringers', 'tanks', 3, 'item_type', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805026/guidelya/products/oylrr44sjm1lpi21zdo5.jpg', 1, 'Deep Armhole Maximum Mobility', 4, 'active', '2026-09-30 21:18:00', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (9, 'Gym Lowers & Joggers', 'lowers', 4, 'item_type', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805021/guidelya/products/xcrkibtuhgweokp0tkot.jpg', 1, 'Tapered Ankle Athletic Fit', 5, 'active', '2026-09-30 21:18:00', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (10, 'Athletic Trackpants', 'trackpants', 4, 'item_type', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805022/guidelya/products/hgancqvvcmhneb3pmf8l.jpg', 1, 'Breathable Training Performance', 6, 'active', '2026-09-30 21:18:00', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (11, '5" Training Shorts', 'shorts', 4, 'item_type', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805025/guidelya/products/a8pean6daszlcwczhvzy.jpg', 1, 'Tactical Inseam Quad Reveal', 7, 'active', '2026-09-30 21:18:00', 1, 'Bottomwear Line');
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (12, 'Cargo Gym Lowers', 'cargo-lowers', 4, 'item_type', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805022/guidelya/products/hgancqvvcmhneb3pmf8l.jpg', 1, 'Utility Multi-Pocket Stretch', 8, 'active', '2026-09-30 21:18:00', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (21, 'Acid Wash Collection', 'acid-wash', 3, 'item_type', 'Men', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805010/guidelya/products/velxcqpm6f1vosy3on2w.jpg', 1, NULL, 0, 'active', '2026-09-30 21:50:30', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (26, 'Activewear Tops', 'women-tops', 2, 'sub', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805017/guidelya/products/jar1kslgtpww9gjudcro.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (27, 'High Impact Sports Bras', 'sports-bras', 26, 'item_type', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805017/guidelya/products/jar1kslgtpww9gjudcro.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (28, 'Seamless Ribbed Tanks', 'ribbed-tanks', 26, 'item_type', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805017/guidelya/products/jar1kslgtpww9gjudcro.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (29, 'Oversized Pump Covers', 'women-oversized', 26, 'item_type', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805017/guidelya/products/jar1kslgtpww9gjudcro.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (30, 'Bottoms & Leggings', 'women-bottoms', 2, 'sub', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805021/guidelya/products/xcrkibtuhgweokp0tkot.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (31, 'Seamless Squat Leggings', 'squat-leggings', 30, 'item_type', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805021/guidelya/products/xcrkibtuhgweokp0tkot.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (32, 'Contour Sculpt Shorts', 'contour-shorts', 30, 'item_type', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805021/guidelya/products/xcrkibtuhgweokp0tkot.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (33, 'Aesthetic Flared Pants', 'flared-pants', 30, 'item_type', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805021/guidelya/products/xcrkibtuhgweokp0tkot.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (34, 'Co-ords & Outerwear', 'women-outerwear', 2, 'sub', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805028/guidelya/products/fytbuv7tb2t6q5lkfukh.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (35, 'Matching Gym Co-ord Sets', 'coord-sets', 34, 'item_type', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805028/guidelya/products/fytbuv7tb2t6q5lkfukh.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (36, 'Zip-up Gym Jackets', 'gym-jackets', 34, 'item_type', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805028/guidelya/products/fytbuv7tb2t6q5lkfukh.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `level`, `gender_target`, `image_url`, `show_title_overlay`, `subtitle`, `sort_order`, `status`, `created_at`, `show_in_dual_section`, `kicker_title`) VALUES (37, 'Cropped Fleece Hoodies', 'cropped-hoodies', 34, 'item_type', 'Women', 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805028/guidelya/products/fytbuv7tb2t6q5lkfukh.jpg', 1, NULL, 0, 'active', '2026-09-30 22:08:41', 0, NULL);

-- ------------------------------------------------
-- Structure for table `products`
-- ------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT '',
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `sku` varchar(100) DEFAULT NULL,
  `status` enum('active','draft','archived') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category_slug` varchar(150) NOT NULL DEFAULT '',
  `category_name` varchar(150) NOT NULL DEFAULT '',
  `gender_target` enum('Men','Women','Unisex') DEFAULT 'Men',
  `discount_label` varchar(50) DEFAULT '',
  `in_stock` tinyint(1) DEFAULT '1',
  `rating` decimal(3,2) DEFAULT '4.90',
  `reviews_count` int DEFAULT '0',
  `sizes_json` json DEFAULT NULL,
  `colors_json` json DEFAULT NULL,
  `features_json` json DEFAULT NULL,
  `fabric` varchar(255) DEFAULT '',
  `fit` varchar(255) DEFAULT '',
  `model_stats` varchar(255) DEFAULT '',
  `description` text,
  `care_instructions` text,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `sku` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `products` (14 rows)
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (1, 'Pro Muscle-Lock Compression Shirt', 'pro-muscle-lock-compression-shirt', '', '1299.00', '1899.00', 200, 'GDL-CMP-001', 'active', '2026-09-30 21:29:49', '2026-09-30 21:50:30', 'compression', 'Muscle Compression', 'Men', '30% Off', 1, '4.95', 156, 'S,M,L,XL', '[object Object],[object Object],[object Object]', 'Reinforced Flatlock 4-needle stitching,Targeted lat and pec compression zones,Quick-dry sweat-wicking capillary technology,Anti-microbial and silver-ion odor barrier,UPF 50+ sun protection for outdoor training', '85% Nylon, 15% Spandex Muscle-Lock Matrix', 'Second-Skin Compression Lock', 'Model is 5\'11" (82kg) wearing size M', 'Engineered for maximum blood flow, vascularity display, and joint warmth. Seamless 4-way stretch holds muscle bellies tight while eliminating chafing during intense lifts.', 'Machine wash cold with similar colors. Do not bleach or use fabric softeners. Tumble dry low or hang dry.', 5);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (2, 'Vintage Distressed Heavyweight Pump Cover', 'acid-wash-heavyweight-oversized-tee', '', '1399.00', '1999.00', 90, 'GDL-OVR-002', 'active', '2026-09-30 21:29:49', '2026-09-30 21:50:30', 'oversized', 'Oversized T-Shirts', 'Men', '30% Off', 1, '4.90', 84, 'M,L,XL,XXL', '[object Object],[object Object]', 'Heavy drape vintage distressed wash,Reinforced shoulder tape seams,Thermal regulation cotton weave,Fade-resistant reactive dye process', '220 GSM Ultra-Soft Cotton Terry', 'Loose Gym Silhouette', 'Model is 5\'11" wearing size XL for oversized look', 'The ultimate warm-up pump cover. Generous chest and sleeve cut designed to fit effortlessly over tanks and stringers during early set progression.', 'Machine wash cold. Do not iron on prints.', 6);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (7, 'Minimalist Boxy Fit Drop Shoulder Tee', 'minimalist-boxy-fit-drop-shoulder-tee', '', '1299.00', '1899.00', 110, 'GDL-OVR-003', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'oversized', 'Oversized T-Shirts', 'Men', '32% Off', 1, '4.85', 62, 'S,M,L,XL', '[object Object],[object Object],[object Object]', 'Zero shrinkage pre-washed fabric,Straight cut hem with side vents,High-density collar ribbing', '230 GSM Heavy Single Jersey Cotton', 'Clean Boxy Drop Shoulder', 'Model is 6\'0" wearing size L', 'Clean architectural cut without loud logos. Pure gym-to-street minimalism with premium matte texture.', 'Machine wash cold. Hang dry.', 6);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (9, 'Second-Skin Compression Long Sleeve Thermal', 'second-skin-compression-long-sleeve-thermal', '', '1399.00', '1999.00', 85, 'GDL-CMP-002', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'compression', 'Muscle Compression', 'Men', '30% Off', 1, '4.90', 91, 'S,M,L,XL', '[object Object],[object Object]', 'Thumbhole cuffs for secure sleeve positioning,Graduated forearm-to-shoulder compression,Thermal micro-fleece internal lining', '88% Polyamide, 12% Elastane Heat-Lock', 'Tight Athletic Compression Fit', 'Model is 6\'0" wearing size L', 'Full-length arm and forearm compression designed for pump retention, tendon stability, and high performance.', 'Machine wash cold. Line dry in shade.', 5);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (10, 'Vascularity Accent Flatlock Compression Tee', 'vascularity-accent-flatlock-compression-tee', '', '1249.00', '1799.00', 95, 'GDL-CMP-003', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'compression', 'Muscle Compression', 'Men', '31% Off', 1, '4.88', 73, 'S,M,L,XL', '[object Object],[object Object]', 'Ergonomic contour paneling,Zero friction flat seams,Moisture-repelling hydrophobic fibers', 'High-Density Hydrophobic Lycra', 'Contoured Muscle-Fit', 'Model is 5\'10" wearing size M', 'Sculpted anatomical seamlines map across the clavicle, deltoids, and ribs to highlight athletic muscularity.', 'Machine wash cold. Do not tumble dry.', 5);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (11, '5" Tactical Inseam Gym Shorts', '5-inch-tactical-inseam-gym-shorts', '', '1099.00', '1599.00', 180, 'GDL-SHT-001', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'shorts', '5" Training Shorts', 'Men', '31% Off', 1, '4.85', 112, 'S,M,L,XL', '[object Object],[object Object],[object Object]', '5-inch athletic quad cut,Deep dual YKK zippered side pockets,Internal towel / shirt loop on waistband,Split-hem design for maximum squat depth,High-elastic drawcord with metal aglets', '90% Nylon, 10% Spandex 4-Way Stretch', '5-Inch Quad-Accent Inseam', 'Model is 6\'0" wearing size M (32" waist)', 'Custom tailored above the quad for unrestricted squats, lunges, and deadlifts. Equipped with waterproof concealed zipper pockets so your phone never drops on the gym floor.', 'Machine wash cold. Do not iron zippers.', 11);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (12, '2-in-1 Quad-Flex Compression Liner Shorts', '2-in-1-quad-flex-compression-liner-shorts', '', '1399.00', '1999.00', 120, 'GDL-SHT-002', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'shorts', '5" Training Shorts', 'Men', '30% Off', 1, '4.90', 96, 'S,M,L,XL', '[object Object],[object Object]', 'Integrated phone pocket on compression liner,Sweat-proof back zipper key pocket,Anti-chafing flatlock inner seams', 'Double Layer: Aero Shell + Compression Inner', '5" Outer + 7" Compression Inner', 'Model is 6\'1" wearing size L', 'Built-in muscle compression liner protects against inner thigh chafing and supports hamstring power.', 'Machine wash cold. Do not tumble dry.', 11);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (13, 'Tapered Heavyweight Cargo Joggers', 'tapered-heavyweight-cargo-joggers', '', '1699.00', '2499.00', 140, 'GDL-LOW-001', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'lowers', 'Gym Lowers & Joggers', 'Men', '32% Off', 1, '4.88', 88, 'M,L,XL', '[object Object],[object Object],[object Object]', '6 Multi-functional tactical pockets,Heavyweight 320 GSM fleece interior,Tapered ankle ribbing that hugs sneakers,Thick elastic waistband with chunky drawcord', '320 GSM Heavyweight Terry Fleece', 'Tapered Ankle Rib Fit', 'Model is 6\'1" wearing size L (33" waist)', 'Engineered heavy fleece joggers with ergonomic knee darts for true squat mobility without sagging.', 'Machine wash cold inside out. Hang dry.', 9);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (14, 'French Terry Relaxed Aesthetic Gym Joggers', 'french-terry-relaxed-aesthetic-gym-joggers', '', '1599.00', '2299.00', 95, 'GDL-LOW-002', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'lowers', 'Gym Lowers & Joggers', 'Men', '30% Off', 1, '4.90', 65, 'S,M,L,XL', '[object Object],[object Object]', 'Gusseted crotch for full mobility,Deep welt zippered pockets,Custom metal drawcord aglets', '280 GSM Pure Organic Cotton French Terry', 'Streamlined Jogger Fit', 'Model is 5\'11" wearing size M', 'Plush hand-feel with athletic drape. The perfect blend of rest-day relaxation and intense leg-day readiness.', 'Machine wash cold. Hang dry.', 9);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (15, 'Deep Cut Athletic Stringer Tank', 'deep-cut-athletic-stringer-tank', '', '999.00', '1499.00', 160, 'GDL-TNK-001', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'tanks', 'Tanks & Stringers', 'Men', '33% Off', 1, '4.75', 80, 'S,M,L,XL', '[object Object],[object Object],[object Object]', 'Racerback slim shoulder straps,Drop hem for coverage during overhead presses,Anti-roll hemline stitching', '190 GSM Cotton-Modal Stretch', 'Deep Cut Racerback Fit', 'Model is 6\'0" wearing size L', 'Cut deep at the lats and chest to accentuate back width and upper chest shelf without sliding off shoulders.', 'Machine wash warm. Tumble dry normal.', 8);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (16, 'Curved Drop Cut Athletic Performance Tee', 'curved-drop-cut-athletic-performance-tee', '', '1199.00', '1699.00', 130, 'GDL-DRP-001', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'drop-cut', 'Drop Cut T-Shirts', 'Men', '29% Off', 1, '4.90', 104, 'S,M,L,XL,XXL', '[object Object],[object Object],[object Object]', 'Curved scallop drop hem,Fitted bicep sleeves,Breathable performance blend', '95% Premium Cotton, 5% Elastane', 'V-Taper Curved Hem Drop Cut', 'Model is 6\'1" wearing size L', 'Tailored through the arms and chest with an elongated curved scallop hem that emphasizes the coveted V-taper illusion.', 'Machine wash cold. Do not iron directly on graphics.', 7);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (17, 'Acid Wash Charcoal Drop-Shoulder Tee', 'acid-wash-charcoal-drop-shoulder-tee', '', '1499.00', '2199.00', 110, 'GDL-ACD-001', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'acid-wash', 'Acid Wash Collection', 'Men', '31% Off', 1, '4.92', 57, 'S,M,L,XL,XXL', '[object Object],[object Object],[object Object]', 'Unique hand-dyed distressed patterns,Heavy 240 GSM drape,Thick rib crewneck', '240 GSM Heavy Mineral Dye Terry', 'Boxy Heavyweight Drop-Shoulder', 'Model is 6\'0" wearing size XL', 'Each tee undergoes individual mineral acid-washing, creating unique artisanal patina and authentic vintage textures.', 'Machine wash cold separately for first 2 washes. Hang dry.', 21);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (18, 'Athletic Lightweight Trackpants', 'athletic-lightweight-trackpants', '', '1599.00', '2299.00', 90, 'GDL-TRK-001', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'trackpants', 'Athletic Trackpants', 'Men', '30% Off', 1, '4.82', 43, 'M,L,XL', '[object Object],[object Object]', 'Concealed ankle zippers for easy shoe removal,Quick-dry hydro-repellent surface,Reflective stealth brand accents', 'Lightweight Weather-Resistant Poly-Span', 'Athletic Taper with Ankle Zips', 'Model is 6\'1" wearing size L', 'Featherlight trackpants built for warmup cardio, track sprints, and lifestyle recovery.', 'Machine wash cold. Do not tumble dry.', 10);
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `price`, `original_price`, `stock`, `sku`, `status`, `created_at`, `updated_at`, `category_slug`, `category_name`, `gender_target`, `discount_label`, `in_stock`, `rating`, `reviews_count`, `sizes_json`, `colors_json`, `features_json`, `fabric`, `fit`, `model_stats`, `description`, `care_instructions`, `category_id`) VALUES (19, 'Tactical Multi-Pocket Gym Cargo Lowers', 'tactical-multi-pocket-gym-cargo-lowers', '', '1799.00', '2599.00', 80, 'GDL-CRG-001', 'active', '2026-09-30 21:50:30', '2026-09-30 21:50:30', 'cargo-lowers', 'Cargo Gym Lowers', 'Men', '31% Off', 1, '4.90', 51, 'M,L,XL,XXL', '[object Object],[object Object]', 'Heavy-duty tactical cargo side pockets,Reinforced knee articulators for squat depth,Adjustable bungee hem toggles at ankle', '300 GSM Heavyweight Stretch Twill Fleece', 'Relaxed Tapered Tactical Fit', 'Model is 6\'2" wearing size XL', 'Engineered for functional lifters who need rugged endurance with aesthetic tapered leg profile.', 'Machine wash cold. Do not bleach.', 12);

-- ------------------------------------------------
-- Structure for table `orders`
-- ------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'UPI',
  `payment_status` enum('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  `order_status` enum('Processing','In Transit','Delivered','Cancelled') DEFAULT 'Processing',
  `shipping_address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
